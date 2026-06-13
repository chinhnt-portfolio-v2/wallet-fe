import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import { toast } from 'sonner'
import { useBudgetWithSpending, useCreateBudget, useUpdateBudget, useDeleteBudget } from '@/hooks/useBudgets'
import { useCategories } from '@/hooks/useCategories'
import { useBudgetJars, useCreatePresetJars, useDeleteBudgetJar } from '@/hooks/use-budget-jars'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { JarCard } from '@/components/budgets/jar-card'
import { JarPresetModal } from '@/components/budgets/jar-preset-modal'
import { BudgetRow } from '@/components/budgets/budget-row'
import { BudgetSummary } from '@/components/budgets/budget-summary'
import { formatCurrency } from '@/lib/utils'
import {
  Amount,
  SectionLabel,
  ProgressBar,
  Pill,
} from '@/design-system'

// ── Helpers ───────────────────────────────────────────────────────────────────

// A budget row enriched with frontend-computed spending fields.
type SpentBudget = NonNullable<ReturnType<typeof useBudgetWithSpending>['data']>[number]

function getPeriod(year: number, month: number) {
  return `${year}-${String(month).padStart(2, '0')}`
}

function formatPeriod(period: string, t: TFunction) {
  const [year, month] = period.split('-')
  return `${t(`budget.months.${parseInt(month)}`)} ${year}`
}

// ── Budget form ──────────────────────────────────────────────────────────────

