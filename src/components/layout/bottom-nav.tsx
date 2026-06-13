import { useState, type ComponentType } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
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
} from '@/components/layout/nav-icons'

interface NavItem {
  href: string
  labelKey: string
  glyph: string
}

const NAV_ITEMS: NavItem[] = [
  { href: '/', labelKey: 'nav.dashboard', glyph: '◐' },
  { href: '/transactions', labelKey: 'nav.transactions', glyph: '◑' },
  { href: '/debts', labelKey: 'nav.debts', glyph: '◖' },
  { href: '/budgets', labelKey: 'nav.budgets', glyph: '◕' },
]

// Destinations the 4 primary tabs don't reach — surfaced via the "Menu" sheet so
// the whole app is reachable on mobile (audit §3, mobile nav ergonomics).
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
        className="fixed bottom-0 left-0 right-0 bg-bg-2 border-t border-border z-30 md:hidden"
      >
        <div className="max-w-lg mx-auto flex pb-[env(safe-area-inset-bottom)]">
          {NAV_ITEMS.map(({ href, labelKey, glyph }) => {
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
                  isActive ? 'text-accent' : 'text-faint hover:text-muted'
                )}
              >
                <span className="text-lg leading-none select-none" aria-hidden="true">{glyph}</span>
                <span className="font-mono text-[10px] tracking-wider uppercase">{label}</span>
              </Link>
            )
          })}

          {/* 5th tab — opens the overflow menu sheet. */}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
            aria-current={menuActive ? 'page' : undefined}
            className={cn(
              'flex-1 flex flex-col items-center justify-center gap-0.5 min-h-[44px] py-2.5 transition-colors',
              menuActive ? 'text-accent' : 'text-faint hover:text-muted'
            )}
          >
            <span className="leading-none" aria-hidden="true"><IconMenu /></span>
            <span className="font-mono text-[10px] tracking-wider uppercase">{t('common.menu')}</span>
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
                      ? 'text-accent bg-surface-2'
                      : 'text-secondary hover:bg-surface-2 hover:text-primary'
                  )}
                >
                  <span className={cn('shrink-0', isActive ? 'text-accent' : 'text-muted')}>
                    <Icon />
                  </span>
                  <span className="flex-1 font-sans text-sm">{t(labelKey)}</span>
                  <span className="text-faint" aria-hidden="true">›</span>
                </button>
              </li>
            )
          })}
        </ul>
      </BottomSheet>
    </>
  )
}
