import { OnboardingModal } from '@/components/onboarding/OnboardingModal'
import { NetWorthHero } from '@/components/dashboard/net-worth-hero'
import { CashFlowCard } from '@/components/dashboard/cashflow-card'
import { OpenDebts } from '@/components/dashboard/open-debts'
import { BudgetAlerts } from '@/components/dashboard/budget-alerts'
import { RecentTransactions } from '@/components/dashboard/recent-transactions'
import { ZoneWishlist } from '@/components/dashboard/zone-wishlist'

/**
 * Dashboard — Minh light-first design.
 *
 * Mobile: single column, hero → cashflow → recent tx / debts → budgets → wishlist.
 * Desktop (lg): 2/3 main + 1/3 side. Hero spans top; cashflow + recent in main;
 * debts + budgets + wishlist in side column.
 */
export default function DashboardPage() {
  return (
    <>
      <div className="page-enter grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* ── Main (2/3) ── */}
        <div className="lg:col-span-2 space-y-4">
          <NetWorthHero />
          <CashFlowCard />
          <RecentTransactions />
        </div>

        {/* ── Side (1/3) ── */}
        <div className="space-y-4">
          <OpenDebts />
          <BudgetAlerts />
          <ZoneWishlist />
        </div>
      </div>
      <OnboardingModal />
    </>
  )
}
