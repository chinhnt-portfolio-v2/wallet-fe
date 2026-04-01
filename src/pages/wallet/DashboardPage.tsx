import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDashboardSummary, useOpenDebts, useMonthlyComparison } from '@/hooks/useDashboard'
import { useRecentTransactions } from '@/hooks/useTransactions'
import { useBudgetWithSpending } from '@/hooks/useBudgets'
import { checkDueDebts } from '@/lib/notifications'
import { DashboardSkeleton } from '@/components/ui/Skeleton'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { OnboardingModal } from '@/components/onboarding/OnboardingModal'
import { formatCurrency } from '@/lib/utils'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'

// ── Zone A: Net Worth Hero ──────────────────────────────────
function ZoneA() {
  const { data: summary, isLoading } = useDashboardSummary()
  const { data: months } = useMonthlyComparison(2)

  if (isLoading) return <DashboardSkeleton />

  const s = summary ?? { totalAssets: 0, totalDebt: 0, totalReceivable: 0, netWorth: 0, currency: 'VND' }
  const thisMonth = months?.[0]
  const lastMonth  = months?.[1]

  const deltaExpense = thisMonth && lastMonth
    ? thisMonth.totalExpense - lastMonth.totalExpense
    : null

  const deltaPercent = deltaExpense !== null && lastMonth && lastMonth.totalExpense > 0
    ? ((deltaExpense / lastMonth.totalExpense) * 100).toFixed(0)
    : null

  const isExpenseUp = deltaExpense !== null && deltaExpense > 0

  return (
    <Card padding="lg">
      {/* Net worth */}
      <div className="text-center mb-4 pb-4 border-b border-border dark:border-dark-border">
        <p className="text-xs text-muted dark:text-dark-muted uppercase tracking-wide mb-1">Số dư thực</p>
        <p className="text-2xl font-bold text-primary dark:text-dark-primary font-mono tabular-nums">
          {formatCurrency(s.netWorth)}
        </p>
      </div>

      {/* 3 columns */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center">
          <p className="text-2xs text-muted dark:text-dark-muted mb-1">💰 Tài sản</p>
          <p className="text-sm font-semibold text-positive dark:text-dark-positive font-mono tabular-nums">
            {formatCurrency(s.totalAssets)}
          </p>
        </div>
        <div className="text-center border-x border-border dark:border-dark-border">
          <p className="text-2xs text-muted dark:text-dark-muted mb-1">📋 Nợ phải trả</p>
          <p className="text-sm font-semibold text-negative dark:text-dark-negative font-mono tabular-nums">
            {formatCurrency(s.totalDebt)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-2xs text-muted dark:text-dark-muted mb-1">📬 Cần thu</p>
          <p className="text-sm font-semibold text-accent dark:text-dark-accent font-mono tabular-nums">
            {formatCurrency(s.totalReceivable)}
          </p>
        </div>
      </div>

      {/* Comparison badge */}
      {deltaPercent !== null && (
        <div className="mt-4 pt-3 border-t border-border dark:border-dark-border flex items-center justify-center gap-2">
          <span className="text-2xs text-muted dark:text-dark-muted">So với tháng trước</span>
          <Badge variant={isExpenseUp ? 'negative' : 'positive'}>
            {isExpenseUp ? '↑' : '↓'} {Math.abs(Number(deltaPercent))}% chi tiêu
          </Badge>
        </div>
      )}
    </Card>
  )
}

// ── Zone B: Monthly Bar Chart ───────────────────────────────
function ZoneB() {
  const { data: months, isLoading } = useMonthlyComparison(4)
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'))

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'))
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  if (isLoading || !months || months.length === 0) return null

  const chartData = months.slice().reverse().map((m) => ({
    label: m.label,
    Thu: m.totalIncome,
    Chi: m.totalExpense,
  }))

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted dark:text-dark-muted uppercase tracking-wide">📊 Thu / Chi</p>
      <Card padding="md">
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={chartData} barGap={3} barSize={14}>
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: isDark ? '#64748B' : '#94A3B8' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide />
            <Tooltip
              contentStyle={{
                background: isDark ? '#1E293B' : '#FFFFFF',
                border: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
                borderRadius: '6px',
                fontSize: 12,
                color: isDark ? '#E2E8F0' : '#0F172A',
              }}
              formatter={(value: number, name: string) => [
                formatCurrency(value),
                name === 'Thu' ? '📥 Thu' : '💸 Chi',
              ]}
              labelStyle={{ color: isDark ? '#94A3B8' : '#94A3B8', marginBottom: 4 }}
            />
            <Bar dataKey="Thu" fill="#10B981" radius={[3, 3, 0, 0]} />
            <Bar dataKey="Chi" fill="#F43F5E" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex justify-center gap-4 mt-2">
          <span className="flex items-center gap-1 text-2xs text-positive">📥 Thu nhập</span>
          <span className="flex items-center gap-1 text-2xs text-negative">💸 Chi tiêu</span>
        </div>
      </Card>
    </div>
  )
}

// ── Zone E: Open Debts ──────────────────────────────────────
function ZoneE() {
  const { data: debts, isLoading } = useOpenDebts()
  const navigate = useNavigate()

  // Fire debt reminder notifications on mount
  useEffect(() => {
    if (debts && debts.length > 0) {
      checkDueDebts(debts.map((d) => ({ id: d.groupId, title: d.title, dueDate: d.dueDate, remaining: d.remaining })))
    }
  }, [debts])

  if (isLoading) return null
  if (!debts || !Array.isArray(debts) || debts.length === 0) return null

  const visibleDebts = debts.slice(0, 3)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted dark:text-dark-muted uppercase tracking-wide">📋 Nợ đang mở</p>
        <button onClick={() => navigate('/debts')} className="text-xs text-accent dark:text-dark-accent hover:underline dark:hover:underline">Xem tất cả</button>
      </div>
      <Card padding="none">
        {visibleDebts.map((d, i) => (
          <div
            key={d.groupId}
            className={`flex items-center justify-between p-3 ${i < visibleDebts.length - 1 ? 'border-b border-border dark:border-dark-border' : ''}`}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-primary dark:text-dark-primary truncate">{d.title}</p>
              <p className="text-2xs text-muted dark:text-dark-muted">
                {d.walletIcon} {d.walletName}
                {d.dueDate && (
                  <span className={d.isOverdue ? 'text-negative dark:text-dark-negative ml-1' : 'ml-1'}>
                    · Hết hạn {new Date(d.dueDate).toLocaleDateString('vi-VN')}
                  </span>
                )}
                {d.isOverdue && <Badge variant="negative" className="ml-1">Quá hạn</Badge>}
              </p>
            </div>
            <div className="flex items-center gap-2 ml-3">
              <p className="text-sm font-semibold text-negative dark:text-dark-negative font-mono tabular-nums whitespace-nowrap">
                {formatCurrency(d.remaining)}
              </p>
              <button
                onClick={() => navigate(`/debts/${d.groupId}`)}
                className="bg-accent dark:bg-dark-accent text-white text-xs px-3 py-1.5 rounded-sm font-medium hover:bg-accent/90 dark:hover:bg-dark-accent/90 transition-colors whitespace-nowrap"
              >
                Thanh toán
              </button>
            </div>
          </div>
        ))}
      </Card>
    </div>
  )
}

