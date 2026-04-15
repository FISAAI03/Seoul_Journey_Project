import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

export default function ResultPage() {
  const navigate = useNavigate()
  const location = useLocation()

  const [resultData, setResultData] = useState(location.state?.resultData || null)
  const [requestInfo, setRequestInfo] = useState(location.state?.requestInfo || null)

  useEffect(() => {
    if (location.state?.resultData) {
      localStorage.setItem('latest_recommend_result', JSON.stringify(location.state.resultData))
    }
    if (location.state?.requestInfo) {
      localStorage.setItem('latest_recommend_request', JSON.stringify(location.state.requestInfo))
    }

    if (!location.state?.resultData) {
      const savedResult = localStorage.getItem('latest_recommend_result')
      const savedRequest = localStorage.getItem('latest_recommend_request')

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
    }
  }, [location.state])

  const totalCostText = useMemo(() => {
    return Number(resultData?.total_estimated_cost || 0).toLocaleString()
  }, [resultData])

  if (!resultData) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-12 text-slate-900 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-[32px] bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">추천 결과</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900">표시할 추천 결과가 없습니다.</h1>
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
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
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

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <section className="overflow-hidden rounded-[32px] bg-gradient-to-r from-blue-600 via-indigo-600 to-pink-500 px-6 py-10 text-white sm:px-10 lg:px-14 lg:py-14">
          <div className="max-w-4xl">
            <p className="inline-flex rounded-full bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur">
              AI 추천 결과
            </p>
            <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
              {resultData.summary}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-white/85 sm:text-lg">
              {resultData.travel_style}
            </p>
          </div>
        </section>

        {requestInfo && (
          <section className="mt-8">
            <div className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">입력 요약</p>
              <div className="mt-5 grid gap-4 md:grid-cols-4">
                <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <p className="text-xs font-semibold text-slate-500">여행 유형</p>
                  <p className="mt-2 text-lg font-bold text-slate-900">{requestInfo.travel_type}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <p className="text-xs font-semibold text-slate-500">일정</p>
                  <p className="mt-2 text-lg font-bold text-slate-900">{requestInfo.duration}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <p className="text-xs font-semibold text-slate-500">예산</p>
                  <p className="mt-2 text-lg font-bold text-slate-900">
                    {Number(requestInfo.budget || 0).toLocaleString()}원
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <p className="text-xs font-semibold text-slate-500">취향 입력</p>
                  <p className="mt-2 line-clamp-3 text-sm font-semibold text-slate-900">
                    {requestInfo.merged_query || requestInfo.query_text || '-'}
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <div className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">추천 일정</p>
                  <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900">오늘의 코스</h2>
                </div>
                <div className="rounded-2xl bg-blue-50 px-4 py-3 text-right">
                  <p className="text-xs font-semibold text-blue-600">예상 총비용</p>
                  <p className="mt-1 text-2xl font-black text-blue-700">{totalCostText}원</p>
                </div>
              </div>

              <div className="space-y-4">
                {resultData.itinerary?.map((item, idx) => (
                  <div
                    key={`${item.time}-${idx}`}
                    className="rounded-[24px] bg-slate-50 p-5 ring-1 ring-slate-200"
                  >
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
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">예산 코멘트</p>
              <p className="mt-3 text-base leading-7 text-slate-700">{resultData.budget_comment}</p>
            </div>

            <div className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">여행 팁</p>
              <div className="mt-4 space-y-3">
                {resultData.tips?.map((tip, idx) => (
                  <div key={idx} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700 ring-1 ring-slate-200">
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