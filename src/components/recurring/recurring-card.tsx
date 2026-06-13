import { useTranslation } from 'react-i18next'
import { Amount, CategoryChip } from '@/design-system'
import type { RecurringRule } from '@/types'

function formatDate(d: string | null | undefined) {
  if (!d) return '—'
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${y}`
}

export function RecurringCard({
  rule,
  onEdit,
  onDelete,
  onToggle,
}: {
  rule: RecurringRule
  onEdit: () => void
  onDelete: () => void
  onToggle: () => void
}) {
  const { t } = useTranslation()
  const isActive = rule.status === 'ACTIVE'
  // Derive hue from category color for CategoryChip
  const color = rule.category?.color ?? '#94A3B8'
  const hue = color
    ? Math.round((parseInt(color.slice(1, 3), 16) / 255) * 120 +
        (parseInt(color.slice(3, 5), 16) / 255) * 60 +
        (parseInt(color.slice(5, 7), 16) / 255) * 180) % 360
    : 200

  return (
    <div className="bg-surface border border-border rounded-lg p-4 space-y-3 transition-colors hover:border-border-hi">
      {/* Top row: category chip + name + toggle */}
      <div className="flex items-center gap-3">
        <CategoryChip cat="other" name={rule.category?.name ?? 'R'} hue={hue} size={36} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-primary truncate">
            {rule.category?.name ?? t('recurring.categoryFallback')}
          </p>
          <p className="font-mono text-[11px] text-secondary truncate">
            {rule.wallet?.name ?? '—'}
          </p>
        </div>

        {/* Status pill + toggle */}
        <div className="flex items-center gap-2 shrink-0">
          <span className={`font-mono text-[11px] uppercase tracking-wide px-2 py-0.5 rounded ${
            isActive ? 'bg-positive/10 text-positive' : 'bg-warning/10 text-warning'
          }`}>
            {isActive ? t('recurring.activeStatus') : t('recurring.pausedStatus')}
          </span>
          <button
            role="switch"
            aria-checked={isActive}
            aria-label={isActive ? t('recurring.pause') : t('recurring.activate')}
            onClick={onToggle}
            className={`w-9 h-5 rounded-full transition-all relative shrink-0 ${isActive ? 'bg-positive' : 'bg-border'}`}
          >
            <span className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-all ${
              isActive ? 'right-0.5' : 'left-0.5'
            }`} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Amount + frequency */}
      <div className="flex items-center justify-between border-t border-border pt-3">
        <Amount
          value={rule.amount}
          size={16}
          weight={600}
          sign
          style={{ color: rule.type === 'EXPENSE' ? 'var(--color-negative)' : 'var(--color-positive)' }}
        />
        <span className="font-mono text-[11px] text-secondary bg-surface-2 px-2 py-1 rounded">
          {t(`recurring.frequencies.${rule.frequency}`)}
        </span>
      </div>

      {/* Next occurrence + note */}
      {(rule.nextOccurrence || rule.note) && (
        <div className="space-y-1">
          {rule.nextOccurrence && (
            <p className="font-mono text-[11px] text-secondary">
              {t('recurring.nextLabel')}: <span className="text-primary">{formatDate(rule.nextOccurrence)}</span>
            </p>
          )}
          {rule.note && (
            <p className="font-mono text-[11px] text-secondary italic">"{rule.note}"</p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-1 border-t border-border">
        <button onClick={onEdit} className="flex-1 text-center font-mono text-[11px] uppercase tracking-wide text-secondary hover:text-accent py-1 transition-colors">
          {t('common.edit')}
        </button>
        <button onClick={onDelete} className="flex-1 text-center font-mono text-[11px] uppercase tracking-wide text-negative hover:underline py-1 transition-colors">
          {t('common.delete')}
        </button>
      </div>
    </div>
  )
}
