import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  useRecurringRules, useCreateRecurring, useUpdateRecurring,
  useToggleRecurring, useDeleteRecurring,
} from '@/hooks/useRecurring'
import { useWallets } from '@/hooks/useWallets'
import { useCategories } from '@/hooks/useCategories'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { SectionLabel, Pill, Amount } from '@/design-system'
import { RecurringCard } from '@/components/recurring/recurring-card'
import { RecurringForm, type RecurringFormData } from '@/components/recurring/recurring-form'
import { useIsMd } from '@/hooks/use-media-query'
import type { RecurringRule, CreateRecurringRequest } from '@/types'

// ── Summary tile ──────────────────────────────────────────────────────────
function SummaryTile({
  label, value, sub, accent,
}: {
  label: string
  value: string | number
  sub?: string
  accent?: 'positive' | 'negative'
}) {
  const colorClass = accent === 'positive'
    ? 'text-positive'
    : accent === 'negative'
      ? 'text-negative'
      : 'text-ink'

  return (
    <div className="bg-surface border border-line rounded-md p-4">
      <p className="text-[10px] font-extrabold uppercase tracking-[0.07em] text-muted mb-1">{label}</p>
      <p className={`text-base font-extrabold tabular-nums ${colorClass}`}>{value}</p>
      {sub && <p className="text-[10px] font-semibold text-muted mt-0.5">{sub}</p>}
    </div>
  )
}

