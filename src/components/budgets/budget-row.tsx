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
 * Budget row — mobile card + desktop grid row.
 * Progress bar color: ok=positive / warning=warning / exceeded=negative.
 * Status tag beside name (not color-only).
 */
export function BudgetRow({ budget, onEdit, onDelete }: BudgetRowProps) {
  const { t } = useTranslation()
  const status = budget.status ?? 'ok'
  const pct = (budget.percentage ?? 0) / 100
  const isOver = status === 'exceeded'
  const isWarn = status === 'warning'

  const statusLabel = isOver ? t('budget.overBudget') : isWarn ? t('budget.nearLimit') : t('budget.onTrack')
  const statusClass = isOver
    ? 'text-negative bg-negative-soft'
    : isWarn
      ? 'text-warning bg-warning-soft'
      : 'text-positive bg-positive-soft'
  const barColor = isOver ? 'var(--negative)' : isWarn ? 'var(--warning)' : 'var(--positive)'

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

  const limitField = editing ? (
    <input
      autoFocus
      type="text"
      inputMode="numeric"
      value={draft}
      onChange={(e) => setDraft(Number(e.target.value.replace(/\D/g, '')) || 0)}
      onBlur={commitLimit}
      onKeyDown={(e) => e.key === 'Enter' && commitLimit()}
      className="w-full text-right text-[13px] text-ink bg-surface-2 border border-primary rounded-xs px-1.5 py-0.5 outline-none tabular-nums"
    />
  ) : (
    <button
      onClick={() => { setDraft(budget.monthlyLimit); setEditing(true) }}
      className="text-[13px] text-sub hover:text-primary transition-colors tabular-nums text-right"
      title={t('budget.clickToEdit')}
    >
      {formatCurrency(budget.monthlyLimit)}
    </button>
  )

  return (
    <div className="border-t border-line group">
      {/* ── Mobile card (<768px) ── */}
      <div className="flex md:hidden flex-col gap-2 px-4 py-3">
        <div className="flex items-center gap-3">
          <CategoryChip cat={catId} name={catName} size={28} className="shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-[13px] font-semibold text-ink truncate">{catName}</p>
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${statusClass}`}>
                {statusLabel}
              </span>
            </div>
          </div>
          <span className={`text-[12px] font-semibold shrink-0 tabular-nums ${isOver ? 'text-negative' : isWarn ? 'text-warning' : 'text-muted'}`}>
            {pctText}
          </span>
        </div>

        <ProgressBar pct={pct} over={isOver} color={barColor} height={4} />

        <div className="flex items-center justify-between gap-3">
          <span className="text-[11px] text-muted tabular-nums">
            <Amount value={budget.currentSpent ?? 0} size={11} weight={500}
              style={{ color: isOver ? 'var(--negative)' : 'var(--ink)' }} />
            {' / '}
            <span className="text-muted">{formatCurrency(budget.monthlyLimit)}</span>
          </span>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={onEdit}
              className="text-[10px] font-bold text-muted hover:text-primary uppercase tracking-wide min-h-[44px] px-1">
              {t('common.edit')}
            </button>
            <button onClick={onDelete}
              className="text-[12px] text-negative/70 hover:text-negative min-h-[44px] px-1">
              ✕
            </button>
          </div>
        </div>
      </div>

      {/* ── Desktop grid (≥768px) ── */}
      <div className="hidden md:flex items-center gap-3 px-4 py-3 hover:bg-hover/50 transition-colors">
        <span className="text-[12px] text-muted cursor-grab select-none shrink-0">⋮⋮</span>
        <CategoryChip cat={catId} name={catName} size={28} className="shrink-0" />
        <div className="min-w-0 w-28 shrink-0">
          <p className="text-[13px] font-semibold text-ink truncate">{catName}</p>
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${statusClass}`}>
            {statusLabel}
          </span>
        </div>
        <div className="w-28 shrink-0">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-muted mb-0.5">
            {t('budget.spent')}
          </p>
          <Amount value={budget.currentSpent ?? 0} size={13} weight={500}
            style={{ color: isOver ? 'var(--negative)' : 'var(--ink)' }} />
        </div>
        <div className="flex-1 min-w-0">
          <ProgressBar pct={pct} over={isOver} color={barColor} height={4} />
          <p className={`text-[10px] mt-0.5 tabular-nums font-semibold ${isOver ? 'text-negative' : isWarn ? 'text-warning' : 'text-muted'}`}>
            {pctText}
          </p>
        </div>
        <div className="w-32 shrink-0 text-right">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-muted mb-0.5">
            {t('budget.limit')}
          </p>
          {limitField}
        </div>
        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onEdit}
            className="text-[10px] font-bold text-muted hover:text-primary px-2 py-1 uppercase tracking-wide">
            {t('common.edit')}
          </button>
          <button onClick={onDelete}
            className="text-[10px] text-negative/60 hover:text-negative px-2 py-1">
            ✕
          </button>
        </div>
      </div>
    </div>
  )
}
