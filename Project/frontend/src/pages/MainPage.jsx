import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext'
import LanguageToggle from '../components/LanguageToggle'

export default function MainPage() {
  const navigate = useNavigate()
  const { language, t } = useLanguage()

  const [query, setQuery] = useState('')
  const [budget, setBudget] = useState(70000)
  const [travelType, setTravelType] = useState('혼자 여행')
  const [duration, setDuration] = useState('1일')
  const [customDuration, setCustomDuration] = useState('')
  const [showPlanner, setShowPlanner] = useState(false)
  const [selectedTags, setSelectedTags] = useState([])
  const [selectedThemes, setSelectedThemes] = useState([])
  const [currentUser, setCurrentUser] = useState(null)

  const [loading, setLoading] = useState(false)
  const [recommendError, setRecommendError] = useState('')
  const [loadingStepIndex, setLoadingStepIndex] = useState(0)
  const [progressValue, setProgressValue] = useState(8)

  const isKo = language === 'ko'

  const getApiBase = () => {
    const envBase = import.meta.env.VITE_API_BASE_URL

    if (envBase) {
      return envBase.replace(/\/$/, '')
    }

    return window.location.origin
  }

  const parseJsonResponse = async (res) => {
    const contentType = res.headers.get('content-type') || ''
    const text = await res.text()

    if (!contentType.includes('application/json')) {
      throw new Error(
        `API가 JSON이 아닌 응답을 반환했습니다. status=${res.status}, body=${text.slice(0, 120)}`,
      )
    }

    return JSON.parse(text)
  }

  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser))
      } catch (error) {
        localStorage.removeItem('user')
      }
    }
  }, [])

  const themes = useMemo(
    () => [
      {
        key: 'drama',
        title: isKo ? 'K-드라마 감성' : 'K-Drama Vibes',
        emoji: '🎬',
        desc: isKo
          ? '드라마 속 주인공처럼 걷고 싶은 하루'
          : 'Walk through Seoul like a character in a K-drama',
        image:
          'https://images.unsplash.com/photo-1517154421773-0529f29ea451?auto=format&fit=crop&w=900&q=80',
      },
      {
        key: 'kpop',
        title: isKo ? 'K-팝 & 트렌드' : 'K-Pop & Trends',
        emoji: '🎧',
        desc: isKo
          ? '핫플, 팝업, 트렌디한 서울 무드'
          : 'Trendy Seoul spots, pop-ups, and youth culture',
        image:
          'https://images.unsplash.com/photo-1528164344705-47542687000d?auto=format&fit=crop&w=900&q=80',
      },
      {
        key: 'food',
        title: isKo ? '로컬 미식 탐방' : 'Local Food Tour',
        emoji: '🍜',
        desc: isKo
          ? '현지 느낌 가득한 서울 맛집 코스'
          : 'Taste local Seoul through food, cafes, and casual dining',
        image:
          'https://images.unsplash.com/photo-1553163147-622ab57be1c7?auto=format&fit=crop&w=900&q=80',
      },
      {
        key: 'beauty',
        title: isKo ? '뷰티 & 쇼핑' : 'Beauty & Shopping',
        emoji: '🛍️',
        desc: isKo
          ? '올리브영, 성수, 뷰티 스팟까지 한 번에'
          : 'Beauty stores, fashion, lifestyle shops, and trendy districts',
        image:
          'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80',
      },
      {
        key: 'walk',
        title: isKo ? '조용한 산책' : 'Slow Walks',
        emoji: '🌿',
        desc: isKo
          ? '복잡함을 피해 여유롭게 걷는 서울'
          : 'A calm Seoul route for walking, parks, and quiet moments',
        image:
          'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80',
      },
    ],
    [isKo],
  )

  const quickTags = useMemo(
    () =>
      isKo
        ? ['혼자 여행', '커플 여행', '야경', '저예산', '성수', '홍대', '명동', '비 오는 날']
        : [
            'Solo trip',
            'Couple trip',
            'Night view',
            'Budget-friendly',
            'Seongsu',
            'Hongdae',
            'Myeongdong',
            'Rainy day',
          ],
    [isKo],
  )

  const travelTypes = useMemo(
    () =>
      isKo
        ? ['혼자 여행', '커플 여행', '친구/가족 여행']
        : ['Solo trip', 'Couple trip', 'Friends / Family trip'],
    [isKo],
  )

  const durations = useMemo(
    () => (isKo ? ['1일', '3일', '직접 입력'] : ['1 day', '3 days', 'Custom']),
    [isKo],
  )

  const features = useMemo(
    () => [
      {
        title: isKo ? 'AI 취향 분석' : 'AI Preference Analysis',
        desc: isKo
          ? '자연어 입력을 바탕으로 여행 의도와 분위기를 해석합니다.'
          : 'The AI understands your travel intent and preferred mood from natural language.',
      },
      {
        title: isKo ? '서울 공공데이터 조회' : 'Seoul Public Data Search',
        desc: isKo
          ? '관광지, 문화공간, 쇼핑, 숙박, 가격 데이터를 기반으로 후보를 찾습니다.'
          : 'It searches tourism, culture, shopping, lodging, and price datasets from Seoul.',
      },
      {
        title: isKo ? '맞춤 코스 추천' : 'Personalized Itinerary',
        desc: isKo
          ? '날씨, 예산, 여행 유형을 반영해 최종 서울 코스를 구성합니다.'
          : 'It builds a Seoul itinerary based on weather, budget, duration, and travel style.',
      },
      {
        title: isKo ? 'AI 코스 재구성' : 'AI Itinerary Remix',
        desc: isKo
          ? '마음에 들지 않는 장소를 빼고, 대체 후보를 넣어 코스를 다시 구성할 수 있습니다.'
          : 'Remove places you do not like and remix the itinerary with alternative data-based spots.',
      },
    ],
    [isKo],
  )

  const loadingMessages = useMemo(
    () =>
      isKo
        ? [
            {
              title: '취향과 여행 목적을 분석하고 있어요',
              desc: '입력한 키워드에서 원하는 분위기와 서울의 무드를 해석하고 있습니다.',
            },
            {
              title: '서울 공공데이터에서 후보 장소를 찾고 있어요',
              desc: '관광지, 문화공간, 쇼핑 장소, 음식 가격 데이터를 기반으로 실제 후보를 조회하고 있습니다.',
            },
            {
              title: '날씨와 지역 특성을 반영하고 있어요',
              desc: '오늘의 서울 날씨와 지역 특성을 고려해 실내·야외 동선을 조정하고 있습니다.',
            },
            {
              title: '예산에 맞는 흐름을 설계하고 있어요',
              desc: '개인서비스 가격 데이터와 입력 예산을 함께 고려해 무리 없는 코스를 구성하고 있습니다.',
            },
            {
              title: '대체 코스까지 준비하고 있어요',
              desc: '비가 오거나 혼잡할 때를 대비한 실내형·저예산형 대안도 함께 구성하고 있습니다.',
            },
          ]
        : [
            {
              title: 'Analyzing your travel taste',
              desc: 'The AI is interpreting your preferred mood, purpose, and Seoul travel style.',
            },
            {
              title: 'Searching Seoul public datasets',
              desc: 'It is looking for real tourism, culture, shopping, lodging, and price-based candidates.',
            },
            {
              title: 'Reflecting weather and local context',
              desc: 'The route is being adjusted based on today’s Seoul weather and district characteristics.',
            },
            {
              title: 'Designing a budget-aware flow',
              desc: 'The AI is balancing your budget with food prices, attractions, cafes, and activities.',
            },
            {
              title: 'Preparing alternatives too',
              desc: 'Indoor, rainy-day, and budget-friendly alternatives are being prepared.',
            },
          ],
    [isKo],
  )

  const loadingTips = useMemo(
    () =>
      isKo
        ? [
            '팁: 이 추천은 서울 관광·문화·쇼핑·가격 데이터를 함께 참고해 생성됩니다.',
            '팁: 추천 후 보관함에서 마음에 안 드는 장소를 빼고 다른 후보로 재구성할 수 있어요.',
            '팁: 예산이 낮을수록 가격 데이터 기반 식사 후보를 우선 반영합니다.',
          ]
        : [
            'Tip: This itinerary uses Seoul tourism, culture, shopping, and price datasets.',
            'Tip: After saving, you can remove places and remix the route with alternative candidates.',
            'Tip: Lower budgets prioritize price-based food and casual dining options.',
          ],
    [isKo],
  )

  const previewMoments = useMemo(
    () =>
      isKo
        ? [
            {
              time: '11:00',
              title: '공공데이터 후보 탐색 중',
              desc: '입력한 지역과 취향에 맞는 관광·문화·쇼핑 후보를 찾고 있어요.',
            },
            {
              time: '14:00',
              title: '날씨 기반 동선 조정 중',
              desc: '비, 더위, 추위 가능성을 반영해 실내·야외 비중을 조정하고 있어요.',
            },
            {
              time: '18:00',
              title: '예산과 대체 코스 구성 중',
              desc: '식사 가격 데이터와 예산을 반영해 무리 없는 하루 흐름을 만들고 있어요.',
            },
          ]
        : [
            {
              time: '11:00',
              title: 'Finding public-data candidates',
              desc: 'The AI is searching tourism, culture, shopping, and dining candidates.',
            },
            {
              time: '14:00',
              title: 'Adjusting the route by weather',
              desc: 'Indoor and outdoor balance is being adjusted based on rain, heat, or cold.',
            },
            {
              time: '18:00',
              title: 'Balancing budget and alternatives',
              desc: 'Food prices and your budget are being reflected in the final flow.',
            },
          ],
    [isKo],
  )

  useEffect(() => {
    if (!loading) {
      setLoadingStepIndex(0)
      setProgressValue(8)
      return
    }

    const stepInterval = setInterval(() => {
      setLoadingStepIndex((prev) => (prev + 1) % loadingMessages.length)
    }, 2200)

    const progressInterval = setInterval(() => {
      setProgressValue((prev) => {
        if (prev >= 92) return prev
        const next = prev + Math.random() * 12
        return Math.min(next, 92)
      })
    }, 900)

    return () => {
      clearInterval(stepInterval)
      clearInterval(progressInterval)
    }
  }, [loading, loadingMessages.length])

  const finalDuration = useMemo(() => {
    if (duration === '직접 입력' || duration === 'Custom') {
      return customDuration.trim()
    }
    return duration
  }, [duration, customDuration])

  const mergedQuery = useMemo(() => {
    const tagText = selectedTags.length > 0 ? selectedTags.join(', ') : ''
    const themeText =
      selectedThemes.length > 0
        ? selectedThemes
            .map((key) => themes.find((theme) => theme.key === key)?.title)
            .filter(Boolean)
            .join(', ')
        : ''

    const durationText = finalDuration ? `${isKo ? '일정' : 'Duration'}: ${finalDuration}` : ''

    return [query, tagText, themeText, durationText].filter(Boolean).join(' / ')
  }, [query, selectedTags, selectedThemes, themes, finalDuration, isKo])

  const activeThemeTitles = useMemo(() => {
    return selectedThemes
      .map((key) => themes.find((theme) => theme.key === key)?.title)
      .filter(Boolean)
  }, [selectedThemes, themes])

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag],
    )
  }

  const toggleTheme = (themeKey) => {
    setSelectedThemes((prev) =>
      prev.includes(themeKey) ? prev.filter((item) => item !== themeKey) : [...prev, themeKey],
    )
  }

  const requireLoginAndOpenPlanner = () => {
    if (!currentUser) {
      alert(t.alerts?.loginRequired || (isKo ? '로그인이 필요합니다.' : 'Please log in first.'))
      navigate('/login')
      return
    }

    if (!query.trim() && selectedTags.length === 0 && selectedThemes.length === 0) {
      alert(
        t.alerts?.needTaste ||
          (isKo
            ? '먼저 빠른 취향 입력 또는 태그/테마를 선택해주세요.'
            : 'Please enter your preference or select a tag/theme first.'),
      )
      return
    }

    setShowPlanner(true)

    setTimeout(() => {
      const section = document.getElementById('planner')
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 50)
  }

  const handleTextareaKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      requireLoginAndOpenPlanner()
    }
  }

  const handleDurationChange = (value) => {
    setDuration(value)
    if (value !== '직접 입력' && value !== 'Custom') {
      setCustomDuration('')
    }
  }

  const handleGoMyTrips = () => {
    if (!currentUser) {
      alert(t.alerts?.loginRequired || (isKo ? '로그인이 필요합니다.' : 'Please log in first.'))
      navigate('/login')
      return
    }
    navigate('/my-trips')
  }

  const handleFinalRecommend = async () => {
    if (!currentUser) {
      alert(t.alerts?.loginRequired || (isKo ? '로그인이 필요합니다.' : 'Please log in first.'))
      navigate('/login')
      return
    }

    if ((duration === '직접 입력' || duration === 'Custom') && !customDuration.trim()) {
      alert(
        t.alerts?.needCustomDuration ||
          (isKo ? '직접 입력한 일정을 작성해주세요.' : 'Please enter your custom duration.'),
      )
      return
    }

    const payload = {
      user_id: currentUser?.id,
      query_text: query,
      merged_query: mergedQuery,
      selected_tags: selectedTags,
      selected_themes: selectedThemes,
      travel_type: travelType,
      duration: finalDuration || duration,
      budget,
      language,
    }

    try {
      setLoading(true)
      setRecommendError('')

      const apiBase = getApiBase()

      const recommendRes = await fetch(`${apiBase}/api/recommend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const recommendData = await parseJsonResponse(recommendRes)
      console.log('recommend response:', recommendData)

      if (!recommendRes.ok || !recommendData.success) {
        throw new Error(
          recommendData.error ||
            recommendData.message ||
            (isKo ? '추천 생성에 실패했습니다.' : 'Failed to generate recommendation.'),
        )
      }

      let savedTripId = null

      try {
        const saveRes = await fetch(`${apiBase}/api/trips`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: currentUser.id,
            title:
              recommendData?.result?.summary ||
              mergedQuery?.slice(0, 60) ||
              (isKo ? '서울 여행 추천 코스' : 'Recommended Seoul Itinerary'),
            query_text: query,
            merged_query: mergedQuery,
            travel_type: travelType,
            duration: finalDuration || duration,
            budget,
            result: recommendData.result,
            weather: recommendData.weather,
            public_data_candidates: recommendData.public_data_candidates,
          }),
        })

        const saveData = await parseJsonResponse(saveRes)
        console.log('trip save response:', saveData)

        if (saveRes.ok && saveData.success) {
          savedTripId = saveData.trip_id
        } else {
          console.warn('보관함 저장 실패:', saveData.message || saveData.error)
        }
      } catch (saveError) {
        console.error('보관함 저장 실패:', saveError)
      }

      setProgressValue(100)

      navigate('/recommend-result', {
        state: {
          tripId: savedTripId,
          resultData: recommendData.result,
          requestInfo: payload,
          weatherData: recommendData.weather,
          publicDataCandidates: recommendData.public_data_candidates,
        },
      })
    } catch (error) {
      console.error('추천 요청 실패:', error)

      setRecommendError(
        error.message ||
          (isKo ? '추천 생성 중 오류가 발생했습니다.' : 'An error occurred while generating the recommendation.'),
      )

      alert(
        error.message ||
          (isKo ? '추천 생성 중 오류가 발생했습니다.' : 'An error occurred while generating the recommendation.'),
      )
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    setCurrentUser(null)
    setShowPlanner(false)
    setRecommendError('')
    alert(t.alerts?.logout || (isKo ? '로그아웃되었습니다.' : 'You have been logged out.'))
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {loading && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-950/70 px-4 py-8 backdrop-blur-md">
          <div className="mx-auto flex min-h-full max-w-5xl items-center justify-center">
            <div className="w-full overflow-hidden rounded-[36px] bg-white shadow-2xl ring-1 ring-slate-200">
              <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-pink-500 px-6 py-8 text-white sm:px-8 sm:py-10">
                <div className="absolute -left-10 top-0 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
                <div className="absolute bottom-0 right-0 h-40 w-40 rounded-full bg-white/10 blur-3xl" />

                <div className="relative">
                  <div className="inline-flex rounded-full bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur">
                    {isKo ? 'AI가 서울 코스를 설계 중입니다' : 'AI is designing your Seoul itinerary'}
                  </div>

                  <div className="mt-5 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                    <div>
                      <h3 className="text-3xl font-black tracking-tight sm:text-4xl">
                        {loadingMessages[loadingStepIndex].title}
                      </h3>
                      <p className="mt-3 max-w-2xl text-sm leading-7 text-white/85 sm:text-base">
                        {loadingMessages[loadingStepIndex].desc}
                      </p>

                      <div className="mt-6">
                        <div className="mb-2 flex items-center justify-between text-xs font-semibold text-white/80">
                          <span>{isKo ? '추천 생성 진행률' : 'Progress'}</span>
                          <span>{Math.round(progressValue)}%</span>
                        </div>
                        <div className="h-3 w-full overflow-hidden rounded-full bg-white/20">
                          <div
                            className="h-full rounded-full bg-white transition-all duration-700 ease-out"
                            style={{ width: `${progressValue}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="rounded-[28px] bg-white/10 p-5 backdrop-blur">
                      <p className="text-sm font-bold uppercase tracking-[0.2em] text-white/80">
                        {isKo ? '입력 요약' : 'Input Summary'}
                      </p>
                      <div className="mt-4 space-y-3 text-sm">
                        <div className="rounded-2xl bg-white/10 px-4 py-3">
                          <p className="text-white/70">{t.travelType}</p>
                          <p className="mt-1 text-lg font-bold text-white">{travelType}</p>
                        </div>
                        <div className="rounded-2xl bg-white/10 px-4 py-3">
                          <p className="text-white/70">{t.duration}</p>
                          <p className="mt-1 text-lg font-bold text-white">
                            {finalDuration || duration}
                          </p>
                        </div>
                        <div className="rounded-2xl bg-white/10 px-4 py-3">
                          <p className="text-white/70">{t.budget}</p>
                          <p className="mt-1 text-lg font-bold text-white">
                            {budget.toLocaleString()}원
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 px-6 py-6 sm:px-8 sm:py-8 lg:grid-cols-[1fr_1fr]">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
                    {isKo ? 'AI 미리보기' : 'AI Preview'}
                  </p>
                  <div className="mt-4 space-y-3">
                    {previewMoments.map((item, idx) => (
                      <div
                        key={idx}
                        className={`rounded-[24px] p-4 ring-1 transition ${
                          idx === loadingStepIndex % previewMoments.length
                            ? 'bg-blue-50 ring-blue-200'
                            : 'bg-slate-50 ring-slate-200'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="rounded-2xl bg-white px-3 py-2 text-sm font-black text-blue-700 ring-1 ring-slate-200">
                            {item.time}
                          </div>
                          <div>
                            <p className="text-lg font-black text-slate-900">{item.title}</p>
                            <p className="mt-1 text-sm leading-6 text-slate-600">{item.desc}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-4 py-4">
                    <p className="text-xs font-semibold text-slate-500">{t.currentTaste}</p>
                    <p className="mt-2 text-sm font-semibold leading-6 text-slate-900">
                      {mergedQuery || t.noTaste}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-[28px] bg-slate-50 p-5 ring-1 ring-slate-200">
                    <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
                      {isKo ? '선택한 테마' : 'Selected Themes'}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {activeThemeTitles.length > 0 ? (
                        activeThemeTitles.map((themeTitle, idx) => (
                          <span
                            key={idx}
                            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200"
                          >
                            {themeTitle}
                          </span>
                        ))
                      ) : (
                        <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-500 ring-1 ring-slate-200">
                          {isKo ? '선택된 테마 없음' : 'No theme selected'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="rounded-[28px] bg-slate-50 p-5 ring-1 ring-slate-200">
                    <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
                      {isKo ? '서울 공공데이터 활용' : 'Using Seoul Public Data'}
                    </p>
                    <div className="mt-4 space-y-3">
                      {loadingTips.map((tip, idx) => (
                        <div
                          key={idx}
                          className="rounded-2xl bg-white p-4 text-sm leading-6 text-slate-700 ring-1 ring-slate-200"
                        >
                          {tip}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[28px] bg-gradient-to-r from-slate-900 to-slate-700 p-5 text-white">
                    <p className="text-sm font-bold uppercase tracking-[0.2em] text-white/70">
                      {isKo ? '지금 만드는 중' : 'Now Building'}
                    </p>
                    <p className="mt-3 text-lg font-black">
                      {isKo
                        ? '공공데이터, 날씨, 예산을 함께 반영한 서울 맞춤 코스'
                        : 'A Seoul itinerary powered by public data, weather, and budget'}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-white/80">
                      {isKo
                        ? '사용자의 입력을 바탕으로 실제 서울 관광·문화·쇼핑·가격 데이터를 조회하고 있어요.'
                        : 'The AI is searching real Seoul tourism, culture, shopping, and price datasets based on your input.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-xl font-black tracking-tight text-blue-700">{t.appName}</p>
            <p className="text-xs text-slate-500">{t.appSubtitle}</p>
          </div>

          <nav className="hidden items-center gap-8 md:flex">
            <a href="#intro" className="text-sm font-medium text-slate-600 transition hover:text-blue-600">
              {t.serviceIntro}
            </a>
            <a href="#theme" className="text-sm font-medium text-slate-600 transition hover:text-blue-600">
              {t.themeSelect}
            </a>
            <a href="#recommend" className="text-sm font-medium text-slate-600 transition hover:text-blue-600">
              {t.recommendMethod}
            </a>
          </nav>

          {!currentUser ? (
            <div className="flex items-center gap-3">
              <LanguageToggle />

              <button
                onClick={() => navigate('/login')}
                className="hidden rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 sm:block"
              >
                {t.login}
              </button>

              <button
                onClick={() => navigate('/signup')}
                className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700"
              >
                {t.signup}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <LanguageToggle />

              <button
                onClick={handleGoMyTrips}
                className="hidden rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 sm:block"
              >
                {t.myTrips}
              </button>

              <div className="hidden rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 sm:block">
                {t.welcome}, {currentUser.name}
              </div>

              <button
                onClick={handleLogout}
                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                {t.logout}
              </button>
            </div>
          )}
        </div>
      </header>

      <main>
        <section id="intro" className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-pink-500 opacity-95" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.22),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.16),transparent_30%)]" />

          <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 md:py-16 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:py-20">
            <div className="text-white">
              <span className="mb-5 inline-flex w-fit rounded-full bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur">
                {t.heroBadge}
              </span>

              <h1 className="max-w-xl text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-[56px]">
                {t.heroTitleLine1}
                <br />
                {t.heroTitleLine2}
              </h1>

              <p className="mt-6 max-w-xl text-base leading-8 text-white/85">{t.heroDesc}</p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={requireLoginAndOpenPlanner}
                  className="rounded-2xl bg-white px-6 py-4 text-base font-bold text-blue-700 shadow-lg shadow-black/10 transition hover:scale-[1.02]"
                >
                  {t.startRecommend}
                </button>

                {currentUser && (
                  <button
                    onClick={handleGoMyTrips}
                    className="rounded-2xl border border-white/30 bg-white/10 px-6 py-4 text-base font-semibold text-white backdrop-blur transition hover:bg-white/20"
                  >
                    {t.viewMyTrips}
                  </button>
                )}
              </div>

              <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
                <div className="rounded-2xl bg-white/12 p-4 backdrop-blur">
                  <p className="text-2xl font-black">AI</p>
                  <p className="mt-1 text-sm text-white/75">
                    {isKo ? '취향 분석' : 'Taste Analysis'}
                  </p>
                </div>

                <div className="rounded-2xl bg-white/12 p-4 backdrop-blur">
                  <p className="text-2xl font-black">{isKo ? '공공' : 'Data'}</p>
                  <p className="mt-1 text-sm text-white/75">
                    {isKo ? '서울 데이터' : 'Seoul Public Data'}
                  </p>
                </div>

                <div className="rounded-2xl bg-white/12 p-4 backdrop-blur">
                  <p className="text-2xl font-black">{isKo ? '날씨' : 'Weather'}</p>
                  <p className="mt-1 text-sm text-white/75">
                    {isKo ? '실시간 반영' : 'Live Context'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
              <div className="w-full max-w-lg rounded-[30px] border border-white/25 bg-white/88 p-5 shadow-2xl shadow-black/10 backdrop-blur sm:p-6">
                <div className="rounded-[24px] bg-slate-50 p-5 sm:p-6">
                  <div className="mb-5 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-blue-600">{t.quickQuestion}</p>
                      <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900">
                        {t.quickInput}
                      </h2>
                    </div>

                    <span className="shrink-0 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                      STEP 1
                    </span>
                  </div>

                  <textarea
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleTextareaKeyDown}
                    className="h-28 w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm leading-6 outline-none ring-0 placeholder:text-slate-400 focus:border-blue-500"
                    placeholder={t.quickPlaceholder}
                  />

                  <div className="mt-4 flex flex-wrap gap-2">
                    {quickTags.map((tag) => {
                      const active = selectedTags.includes(tag)

                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleTag(tag)}
                          className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${
                            active
                              ? 'border-blue-600 bg-blue-600 text-white'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-700'
                          }`}
                        >
                          #{tag}
                        </button>
                      )
                    })}
                  </div>

                  <button
                    onClick={requireLoginAndOpenPlanner}
                    className="mt-6 flex w-full items-center justify-center rounded-2xl bg-blue-600 px-5 py-4 text-base font-bold text-white transition hover:bg-blue-700"
                  >
                    {t.createCourse}
                  </button>

                  {!currentUser ? (
                    <p className="mt-3 text-center text-xs font-medium text-red-400">
                      {t.loginRequired}
                    </p>
                  ) : (
                    <p className="mt-3 text-center text-xs text-slate-400">{t.enterTip}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="theme" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mb-10 text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
              {t.themeSelect}
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              {t.themeTitle}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-600">{t.themeDesc}</p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-5">
            {themes.map((theme) => {
              const active = selectedThemes.includes(theme.key)

              return (
                <button
                  key={theme.key}
                  type="button"
                  onClick={() => toggleTheme(theme.key)}
                  className={`group overflow-hidden rounded-[24px] bg-white text-left shadow-sm ring-1 transition duration-300 hover:-translate-y-1 hover:shadow-xl ${
                    active ? 'ring-blue-500' : 'ring-slate-200'
                  }`}
                >
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <img
                      src={theme.image}
                      alt={theme.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                    {active && (
                      <div className="absolute right-4 top-4 rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white">
                        {isKo ? '선택됨' : 'Selected'}
                      </div>
                    )}

                    <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                      <div className="mb-2 text-2xl">{theme.emoji}</div>
                      <h3 className="text-xl font-extrabold">{theme.title}</h3>
                      <p className="mt-2 text-sm text-white/80">{theme.desc}</p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        {showPlanner && currentUser && (
          <section id="planner" className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
            <div className="rounded-[32px] bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8 lg:p-10">
              <div className="mb-8">
                <div className="mb-3 inline-flex rounded-full bg-blue-100 px-4 py-2 text-sm font-bold text-blue-700">
                  STEP 2
                </div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
                  {t.step2}
                </p>
                <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                  {t.plannerTitle}
                </h2>
                <p className="mt-3 text-slate-600">{t.plannerDesc}</p>
              </div>

              <div className="mb-6 rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
                <p className="text-xs font-semibold text-slate-500">{t.currentTaste}</p>
                <p className="mt-2 break-words text-base font-semibold text-slate-900">
                  {mergedQuery || t.noTaste}
                </p>
              </div>

              <div className="grid gap-6 lg:grid-cols-12">
                <div className="lg:col-span-4">
                  <div className="h-full rounded-[28px] bg-slate-50 p-6 ring-1 ring-slate-200">
                    <p className="text-sm font-bold text-blue-600">{t.travelType}</p>
                    <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
                      {t.travelTypeQuestion}
                    </h3>

                    <div className="mt-6 space-y-3">
                      {travelTypes.map((item) => {
                        const active = travelType === item

                        return (
                          <button
                            key={item}
                            type="button"
                            onClick={() => setTravelType(item)}
                            className={`flex w-full items-center justify-between rounded-2xl border px-5 py-5 text-left transition ${
                              active
                                ? 'border-blue-200 bg-blue-50'
                                : 'border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50/60'
                            }`}
                          >
                            <span className="text-lg font-semibold text-slate-800">{item}</span>
                            <span
                              className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                                active ? 'border-blue-500 bg-blue-500' : 'border-slate-400'
                              }`}
                            >
                              <span
                                className={`h-3 w-3 rounded-full bg-white ${
                                  active ? 'opacity-100' : 'opacity-0'
                                }`}
                              />
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-8">
                  <div className="h-full rounded-[28px] bg-slate-50 p-6 ring-1 ring-slate-200">
                    <div className="flex flex-col gap-8">
                      <div>
                        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                          <div>
                            <p className="text-sm font-bold text-blue-600">{t.duration}</p>
                            <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
                              {t.durationQuestion}
                            </h3>
                          </div>

                          <div className="grid w-full grid-cols-3 rounded-full bg-slate-200 p-1 text-sm font-bold text-slate-600 xl:w-auto xl:min-w-[360px]">
                            {durations.map((item) => {
                              const active = duration === item

                              return (
                                <button
                                  key={item}
                                  type="button"
                                  onClick={() => handleDurationChange(item)}
                                  className={`rounded-full px-5 py-3 transition ${
                                    active
                                      ? 'bg-white text-blue-700 shadow-sm'
                                      : 'text-slate-600 hover:text-slate-900'
                                  }`}
                                >
                                  {item}
                                </button>
                              )
                            })}
                          </div>
                        </div>

                        {(duration === '직접 입력' || duration === 'Custom') && (
                          <div className="mt-4">
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                              {t.customDurationLabel}
                            </label>
                            <input
                              type="text"
                              value={customDuration}
                              onChange={(e) => setCustomDuration(e.target.value)}
                              placeholder={t.customDurationPlaceholder}
                              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none placeholder:text-slate-400 focus:border-blue-500"
                            />
                            <p className="mt-2 text-xs text-slate-500">
                              {isKo
                                ? '자유롭게 입력하면 추천 코스와 숙박 후보 조회 여부에 반영됩니다.'
                                : 'Your custom duration will be used for itinerary and lodging candidate matching.'}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="rounded-[24px] bg-white p-5 ring-1 ring-slate-200">
                        <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                          <div>
                            <p className="text-sm font-bold text-blue-600">{t.budget}</p>
                            <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
                              {t.budgetQuestion}
                            </h3>
                          </div>

                          <div className="text-left md:text-right">
                            <p className="text-xs font-semibold text-slate-500">{t.budgetDaily}</p>
                            <p className="text-3xl font-black text-blue-700 sm:text-4xl">
                              {budget.toLocaleString()}원
                            </p>
                          </div>
                        </div>

                        <input
                          type="range"
                          min="30000"
                          max="1000000"
                          step="10000"
                          value={budget}
                          onChange={(e) => setBudget(Number(e.target.value))}
                          className="w-full accent-blue-600"
                        />

                        <div className="mt-2 flex justify-between text-xs font-semibold text-slate-400">
                          <span>{t.value}</span>
                          <span>{t.premium}</span>
                        </div>

                        <div className="mt-6 grid gap-3 rounded-2xl bg-slate-50 p-4 sm:grid-cols-3">
                          <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                            <p className="text-xs font-semibold text-slate-500">
                              {t.selectedTravelType}
                            </p>
                            <p className="mt-2 text-lg font-bold text-slate-900">{travelType}</p>
                          </div>
                          <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                            <p className="text-xs font-semibold text-slate-500">
                              {t.selectedDuration}
                            </p>
                            <p className="mt-2 text-lg font-bold text-slate-900">
                              {finalDuration || duration}
                            </p>
                          </div>
                          <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                            <p className="text-xs font-semibold text-slate-500">{t.expectedBudget}</p>
                            <p className="mt-2 text-lg font-bold text-slate-900">
                              {budget.toLocaleString()}원
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                        <button
                          type="button"
                          onClick={handleFinalRecommend}
                          disabled={loading}
                          className={`flex-1 rounded-2xl px-6 py-4 text-base font-bold text-white transition ${
                            loading ? 'cursor-not-allowed bg-blue-300' : 'bg-blue-600 hover:bg-blue-700'
                          }`}
                        >
                          {loading ? t.recommending : t.finalRecommend}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowPlanner(false)}
                          className="rounded-2xl border border-slate-300 bg-white px-6 py-4 text-base font-semibold text-slate-700 transition hover:bg-slate-100"
                        >
                          {t.backStep}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {recommendError && (
          <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
            <div className="rounded-[28px] border border-red-200 bg-red-50 p-6">
              <p className="text-lg font-bold text-red-700">{t.recommendationFail}</p>
              <p className="mt-2 text-red-600">{recommendError}</p>
            </div>
          </section>
        )}

        <section id="recommend" className="bg-slate-100/80 py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 text-center">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
                {t.recommendMethod}
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                {t.howItWorks}
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {features.map((feature, idx) => (
                <div
                  key={feature.title}
                  className="rounded-[24px] bg-white p-8 shadow-sm ring-1 ring-slate-200"
                >
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-lg font-black text-blue-700">
                    0{idx + 1}
                  </div>
                  <h3 className="text-xl font-black tracking-tight text-slate-900">
                    {feature.title}
                  </h3>
                  <p className="mt-3 leading-7 text-slate-600">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="overflow-hidden rounded-[32px] bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-10 text-white sm:px-10 lg:px-14 lg:py-14">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-white/70">
                  {t.startNow}
                </p>
                <h2 className="mt-3 whitespace-pre-line text-3xl font-black tracking-tight sm:text-4xl">
                  {t.ctaTitle}
                </h2>
                <p className="mt-4 max-w-2xl text-white/85">{t.ctaDesc}</p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={requireLoginAndOpenPlanner}
                  className="rounded-2xl bg-white px-6 py-4 font-bold text-blue-700 transition hover:scale-[1.02]"
                >
                  {t.startRecommend}
                </button>
                {currentUser && (
                  <button
                    onClick={handleGoMyTrips}
                    className="rounded-2xl border border-white/30 bg-white/10 px-6 py-4 font-semibold text-white backdrop-blur transition hover:bg-white/20"
                  >
                    {t.myTrips}
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="text-lg font-black text-slate-900">{t.appName}</p>
            <p className="mt-1 text-sm text-slate-500">{t.footerDesc}</p>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-slate-500">
            <a href="#" className="hover:text-blue-600">
              {t.privacy}
            </a>
            <a href="#" className="hover:text-blue-600">
              {t.terms}
            </a>
            <a href="#" className="hover:text-blue-600">
              {t.contact}
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}