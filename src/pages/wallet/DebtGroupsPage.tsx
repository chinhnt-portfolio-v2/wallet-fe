import { useState } from 'react'
import { useDebtGroups, useUpdateDebtGroup, useDeleteDebtGroup } from '@/hooks/useDebtGroups'
import { useWallets } from '@/hooks/useWallets'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { CardSkeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency, formatDate, isOverdue, GROUP_TYPE_LABEL, GROUP_STATUS_LABEL } from '@/lib/utils'
import { toast } from 'sonner'
import type { DebtGroup, CreateDebtGroupRequest } from '@/types'

const GROUP_TYPES = [
  { value: 'BNPL',            label: 'Mua trả sau',   icon: '🛒' },
  { value: 'DEBT',            label: 'Vay nợ',         icon: '🤝' },
  { value: 'LOAN_GIVEN',      label: 'Cho vay',       icon: '💸' },
  { value: 'PURCHASE_CREDIT', label: 'Mua chịu',      icon: '📦' },
]

function GroupForm({
  initial,
  onSubmit,
  onCancel,
  isPending,
}: {
  initial?: { id?: number; title: string; groupType: DebtGroup['groupType']; totalAmount: number; dueDate?: string | null; counterparty?: string | null }
  onSubmit: (data: { id?: number; title: string; groupType: DebtGroup['groupType']; totalAmount: number; dueDate?: string; counterparty?: string }) => void
  onCancel: () => void
  isPending: boolean
}) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [groupType, setGroupType] = useState<DebtGroup['groupType']>(initial?.groupType ?? 'DEBT')
  const [totalAmount, setTotalAmount] = useState(initial?.totalAmount?.toString() ?? '')
  const [dueDate, setDueDate] = useState(initial?.dueDate ? initial.dueDate.split('T')[0] : '')
  const [counterparty, setCounterparty] = useState(initial?.counterparty ?? '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) { toast.error('Nhập tên khoản nợ'); return }
    if (!totalAmount)  { toast.error('Nhập số tiền'); return }
    onSubmit({
      title: title.trim(),
      groupType,
      totalAmount: parseFloat(totalAmount),
      dueDate: dueDate || undefined,
      counterparty: counterparty || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Group type */}
      <div>
        <label className="block text-xs font-medium text-secondary mb-2">Loại</label>
        <div className="grid grid-cols-2 gap-2">
          {GROUP_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setGroupType(t.value as DebtGroup['groupType'])}
              className={`card p-3 text-left transition-all ${groupType === t.value ? 'border-accent ring-2 ring-accent/20' : 'hover:border-accent/50'}`}
            >
              <p className="text-lg mb-0.5">{t.icon}</p>
              <p className="text-xs font-medium text-primary">{t.label}</p>
            </button>
          ))}
        </div>
      </div>

      <Input
        label="Tên khoản nợ"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="VD: Vay mẹ mua xe"
        required
      />

      <Input
        label="Tổng số tiền (VND)"
        type="number"
        inputMode="decimal"
        value={totalAmount}
        onChange={(e) => setTotalAmount(e.target.value)}
        placeholder="0"
        required
      />

      <Input
        label="Người cho vay / đơn vị"
        value={counterparty}
        onChange={(e) => setCounterparty(e.target.value)}
        placeholder={
          groupType === 'LOAN_GIVEN' ? 'VD: Nguyễn Văn A' : 'VD: MoMo, Shopee'
        }
      />

      <Input
        label="Ngày hết hạn"
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
      />

      <div className="flex gap-2">
        <Button variant="outline" onClick={onCancel} type="button" className="flex-1">Hủy</Button>
        <Button type="submit" disabled={isPending || !title || !totalAmount} className="flex-1">
          {isPending ? 'Đang lưu...' : initial?.id ? 'Lưu thay đổi' : 'Tạo nhóm nợ'}
        </Button>
      </div>
    </form>
  )
}

