import { useTranslation } from 'react-i18next'
import { Amount, ProgressBar } from '@/design-system'

interface BudgetSummaryProps {
  totalLimit: number
  totalSpent: number
  exceeded: number
  warning: number
}

/**
 * Overview card: Đã chi / limit, % bar, Còn lại.
 * Matches §7 Budgets spec — left: spent hero + bar; right: remaining stat.
 */
export function BudgetSummary({ totalLimit, totalSpent, exceeded, warning }: BudgetSummaryProps) {
  const { t } = useTranslation()
  const isOverAll = totalSpent > totalLimit
  const usedPct = totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0
  const remainOrOver = Math.abs(totalLimit - totalSpent)
  const barColor = isOverAll ? 'var(--negative)' : usedPct >= 80 ? 'var(--warning)' : 'var(--positive)'

  return (
    <div className="rounded-md border border-line bg-surface p-5">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 md:gap-6 md:items-center">

        {/* left: spent + bar */}
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted mb-2">
            {t('budget.totalBudget')}
          </p>
          <div className="flex items-baseline gap-2 mb-1">
            <Amount
              value={totalSpent}
              size={28}
              weight={700}
              style={{ color: isOverAll ? 'var(--negative)' : 'var(--ink)' }}
            />
            <span className="text-[12px] text-muted tabular-nums">
              / <Amount value={totalLimit} size={12} bare />₫
            </span>
          </div>
          <div className="mt-2">
            <ProgressBar
              pct={totalLimit > 0 ? Math.min(totalSpent / totalLimit, 1) : 0}
              over={isOverAll}
              height={5}
              color={barColor}
            />
          </div>
          <p className="text-[10px] text-muted mt-1.5 tabular-nums">
            {t('budget.used', { pct: usedPct })}
          </p>
        </div>

        {/* divider (desktop) */}
        <div className="hidden md:block w-px self-stretch bg-line" />

        {/* right: remaining + alerts */}
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted mb-2">
            {isOverAll ? t('budget.overBy') : t('budget.remaining')}
          </p>
          <Amount
            value={remainOrOver}
            size={22}
            weight={700}
            style={{ color: isOverAll ? 'var(--negative)' : 'var(--positive)' }}
          />
          <div className="flex flex-wrap gap-2 mt-3">
            {exceeded > 0 && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-negative bg-negative-soft px-2 py-0.5 rounded-full">
                {t('budget.countOver', { count: exceeded })}
              </span>
            )}
            {warning > 0 && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-warning bg-warning-soft px-2 py-0.5 rounded-full">
                {t('budget.countNear', { count: warning })}
              </span>
            )}
            {!exceeded && !warning && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-positive bg-positive-soft px-2 py-0.5 rounded-full">
                {t('budget.allOnTrack')}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
