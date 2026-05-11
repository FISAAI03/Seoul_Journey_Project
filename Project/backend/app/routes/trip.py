import asyncio
import json
from datetime import datetime, date
from decimal import Decimal

from flask import Blueprint, request, jsonify

from app.extensions import db
from app.models import Trip
from app.utils import build_user_summary, build_weather_context, clean_json_text
from app.services import search_public_data_candidates
from agent.client import generate_travel_plan

bp = Blueprint("trip", __name__, url_prefix="/api")


# =========================================================
# 공통 유틸
# =========================================================

def safe_json_load(value, default=None):
    if default is None:
        default = {}

    if value is None:
        return default

    if isinstance(value, (dict, list)):
        return value

    if isinstance(value, str):
        try:
            return json.loads(value)
        except Exception:
            return default

    return default


def json_safe_value(value):
    if isinstance(value, datetime):
        return value.strftime("%Y-%m-%d %H:%M:%S")

    if isinstance(value, date):
        return value.strftime("%Y-%m-%d")

    if isinstance(value, Decimal):
        return float(value)

    if isinstance(value, list):
        return [json_safe_value(item) for item in value]

    if isinstance(value, dict):
        return {str(key): json_safe_value(val) for key, val in value.items()}

    return value


def trip_to_dict(t: Trip):
    return {
        "id": t.id,
        "user_id": t.user_id,
        "title": t.title,
        "query_text": t.query_text,
        "merged_query": t.merged_query,
        "travel_type": t.travel_type,
        "duration": t.duration,
        "budget": t.budget,
        "result": json_safe_value(safe_json_load(t.result, {})),
        "weather": json_safe_value(safe_json_load(t.weather, {})),
        "public_data_candidates": json_safe_value(
            safe_json_load(t.public_data_candidates, {})
        ),
        "created_at": json_safe_value(t.created_at),
    }


def pick_first_text(row):
    if not isinstance(row, dict):
        return ""

    preferred_keys = [
        "name",
        "title",
        "TITLE",
        "상호명",
        "사업장명",
        "업소명",
        "시설명",
        "콘텐츠명",
        "관광지명",
        "문화시설명",
        "쇼핑명",
        "BIZPLC_NM",
        "NM",
        "SVC_NM",
        "POST_SJ",
        "MAIN_TITLE",
        "FAC_NAME",
    ]

    for key in preferred_keys:
        if key in row and row.get(key):
            return str(row.get(key)).strip()

    for value in row.values():
        if isinstance(value, str) and value.strip():
            return value.strip()[:80]

    return "서울 추천 후보"


def pick_address(row):
    if not isinstance(row, dict):
        return ""

    preferred_keys = [
        "address",
        "ADDRESS",
        "주소",
        "소재지주소",
        "도로명주소",
        "지번주소",
        "ADDR",
        "RDNMADR",
        "SITEWHLADDR",
        "ADDR1",
        "ADDR2",
        "NEW_ADDRESS",
        "OLD_ADDRESS",
    ]

    for key in preferred_keys:
        if key in row and row.get(key):
            return str(row.get(key)).strip()

    return ""


def build_candidate_items(public_data_candidates):
    candidates = safe_json_load(public_data_candidates, {})
    items = []

    group_map = {
        "attractions": "관광",
        "culture": "문화/체험",
        "shopping": "쇼핑",
        "food": "식사/가격",
        "lodging": "숙박",
    }

    source_table_map = {
        "attractions": "SEOUL_TOUR_ATTRACTIONS",
        "culture": "SEOUL_TOUR_CULTURE",
        "shopping": "SEOUL_TOUR_SHOPPING",
        "food": "INDIVIDUAL_SERVICE_CHARGE",
        "lodging": "SEOUL_TOUR_LODGING_LICENSE",
    }

    for group_key, group_label in group_map.items():
        rows = candidates.get(group_key) or []

        if not isinstance(rows, list):
            continue

        for idx, row in enumerate(rows):
            if not isinstance(row, dict):
                continue

            display_name = pick_first_text(row)
            address = pick_address(row)

            items.append(
                {
                    "candidate_id": f"{group_key}-{idx}",
                    "source_group": group_key,
                    "source_label": group_label,
                    "source_table": source_table_map.get(group_key, group_key),
                    "display_name": display_name,
                    "place_name": display_name,
                    "address": address,
                    "raw": json_safe_value(row),
                }
            )

    return items


def get_quick_actions():
    return [
        {
            "key": "less_walking",
            "label": "이동 적게",
            "prompt": "동선 이동거리를 줄이고 한 지역 안에서 자연스럽게 이어지는 코스로 재구성해줘.",
        },
        {
            "key": "more_indoor",
            "label": "실내 위주",
            "prompt": "날씨 영향을 덜 받도록 실내 전시, 쇼핑, 카페 중심으로 재구성해줘.",
        },
        {
            "key": "more_local",
            "label": "로컬 감성",
            "prompt": "유명 관광지보다 현지인이 갈 법한 로컬 분위기의 장소를 더 반영해줘.",
        },
        {
            "key": "more_photo",
            "label": "사진 명소",
            "prompt": "사진 찍기 좋은 장소와 감성적인 동선을 더 반영해줘.",
        },
        {
            "key": "budget_friendly",
            "label": "예산 절약",
            "prompt": "전체 비용을 낮추고 가성비 좋은 식사와 무료/저가 장소를 우선 반영해줘.",
        },
        {
            "key": "date_mood",
            "label": "데이트 분위기",
            "prompt": "커플 여행에 어울리도록 분위기 좋은 카페, 산책, 야경 요소를 반영해줘.",
        },
    ]


