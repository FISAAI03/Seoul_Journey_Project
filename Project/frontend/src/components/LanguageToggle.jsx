import { useLanguage } from '../i18n/LanguageContext'

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage()

  return (
    <div className="flex items-center rounded-full border border-slate-200 bg-white p-1 shadow-sm">
      <button
        type="button"
        onClick={() => setLanguage('ko')}
        className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
          language === 'ko'
            ? 'bg-blue-600 text-white'
            : 'text-slate-500 hover:bg-slate-100'
        }`}
      >
        KO
      </button>

      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
          language === 'en'
            ? 'bg-blue-600 text-white'
            : 'text-slate-500 hover:bg-slate-100'
        }`}
      >
        EN
      </button>
    </div>
  )
}