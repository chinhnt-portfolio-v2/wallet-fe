import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { IconDashboard, IconTransactions, IconDebts, IconBudgets, IconWallets } from './nav-icons'

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
}

const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Tổng quan', icon: <IconDashboard /> },
  { href: '/transactions', label: 'Giao dịch', icon: <IconTransactions /> },
  { href: '/debts', label: 'Nợ', icon: <IconDebts /> },
  { href: '/budgets', label: 'Ngân sách', icon: <IconBudgets /> },
  { href: '/wallets', label: 'Ví', icon: <IconWallets /> },
]

export function BottomNav() {
  const location = useLocation()

  return (
    <nav
      aria-label="Điều hướng chính"
      className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border z-30 md:hidden"
    >
      <div className="max-w-lg mx-auto flex pb-[env(safe-area-inset-bottom)]">
        {NAV_ITEMS.map(({ href, label, icon }) => {
          const isActive = href === '/' ? location.pathname === '/' : location.pathname.startsWith(href)
          return (
            <Link
              key={href}
              to={href}
              aria-label={label}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex-1 flex flex-col items-center py-2 text-xs transition-colors',
                isActive ? 'text-accent font-medium' : 'text-muted hover:text-primary'
              )}
            >
              {icon}
              <span className="mt-0.5">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
