import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Pill } from '@/design-system'

const ROUTE_CRUMBS: Record<string, [string, string]> = {
  '/': ['Overview', 'Dashboard'],
  '/transactions': ['Overview', 'Transactions'],
  '/add': ['Overview', 'Log expense'],
  '/wallets': ['Money', 'Wallets'],
  '/wallets/transfer': ['Money', 'Transfer'],
  '/budgets': ['Money', 'Budgets'],
  '/debts': ['Money', 'Debts'],
  '/wishlist': ['Money', 'Savings'],
  '/categories': ['Account', 'Categories'],
  '/recurring': ['Account', 'Recurring'],
  '/profile': ['Account', 'Settings'],
  '/notifications': ['Account', 'Notifications'],
  '/export': ['Account', 'Export'],
}

function getCrumbs(pathname: string): [string, string] {
  if (ROUTE_CRUMBS[pathname]) return ROUTE_CRUMBS[pathname]
  // longest-prefix match for dynamic routes (e.g. /debts/:id)
  const match = Object.keys(ROUTE_CRUMBS)
    .filter((p) => p !== '/' && pathname.startsWith(p))
    .sort((a, b) => b.length - a.length)[0]
  return match ? ROUTE_CRUMBS[match] : ['Overview', 'Dashboard']
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

function SearchBox() {
  return (
    <div className="hidden md:flex items-center gap-2 px-3 h-[34px] rounded-md min-w-[220px] bg-surface border border-border text-muted">
      <svg width={13} height={13} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
        <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <input
        placeholder="Search transactions, wallets…"
        className="flex-1 bg-transparent border-0 text-primary font-sans text-xs outline-none min-w-0"
      />
      <span className="font-mono text-[10px] text-faint px-1.5 py-0.5 border border-border-hi rounded">
        ⌘K
      </span>
    </div>
  )
}

export function Header() {
  const location = useLocation()
  const [section, page] = getCrumbs(location.pathname)

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

      <SearchBox />

      <Pill accent onClick={() => (window.location.href = '/add')}>
        + Log expense
      </Pill>

      <div className="flex items-center gap-1">
        <LanguageToggle />
        <Link
          to="/notifications"
          aria-label="Notifications"
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
