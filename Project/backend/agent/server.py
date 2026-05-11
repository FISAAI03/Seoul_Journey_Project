import os
from typing import Optional, Literal

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.engine import URL

import app.extensions as ext

from mcp.server.fastmcp import FastMCP
from mcp.server.fastmcp.prompts import base

from app.config import Config
from app.constants import RAW_TABLES
from app.utils import build_weather_context, build_user_summary
from app.services import (
    search_table_by_keywords,
    search_food_candidates as app_search_food,
    search_public_data_candidates as app_search_public,
)

load_dotenv()

mcp = FastMCP("SeoulTravelPlanner")


# =========================================================
# 1. DB 엔진 연결
# =========================================================

rawdata_db_uri = URL.create(
    drivername="mysql+pymysql",
    username=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD"),
    host=os.getenv("DB_HOST"),
    port=int(os.getenv("DB_PORT", "3306")),
    database=os.getenv("DB_NAME", "rawdata"),
)

ext.rawdata_engine = create_engine(
    Config.RAWDATA_DB_URI,
    pool_pre_ping=True,
    pool_recycle=3600,
)


# =========================================================
# 2. 공통 유틸
# =========================================================

def normalize_language(language: str) -> Literal["ko", "en"]:
    if language not in ["ko", "en"]:
        return "ko"
    return language


def get_response_language(language: str) -> str:
    language = normalize_language(language)
    return "Korean" if language == "ko" else "English"


# =========================================================
# 3. MCP Tools
# =========================================================

@mcp.tool()
def summarize_user_input(
    query_text: str,
    merged_query: str = "",
    selected_tags: Optional[list[str]] = None,
    selected_themes: Optional[list[str]] = None,
    travel_type: str = "혼자 여행",
    duration: str = "1일",
    budget: int = 70000,
    language: Literal["ko", "en"] = "ko",
) -> dict:
    """
    Standardize the user's Seoul travel request into the input format
    required for itinerary generation.
    """
    language = normalize_language(language)

    data = {
        "query_text": query_text,
        "merged_query": merged_query,
        "selected_tags": selected_tags or [],
        "selected_themes": selected_themes or [],
        "travel_type": travel_type,
        "duration": duration,
        "budget": budget,
        "language": language,
    }

    return build_user_summary(data)


@mcp.tool()
def get_weather_context(
    query_text: str,
    merged_query: str = "",
    selected_tags: Optional[list[str]] = None,
    language: Literal["ko", "en"] = "ko",
) -> dict:
    """
    Extract the target Seoul area from the user's request and return
    weather context and travel recommendation mode.
    """
    language = normalize_language(language)

    data = {
        "query_text": query_text,
        "merged_query": merged_query,
        "selected_tags": selected_tags or [],
        "language": language,
    }

    return build_weather_context(data)


@mcp.tool()
def search_table_candidates(
    table_key: Literal["food", "attractions", "culture", "shopping", "lodging"],
    keywords: list[str],
    limit: int = 8,
    only_active: bool = False,
) -> list[dict]:
    """
    Search allowed Seoul rawdata DB tables by keyword.
    """
    table_name = RAW_TABLES[table_key]

    return search_table_by_keywords(
        table_name=table_name,
        keywords=keywords,
        limit=limit,
        only_active=only_active,
    )


@mcp.tool()
def search_food_candidates(
    query_text: str,
    area: str = "서울",
    district: str = "",
    merged_query: str = "",
    selected_tags: Optional[list[str]] = None,
    selected_themes: Optional[list[str]] = None,
    limit: int = 10,
    language: Literal["ko", "en"] = "ko",
) -> list[dict]:
    """
    Search food, meal, cafe, and price candidates from Seoul individual
    service charge data.
    """
    language = normalize_language(language)

    user_input = {
        "query_text": query_text,
        "merged_query": merged_query,
        "selected_tags": selected_tags or [],
        "selected_themes": selected_themes or [],
        "language": language,
    }

    return app_search_food(
        area=area,
        district=district,
        user_input=user_input,
        limit=limit,
    )


