/**
 * Nav icon map — all route icons sourced from lucide-react.
 * Re-exports thin wrappers so callers don't need to import lucide directly.
 */
import {
  LayoutDashboard,
  ArrowLeftRight,
  BarChart3,
  Wallet,
  PieChart,
  Layers,
  Target,
  Tags,
  Repeat,
  User,
  Bell,
  Download,
  Plus,
  Menu,
  Settings,
} from 'lucide-react'

const ICON_CLASS = 'w-5 h-5'

export function IconDashboard() {
  return <LayoutDashboard className={ICON_CLASS} aria-hidden="true" />
}

export function IconTransactions() {
  return <ArrowLeftRight className={ICON_CLASS} aria-hidden="true" />
}

export function IconStats() {
  return <BarChart3 className={ICON_CLASS} aria-hidden="true" />
}

export function IconWallets() {
  return <Wallet className={ICON_CLASS} aria-hidden="true" />
}

export function IconBudgets() {
  return <PieChart className={ICON_CLASS} aria-hidden="true" />
}

export function IconDebts() {
  return <Layers className={ICON_CLASS} aria-hidden="true" />
}

export function IconWishlist() {
  return <Target className={ICON_CLASS} aria-hidden="true" />
}

export function IconCategories() {
  return <Tags className={ICON_CLASS} aria-hidden="true" />
}

export function IconRecurring() {
  return <Repeat className={ICON_CLASS} aria-hidden="true" />
}

export function IconProfile() {
  return <User className={ICON_CLASS} aria-hidden="true" />
}

export function IconNotifications() {
  return <Bell className={ICON_CLASS} aria-hidden="true" />
}

export function IconExport() {
  return <Download className={ICON_CLASS} aria-hidden="true" />
}

export function IconSettings() {
  return <Settings className={ICON_CLASS} aria-hidden="true" />
}

export function IconAdd() {
  return <Plus className={ICON_CLASS} aria-hidden="true" />
}

export function IconMenu() {
  return <Menu className={ICON_CLASS} aria-hidden="true" />
}

/** Maps each nav route href to its lucide icon component. */
export const NAV_ICON_MAP: Record<string, () => JSX.Element> = {
  '/': IconDashboard,
  '/transactions': IconTransactions,
  '/stats': IconStats,
  '/wallets': IconWallets,
  '/budgets': IconBudgets,
  '/debts': IconDebts,
  '/wishlist': IconWishlist,
  '/categories': IconCategories,
  '/recurring': IconRecurring,
  '/profile': IconProfile,
  '/notifications': IconNotifications,
  '/export': IconExport,
  '/add': IconAdd,
}
