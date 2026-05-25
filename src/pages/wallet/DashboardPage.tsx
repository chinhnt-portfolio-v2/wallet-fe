import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDashboardSummary, useOpenDebts, useMonthlyComparison } from '@/hooks/useDashboard'
import { useRecentTransactions } from '@/hooks/useTransactions'
import { useBudgetWithSpending } from '@/hooks/useBudgets'
import { ZoneWishlist } from '@/components/dashboard/zone-wishlist'
import { checkDueDebts } from '@/lib/notifications'
import { DashboardSkeleton } from '@/components/ui/Skeleton'
import { OnboardingModal } from '@/components/onboarding/OnboardingModal'
import {
  DisplayAmount,
  Amount,
  SectionLabel,
  Pill,
  ProgressBar,
  CategoryChip,
  Sparkline,
} from '@/design-system'

// ── Card surface — editorial card with thin border ──
function Panel({
  children,
  className,
  padding = 'md',
}: {
  children: React.ReactNode
  className?: string
  padding?: 'sm' | 'md' | 'lg' | 'none'
}) {
  const pad =
    padding === 'none' ? '' : padding === 'sm' ? 'p-3' : padding === 'lg' ? 'p-6' : 'p-4'
  return (
    <div
      className={`bg-surface border border-border rounded-lg ${pad} ${className ?? ''}`}
    >
      {children}
    </div>
  )
}

// ── Zone A: Net worth hero ──
function NetWorthHero() {
  const { data: summary, isLoading } = useDashboardSummary()
  const { data: months } = useMonthlyComparison(2)

  if (isLoading) return <DashboardSkeleton />

  const s = summary ?? {
    totalAssets: 0,
    totalDebt: 0,
    totalReceivable: 0,
    netWorth: 0,
    currency: 'VND',
  }
  const thisMonth = months?.[0]
  const lastMonth = months?.[1]
  const deltaExpense =
    thisMonth && lastMonth ? thisMonth.totalExpense - lastMonth.totalExpense : null
  const deltaPercent =
    deltaExpense !== null && lastMonth && lastMonth.totalExpense > 0
      ? ((deltaExpense / lastMonth.totalExpense) * 100).toFixed(0)
      : null
  const isExpenseUp = deltaExpense !== null && deltaExpense > 0

  return (
    <Panel padding="lg" className="relative">
      <SectionLabel right="updated · live">Net worth</SectionLabel>
      <div className="mt-4 mb-6">
        <DisplayAmount value={s.netWorth} size={64} sub="as of today" />
      </div>

      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-faint mb-2">
            Assets
          </p>
          <Amount value={s.totalAssets} size={18} className="text-positive" />
        </div>
        <div className="border-l border-border pl-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-faint mb-2">
            Liabilities
          </p>
          <Amount value={s.totalDebt} size={18} className="text-negative" />
        </div>
        <div className="border-l border-border pl-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-faint mb-2">
            Receivable
          </p>
          <Amount value={s.totalReceivable} size={18} className="text-accent" />
        </div>
      </div>

      {deltaPercent !== null && (
        <div className="mt-4 pt-3 border-t border-border flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-faint">
            vs last month
          </span>
          <span
            className={`font-mono text-xs ${
              isExpenseUp ? 'text-negative' : 'text-positive'
            }`}
          >
            {isExpenseUp ? '↑' : '↓'} {Math.abs(Number(deltaPercent))}% spend
          </span>
        </div>
      )}
    </Panel>
  )
}

// ── Zone B: Cash flow sparkline ──
function CashFlow() {
  const { data: months, isLoading } = useMonthlyComparison(6)
  if (isLoading || !months || months.length === 0) return null

  const series = months.slice().reverse()
  const inc = series.map((m) => m.totalIncome)
  const exp = series.map((m) => m.totalExpense)

  return (
    <div className="space-y-2">
      <SectionLabel right="6 months">Cash flow</SectionLabel>
      <Panel padding="md">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-faint mb-1">
              Income
            </p>
            <Sparkline points={inc} color="var(--color-accent)" width={300} height={64} />
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-faint mb-1">
              Expense
            </p>
            <Sparkline points={exp} color="var(--color-negative)" width={300} height={64} />
          </div>
        </div>
        <div className="flex justify-between mt-3 pt-3 border-t border-border">
          {series.map((m) => (
            <span
              key={m.label}
              className="font-mono text-[10px] uppercase tracking-widest text-faint"
            >
              {m.label}
            </span>
          ))}
        </div>
      </Panel>
    </div>
  )
}

