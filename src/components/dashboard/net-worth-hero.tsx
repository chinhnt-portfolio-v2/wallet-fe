import { useTranslation } from 'react-i18next'
import { useDashboardSummary, useMonthlyComparison } from '@/hooks/useDashboard'
import { Amount, Sparkline } from '@/design-system'
import { DashboardSkeleton } from '@/components/ui/Skeleton'
import { useCountUp } from './use-count-up'
import { formatVndDigits } from '@/lib/utils'

function HeroAmount({ value }: { value: number }) {
  const v = Math.round(value)
  const s = formatVndDigits(v)
  return (
    <div className="flex items-baseline gap-2">
      <span
        className="tabular-nums text-primary-ink font-extrabold tracking-[-0.025em]"
        style={{ fontSize: 40, lineHeight: 1 }}
      >
        {v < 0 ? '−' : ''}
        {s}
      </span>
      <span
        className="text-primary-ink/60 font-semibold tabular-nums"
        style={{ fontSize: 14, letterSpacing: '0.04em' }}
      >
        VND
      </span>
    </div>
  )
}

export function NetWorthHero() {
  const { t } = useTranslation()
  const { data: summary, isLoading } = useDashboardSummary()
  const { data: months } = useMonthlyComparison(2)

  const s = summary ?? {
    totalAssets: 0,
    totalDebt: 0,
    totalReceivable: 0,
    netWorth: 0,
    currency: 'VND',
  }

  const animatedNetWorth = useCountUp(s.netWorth, 800)

  if (isLoading) return <DashboardSkeleton />

  const thisMonth = months?.[0]
  const lastMonth = months?.[1]
  const deltaExpense =
    thisMonth && lastMonth ? thisMonth.totalExpense - lastMonth.totalExpense : null
  const deltaPercent =
    deltaExpense !== null && lastMonth && lastMonth.totalExpense > 0
      ? ((deltaExpense / lastMonth.totalExpense) * 100).toFixed(0)
      : null
  const isExpenseUp = deltaExpense !== null && deltaExpense > 0

  // Faint sparkline data from monthly net savings
  const sparkData = months
    ? [...months].reverse().map((m) => m.netSavings)
    : [0]

  return (
    <div
      className="relative overflow-hidden rounded-xl bg-primary text-primary-ink"
      style={{ boxShadow: '0 12px 32px -8px var(--primary)' }}
    >
      {/* Top content */}
      <div className="px-5 pt-5 pb-3 relative z-10">
        {/* Eyebrow */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-extrabold uppercase tracking-[0.07em] text-primary-ink/70">
            {t('dashboard.netWorth')}
          </span>
          <span className="text-[10px] font-semibold text-primary-ink/50">
            {t('dashboard.updatedLive')}
          </span>
        </div>

        {/* Hero amount */}
        <HeroAmount value={animatedNetWorth} />

        {/* Delta pill */}
        {deltaPercent !== null && (
          <div className="mt-3">
            <span
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold tabular-nums"
              style={{ background: 'rgba(255,255,255,0.22)' }}
            >
              {isExpenseUp ? '↑' : '↓'}{' '}
              {t('dashboard.spendChange', { pct: Math.abs(Number(deltaPercent)) })}
            </span>
          </div>
        )}

        {/* Triplet row */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-primary-ink/20">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.07em] text-primary-ink/60 mb-1">
              {t('dashboard.assets')}
            </p>
            <Amount
              value={s.totalAssets}
              size={14}
              weight={700}
              style={{ color: 'var(--primary-ink)' }}
            />
          </div>
          <div className="border-l border-primary-ink/20 pl-2">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.07em] text-primary-ink/60 mb-1">
              {t('dashboard.liabilities')}
            </p>
            <Amount
              value={s.totalDebt}
              size={14}
              weight={700}
              style={{ color: 'rgba(255,255,255,0.75)' }}
            />
          </div>
          <div className="border-l border-primary-ink/20 pl-2">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.07em] text-primary-ink/60 mb-1">
              {t('dashboard.receivable')}
            </p>
            <Amount
              value={s.totalReceivable}
              size={14}
              weight={700}
              style={{ color: 'var(--primary-ink)' }}
            />
          </div>
        </div>
      </div>

      {/* Faint sparkline at bottom */}
      <div className="relative h-12 opacity-25 pointer-events-none" aria-hidden="true">
        <Sparkline
          points={sparkData}
          height={48}
          color="white"
          fill
          dotLast={false}
          className="absolute inset-0"
        />
      </div>
    </div>
  )
}
