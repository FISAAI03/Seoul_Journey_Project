import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext'
import LanguageToggle from '../components/LanguageToggle'

export default function TripDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { language, t } = useLanguage()
  const isKo = language === 'ko'

  const [trip, setTrip] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const txt = useMemo(
    () => ({
      ko: {
        pageSubtitle: '여행 상세 보기',
        backToTrips: '보관함으로',
        backToMain: '메인으로',
        remix: 'AI 코스 재구성',
        loading: '여행 정보를 불러오는 중입니다...',
        loadingDesc: '저장된 코스와 날씨, 공공데이터 후보를 확인하고 있어요.',
        loadFail: '불러오기 실패',
        defaultLoadError: '여행 상세 정보를 불러오지 못했습니다.',
        detailBadge: 'Trip Detail',
        createdAt: '생성일',
        editTitle: '이 코스를 더 마음에 들게 바꿔보세요',
        editDesc:
          '마음에 들지 않는 장소를 빼고, 공공데이터 기반 대체 후보를 넣어 새로운 코스로 재구성할 수 있습니다.',
        remixPage: '재구성 페이지에서 편집하기',
        remixResult: '결과 페이지에서 바로 재구성하기',
        travelType: '여행 유형',
        duration: '일정',
        budget: '예산',
        totalEstimatedCost: '총 예상 비용',
        summary: '요약',
        travelStyle: '여행 스타일',
        itinerary: '추천 일정',
        timeline: '코스 타임라인',
        mapSearchName: '지도 검색명',
        estimatedCost: '예상 비용',
        tip: '팁',
        viewMap: '지도 보기',
        changePlace: '이 장소 바꾸기',
        budgetGuide: '예산 안내',
        travelTips: '여행 팁',
        alternativePlan: '대체 코스',
        weatherReference: '날씨 참고',
        targetArea: '대상 지역',
        rainRisk: '강수 위험',
        recommendMode: '추천 모드',
        noMapKeyword: '지도 검색에 사용할 장소명이 없습니다.',
        won: '원',
      },
      en: {
        pageSubtitle: 'Trip Detail',
        backToTrips: 'My Trips',
        backToMain: 'Main',
        remix: 'AI Remix',
        loading: 'Loading your trip...',
        loadingDesc: 'Checking the saved itinerary, weather, and public-data candidates.',
        loadFail: 'Failed to load',
        defaultLoadError: 'Failed to load trip details.',
        detailBadge: 'Trip Detail',
        createdAt: 'Created at',
        editTitle: 'Make this itinerary fit you better',
        editDesc:
          'Remove places you do not like and add public-data-based alternatives to remix your Seoul itinerary.',
        remixPage: 'Edit on remix page',
        remixResult: 'Remix directly on result page',
        travelType: 'Travel type',
        duration: 'Duration',
        budget: 'Budget',
        totalEstimatedCost: 'Total estimated cost',
        summary: 'Summary',
        travelStyle: 'Travel style',
        itinerary: 'Itinerary',
        timeline: 'Course timeline',
        mapSearchName: 'Map search name',
        estimatedCost: 'Estimated cost',
        tip: 'Tip',
        viewMap: 'View map',
        changePlace: 'Change this place',
        budgetGuide: 'Budget guide',
        travelTips: 'Travel tips',
        alternativePlan: 'Alternative plan',
        weatherReference: 'Weather reference',
        targetArea: 'Target area',
        rainRisk: 'Rain risk',
        recommendMode: 'Recommendation mode',
        noMapKeyword: 'There is no place name available for map search.',
        won: 'KRW',
      },
    }),
    [],
  )

  const copy = txt[language] || txt.ko

  const getMapKeyword = (item) => {
    const raw = item?.address || item?.place_name || item?.title || ''

    return String(raw)
      .split('+')[0]
      .split('/')[0]
      .replace('식사', '')
      .replace('쇼핑', '')
      .replace('코스', '')
      .replace('방문', '')
      .trim()
  }

  const openMap = (item) => {
    const keyword = typeof item === 'string' ? item : getMapKeyword(item)

    if (!keyword) {
      alert(copy.noMapKeyword)
      return
    }

    window.open(`https://map.naver.com/p/search/${encodeURIComponent(keyword)}`, '_blank')
  }

  const goResultPage = () => {
    if (!trip) return

    navigate('/recommend-result', {
      state: {
        tripId: Number(id),
        resultData: trip.result,
        requestInfo: {
          query_text: trip.query_text,
          merged_query: trip.merged_query,
          travel_type: trip.travel_type,
          duration: trip.duration,
          budget: trip.budget,
          language,
        },
        weatherData: trip.weather,
        publicDataCandidates: trip.public_data_candidates,
      },
    })
  }

  useEffect(() => {
    const fetchTripDetail = async () => {
      try {
        setLoading(true)
        setError('')

        const apiBase = import.meta.env.VITE_API_BASE_URL || ''
        const res = await fetch(`${apiBase}/api/trip/${id}`)
        const data = await res.json()

        if (!res.ok || !data.success) {
          throw new Error(data.message || copy.defaultLoadError)
        }

        setTrip(data.trip)
      } catch (err) {
        console.error('TripDetailPage error:', err)
        setError(err.message || copy.defaultLoadError)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchTripDetail()
    }
  }, [id, copy.defaultLoadError])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <div>
            <p className="text-xl font-black tracking-tight text-blue-700">
              {t.appName || 'Seoul Like Local'}
            </p>
            <p className="text-xs text-slate-500">{copy.pageSubtitle}</p>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3">
            <LanguageToggle />

            <button
              onClick={() => navigate('/my-trips')}
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              {copy.backToTrips}
            </button>

            <button
              onClick={() => navigate('/')}
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              {copy.backToMain}
            </button>

            <button
              onClick={() => navigate(`/trip/${id}/refine`)}
              className="rounded-full bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
            >
              {copy.remix}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {loading && (
          <div className="rounded-[28px] bg-white p-8 shadow-sm ring-1 ring-slate-200">
            <p className="text-lg font-bold text-slate-900">{copy.loading}</p>
            <p className="mt-2 text-sm text-slate-500">{copy.loadingDesc}</p>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-[28px] border border-red-200 bg-red-50 p-6">
            <p className="text-lg font-bold text-red-700">{copy.loadFail}</p>
            <p className="mt-2 text-red-600">{error}</p>

            <button
              onClick={() => navigate('/my-trips')}
              className="mt-5 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
            >
              {copy.backToTrips}
            </button>
          </div>
        )}

        {!loading && !error && trip && (
          <div className="space-y-6">
            <section className="overflow-hidden rounded-[36px] bg-gradient-to-r from-blue-600 via-indigo-600 to-pink-500 px-6 py-10 text-white shadow-sm sm:px-10">
              <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
                <div>
                  <p className="inline-flex rounded-full bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur">
                    {copy.detailBadge}
                  </p>

                  <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
                    {trip.title || (isKo ? '서울 추천 코스' : 'Recommended Seoul Itinerary')}
                  </h1>

                  <p className="mt-3 text-white/85">
                    {copy.createdAt}: {trip.created_at || '-'}
                  </p>

                  {trip.result?.summary && (
                    <p className="mt-5 max-w-3xl text-base leading-7 text-white/90">
                      {trip.result.summary}
                    </p>
                  )}
                </div>

                <div className="rounded-[28px] bg-white/12 p-5 backdrop-blur">
                  <p className="text-sm font-bold uppercase tracking-[0.2em] text-white/70">
                    {copy.remix}
                  </p>
                  <h2 className="mt-2 text-2xl font-black">{copy.editTitle}</h2>
                  <p className="mt-3 text-sm leading-6 text-white/80">{copy.editDesc}</p>

                  <div className="mt-5 flex flex-col gap-3">
                    <button
                      onClick={() => navigate(`/trip/${id}/refine`)}
                      className="rounded-2xl bg-white px-5 py-3 text-sm font-black text-blue-700 transition hover:scale-[1.02]"
                    >
                      {copy.remixPage}
                    </button>

                    <button
                      onClick={goResultPage}
                      className="rounded-2xl border border-white/25 bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/20"
                    >
                      {copy.remixResult}
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-4">
              <div className="rounded-[24px] bg-white p-5 shadow-sm ring-1 ring-slate-200">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  {copy.travelType}
                </p>
                <p className="mt-3 text-2xl font-black text-slate-900">
                  {trip.travel_type || '-'}
                </p>
              </div>

              <div className="rounded-[24px] bg-white p-5 shadow-sm ring-1 ring-slate-200">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  {copy.duration}
                </p>
                <p className="mt-3 text-2xl font-black text-slate-900">{trip.duration || '-'}</p>
              </div>

              <div className="rounded-[24px] bg-white p-5 shadow-sm ring-1 ring-slate-200">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  {copy.budget}
                </p>
                <p className="mt-3 text-2xl font-black text-slate-900">
                  {Number(trip.budget || 0).toLocaleString()} {copy.won}
                </p>
              </div>

              <div className="rounded-[24px] bg-white p-5 shadow-sm ring-1 ring-slate-200">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  {copy.totalEstimatedCost}
                </p>
                <p className="mt-3 text-2xl font-black text-slate-900">
                  {Number(trip.result?.total_estimated_cost || 0).toLocaleString()} {copy.won}
                </p>
              </div>
            </section>

            {trip.result?.travel_style && (
              <section className="rounded-[28px] bg-white p-8 shadow-sm ring-1 ring-slate-200">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
                  {copy.travelStyle}
                </p>
                <p className="mt-3 leading-7 text-slate-700">{trip.result.travel_style}</p>
              </section>
            )}

            {Array.isArray(trip.result?.itinerary) && trip.result.itinerary.length > 0 && (
              <section className="rounded-[32px] bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
                      {copy.itinerary}
                    </p>
                    <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900">
                      {copy.timeline}
                    </h2>
                  </div>

                  <button
                    onClick={() => navigate(`/trip/${id}/refine`)}
                    className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white transition hover:bg-blue-700"
                  >
                    {copy.remix}
                  </button>
                </div>

                <div className="space-y-5">
                  {trip.result.itinerary.map((item, index) => (
                    <div key={`${item.time}-${index}`} className="relative pl-8">
                      <div className="absolute left-3 top-0 h-full w-px bg-slate-200" />
                      <div className="absolute left-0 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-black text-white">
                        {index + 1}
                      </div>

                      <div className="rounded-[28px] bg-slate-50 p-5 ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-md">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm font-bold text-blue-600">{item.time}</p>
                              <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600 ring-1 ring-slate-200">
                                {item.category || copy.itinerary}
                              </span>
                              {item.change_type && (
                                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                                  {item.change_type}
                                </span>
                              )}
                            </div>

                            <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
                              {item.title || item.place_name || (isKo ? '서울 추천 장소' : 'Recommended place')}
                            </h3>

                            <p className="mt-1 text-xs font-semibold text-slate-500">
                              {copy.mapSearchName}: {item.place_name || item.title || '-'}
                            </p>
                          </div>

                          <div className="rounded-2xl bg-white px-4 py-3 text-right ring-1 ring-slate-200">
                            <p className="text-xs font-semibold text-slate-500">
                              {copy.estimatedCost}
                            </p>
                            <p className="mt-1 text-lg font-black text-slate-900">
                              {Number(item.estimated_cost || 0).toLocaleString()} {copy.won}
                            </p>
                          </div>
                        </div>

                        <p className="mt-4 leading-7 text-slate-700">{item.reason}</p>

                        <div className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm text-slate-600 ring-1 ring-slate-200">
                          {copy.tip}: {item.tips || '-'}
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => openMap(item)}
                            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-700"
                          >
                            {copy.viewMap}
                          </button>

                          <button
                            type="button"
                            onClick={() => navigate(`/trip/${id}/refine`)}
                            className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-100"
                          >
                            {copy.changePlace}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {trip.result?.budget_comment && (
              <section className="rounded-[28px] bg-white p-8 shadow-sm ring-1 ring-slate-200">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
                  {copy.budgetGuide}
                </p>
                <p className="mt-3 leading-7 text-slate-700">{trip.result.budget_comment}</p>

                {trip.result?.budget_utilization && (
                  <p className="mt-4 rounded-2xl bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-700 ring-1 ring-blue-100">
                    {trip.result.budget_utilization}
                  </p>
                )}

                <p className="mt-4 text-lg font-black text-slate-900">
                  {copy.totalEstimatedCost}: {Number(trip.result.total_estimated_cost || 0).toLocaleString()} {copy.won}
                </p>
              </section>
            )}

            {Array.isArray(trip.result?.tips) && trip.result.tips.length > 0 && (
              <section className="rounded-[28px] bg-white p-8 shadow-sm ring-1 ring-slate-200">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
                  {copy.travelTips}
                </p>
                <div className="mt-4 space-y-3">
                  {trip.result.tips.map((tip, index) => (
                    <div
                      key={index}
                      className="rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700 ring-1 ring-slate-200"
                    >
                      {tip}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {Array.isArray(trip.result?.alternative_plan) &&
              trip.result.alternative_plan.length > 0 && (
                <section className="rounded-[28px] bg-white p-8 shadow-sm ring-1 ring-slate-200">
                  <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
                    {copy.alternativePlan}
                  </p>

                  <div className="mt-6 space-y-4">
                    {trip.result.alternative_plan.map((item, index) => (
                      <div key={index} className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-bold text-blue-600">{item.time}</p>
                            <h3 className="mt-1 text-xl font-black text-slate-900">
                              {item.title || item.place_name || copy.alternativePlan}
                            </h3>
                          </div>
                          <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-bold text-slate-700">
                            {item.category}
                          </span>
                        </div>

                        <p className="mt-3 text-slate-700">{item.reason}</p>
                        <p className="mt-3 text-sm font-semibold text-slate-900">
                          {copy.estimatedCost}: {Number(item.estimated_cost || 0).toLocaleString()} {copy.won}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          {copy.tip}: {item.tips || '-'}
                        </p>

                        <div className="mt-4">
                          <button
                            type="button"
                            onClick={() => openMap(item)}
                            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-700"
                          >
                            {copy.viewMap}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

            {trip.weather && (
              <section className="rounded-[28px] bg-white p-8 shadow-sm ring-1 ring-slate-200">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
                  {copy.weatherReference}
                </p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                    <p className="text-xs font-semibold text-slate-500">{copy.targetArea}</p>
                    <p className="mt-2 font-bold text-slate-900">
                      {trip.weather.target_area || '-'}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                    <p className="text-xs font-semibold text-slate-500">{copy.rainRisk}</p>
                    <p className="mt-2 font-bold text-slate-900">
                      {trip.weather.weather_summary?.rain_risk || '-'}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                    <p className="text-xs font-semibold text-slate-500">{copy.recommendMode}</p>
                    <p className="mt-2 font-bold text-slate-900">
                      {trip.weather.weather_summary?.recommendation_mode || '-'}
                    </p>
                  </div>
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  )
}