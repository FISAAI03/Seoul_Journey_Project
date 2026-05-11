import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext'
import LanguageToggle from '../components/LanguageToggle'

export default function SignupPage() {
  const navigate = useNavigate()
  const { language, t } = useLanguage()
  const isKo = language === 'ko'

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const signupText = {
    ko: {
      sideBadge: 'Seoul Like Local',
      sideTitleLine1: '회원가입하고',
      sideTitleLine2: '나만의 서울을',
      sideTitleLine3: '시작하세요',
      sideDesc:
        '취향 기반 서울 로컬 관광 추천, 일정 저장, 맞춤형 여행 코스 기능을 이용하려면 먼저 가입해주세요.',
      featureAi: 'AI',
      featureAiDesc: '취향 분석',
      featureSave: '저장',
      featureSaveDesc: '일정 관리',
      featureRecommend: '추천',
      featureRecommendDesc: '맞춤 코스',

      backMain: '← 메인으로 돌아가기',
      title: '회원가입',
      desc: '기본 정보를 입력해 계정을 생성하세요.',

      name: '이름',
      namePlaceholder: '이름을 입력하세요',
      email: '이메일',
      emailPlaceholder: 'example@email.com',
      password: '비밀번호',
      passwordPlaceholder: '8자 이상 입력하세요',
      confirmPassword: '비밀번호 확인',
      confirmPasswordPlaceholder: '비밀번호를 다시 입력하세요',

      emptyError: '모든 항목을 입력해주세요.',
      passwordLengthError: '비밀번호는 8자 이상이어야 합니다.',
      passwordMismatchError: '비밀번호 확인이 일치하지 않습니다.',
      defaultError: '회원가입 중 오류가 발생했습니다.',
      serverError: '서버 연결에 실패했습니다.',
      success: '회원가입이 완료되었습니다.',

      loading: '가입 중...',
      submit: '회원가입',

      hasAccount: '이미 계정이 있으신가요?',
      login: '로그인',
    },

    en: {
      sideBadge: 'Seoul Like Local',
      sideTitleLine1: 'Create an account',
      sideTitleLine2: 'and start',
      sideTitleLine3: 'your Seoul journey',
      sideDesc:
        'Sign up to get personalized Seoul local itineraries, save your trips, and manage AI-powered travel plans.',
      featureAi: 'AI',
      featureAiDesc: 'Taste analysis',
      featureSave: 'Save',
      featureSaveDesc: 'Trip management',
      featureRecommend: 'Plan',
      featureRecommendDesc: 'Personalized routes',

      backMain: '← Back to main',
      title: 'Sign up',
      desc: 'Enter your basic information to create an account.',

      name: 'Name',
      namePlaceholder: 'Enter your name',
      email: 'Email',
      emailPlaceholder: 'example@email.com',
      password: 'Password',
      passwordPlaceholder: 'Enter at least 8 characters',
      confirmPassword: 'Confirm password',
      confirmPasswordPlaceholder: 'Enter your password again',

      emptyError: 'Please fill in all fields.',
      passwordLengthError: 'Password must be at least 8 characters.',
      passwordMismatchError: 'Passwords do not match.',
      defaultError: 'An error occurred during sign-up.',
      serverError: 'Failed to connect to the server.',
      success: 'Your account has been created.',

      loading: 'Signing up...',
      submit: 'Sign up',

      hasAccount: 'Already have an account?',
      login: 'Log in',
    },
  }

  const txt = signupText[language] || signupText.ko

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

    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      setError(txt.emptyError)
      return
    }

    if (form.password.length < 8) {
      setError(txt.passwordLengthError)
      return
    }

    if (form.password !== form.confirmPassword) {
      setError(txt.passwordMismatchError)
      return
    }

    try {
      setLoading(true)

      const apiBase = import.meta.env.VITE_API_BASE_URL || ''
      const response = await fetch(`${apiBase}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || txt.defaultError)
        return
      }

      setMessage(data.message || txt.success)

      setTimeout(() => {
        navigate('/login')
      }, 1200)
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
                <br />
                {txt.sideTitleLine3}
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
                <p className="text-xl font-black">{txt.featureSave}</p>
                <p className="mt-1 text-sm text-white/80">{txt.featureSaveDesc}</p>
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
                    <p className="text-lg font-black text-blue-700">
                      {t.appName || 'Seoul Like Local'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {t.appSubtitle ||
                        (isKo
                          ? 'AI 기반 서울 맞춤 로컬 관광 추천'
                          : 'AI-powered local Seoul travel planner')}
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
                    {txt.name}
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder={txt.namePlaceholder}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    {txt.email}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder={txt.emailPlaceholder}
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

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    {txt.confirmPassword}
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder={txt.confirmPasswordPlaceholder}
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
                {txt.hasAccount}{' '}
                <Link
                  to="/login"
                  className="font-semibold text-blue-600 hover:text-blue-700"
                >
                  {txt.login}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}