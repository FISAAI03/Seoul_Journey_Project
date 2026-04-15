import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

export default function ResultPage() {
  const navigate = useNavigate()
  const location = useLocation()

  const [resultData, setResultData] = useState(location.state?.resultData || null)
  const [requestInfo, setRequestInfo] = useState(location.state?.requestInfo || null)
  const [weatherData, setWeatherData] = useState(location.state?.weatherData || null)

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

    if (!location.state?.resultData) {
      const savedResult = localStorage.getItem('latest_recommend_result')
      const savedRequest = localStorage.getItem('latest_recommend_request')
      const savedWeather = localStorage.getItem('latest_recommend_weather')

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
    }
  }, [location.state])

  const totalCostText = useMemo(() => {
    return Number(resultData?.total_estimated_cost || 0).toLocaleString()
  }, [resultData])

  const weatherSummary = weatherData?.weather_summary || null
  const weatherLocation = weatherData?.resolved_location || null

  const weatherModeLabel = useMemo(() => {
    if (!weatherSummary?.recommendation_mode) return '일반 추천'
    return weatherSummary.recommendation_mode
  }, [weatherSummary])

  const topInsightCards = useMemo(() => {
    return [
      {
        label: '여행 유형',
        value: requestInfo?.travel_type || '-',
      },
      {
        label: '일정',
        value: requestInfo?.duration || '-',
      },
      {
        label: '예산',
        value: requestInfo?.budget ? `${Number(requestInfo.budget).toLocaleString()}원` : '-',
      },
      {
        label: '추천 모드',
        value: weatherModeLabel,
      },
    ]
  }, [requestInfo, weatherModeLabel])

  if (!resultData) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-12 text-slate-900 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-[32px] bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">추천 결과</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900">
            표시할 추천 결과가 없습니다.
          </h1>
          <p className="mt-4 text-slate-600">
            메인 페이지에서 취향을 입력하고 추천을 생성한 뒤 다시 들어와 주세요.
          </p>

          <div className="mt-8">
            <button
              onClick={() => navigate('/')}
              className="rounded-2xl bg-blue-600 px-6 py-4 font-bold text-white transition hover:bg-blue-700"
            >
              메인으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <div>
            <p className="text-xl font-black tracking-tight text-blue-700">Seoul Like Local</p>
            <p className="text-xs text-slate-500">AI 기반 서울 맞춤 로컬 관광 추천</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              메인으로
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <section className="relative overflow-hidden rounded-[36px] bg-gradient-to-r from-blue-600 via-indigo-600 to-pink-500 px-6 py-10 text-white sm:px-10 lg:px-14 lg:py-14">
          <div className="absolute -left-10 top-0 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-40 w-40 rounded-full bg-white/10 blur-3xl" />

          <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className="inline-flex rounded-full bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur">
                AI 추천 결과
              </p>

              <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                {resultData.summary}
              </h1>

              <p className="mt-4 max-w-3xl text-base leading-7 text-white/85 sm:text-lg">
                {resultData.travel_style}
              </p>

              {requestInfo && (
                <div className="mt-6 rounded-[24px] bg-white/10 p-5 backdrop-blur">
                  <p className="text-sm font-bold uppercase tracking-[0.2em] text-white/80">입력한 취향</p>
                  <p className="mt-3 text-sm leading-7 text-white/90 sm:text-base">
                    {requestInfo.merged_query || requestInfo.query_text || '-'}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-end">
              <div className="w-full rounded-[28px] bg-white/12 p-6 backdrop-blur">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-white/80">예상 총비용</p>
                <p className="mt-3 text-4xl font-black sm:text-5xl">{totalCostText}원</p>
                <p className="mt-3 text-sm leading-6 text-white/80">
                  AI가 입력한 일정, 예산, 날씨를 바탕으로 전체 동선을 최적화한 예상 비용입니다.
                </p>
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
                <p className="mt-3 text-2xl font-black tracking-tight text-slate-900">{card.value}</p>
              </div>
            ))}
          </div>
        </section>

        {weatherSummary && (
          <section className="mt-8">
            <div className="rounded-[32px] bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">날씨 반영 정보</p>
                  <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900">
                    오늘 서울 상황을 반영한 코스예요
                  </h2>
                  <p className="mt-3 text-slate-600">
                    {weatherData?.target_area || '서울'} 기준 날씨를 분석해 추천을 조정했습니다.
                    {weatherLocation?.name ? ` (${weatherLocation.name})` : ''}
                  </p>
                </div>

                <div className="rounded-2xl bg-blue-50 px-4 py-3 ring-1 ring-blue-100">
                  <p className="text-xs font-semibold text-blue-600">추천 모드</p>
                  <p className="mt-1 text-xl font-black text-blue-700">{weatherModeLabel}</p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <p className="text-xs font-semibold text-slate-500">현재 기온</p>
                  <p className="mt-2 text-2xl font-black text-slate-900">
                    {weatherSummary.current_temperature ?? '-'}°
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <p className="text-xs font-semibold text-slate-500">체감 기온</p>
                  <p className="mt-2 text-2xl font-black text-slate-900">
                    {weatherSummary.apparent_temperature ?? '-'}°
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <p className="text-xs font-semibold text-slate-500">최대 강수확률</p>
                  <p className="mt-2 text-2xl font-black text-slate-900">
                    {weatherSummary.max_precipitation_probability ?? '-'}%
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <p className="text-xs font-semibold text-slate-500">최고 / 최저</p>
                  <p className="mt-2 text-2xl font-black text-slate-900">
                    {weatherSummary.max_temp_today ?? '-'}° / {weatherSummary.min_temp_today ?? '-'}°
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <p className="text-xs font-semibold text-slate-500">비 가능성</p>
                  <p className="mt-2 text-2xl font-black text-slate-900">{weatherSummary.rain_risk || '-'}</p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4">
                <p className="text-sm leading-7 text-slate-700">
                  오늘 추천은 <span className="font-bold text-slate-900">{weatherModeLabel}</span> 기준으로
                  구성되어, 날씨에 따라 야외 비중을 줄이거나 실내 동선을 강화했습니다.
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
                  <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">추천 일정</p>
                  <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900">오늘의 코스 타임라인</h2>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200">
                  <p className="text-xs font-semibold text-slate-500">총 코스 수</p>
                  <p className="mt-1 text-xl font-black text-slate-900">
                    {resultData.itinerary?.length || 0}개
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
                          <p className="text-xs font-semibold text-slate-500">예상 비용</p>
                          <p className="mt-1 text-lg font-black text-slate-900">
                            {Number(item.estimated_cost || 0).toLocaleString()}원
                          </p>
                        </div>
                      </div>

                      <p className="mt-4 leading-7 text-slate-700">{item.reason}</p>

                      <div className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm text-slate-600 ring-1 ring-slate-200">
                        팁: {item.tips}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">AI 예산 해석</p>
              <p className="mt-3 text-base leading-7 text-slate-700">{resultData.budget_comment}</p>
            </div>

            <div className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">여행 팁</p>
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
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">대체 코스</p>
              <div className="mt-4 space-y-3">
                {resultData.alternative_plan?.map((item, idx) => (
                  <div key={idx} className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                    <p className="text-sm font-bold text-blue-600">{item.time}</p>
                    <h4 className="mt-1 text-lg font-black text-slate-900">{item.title}</h4>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{item.reason}</p>
                    <p className="mt-3 text-xs text-slate-500">
                      예상 비용: {Number(item.estimated_cost || 0).toLocaleString()}원
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-white/70">다시 추천받기</p>
              <h3 className="mt-2 text-2xl font-black">다른 분위기의 서울도 볼까요?</h3>
              <p className="mt-3 text-sm leading-6 text-white/85">
                취향 입력을 바꿔 다시 추천을 생성하면 전혀 다른 무드의 서울 코스를 받을 수 있어요.
              </p>
              <button
                onClick={() => navigate('/')}
                className="mt-5 rounded-2xl bg-white px-5 py-3 font-bold text-blue-700 transition hover:scale-[1.02]"
              >
                다시 추천받기
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}