import { useState } from 'react'
import { toast } from 'sonner'
import { useRecurringRules, useCreateRecurring, useUpdateRecurring, useToggleRecurring, useDeleteRecurring } from '@/hooks/useRecurring'
import { useWallets } from '@/hooks/useWallets'
import { useCategories } from '@/hooks/useCategories'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { formatCurrency } from '@/lib/utils'
import type { RecurringFrequency, RecurringRule } from '@/types'

const FREQ_LABELS: Record<RecurringFrequency, string> = {
  DAILY: 'Hàng ngày',
  WEEKLY: 'Hàng tuần',
  MONTHLY: 'Hàng tháng',
  YEARLY: 'Hàng năm',
}

const FREQ_OPTIONS: RecurringFrequency[] = ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']

function formatDate(d: string | null | undefined) {
  if (!d) return '—'
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${y}`
}

function RecurringCard({
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
  const isActive = rule.status === 'ACTIVE'

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-base shrink-0"
            style={{ backgroundColor: `${rule.category?.color ?? '#94A3B8'}20` }}
          >
            {rule.category?.icon ?? '🔁'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-primary dark:text-dark-primary truncate">
              {rule.category?.name ?? 'Danh mục'}
            </p>
            <p className="text-xs text-muted dark:text-dark-muted truncate">
              {rule.wallet?.name ?? '—'}
            </p>
          </div>
        </div>

        {/* Status + toggle */}
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-2xs font-medium px-2 py-0.5 rounded-full ${
            isActive
              ? 'bg-positive/10 text-positive dark:text-dark-positive'
              : 'bg-warning/10 text-warning dark:text-dark-warning'
          }`}>
            {isActive ? 'Đang hoạt động' : 'Tạm dừng'}
          </span>
          <button
            role="switch"
            aria-checked={isActive}
            aria-label={isActive ? 'Tạm dừng' : 'Kích hoạt'}
            onClick={onToggle}
            className={`w-9 h-5 rounded-full transition-all relative ${
              isActive ? 'bg-positive dark:bg-dark-positive' : 'bg-border dark:bg-dark-border'
            }`}
          >
            <span className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-all ${
              isActive ? 'right-0.5' : 'left-0.5'
            }`} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Amount + Frequency */}
      <div className="flex items-center justify-between">
        <p className={`text-base font-bold font-mono tabular-nums ${
          rule.type === 'EXPENSE' ? 'text-negative dark:text-dark-negative' : 'text-positive dark:text-dark-positive'
        }`}>
          {rule.type === 'EXPENSE' ? '-' : '+'}{formatCurrency(rule.amount)}₫
        </p>
        <span className="text-xs text-muted dark:text-dark-muted bg-surface-2 dark:bg-dark-surface-2 px-2 py-1 rounded">
          {FREQ_LABELS[rule.frequency]}
        </span>
      </div>

      {/* Next occurrence */}
      {rule.nextOccurrence && (
        <p className="text-xs text-muted dark:text-dark-muted">
          Lần tới: <span className="font-medium text-secondary dark:text-dark-secondary">{formatDate(rule.nextOccurrence)}</span>
        </p>
      )}
      {rule.note && (
        <p className="text-xs text-muted dark:text-dark-muted italic">"{rule.note}"</p>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-1 border-t border-border dark:border-dark-border">
        <button onClick={onEdit} className="flex-1 text-center text-xs text-muted dark:text-dark-muted hover:text-accent dark:hover:text-dark-accent py-1">
          ✏️ Sửa
        </button>
        <button onClick={onDelete} className="flex-1 text-center text-xs text-negative dark:text-dark-negative hover:underline py-1">
          🗑️ Xóa
        </button>
      </div>
    </Card>
  )
}

function RecurringForm({
  editRule,
  wallets,
  categories,
  onClose,
  onSubmit,
}: {
  editRule?: RecurringRule
  wallets: { id: number; name: string; icon: string; color: string }[]
  categories: { id: number; name: string; icon: string; color: string; type: string }[]
  onClose: () => void
  onSubmit: (data: {
    walletId: number; categoryId: number; amount: number; type: string
    frequency: RecurringFrequency; startDate: string; endDate?: string; note?: string
  }) => void
}) {
  const create = useCreateRecurring()
  const update = useUpdateRecurring()
  const isEditing = !!editRule

  const today = new Date().toISOString().split('T')[0]

  const [walletId, setWalletId] = useState<number>(editRule?.walletId ?? 0)
  const [categoryId, setCategoryId] = useState<number>(editRule?.categoryId ?? 0)
  const [amount, setAmount] = useState(editRule?.amount?.toString() ?? '')
  const [type, setType] = useState<'EXPENSE' | 'INCOME'>(editRule?.type ?? 'EXPENSE')
  const [frequency, setFrequency] = useState<RecurringFrequency>(editRule?.frequency ?? 'MONTHLY')
  const [startDate, setStartDate] = useState(editRule?.startDate ?? today)
  const [endDate, setEndDate] = useState(editRule?.endDate ?? '')
  const [note, setNote] = useState(editRule?.note ?? '')

  const isPending = create.isPending || update.isPending

  const handleSubmit = () => {
    if (!walletId) { toast.error('Chọn ví'); return }
    if (!categoryId) { toast.error('Chọn danh mục'); return }
    if (!amount || parseFloat(amount) <= 0) { toast.error('Nhập số tiền hợp lệ'); return }
    onSubmit({
      walletId, categoryId, amount: parseFloat(amount), type,
      frequency, startDate, endDate: endDate || undefined, note: note || undefined,
    })
  }

  const filteredCats = categories.filter((c) => c.type === type)
  const activeWallets = wallets.filter((w: any) => w.isActive !== false)

  return (
    <div className="space-y-4">
      <p className="text-sm font-semibold text-primary dark:text-dark-primary">
        {isEditing ? 'Sửa giao dịch định kỳ' : '+ Tạo giao dịch định kỳ'}
      </p>

      {/* Type */}
      <div className="flex gap-1 bg-surface-2 dark:bg-dark-surface-2 rounded-md p-1">
        {(['EXPENSE', 'INCOME'] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setType(t); setCategoryId(0) }}
            className={`flex-1 py-2 text-xs rounded-sm transition-all ${
              type === t
                ? t === 'EXPENSE'
                  ? 'bg-negative text-white font-medium shadow-sm'
                  : 'bg-positive text-white font-medium shadow-sm'
                : 'text-muted dark:text-dark-muted hover:text-primary dark:hover:text-dark-primary'
            }`}
          >
            {t === 'EXPENSE' ? '💸 Chi' : '📥 Thu'}
          </button>
        ))}
      </div>

      {/* Wallet */}
      <div>
        <label className="block text-xs font-medium text-secondary dark:text-dark-secondary mb-1.5">Ví</label>
        <select
          value={walletId}
          onChange={(e) => setWalletId(Number(e.target.value))}
          className="input"
        >
          <option value={0}>— Chọn ví —</option>
          {activeWallets.map((w: any) => (
            <option key={w.id} value={w.id}>{w.icon} {w.name}</option>
          ))}
        </select>
      </div>

      {/* Amount */}
      <Input
        label="Số tiền (VND)"
        type="number"
        inputMode="decimal"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="VD: 150,000"
      />

      {/* Category */}
      <div>
        <label className="block text-xs font-medium text-secondary dark:text-dark-secondary mb-2">Danh mục</label>
        <div className="flex flex-wrap gap-2">
          {filteredCats.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategoryId(c.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all ${
                categoryId === c.id ? 'ring-2 ring-primary/40' : 'hover:opacity-80'
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

      {/* Frequency */}
      <div>
        <label className="block text-xs font-medium text-secondary dark:text-dark-secondary mb-2">Tần suất</label>
        <div className="grid grid-cols-2 gap-2">
          {FREQ_OPTIONS.map((f) => (
            <button
              key={f}
              onClick={() => setFrequency(f)}
              className={`py-2 text-xs rounded-md border transition-all font-medium ${
                frequency === f
                  ? 'border-accent dark:border-dark-accent bg-accent/10 dark:bg-dark-accent/10 text-accent dark:text-dark-accent'
                  : 'border-border dark:border-dark-border text-muted dark:text-dark-muted hover:border-accent/50'
              }`}
            >
              {FREQ_LABELS[f]}
            </button>
          ))}
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-3">
        <Input label="Ngày bắt đầu" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <Input label="Ngày kết thúc (tùy)" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
      </div>

      {/* Note */}
      <Input label="Ghi chú (tùy chọn)" value={note} onChange={(e) => setNote(e.target.value)} placeholder="VD: Tiền nhà hàng tháng" />

      <div className="flex gap-2 pt-2">
        <Button variant="outline" onClick={onClose} className="flex-1">Hủy</Button>
        <Button onClick={handleSubmit} disabled={isPending} className="flex-1">
          {isPending ? 'Đang lưu...' : isEditing ? 'Lưu thay đổi' : 'Tạo'}
        </Button>
      </div>
    </div>
  )
}

export default function RecurringPage() {
  const { data: rules, isLoading } = useRecurringRules()
  const { data: wallets } = useWallets()
  const { data: categories } = useCategories()
  const toggle = useToggleRecurring()
  const deleteR = useDeleteRecurring()

  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState<RecurringRule | null>(null)

  const handleToggle = (rule: RecurringRule) => {
    const newStatus = rule.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE'
    toggle.mutate({ id: rule.id, status: newStatus }, {
      onSuccess: () => toast.success(newStatus === 'ACTIVE' ? 'Đã kích hoạt lại' : 'Đã tạm dừng'),
      onError: (e: Error) => toast.error(e.message),
    })
  }

  const handleDelete = (rule: RecurringRule) => {
    if (!confirm(`Xóa giao dịch định kỳ "${rule.category?.name}"?`)) return
    deleteR.mutate(rule.id, {
      onSuccess: () => toast.success('Đã xóa'),
      onError: (e: Error) => toast.error(e.message),
    })
  }

  const handleSubmit = (data: {
    walletId: number; categoryId: number; amount: number; type: string
    frequency: RecurringFrequency; startDate: string; endDate?: string; note?: string
  }) => {
    if (editTarget) {
      const update = useUpdateRecurring()
      update.mutate({ id: editTarget.id, ...data } as any, {
        onSuccess: () => { toast.success('Đã cập nhật!'); setShowForm(false); setEditTarget(null) },
        onError: (e: Error) => toast.error(e.message),
      })
    } else {
      const create = useCreateRecurring()
      create.mutate(data as any, {
        onSuccess: () => { toast.success('Đã tạo giao dịch định kỳ!'); setShowForm(false) },
        onError: (e: Error) => toast.error(e.message),
      })
    }
  }

  const activeRules = rules?.filter((r) => r.status === 'ACTIVE') ?? []
  const pausedRules = rules?.filter((r) => r.status !== 'ACTIVE') ?? []

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-primary dark:text-dark-primary">Giao dịch định kỳ</h2>
          <p className="text-xs text-muted dark:text-dark-muted">
            {activeRules.length} đang hoạt động
          </p>
        </div>
        <Button variant="accent" size="sm" onClick={() => { setEditTarget(null); setShowForm(true) }}>
          + Tạo mới
        </Button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="card p-4 h-32 animate-pulse" />)}
        </div>
      )}

      {/* Empty */}
      {!isLoading && rules?.length === 0 && (
        <div className="text-center py-12 space-y-3">
          <p className="text-4xl">🔁</p>
          <p className="text-sm text-muted dark:text-dark-muted">Chưa có giao dịch định kỳ nào</p>
          <p className="text-xs text-muted dark:text-dark-muted">Tiền nhà, thuê bao, gym — tự động ghi nhận mỗi kỳ</p>
          <Button variant="accent" size="sm" onClick={() => { setEditTarget(null); setShowForm(true) }}>
            + Tạo giao dịch đầu tiên
          </Button>
        </div>
      )}

      {/* Active rules */}
      {!isLoading && activeRules.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-medium text-muted dark:text-dark-muted uppercase tracking-wide">
            Đang hoạt động ({activeRules.length})
          </p>
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

      {/* Paused rules */}
      {!isLoading && pausedRules.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-medium text-muted dark:text-dark-muted uppercase tracking-wide">
            Tạm dừng ({pausedRules.length})
          </p>
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

      {/* Form BottomSheet */}
      <BottomSheet
        open={showForm}
        onClose={() => { setShowForm(false); setEditTarget(null) }}
        title={editTarget ? 'Sửa giao dịch định kỳ' : '+ Tạo giao dịch định kỳ'}
      >
        <RecurringForm
          editRule={editTarget ?? undefined}
          wallets={(wallets ?? []) as any}
          categories={(categories ?? []) as any}
          onClose={() => { setShowForm(false); setEditTarget(null) }}
          onSubmit={handleSubmit as any}
        />
      </BottomSheet>
    </div>
  )
}
