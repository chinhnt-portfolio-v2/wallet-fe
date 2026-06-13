import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Wallet } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUser } from '@/hooks/useUser'
import { APP_VERSION, APP_TAGLINE } from '@/lib/app-meta'
import {
  IconDashboard,
  IconTransactions,
  IconStats,
  IconWallets,
  IconBudgets,
  IconDebts,
  IconWishlist,
  IconCategories,
  IconRecurring,
  IconProfile,
} from '@/components/layout/nav-icons'
import type { ComponentType } from 'react'

interface NavItem {
  href: string
  labelKey: string
  Icon: ComponentType
  warn?: boolean
}

const NAV_SECTIONS: { sectionKey: string; items: NavItem[] }[] = [
  {
    sectionKey: 'nav.overview',
    items: [
      { href: '/', labelKey: 'nav.dashboard', Icon: IconDashboard },
      { href: '/transactions', labelKey: 'nav.transactions', Icon: IconTransactions },
      { href: '/stats', labelKey: 'nav.stats', Icon: IconStats },
    ],
  },
  {
    sectionKey: 'nav.money',
    items: [
      { href: '/wallets', labelKey: 'nav.wallets', Icon: IconWallets },
      { href: '/budgets', labelKey: 'nav.budgets', Icon: IconBudgets },
      { href: '/debts', labelKey: 'nav.debts', Icon: IconDebts, warn: true },
      { href: '/wishlist', labelKey: 'nav.wishlist', Icon: IconWishlist },
    ],
  },
  {
    sectionKey: 'nav.account',
    items: [
      { href: '/categories', labelKey: 'nav.categories', Icon: IconCategories },
      { href: '/recurring', labelKey: 'nav.recurring', Icon: IconRecurring },
      { href: '/profile', labelKey: 'nav.profile', Icon: IconProfile },
    ],
  },
]

function isActiveHref(pathname: string, href: string) {
  if (href === '/') return pathname === '/'
  return pathname.startsWith(href)
}

export function Sidebar() {
  const location = useLocation()
  const { t } = useTranslation()
  const { data: user } = useUser()

  const displayName = user?.name?.trim() || user?.email || t('nav.account')
  const avatarInitial = (user?.name?.trim() || user?.email || '?')[0]?.toUpperCase() ?? '?'

  return (
    <aside
      className="hidden md:flex md:flex-col md:w-56 md:shrink-0 h-screen sticky top-0 border-r border-line"
      style={{ background: 'var(--surface)' }}
    >
      {/* Brand block */}
      <div className="px-5 pt-5 pb-7 flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-md bg-primary text-primary-ink flex items-center justify-center">
          <Wallet className="w-4 h-4" aria-hidden="true" />
        </div>
        <div className="leading-none">
          <div className="font-extrabold text-base tracking-tight text-ink">
            Ví
          </div>
          <div className="text-[9px] uppercase tracking-[0.16em] text-muted mt-0.5">
            {APP_VERSION} · {APP_TAGLINE}
          </div>
        </div>
      </div>

      <nav className="px-3 flex-1 overflow-y-auto" aria-label={t('profile.account')}>
        {NAV_SECTIONS.map(({ sectionKey, items }) => (
          <div key={sectionKey} className="mb-4">
            {/* Eyebrow section label */}
            <div className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-muted px-2.5 pt-1 pb-1.5">
              {t(sectionKey)}
            </div>
            {items.map(({ href, labelKey, Icon, warn }) => {
              const active = isActiveHref(location.pathname, href)
              return (
                <Link
                  key={href}
                  to={href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg mb-0.5 text-[13px] font-medium transition-colors',
                    active
                      ? 'bg-primary-soft text-primary'
                      : 'text-sub hover:bg-hover',
                  )}
                >
                  <span
                    className={cn(
                      'w-4 h-4 shrink-0',
                      active ? 'text-primary' : warn ? 'text-negative' : 'text-muted',
                    )}
                  >
                    <Icon />
                  </span>
                  <span className="flex-1">{t(labelKey)}</span>
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Account chip — real user, links to profile */}
      <Link
        to="/profile"
        aria-label={t('profile.title')}
        className="mx-3.5 mb-4 px-3 py-2.5 rounded-xl bg-surface-2 border border-line flex items-center gap-2.5 hover:bg-hover transition-colors"
      >
        {user?.picture ? (
          <img
            src={user.picture}
            alt={displayName}
            className="w-7 h-7 rounded-full object-cover border border-line"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-surface flex items-center justify-center border border-line text-xs font-bold text-sub">
            {avatarInitial}
          </div>
        )}
        <div className="flex-1 min-w-0 leading-tight">
          <div className="text-xs font-semibold text-ink truncate">{displayName}</div>
          <div className="text-[9px] text-muted truncate">
            {user?.email ?? 'vnd'}
          </div>
        </div>
        <span className="text-muted text-xs">›</span>
      </Link>
    </aside>
  )
}
