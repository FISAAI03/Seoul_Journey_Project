import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

export default function RefineTripPage() {
  const navigate = useNavigate()
  const { id } = useParams()

  const [currentUser, setCurrentUser] = useState(null)
  const [trip, setTrip] = useState(null)
  const [itinerary, setItinerary] = useState([])
  const [alternativePlan, setAlternativePlan] = useState([])
  const [candidateItems, setCandidateItems] = useState([])
  const [quickActions, setQuickActions] = useState([])
  const [weather, setWeather] = useState(null)
  const [publicDataCandidates, setPublicDataCandidates] = useState(null)

  const [removeIndices, setRemoveIndices] = useState([])
  const [addCandidateItems, setAddCandidateItems] = useState([])
  const [selectedQuickActions, setSelectedQuickActions] = useState([])
  const [refineRequest, setRefineRequest] = useState('')
  const [targetBudget, setTargetBudget] = useState(70000)
  const [mood, setMood] = useState('')
  const [saveToLibrary, setSaveToLibrary] = useState(true)

  const [loading, setLoading] = useState(true)
  const [refining, setRefining] = useState(false)
  const [error, setError] = useState('')
  const [progressValue, setProgressValue] = useState(12)

  const getApiBase = () => {
    const envBase = import.meta.env.VITE_API_BASE_URL

    if (envBase) {
      return envBase.replace(/\/$/, '')
    }

    return window.location.origin
  }

  useEffect(() => {
    const savedUser = localStorage.getItem('user')

    if (!savedUser) {
      alert('로그인이 필요합니다.')
      navigate('/login')
      return
    }

    try {
      setCurrentUser(JSON.parse(savedUser))
    } catch (err) {
      localStorage.removeItem('user')
      alert('로그인 정보가 올바르지 않습니다. 다시 로그인해주세요.')
      navigate('/login')
    }
  }, [navigate])

  useEffect(() => {
    if (!currentUser) return

    const fetchRefineOptions = async () => {
      try {
        setLoading(true)
        setError('')

        const apiBase = getApiBase()
        const res = await fetch(`${apiBase}/api/trip/${id}/refine-options`)
        const data = await res.json()

        if (!res.ok || !data.success) {
          throw new Error(data.message || data.error || '재구성 정보를 불러오지 못했습니다.')
        }

        setTrip(data.trip)
        setItinerary(data.itinerary || [])
        setAlternativePlan(data.alternative_plan || [])
        setCandidateItems(data.candidate_items || [])
        setQuickActions(data.quick_actions || [])
        setWeather(data.weather || null)
        setPublicDataCandidates(data.public_data_candidates || null)
        setTargetBudget(Number(data.trip?.budget || 70000))
      } catch (err) {
        console.error(err)
        setError(err.message || '재구성 정보 조회 중 오류가 발생했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchRefineOptions()
  }, [currentUser, id])

  useEffect(() => {
    if (!refining) {
      setProgressValue(12)
      return
    }

    const interval = setInterval(() => {
      setProgressValue((prev) => {
        if (prev >= 94) return prev
        return Math.min(94, prev + Math.random() * 10)
      })
    }, 850)

    return () => clearInterval(interval)
  }, [refining])

  const selectedRemovePlaces = useMemo(() => {
    return removeIndices
      .map((idx) => itinerary[idx])
      .filter(Boolean)
      .map((item) => item.place_name || item.title)
  }, [removeIndices, itinerary])

  const selectedCandidateIds = useMemo(() => {
    return addCandidateItems.map((item) => item.candidate_id)
  }, [addCandidateItems])

  const groupedCandidates = useMemo(() => {
    const groups = {
      attractions: [],
      culture: [],
      shopping: [],
      food: [],
      lodging: [],
    }

    candidateItems.forEach((item) => {
      const key = item.source_group || 'attractions'
      if (!groups[key]) groups[key] = []
      groups[key].push(item)
    })

    return groups
  }, [candidateItems])

  const sourceLabelMap = {
    attractions: '관광',
    culture: '문화/체험',
    shopping: '쇼핑',
    food: '식사/가격',
    lodging: '숙박',
  }

  const toggleRemoveIndex = (idx) => {
    setRemoveIndices((prev) =>
      prev.includes(idx) ? prev.filter((item) => item !== idx) : [...prev, idx],
    )
  }

  const toggleQuickAction = (action) => {
    setSelectedQuickActions((prev) => {
      const exists = prev.find((item) => item.key === action.key)
      if (exists) {
        return prev.filter((item) => item.key !== action.key)
      }
      return [...prev, action]
    })
  }

  const toggleCandidate = (candidate) => {
    setAddCandidateItems((prev) => {
      const exists = prev.find((item) => item.candidate_id === candidate.candidate_id)
      if (exists) {
        return prev.filter((item) => item.candidate_id !== candidate.candidate_id)
      }
      return [...prev, candidate]
    })
  }

  const handleRefine = async () => {
    if (!currentUser) {
      alert('로그인이 필요합니다.')
      navigate('/login')
      return
    }

    if (
      removeIndices.length === 0 &&
      addCandidateItems.length === 0 &&
      selectedQuickActions.length === 0 &&
      !refineRequest.trim() &&
      !mood.trim()
    ) {
      alert('빼거나 추가할 장소, 빠른 재구성 옵션, 요청사항 중 하나 이상을 선택해주세요.')
      return
    }

    try {
      setRefining(true)
      setError('')

      const apiBase = getApiBase()

      const payload = {
        trip_id: Number(id),
        user_id: currentUser.id,
        remove_indices: removeIndices,
        remove_place_names: selectedRemovePlaces,
        add_candidate_ids: selectedCandidateIds,
        add_candidate_items: addCandidateItems,
        selected_quick_actions: selectedQuickActions,
        refine_request: refineRequest,
        target_budget: targetBudget,
        mood,
        save_to_library: saveToLibrary,
      }

      const res = await fetch(`${apiBase}/api/trip/refine`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      console.log('refine response:', data)

      if (!res.ok || !data.success) {
        throw new Error(data.error || data.message || '코스 재구성에 실패했습니다.')
      }

      setProgressValue(100)

      const refinedTripId = data.new_trip_id || Number(id)
      const refinedResult = data.refined_result
      const refinedWeather = data.weather || weather
      const refinedCandidates = data.public_data_candidates || publicDataCandidates

      if (refinedResult) {
        localStorage.setItem('latest_recommend_result', JSON.stringify(refinedResult))
      }

      if (refinedWeather) {
        localStorage.setItem('latest_recommend_weather', JSON.stringify(refinedWeather))
      }

      if (refinedCandidates) {
        localStorage.setItem('latest_public_data_candidates', JSON.stringify(refinedCandidates))
      }

      localStorage.setItem('latest_trip_id', String(refinedTripId))

      alert(
        saveToLibrary
          ? '새로운 재구성 코스가 보관함에 저장되었습니다.'
          : '코스가 재구성되었습니다.',
      )

      navigate('/recommend-result', {
        state: {
          tripId: refinedTripId,
          resultData: refinedResult,
          requestInfo: {
            query_text: trip?.query_text,
            merged_query: trip?.merged_query,
            travel_type: trip?.travel_type,
            duration: trip?.duration,
            budget: targetBudget,
          },
          weatherData: refinedWeather,
          publicDataCandidates: refinedCandidates,
        },
      })
    } catch (err) {
      console.error(err)
      setError(err.message || '코스 재구성 중 오류가 발생했습니다.')
      alert(err.message || '코스 재구성 중 오류가 발생했습니다.')
    } finally {
      setRefining(false)
    }
  }

  const resetSelections = () => {
    setRemoveIndices([])
    setAddCandidateItems([])
    setSelectedQuickActions([])
    setRefineRequest('')
    setMood('')
  }

  const getMapKeyword = (item) => {
    const raw = item?.address || item?.place_name || item?.display_name || item?.title || ''
    return raw
      .split('+')[0]
      .split('/')[0]
      .replace('식사', '')
      .replace('쇼핑', '')
      .replace('코스', '')
      .replace('방문', '')
      .trim()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-12 text-slate-900">
        <div className="mx-auto max-w-5xl rounded-[32px] bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <p className="text-xl font-black">코스 재구성 준비 중입니다...</p>
          <p className="mt-2 text-slate-600">저장된 코스와 대체 후보를 불러오고 있어요.</p>
        </div>
      </div>
    )
  }

  if (error && !trip) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-12 text-slate-900">
        <div className="mx-auto max-w-5xl rounded-[32px] bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <p className="text-xl font-black text-red-700">재구성 정보를 불러오지 못했습니다.</p>
          <p className="mt-2 text-slate-600">{error}</p>
          <button
            onClick={() => navigate('/my-trips')}
            className="mt-6 rounded-2xl bg-blue-600 px-6 py-4 font-bold text-white transition hover:bg-blue-700"
          >
            보관함으로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-36 text-slate-900">
      {refining && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-md">
          <div className="w-full max-w-3xl overflow-hidden rounded-[36px] bg-white shadow-2xl">
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-pink-500 px-8 py-10 text-white">
              <p className="inline-flex rounded-full bg-white/15 px-4 py-2 text-sm font-bold backdrop-blur">
                AI 코스 재구성 중
              </p>
              <h2 className="mt-5 text-3xl font-black tracking-tight">
                선택한 장소를 반영해서 새로운 서울 코스를 만들고 있어요
              </h2>
              <p className="mt-3 text-white/85">
                뺄 장소, 추가 후보, 날씨, 예산, 동선을 다시 조합하고 있습니다.
              </p>

              <div className="mt-8">
                <div className="mb-2 flex justify-between text-sm font-semibold text-white/80">
                  <span>재구성 진행률</span>
                  <span>{Math.round(progressValue)}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-white/20">
                  <div
                    className="h-full rounded-full bg-white transition-all duration-700"
                    style={{ width: `${progressValue}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-4 p-6 sm:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <p className="text-xs font-bold text-slate-500">제외할 장소</p>
                <p className="mt-2 text-2xl font-black text-slate-900">{removeIndices.length}개</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <p className="text-xs font-bold text-slate-500">추가 후보</p>
                <p className="mt-2 text-2xl font-black text-slate-900">{addCandidateItems.length}개</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <p className="text-xs font-bold text-slate-500">목표 예산</p>
                <p className="mt-2 text-2xl font-black text-slate-900">
                  {Number(targetBudget || 0).toLocaleString()}원
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <div>
            <p className="text-xl font-black tracking-tight text-blue-700">Seoul Like Local</p>
            <p className="text-xs text-slate-500">AI 코스 재구성</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/trip/${id}`)}
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              상세로
            </button>
            <button
              onClick={() => navigate('/my-trips')}
              className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              보관함
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[36px] bg-gradient-to-r from-blue-600 via-indigo-600 to-pink-500 px-6 py-10 text-white sm:px-10">
          <div className="max-w-4xl">
            <p className="inline-flex rounded-full bg-white/15 px-4 py-2 text-sm font-bold backdrop-blur">
              Remix Your Seoul Trip
            </p>
            <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl">
              마음에 드는 장소만 남기고, 나머지는 새롭게 바꿔보세요
            </h1>
            <p className="mt-4 max-w-3xl text-white/85">
              기존 코스에서 빼고 싶은 일정을 선택하고, 공공데이터 기반 대체 후보를 골라
              더 마음에 드는 서울 코스로 재구성할 수 있습니다.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-4">
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <p className="text-xs font-semibold text-white/70">원본 코스</p>
              <p className="mt-2 text-lg font-black">{trip?.title || '서울 추천 코스'}</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <p className="text-xs font-semibold text-white/70">여행 유형</p>
              <p className="mt-2 text-lg font-black">{trip?.travel_type}</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <p className="text-xs font-semibold text-white/70">일정</p>
              <p className="mt-2 text-lg font-black">{trip?.duration}</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <p className="text-xs font-semibold text-white/70">날씨 모드</p>
              <p className="mt-2 text-lg font-black">
                {weather?.weather_summary?.recommendation_mode || '-'}
              </p>
            </div>
          </div>
        </section>

        {error && (
          <section className="mt-6 rounded-[24px] border border-red-200 bg-red-50 p-5">
            <p className="font-bold text-red-700">오류</p>
            <p className="mt-1 text-sm text-red-600">{error}</p>
          </section>
        )}

        <section className="mt-8 space-y-6">
          <div className="rounded-[32px] bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
                  Step 1
                </p>
                <h2 className="mt-2 text-3xl font-black tracking-tight">빼고 싶은 일정을 선택하세요</h2>
                <p className="mt-2 text-sm text-slate-600">
                  선택한 일정은 재구성 결과에서 제외됩니다.
                </p>
              </div>
              <div className="w-fit rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
                {removeIndices.length}개 제외
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {itinerary.map((item, idx) => {
                const active = removeIndices.includes(idx)

                return (
                  <button
                    key={`${item.time}-${idx}`}
                    type="button"
                    onClick={() => toggleRemoveIndex(idx)}
                    className={`w-full rounded-[24px] p-5 text-left ring-1 transition ${
                      active
                        ? 'bg-red-50 ring-red-300'
                        : 'bg-slate-50 ring-slate-200 hover:bg-blue-50 hover:ring-blue-200'
                    }`}
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-blue-700 ring-1 ring-slate-200">
                            {item.time || `${idx + 1}번째`}
                          </span>
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                            {item.category || '일정'}
                          </span>
                          {active && (
                            <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white">
                              제외 예정
                            </span>
                          )}
                        </div>

                        <h3 className="mt-3 text-2xl font-black text-slate-900">
                          {item.title || item.place_name || '서울 추천 장소'}
                        </h3>
                        <p className="mt-1 text-sm font-semibold text-slate-500">
                          지도 검색명: {item.place_name || item.title || '-'}
                        </p>
                        <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
                          {item.reason}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-white px-4 py-3 text-right ring-1 ring-slate-200">
                        <p className="text-xs font-semibold text-slate-500">예상 비용</p>
                        <p className="mt-1 text-lg font-black text-slate-900">
                          {Number(item.estimated_cost || 0).toLocaleString()}원
                        </p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="rounded-[32px] bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
                  Step 2
                </p>
                <h2 className="mt-2 text-3xl font-black tracking-tight">넣고 싶은 대체 후보를 고르세요</h2>
                <p className="mt-2 text-sm text-slate-600">
                  기존 추천에 사용된 공공데이터 후보를 다시 활용합니다.
                </p>
              </div>
              <div className="w-fit rounded-2xl bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700">
                {addCandidateItems.length}개 추가
              </div>
            </div>

            <div className="mt-6 space-y-8">
              {Object.entries(groupedCandidates).map(([groupKey, items]) => {
                if (!items || items.length === 0) return null

                return (
                  <div key={groupKey}>
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-lg font-black text-slate-900">
                        {sourceLabelMap[groupKey] || groupKey}
                      </h3>
                      <p className="text-xs font-semibold text-slate-500">{items.length}개 후보</p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {items.slice(0, 9).map((candidate) => {
                        const active = selectedCandidateIds.includes(candidate.candidate_id)

                        return (
                          <button
                            key={candidate.candidate_id}
                            type="button"
                            onClick={() => toggleCandidate(candidate)}
                            className={`rounded-[22px] p-4 text-left ring-1 transition ${
                              active
                                ? 'bg-blue-50 ring-blue-300'
                                : 'bg-slate-50 ring-slate-200 hover:bg-blue-50 hover:ring-blue-200'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-xs font-bold text-blue-600">
                                  {candidate.source_table}
                                </p>
                                <h4 className="mt-2 text-lg font-black text-slate-900">
                                  {candidate.display_name}
                                </h4>
                              </div>
                              {active && (
                                <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white">
                                  추가
                                </span>
                              )}
                            </div>

                            <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">
                              {candidate.address || '주소 정보 없음'}
                            </p>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                const keyword = getMapKeyword(candidate)
                                if (keyword) {
                                  window.open(
                                    `https://map.naver.com/p/search/${encodeURIComponent(keyword)}`,
                                    '_blank',
                                  )
                                }
                              }}
                              className="mt-3 rounded-full bg-white px-3 py-2 text-xs font-bold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-100"
                            >
                              지도 검색
                            </button>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="rounded-[32px] bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
                Step 3
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-tight">원하는 방향을 선택하세요</h2>
              <p className="mt-2 text-sm text-slate-600">
                코스를 어떤 느낌으로 다시 구성할지 선택하거나 직접 요청사항을 입력하세요.
              </p>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {quickActions.map((action) => {
                const active = selectedQuickActions.some((item) => item.key === action.key)

                return (
                  <button
                    key={action.key}
                    type="button"
                    onClick={() => toggleQuickAction(action)}
                    className={`rounded-2xl px-4 py-4 text-left ring-1 transition ${
                      active
                        ? 'bg-blue-600 text-white ring-blue-600'
                        : 'bg-slate-50 text-slate-800 ring-slate-200 hover:bg-blue-50 hover:ring-blue-200'
                    }`}
                  >
                    <p className="font-black">{action.label}</p>
                    <p className={`mt-1 text-xs leading-5 ${active ? 'text-white/80' : 'text-slate-500'}`}>
                      {action.prompt}
                    </p>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="rounded-[32px] bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
                Step 4
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-tight">세부 요청을 입력하세요</h2>
              <p className="mt-2 text-sm text-slate-600">
                분위기, 예산, 추가 요청사항을 반영해 더 자연스럽게 코스를 바꿉니다.
              </p>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  원하는 분위기
                </label>
                <input
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                  placeholder="예: 감성적이게, 덜 붐비게, 데이트 느낌으로"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  목표 예산
                </label>
                <input
                  type="range"
                  min="30000"
                  max="1000000"
                  step="10000"
                  value={targetBudget}
                  onChange={(e) => setTargetBudget(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
                <p className="mt-2 text-right text-2xl font-black text-blue-700">
                  {Number(targetBudget || 0).toLocaleString()}원
                </p>
              </div>

              <div className="lg:col-span-2">
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  추가 요청사항
                </label>
                <textarea
                  value={refineRequest}
                  onChange={(e) => setRefineRequest(e.target.value)}
                  placeholder="예: 너무 쇼핑 위주라서 카페와 산책을 조금 더 넣어줘. 이동은 줄이고 싶어."
                  className="h-32 w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <label className="flex cursor-pointer items-center gap-3 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200 lg:col-span-2">
                <input
                  type="checkbox"
                  checked={saveToLibrary}
                  onChange={(e) => setSaveToLibrary(e.target.checked)}
                  className="h-5 w-5 accent-blue-600"
                />
                <div>
                  <p className="text-sm font-black text-slate-900">재구성 결과를 보관함에 저장</p>
                  <p className="text-xs text-slate-500">저장하면 새로운 여행 코스로 관리할 수 있어요.</p>
                </div>
              </label>
            </div>
          </div>

          {alternativePlan.length > 0 && (
            <div className="rounded-[32px] bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
                기존 대체 코스
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-tight">AI가 제안했던 대체안</h2>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {alternativePlan.map((item, idx) => (
                  <div key={idx} className="rounded-[22px] bg-slate-50 p-4 ring-1 ring-slate-200">
                    <p className="text-xs font-bold text-blue-600">{item.time}</p>
                    <h3 className="mt-2 text-lg font-black">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{item.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 px-4 py-4 shadow-2xl backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="grid grid-cols-3 gap-2 text-center sm:min-w-[420px]">
            <div className="rounded-2xl bg-red-50 px-4 py-3">
              <p className="text-xs font-bold text-red-500">제외</p>
              <p className="mt-1 text-lg font-black text-red-700">{removeIndices.length}개</p>
            </div>

            <div className="rounded-2xl bg-blue-50 px-4 py-3">
              <p className="text-xs font-bold text-blue-500">추가</p>
              <p className="mt-1 text-lg font-black text-blue-700">{addCandidateItems.length}개</p>
            </div>

            <div className="rounded-2xl bg-slate-100 px-4 py-3">
              <p className="text-xs font-bold text-slate-500">옵션</p>
              <p className="mt-1 text-lg font-black text-slate-900">{selectedQuickActions.length}개</p>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              onClick={resetSelections}
              disabled={refining}
              className="rounded-2xl border border-slate-300 px-6 py-4 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              선택 초기화
            </button>

            <button
              onClick={handleRefine}
              disabled={refining}
              className={`rounded-2xl px-8 py-4 text-base font-black text-white transition ${
                refining
                  ? 'cursor-not-allowed bg-blue-300'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {refining ? '재구성 중...' : 'AI로 코스 재구성하기'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}