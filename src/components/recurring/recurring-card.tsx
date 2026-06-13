import { useTranslation } from 'react-i18next'
import { Amount, CategoryChip } from '@/design-system'
import type { RecurringRule } from '@/types'

function formatDate(d: string | null | undefined) {
  if (!d) return '—'
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${y}`
}

// Derive hue from category color hex for CategoryChip
function hueFromHex(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const d = max - min
  if (d === 0) return 0
  let h = 0
  if (max === r) h = ((g - b) / d) % 6
  else if (max === g) h = (b - r) / d + 2
  else h = (r - g) / d + 4
  return Math.round(h * 60 + 360) % 360
}

// ── Active/paused toggle — pill track, knob slides L↔R ───────────────────
// Spec: track bg-surface-2 (off) / bg-primary (on); knob bg-white rounded-full;
// transition; role="switch" + aria-checked; ≥44px hit area; reduced-motion aware.
function RecurringToggle({
  isActive,
  onToggle,
  labelOn,
  labelOff,
}: {
  isActive: boolean
  onToggle: () => void
  labelOn: string
  labelOff: string
}) {
  return (
    <button
      role="switch"
      aria-checked={isActive}
      aria-label={isActive ? labelOn : labelOff}
      onClick={onToggle}
      className="relative inline-flex items-center min-w-[44px] min-h-[44px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-full"
    >
      {/* Track */}
      <span
        className={`w-9 h-5 rounded-full transition-colors motion-reduce:transition-none ${
          isActive ? 'bg-primary' : 'bg-surface-2 border border-line'
        }`}
      />
      {/* Knob */}
      <span
        aria-hidden="true"
        className={`absolute w-3.5 h-3.5 bg-white rounded-full shadow-sm transition-transform motion-reduce:transition-none ${
          isActive ? 'translate-x-[18px]' : 'translate-x-[3px]'
        }`}
      />
    </button>
  )
}

// ── Card ─────────────────────────────────────────────────────────────────
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
  const color = rule.category?.color ?? '#94A3B8'
  const hue = hueFromHex(color.length === 7 ? color : '#94A3B8')

  // Paused rows render at 55% opacity per spec §13
  return (
    <div
      className="bg-surface border border-line rounded-md p-4 space-y-3 transition-all hover:shadow-pop"
      style={{ opacity: isActive ? 1 : 0.55 }}
    >
      {/* Top row: chip + name/wallet + toggle */}
      <div className="flex items-center gap-3">
        <CategoryChip
          cat="other"
          name={rule.category?.name ?? 'R'}
          hue={hue}
          size={36}
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-ink truncate">
            {rule.category?.name ?? t('recurring.categoryFallback')}
          </p>
          <p className="text-[11px] font-semibold text-sub truncate">
            {rule.wallet?.name ?? '—'}
          </p>
        </div>

        <RecurringToggle
          isActive={isActive}
          onToggle={onToggle}
          labelOn={t('recurring.pause')}
          labelOff={t('recurring.activate')}
        />
      </div>

      {/* Amount + frequency chip */}
      <div className="flex items-center justify-between border-t border-line pt-3">
        <Amount
          value={rule.amount}
          size={15}
          weight={700}
          sign
          style={{ color: rule.type === 'EXPENSE' ? 'var(--negative)' : 'var(--positive)' }}
        />
        <span className="text-[10px] font-extrabold uppercase tracking-[0.07em] text-sub bg-surface-2 px-2 py-1 rounded-sm">
          {t(`recurring.frequencies.${rule.frequency}`)}
        </span>
      </div>

      {/* Next occurrence + note */}
      {(rule.nextOccurrence || rule.note) && (
        <div className="space-y-0.5">
          {rule.nextOccurrence && (
            <p className="text-[11px] font-semibold text-sub">
              {t('recurring.nextLabel')}:{' '}
              <span className="text-ink font-bold">{formatDate(rule.nextOccurrence)}</span>
            </p>
          )}
          {rule.note && (
            <p className="text-[11px] font-semibold text-muted italic">"{rule.note}"</p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-1 border-t border-line">
        <button
          onClick={onEdit}
          className="flex-1 text-center text-[11px] font-extrabold uppercase tracking-[0.05em] text-sub hover:text-primary py-1 transition-colors min-h-[44px]"
        >
          {t('common.edit')}
        </button>
        <button
          onClick={onDelete}
          className="flex-1 text-center text-[11px] font-extrabold uppercase tracking-[0.05em] text-negative hover:underline py-1 transition-colors min-h-[44px]"
        >
          {t('common.delete')}
        </button>
      </div>
    </div>
  )
}
