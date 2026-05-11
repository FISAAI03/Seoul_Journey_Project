import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext'
import LanguageToggle from '../components/LanguageToggle'

export default function LoginPage() {
  const navigate = useNavigate()
  const { language, t } = useLanguage()
  const isKo = language === 'ko'

  const [form, setForm] = useState({
    email: '',
    password: '',
  })

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const loginText = {
    ko: {
      sideBadge: 'Seoul Like Local',
      sideTitleLine1: '다시 오신 걸',
      sideTitleLine2: '환영합니다',
      sideDesc:
        '로그인 후 맞춤형 서울 여행 추천, 일정 저장, 개인화된 추천 결과를 이용해보세요.',
      featureAi: 'AI',
      featureAiDesc: '취향 분석',
      featureTrip: '일정',
      featureTripDesc: '저장 관리',
      featureRecommend: '추천',
      featureRecommendDesc: '맞춤 코스',
      backMain: '← 메인으로 돌아가기',
      title: '로그인',
      desc: '가입한 이메일과 비밀번호를 입력해주세요.',
      email: '이메일',
      password: '비밀번호',
      passwordPlaceholder: '비밀번호를 입력하세요',
      emptyError: '이메일과 비밀번호를 입력해주세요.',
      defaultError: '로그인 중 오류가 발생했습니다.',
      serverError: '서버 연결에 실패했습니다.',
      success: '로그인에 성공했습니다.',
      loading: '로그인 중...',
      submit: '로그인',
      noAccount: '아직 계정이 없으신가요?',
      signup: '회원가입',
    },
    en: {
      sideBadge: 'Seoul Like Local',
      sideTitleLine1: 'Welcome',
      sideTitleLine2: 'back',
      sideDesc:
        'Log in to get personalized Seoul itineraries, save trips, and manage your AI recommendations.',
      featureAi: 'AI',
      featureAiDesc: 'Taste analysis',
      featureTrip: 'Trips',
      featureTripDesc: 'Save & manage',
      featureRecommend: 'Plan',
      featureRecommendDesc: 'Personalized routes',
      backMain: '← Back to main',
      title: 'Log in',
      desc: 'Enter your email and password to continue.',
      email: 'Email',
      password: 'Password',
      passwordPlaceholder: 'Enter your password',
      emptyError: 'Please enter your email and password.',
      defaultError: 'An error occurred while logging in.',
      serverError: 'Failed to connect to the server.',
      success: 'Successfully logged in.',
      loading: 'Logging in...',
      submit: 'Log in',
      noAccount: "Don't have an account?",
      signup: 'Sign up',
    },
  }

  const txt = loginText[language] || loginText.ko

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (!form.email || !form.password) {
      setError(txt.emptyError)
      return
    }

    try {
      setLoading(true)

      const apiBase = import.meta.env.VITE_API_BASE_URL || ''
      const response = await fetch(`${apiBase}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || txt.defaultError)
        return
      }

      localStorage.setItem('user', JSON.stringify(data.user))
      setMessage(data.message || txt.success)

      setTimeout(() => {
        navigate('/')
      }, 800)
    } catch (err) {
      setError(txt.serverError)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full max-w-6xl overflow-hidden rounded-[32px] bg-white shadow-xl ring-1 ring-slate-200 lg:grid-cols-2">
          <div className="hidden flex-col justify-between bg-gradient-to-br from-blue-600 via-indigo-600 to-pink-500 p-10 text-white lg:flex">
            <div>
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-white/70">
                  {txt.sideBadge}
                </p>
                <div className="rounded-full bg-white/95 p-1">
                  <LanguageToggle />
                </div>
              </div>

              <h1 className="mt-6 text-5xl font-black leading-tight">
                {txt.sideTitleLine1}
                <br />
                {txt.sideTitleLine2}
              </h1>

              <p className="mt-6 max-w-md text-white/85">
                {txt.sideDesc}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                <p className="text-xl font-black">{txt.featureAi}</p>
                <p className="mt-1 text-sm text-white/80">{txt.featureAiDesc}</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                <p className="text-xl font-black">{txt.featureTrip}</p>
                <p className="mt-1 text-sm text-white/80">{txt.featureTripDesc}</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                <p className="text-xl font-black">{txt.featureRecommend}</p>
                <p className="mt-1 text-sm text-white/80">{txt.featureRecommendDesc}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center p-6 sm:p-10">
            <div className="w-full max-w-md">
              <div className="mb-8">
                <div className="mb-5 flex items-center justify-between gap-3 lg:hidden">
                  <div>
                    <p className="text-lg font-black text-blue-700">{t.appName || 'Seoul Like Local'}</p>
                    <p className="text-xs text-slate-500">
                      {t.appSubtitle || (isKo ? 'AI 기반 서울 맞춤 로컬 관광 추천' : 'AI-powered local Seoul travel planner')}
                    </p>
                  </div>
                  <LanguageToggle />
                </div>

                <Link
                  to="/"
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                >
                  {txt.backMain}
                </Link>

                <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-900">
                  {txt.title}
                </h2>

                <p className="mt-2 text-slate-500">
                  {txt.desc}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    {txt.email}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="example@email.com"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    {txt.password}
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder={txt.passwordPlaceholder}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-blue-500"
                  />
                </div>

                {error && (
                  <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                    {error}
                  </div>
                )}

                {message && (
                  <div className="rounded-2xl bg-green-50 px-4 py-3 text-sm font-medium text-green-600">
                    {message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-2xl bg-blue-600 px-4 py-3 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                >
                  {loading ? txt.loading : txt.submit}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-500">
                {txt.noAccount}{' '}
                <Link
                  to="/signup"
                  className="font-semibold text-blue-600 hover:text-blue-700"
                >
                  {txt.signup}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}