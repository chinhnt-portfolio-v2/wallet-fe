import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { IconDashboard, IconTransactions, IconDebts, IconBudgets, IconWallets, IconAdd } from './nav-icons'

interface SidebarItem {
  href: string
  label: string
  icon: React.ReactNode
}

const NAV_ITEMS: SidebarItem[] = [
  { href: '/', label: 'Tổng quan', icon: <IconDashboard /> },
  { href: '/transactions', label: 'Giao dịch', icon: <IconTransactions /> },
  { href: '/debts', label: 'Nợ', icon: <IconDebts /> },
  { href: '/budgets', label: 'Ngân sách', icon: <IconBudgets /> },
  { href: '/wallets', label: 'Ví', icon: <IconWallets /> },
]

export function Sidebar() {
  const location = useLocation()

  return (
    <aside className="hidden md:flex md:flex-col md:w-56 md:shrink-0 h-screen sticky top-0 border-r border-border bg-surface">
      <div className="px-4 h-14 flex items-center gap-2 text-base font-semibold text-primary border-b border-border">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
          <rect x="2" y="4" width="20" height="16" rx="3" fill="currentColor" opacity="0.15" stroke="none"/>
          <rect x="2" y="4" width="20" height="16" rx="3" strokeWidth="1.5"/>
          <circle cx="16" cy="12" r="2" fill="currentColor" stroke="none"/>
          <line x1="2" y1="9" x2="22" y2="9" strokeWidth="1.5" opacity="0.5"/>
        </svg>
        <span>Wallet</span>
      </div>

      <nav className="flex-1 px-2 py-3 space-y-0.5" aria-label="Sidebar navigation">
        {NAV_ITEMS.map(({ href, label, icon }) => {
          const isActive = href === '/' ? location.pathname === '/' : location.pathname.startsWith(href)
          return (
            <Link
              key={href}
              to={href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                isActive
                  ? 'bg-accent/10 text-accent font-medium'
                  : 'text-secondary hover:bg-surface-2 hover:text-primary'
              )}
            >
              {icon}
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="px-2 pb-3">
        <Link
          to="/add"
          className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium bg-accent text-white hover:bg-accent/90 transition-colors"
        >
          <IconAdd />
          <span>Thêm giao dịch</span>
        </Link>
      </div>
    </aside>
  )
}
