import { useState } from 'react'
import { toast } from 'sonner'
import { useBudgetWithSpending, useCreateBudget, useUpdateBudget, useDeleteBudget } from '@/hooks/useBudgets'
import { useCategories } from '@/hooks/useCategories'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { formatCurrency } from '@/lib/utils'

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

function BudgetCard({
  budget,
  onEdit,
  onDelete,
}: {
  budget: NonNullable<ReturnType<typeof useBudgetWithSpending>['data']>[number]
  onEdit: () => void
  onDelete: () => void
}) {
  const pct = Math.min(budget.percentage ?? 0, 100)
  const status = budget.status ?? 'ok'
  const color =
    status === 'exceeded' ? '#F43F5E' :
    status === 'warning' ? '#F59E0B' :
    '#10B981'
  const barClass =
    status === 'exceeded' ? 'bg-negative dark:bg-dark-negative' :
    status === 'warning' ? 'bg-warning dark:bg-dark-warning' :
    'bg-positive dark:bg-dark-positive'

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-base shrink-0"
            style={{ backgroundColor: `${budget.category?.color ?? '#94A3B8'}20` }}
          >
            {budget.category?.icon ?? '📊'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-primary dark:text-dark-primary truncate">
              {budget.category?.name ?? 'Danh mục'}
            </p>
            <p className="text-xs text-muted dark:text-dark-muted">
              {formatCurrency(budget.currentSpent ?? 0)} / {formatCurrency(budget.monthlyLimit)}₫
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={onEdit} className="text-xs text-muted dark:text-dark-muted hover:text-accent dark:hover:text-dark-accent px-2 py-1">Sửa</button>
          <button onClick={onDelete} className="text-xs text-negative dark:text-dark-negative hover:underline px-2 py-1">Xóa</button>
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div className="h-2 bg-surface-2 dark:bg-dark-surface-2 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${barClass}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs font-semibold" style={{ color }}>
            {Math.round(pct)}%
          </p>
          {status === 'exceeded' && (
            <p className="text-xs text-negative dark:text-dark-negative font-medium">⚠️ Vượt ngân sách!</p>
          )}
          {status === 'warning' && (
            <p className="text-xs text-warning dark:text-dark-warning font-medium">⚠️ Gần đạt</p>
          )}
        </div>
      </div>
    </Card>
  )
}

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
      <p className="text-sm font-semibold text-primary dark:text-dark-primary">
        {isEditing ? 'Sửa ngân sách' : '+ Tạo ngân sách'}
      </p>

      {/* Category */}
      <div>
        <label className="block text-xs font-medium text-secondary dark:text-dark-secondary mb-2">Danh mục</label>
        <div className="flex flex-wrap gap-2">
          {expenseCategories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategoryId(c.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all ${
                categoryId === c.id ? 'ring-2 ring-primary/40 dark:ring-dark-accent/40' : 'hover:opacity-80'
              }`}
              style={{
                backgroundColor: `${c.color}20`,
                border: `1.5px solid ${c.color}`,
                color: c.color,
              }}
            >
              <span>{c.icon}</span><span>{c.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Limit */}
      <Input
        label="Hạn mức tháng (VND)"
        type="number"
        inputMode="decimal"
        value={limit}
        onChange={(e) => setLimit(e.target.value)}
        placeholder="VD: 5,000,000"
      />
      {limit && <p className="text-xs text-muted dark:text-dark-muted -mt-2">= {formatCurrency(parseFloat(limit) || 0)}</p>}

      {/* Alert threshold */}
      <div>
        <label className="block text-xs font-medium text-secondary dark:text-dark-secondary mb-2">
          Cảnh báo khi đạt
        </label>
        <div className="flex gap-2">
          {[80, 90, 100].map((t) => (
            <button
              key={t}
              onClick={() => setThreshold(t)}
              className={`flex-1 py-2 text-xs rounded-md border transition-all font-medium ${
                threshold === t
                  ? 'border-accent dark:border-dark-accent bg-accent/10 dark:bg-dark-accent/10 text-accent dark:text-dark-accent'
                  : 'border-border dark:border-dark-border text-muted dark:text-dark-muted hover:border-accent/50'
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

export default function BudgetsPage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const period = getPeriod(year, month)

  const { data: budgets, isLoading } = useBudgetWithSpending(period)
  const { data: categories } = useCategories()
  const deleteBudget = useDeleteBudget()

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
      const update = useUpdateBudget()
      update.mutate({ id: editTarget.id, ...payload }, {
        onSuccess: () => { toast.success('Đã cập nhật!'); setShowForm(false); setEditTarget(null) },
        onError: (e: Error) => toast.error(e.message),
      })
    } else {
      const create = useCreateBudget()
      create.mutate(payload, {
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

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-primary dark:text-dark-primary">Ngân sách</h2>
          <p className="text-xs text-muted dark:text-dark-muted">Theo dõi chi tiêu theo danh mục</p>
        </div>
        <Button variant="accent" size="sm" onClick={() => { setEditTarget(null); setShowForm(true) }}>
          + Tạo ngân sách
        </Button>
      </div>

      {/* Month selector */}
      <div className="flex items-center justify-between bg-surface-2 dark:bg-dark-surface-2 rounded-lg px-4 py-3">
        <button onClick={prevMonth} className="text-xl text-muted dark:text-dark-muted hover:text-primary dark:hover:text-dark-primary transition-colors px-2">←</button>
        <p className="text-sm font-semibold text-primary dark:text-dark-primary">{formatPeriod(period)}</p>
        <button onClick={nextMonth} className="text-xl text-muted dark:text-dark-muted hover:text-primary dark:hover:text-dark-primary transition-colors px-2">→</button>
      </div>

      {/* Summary banner */}
      {sortedBudgets.length > 0 && (() => {
        const exceeded = sortedBudgets.filter(b => b.status === 'exceeded').length
        const warning = sortedBudgets.filter(b => b.status === 'warning').length
        if (!exceeded && !warning) return (
          <div className="p-3 rounded-lg bg-positive/10 border border-positive/20 dark:border-dark-positive/20">
            <p className="text-xs font-medium text-positive dark:text-dark-positive">✅ Tất cả ngân sách trong tầm kiểm soát</p>
          </div>
        )
        return (
          <div className="p-3 rounded-lg bg-negative/10 border border-negative/20 dark:border-dark-negative/20 space-y-1">
            {exceeded > 0 && <p className="text-xs font-medium text-negative dark:text-dark-negative">⚠️ {exceeded} ngân sách đã vượt</p>}
            {warning > 0 && <p className="text-xs font-medium text-warning dark:text-dark-warning">⚠️ {warning} ngân sách gần đạt</p>}
          </div>
        )
      })()}

      {/* Budget list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="card p-4 h-24 animate-pulse" />)}
        </div>
      ) : sortedBudgets.length === 0 ? (
        <div className="text-center py-12 space-y-3">
          <p className="text-4xl">📊</p>
          <p className="text-sm text-muted dark:text-dark-muted">Chưa có ngân sách nào</p>
          <p className="text-xs text-muted dark:text-dark-muted">Tạo ngân sách để theo dõi chi tiêu</p>
          <Button variant="accent" size="sm" onClick={() => { setEditTarget(null); setShowForm(true) }}>
            + Tạo ngân sách đầu tiên
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedBudgets.map((b) => (
            <BudgetCard
              key={b.id}
              budget={b}
              onEdit={() => { setEditTarget(b); setShowForm(true) }}
              onDelete={() => handleDelete(b)}
            />
          ))}
        </div>
      )}

      {/* Create/Edit BottomSheet */}
      <BottomSheet
        open={showForm}
        onClose={() => { setShowForm(false); setEditTarget(null) }}
        title={editTarget ? 'Sửa ngân sách' : '+ Tạo ngân sách'}
      >
        <BudgetForm
          editBudget={editTarget}
          period={period}
          categories={(categories ?? []).map((c: any) => c)}
          onClose={() => { setShowForm(false); setEditTarget(null) }}
          onSubmit={handleSubmit}
        />
      </BottomSheet>
    </div>
  )
}
