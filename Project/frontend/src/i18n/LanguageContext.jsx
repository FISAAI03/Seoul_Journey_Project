import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const LanguageContext = createContext(null)

const translations = {
  ko: {
    appName: 'Seoul Like Local',
    appSubtitle: 'AI 기반 서울 맞춤 로컬 관광 추천',

    serviceIntro: '서비스 소개',
    themeSelect: '취향 선택',
    recommendMethod: '추천 방식',

    login: '로그인',
    signup: '회원가입',
    logout: '로그아웃',
    myTrips: '내 여행 보관함',
    welcome: '환영합니다',

    heroBadge: '외국인을 위한 서울 일상관광 AI 서비스',
    heroTitleLine1: '취향으로 찾는',
    heroTitleLine2: '진짜 서울 여행',
    heroDesc:
      '서울 관광·문화·쇼핑·가격 데이터를 기반으로 날씨와 예산까지 반영해 나에게 맞는 서울 코스를 추천합니다.',

    startRecommend: '지금 추천받기',
    viewMyTrips: '내 여행 보관함 보기',

    quickQuestion: '오늘 서울을 어떻게 보내고 싶나요?',
    quickInput: '빠른 취향 입력',
    quickPlaceholder:
      '예: 명동에서 쇼핑하고 밥 먹고 싶어 / 성수 감성 카페와 소품샵 / 비 오는 날 실내 전시 코스',
    createCourse: 'AI 추천 코스 생성하기',
    loginRequired: '추천 기능은 로그인 후 이용할 수 있습니다.',
    enterTip: 'Enter를 누르면 다음 단계로 넘어갑니다. 줄바꿈은 Shift + Enter',

    themeTitle: '원하는 서울의 분위기를 골라보세요',
    themeDesc:
      '선택한 테마는 서울 공공데이터 후보 조회와 AI 추천 프롬프트에 함께 반영됩니다.',

    step2: '추가 정보 입력',
    plannerTitle: '여행 스타일과 예산을 한 번에 설정하세요',
    plannerDesc:
      '먼저 입력한 취향을 바탕으로, 서울 공공데이터 후보 조회 정확도를 높이기 위한 조건을 입력합니다.',

    currentTaste: '현재 입력된 취향',
    noTaste: '입력된 취향이 없습니다.',

    travelType: '여행 유형',
    travelTypeQuestion: '누구와 함께하시나요?',
    duration: '여행 기간',
    durationQuestion: '일정은 얼마나 되나요?',
    customDurationLabel: '원하는 일정을 직접 입력해주세요',
    customDurationPlaceholder: '예: 반나절, 2박 3일, 저녁 6시~밤 10시',

    budget: '예산 설정',
    budgetQuestion: '하루 예산은 어느 정도인가요?',
    budgetDaily: '예상 일일 기준',
    value: '가성비',
    premium: '프리미엄',

    selectedTravelType: '선택된 여행 유형',
    selectedDuration: '선택된 일정',
    expectedBudget: '예상 예산',

    finalRecommend: '최종 추천 받기',
    recommending: 'AI가 코스를 설계 중입니다...',
    backStep: '이전 단계로',

    recommendationFail: '추천 생성 실패',

    howItWorks: '이렇게 추천이 만들어집니다',

    startNow: '지금 바로 시작',
    ctaTitle: '관광지가 아닌,\n데이터 기반 서울 코스를 추천받아보세요.',
    ctaDesc:
      '빠른 취향 입력 후 추가 조건을 보완하면, 서울 공공데이터와 날씨를 함께 반영한 코스가 생성됩니다.',

    footerDesc: 'AI 기반 외국인 맞춤형 서울 일상관광 추천 플랫폼',
    privacy: '개인정보처리방침',
    terms: '이용약관',
    contact: '문의하기',

    alerts: {
      loginRequired: '로그인이 필요합니다.',
      needTaste: '먼저 빠른 취향 입력 또는 태그/테마를 선택해주세요.',
      needCustomDuration: '직접 입력한 일정을 작성해주세요.',
      logout: '로그아웃되었습니다.',
      recommendFail: '추천 생성 중 오류가 발생했습니다.',
    },
  },

  en: {
    appName: 'Seoul Like Local',
    appSubtitle: 'AI-powered local Seoul travel planner',

    serviceIntro: 'About',
    themeSelect: 'Themes',
    recommendMethod: 'How it works',

    login: 'Log in',
    signup: 'Sign up',
    logout: 'Log out',
    myTrips: 'My Trips',
    welcome: 'Welcome',

    heroBadge: 'AI Seoul local travel service for international visitors',
    heroTitleLine1: 'Discover Seoul',
    heroTitleLine2: 'through your taste',
    heroDesc:
      'Get a personalized Seoul itinerary based on public tourism, culture, shopping, price data, weather, and your budget.',

    startRecommend: 'Start planning',
    viewMyTrips: 'View My Trips',

    quickQuestion: 'How would you like to spend your day in Seoul?',
    quickInput: 'Quick preference input',
    quickPlaceholder:
      'Example: I want to shop and eat in Myeongdong / Seongsu cafes and lifestyle shops / Indoor exhibition route for a rainy day',
    createCourse: 'Create AI itinerary',
    loginRequired: 'Please log in to use recommendations.',
    enterTip: 'Press Enter to continue. Use Shift + Enter for a new line.',

    themeTitle: 'Choose the Seoul vibe you want',
    themeDesc:
      'Selected themes will be used for public data search and AI itinerary generation.',

    step2: 'Additional details',
    plannerTitle: 'Set your travel style and budget',
    plannerDesc:
      'Add a few details to improve Seoul public data matching and AI recommendation accuracy.',

    currentTaste: 'Current preference',
    noTaste: 'No preference entered yet.',

    travelType: 'Travel type',
    travelTypeQuestion: 'Who are you traveling with?',
    duration: 'Trip duration',
    durationQuestion: 'How long is your trip?',
    customDurationLabel: 'Enter your preferred duration',
    customDurationPlaceholder: 'Example: Half day, 2 nights 3 days, 6 PM to 10 PM',

    budget: 'Budget',
    budgetQuestion: 'What is your daily budget?',
    budgetDaily: 'Estimated daily budget',
    value: 'Value',
    premium: 'Premium',

    selectedTravelType: 'Selected travel type',
    selectedDuration: 'Selected duration',
    expectedBudget: 'Expected budget',

    finalRecommend: 'Get final recommendation',
    recommending: 'AI is designing your itinerary...',
    backStep: 'Back',

    recommendationFail: 'Recommendation failed',

    howItWorks: 'How your itinerary is created',

    startNow: 'Start now',
    ctaTitle: 'Get a data-based Seoul itinerary,\nnot just a tourist spot list.',
    ctaDesc:
      'Enter your preferences, add conditions, and receive an itinerary powered by Seoul public data and weather.',

    footerDesc:
      'AI-powered Seoul local travel recommendation platform for international visitors',
    privacy: 'Privacy Policy',
    terms: 'Terms of Service',
    contact: 'Contact',

    alerts: {
      loginRequired: 'Please log in first.',
      needTaste: 'Please enter your preference or select at least one tag/theme first.',
      needCustomDuration: 'Please enter your custom duration.',
      logout: 'You have been logged out.',
      recommendFail: 'An error occurred while generating the recommendation.',
    },
  },
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'ko'
  })

  useEffect(() => {
    localStorage.setItem('language', language)
    document.documentElement.lang = language
  }, [language])

  const value = useMemo(() => {
    const t = translations[language] || translations.ko

    return {
      language,
      setLanguage,
      t,
      isKo: language === 'ko',
      isEn: language === 'en',
    }
  }, [language])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)

  if (!context) {
    throw new Error('useLanguage must be used inside LanguageProvider')
  }

  return context
}