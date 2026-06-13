import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Wallet, Bell, Plus, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

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
      className="h-7 px-2.5 rounded-md text-[10px] font-bold uppercase tracking-widest text-muted hover:text-ink hover:bg-hover transition-colors"
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
      className="sticky top-0 z-30 border-b border-line h-14 flex items-center px-4 md:px-6 gap-4"
      style={{ background: 'var(--surface)' }}
    >
      {/* Mobile brand — wallet icon + "Ví" badge */}
      <Link
        to="/"
        className={cn(
          'md:hidden flex items-center gap-2 text-ink font-extrabold text-base tracking-tight'
        )}
        aria-label="Ví — trang chủ"
      >
        <span className="w-7 h-7 rounded-md bg-primary text-primary-ink flex items-center justify-center">
          <Wallet className="w-4 h-4" aria-hidden="true" />
        </span>
        <span>Ví</span>
      </Link>

      {/* Desktop breadcrumb */}
      <div className="hidden md:flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.07em]">
        <span className="text-muted">{section}</span>
        <span className="text-muted">/</span>
        <span className="text-sub">{page}</span>
      </div>

      <div className="flex-1" />

      {/* Desktop search field */}
      <div className="hidden md:flex items-center gap-2 h-8 px-3 rounded-md border border-line bg-surface-2 text-muted text-xs w-48 cursor-text">
        <Search className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        <span className="flex-1 select-none">{t('common.search', 'Tìm kiếm…')}</span>
      </div>

      {/* Desktop notifications bell */}
      <Link
        to="/notifications"
        aria-label={t('nav.notifications')}
        className="hidden md:flex relative w-8 h-8 items-center justify-center rounded-md text-muted hover:text-ink hover:bg-hover transition-colors"
      >
        <Bell className="w-4 h-4" aria-hidden="true" />
        {/* Unread dot — always shown as visual indicator; real unread count in P06 */}
        <span
          className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary"
          aria-hidden="true"
        />
      </Link>

      {/* Desktop "+ Thêm giao dịch" button */}
      <button
        onClick={() => navigate('/add')}
        className="hidden md:inline-flex items-center gap-1.5 h-8 px-3 rounded-md bg-primary text-primary-ink text-xs font-semibold hover:bg-primary-hover transition-colors shadow-button"
      >
        <Plus className="w-3.5 h-3.5" aria-hidden="true" />
        {t('nav.logExpense')}
      </button>

      {/* Mobile: lang toggle + bell */}
      <div className="flex items-center gap-1 md:hidden">
        <LanguageToggle />
        <Link
          to="/notifications"
          aria-label={t('nav.notifications')}
          className="w-8 h-8 flex items-center justify-center rounded-md text-muted hover:text-ink hover:bg-hover transition-colors"
        >
          <Bell className="w-4 h-4" aria-hidden="true" />
        </Link>
      </div>

      {/* Desktop lang toggle */}
      <div className="hidden md:block">
        <LanguageToggle />
      </div>
    </header>
  )
}
