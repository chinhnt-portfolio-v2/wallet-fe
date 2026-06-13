import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { useUser } from '@/hooks/useUser'
import { APP_VERSION, APP_TAGLINE } from '@/lib/app-meta'

interface NavItem {
  href: string
  labelKey: string
  glyph: string
  warn?: boolean
}

const NAV_SECTIONS: { sectionKey: string; items: NavItem[] }[] = [
  {
    sectionKey: 'nav.overview',
    items: [
      { href: '/', labelKey: 'nav.dashboard', glyph: '◐' },
      { href: '/transactions', labelKey: 'nav.transactions', glyph: '◑' },
    ],
  },
  {
    sectionKey: 'nav.money',
    items: [
      { href: '/wallets', labelKey: 'nav.wallets', glyph: '◔' },
      { href: '/budgets', labelKey: 'nav.budgets', glyph: '◕' },
      { href: '/debts', labelKey: 'nav.debts', glyph: '◖', warn: true },
      { href: '/wishlist', labelKey: 'nav.wishlist', glyph: '◗' },
    ],
  },
  {
    sectionKey: 'nav.account',
    items: [
      { href: '/categories', labelKey: 'nav.categories', glyph: '◓' },
      { href: '/recurring', labelKey: 'nav.recurring', glyph: '◒' },
      { href: '/profile', labelKey: 'nav.profile', glyph: '○' },
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

  // F12: derive a display name + avatar initial from the real authenticated user.
  const displayName = user?.name?.trim() || user?.email || t('nav.account')
  const avatarInitial = (user?.name?.trim() || user?.email || '?')[0]?.toUpperCase() ?? '?'

  return (
    <aside
      className="hidden md:flex md:flex-col md:w-56 md:shrink-0 h-screen sticky top-0 border-r border-border"
      style={{ background: 'var(--color-bg-2)' }}
    >
      {/* Brand block */}
      <div className="px-5 pt-5 pb-7 flex items-center gap-2.5">
        <div className="w-[26px] h-[26px] rounded-md bg-accent text-accent-ink font-mono font-semibold text-base flex items-center justify-center">
          ◇
        </div>
        <div className="leading-none">
          <div className="font-display italic text-lg tracking-tight text-primary">
            ledger
          </div>
          <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-faint mt-0.5">
            {APP_VERSION} · {APP_TAGLINE}
          </div>
        </div>
      </div>

      <nav className="px-3 flex-1 overflow-y-auto" aria-label={t('profile.account')}>
        {NAV_SECTIONS.map(({ sectionKey, items }) => (
          <div key={sectionKey} className="mb-4">
            <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-faint px-2.5 pt-1 pb-1.5">
              {t(sectionKey)}
            </div>
            {items.map(({ href, labelKey, glyph, warn }) => {
              const active = isActiveHref(location.pathname, href)
              return (
                <Link
                  key={href}
                  to={href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg mb-0.5 text-[13px] transition-colors',
                    active
                      ? 'bg-surface text-primary shadow-[inset_0_0_0_1px_var(--color-border)]'
                      : 'text-secondary hover:bg-surface/60',
                  )}
                >
                  <span
                    className={cn(
                      'font-mono text-sm w-3.5 text-center',
                      active ? 'text-accent' : warn ? 'text-negative' : 'text-faint',
                    )}
                  >
                    {glyph}
                  </span>
                  <span className="flex-1 font-sans">{t(labelKey)}</span>
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Account chip — F12: real user, links to settings */}
      <Link
        to="/profile"
        aria-label={t('profile.title')}
        className="mx-3.5 mb-4 px-3 py-2.5 rounded-xl bg-surface border border-border flex items-center gap-2.5 hover:border-border-hi transition-colors"
      >
        {user?.picture ? (
          <img
            src={user.picture}
            alt={displayName}
            className="w-7 h-7 rounded-full object-cover border border-border"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-surface-2 flex items-center justify-center font-mono text-xs text-primary">
            {avatarInitial}
          </div>
        )}
        <div className="flex-1 min-w-0 leading-tight">
          <div className="font-sans text-xs text-primary truncate">{displayName}</div>
          <div className="font-mono text-[9px] text-faint truncate">
            {user?.email ?? 'vnd'}
          </div>
        </div>
        <span className="text-muted">›</span>
      </Link>
    </aside>
  )
}
