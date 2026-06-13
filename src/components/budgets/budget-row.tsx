import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useUpdateBudget } from '@/hooks/useBudgets'
import { formatCurrency } from '@/lib/utils'
import { Amount, CategoryChip, ProgressBar } from '@/design-system'
import type { useBudgetWithSpending } from '@/hooks/useBudgets'

type SpentBudget = NonNullable<ReturnType<typeof useBudgetWithSpending>['data']>[number]

interface BudgetRowProps {
  budget: SpentBudget
  onEdit: () => void
  onDelete: () => void
}

/**
 * Responsive budget row.
 *
 * Mobile (<768px): a stacked card so the figures never overlap (audit §2.9 fix) —
 * header (chip + name + pct), progress bar, then spent / limit on one line.
 * Desktop (≥768px): the original dense grid row.
 *
 * The limit is inline-editable on both layouts; the value is rounded to the
 * nearest 1.000 ₫ on commit.
 */
export function BudgetRow({ budget, onEdit, onDelete }: BudgetRowProps) {
  const { t } = useTranslation()
  const pct = (budget.percentage ?? 0) / 100
  const isOver = (budget.status ?? 'ok') === 'exceeded'
  const isWarn = (budget.status ?? 'ok') === 'warning'

  const statusLabel = isOver
    ? t('budget.overBudget')
    : isWarn
      ? t('budget.nearLimit')
      : t('budget.onTrack')

  const statusClass = isOver ? 'text-negative' : isWarn ? 'text-warning' : 'text-positive'

  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(budget.monthlyLimit)
  const update = useUpdateBudget()

  const commitLimit = () => {
    const value = Math.max(0, Math.round(draft / 1000) * 1000)
    if (value !== budget.monthlyLimit) {
      update.mutate(
        { id: budget.id, monthlyLimit: value, period: budget.period, categoryId: budget.categoryId, alertThreshold: budget.alertThreshold ?? 80 },
        {
          onSuccess: () => toast.success(t('budget.limitUpdated')),
          onError: (e: Error) => toast.error(e.message),
        }
      )
    }
    setEditing(false)
  }

  const catName = budget.category?.name ?? 'Other'
  const catId = (budget.category?.name ?? 'other').toLowerCase()

  const pctText = `${Math.round(budget.percentage ?? 0)}%`
  const progressColor = isWarn ? 'var(--color-warning)' : 'var(--color-positive)'

  const limitField = editing ? (
    <input
      autoFocus
      type="text"
      inputMode="numeric"
      value={draft}
      onChange={(e) => setDraft(Number(e.target.value.replace(/\D/g, '')) || 0)}
      onBlur={commitLimit}
      onKeyDown={(e) => e.key === 'Enter' && commitLimit()}
      className="w-full text-right font-mono text-[13px] text-primary bg-surface-2 border border-accent rounded px-1.5 py-0.5 outline-none"
    />
  ) : (
    <button
      onClick={() => { setDraft(budget.monthlyLimit); setEditing(true) }}
      className="font-mono text-[13px] text-secondary hover:text-accent transition-colors tabular-nums text-right"
      title={t('budget.clickToEdit')}
    >
      {formatCurrency(budget.monthlyLimit)}
    </button>
  )

  return (
    <div className="border-t border-border group">
      {/* ── Mobile card (<768px) ──────────────────────────────────── */}
      <div className="flex md:hidden flex-col gap-2.5 px-4 py-3">
        <div className="flex items-center gap-3">
          <CategoryChip cat={catId} name={catName} size={28} className="shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="font-sans text-[14px] text-primary font-medium truncate">{catName}</p>
            <p className={`font-mono text-[11px] ${statusClass}`}>{statusLabel}</p>
          </div>
          <span className={`font-mono text-[12px] shrink-0 ${isOver ? 'text-negative' : 'text-muted'}`}>
            {pctText}
          </span>
        </div>
        <ProgressBar pct={pct} over={isOver} color={progressColor} height={4} />
        <div className="flex items-center justify-between gap-3">
          <span className="font-mono text-[11px] text-faint">
            {t('budget.spent')}{' '}
            <Amount value={budget.currentSpent ?? 0} size={12} weight={500}
              style={{ color: isOver ? 'var(--color-negative)' : 'var(--color-text)' }} />
            {' / '}
            <span className="text-muted">{formatCurrency(budget.monthlyLimit)}</span>
          </span>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={onEdit} className="font-mono text-[10px] text-muted hover:text-accent uppercase tracking-wide min-h-[44px] px-1">
              {t('common.edit')}
            </button>
            <button onClick={onDelete} className="font-mono text-[12px] text-negative/70 hover:text-negative min-h-[44px] px-1">
              ✕
            </button>
          </div>
        </div>
      </div>

      {/* ── Desktop grid (≥768px) ─────────────────────────────────── */}
      <div className="hidden md:flex items-center gap-3 px-4 py-3 hover:bg-surface-2/40 transition-colors">
        <span className="font-mono text-[12px] text-faint cursor-grab select-none shrink-0">⋮⋮</span>
        <CategoryChip cat={catId} name={catName} size={28} className="shrink-0" />
        <div className="min-w-0 w-28 shrink-0">
          <p className="font-sans text-[13px] text-primary font-medium truncate">{catName}</p>
          <p className={`font-mono text-[10px] ${statusClass}`}>{statusLabel}</p>
        </div>
        <div className="w-28 shrink-0">
          <p className="font-mono text-[10px] text-faint uppercase tracking-[0.1em] mb-0.5">{t('budget.spent')}</p>
          <Amount value={budget.currentSpent ?? 0} size={13} weight={500}
            style={{ color: isOver ? 'var(--color-negative)' : 'var(--color-text)' }} />
        </div>
        <div className="flex-1 min-w-0">
          <ProgressBar pct={pct} over={isOver} color={progressColor} height={4} />
          <p className="font-mono text-[10px] text-muted mt-1">{pctText}</p>
        </div>
        <div className="w-32 shrink-0 text-right">
          <p className="font-mono text-[10px] text-faint uppercase tracking-[0.1em] mb-0.5">{t('budget.limit')}</p>
          {limitField}
        </div>
        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onEdit} className="font-mono text-[10px] text-muted hover:text-accent px-2 py-1 uppercase tracking-wide">
            {t('common.edit')}
          </button>
          <button onClick={onDelete} className="font-mono text-[10px] text-negative/60 hover:text-negative px-2 py-1 uppercase tracking-wide">
            ✕
          </button>
        </div>
      </div>
    </div>
  )
}
