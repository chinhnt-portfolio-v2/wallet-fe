import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'

interface NavItem {
  href: string
  label: string
  glyph: string
}

const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Dashboard', glyph: '◐' },
  { href: '/transactions', label: 'Transactions', glyph: '◑' },
  { href: '/debts', label: 'Debts', glyph: '◖' },
  { href: '/budgets', label: 'Budgets', glyph: '◕' },
  { href: '/wallets', label: 'Wallets', glyph: '◔' },
]

export function BottomNav() {
  const location = useLocation()

  return (
    <nav
      aria-label="Điều hướng chính"
      className="fixed bottom-0 left-0 right-0 bg-bg-2 border-t border-border z-30 md:hidden"
    >
      <div className="max-w-lg mx-auto flex pb-[env(safe-area-inset-bottom)]">
        {NAV_ITEMS.map(({ href, label, glyph }) => {
          const isActive = href === '/' ? location.pathname === '/' : location.pathname.startsWith(href)
          return (
            <Link
              key={href}
              to={href}
              aria-label={label}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-colors',
                isActive ? 'text-accent' : 'text-faint hover:text-muted'
              )}
            >
              <span className="text-lg leading-none select-none" aria-hidden="true">{glyph}</span>
              <span className="font-mono text-[10px] tracking-wider uppercase">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