# =========================================================
# 여행 저장 / 조회
# =========================================================

@bp.route("/trips", methods=["POST", "OPTIONS"])
def save_trip():
    if request.method == "OPTIONS":
        return jsonify({"success": True}), 200

    try:
        data = request.get_json() or {}

        new_trip = Trip(
            user_id=data.get("user_id"),
            title=data.get("title"),
            query_text=data.get("query_text"),
            merged_query=data.get("merged_query"),
            travel_type=data.get("travel_type"),
            duration=data.get("duration"),
            budget=data.get("budget"),
            result=data.get("result"),
            weather=data.get("weather"),
            public_data_candidates=data.get("public_data_candidates"),
        )

        db.session.add(new_trip)
        db.session.commit()

        return jsonify({"success": True, "trip_id": new_trip.id}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({
            "success": False,
            "message": "여행 저장 중 오류가 발생했습니다.",
            "error": str(e),
        }), 500


@bp.route("/trips/<int:user_id>", methods=["GET"])
def get_trips(user_id):
    try:
        trips = (
            Trip.query
            .filter_by(user_id=user_id)
            .order_by(Trip.created_at.desc())
            .all()
        )

        result = []

        for t in trips:
            result.append({
                "id": t.id,
                "title": t.title,
                "query_text": t.query_text,
                "merged_query": t.merged_query,
                "travel_type": t.travel_type,
                "duration": t.duration,
                "budget": t.budget,
                "created_at": t.created_at.strftime("%Y-%m-%d %H:%M") if t.created_at else "-",
            })

        return jsonify({"success": True, "trips": result}), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "message": "보관함 조회 중 오류가 발생했습니다.",
            "error": str(e),
        }), 500


@bp.route("/trip/<int:trip_id>", methods=["GET"])
def get_trip_detail(trip_id):
    try:
        t = Trip.query.get(trip_id)

        if not t:
            return jsonify({
                "success": False,
                "message": "여행 정보를 찾을 수 없습니다.",
            }), 404

        return jsonify({
            "success": True,
            "trip": trip_to_dict(t),
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "message": "상세 조회 중 오류가 발생했습니다.",
            "error": str(e),
        }), 500


# =========================================================
# 추천 생성
# =========================================================

@bp.route("/recommend", methods=["POST"])
def recommend():
    try:
        data = request.get_json() or {}

        query_text = (data.get("query_text") or "").strip()
        selected_tags = data.get("selected_tags") or []
        selected_themes = data.get("selected_themes") or []

        if not query_text and not selected_tags and not selected_themes:
            return jsonify({
                "success": False,
                "message": "취향 입력 또는 태그/테마 중 하나 이상은 필요합니다.",
            }), 400

        user_input = build_user_summary(data)
        weather_context = build_weather_context(data)
        public_data_candidates = search_public_data_candidates(user_input, weather_context)

        raw_text = asyncio.run(generate_travel_plan(data))
        cleaned_text = clean_json_text(raw_text)

        try:
            result = json.loads(cleaned_text)
        except json.JSONDecodeError:
            return jsonify({
                "success": False,
                "message": "모델 응답을 JSON으로 해석하지 못했습니다.",
                "raw_response": raw_text,
            }), 500

        return jsonify({
            "success": True,
            "message": "추천 생성 완료",
            "input": user_input,
            "weather": weather_context,
            "public_data_candidates": json_safe_value(public_data_candidates),
            "result": json_safe_value(result),
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "message": "추천 생성 중 오류가 발생했습니다.",
            "error": str(e),
        }), 500


# =========================================================
# 코스 재구성 옵션 조회
# GET /api/trip/<trip_id>/refine-options
# =========================================================

@bp.route("/trip/<int:trip_id>/refine-options", methods=["GET", "OPTIONS"])
def get_refine_options(trip_id):
    if request.method == "OPTIONS":
        return jsonify({"success": True}), 200

    try:
        t = Trip.query.get(trip_id)

        if not t:
            return jsonify({
                "success": False,
                "message": "여행 정보를 찾을 수 없습니다.",
            }), 404

        result = safe_json_load(t.result, {})
        weather = safe_json_load(t.weather, {})
        public_data_candidates = safe_json_load(t.public_data_candidates, {})

        return jsonify({
            "success": True,
            "trip": trip_to_dict(t),
            "itinerary": json_safe_value(result.get("itinerary", [])),
            "alternative_plan": json_safe_value(result.get("alternative_plan", [])),
            "candidate_items": build_candidate_items(public_data_candidates),
            "quick_actions": get_quick_actions(),
            "weather": json_safe_value(weather),
            "public_data_candidates": json_safe_value(public_data_candidates),
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "message": "재구성 정보 조회 중 오류가 발생했습니다.",
            "error": str(e),
        }), 500