// ── Open debts ──
function OpenDebts() {
  const { data: debts, isLoading } = useOpenDebts()
  const navigate = useNavigate()

  useEffect(() => {
    if (debts && debts.length > 0) {
      checkDueDebts(
        debts.map((d) => ({
          id: d.groupId,
          title: d.title,
          dueDate: d.dueDate,
          remaining: d.remaining,
        })),
      )
    }
  }, [debts])

  if (isLoading || !debts || debts.length === 0) return null
  const visible = debts.slice(0, 3)

  return (
    <div className="space-y-2">
      <SectionLabel
        right={
          <button onClick={() => navigate('/debts')} className="hover:text-primary">
            view all →
          </button>
        }
      >
        Open debts
      </SectionLabel>
      <Panel padding="none">
        {visible.map((d, i) => (
          <div
            key={d.groupId}
            className={`flex items-center gap-3 p-3 ${
              i < visible.length - 1 ? 'border-b border-border' : ''
            }`}
          >
            <span
              className={`font-mono text-base shrink-0 ${
                d.isOverdue ? 'text-negative' : 'text-faint'
              }`}
            >
              ◖
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-primary truncate">{d.title}</p>
              <p className="font-mono text-[10px] uppercase tracking-widest text-faint mt-0.5">
                {d.walletName}
                {d.dueDate && (
                  <>
                    {' · '}
                    <span className={d.isOverdue ? 'text-negative' : ''}>
                      due {new Date(d.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </>
                )}
              </p>
            </div>
            <Amount value={d.remaining} size={14} className="text-negative" />
            <Pill onClick={() => navigate(`/debts/${d.groupId}`)}>Pay</Pill>
          </div>
        ))}
      </Panel>
    </div>
  )
}

// ── Budget alerts ──
function BudgetAlerts() {
  const navigate = useNavigate()
  const now = new Date()
  const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const { data: budgets } = useBudgetWithSpending(period)

  const atRisk = [...(budgets ?? [])]
    .filter((b) => b.status === 'exceeded' || b.status === 'warning')
    .sort((a, b) => (b.percentage ?? 0) - (a.percentage ?? 0))
    .slice(0, 3)

  if (atRisk.length === 0) return null

  return (
    <div className="space-y-2">
      <SectionLabel
        right={
          <button onClick={() => navigate('/budgets')} className="hover:text-primary">
            view all →
          </button>
        }
      >
        Budget watch
      </SectionLabel>
      <Panel padding="md">
        <div className="space-y-4">
          {atRisk.map((b) => {
            const pct = (b.percentage ?? 0) / 100
            const exceeded = b.status === 'exceeded'
            return (
              <div key={b.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <CategoryChip
                      cat={b.category?.name?.toLowerCase() ?? 'other'}
                      name={b.category?.name}
                      size={24}
                    />
                    <span className="text-sm text-primary truncate">
                      {b.category?.name ?? 'Category'}
                    </span>
                  </div>
                  <span
                    className={`font-mono text-xs ${
                      exceeded ? 'text-negative' : 'text-warning'
                    }`}
                  >
                    {Math.round((b.percentage ?? 0))}%
                  </span>
                </div>
                <ProgressBar pct={pct} over={exceeded} height={3} />
                <div className="flex justify-between font-mono text-[10px] uppercase tracking-widest text-faint">
                  <span>
                    <Amount value={b.currentSpent ?? 0} size={10} bare /> /{' '}
                    <Amount value={b.monthlyLimit} size={10} bare />
                  </span>
                  <span className={exceeded ? 'text-negative' : ''}>
                    {exceeded ? 'over budget' : 'near limit'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </Panel>
    </div>
  )
}

// ── Recent transactions ──
function RecentTransactions() {
  const { data: txs, isLoading } = useRecentTransactions(6)
  const navigate = useNavigate()

  return (
    <div className="space-y-2">
      <SectionLabel
        right={
          <button onClick={() => navigate('/transactions')} className="hover:text-primary">
            view all →
          </button>
        }
      >
        Recent activity
      </SectionLabel>
      <Panel padding="none">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-7 h-7 rounded bg-surface-2" />
                <div className="flex-1 space-y-1">
                  <div className="h-3 w-2/3 bg-surface-2 rounded" />
                  <div className="h-2 w-1/3 bg-surface-2 rounded" />
                </div>
                <div className="h-4 w-16 bg-surface-2 rounded" />
              </div>
            ))}
          </div>
        ) : Array.isArray(txs) && txs.length > 0 ? (
          txs.map((tx, i) => (
            <div
              key={tx.id}
              className={`flex items-center gap-3 p-3 ${
                i < txs.length - 1 ? 'border-b border-border' : ''
              }`}
            >
              <CategoryChip
                cat={(tx.category?.name ?? 'other').toLowerCase()}
                name={tx.category?.name}
                size={28}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-primary truncate">
                  {tx.category?.name ?? 'Transaction'}
                </p>
                {tx.note && (
                  <p className="font-mono text-[10px] uppercase tracking-widest text-faint truncate mt-0.5">
                    {tx.note}
                  </p>
                )}
              </div>
              <Amount
                value={tx.type === 'INCOME' ? tx.amount : -tx.amount}
                size={14}
                sign
                className={tx.type === 'INCOME' ? 'text-positive' : 'text-primary'}
              />
            </div>
          ))
        ) : (
          <div className="p-6 text-center text-sm text-muted">No transactions yet</div>
        )}
      </Panel>
    </div>
  )
}

// ── Main ──
export default function DashboardPage() {
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <NetWorthHero />
          <CashFlow />
          <RecentTransactions />
        </div>
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
