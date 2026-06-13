import { useTranslation } from 'react-i18next'
import { Amount, DisplayAmount, ProgressBar } from '@/design-system'

interface BudgetSummaryProps {
  totalLimit: number
  totalSpent: number
  exceeded: number
  warning: number
}

/**
 * Budget summary hero.
 *
 * <768px: a single stacked column so figures never collide (audit §2.9 fix —
 * "REMAINING" no longer overlaps the amount). ≥768px: the original 3-up grid.
 */
export function BudgetSummary({ totalLimit, totalSpent, exceeded, warning }: BudgetSummaryProps) {
  const { t } = useTranslation()
  const isOverAll = totalSpent > totalLimit
  const usedPct = totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0
  const remainOrOver = Math.abs(totalLimit - totalSpent)

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 md:items-center">
        {/* Total budget hero */}
        <div>
          <p className="font-mono text-[10px] text-faint uppercase tracking-[0.14em] mb-2">
            {t('budget.totalBudget')}
          </p>
          <DisplayAmount
            value={totalLimit}
            size={34}
            sub={t('budget.spentPct', { pct: ((totalSpent / totalLimit) * 100 || 0).toFixed(0) })}
          />
          <p className="font-mono text-[11px] text-muted mt-2">
            <Amount
              value={totalSpent}
              size={11}
              style={{ color: isOverAll ? 'var(--color-negative)' : 'var(--color-muted)' }}
            />{' '}
            {t('budget.spentSoFar')}
          </p>
        </div>

        {/* Remaining / over */}
        <div className="md:border-l md:border-border md:pl-6 pt-4 md:pt-0 border-t md:border-t-0 border-border">
          <p className="font-mono text-[10px] text-faint uppercase tracking-[0.14em] mb-2">
            {isOverAll ? t('budget.overBy') : t('budget.remaining')}
          </p>
          <Amount
            value={remainOrOver}
            size={22}
            weight={500}
            style={{ color: isOverAll ? 'var(--color-negative)' : 'var(--color-accent)' }}
          />
        </div>

        {/* Total progress */}
        <div className="md:border-l md:border-border md:pl-6 pt-4 md:pt-0 border-t md:border-t-0 border-border">
          <p className="font-mono text-[10px] text-faint uppercase tracking-[0.12em] mb-2">
            {t('budget.used', { pct: usedPct })}
          </p>
          <ProgressBar pct={totalLimit > 0 ? totalSpent / totalLimit : 0} over={isOverAll} height={6} />
          <div className="flex gap-2 mt-3 flex-wrap">
            {exceeded > 0 && (
              <span className="font-mono text-[10px] text-negative">⚠ {t('budget.countOver', { count: exceeded })}</span>
            )}
            {warning > 0 && (
              <span className="font-mono text-[10px] text-warning">⚠ {t('budget.countNear', { count: warning })}</span>
            )}
            {!exceeded && !warning && (
              <span className="font-mono text-[10px] text-positive">✓ {t('budget.allOnTrack')}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