@mcp.tool()
def search_public_data_candidates(
    query_text: str,
    merged_query: str = "",
    selected_tags: Optional[list[str]] = None,
    selected_themes: Optional[list[str]] = None,
    travel_type: str = "혼자 여행",
    duration: str = "1일",
    budget: int = 70000,
    language: Literal["ko", "en"] = "ko",
    weather_context: Optional[dict] = None,
) -> dict:
    """
    Search integrated Seoul public-data candidates based on user input
    and weather context.
    """
    language = normalize_language(language)

    user_data = {
        "query_text": query_text,
        "merged_query": merged_query,
        "selected_tags": selected_tags or [],
        "selected_themes": selected_themes or [],
        "travel_type": travel_type,
        "duration": duration,
        "budget": budget,
        "language": language,
    }

    user_input = build_user_summary(user_data)

    if weather_context is None:
        weather_context = build_weather_context(user_data)

    return app_search_public(
        user_input=user_input,
        weather_context=weather_context,
    )


@mcp.tool()
def build_travel_planning_context(
    query_text: str,
    merged_query: str = "",
    selected_tags: Optional[list[str]] = None,
    selected_themes: Optional[list[str]] = None,
    travel_type: str = "혼자 여행",
    duration: str = "1일",
    budget: int = 70000,
    language: Literal["ko", "en"] = "ko",
) -> dict:
    """
    Build all required context for Seoul travel planning:
    standardized user input, weather context, and public-data candidates.
    """
    language = normalize_language(language)

    user_data = {
        "query_text": query_text,
        "merged_query": merged_query,
        "selected_tags": selected_tags or [],
        "selected_themes": selected_themes or [],
        "travel_type": travel_type,
        "duration": duration,
        "budget": budget,
        "language": language,
    }

    user_input = build_user_summary(user_data)
    weather_context = build_weather_context(user_data)
    public_data_candidates = app_search_public(user_input, weather_context)

    return {
        "user_input": user_input,
        "weather_context": weather_context,
        "public_data_candidates": public_data_candidates,
    }


@mcp.tool()
def validate_budget(
    itinerary: list[dict],
    budget: int,
) -> dict:
    """
    Validate whether the generated itinerary stays within the user's budget.
    """
    estimated_total = 0

    for item in itinerary:
        try:
            estimated_total += int(item.get("estimated_cost", 0) or 0)
        except Exception:
            continue

    return {
        "estimated_total": estimated_total,
        "budget": budget,
        "remaining_budget": budget - estimated_total,
        "is_within_budget": estimated_total <= budget,
    }


# =========================================================
# 4. MCP Prompt
# =========================================================

