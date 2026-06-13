import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Pill } from '@/design-system'

// Maps each route to a [section, page] pair of i18n nav keys (resolved via t()).
const ROUTE_CRUMBS: Record<string, [string, string]> = {
  '/': ['nav.overview', 'nav.dashboard'],
  '/transactions': ['nav.overview', 'nav.transactions'],
  '/add': ['nav.overview', 'nav.logExpense'],
  '/wallets': ['nav.money', 'nav.wallets'],
  '/wallets/transfer': ['nav.money', 'nav.transfer'],
  '/budgets': ['nav.money', 'nav.budgets'],
  '/debts': ['nav.money', 'nav.debts'],
  '/wishlist': ['nav.money', 'nav.wishlist'],
  '/categories': ['nav.account', 'nav.categories'],
  '/recurring': ['nav.account', 'nav.recurring'],
  '/profile': ['nav.account', 'nav.profile'],
  '/notifications': ['nav.account', 'nav.notifications'],
  '/export': ['nav.account', 'nav.export'],
}

function getCrumbKeys(pathname: string): [string, string] {
  if (ROUTE_CRUMBS[pathname]) return ROUTE_CRUMBS[pathname]
  // longest-prefix match for dynamic routes (e.g. /debts/:id)
  const match = Object.keys(ROUTE_CRUMBS)
    .filter((p) => p !== '/' && pathname.startsWith(p))
    .sort((a, b) => b.length - a.length)[0]
  return match ? ROUTE_CRUMBS[match] : ['nav.overview', 'nav.dashboard']
}

function LanguageToggle() {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'

  return (
    <button
      onClick={() => i18n.changeLanguage(isVi ? 'en' : 'vi')}
      aria-label={isVi ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
      className="h-7 px-2.5 rounded-md font-mono text-[10px] uppercase tracking-widest text-muted hover:text-primary hover:bg-surface-2 transition-colors"
    >
      {isVi ? 'EN' : 'VI'}
    </button>
  )
}

export function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [sectionKey, pageKey] = getCrumbKeys(location.pathname)
  const section = t(sectionKey)
  const page = t(pageKey)

  return (
    <header
      className="sticky top-0 z-30 border-b border-border h-14 flex items-center px-4 md:px-6 gap-4"
      style={{ background: 'var(--color-bg)' }}
    >
      {/* Mobile brand */}
      <Link to="/" className="md:hidden flex items-center gap-2 font-display italic text-lg text-primary">
        <span className="w-6 h-6 rounded bg-accent text-accent-ink font-mono text-sm flex items-center justify-center">◇</span>
        ledger
      </Link>

      {/* Breadcrumb */}
      <div className="hidden md:flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest">
        <span className="text-faint">{section}</span>
        <span className="text-faint">/</span>
        <span className="text-secondary">{page}</span>
      </div>

      <div className="flex-1" />

      {/* F14: SPA navigation instead of a full page reload. */}
      <Pill accent onClick={() => navigate('/add')}>
        + {t('nav.logExpense')}
      </Pill>

      <div className="flex items-center gap-1">
        <LanguageToggle />
        <Link
          to="/notifications"
          aria-label={t('nav.notifications')}
          className="w-8 h-8 flex items-center justify-center rounded-md text-muted hover:text-primary hover:bg-surface-2 transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </Link>
      </div>
    </header>
  )
}
