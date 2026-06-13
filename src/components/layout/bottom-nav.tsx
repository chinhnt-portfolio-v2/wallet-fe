import { useState, type ComponentType } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BottomSheet } from '@/components/ui/BottomSheet'
import {
  IconMenu,
  IconWishlist,
  IconWallets,
  IconCategories,
  IconRecurring,
  IconNotifications,
  IconExport,
  IconSettings,
  IconDashboard,
  IconTransactions,
  IconDebts,
} from '@/components/layout/nav-icons'

// Destinations the 4 primary tabs don't reach — surfaced via the "Menu" sheet.
interface MenuItem {
  href: string
  labelKey: string
  Icon: ComponentType
}

const MENU_ITEMS: MenuItem[] = [
  { href: '/wishlist', labelKey: 'nav.wishlist', Icon: IconWishlist },
  { href: '/wallets', labelKey: 'nav.wallets', Icon: IconWallets },
  { href: '/categories', labelKey: 'nav.categories', Icon: IconCategories },
  { href: '/recurring', labelKey: 'nav.recurring', Icon: IconRecurring },
  { href: '/notifications', labelKey: 'nav.notifications', Icon: IconNotifications },
  { href: '/export', labelKey: 'nav.export', Icon: IconExport },
  { href: '/profile', labelKey: 'nav.profile', Icon: IconSettings },
]

const MENU_HREFS = MENU_ITEMS.map((m) => m.href)

function isActiveHref(pathname: string, href: string): boolean {
  return href === '/' ? pathname === '/' : pathname.startsWith(href)
}

interface TabItem {
  href: string
  labelKey: string
  Icon: ComponentType
}

// 5-slot layout: [Dashboard] [Transactions] [FAB+] [Debts] [Menu]
// The center slot (index 2) is the FAB-like "+ Add" button.
const LEFT_TABS: TabItem[] = [
  { href: '/', labelKey: 'nav.dashboard', Icon: IconDashboard },
  { href: '/transactions', labelKey: 'nav.transactions', Icon: IconTransactions },
]
const RIGHT_TABS: TabItem[] = [
  { href: '/debts', labelKey: 'nav.debts', Icon: IconDebts },
]

export function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [menuOpen, setMenuOpen] = useState(false)

  const menuActive = MENU_HREFS.some((h) => isActiveHref(location.pathname, h))

  const go = (href: string) => {
    setMenuOpen(false)
    navigate(href)
  }

  return (
    <>
      <nav
        aria-label={t('nav.overview')}
        className="fixed bottom-0 left-0 right-0 bg-surface border-t border-line z-30 md:hidden"
      >
        <div className="max-w-lg mx-auto flex items-end pb-[env(safe-area-inset-bottom)]">
          {/* Left tabs */}
          {LEFT_TABS.map(({ href, labelKey, Icon }) => {
            const isActive = isActiveHref(location.pathname, href)
            const label = t(labelKey)
            return (
              <Link
                key={href}
                to={href}
                aria-label={label}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex-1 flex flex-col items-center justify-center gap-0.5 min-h-[44px] py-2.5 transition-colors',
                  isActive ? 'text-primary' : 'text-muted hover:text-sub'
                )}
              >
                <Icon />
                <span className="text-[10px] font-semibold tracking-wider uppercase">{label}</span>
              </Link>
            )
          })}

          {/* Center FAB-style "+ Add" button */}
          <div className="flex-1 flex flex-col items-center justify-end pb-1">
            <Link
              to="/add"
              aria-label={t('nav.logExpense')}
              className={cn(
                'w-12 h-12 rounded-xl bg-primary text-primary-ink shadow-fab',
                'flex items-center justify-center transition-all duration-150',
                'active:scale-95',
                '-mt-4'
              )}
            >
              <Plus className="w-5 h-5" aria-hidden="true" />
            </Link>
          </div>

          {/* Right tabs */}
          {RIGHT_TABS.map(({ href, labelKey, Icon }) => {
            const isActive = isActiveHref(location.pathname, href)
            const label = t(labelKey)
            return (
              <Link
                key={href}
                to={href}
                aria-label={label}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex-1 flex flex-col items-center justify-center gap-0.5 min-h-[44px] py-2.5 transition-colors',
                  isActive ? 'text-primary' : 'text-muted hover:text-sub'
                )}
              >
                <Icon />
                <span className="text-[10px] font-semibold tracking-wider uppercase">{label}</span>
              </Link>
            )
          })}

          {/* 5th slot — overflow menu */}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
            aria-current={menuActive ? 'page' : undefined}
            className={cn(
              'flex-1 flex flex-col items-center justify-center gap-0.5 min-h-[44px] py-2.5 transition-colors',
              menuActive ? 'text-primary' : 'text-muted hover:text-sub'
            )}
          >
            <span aria-hidden="true"><IconMenu /></span>
            <span className="text-[10px] font-semibold tracking-wider uppercase">{t('common.menu')}</span>
          </button>
        </div>
      </nav>

      <BottomSheet open={menuOpen} onClose={() => setMenuOpen(false)} title={t('common.menu')}>
        <ul className="flex flex-col" role="list">
          {MENU_ITEMS.map(({ href, labelKey, Icon }) => {
            const isActive = isActiveHref(location.pathname, href)
            return (
              <li key={href}>
                <button
                  type="button"
                  onClick={() => go(href)}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'w-full flex items-center gap-3 min-h-[44px] px-2 py-2.5 rounded-lg text-left transition-colors',
                    isActive
                      ? 'text-primary bg-primary-soft'
                      : 'text-sub hover:bg-hover hover:text-ink'
                  )}
                >
                  <span className={cn('shrink-0', isActive ? 'text-primary' : 'text-muted')}>
                    <Icon />
                  </span>
                  <span className="flex-1 text-sm font-medium">{t(labelKey)}</span>
                  <span className="text-muted text-xs" aria-hidden="true">›</span>
                </button>
              </li>
            )
          })}
        </ul>
      </BottomSheet>
    </>
  )
}
