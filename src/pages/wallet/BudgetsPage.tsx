import { useState } from 'react'
import { toast } from 'sonner'
import { useBudgetWithSpending, useCreateBudget, useUpdateBudget, useDeleteBudget } from '@/hooks/useBudgets'
import { useCategories } from '@/hooks/useCategories'
import { useBudgetJars, useCreatePresetJars, useDeleteBudgetJar } from '@/hooks/use-budget-jars'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { JarCard } from '@/components/budgets/jar-card'
import { JarPresetModal } from '@/components/budgets/jar-preset-modal'
import { formatCurrency } from '@/lib/utils'
import {
  Amount,
  DisplayAmount,
  SectionLabel,
  CategoryChip,
  ProgressBar,
  Pill,
} from '@/design-system'

// ── Helpers ───────────────────────────────────────────────────────────────────

const MONTHS = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4',
  'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8',
  'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12',
]

function getPeriod(year: number, month: number) {
  return `${year}-${String(month).padStart(2, '0')}`
}

function formatPeriod(period: string) {
  const [year, month] = period.split('-')
  return `${MONTHS[parseInt(month) - 1]} ${year}`
}

// ── Budget row (editorial terminal style) ─────────────────────────────────────

function BudgetRow({
  budget,
  onEdit,
  onDelete,
}: {
  budget: NonNullable<ReturnType<typeof useBudgetWithSpending>['data']>[number]
  onEdit: () => void
  onDelete: () => void
}) {
  const pct = (budget.percentage ?? 0) / 100
  const isOver = (budget.status ?? 'ok') === 'exceeded'
  const isWarn = (budget.status ?? 'ok') === 'warning'

  const statusLabel = isOver
    ? 'over budget'
    : isWarn
      ? 'near limit'
      : 'on track'

  const statusClass = isOver
    ? 'text-negative'
    : isWarn
      ? 'text-warning'
      : 'text-positive'

  // Inline-editable limit
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(budget.monthlyLimit)
  const update = useUpdateBudget()

  const commitLimit = () => {
    const value = Math.max(0, Math.round(draft / 1000) * 1000)
    if (value !== budget.monthlyLimit) {
      update.mutate(
        { id: budget.id, monthlyLimit: value, period: '', categoryId: budget.categoryId, alertThreshold: budget.alertThreshold ?? 80 },
        {
          onSuccess: () => toast.success('Đã cập nhật hạn mức'),
          onError: (e: Error) => toast.error(e.message),
        }
      )
    }
    setEditing(false)
  }

  // Derive hue from category color for CategoryChip
  const catName = budget.category?.name ?? 'Other'
  const catId = (budget.category?.name ?? 'other').toLowerCase()

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-t border-border hover:bg-surface-2/40 transition-colors group">
      {/* Drag handle */}
      <span className="font-mono text-[12px] text-faint cursor-grab select-none shrink-0">⋮⋮</span>

      {/* Category chip */}
      <CategoryChip cat={catId} name={catName} size={28} className="shrink-0" />

      {/* Name + status */}
      <div className="min-w-0 w-28 shrink-0">
        <p className="font-sans text-[13px] text-primary font-medium truncate">{catName}</p>
        <p className={`font-mono text-[10px] ${statusClass}`}>{statusLabel}</p>
      </div>

      {/* Spent */}
      <div className="w-28 shrink-0">
        <p className="font-mono text-[10px] text-faint uppercase tracking-[0.1em] mb-0.5">Spent</p>
        <Amount value={budget.currentSpent ?? 0} size={13} weight={500}
          style={{ color: isOver ? 'var(--color-negative)' : 'var(--color-text)' }} />
      </div>

      {/* Progress bar + pct */}
      <div className="flex-1 min-w-0">
        <ProgressBar
          pct={pct}
          over={isOver}
          color={isWarn ? 'var(--color-warning)' : 'var(--color-positive)'}
          height={4}
        />
        <p className="font-mono text-[10px] text-muted mt-1">
          {Math.round((budget.percentage ?? 0))}%
        </p>
      </div>

      {/* Limit (inline-editable) */}
      <div className="w-32 shrink-0 text-right">
        <p className="font-mono text-[10px] text-faint uppercase tracking-[0.1em] mb-0.5">Limit</p>
        {editing ? (
          <input
            autoFocus
            type="number"
            value={draft}
            onChange={(e) => setDraft(Number(e.target.value))}
            onBlur={commitLimit}
            onKeyDown={(e) => e.key === 'Enter' && commitLimit()}
            className="w-full text-right font-mono text-[13px] text-primary bg-surface-2 border border-accent rounded px-1.5 py-0.5 outline-none"
          />
        ) : (
          <button
            onClick={() => { setDraft(budget.monthlyLimit); setEditing(true) }}
            className="font-mono text-[13px] text-secondary hover:text-accent transition-colors tabular-nums w-full text-right"
            title="Click to edit"
          >
            {formatCurrency(budget.monthlyLimit)}
          </button>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={onEdit}
          className="font-mono text-[10px] text-muted hover:text-accent px-2 py-1 uppercase tracking-wide">
          Edit
        </button>
        <button onClick={onDelete}
          className="font-mono text-[10px] text-negative/60 hover:text-negative px-2 py-1 uppercase tracking-wide">
          ✕
        </button>
      </div>
    </div>
  )
}

// ── Budget form ──────────────────────────────────────────────────────────────

function BudgetForm({
  editBudget,
  period,
  categories,
  onClose,
  onSubmit,
}: {
  editBudget?: NonNullable<ReturnType<typeof useBudgetWithSpending>['data']>[number]
  period: string
  categories: { id: number; name: string; icon: string; color: string; type: string }[]
  onClose: () => void
  onSubmit: (data: { categoryId: number; monthlyLimit: number; alertThreshold: number }) => void
}) {
  const create = useCreateBudget()
  const update = useUpdateBudget()
  const isEditing = !!editBudget

  const [categoryId, setCategoryId] = useState<number>(editBudget?.categoryId ?? 0)
  const [limit, setLimit] = useState(editBudget?.monthlyLimit?.toString() ?? '')
  const [threshold, setThreshold] = useState(editBudget?.alertThreshold ?? 80)

  const isPending = create.isPending || update.isPending

  const handleSubmit = () => {
    if (!categoryId) { toast.error('Chọn danh mục'); return }
    if (!limit || parseFloat(limit) <= 0) { toast.error('Nhập số tiền hợp lệ'); return }
    onSubmit({ categoryId, monthlyLimit: parseFloat(limit), alertThreshold: threshold })
  }

  const expenseCategories = categories.filter((c) => c.type === 'EXPENSE')

  return (
    <div className="space-y-4">
      <p className="font-mono text-[11px] text-muted uppercase tracking-widest">
        {isEditing ? 'Edit budget' : 'New budget'}
      </p>

      <div>
        <label className="block font-mono text-[10px] text-faint uppercase tracking-[0.12em] mb-2">
          Category
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
        label="Hạn mức tháng (VND)"
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
          Cảnh báo khi đạt
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
        <Button variant="outline" onClick={onClose} className="flex-1">Hủy</Button>
        <Button onClick={handleSubmit} disabled={isPending} className="flex-1">
          {isPending ? 'Đang lưu...' : isEditing ? 'Lưu thay đổi' : 'Tạo ngân sách'}
        </Button>
      </div>
    </div>
  )
}

// ── Jars tab ─────────────────────────────────────────────────────────────────

function JarsTab({ period }: { period: string }) {
  const { data, isLoading, isError, error, refetch } = useBudgetJars(period)
  const createPreset = useCreatePresetJars()
  const deleteJar = useDeleteBudgetJar()

  const [showPresetModal, setShowPresetModal] = useState(false)

  const jars = data?.jars ?? []
  const totalPct = data?.totalPercentage ?? 0
  const monthlyIncome = data?.monthlyIncome ?? 0
  const hasPreset = jars.some((j) => j.isPreset)

  const handleDelete = (id: number, name: string) => {
    if (!confirm(`Xóa hũ "${name}"?`)) return
    deleteJar.mutate(id, {
      onSuccess: () => toast.success('Đã xóa hũ ngân sách'),
      onError: (e: Error) => toast.error(e.message),
    })
  }

  const handlePresetConfirm = () => {
    createPreset.mutate(undefined, {
      onSuccess: () => { toast.success('Đã tạo 6 hũ ngân sách!'); setShowPresetModal(false) },
      onError: (e: Error) => toast.error(e.message),
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => <div key={i} className="card p-4 h-28 animate-pulse" />)}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="p-4 rounded-lg bg-negative/10 border border-negative/20 space-y-2 text-center">
        <p className="text-sm font-medium text-negative">Có lỗi tải hũ ngân sách</p>
        <p className="text-xs text-muted">{error instanceof Error ? error.message : 'Lỗi máy chủ'}</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>Thử lại</Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {monthlyIncome > 0 && (
        <div className="p-3 rounded-lg bg-surface-2 flex items-center justify-between">
          <p className="font-mono text-[10px] text-faint uppercase tracking-[0.1em]">Thu nhập tháng này</p>
          <Amount value={monthlyIncome} size={13} weight={500} style={{ color: 'var(--color-positive)' }} />
        </div>
      )}

      {jars.length > 0 && (
        <div className="p-3 rounded-lg bg-surface-2 space-y-1.5">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10px] text-faint uppercase tracking-[0.1em]">Tổng phân bổ</p>
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
          <p className="font-sans text-sm text-muted">Chưa có hũ ngân sách</p>
          <p className="font-mono text-[11px] text-faint">Dùng phương pháp 6 hũ để phân bổ thu nhập</p>
          {!hasPreset && (
            <Pill accent onClick={() => setShowPresetModal(true)}>
              Thiết lập 6 hũ ngay
            </Pill>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {jars.map((jar) => (
            <JarCard
              key={jar.id}
              jar={jar}
              onEdit={() => toast('Tính năng sửa hũ đang phát triển')}
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
  const [editTarget, setEditTarget] = useState<any>(null)

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
        onSuccess: () => { toast.success('Đã cập nhật!'); setShowForm(false); setEditTarget(null) },
        onError: (e: Error) => toast.error(e.message),
      })
    } else {
      createBudget.mutate(payload, {
        onSuccess: () => { toast.success('Đã tạo ngân sách!'); setShowForm(false) },
        onError: (e: Error) => toast.error(e.message),
      })
    }
  }

  const handleDelete = (budget: any) => {
    if (!confirm(`Xóa ngân sách "${budget.category?.name}"?`)) return
    deleteBudget.mutate({ id: budget.id, period }, {
      onSuccess: () => toast.success('Đã xóa ngân sách'),
      onError: (e: Error) => toast.error(e.message),
    })
  }

  const sortedBudgets = [...(budgets ?? [])].sort((a, b) =>
    (b.percentage ?? 0) - (a.percentage ?? 0)
  )

  // Totals for hero
  const totalLimit = sortedBudgets.reduce((acc, b) => acc + b.monthlyLimit, 0)
  const totalSpent = sortedBudgets.reduce((acc, b) => acc + (b.currentSpent ?? 0), 0)
  const isOverAll = totalSpent > totalLimit
  const exceeded = sortedBudgets.filter(b => b.status === 'exceeded').length
  const warning = sortedBudgets.filter(b => b.status === 'warning').length
  const active = sortedBudgets.filter(b => (b.currentSpent ?? 0) > 0)
  const inactive = sortedBudgets.filter(b => (b.currentSpent ?? 0) === 0)

  return (
    <div className="space-y-5">
      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-[10px] text-faint uppercase tracking-[0.14em] mb-1">
            Money / Budgets
          </p>
          <h2 className="font-display text-[28px] italic text-primary leading-none">
            Budgets · {formatPeriod(period)}
          </h2>
          <p className="font-mono text-[11px] text-muted mt-1.5">
            {sortedBudgets.length} categories ·{' '}
            <Amount value={totalSpent} size={11} bare /> of{' '}
            <Amount value={totalLimit} size={11} />
          </p>
        </div>
        <div className="flex items-center gap-2">
          {tab === 'categories' && (
            <Pill accent onClick={() => { setEditTarget(null); setShowForm(true) }}>
              + Add category
            </Pill>
          )}
        </div>
      </div>

      {/* ── Tab bar ─────────────────────────────────────────────────────────── */}
      <div className="flex gap-1 bg-surface p-0.5 rounded-lg border border-border w-fit">
        {(['categories', 'jars'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.08em] rounded-md transition-all ${
              tab === t
                ? 'bg-surface-2 text-primary shadow-sm'
                : 'text-muted hover:text-secondary'
            }`}
          >
            {t === 'categories' ? 'Theo danh mục' : 'Hũ ngân sách'}
          </button>
        ))}
      </div>

      {/* ── Month selector ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between bg-surface border border-border rounded-lg px-4 py-2.5">
        <button onClick={prevMonth}
          className="font-mono text-[18px] text-muted hover:text-primary transition-colors px-1">←</button>
        <p className="font-mono text-[12px] text-primary tracking-[0.06em] uppercase">
          {formatPeriod(period)}
        </p>
        <button onClick={nextMonth}
          className="font-mono text-[18px] text-muted hover:text-primary transition-colors px-1">→</button>
      </div>

      {/* ── Tab: categories ─────────────────────────────────────────────────── */}
      {tab === 'categories' ? (
        <>
          {/* Hero total card */}
          {sortedBudgets.length > 0 && (
            <div className="rounded-xl border border-border bg-surface p-5">
              <div className="grid grid-cols-3 gap-6 items-center">
                {/* DisplayAmount hero */}
                <div>
                  <p className="font-mono text-[10px] text-faint uppercase tracking-[0.14em] mb-2">
                    Total budget
                  </p>
                  <DisplayAmount
                    value={totalLimit}
                    size={38}
                    sub={`spent ${((totalSpent / totalLimit) * 100 || 0).toFixed(0)}%`}
                  />
                  <p className="font-mono text-[11px] text-muted mt-2">
                    <Amount
                      value={totalSpent}
                      size={11}
                      style={{ color: isOverAll ? 'var(--color-negative)' : 'var(--color-muted)' }}
                    />{' '}
                    spent so far
                  </p>
                </div>

                {/* Remaining / over */}
                <div>
                  <p className="font-mono text-[10px] text-faint uppercase tracking-[0.14em] mb-2">
                    {isOverAll ? 'Over by' : 'Remaining'}
                  </p>
                  <Amount
                    value={Math.abs(totalLimit - totalSpent)}
                    size={22}
                    weight={500}
                    style={{ color: isOverAll ? 'var(--color-negative)' : 'var(--color-accent)' }}
                  />
                </div>

                {/* Total progress bar */}
                <div>
                  <p className="font-mono text-[10px] text-faint uppercase tracking-[0.12em] mb-2">
                    Used {totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0}%
                  </p>
                  <ProgressBar
                    pct={totalLimit > 0 ? totalSpent / totalLimit : 0}
                    over={isOverAll}
                    height={6}
                  />
                  {/* Status badges row */}
                  <div className="flex gap-2 mt-3">
                    {exceeded > 0 && (
                      <span className="font-mono text-[10px] text-negative">
                        ⚠ {exceeded} over
                      </span>
                    )}
                    {warning > 0 && (
                      <span className="font-mono text-[10px] text-warning">
                        ⚠ {warning} near
                      </span>
                    )}
                    {!exceeded && !warning && (
                      <span className="font-mono text-[10px] text-positive">
                        ✓ all on track
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Budget table */}
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-14 bg-surface-2 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : isError ? (
            <div className="p-4 rounded-lg bg-negative/10 border border-negative/20 space-y-2 text-center">
              <p className="text-sm font-medium text-negative">Có lỗi tải dữ liệu ngân sách</p>
              <p className="text-xs text-muted">{error instanceof Error ? error.message : 'Lỗi máy chủ'}</p>
              <Button variant="outline" size="sm" onClick={() => refetch()}>Thử lại</Button>
            </div>
          ) : sortedBudgets.length === 0 ? (
            <div className="text-center py-16 space-y-3 border border-dashed border-border-hi rounded-xl">
              <p className="font-mono text-[11px] text-faint uppercase tracking-widest">
                No budgets set
              </p>
              <p className="font-sans text-sm text-muted">Create a budget to track spending by category</p>
              <Pill accent onClick={() => { setEditTarget(null); setShowForm(true) }}>
                + Add first category
              </Pill>
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-surface overflow-hidden">
              {/* Table column header */}
              <div className="grid items-center gap-3 px-4 py-2 bg-bg border-b border-border"
                style={{ gridTemplateColumns: '16px 28px 112px 112px 1fr 128px 96px' }}>
                <span />
                <span />
                <span className="font-mono text-[10px] text-faint uppercase tracking-[0.12em]">Category</span>
                <span className="font-mono text-[10px] text-faint uppercase tracking-[0.12em]">Spent</span>
                <span className="font-mono text-[10px] text-faint uppercase tracking-[0.12em]">Progress</span>
                <span className="font-mono text-[10px] text-faint uppercase tracking-[0.12em] text-right">Limit</span>
                <span className="font-mono text-[10px] text-faint uppercase tracking-[0.12em] text-right">Actions</span>
              </div>

              {/* Active budgets */}
              {active.length > 0 && (
                <>
                  <div className="px-4 py-2">
                    <SectionLabel>Active · {active.length}</SectionLabel>
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
                    <SectionLabel>Inactive · {inactive.length}</SectionLabel>
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
                  + Add category
                </Pill>
              </div>
            </div>
          )}

          {/* Create/Edit BottomSheet */}
          <BottomSheet
            open={showForm}
            onClose={() => { setShowForm(false); setEditTarget(null) }}
            title={editTarget ? 'Edit budget' : 'New budget'}
          >
            <BudgetForm
              editBudget={editTarget}
              period={period}
              categories={(categories ?? []).map((c: any) => c)}
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