@mcp.prompt()
def travel_planner_prompt(
    message: str,
    language: Literal["ko", "en"] = "ko",
) -> list[base.Message]:
    language = normalize_language(language)
    response_language = get_response_language(language)

    json_format = """{
  "summary": "One-line summary of the full itinerary",
  "travel_style": "Interpretation of the user's travel style",
  "public_data_usage": "One sentence explaining how public data was used",
  "itinerary": [
    {
      "time": "11:00",
      "title": "User-facing display title",
      "place_name": "Map-searchable official place name if available",
      "category": "Tourism/Culture/Shopping/Food/Cafe/Night view/Lodging/etc.",
      "source_table": "Used table name or General recommendation",
      "reason": "Why this place fits the user, weather, budget, and route",
      "estimated_cost": 12000,
      "tips": "Short practical tip"
    }
  ],
  "total_estimated_cost": 0,
  "budget_comment": "Budget explanation",
  "budget_utilization": "How the budget was used or saved",
  "tips": ["Tip 1", "Tip 2"],
  "alternative_plan": [
    {
      "time": "15:00",
      "title": "User-facing display title for alternative plan",
      "place_name": "Map-searchable official place name if available",
      "category": "Indoor alternative/Budget alternative/Shopping alternative/etc.",
      "source_table": "Used table name or General recommendation",
      "reason": "Reason for the alternative",
      "estimated_cost": 10000,
      "tips": "Short practical tip"
    }
  ]
}"""

    if language == "en":
        system_message = (
            "You are an AI planner that designs local Seoul travel itineraries for international visitors. "
            "You must use MCP tools, especially build_travel_planning_context or search_public_data_candidates, "
            "to retrieve Seoul public-data candidates and prioritize them in the itinerary. "
            "Do not fabricate exact place names that are not supported by candidate data. "
            "If candidate data is insufficient, you may supplement with general area-based route names, "
            "but make that clear in the reason. "
            "Respect the user's budget and adjust the indoor/outdoor balance based on weather. "

            "LANGUAGE RULES: "
            "JSON keys must remain exactly in English. "
            "All user-facing JSON string values must be written in natural English. "
            "This includes summary, travel_style, public_data_usage, title, category, reason, tips, "
            "budget_comment, budget_utilization, and alternative_plan values. "
            "If Seoul public-data candidates contain Korean text, rewrite the user-facing display fields in English. "
            "For example, if DB text is '1898 명동성당 방문', use title='Visit 1898 Myeongdong Cathedral'. "
            "If DB text is '캘빈클라인 명동점 쇼핑', use title='Shop at Calvin Klein Myeongdong'. "
            "If DB text is '고딕 양식의 아름다운 성당에서 조용한 아침을 시작하기에 적합합니다', "
            "rewrite it as natural English in reason. "

            "MAP SEARCH RULES: "
            "The place_name field may keep the official Korean place name when it is better for map search. "
            "Addresses and source_table values may remain in Korean or DB-original form. "
            "Do not combine multiple places into one title or place_name. "
            "Avoid names like 'Myeongdong meal + Calvin Klein Myeongdong' or "
            "'명동 거리 식사 + 캘빈클라인 명동점'. "
            "Each itinerary item must represent one map-searchable place or one clear route segment. "

            "OUTPUT RULES: "
            "Return only pure JSON without markdown fences, explanations, or extra text. "
            f"The JSON must follow this format:\n{json_format}"
        )

    else:
        system_message = (
            "너는 서울 로컬 여행 코스를 설계하는 AI 플래너다. "
            "반드시 MCP tool을 사용하여, 특히 build_travel_planning_context 또는 "
            "search_public_data_candidates를 통해 서울 공공데이터 후보를 조회하고 우선 활용해야 한다. "
            "후보 데이터에 없는 정확한 장소명을 완전히 지어내지 마라. "
            "후보 데이터가 부족할 경우에만 일반적인 지역 기반 구간명으로 보완하되, reason에 그 점을 자연스럽게 설명하라. "
            "사용자 예산을 초과하지 않도록 하고, 날씨 정보에 따라 실내/야외 비중을 조정하라. "

            "언어 규칙: "
            "JSON key는 반드시 영어로 유지하라. "
            "summary, travel_style, public_data_usage, title, category, reason, tips, "
            "budget_comment, budget_utilization, alternative_plan 등 사용자에게 보이는 문자열 값은 한국어로 작성하라. "
            "단, 공식 장소명, 주소, source_table 값은 지도 검색 또는 DB 원문 기준으로 한국어/영어가 섞여도 된다. "

            "지도 검색 규칙: "
            "title과 place_name에는 '명동 거리 식사 + 캘빈클라인 명동점'처럼 여러 장소가 합쳐진 이름을 쓰지 마라. "
            "각 itinerary 항목은 지도 검색 가능한 하나의 장소 또는 명확한 하나의 이동/구간 단위여야 한다. "

            "출력 규칙: "
            "마크다운 코드블록, 설명문, 추가 문장 없이 순수 JSON만 반환하라. "
            f"JSON은 반드시 다음 형식을 따라야 한다:\n{json_format}"
        )

    return [
        base.AssistantMessage(system_message),
        base.UserMessage(message),
    ]


if __name__ == "__main__":
    mcp.run(transport="stdio")