// ── Zone E2: Budget Alerts ────────────────────────────────
function ZoneBudgetAlerts() {
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
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted uppercase tracking-wide">⚠️ Ngân sách</p>
        <button
          onClick={() => navigate('/budgets')}
          className="text-xs text-accent dark:text-dark-accent hover:underline dark:hover:underline"
        >
          Xem tất cả
        </button>
      </div>
      <Card padding="sm">
        <div className="space-y-3">
          {atRisk.map((b) => {
            const pct = Math.min(b.percentage ?? 0, 100)
            const isExceeded = b.status === 'exceeded'
            return (
              <div key={b.id} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-sm">{b.category?.icon ?? '📊'}</span>
                    <span className="text-xs font-medium text-primary dark:text-dark-primary truncate">
                      {b.category?.name}
                    </span>
                  </div>
                  <span className={`text-xs font-semibold shrink-0 ml-2 ${
                    isExceeded ? 'text-negative dark:text-dark-negative' : 'text-warning dark:text-dark-warning'
                  }`}>
                    {Math.round(pct)}%
                  </span>
                </div>
                <div className="h-1.5 bg-surface-2 dark:bg-dark-surface-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isExceeded
                        ? 'bg-negative dark:bg-dark-negative'
                        : 'bg-warning dark:bg-dark-warning'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-2xs text-muted dark:text-dark-muted">
                  {formatCurrency(b.currentSpent ?? 0)} / {formatCurrency(b.monthlyLimit)}₫
                  {isExceeded ? ' · ⚠️ Vượt ngân sách' : ' · Gần đạt'}
                </p>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}

// ── Zone F: Recent Transactions ────────────────────────────
function ZoneF() {
  const { data: txs, isLoading } = useRecentTransactions(5)
  const navigate = useNavigate()

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted dark:text-dark-muted uppercase tracking-wide">Gần đây</p>
        <button onClick={() => navigate('/transactions')} className="text-xs text-accent dark:text-dark-accent hover:underline dark:hover:underline">Xem tất cả</button>
      </div>
      <Card padding="none">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-9 h-9 rounded-full bg-surface-2 dark:bg-dark-surface-2" />
                <div className="flex-1 space-y-1">
                  <div className="h-3 w-2/3 bg-surface-2 dark:bg-dark-surface-2 rounded" />
                  <div className="h-2 w-1/3 bg-surface-2 dark:bg-dark-surface-2 rounded" />
                </div>
                <div className="h-4 w-16 bg-surface-2 dark:bg-dark-surface-2 rounded" />
              </div>
            ))}
          </div>
        ) : Array.isArray(txs) && txs.length > 0 ? txs.map((tx, i) => (
          <div
            key={tx.id}
            className={`flex items-center gap-3 p-3 ${i < txs.length - 1 ? 'border-b border-border dark:border-dark-border' : ''}`}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-base shrink-0"
              style={{ backgroundColor: `${tx.category?.color ?? '#94A3B8'}20` }}
            >
              {tx.category?.icon ?? '📦'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-primary dark:text-dark-primary truncate">{tx.category?.name ?? 'Giao dịch'}</p>
              {tx.note && <p className="text-2xs text-muted dark:text-dark-muted truncate">{tx.note}</p>}
            </div>
            <p className={`text-sm font-semibold font-mono tabular-nums whitespace-nowrap ${
              tx.type === 'INCOME' ? 'text-positive dark:text-dark-positive' : 'text-negative dark:text-dark-negative'
            }`}>
              {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount)}
            </p>
          </div>
        )) : (
          <div className="p-6 text-center text-sm text-muted dark:text-dark-muted">Chưa có giao dịch nào</div>
        )}
      </Card>
    </div>
  )
}

// ── Main ────────────────────────────────────────────────────
export default function DashboardPage() {
  return (
    <>
      <div className="space-y-4">
        <ZoneA />
        <ZoneB />
        <ZoneE />
        <ZoneBudgetAlerts />
        <ZoneF />
      </div>
      {/* Onboarding Wizard — shown on Dashboard mount when user has zero wallets */}
      <OnboardingModal />
    </>
  )
}