function BudgetForm({
  editBudget,
  categories,
  onClose,
  onSubmit,
}: {
  editBudget?: SpentBudget
  categories: { id: number; name: string; icon: string; color: string; type: string }[]
  onClose: () => void
  onSubmit: (data: { categoryId: number; monthlyLimit: number; alertThreshold: number }) => void
}) {
  const { t } = useTranslation()
  const create = useCreateBudget()
  const update = useUpdateBudget()
  const isEditing = !!editBudget

  const [categoryId, setCategoryId] = useState<number>(editBudget?.categoryId ?? 0)
  const [limit, setLimit] = useState(editBudget?.monthlyLimit?.toString() ?? '')
  const [threshold, setThreshold] = useState(editBudget?.alertThreshold ?? 80)

  const isPending = create.isPending || update.isPending

  const handleSubmit = () => {
    if (!categoryId) { toast.error(t('budget.selectCategory')); return }
    if (!limit || parseFloat(limit) <= 0) { toast.error(t('budget.enterAmount')); return }
    onSubmit({ categoryId, monthlyLimit: parseFloat(limit), alertThreshold: threshold })
  }

  const expenseCategories = categories.filter((c) => c.type === 'EXPENSE')

  return (
    <div className="space-y-4">
      <p className="font-mono text-[11px] text-muted uppercase tracking-widest">
        {isEditing ? t('budget.editBudget') : t('budget.newBudget')}
      </p>

      <div>
        <label className="block font-mono text-[10px] text-faint uppercase tracking-[0.12em] mb-2">
          {t('budget.category')}
        </label>
        <div className="flex flex-wrap gap-2">
          {expenseCategories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategoryId(c.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all font-mono ${
                categoryId === c.id
                  ? 'ring-2 ring-accent/60'
                  : 'opacity-70 hover:opacity-100'
              }`}
              style={{
                backgroundColor: `${c.color}18`,
                border: `1px solid ${c.color}55`,
                color: c.color,
              }}
            >
              <span>{c.icon}</span>
              <span>{c.name}</span>
            </button>
          ))}
        </div>
      </div>

      <Input
        label={t('budget.monthlyLimit')}
        type="number"
        inputMode="decimal"
        value={limit}
        onChange={(e) => setLimit(e.target.value)}
        placeholder="VD: 5,000,000"
      />
      {limit && (
        <p className="font-mono text-[11px] text-muted -mt-2">
          = {formatCurrency(parseFloat(limit) || 0)}
        </p>
      )}

      <div>
        <label className="block font-mono text-[10px] text-faint uppercase tracking-[0.12em] mb-2">
          {t('budget.alertAt')}
        </label>
        <div className="flex gap-2">
          {[80, 90, 100].map((t) => (
            <button
              key={t}
              onClick={() => setThreshold(t)}
              className={`flex-1 py-2 font-mono text-[11px] rounded-md border transition-all uppercase tracking-wide ${
                threshold === t
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-border text-muted hover:border-accent/50'
              }`}
            >
              {t}%
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button variant="outline" onClick={onClose} className="flex-1">{t('common.cancel')}</Button>
        <Button onClick={handleSubmit} disabled={isPending} className="flex-1">
          {isPending ? t('common.saving') : isEditing ? t('common.saveChanges') : t('budget.createBudget')}
        </Button>
      </div>
    </div>
  )
}

// ── Jars tab ─────────────────────────────────────────────────────────────────

function JarsTab({ period }: { period: string }) {
  const { t } = useTranslation()
  const { data, isLoading, isError, error, refetch } = useBudgetJars(period)
  const createPreset = useCreatePresetJars()
  const deleteJar = useDeleteBudgetJar()

  const [showPresetModal, setShowPresetModal] = useState(false)

  const jars = data?.jars ?? []
  const totalPct = data?.totalPercentage ?? 0
  const monthlyIncome = data?.monthlyIncome ?? 0
  const hasPreset = jars.some((j) => j.isPreset)

  const handleDelete = (id: number, name: string) => {
    if (!confirm(t('budget.deleteJarConfirm', { name }))) return
    deleteJar.mutate(id, {
      onSuccess: () => toast.success(t('budget.jarDeleted')),
      onError: (e: Error) => toast.error(e.message),
    })
  }

  const handlePresetConfirm = () => {
    createPreset.mutate(undefined, {
      onSuccess: () => { toast.success(t('budget.jarsCreated')); setShowPresetModal(false) },
      onError: (e: Error) => toast.error(e.message),
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => <div key={i} className="card p-4 h-28 animate-shimmer" />)}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="p-4 rounded-lg bg-negative/10 border border-negative/20 space-y-2 text-center">
        <p className="text-sm font-medium text-negative">{t('budget.jarsLoadError')}</p>
        <p className="text-xs text-muted">{error instanceof Error ? error.message : t('budget.serverError')}</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>{t('common.retry')}</Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {monthlyIncome > 0 && (
        <div className="p-3 rounded-lg bg-surface-2 flex items-center justify-between">
          <p className="font-mono text-[10px] text-faint uppercase tracking-[0.1em]">{t('budget.monthlyIncome')}</p>
          <Amount value={monthlyIncome} size={13} weight={500} style={{ color: 'var(--color-positive)' }} />
        </div>
      )}

      {jars.length > 0 && (
        <div className="p-3 rounded-lg bg-surface-2 space-y-1.5">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10px] text-faint uppercase tracking-[0.1em]">{t('budget.totalAllocation')}</p>
            <p className={`font-mono text-[11px] font-semibold ${Number(totalPct) > 100 ? 'text-negative' : 'text-primary'}`}>
              {totalPct}%
            </p>
          </div>
          <ProgressBar
            pct={Math.min(Number(totalPct), 100) / 100}
            over={Number(totalPct) > 100}
            height={4}
          />
        </div>
      )}

      {jars.length === 0 ? (
        <div className="text-center py-12 space-y-3">
          <p className="text-4xl">🏺</p>
          <p className="font-sans text-sm text-muted">{t('budget.noJars')}</p>
          <p className="font-mono text-[11px] text-faint">{t('budget.noJarsDesc')}</p>
          {!hasPreset && (
            <Pill accent onClick={() => setShowPresetModal(true)}>
              {t('budget.setupJars')}
            </Pill>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {jars.map((jar) => (
            <JarCard
              key={jar.id}
              jar={jar}
              onEdit={() => toast(t('budget.editJarWip'))}
              onDelete={() => handleDelete(jar.id, jar.name)}
            />
          ))}
        </div>
      )}

      <JarPresetModal
        open={showPresetModal}
        onClose={() => setShowPresetModal(false)}
        onConfirm={handlePresetConfirm}
        isPending={createPreset.isPending}
      />
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

type Tab = 'categories' | 'jars'

export default function BudgetsPage() {
  const { t } = useTranslation()
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [tab, setTab] = useState<Tab>('categories')
  const period = getPeriod(year, month)

  const { data: budgets, isLoading, isError, error, refetch } = useBudgetWithSpending(period)
  const { data: categories } = useCategories()
  const deleteBudget = useDeleteBudget()
  const createBudget = useCreateBudget()
  const updateBudget = useUpdateBudget()

  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState<SpentBudget | null>(null)

  const prevMonth = () => {
    if (month === 1) { setYear(y => y - 1); setMonth(12) }
    else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (month === 12) { setYear(y => y + 1); setMonth(1) }
    else setMonth(m => m + 1)
  }

  const handleSubmit = (data: { categoryId: number; monthlyLimit: number; alertThreshold: number }) => {
    const payload = { ...data, period }
    if (editTarget) {
      updateBudget.mutate({ id: editTarget.id, ...payload }, {
        onSuccess: () => { toast.success(t('budget.updated')); setShowForm(false); setEditTarget(null) },
        onError: (e: Error) => toast.error(e.message),
      })
    } else {
      createBudget.mutate(payload, {
        onSuccess: () => { toast.success(t('budget.created')); setShowForm(false) },
        onError: (e: Error) => toast.error(e.message),
      })
    }
  }

  const handleDelete = (budget: SpentBudget) => {
    if (!confirm(t('budget.deleteConfirm', { name: budget.category?.name ?? '' }))) return
    deleteBudget.mutate({ id: budget.id, period }, {
      onSuccess: () => toast.success(t('budget.deleted')),
      onError: (e: Error) => toast.error(e.message),
    })
  }

  const sortedBudgets = [...(budgets ?? [])].sort((a, b) =>
    (b.percentage ?? 0) - (a.percentage ?? 0)
  )

  // Totals for hero
  const totalLimit = sortedBudgets.reduce((acc, b) => acc + b.monthlyLimit, 0)
  const totalSpent = sortedBudgets.reduce((acc, b) => acc + (b.currentSpent ?? 0), 0)
  const exceeded = sortedBudgets.filter(b => b.status === 'exceeded').length
  const warning = sortedBudgets.filter(b => b.status === 'warning').length
  const active = sortedBudgets.filter(b => (b.currentSpent ?? 0) > 0)
  const inactive = sortedBudgets.filter(b => (b.currentSpent ?? 0) === 0)

  return (
    <div className="page-enter space-y-5">
      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-[10px] text-faint uppercase tracking-[0.14em] mb-1">
            {t('budget.subtitle')}
          </p>
          <h2 className="font-display text-[28px] italic text-primary leading-none">
            {t('budget.titleWithPeriod', { period: formatPeriod(period, t) })}
          </h2>
          <p className="font-mono text-[11px] text-muted mt-1.5">
            {t('budget.summaryLine', { count: sortedBudgets.length })} ·{' '}
            <Amount value={totalSpent} size={11} bare /> {t('wishlist.of')}{' '}
            <Amount value={totalLimit} size={11} />
          </p>
        </div>
        <div className="flex items-center gap-2">
          {tab === 'categories' && (
            <Pill accent onClick={() => { setEditTarget(null); setShowForm(true) }}>
              + {t('budget.addCategory')}
            </Pill>
          )}
        </div>
      </div>

      {/* ── Tab bar ─────────────────────────────────────────────────────────── */}
      <div className="flex gap-1 bg-surface p-0.5 rounded-lg border border-border w-fit">
        {(['categories', 'jars'] as const).map((tb) => (
          <button
            key={tb}
            onClick={() => setTab(tb)}
            className={`px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.08em] rounded-md transition-all ${
              tab === tb
                ? 'bg-surface-2 text-primary shadow-sm'
                : 'text-muted hover:text-secondary'
            }`}
          >
            {tb === 'categories' ? t('budget.byCategory') : t('budget.jarsTab')}
          </button>
        ))}
      </div>

      {/* ── Month selector ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between bg-surface border border-border rounded-lg px-4 py-2.5">
        <button onClick={prevMonth}
          className="font-mono text-[18px] text-muted hover:text-primary transition-colors px-1">←</button>
        <p className="font-mono text-[12px] text-primary tracking-[0.06em] uppercase">
          {formatPeriod(period, t)}
        </p>
        <button onClick={nextMonth}
          className="font-mono text-[18px] text-muted hover:text-primary transition-colors px-1">→</button>
      </div>

      {/* ── Tab: categories ─────────────────────────────────────────────────── */}
      {tab === 'categories' ? (
        <>
          {/* Hero total card */}
          {sortedBudgets.length > 0 && (
            <BudgetSummary
              totalLimit={totalLimit}
              totalSpent={totalSpent}
              exceeded={exceeded}
              warning={warning}
            />
          )}

          {/* Budget table */}
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-14 bg-surface-2 rounded-lg animate-shimmer" />
              ))}
            </div>
          ) : isError ? (
            <div className="p-4 rounded-lg bg-negative/10 border border-negative/20 space-y-2 text-center">
              <p className="text-sm font-medium text-negative">{t('budget.loadError')}</p>
              <p className="text-xs text-muted">{error instanceof Error ? error.message : t('budget.serverError')}</p>
              <Button variant="outline" size="sm" onClick={() => refetch()}>{t('common.retry')}</Button>
            </div>
          ) : sortedBudgets.length === 0 ? (
            <div className="text-center py-16 space-y-3 border border-dashed border-border-hi rounded-xl">
              <p className="font-mono text-[11px] text-faint uppercase tracking-widest">
                {t('budget.noBudgetsSet')}
              </p>
              <p className="font-sans text-sm text-muted">{t('budget.noBudgetsDesc')}</p>
              <Pill accent onClick={() => { setEditTarget(null); setShowForm(true) }}>
                + {t('budget.addFirstCategory')}
              </Pill>
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-surface overflow-hidden">
              {/* Table column header (desktop only — mobile rows are stacked cards) */}
              <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-bg border-b border-border">
                <span className="w-[16px] shrink-0" />
                <span className="w-[28px] shrink-0" />
                <span className="w-28 shrink-0 font-mono text-[10px] text-faint uppercase tracking-[0.12em]">{t('budget.category')}</span>
                <span className="w-28 shrink-0 font-mono text-[10px] text-faint uppercase tracking-[0.12em]">{t('budget.spent')}</span>
                <span className="flex-1 font-mono text-[10px] text-faint uppercase tracking-[0.12em]">{t('budget.progress')}</span>
                <span className="w-32 shrink-0 font-mono text-[10px] text-faint uppercase tracking-[0.12em] text-right">{t('budget.limit')}</span>
                <span className="font-mono text-[10px] text-faint uppercase tracking-[0.12em] text-right">{t('budget.actions')}</span>
              </div>

              {/* Active budgets */}
              {active.length > 0 && (
                <>
                  <div className="px-4 py-2">
                    <SectionLabel>{t('budget.active')} · {active.length}</SectionLabel>
                  </div>
                  {active.map((b) => (
                    <BudgetRow
                      key={b.id}
                      budget={b}
                      onEdit={() => { setEditTarget(b); setShowForm(true) }}
                      onDelete={() => handleDelete(b)}
                    />
                  ))}
                </>
              )}

              {/* Inactive budgets */}
              {inactive.length > 0 && (
                <>
                  <div className="px-4 py-2 mt-1">
                    <SectionLabel>{t('budget.inactive')} · {inactive.length}</SectionLabel>
                  </div>
                  {inactive.map((b) => (
                    <BudgetRow
                      key={b.id}
                      budget={b}
                      onEdit={() => { setEditTarget(b); setShowForm(true) }}
                      onDelete={() => handleDelete(b)}
                    />
                  ))}
                </>
              )}

              {/* Add category row */}
              <div className="px-4 py-3 border-t border-border/50">
                <Pill
                  accent
                  onClick={() => { setEditTarget(null); setShowForm(true) }}
                >
                  + {t('budget.addCategory')}
                </Pill>
              </div>
            </div>
          )}

          {/* Create/Edit BottomSheet */}
          <BottomSheet
            open={showForm}
            onClose={() => { setShowForm(false); setEditTarget(null) }}
            title={editTarget ? t('budget.editBudget') : t('budget.newBudget')}
          >
            <BudgetForm
              editBudget={editTarget ?? undefined}
              categories={categories ?? []}
              onClose={() => { setShowForm(false); setEditTarget(null) }}
              onSubmit={handleSubmit}
            />
          </BottomSheet>
        </>
      ) : (
        <JarsTab period={period} />
      )}
    </div>
  )
}
