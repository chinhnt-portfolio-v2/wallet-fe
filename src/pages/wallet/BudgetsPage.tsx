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
import { MonthSelector } from '@/components/budgets/month-selector'
import { Amount, SectionLabel, ProgressBar, Pill } from '@/design-system'
import { formatCurrency } from '@/lib/utils'

type SpentBudget = NonNullable<ReturnType<typeof useBudgetWithSpending>['data']>[number]

function getPeriod(year: number, month: number) {
  return `${year}-${String(month).padStart(2, '0')}`
}

function formatPeriod(period: string, t: TFunction) {
  const [year, month] = period.split('-')
  return `${t(`budget.months.${parseInt(month)}`)} ${year}`
}

// ── Budget form (bottom sheet) ────────────────────────────────────────────────

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
  const expenseCategories = categories.filter((c) => c.type === 'EXPENSE')

  const handleSubmit = () => {
    if (!categoryId) { toast.error(t('budget.selectCategory')); return }
    if (!limit || parseFloat(limit) <= 0) { toast.error(t('budget.enterAmount')); return }
    onSubmit({ categoryId, monthlyLimit: parseFloat(limit), alertThreshold: threshold })
  }

  return (
    <div className="space-y-4">
      <p className="text-[10px] font-extrabold text-muted uppercase tracking-widest">
        {isEditing ? t('budget.editBudget') : t('budget.newBudget')}
      </p>

      <div>
        <label className="block text-[10px] font-extrabold text-muted uppercase tracking-[0.12em] mb-2">
          {t('budget.category')}
        </label>
        <div className="flex flex-wrap gap-2">
          {expenseCategories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategoryId(c.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-[11px] transition-all border ${
                categoryId === c.id ? 'border-primary ring-1 ring-primary/30' : 'border-line hover:bg-hover'
              }`}
              style={{
                backgroundColor: categoryId === c.id ? `${c.color}14` : undefined,
                color: categoryId === c.id ? c.color : 'var(--sub)',
              }}
            >
              <span>{c.icon}</span>
              <span className="font-medium">{c.name}</span>
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
        <p className="text-[11px] text-muted -mt-2 tabular-nums">
          = {formatCurrency(parseFloat(limit) || 0)}
        </p>
      )}

      <div>
        <label className="block text-[10px] font-extrabold text-muted uppercase tracking-[0.12em] mb-2">
          {t('budget.alertAt')}
        </label>
        <div className="flex gap-2">
          {[80, 90, 100].map((pct) => (
            <button
              key={pct}
              onClick={() => setThreshold(pct)}
              className={`flex-1 py-2 text-[11px] rounded-sm border transition-all uppercase tracking-wide font-semibold ${
                threshold === pct
                  ? 'border-primary bg-primary-soft text-primary'
                  : 'border-line text-muted hover:border-primary/50'
              }`}
            >
              {pct}%
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

// ── Jars panel ────────────────────────────────────────────────────────────────

function JarsPanel({ period }: { period: string }) {
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

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => <div key={i} className="rounded-md border border-line h-32 animate-shimmer" />)}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="p-4 rounded-md bg-negative-soft border border-negative/20 space-y-2 text-center">
        <p className="text-[13px] font-medium text-negative">{t('budget.jarsLoadError')}</p>
        <p className="text-[11px] text-muted">{error instanceof Error ? error.message : t('budget.serverError')}</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>{t('common.retry')}</Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {monthlyIncome > 0 && (
        <div className="flex items-center justify-between px-3 py-2 rounded-sm bg-surface-2 border border-line">
          <p className="text-[10px] font-extrabold text-muted uppercase tracking-[0.1em]">
            {t('budget.monthlyIncome')}
          </p>
          <Amount value={monthlyIncome} size={13} weight={600} style={{ color: 'var(--positive)' }} />
        </div>
      )}

      {jars.length > 0 && (
        <div className="px-3 py-2.5 rounded-sm bg-surface-2 border border-line space-y-1.5">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-extrabold text-muted uppercase tracking-[0.1em]">
              {t('budget.totalAllocation')}
            </p>
            <p className={`text-[11px] font-semibold tabular-nums ${Number(totalPct) > 100 ? 'text-negative' : 'text-ink'}`}>
              {totalPct}%
            </p>
          </div>
          <ProgressBar pct={Math.min(Number(totalPct), 100) / 100} over={Number(totalPct) > 100} height={4} />
        </div>
      )}

      {jars.length === 0 ? (
        <div className="text-center py-12 space-y-3 rounded-md border border-dashed border-line">
          <p className="text-3xl">🏺</p>
          <p className="text-[13px] text-muted">{t('budget.noJars')}</p>
          <p className="text-[11px] text-muted">{t('budget.noJarsDesc')}</p>
          {!hasPreset && (
            <Pill accent onClick={() => setShowPresetModal(true)}>{t('budget.setupJars')}</Pill>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-3">
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
        onConfirm={() => {
          createPreset.mutate(undefined, {
            onSuccess: () => { toast.success(t('budget.jarsCreated')); setShowPresetModal(false) },
            onError: (e: Error) => toast.error(e.message),
          })
        }}
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
    if (month === 1) { setYear((y) => y - 1); setMonth(12) }
    else setMonth((m) => m - 1)
  }
  const nextMonth = () => {
    if (month === 12) { setYear((y) => y + 1); setMonth(1) }
    else setMonth((m) => m + 1)
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

  const sortedBudgets = [...(budgets ?? [])].sort((a, b) => (b.percentage ?? 0) - (a.percentage ?? 0))
  const totalLimit = sortedBudgets.reduce((acc, b) => acc + b.monthlyLimit, 0)
  const totalSpent = sortedBudgets.reduce((acc, b) => acc + (b.currentSpent ?? 0), 0)
  const exceeded = sortedBudgets.filter((b) => b.status === 'exceeded').length
  const warning  = sortedBudgets.filter((b) => b.status === 'warning').length
  const active   = sortedBudgets.filter((b) => (b.currentSpent ?? 0) > 0)
  const inactive = sortedBudgets.filter((b) => (b.currentSpent ?? 0) === 0)

  return (
    <div className="page-enter space-y-5">
      {/* ── header ── */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-extrabold text-muted uppercase tracking-[0.12em] mb-1">
            {t('budget.subtitle')}
          </p>
          <h1 className="text-xl font-extrabold tracking-[-0.02em] text-ink leading-tight">
            {t('budget.titleWithPeriod', { period: formatPeriod(period, t) })}
          </h1>
          <p className="text-[11px] text-muted mt-1">
            {t('budget.summaryLine', { count: sortedBudgets.length })}
          </p>
        </div>
        {tab === 'categories' && (
          <Pill accent onClick={() => { setEditTarget(null); setShowForm(true) }}>
            + {t('budget.addCategory')}
          </Pill>
        )}
      </div>

      {/* ── month selector ── */}
      <MonthSelector year={year} month={month} onPrev={prevMonth} onNext={nextMonth} />

      {/* ── tab bar ── */}
      <div className="flex gap-1 bg-surface p-0.5 rounded-sm border border-line w-fit">
        {(['categories', 'jars'] as const).map((tb) => (
          <button
            key={tb}
            onClick={() => setTab(tb)}
            className={`px-4 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.08em] rounded-xs transition-all ${
              tab === tb ? 'bg-primary text-primary-ink' : 'text-muted hover:text-sub'
            }`}
          >
            {tb === 'categories' ? t('budget.byCategory') : t('budget.jarsTab')}
          </button>
        ))}
      </div>

      {/* ── desktop 2-col: categories left / jars right ── */}
      <div className={tab === 'categories' ? 'md:grid md:grid-cols-[1fr_320px] md:gap-6 md:items-start' : ''}>
        {/* categories column */}
        {tab === 'categories' && (
          <div className="space-y-5">
            {sortedBudgets.length > 0 && (
              <BudgetSummary totalLimit={totalLimit} totalSpent={totalSpent} exceeded={exceeded} warning={warning} />
            )}

            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 bg-surface-2 rounded-sm animate-shimmer" />
                ))}
              </div>
            ) : isError ? (
              <div className="p-4 rounded-md bg-negative-soft border border-negative/20 space-y-2 text-center">
                <p className="text-[13px] font-medium text-negative">{t('budget.loadError')}</p>
                <p className="text-[11px] text-muted">{error instanceof Error ? error.message : t('budget.serverError')}</p>
                <Button variant="outline" size="sm" onClick={() => refetch()}>{t('common.retry')}</Button>
              </div>
            ) : sortedBudgets.length === 0 ? (
              <div className="text-center py-16 space-y-3 border border-dashed border-line rounded-md">
                <p className="text-[10px] font-extrabold text-muted uppercase tracking-widest">
                  {t('budget.noBudgetsSet')}
                </p>
                <p className="text-[13px] text-muted">{t('budget.noBudgetsDesc')}</p>
                <Pill accent onClick={() => { setEditTarget(null); setShowForm(true) }}>
                  + {t('budget.addFirstCategory')}
                </Pill>
              </div>
            ) : (
              <div className="rounded-md border border-line bg-surface overflow-hidden">
                <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-surface-2 border-b border-line">
                  <span className="w-[16px] shrink-0" />
                  <span className="w-[28px] shrink-0" />
                  <span className="w-28 shrink-0 text-[10px] font-extrabold text-muted uppercase tracking-[0.12em]">{t('budget.category')}</span>
                  <span className="w-28 shrink-0 text-[10px] font-extrabold text-muted uppercase tracking-[0.12em]">{t('budget.spent')}</span>
                  <span className="flex-1 text-[10px] font-extrabold text-muted uppercase tracking-[0.12em]">{t('budget.progress')}</span>
                  <span className="w-32 shrink-0 text-[10px] font-extrabold text-muted uppercase tracking-[0.12em] text-right">{t('budget.limit')}</span>
                  <span className="text-[10px] font-extrabold text-muted uppercase tracking-[0.12em] text-right">{t('budget.actions')}</span>
                </div>
                {active.length > 0 && (
                  <>
                    <div className="px-4 py-2"><SectionLabel>{t('budget.active')} · {active.length}</SectionLabel></div>
                    {active.map((b) => (
                      <BudgetRow key={b.id} budget={b}
                        onEdit={() => { setEditTarget(b); setShowForm(true) }}
                        onDelete={() => handleDelete(b)} />
                    ))}
                  </>
                )}
                {inactive.length > 0 && (
                  <>
                    <div className="px-4 py-2 mt-1"><SectionLabel>{t('budget.inactive')} · {inactive.length}</SectionLabel></div>
                    {inactive.map((b) => (
                      <BudgetRow key={b.id} budget={b}
                        onEdit={() => { setEditTarget(b); setShowForm(true) }}
                        onDelete={() => handleDelete(b)} />
                    ))}
                  </>
                )}
                <div className="px-4 py-3 border-t border-line/50">
                  <Pill accent onClick={() => { setEditTarget(null); setShowForm(true) }}>
                    + {t('budget.addCategory')}
                  </Pill>
                </div>
              </div>
            )}
          </div>
        )}

        {/* jars column — always visible on desktop when on categories tab, standalone on jars tab */}
        {tab === 'categories' ? (
          <div className="hidden md:block mt-5 md:mt-0">
            <SectionLabel className="mb-3">{t('budget.jarsTab')}</SectionLabel>
            <JarsPanel period={period} />
          </div>
        ) : (
          <JarsPanel period={period} />
        )}
      </div>

      {/* ── budget form bottom sheet ── */}
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
    </div>
  )
}
