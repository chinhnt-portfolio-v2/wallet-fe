import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useDarkMode } from '@/hooks/useDarkMode'

function WalletLogo() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="3" fill="currentColor" opacity="0.15" stroke="none"/>
      <rect x="2" y="4" width="20" height="16" rx="3" strokeWidth="1.5"/>
      <circle cx="16" cy="12" r="2" fill="currentColor" stroke="none"/>
      <line x1="2" y1="9" x2="22" y2="9" strokeWidth="1.5" opacity="0.5"/>
    </svg>
  )
}

function DarkModeToggle({ isDark, onToggle }: { isDark: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      aria-label={isDark ? 'Light mode' : 'Dark mode'}
      className="w-8 h-8 flex items-center justify-center rounded-md text-sm text-muted hover:bg-surface-2 transition-colors"
    >
      {isDark ? (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/>
          <line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/>
          <line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
      ) : (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      )}
    </button>
  )
}

function LanguageToggle() {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'

  const toggle = () => {
    const next = isVi ? 'en' : 'vi'
    i18n.changeLanguage(next)
  }

  return (
    <button
      onClick={toggle}
      aria-label={isVi ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
      className="w-8 h-8 flex items-center justify-center rounded-md text-xs font-medium text-muted hover:bg-surface-2 transition-colors"
    >
      {isVi ? 'EN' : 'VI'}
    </button>
  )
}

export function Header() {
  const { isDark, toggle } = useDarkMode()

  return (
    <header className="sticky top-0 z-30 bg-surface/90 backdrop-blur-sm border-b border-border">
      <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between md:max-w-5xl">
        <Link to="/" className="flex items-center gap-2 text-base font-semibold text-primary">
          <WalletLogo />
          <span>Wallet</span>
        </Link>
        <div className="flex items-center gap-1">
          <LanguageToggle />
          <Link
            to="/notifications"
            aria-label="Notifications"
            className="w-8 h-8 flex items-center justify-center rounded-md text-sm text-muted hover:text-primary hover:bg-surface-2 transition-colors relative"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </Link>
          <DarkModeToggle isDark={isDark} onToggle={toggle} />
          <Link
            to="/profile"
            aria-label="Settings"
            className="w-8 h-8 flex items-center justify-center rounded-md text-sm text-muted hover:text-primary hover:bg-surface-2 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="8" r="4"/>
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
            </svg>
          </Link>
        </div>
      </div>
    </header>
  )
}