// ── Desktop table row ─────────────────────────────────────────────────────
function RecurringTableRow({
  rule, onEdit, onDelete, onToggle,
}: {
  rule: RecurringRule
  onEdit: () => void
  onDelete: () => void
  onToggle: () => void
}) {
  const { t } = useTranslation()
  const isActive = rule.status === 'ACTIVE'
  const color = rule.category?.color ?? '#94A3B8'

  function formatDate(d: string | null | undefined) {
    if (!d) return '—'
    const [y, m, day] = d.split('-')
    return `${day}/${m}/${y}`
  }

  return (
    <tr
      className="border-b border-line last:border-0 hover:bg-hover transition-colors"
      style={{ opacity: isActive ? 1 : 0.55 }}
    >
      {/* Rule name + chip */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span
            className="w-8 h-8 rounded-sm flex items-center justify-center text-base shrink-0"
            style={{ backgroundColor: `${color}1f`, color }}
            aria-hidden="true"
          >
            {rule.category?.icon ?? '🔁'}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-bold text-ink truncate">
              {rule.category?.name ?? t('recurring.categoryFallback')}
            </p>
            <p className="text-[10px] font-semibold text-muted truncate">
              {rule.wallet?.name ?? '—'}
            </p>
          </div>
        </div>
      </td>

      {/* Frequency chip */}
      <td className="px-4 py-3">
        <span className="text-[10px] font-extrabold uppercase tracking-[0.07em] bg-surface-2 text-sub px-2 py-1 rounded-sm whitespace-nowrap">
          {t(`recurring.frequencies.${rule.frequency}`)}
        </span>
      </td>

      {/* Next occurrence */}
      <td className="px-4 py-3 text-sm font-semibold text-sub tabular-nums">
        {formatDate(rule.nextOccurrence)}
      </td>

      {/* Signed amount */}
      <td className="px-4 py-3 text-right">
        <Amount
          value={rule.amount}
          size={14}
          weight={700}
          sign
          style={{ color: rule.type === 'EXPENSE' ? 'var(--negative)' : 'var(--positive)' }}
        />
      </td>

      {/* Toggle */}
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            role="switch"
            aria-checked={isActive}
            aria-label={isActive ? t('recurring.pause') : t('recurring.activate')}
            onClick={onToggle}
            className="relative inline-flex items-center min-w-[44px] min-h-[44px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-full"
          >
            <span className={`w-9 h-5 rounded-full transition-colors motion-reduce:transition-none ${
              isActive ? 'bg-primary' : 'bg-surface-2 border border-line'
            }`} />
            <span
              aria-hidden="true"
              className={`absolute w-3.5 h-3.5 bg-white rounded-full shadow-sm transition-transform motion-reduce:transition-none ${
                isActive ? 'translate-x-[18px]' : 'translate-x-[3px]'
              }`}
            />
          </button>
          <button
            onClick={onEdit}
            className="text-[11px] font-bold text-sub hover:text-primary transition-colors px-1 py-1 min-h-[44px]"
          >
            {t('common.edit')}
          </button>
          <button
            onClick={onDelete}
            className="text-[11px] font-bold text-negative hover:underline transition-colors px-1 py-1 min-h-[44px]"
          >
            {t('common.delete')}
          </button>
        </div>
      </td>
    </tr>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────
export default function RecurringPage() {
  const { t } = useTranslation()
  const { data: rules, isLoading } = useRecurringRules()
  const { data: wallets } = useWallets()
  const { data: categories } = useCategories()
  const toggle = useToggleRecurring()
  const deleteR = useDeleteRecurring()
  const createRecurring = useCreateRecurring()
  const updateRecurring = useUpdateRecurring()
  const isDesktop = useIsMd()

  const [showForm,    setShowForm]    = useState(false)
  const [editTarget,  setEditTarget]  = useState<RecurringRule | null>(null)

  const handleToggle = (rule: RecurringRule) => {
    const newStatus = rule.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE'
    toggle.mutate({ id: rule.id, status: newStatus }, {
      onSuccess: () => toast.success(
        newStatus === 'ACTIVE' ? t('recurring.activated') : t('recurring.pausedToast')
      ),
      onError: (e: Error) => toast.error(e.message),
    })
  }

  const handleDelete = (rule: RecurringRule) => {
    if (!confirm(t('recurring.deleteConfirm', { name: rule.category?.name ?? '' }))) return
    deleteR.mutate(rule.id, {
      onSuccess: () => toast.success(t('recurring.deleted')),
      onError: (e: Error) => toast.error(e.message),
    })
  }

  const handleSubmit = (data: RecurringFormData) => {
    if (editTarget) {
      const payload: CreateRecurringRequest & { id: number } = { id: editTarget.id, ...data }
      updateRecurring.mutate(payload, {
        onSuccess: () => { toast.success(t('recurring.updated')); setShowForm(false); setEditTarget(null) },
        onError: (e: Error) => toast.error(e.message),
      })
    } else {
      createRecurring.mutate(data as CreateRecurringRequest, {
        onSuccess: () => { toast.success(t('recurring.created')); setShowForm(false) },
        onError: (e: Error) => toast.error(e.message),
      })
    }
  }

  const openCreate = () => { setEditTarget(null); setShowForm(true) }

  const activeRules  = rules?.filter((r) => r.status === 'ACTIVE')  ?? []
  const pausedRules  = rules?.filter((r) => r.status !== 'ACTIVE')  ?? []
  const incomeRules  = rules?.filter((r) => r.type === 'INCOME')    ?? []
  const expenseRules = rules?.filter((r) => r.type === 'EXPENSE')   ?? []
  const totalIncome  = incomeRules.reduce((s, r)  => s + r.amount, 0)
  const totalExpense = expenseRules.reduce((s, r) => s + r.amount, 0)

  const allRules = [...activeRules, ...pausedRules]

  return (
    <div className="page-enter space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.07em] text-muted mb-0.5">
            {t('recurring.subtitle')}
          </p>
          <h1 className="text-xl font-extrabold tracking-[-0.02em] text-ink leading-tight">
            {t('recurring.title')}
          </h1>
        </div>
        <Pill accent onClick={openCreate} className="min-h-[44px]">
          + {t('recurring.createNew')}
        </Pill>
      </div>

      {/* Summary tiles */}
      {!isLoading && (rules?.length ?? 0) > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <SummaryTile
            label={t('recurring.running')}
            value={activeRules.length}
          />
          <SummaryTile
            label={t('recurring.fixedIncome')}
            value={`+${totalIncome.toLocaleString('vi-VN')}₫`}
            accent="positive"
          />
          <SummaryTile
            label={t('recurring.fixedExpense')}
            value={`−${totalExpense.toLocaleString('vi-VN')}₫`}
            accent="negative"
          />
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-surface border border-line rounded-md p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="w-9 h-9 rounded-sm shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-1/3" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
                <Skeleton className="w-9 h-5 rounded-full" />
              </div>
              <Skeleton className="h-px w-full" />
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-16 rounded-sm" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!isLoading && rules?.length === 0 && (
        <EmptyState
          icon="🔁"
          title={t('recurring.noRecurring')}
          description={t('recurring.noRecurringDesc')}
          examples={[
            t('recurring.exampleSalary'),
            t('recurring.exampleRent'),
            t('recurring.exampleSubscription'),
          ]}
          action={
            <Pill accent onClick={openCreate}>
              + {t('recurring.createFirst')}
            </Pill>
          }
        />
      )}

      {/* Single render path: desktop table OR mobile cards — never both */}
      {!isLoading && allRules.length > 0 && (
        isDesktop ? (
          <div className="bg-surface border border-line rounded-md overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-line bg-surface-2">
                  <th className="px-4 py-2.5 text-[10px] font-extrabold uppercase tracking-[0.07em] text-muted">
                    {t('recurring.columnRule')}
                  </th>
                  <th className="px-4 py-2.5 text-[10px] font-extrabold uppercase tracking-[0.07em] text-muted">
                    {t('recurring.columnFreq')}
                  </th>
                  <th className="px-4 py-2.5 text-[10px] font-extrabold uppercase tracking-[0.07em] text-muted">
                    {t('recurring.columnNext')}
                  </th>
                  <th className="px-4 py-2.5 text-[10px] font-extrabold uppercase tracking-[0.07em] text-muted text-right">
                    {t('recurring.columnAmount')}
                  </th>
                  <th className="px-4 py-2.5 text-right" />
                </tr>
              </thead>
              <tbody>
                {allRules.map((r) => (
                  <RecurringTableRow
                    key={r.id}
                    rule={r}
                    onEdit={() => { setEditTarget(r); setShowForm(true) }}
                    onDelete={() => handleDelete(r)}
                    onToggle={() => handleToggle(r)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="space-y-5">
            {activeRules.length > 0 && (
              <div className="space-y-3">
                <SectionLabel right={t('recurring.rulesCount', { count: activeRules.length })}>
                  {t('recurring.active')}
                </SectionLabel>
                {activeRules.map((r) => (
                  <RecurringCard
                    key={r.id}
                    rule={r}
                    onEdit={() => { setEditTarget(r); setShowForm(true) }}
                    onDelete={() => handleDelete(r)}
                    onToggle={() => handleToggle(r)}
                  />
                ))}
              </div>
            )}
            {pausedRules.length > 0 && (
              <div className="space-y-3">
                <SectionLabel right={t('recurring.rulesCount', { count: pausedRules.length })}>
                  {t('recurring.paused')}
                </SectionLabel>
                {pausedRules.map((r) => (
                  <RecurringCard
                    key={r.id}
                    rule={r}
                    onEdit={() => { setEditTarget(r); setShowForm(true) }}
                    onDelete={() => handleDelete(r)}
                    onToggle={() => handleToggle(r)}
                  />
                ))}
              </div>
            )}
          </div>
        )
      )}

      {/* Form BottomSheet */}
      <BottomSheet
        open={showForm}
        onClose={() => { setShowForm(false); setEditTarget(null) }}
        title={editTarget ? t('recurring.editRecurring') : t('recurring.createRecurring')}
      >
        <RecurringForm
          editRule={editTarget ?? undefined}
          wallets={wallets ?? []}
          categories={categories ?? []}
          onClose={() => { setShowForm(false); setEditTarget(null) }}
          onSubmit={handleSubmit}
        />
      </BottomSheet>
    </div>
  )
}
