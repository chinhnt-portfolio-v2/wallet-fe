import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'

interface NavItem {
  href: string
  label: string
  glyph: string
  warn?: boolean
}

const NAV_SECTIONS: { section: string; items: NavItem[] }[] = [
  {
    section: 'Overview',
    items: [
      { href: '/', label: 'Dashboard', glyph: '◐' },
      { href: '/transactions', label: 'Transactions', glyph: '◑' },
    ],
  },
  {
    section: 'Money',
    items: [
      { href: '/wallets', label: 'Wallets', glyph: '◔' },
      { href: '/budgets', label: 'Budgets', glyph: '◕' },
      { href: '/debts', label: 'Debts', glyph: '◖', warn: true },
      { href: '/wishlist', label: 'Savings', glyph: '◗' },
    ],
  },
  {
    section: 'Account',
    items: [
      { href: '/categories', label: 'Categories', glyph: '◓' },
      { href: '/recurring', label: 'Recurring', glyph: '◒' },
      { href: '/profile', label: 'Settings', glyph: '○' },
    ],
  },
]

function isActiveHref(pathname: string, href: string) {
  if (href === '/') return pathname === '/'
  return pathname.startsWith(href)
}

export function Sidebar() {
  const location = useLocation()

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
            v0 · personal
          </div>
        </div>
      </div>

      <nav className="px-3 flex-1 overflow-y-auto" aria-label="Sidebar navigation">
        {NAV_SECTIONS.map(({ section, items }) => (
          <div key={section} className="mb-4">
            <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-faint px-2.5 pt-1 pb-1.5">
              {section}
            </div>
            {items.map(({ href, label, glyph, warn }) => {
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
                  <span className="flex-1 font-sans">{label}</span>
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Account chip */}
      <div className="mx-3.5 mb-4 px-3 py-2.5 rounded-xl bg-surface border border-border flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-full bg-surface-2 flex items-center justify-center font-mono text-xs text-primary">
          K
        </div>
        <div className="flex-1 min-w-0 leading-tight">
          <div className="font-sans text-xs text-primary truncate">khanh.ng</div>
          <div className="font-mono text-[9px] text-faint">vi · vnd</div>
        </div>
        <span className="text-muted">›</span>
      </div>
    </aside>
  )
}
