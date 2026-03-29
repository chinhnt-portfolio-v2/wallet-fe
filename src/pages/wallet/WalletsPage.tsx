import { useState } from 'react'
import { useWallets, useCreateWallet, useUpdateWallet, useDeleteWallet } from '@/hooks/useWallets'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { formatCurrency, WALLET_TYPE_LABEL } from '@/lib/utils'
import { toast } from 'sonner'
import type { Wallet } from '@/types'

// WALLET_ICONS and WALLET_COLORS — moved from deleted walletStore
const WALLET_ICONS = ['💰', '🏦', '💳', '📱', '🎁', '🏠', '🚗', '✈️']
const WALLET_COLORS = [
  '#0EA5E9', '#10B981', '#F97316', '#8B5CF6',
  '#EC4899', '#F59E0B', '#06B6D4', '#64748B',
]

function WalletForm({
  initial,
  onSubmit,
  onCancel,
  isPending,
}: {
  initial?: { id?: number; name: string; icon: string; color: string; type: Wallet['type']; balance?: number }
  onSubmit: (data: { name: string; icon: string; color: string; type: Wallet['type']; initialBalance?: number }) => void
  onCancel: () => void
  isPending: boolean
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [type, setType] = useState<Wallet['type']>(initial?.type ?? 'CASH')
  const [icon, setIcon] = useState(initial?.icon ?? '💰')
  const [color, setColor] = useState(initial?.color ?? '#0EA5E9')
  const [initialBalance, setInitialBalance] = useState(initial?.balance?.toString() ?? '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { toast.error('Nhập tên ví'); return }
    const balance = initialBalance ? parseFloat(initialBalance) : undefined
    onSubmit({ name: name.trim(), icon, color, type, initialBalance: balance })
  }

  return (
    <Card className="space-y-4">
      <p className="text-sm font-semibold text-primary">
        {initial?.id ? '✏️ Sửa ví' : '+ Tạo ví mới'}
      </p>

      <Input
        label="Tên ví"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="VD: Ví MoMo, Timo..."
        required
      />

      <div>
        <label className="block text-xs font-medium text-secondary mb-2">Loại</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as Wallet['type'])}
          className="w-full rounded-sm border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
        >
          {Object.entries(WALLET_TYPE_LABEL).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-secondary mb-2">Icon</label>
        <div className="flex gap-2 flex-wrap">
          {WALLET_ICONS.map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIcon(i)}
              className={`w-9 h-9 text-lg rounded-md border transition-all flex items-center justify-center ${
                icon === i
                  ? 'border-accent ring-2 ring-accent/30'
                  : 'border-border hover:border-accent/50'
              }`}
            >
              {i}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-secondary mb-2">Màu</label>
        <div className="flex gap-2">
          {WALLET_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`w-7 h-7 rounded-full transition-all ${
                color === c ? 'ring-2 ring-offset-2 ring-primary scale-110' : 'hover:scale-110'
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      {/* Initial balance — hidden for edit */}
      {!initial?.id && (
        <div>
          <label className="block text-xs font-medium text-secondary mb-1.5">
            Số dư ban đầu
          </label>
          <div className="relative">
            <input
              type="number"
              inputMode="decimal"
              value={initialBalance}
              onChange={(e) => setInitialBalance(e.target.value)}
              className="w-full rounded-sm border border-border bg-surface px-3 py-2 text-sm font-mono pr-10 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
              placeholder="0"
              min="0"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted">₫</span>
          </div>
          <p className="text-xs text-muted mt-1">
            Bỏ trống nếu ví mới không có tiền.
          </p>
        </div>
      )}

      {/* Preview */}
      <div className="flex items-center gap-3 p-3 rounded-md border border-border">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
          style={{ backgroundColor: `${color}20` }}
        >
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-primary">{name || 'Xem trước'}</p>
          <p className="text-xs text-muted">{WALLET_TYPE_LABEL[type] ?? type}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={onCancel} className="flex-1">Hủy</Button>
        <Button onClick={handleSubmit} disabled={isPending || !name.trim()} className="flex-1">
          {isPending ? 'Đang lưu...' : initial?.id ? 'Lưu thay đổi' : 'Tạo ví'}
        </Button>
      </div>
    </Card>
  )
}

function WalletCard({
  wallet,
  onEdit,
}: {
  wallet: Wallet
  onEdit: (w: Wallet) => void
}) {
  return (
    <div className="card p-4 flex items-center gap-3 group">
      <div
        className="w-11 h-11 rounded-full flex items-center justify-center text-xl shrink-0"
        style={{ backgroundColor: `${wallet.color}20` }}
      >
        {wallet.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-primary">{wallet.name}</p>
        <p className="text-xs text-muted">{WALLET_TYPE_LABEL[wallet.type] ?? wallet.type}</p>
      </div>
      <div className="text-right">
        <p className={`text-sm font-semibold font-mono tabular-nums ${
          Number(wallet.balance) < 0 ? 'text-negative' : 'text-primary'
        }`}>
          {formatCurrency(Number(wallet.balance))}
        </p>
        <p className="text-xs text-muted">₫</p>
      </div>
      <button
        onClick={() => onEdit(wallet)}
        className="opacity-0 group-hover:opacity-100 text-muted hover:text-primary transition-all text-sm px-2 py-1 rounded border border-border hover:border-accent/50"
        aria-label={`Sửa ví ${wallet.name}`}
      >
        ✏️
      </button>
    </div>
  )
}

function EditModal({
  wallet,
  onClose,
}: {
  wallet: Wallet
  onClose: () => void
}) {
  const update = useUpdateWallet()
  const del = useDeleteWallet()
  const [showDelete, setShowDelete] = useState(false)

  const handleUpdate = (data: { name: string; icon: string; color: string; type: Wallet['type']; initialBalance?: number }) => {
    update.mutate({ id: wallet.id, ...data, initialBalance: Number(wallet.balance) }, {
      onSuccess: () => { toast.success('Đã cập nhật ví!'); onClose() },
      onError: (e: Error) => toast.error(e.message),
    })
  }

  const handleDelete = () => {
    del.mutate(wallet.id, {
      onSuccess: () => { toast.success('Đã xóa ví'); onClose() },
      onError: (e: Error) => toast.error(e.message),
    })
  }

  return (
    <BottomSheet open onClose={onClose} title="✏️ Sửa ví">
      <WalletForm
        initial={wallet}
        onSubmit={handleUpdate}
        onCancel={onClose}
        isPending={update.isPending}
      />
      <div className="border-t border-border pt-3 mt-3">
        {showDelete ? (
          <div className="space-y-3">
            {/* Warning with balance info */}
            <div className="p-3 rounded-md bg-negative/5 border border-negative/20 space-y-1">
              <p className="text-xs font-medium text-negative flex items-center gap-1.5">
                <span aria-hidden="true">⚠️</span> Cảnh báo khi xóa ví
              </p>
              <p className="text-xs text-muted">
                Xóa ví <strong className="text-primary">"{wallet.name}"</strong> sẽ bỏ liên kết với tất cả giao dịch hiện có. Số dư hiện tại là{' '}
                <strong className="text-primary">{formatCurrency(Number(wallet.balance))}</strong>.
              </p>
              <p className="text-xs text-muted">
                Giao dịch sẽ <strong className="text-primary">không bị xóa</strong> nhưng sẽ không còn liên kết với ví này.
              </p>
            </div>
            <p className="text-xs text-negative text-center font-medium">
              Hành động này không thể hoàn tác.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowDelete(false)} className="flex-1">Hủy</Button>
              <Button
                onClick={handleDelete}
                disabled={del.isPending}
                className="flex-1 !bg-negative !text-white"
              >
                {del.isPending ? 'Đang xóa...' : '🗑️ Xóa ví'}
              </Button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowDelete(true)}
            className="w-full text-center text-xs text-negative hover:underline py-1"
          >
            🗑️ Xóa ví
          </button>
        )}
      </div>
    </BottomSheet>
  )
}

export default function WalletsPage() {
  const [showAdd, setShowAdd] = useState(false)
  const [editTarget, setEditTarget] = useState<Wallet | null>(null)

  const { data: wallets, isLoading, error } = useWallets()
  const createWallet = useCreateWallet()

  const handleCreate = (data: { name: string; icon: string; color: string; type: Wallet['type'] }) => {
    createWallet.mutate(data, {
      onSuccess: () => {
        toast.success('Đã tạo ví!')
        setShowAdd(false)
      },
      onError: (e: Error) => toast.error(e.message),
    })
  }

  const active = Array.isArray(wallets) ? wallets : []
  const byType = {
    CASH: active.filter((w) => w.type === 'CASH'),
    BANK: active.filter((w) => w.type === 'BANK'),
    E_WALLET: active.filter((w) => w.type === 'E_WALLET'),
    POSTPAID: active.filter((w) => w.type === 'POSTPAID'),
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-primary">Ví của tôi</h2>
          <p className="text-xs text-muted">{active.length} ví</p>
        </div>
        <Button
          variant={showAdd ? 'outline' : 'accent'}
          size="sm"
          onClick={() => setShowAdd(!showAdd)}
        >
          {showAdd ? '− Đóng' : '+ Thêm ví'}
        </Button>
      </div>

      {/* Add form */}
      {showAdd && (
        <WalletForm
          onSubmit={handleCreate}
          onCancel={() => setShowAdd(false)}
          isPending={createWallet.isPending}
        />
      )}

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full rounded-md" />)}
        </div>
      )}

      {/* Error */}
      {error && (
        <EmptyState icon="⚠️" title="Không tải được ví" description="Hãy thử lại sau." />
      )}

      {/* Wallet list */}
      {!isLoading && !error && (
        <div className="space-y-6">
          {(['CASH', 'BANK', 'E_WALLET', 'POSTPAID'] as const).map((t) => {
            const items = byType[t]
            if (!items?.length) return null
            return (
              <div key={t}>
                <p className="text-xs font-medium text-muted uppercase tracking-wide mb-2">
                  {WALLET_TYPE_LABEL[t]}
                </p>
                <div className="space-y-2">
                  {items.map((w) => (
                    <WalletCard
                      key={w.id}
                      wallet={w}
                      onEdit={(wallet) => setEditTarget(wallet)}
                    />
                  ))}
                </div>
              </div>
            )
          })}

          {active.length === 0 && (
            <EmptyState
              icon="💼"
              title="Chưa có ví nào"
              description="Tạo ví đầu tiên để bắt đầu theo dõi tài chính."
              action={
                <Button variant="accent" size="sm" onClick={() => setShowAdd(true)}>
                  + Tạo ví
                </Button>
              }
            />
          )}
        </div>
      )}

      {/* Edit modal */}
      {editTarget && (
        <EditModal
          wallet={editTarget}
          onClose={() => setEditTarget(null)}
        />
      )}
    </div>
  )
}
