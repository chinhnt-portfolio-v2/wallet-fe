import { useTranslation } from 'react-i18next'
import { Card } from '@/components/ui/Card'
import { formatCurrency } from '@/lib/utils'
import type { BudgetJar } from '@/types'

interface JarCardProps {
  jar: BudgetJar
  onEdit: () => void
  onDelete: () => void
}

export function JarCard({ jar, onEdit, onDelete }: JarCardProps) {
  const { t } = useTranslation()
  const spentPct = jar.allocated > 0
    ? Math.min((jar.spent / jar.allocated) * 100, 100)
    : jar.spent > 0 ? 100 : 0

  const isExceeded = jar.status === 'exceeded'
  const barColor = isExceeded ? '#F43F5E' : jar.color

  return (
    <Card className="p-4 space-y-3">
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0"
            style={{ backgroundColor: `${jar.color}20` }}
          >
            {jar.icon}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-primary truncate">{jar.name}</p>
            <p className="text-xs text-secondary">{t('budget.jarPercentIncome', { pct: jar.percentage })}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onEdit}
            className="text-xs text-muted hover:text-accent px-2 py-1 transition-colors"
          >
            {t('common.edit')}
          </button>
          <button
            onClick={onDelete}
            className="text-xs text-negative hover:underline px-2 py-1"
          >
            {t('common.delete')}
          </button>
        </div>
      </div>

      {/* Amounts row */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-secondary">{t('budget.spent')}</p>
          <p className="text-sm font-semibold" style={{ color: isExceeded ? '#F43F5E' : 'var(--color-primary)' }}>
            {formatCurrency(jar.spent)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-secondary">{t('budget.jarAllocated')}</p>
          <p className="text-sm font-medium text-secondary">{formatCurrency(jar.allocated)}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${spentPct}%`, backgroundColor: barColor }}
          />
        </div>
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs font-medium" style={{ color: barColor }}>
            {Math.round(spentPct)}%
          </p>
          {isExceeded ? (
            <p className="text-xs text-negative font-medium">{t('budget.jarExceeded')}</p>
          ) : (
            <p className="text-xs text-secondary">
              {t('budget.jarRemaining', { amount: formatCurrency(jar.remaining) })}
            </p>
          )}
        </div>
      </div>

      {/* Category chips */}
      {jar.categories.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {jar.categories.map((cat) => (
            <span
              key={cat.id}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
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
    </Card>
  )
}