function EditModal({
  group,
  onClose,
}: {
  group: DebtGroup
  onClose: () => void
}) {
  const update = useUpdateDebtGroup()
  const del    = useDeleteDebtGroup()
  const [showDelete, setShowDelete] = useState(false)

  const handleUpdate = (data: { title: string; groupType: DebtGroup['groupType']; totalAmount: number; dueDate?: string; counterparty?: string }) => {
    update.mutate({ id: group.id, ...data }, {
      onSuccess: () => { toast.success('Đã cập nhật!'); onClose() },
      onError: (e: Error) => toast.error(e.message),
    })
  }

  const handleDelete = () => {
    del.mutate(group.id, {
      onSuccess: () => { toast.success('Đã xóa nhóm nợ'); onClose() },
      onError: (e: Error) => toast.error(e.message),
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40">
      <div className="bg-surface w-full max-w-md rounded-t-2xl sm:rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-primary">✏️ Sửa nhóm nợ</p>
          <button onClick={onClose} className="text-muted hover:text-primary text-xl">×</button>
        </div>
        <GroupForm
          initial={{
            id: group.id,
            title: group.title,
            groupType: group.groupType,
            totalAmount: Number(group.totalAmount),
            dueDate: group.dueDate,
            counterparty: group.counterparty,
          }}
          onSubmit={handleUpdate}
          onCancel={onClose}
          isPending={update.isPending}
        />
        <div className="border-t border-border pt-3">
          {showDelete ? (
            <div className="space-y-2">
              <p className="text-xs text-negative text-center">
                Xóa "{group.title}"? Hành động không thể hoàn tác.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowDelete(false)} className="flex-1">Hủy</Button>
                <Button
                  onClick={handleDelete}
                  disabled={del.isPending}
                  className="flex-1 !bg-negative !text-white"
                >
                  {del.isPending ? 'Đang xóa...' : '🗑️ Xóa'}
                </Button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowDelete(true)}
              className="w-full text-center text-xs text-negative hover:underline py-1"
            >
              🗑️ Xóa nhóm nợ
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function DebtGroupCard({
  group,
  onEdit,
}: {
  group: DebtGroup
  onEdit: (g: DebtGroup) => void
}) {
  const overdue = isOverdue(group.dueDate)
  const remaining = Number(group.totalAmount) - Number(group.paidAmount)
  const progress = Number(group.totalAmount) > 0
    ? (Number(group.paidAmount) / Number(group.totalAmount)) * 100
    : 0

  return (
    <div className="card p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <button onClick={() => onEdit(group)} className="text-left">
            <p className="text-sm font-semibold text-primary hover:text-accent truncate transition-colors">
              {group.title}
            </p>
          </button>
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            <Badge variant="neutral">{GROUP_TYPE_LABEL[group.groupType] ?? group.groupType}</Badge>
            <Badge variant={group.status === 'PARTIAL' ? 'warning' : group.status === 'OPEN' ? 'negative' : 'positive'}>
              {GROUP_STATUS_LABEL[group.status] ?? group.status}
            </Badge>
            {overdue && <Badge variant="negative">Quá hạn</Badge>}
          </div>
        </div>
        <button
          onClick={() => onEdit(group)}
          className="text-muted hover:text-primary transition-colors text-sm px-2 py-1 rounded border border-border hover:border-accent/50 shrink-0"
        >
          ✏️
        </button>
      </div>

      {/* Progress */}
      <div>
        <div className="flex justify-between text-2xs text-muted mb-1.5">
          <span>Đã trả</span>
          <span>{progress.toFixed(0)}%</span>
        </div>
        <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
          <div
            className="h-full bg-positive rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-2xs text-muted mt-1">
          <span>{formatCurrency(Number(group.paidAmount))} đã trả</span>
          <span>{formatCurrency(Number(group.totalAmount))} tổng</span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-end justify-between pt-2 border-t border-border">
        <div>
          <p className="text-2xs text-muted">Còn lại</p>
          <p className="text-base font-bold text-negative font-mono tabular-nums">
            {formatCurrency(remaining)}
          </p>
        </div>
        <div className="text-right">
          {group.dueDate && (
            <p className={`text-2xs ${overdue ? 'text-negative' : 'text-muted'}`}>
              ⏰ {formatDate(group.dueDate)}
            </p>
          )}
          {group.wallet && (
            <p className="text-2xs text-muted mt-0.5">
              {group.wallet.icon} {group.wallet.name}
            </p>
          )}
        </div>
      </div>

      {/* Action */}
      <a
        href={`/debts/${group.id}`}
        className="block w-full text-center py-2 text-xs font-medium bg-accent text-white rounded-sm hover:bg-accent/90 transition-colors"
      >
        Thanh toán
      </a>
    </div>
  )
}

export default function DebtGroupsPage() {
  const [statusFilter, setStatusFilter] = useState('')
  const [editTarget, setEditTarget]     = useState<DebtGroup | null>(null)

  const { data: groups, isLoading, error } = useDebtGroups(statusFilter || undefined)

  const openGroups = groups?.filter((g) => g.status !== 'SETTLED') ?? []

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-primary">Nhóm nợ</h2>
          <p className="text-xs text-muted">{openGroups.length} nhóm đang mở</p>
        </div>
        <a href="/debts/new" className="btn-accent text-xs px-3 py-1.5 rounded-sm">
          + Tạo nợ
        </a>
      </div>

      {/* Filter */}
      <div className="flex gap-1 bg-surface-2 rounded-md p-1">
        {[
          { v: '',          l: 'Tất cả' },
          { v: 'OPEN,PARTIAL', l: 'Đang mở' },
          { v: 'SETTLED',  l: 'Đã thanh toán' },
        ].map(({ v, l }) => (
          <button
            key={v}
            onClick={() => setStatusFilter(v)}
            className={`flex-1 py-1.5 text-xs rounded-sm transition-colors ${
              statusFilter === v
                ? 'bg-surface shadow-sm font-medium text-primary'
                : 'text-muted hover:text-primary'
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <CardSkeleton key={i} />)}
        </div>
      )}

      {/* Error */}
      {error && (
        <EmptyState icon="⚠️" title="Không tải được" description="Hãy thử lại sau." />
      )}

      {/* Empty */}
      {!isLoading && !error && openGroups.length === 0 && (
        <EmptyState
          icon="📭"
          title="Không có nhóm nợ nào"
          description="Khi bạn ghi nhận giao dịch vay nợ, nhóm nợ sẽ hiện ở đây."
        />
      )}

      {/* Groups */}
      {!isLoading && !error && openGroups.length > 0 && (
        <div className="space-y-3">
          {openGroups.map((g) => (
            <DebtGroupCard
              key={g.id}
              group={g}
              onEdit={(group) => setEditTarget(group)}
            />
          ))}
        </div>
      )}

      {/* Edit modal */}
      {editTarget && (
        <EditModal
          group={editTarget}
          onClose={() => setEditTarget(null)}
        />
      )}
    </div>
  )
}
