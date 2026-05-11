import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext'
import LanguageToggle from '../components/LanguageToggle'

export default function ResultPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { language, t } = useLanguage()
  const isKo = language === 'ko'

  const [resultData, setResultData] = useState(location.state?.resultData || null)
  const [requestInfo, setRequestInfo] = useState(location.state?.requestInfo || null)
  const [weatherData, setWeatherData] = useState(location.state?.weatherData || null)
  const [publicDataCandidates, setPublicDataCandidates] = useState(
    location.state?.publicDataCandidates || null,
  )
  const [tripId, setTripId] = useState(location.state?.tripId || null)

  const copy = useMemo(
    () => ({
      ko: {
        appSubtitle: 'AI 기반 서울 맞춤 로컬 관광 추천',
        main: '메인으로',
        myTrips: '보관함',
        resultBadge: 'AI 추천 결과',
        noResultBadge: '추천 결과',
        noResultTitle: '표시할 추천 결과가 없습니다.',
        noResultDesc: '메인 페이지에서 취향을 입력하고 추천을 생성한 뒤 다시 들어와 주세요.',
        backMain: '메인으로 돌아가기',

        inputTaste: '입력한 취향',
        totalCost: '예상 총비용',
        totalCostDesc:
          'AI가 입력한 일정, 예산, 날씨를 바탕으로 전체 동선을 최적화한 예상 비용입니다.',

        travelType: '여행 유형',
        duration: '일정',
        budget: '예산',
        recommendMode: '추천 모드',
        normalRecommend: '일반 추천',

        weatherInfo: '날씨 반영 정보',
        weatherTitle: '오늘 서울 상황을 반영한 코스예요',
        weatherDescPrefix: '기준 날씨를 분석해 추천을 조정했습니다.',
        currentTemp: '현재 기온',
        apparentTemp: '체감 기온',
        maxRain: '최대 강수확률',
        highLow: '최고 / 최저',
        rainRisk: '비 가능성',
        weatherNote1: '오늘 추천은',
        weatherNote2: '기준으로 구성되어, 날씨에 따라 야외 비중을 줄이거나 실내 동선을 강화했습니다.',

        itinerary: '추천 일정',
        timeline: '오늘의 코스 타임라인',
        totalCourseCount: '총 코스 수',
        countUnit: '개',
        estimatedCost: '예상 비용',
        tip: '팁',
        won: '원',

        budgetAnalysis: 'AI 예산 해석',
        travelTips: '여행 팁',
        alternativePlan: '대체 코스',

        retryBadge: '다시 추천받기',
        retryTitle: '다른 분위기의 서울도 볼까요?',
        retryDesc:
          '취향 입력을 바꿔 다시 추천을 생성하면 전혀 다른 무드의 서울 코스를 받을 수 있어요.',
        retryButton: '다시 추천받기',

        remixBadge: '코스가 아쉽다면',
        remixTitle: '바로 장소를 바꿔볼 수 있어요',
        remixDesc:
          '마음에 들지 않는 일정을 빼고, 공공데이터 기반 대체 후보를 넣어 새로운 코스로 재구성해보세요.',
        remixButton: '코스 재구성하기',
      },
      en: {
        appSubtitle: 'AI-powered local Seoul travel planner',
        main: 'Main',
        myTrips: 'My Trips',
        resultBadge: 'AI Recommendation Result',
        noResultBadge: 'Recommendation Result',
        noResultTitle: 'No recommendation result to display.',
        noResultDesc: 'Please enter your preferences on the main page and generate an itinerary first.',
        backMain: 'Back to main',

        inputTaste: 'Preference input',
        totalCost: 'Estimated total cost',
        totalCostDesc:
          'This is the estimated cost optimized by AI based on your schedule, budget, and weather context.',

        travelType: 'Travel type',
        duration: 'Duration',
        budget: 'Budget',
        recommendMode: 'Recommendation mode',
        normalRecommend: 'General recommendation',

        weatherInfo: 'Weather-based insights',
        weatherTitle: 'This itinerary reflects today’s Seoul conditions',
        weatherDescPrefix: 'weather was analyzed and reflected in the recommendation.',
        currentTemp: 'Current temperature',
        apparentTemp: 'Feels like',
        maxRain: 'Max precipitation chance',
        highLow: 'High / Low',
        rainRisk: 'Rain risk',
        weatherNote1: 'This itinerary was created in',
        weatherNote2: 'mode, adjusting indoor and outdoor balance based on weather.',

        itinerary: 'Itinerary',
        timeline: 'Today’s course timeline',
        totalCourseCount: 'Total stops',
        countUnit: '',
        estimatedCost: 'Estimated cost',
        tip: 'Tip',
        won: 'KRW',

        budgetAnalysis: 'AI budget analysis',
        travelTips: 'Travel tips',
        alternativePlan: 'Alternative plan',

        retryBadge: 'Get another recommendation',
        retryTitle: 'Want to explore another side of Seoul?',
        retryDesc:
          'Change your preferences and generate a completely different Seoul itinerary.',
        retryButton: 'Get another recommendation',

        remixBadge: 'Want to adjust this itinerary?',
        remixTitle: 'You can remix places right away',
        remixDesc:
          'Remove places you do not like and add public-data-based alternatives to create a new itinerary.',
        remixButton: 'Remix itinerary',
      },
    }),
    [],
  )

  const txt = copy[language] || copy.ko

  useEffect(() => {
    if (location.state?.resultData) {
      localStorage.setItem('latest_recommend_result', JSON.stringify(location.state.resultData))
    }
    if (location.state?.requestInfo) {
      localStorage.setItem('latest_recommend_request', JSON.stringify(location.state.requestInfo))
    }
    if (location.state?.weatherData) {
      localStorage.setItem('latest_recommend_weather', JSON.stringify(location.state.weatherData))
    }
    if (location.state?.publicDataCandidates) {
      localStorage.setItem(
        'latest_public_data_candidates',
        JSON.stringify(location.state.publicDataCandidates),
      )
    }
    if (location.state?.tripId) {
      localStorage.setItem('latest_trip_id', String(location.state.tripId))
    }

    if (!location.state?.resultData) {
      const savedResult = localStorage.getItem('latest_recommend_result')
      const savedRequest = localStorage.getItem('latest_recommend_request')
      const savedWeather = localStorage.getItem('latest_recommend_weather')
      const savedCandidates = localStorage.getItem('latest_public_data_candidates')
      const savedTripId = localStorage.getItem('latest_trip_id')

      if (savedResult) {
        try {
          setResultData(JSON.parse(savedResult))
        } catch (error) {
          localStorage.removeItem('latest_recommend_result')
        }
      }

      if (savedRequest) {
        try {
          setRequestInfo(JSON.parse(savedRequest))
        } catch (error) {
          localStorage.removeItem('latest_recommend_request')
        }
      }

      if (savedWeather) {
        try {
          setWeatherData(JSON.parse(savedWeather))
        } catch (error) {
          localStorage.removeItem('latest_recommend_weather')
        }
      }

      if (savedCandidates) {
        try {
          setPublicDataCandidates(JSON.parse(savedCandidates))
        } catch (error) {
          localStorage.removeItem('latest_public_data_candidates')
        }
      }

      if (savedTripId) {
        setTripId(Number(savedTripId))
      }
    }
  }, [location.state])

  const totalCostText = useMemo(() => {
    return Number(resultData?.total_estimated_cost || 0).toLocaleString()
  }, [resultData])

  const weatherSummary = weatherData?.weather_summary || null
  const weatherLocation = weatherData?.resolved_location || null

  const weatherModeLabel = useMemo(() => {
    if (!weatherSummary?.recommendation_mode) return txt.normalRecommend
    return weatherSummary.recommendation_mode
  }, [weatherSummary, txt.normalRecommend])

  const topInsightCards = useMemo(() => {
    return [
      {
        label: txt.travelType,
        value: requestInfo?.travel_type || '-',
      },
      {
        label: txt.duration,
        value: requestInfo?.duration || '-',
      },
      {
        label: txt.budget,
        value: requestInfo?.budget
          ? `${Number(requestInfo.budget).toLocaleString()} ${txt.won}`
          : '-',
      },
      {
        label: txt.recommendMode,
        value: weatherModeLabel,
      },
    ]
  }, [requestInfo, weatherModeLabel, txt])

  const goRemix = () => {
    if (tripId) {
      navigate(`/trip/${tripId}/refine`)
      return
    }

    navigate('/my-trips')
  }

  if (!resultData) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-12 text-slate-900 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-[32px] bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
              {txt.noResultBadge}
            </p>
            <LanguageToggle />
          </div>

          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900">
            {txt.noResultTitle}
          </h1>
          <p className="mt-4 text-slate-600">{txt.noResultDesc}</p>

          <div className="mt-8">
            <button
              onClick={() => navigate('/')}
              className="rounded-2xl bg-blue-600 px-6 py-4 font-bold text-white transition hover:bg-blue-700"
            >
              {txt.backMain}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <div>
            <p className="text-xl font-black tracking-tight text-blue-700">
              {t.appName || 'Seoul Like Local'}
            </p>
            <p className="text-xs text-slate-500">
              {t.appSubtitle || txt.appSubtitle}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <LanguageToggle />

            <button
              onClick={() => navigate('/my-trips')}
              className="hidden rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 sm:block"
            >
              {txt.myTrips}
            </button>

            <button
              onClick={() => navigate('/')}
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              {txt.main}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <section className="relative overflow-hidden rounded-[36px] bg-gradient-to-r from-blue-600 via-indigo-600 to-pink-500 px-6 py-10 text-white sm:px-10 lg:px-14 lg:py-14">
          <div className="absolute -left-10 top-0 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-40 w-40 rounded-full bg-white/10 blur-3xl" />

          <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className="inline-flex rounded-full bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur">
                {txt.resultBadge}
              </p>

              <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                {resultData.summary}
              </h1>

              <p className="mt-4 max-w-3xl text-base leading-7 text-white/85 sm:text-lg">
                {resultData.travel_style}
              </p>

              {requestInfo && (
                <div className="mt-6 rounded-[24px] bg-white/10 p-5 backdrop-blur">
                  <p className="text-sm font-bold uppercase tracking-[0.2em] text-white/80">
                    {txt.inputTaste}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-white/90 sm:text-base">
                    {requestInfo.merged_query || requestInfo.query_text || '-'}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-end">
              <div className="w-full rounded-[28px] bg-white/12 p-6 backdrop-blur">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-white/80">
                  {txt.totalCost}
                </p>
                <p className="mt-3 text-4xl font-black sm:text-5xl">
                  {totalCostText} {txt.won}
                </p>
                <p className="mt-3 text-sm leading-6 text-white/80">
                  {txt.totalCostDesc}
                </p>

                <button
                  onClick={goRemix}
                  className="mt-6 w-full rounded-2xl bg-white px-5 py-4 text-base font-black text-blue-700 transition hover:scale-[1.02]"
                >
                  {txt.remixButton}
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {topInsightCards.map((card, idx) => (
              <div
                key={idx}
                className="rounded-[24px] bg-white p-5 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-lg"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {card.label}
                </p>
                <p className="mt-3 text-2xl font-black tracking-tight text-slate-900">
                  {card.value}
                </p>
              </div>
            ))}
          </div>
        </section>

        {weatherSummary && (
          <section className="mt-8">
            <div className="rounded-[32px] bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
                    {txt.weatherInfo}
                  </p>
                  <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900">
                    {txt.weatherTitle}
                  </h2>
                  <p className="mt-3 text-slate-600">
                    {weatherData?.target_area || (isKo ? '서울' : 'Seoul')} {txt.weatherDescPrefix}
                    {weatherLocation?.name ? ` (${weatherLocation.name})` : ''}
                  </p>
                </div>

                <div className="rounded-2xl bg-blue-50 px-4 py-3 ring-1 ring-blue-100">
                  <p className="text-xs font-semibold text-blue-600">{txt.recommendMode}</p>
                  <p className="mt-1 text-xl font-black text-blue-700">{weatherModeLabel}</p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <p className="text-xs font-semibold text-slate-500">{txt.currentTemp}</p>
                  <p className="mt-2 text-2xl font-black text-slate-900">
                    {weatherSummary.current_temperature ?? '-'}°
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <p className="text-xs font-semibold text-slate-500">{txt.apparentTemp}</p>
                  <p className="mt-2 text-2xl font-black text-slate-900">
                    {weatherSummary.apparent_temperature ?? '-'}°
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <p className="text-xs font-semibold text-slate-500">{txt.maxRain}</p>
                  <p className="mt-2 text-2xl font-black text-slate-900">
                    {weatherSummary.max_precipitation_probability ?? '-'}%
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <p className="text-xs font-semibold text-slate-500">{txt.highLow}</p>
                  <p className="mt-2 text-2xl font-black text-slate-900">
                    {weatherSummary.max_temp_today ?? '-'}° / {weatherSummary.min_temp_today ?? '-'}°
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <p className="text-xs font-semibold text-slate-500">{txt.rainRisk}</p>
                  <p className="mt-2 text-2xl font-black text-slate-900">
                    {weatherSummary.rain_risk || '-'}
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4">
                <p className="text-sm leading-7 text-slate-700">
                  {txt.weatherNote1}{' '}
                  <span className="font-bold text-slate-900">{weatherModeLabel}</span>{' '}
                  {txt.weatherNote2}
                </p>
              </div>
            </div>
          </section>
        )}

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <div className="rounded-[32px] bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
                    {txt.itinerary}
                  </p>
                  <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900">
                    {txt.timeline}
                  </h2>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200">
                  <p className="text-xs font-semibold text-slate-500">{txt.totalCourseCount}</p>
                  <p className="mt-1 text-xl font-black text-slate-900">
                    {resultData.itinerary?.length || 0}
                    {txt.countUnit}
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                {resultData.itinerary?.map((item, idx) => (
                  <div key={`${item.time}-${idx}`} className="relative pl-8">
                    <div className="absolute left-3 top-0 h-full w-px bg-slate-200" />
                    <div className="absolute left-0 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-black text-white">
                      {idx + 1}
                    </div>

                    <div className="rounded-[28px] bg-slate-50 p-5 ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-md">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-sm font-bold text-blue-600">{item.time}</p>
                          <h3 className="mt-1 text-2xl font-black tracking-tight text-slate-900">
                            {item.title}
                          </h3>
                          <div className="mt-2 inline-flex rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600 ring-1 ring-slate-200">
                            {item.category}
                          </div>
                        </div>

                        <div className="rounded-2xl bg-white px-4 py-3 text-right ring-1 ring-slate-200">
                          <p className="text-xs font-semibold text-slate-500">{txt.estimatedCost}</p>
                          <p className="mt-1 text-lg font-black text-slate-900">
                            {Number(item.estimated_cost || 0).toLocaleString()} {txt.won}
                          </p>
                        </div>
                      </div>

                      <p className="mt-4 leading-7 text-slate-700">{item.reason}</p>

                      <div className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm text-slate-600 ring-1 ring-slate-200">
                        {txt.tip}: {item.tips}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
                {txt.budgetAnalysis}
              </p>
              <p className="mt-3 text-base leading-7 text-slate-700">
                {resultData.budget_comment}
              </p>
            </div>

            <div className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
                {txt.travelTips}
              </p>
              <div className="mt-4 space-y-3">
                {resultData.tips?.map((tip, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700 ring-1 ring-slate-200"
                  >
                    {tip}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
                {txt.alternativePlan}
              </p>
              <div className="mt-4 space-y-3">
                {resultData.alternative_plan?.map((item, idx) => (
                  <div key={idx} className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                    <p className="text-sm font-bold text-blue-600">{item.time}</p>
                    <h4 className="mt-1 text-lg font-black text-slate-900">{item.title}</h4>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{item.reason}</p>
                    <p className="mt-3 text-xs text-slate-500">
                      {txt.estimatedCost}: {Number(item.estimated_cost || 0).toLocaleString()} {txt.won}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-white/70">
                {txt.remixBadge}
              </p>
              <h3 className="mt-2 text-2xl font-black">{txt.remixTitle}</h3>
              <p className="mt-3 text-sm leading-6 text-white/85">{txt.remixDesc}</p>
              <button
                onClick={goRemix}
                className="mt-5 rounded-2xl bg-white px-5 py-3 font-bold text-blue-700 transition hover:scale-[1.02]"
              >
                {txt.remixButton}
              </button>
            </div>

            <div className="rounded-[28px] bg-slate-900 p-6 text-white">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-white/60">
                {txt.retryBadge}
              </p>
              <h3 className="mt-2 text-2xl font-black">{txt.retryTitle}</h3>
              <p className="mt-3 text-sm leading-6 text-white/80">{txt.retryDesc}</p>
              <button
                onClick={() => navigate('/')}
                className="mt-5 rounded-2xl bg-white px-5 py-3 font-bold text-slate-900 transition hover:scale-[1.02]"
              >
                {txt.retryButton}
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}