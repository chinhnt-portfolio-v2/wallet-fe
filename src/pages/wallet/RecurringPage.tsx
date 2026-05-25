import { useState } from 'react'
import { toast } from 'sonner'
import { useRecurringRules, useCreateRecurring, useUpdateRecurring, useToggleRecurring, useDeleteRecurring } from '@/hooks/useRecurring'
import { useWallets } from '@/hooks/useWallets'
import { useCategories } from '@/hooks/useCategories'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { SectionLabel, Amount, CategoryChip } from '@/design-system'
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
  // Derive hue from category color for CategoryChip
  const color = rule.category?.color ?? '#94A3B8'
  const hue = color
    ? Math.round((parseInt(color.slice(1, 3), 16) / 255) * 120 +
        (parseInt(color.slice(3, 5), 16) / 255) * 60 +
        (parseInt(color.slice(5, 7), 16) / 255) * 180) % 360
    : 200

  return (
    <div className="bg-surface border border-border rounded-lg p-4 space-y-3">
      {/* Top row: category chip + name + toggle */}
      <div className="flex items-center gap-3">
        <CategoryChip
          cat="other"
          name={rule.category?.name ?? 'R'}
          hue={hue}
          size={36}
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-primary truncate">
            {rule.category?.name ?? 'Danh mục'}
          </p>
          <p className="font-mono text-[11px] text-muted truncate">
            {rule.wallet?.name ?? '—'}
          </p>
        </div>

        {/* Status pill + toggle */}
        <div className="flex items-center gap-2 shrink-0">
          <span className={`font-mono text-[10px] uppercase tracking-wide px-2 py-0.5 rounded ${
            isActive ? 'bg-positive/10 text-positive' : 'bg-warning/10 text-warning'
          }`}>
            {isActive ? 'Active' : 'Paused'}
          </span>
          <button
            role="switch"
            aria-checked={isActive}
            aria-label={isActive ? 'Tạm dừng' : 'Kích hoạt'}
            onClick={onToggle}
            className={`w-9 h-5 rounded-full transition-all relative shrink-0 ${
              isActive ? 'bg-positive' : 'bg-border'
            }`}
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
          className={rule.type === 'EXPENSE' ? 'text-negative' : 'text-positive'}
          style={{ color: rule.type === 'EXPENSE' ? 'var(--color-negative)' : 'var(--color-positive)' }}
        />
        <span className="font-mono text-[11px] text-muted bg-surface-2 px-2 py-1 rounded">
          {FREQ_LABELS[rule.frequency]}
        </span>
      </div>

      {/* Next occurrence + note */}
      {(rule.nextOccurrence || rule.note) && (
        <div className="space-y-1">
          {rule.nextOccurrence && (
            <p className="font-mono text-[11px] text-muted">
              Lần tới: <span className="text-secondary">{formatDate(rule.nextOccurrence)}</span>
            </p>
          )}
          {rule.note && (
            <p className="font-mono text-[11px] text-muted italic">"{rule.note}"</p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-1 border-t border-border">
        <button onClick={onEdit} className="flex-1 text-center font-mono text-[11px] uppercase tracking-wide text-muted hover:text-accent py-1 transition-colors">
          Sửa
        </button>
        <button onClick={onDelete} className="flex-1 text-center font-mono text-[11px] uppercase tracking-wide text-negative hover:underline py-1 transition-colors">
          Xóa
        </button>
      </div>
    </div>
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
      <SectionLabel>{isEditing ? 'Sửa giao dịch định kỳ' : 'Tạo giao dịch định kỳ'}</SectionLabel>

      {/* Type */}
      <div className="flex gap-1 bg-surface-2 rounded-md p-1">
        {(['EXPENSE', 'INCOME'] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setType(t); setCategoryId(0) }}
            className={`flex-1 py-2 font-mono text-[11px] uppercase tracking-wide rounded-sm transition-all ${
              type === t
                ? t === 'EXPENSE'
                  ? 'bg-negative text-white font-medium shadow-sm'
                  : 'bg-positive text-white font-medium shadow-sm'
                : 'text-muted hover:text-primary hover:bg-surface-2'
            }`}
          >
            {t === 'EXPENSE' ? 'Chi' : 'Thu'}
          </button>
        ))}
      </div>

      {/* Wallet */}
      <div>
        <label className="block font-mono text-[10px] uppercase tracking-widest text-muted mb-1.5">Ví</label>
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
        <label className="block font-mono text-[10px] uppercase tracking-widest text-muted mb-2">Danh mục</label>
        <div className="flex flex-wrap gap-2">
          {filteredCats.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategoryId(c.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono text-[11px] transition-all ${
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
        <label className="block font-mono text-[10px] uppercase tracking-widest text-muted mb-2">Tần suất</label>
        <div className="grid grid-cols-2 gap-2">
          {FREQ_OPTIONS.map((f) => (
            <button
              key={f}
              onClick={() => setFrequency(f)}
              className={`py-2 font-mono text-[11px] uppercase tracking-wide rounded-md border transition-all ${
                frequency === f
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-border text-muted hover:border-accent/50'
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
  const createRecurring = useCreateRecurring()
  const updateRecurring = useUpdateRecurring()

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
      updateRecurring.mutate({ id: editTarget.id, ...data } as any, {
        onSuccess: () => { toast.success('Đã cập nhật!'); setShowForm(false); setEditTarget(null) },
        onError: (e: Error) => toast.error(e.message),
      })
    } else {
      createRecurring.mutate(data as any, {
        onSuccess: () => { toast.success('Đã tạo giao dịch định kỳ!'); setShowForm(false) },
        onError: (e: Error) => toast.error(e.message),
      })
    }
  }

  const activeRules = rules?.filter((r) => r.status === 'ACTIVE') ?? []
  const pausedRules = rules?.filter((r) => r.status !== 'ACTIVE') ?? []

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted mb-0.5">Money / Recurring</p>
          <h2 className="text-base font-semibold text-primary">Giao dịch định kỳ</h2>
        </div>
        <button
          onClick={() => { setEditTarget(null); setShowForm(true) }}
          className="h-7 px-3 rounded-full font-mono text-[11px] uppercase tracking-[0.05em] bg-accent text-accent-ink hover:brightness-105 transition-all"
        >
          + Tạo mới
        </button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-surface border border-border rounded-lg p-4 h-32 animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty */}
      {!isLoading && rules?.length === 0 && (
        <div className="bg-surface border border-border rounded-lg p-8 text-center space-y-3">
          <SectionLabel>Trống</SectionLabel>
          <p className="text-sm text-muted mt-4">Chưa có giao dịch định kỳ nào</p>
          <p className="font-mono text-[11px] text-muted">Tiền nhà, thuê bao, gym — tự động ghi nhận mỗi kỳ</p>
          <button
            onClick={() => { setEditTarget(null); setShowForm(true) }}
            className="h-7 px-3 rounded-full font-mono text-[11px] uppercase tracking-[0.05em] bg-accent text-accent-ink hover:brightness-105 transition-all"
          >
            + Tạo giao dịch đầu tiên
          </button>
        </div>
      )}

      {/* Active rules */}
      {!isLoading && activeRules.length > 0 && (
        <div className="space-y-3">
          <SectionLabel right={`${activeRules.length} quy tắc`}>Đang hoạt động</SectionLabel>
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
          <SectionLabel right={`${pausedRules.length} quy tắc`}>Tạm dừng</SectionLabel>
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
        title={editTarget ? 'Sửa giao dịch định kỳ' : 'Tạo giao dịch định kỳ'}
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
