import { useTranslation } from 'react-i18next'
import { formatCurrency } from '@/lib/utils'
import { ProgressBar } from '@/design-system'
import type { BudgetJar } from '@/types'

interface JarCardProps {
  jar: BudgetJar
  onEdit: () => void
  onDelete: () => void
}

/**
 * Savings jar card — % badge + name + allocated + spent bar.
 * Spec §7: 6-jar grid (NEC/FFA/EDU/PLAY/GIVE/LTSS).
 * Color: jar.color (fixed per jar type); exceeded → negative.
 */
export function JarCard({ jar, onEdit, onDelete }: JarCardProps) {
  const { t } = useTranslation()
  const spentPct = jar.allocated > 0
    ? Math.min((jar.spent / jar.allocated) * 100, 100)
    : jar.spent > 0 ? 100 : 0

  const isExceeded = jar.status === 'exceeded'
  const barColor = isExceeded ? 'var(--negative)' : jar.color

  return (
    <div className="rounded-md border border-line bg-surface p-4 space-y-3 hover:shadow-pop transition-shadow">
      {/* header: icon + name + % badge + actions */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          {/* icon chip */}
          <div
            className="w-9 h-9 rounded-xs flex items-center justify-center text-base shrink-0"
            style={{ backgroundColor: `${jar.color}20` }}
            aria-hidden="true"
          >
            {jar.icon}
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-ink truncate">{jar.name}</p>
            <p className="text-[10px] text-muted">{t('budget.jarPercentIncome', { pct: jar.percentage })}</p>
          </div>
        </div>

        {/* % badge */}
        <div className="flex items-center gap-2 shrink-0">
          <span
            className="text-[11px] font-extrabold tabular-nums px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: `${jar.color}18`,
              color: isExceeded ? 'var(--negative)' : jar.color,
            }}
          >
            {Math.round(spentPct)}%
          </span>
        </div>
      </div>

      {/* amounts */}
      <div className="flex items-center justify-between text-[11px]">
        <div>
          <p className="text-muted mb-0.5">{t('budget.spent')}</p>
          <p
            className="font-semibold tabular-nums"
            style={{ color: isExceeded ? 'var(--negative)' : jar.color }}
          >
            {formatCurrency(jar.spent)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-muted mb-0.5">{t('budget.jarAllocated')}</p>
          <p className="font-medium text-sub tabular-nums">{formatCurrency(jar.allocated)}</p>
        </div>
      </div>

      {/* progress bar */}
      <ProgressBar pct={spentPct / 100} over={isExceeded} color={barColor} height={4} />

      {/* remaining / exceeded label */}
      <p className="text-[10px] tabular-nums" style={{ color: isExceeded ? 'var(--negative)' : 'var(--muted)' }}>
        {isExceeded
          ? t('budget.jarExceeded')
          : t('budget.jarRemaining', { amount: formatCurrency(jar.remaining) })}
      </p>

      {/* category chips */}
      {jar.categories.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {jar.categories.map((cat) => (
            <span
              key={cat.id}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
              style={{
                backgroundColor: `${cat.color}18`,
                border: `1px solid ${cat.color}40`,
                color: cat.color,
              }}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </span>
          ))}
        </div>
      )}

      {/* actions */}
      <div className="flex gap-3 pt-0.5 border-t border-line">
        <button
          onClick={onEdit}
          className="text-[10px] font-bold text-muted hover:text-primary uppercase tracking-wide transition-colors min-h-[36px]"
        >
          {t('common.edit')}
        </button>
        <button
          onClick={onDelete}
          className="text-[10px] text-negative/70 hover:text-negative transition-colors min-h-[36px]"
        >
          {t('common.delete')}
        </button>
      </div>
    </div>
  )
}
