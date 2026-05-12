import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext'
import LanguageToggle from '../components/LanguageToggle'

export default function MyTripsPage() {
  const navigate = useNavigate()
  const { language } = useLanguage()
  const isKo = language === 'ko'
  const logoText = 'Seoul Life Travel'

  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const handleLogoClick = () => {
    navigate('/')

    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    }, 50)
  }

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

  const copy = useMemo(
    () => ({
      ko: {
        pageSubtitle: '내 여행 보관함',
        main: '메인으로',
        heroBadge: 'My Trips',
        heroTitle: '내 여행 보관함',
        heroDesc:
          '지금까지 추천받은 서울 코스를 다시 확인하고, 마음에 드는 여행을 다시 열어볼 수 있어요.',
        loginRequired: '로그인이 필요합니다.',
        invalidLogin: '로그인 정보가 올바르지 않습니다. 다시 로그인해주세요.',
        invalidUser: '사용자 정보가 올바르지 않습니다. 다시 로그인해주세요.',
        invalidResponse: '서버 응답 형식이 올바르지 않습니다.',
        loadFailDefault: '보관함을 불러오지 못했습니다.',
        loadError: '보관함 조회 중 오류가 발생했습니다.',
        loadingTitle: '보관함을 불러오는 중입니다...',
        loadingDesc: '저장된 추천 코스를 정리하고 있어요.',
        failTitle: '불러오기 실패',
        backMain: '메인으로 돌아가기',
        emptyTitle: '아직 저장된 여행이 없습니다.',
        emptyDesc: '메인 페이지에서 코스를 추천받으면 이곳에 저장됩니다.',
        goRecommend: '추천받으러 가기',
        savedTrip: 'Saved Trip',
        defaultTitle: '서울 추천 코스',
        travelType: '여행 유형',
        duration: '일정',
        budget: '예산',
        createdAt: '생성일',
        tasteInput: '취향 입력',
        detail: '상세 보기 →',
        remix: 'AI 재구성',
        won: '원',
      },
      en: {
        pageSubtitle: 'My Trips',
        main: 'Main',
        heroBadge: 'My Trips',
        heroTitle: 'My saved trips',
        heroDesc:
          'Review your saved Seoul itineraries and reopen your favorite recommendations anytime.',
        loginRequired: 'Please log in first.',
        invalidLogin: 'Your login information is invalid. Please log in again.',
        invalidUser: 'Your user information is invalid. Please log in again.',
        invalidResponse: 'The server response format is invalid.',
        loadFailDefault: 'Failed to load your trip library.',
        loadError: 'An error occurred while loading your trip library.',
        loadingTitle: 'Loading your trip library...',
        loadingDesc: 'Organizing your saved AI itineraries.',
        failTitle: 'Failed to load',
        backMain: 'Back to main',
        emptyTitle: 'No saved trips yet.',
        emptyDesc: 'Create an itinerary on the main page and it will be saved here.',
        goRecommend: 'Get a recommendation',
        savedTrip: 'Saved Trip',
        defaultTitle: 'Recommended Seoul Itinerary',
        travelType: 'Travel type',
        duration: 'Duration',
        budget: 'Budget',
        createdAt: 'Created at',
        tasteInput: 'Preference input',
        detail: 'View detail →',
        remix: 'AI Remix',
        won: 'KRW',
      },
    }),
    [],
  )

  const txt = copy[language] || copy.ko

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        setLoading(true)
        setError('')

        const user = localStorage.getItem('user')

        if (!user) {
          alert(txt.loginRequired)
          navigate('/login')
          return
        }

        let parsedUser

        try {
          parsedUser = JSON.parse(user)
        } catch (parseError) {
          console.error('user parse error:', parseError)
          localStorage.removeItem('user')
          alert(txt.invalidLogin)
          navigate('/login')
          return
        }

        if (!parsedUser?.id) {
          localStorage.removeItem('user')
          alert(txt.invalidUser)
          navigate('/login')
          return
        }

        const apiBase = getApiBase()
        const res = await fetch(`${apiBase}/api/trips/${parsedUser.id}`)
        const data = await parseJsonResponse(res)

        if (!res.ok || !data.success) {
          throw new Error(data.message || data.error || txt.loadFailDefault)
        }

        setTrips(Array.isArray(data.trips) ? data.trips : [])
      } catch (err) {
        console.error('MyTripsPage error:', err)
        setError(err.message || txt.loadError)
      } finally {
        setLoading(false)
      }
    }

    fetchTrips()
  }, [navigate, txt])

  const handleOpenDetail = (tripId) => {
    navigate(`/trip/${tripId}`)
  }

  const handleOpenRemix = (e, tripId) => {
    e.stopPropagation()
    navigate(`/trip/${tripId}/refine`)
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={handleLogoClick}
            className="group text-left"
            aria-label="Go to home"
          >
            <p className="text-xl font-black tracking-tight text-blue-700 transition group-hover:text-blue-800">
              {logoText}
            </p>
            <p className="text-xs text-slate-500">{txt.pageSubtitle}</p>
          </button>

          <div className="flex items-center gap-3">
            <LanguageToggle />

            <button
              onClick={() => navigate('/')}
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              {txt.main}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="mb-8">
          <div className="rounded-[32px] bg-gradient-to-r from-blue-600 via-indigo-600 to-pink-500 px-6 py-10 text-white sm:px-10">
            <p className="inline-flex rounded-full bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur">
              {txt.heroBadge}
            </p>

            <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
              {txt.heroTitle}
            </h1>

            <p className="mt-3 max-w-2xl text-white/85">{txt.heroDesc}</p>
          </div>
        </section>

        {loading && (
          <div className="rounded-[28px] bg-white p-8 shadow-sm ring-1 ring-slate-200">
            <p className="text-lg font-bold text-slate-900">{txt.loadingTitle}</p>
            <p className="mt-2 text-slate-600">{txt.loadingDesc}</p>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-[28px] border border-red-200 bg-red-50 p-6">
            <p className="text-lg font-bold text-red-700">{txt.failTitle}</p>
            <p className="mt-2 text-red-600">{error}</p>

            <button
              onClick={() => navigate('/')}
              className="mt-5 rounded-2xl bg-blue-600 px-6 py-3 font-bold text-white transition hover:bg-blue-700"
            >
              {txt.backMain}
            </button>
          </div>
        )}

        {!loading && !error && trips.length === 0 && (
          <div className="rounded-[28px] bg-white p-8 shadow-sm ring-1 ring-slate-200">
            <p className="text-lg font-bold text-slate-900">{txt.emptyTitle}</p>
            <p className="mt-2 text-slate-600">{txt.emptyDesc}</p>

            <button
              onClick={() => navigate('/')}
              className="mt-6 rounded-2xl bg-blue-600 px-6 py-4 font-bold text-white transition hover:bg-blue-700"
            >
              {txt.goRecommend}
            </button>
          </div>
        )}

        {!loading && !error && trips.length > 0 && (
          <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {trips.map((trip) => (
              <article
                key={trip.id}
                onClick={() => handleOpenDetail(trip.id)}
                className="cursor-pointer overflow-hidden rounded-[28px] bg-white p-6 text-left shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
                      {txt.savedTrip}
                    </p>

                    <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-900">
                      {trip.title || txt.defaultTitle}
                    </h2>
                  </div>

                  <div className="rounded-2xl bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700">
                    #{trip.id}
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                    <p className="text-xs font-semibold text-slate-500">{txt.travelType}</p>
                    <p className="mt-2 text-sm font-bold text-slate-900">
                      {trip.travel_type || '-'}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                    <p className="text-xs font-semibold text-slate-500">{txt.duration}</p>
                    <p className="mt-2 text-sm font-bold text-slate-900">
                      {trip.duration || '-'}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                    <p className="text-xs font-semibold text-slate-500">{txt.budget}</p>
                    <p className="mt-2 text-sm font-bold text-slate-900">
                      {Number(trip.budget || 0).toLocaleString()} {txt.won}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                    <p className="text-xs font-semibold text-slate-500">{txt.createdAt}</p>
                    <p className="mt-2 text-sm font-bold text-slate-900">
                      {trip.created_at || '-'}
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4">
                  <p className="text-xs font-semibold text-slate-500">{txt.tasteInput}</p>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-700">
                    {trip.query_text || trip.merged_query || '-'}
                  </p>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenDetail(trip.id)}
                    className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
                  >
                    {txt.detail}
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleOpenRemix(e, trip.id)}
                    className="inline-flex items-center rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700 ring-1 ring-blue-100 transition hover:bg-blue-100"
                  >
                    {txt.remix}
                  </button>
                </div>
              </article>
            ))}
          </section>
        )}
      </main>
    </div>
  )
}