# =========================================================
# 코스 재구성 실행
# POST /api/trip/refine
# =========================================================

@bp.route("/trip/refine", methods=["POST", "OPTIONS"])
def refine_trip():
    if request.method == "OPTIONS":
        return jsonify({"success": True}), 200

    try:
        data = request.get_json() or {}

        trip_id = data.get("trip_id")
        user_id = data.get("user_id")
        remove_indices = data.get("remove_indices") or []
        add_candidate_items = data.get("add_candidate_items") or []
        selected_quick_actions = data.get("selected_quick_actions") or []
        refine_request = (data.get("refine_request") or "").strip()
        target_budget = int(data.get("target_budget") or 70000)
        mood = (data.get("mood") or "").strip()
        save_to_library = data.get("save_to_library", True)

        if not trip_id or not user_id:
            return jsonify({
                "success": False,
                "message": "trip_id와 user_id가 필요합니다.",
            }), 400

        t = Trip.query.get(int(trip_id))

        if not t:
            return jsonify({
                "success": False,
                "message": "여행 정보를 찾을 수 없습니다.",
            }), 404

        original_result = safe_json_load(t.result, {})
        weather = safe_json_load(t.weather, {})
        public_data_candidates = safe_json_load(t.public_data_candidates, {})

        original_itinerary = original_result.get("itinerary") or []
        if not isinstance(original_itinerary, list):
            original_itinerary = []

        remove_index_set = set()
        for value in remove_indices:
            try:
                remove_index_set.add(int(value))
            except Exception:
                pass

        refined_itinerary = [
            item
            for idx, item in enumerate(original_itinerary)
            if idx not in remove_index_set
        ]

        for idx, candidate in enumerate(add_candidate_items):
            if not isinstance(candidate, dict):
                continue

            place_name = (
                candidate.get("place_name")
                or candidate.get("display_name")
                or candidate.get("title")
                or "서울 추천 후보"
            )

            source_label = (
                candidate.get("source_label")
                or candidate.get("source_group")
                or "대체 후보"
            )

            refined_itinerary.append({
                "time": f"추가 {idx + 1}",
                "title": place_name,
                "place_name": place_name,
                "category": source_label,
                "estimated_cost": 0,
                "reason": "사용자가 선택한 공공데이터 기반 대체 후보로 추가되었습니다.",
                "tips": candidate.get("address") or "지도 검색을 통해 위치를 확인해보세요.",
                "change_type": "추가",
            })

        total_estimated_cost = 0

        for item in refined_itinerary:
            if not isinstance(item, dict):
                continue

            try:
                total_estimated_cost += int(item.get("estimated_cost") or 0)
            except Exception:
                pass

        quick_action_labels = [
            action.get("label")
            for action in selected_quick_actions
            if isinstance(action, dict) and action.get("label")
        ]

        refined_result = dict(original_result)
        refined_result["summary"] = f"{t.title or '서울 추천 코스'} - 재구성 코스"
        refined_result["itinerary"] = refined_itinerary
        refined_result["total_estimated_cost"] = total_estimated_cost
        refined_result["budget_comment"] = (
            f"목표 예산 {target_budget:,}원 기준으로 재구성했습니다. "
            f"선택한 제외 일정 {len(remove_index_set)}개와 추가 후보 {len(add_candidate_items)}개를 반영했습니다."
        )

        refine_notes = []

        if quick_action_labels:
            refine_notes.append("선택 옵션: " + ", ".join(quick_action_labels))

        if mood:
            refine_notes.append("원하는 분위기: " + mood)

        if refine_request:
            refine_notes.append("추가 요청: " + refine_request)

        base_tips = refined_result.get("tips")
        if not isinstance(base_tips, list):
            base_tips = []

        refined_result["tips"] = base_tips + refine_notes

        if not refined_result.get("travel_style"):
            refined_result["travel_style"] = "사용자 선택을 반영한 서울 맞춤 재구성 코스입니다."

        new_trip_id = t.id

        if save_to_library:
            new_trip = Trip(
                user_id=int(user_id),
                title=refined_result.get("summary") or "재구성된 서울 여행 코스",
                query_text=t.query_text,
                merged_query=t.merged_query,
                travel_type=t.travel_type,
                duration=t.duration,
                budget=target_budget,
                result=json_safe_value(refined_result),
                weather=json_safe_value(weather),
                public_data_candidates=json_safe_value(public_data_candidates),
            )

            db.session.add(new_trip)
            db.session.commit()

            new_trip_id = new_trip.id

        return jsonify({
            "success": True,
            "message": "코스 재구성 완료",
            "new_trip_id": new_trip_id,
            "refined_result": json_safe_value(refined_result),
            "weather": json_safe_value(weather),
            "public_data_candidates": json_safe_value(public_data_candidates),
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({
            "success": False,
            "message": "코스 재구성 중 오류가 발생했습니다.",
            "error": str(e),
        }), 500