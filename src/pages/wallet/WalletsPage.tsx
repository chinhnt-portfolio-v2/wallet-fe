import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWallets, useCreateWallet, useUpdateWallet, useDeleteWallet } from '@/hooks/useWallets'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { Amount, SectionLabel, ProgressBar, Pill } from '@/design-system'
import { WALLET_TYPE_LABEL, formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'
import type { Wallet } from '@/types'

const WALLET_ICONS = ['💰', '🏦', '💳', '📱', '🎁', '🏠', '🚗', '✈️']
const WALLET_COLORS = [
  '#0EA5E9', '#10B981', '#F97316', '#8B5CF6',
  '#EC4899', '#F59E0B', '#06B6D4', '#64748B',
]

// Group label map with Vietnamese names
const GROUP_LABEL: Record<string, string> = {
  CASH: 'Tiền mặt',
  BANK: 'Ngân hàng',
  E_WALLET: 'Ví điện tử',
  POSTPAID: 'Trả sau',
}

// Wallet type → color tint for gradient stripe
function walletAccentColor(wallet: Wallet): string {
  if (wallet.color) return wallet.color
  const fallbacks: Record<string, string> = {
    CASH: '#c8f53a', BANK: '#0EA5E9', E_WALLET: '#8B5CF6', POSTPAID: '#F97316',
  }
  return fallbacks[wallet.type] ?? '#64748B'
}

// ── Wallet Form ──────────────────────────────────────────────
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
    <div className="space-y-4 p-4 bg-surface border border-border rounded-lg">
      <p className="font-mono text-[11px] uppercase tracking-widest text-muted">
        {initial?.id ? 'Sửa ví' : 'Tạo ví mới'}
      </p>

      <Input
        label="Tên ví"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="VD: Ví MoMo, Timo..."
        required
      />

      <div>
        <label className="block font-mono text-[10px] uppercase tracking-widest text-muted mb-2">Loại</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as Wallet['type'])}
          className="w-full rounded border border-border bg-bg-2 px-3 py-2 font-mono text-[13px] text-primary focus:outline-none focus:ring-1 focus:ring-accent/40"
        >
          {Object.entries(WALLET_TYPE_LABEL).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block font-mono text-[10px] uppercase tracking-widest text-muted mb-2">Icon</label>
        <div className="flex gap-2 flex-wrap">
          {WALLET_ICONS.map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIcon(i)}
              className={`w-9 h-9 text-lg rounded border transition-all flex items-center justify-center ${
                icon === i
                  ? 'border-accent ring-1 ring-accent/30 bg-accent/10'
                  : 'border-border hover:border-accent/50'
              }`}
            >
              {i}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block font-mono text-[10px] uppercase tracking-widest text-muted mb-2">Màu</label>
        <div className="flex gap-2">
          {WALLET_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`w-7 h-7 rounded-full transition-all ${
                color === c ? 'ring-2 ring-offset-2 ring-border-hi scale-110' : 'hover:scale-110'
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      {!initial?.id && (
        <div>
          <label className="block font-mono text-[10px] uppercase tracking-widest text-muted mb-1.5">
            Số dư ban đầu
          </label>
          <div className="relative">
            <input
              type="number"
              inputMode="decimal"
              value={initialBalance}
              onChange={(e) => setInitialBalance(e.target.value)}
              className="w-full rounded border border-border bg-bg-2 px-3 py-2 font-mono text-[13px] text-primary pr-10 focus:outline-none focus:ring-1 focus:ring-accent/40"
              placeholder="0"
              min="0"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[11px] text-muted">₫</span>
          </div>
          <p className="font-mono text-[10px] text-muted mt-1">
            Bỏ trống nếu ví mới không có tiền.
          </p>
        </div>
      )}

      {/* Preview */}
      <div className="flex items-center gap-3 p-3 rounded border border-border-hi bg-surface-2">
        <div
          className="w-10 h-10 rounded flex items-center justify-center text-lg shrink-0"
          style={{ backgroundColor: `${color}22` }}
        >
          {icon}
        </div>
        <div>
          <p className="font-sans text-[13px] font-medium text-primary">{name || 'Xem trước'}</p>
          <p className="font-mono text-[10px] text-muted uppercase tracking-wide">{WALLET_TYPE_LABEL[type] ?? type}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={onCancel} className="flex-1">Hủy</Button>
        <Button onClick={handleSubmit} disabled={isPending || !name.trim()} className="flex-1">
          {isPending ? 'Đang lưu...' : initial?.id ? 'Lưu thay đổi' : 'Tạo ví'}
        </Button>
      </div>
    </div>
  )
}

// ── Wallet Card ──────────────────────────────────────────────
function WalletCard({
  wallet,
  onEdit,
}: {
  wallet: Wallet
  onEdit: (w: Wallet) => void
}) {
  const accent = walletAccentColor(wallet)
  const isPostpaid = wallet.type === 'POSTPAID'
  // For POSTPAID: treat negative balance as spent, assume a limit from wallet name or default
  // balance is negative for debts — spend = |balance|, limit not stored on wallet, show utilization as pct of e.g. 10M
  const spent = isPostpaid ? Math.abs(Math.min(0, Number(wallet.balance))) : 0
  // No real limit on wallet model — use a placeholder of 10_000_000 for display
  const limit = 10_000_000
  const utilPct = isPostpaid ? spent / limit : 0

  return (
    <div
      className="relative overflow-hidden rounded-lg border border-border bg-surface group cursor-pointer hover:border-border-hi transition-colors"
      style={{
        backgroundImage: `linear-gradient(135deg, ${accent}12 0%, transparent 55%)`,
      }}
    >
      {/* color stripe top */}
      <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ backgroundColor: accent }} />

      <div className="p-4 flex items-start gap-3">
        <div
          className="w-10 h-10 rounded flex items-center justify-center text-xl shrink-0"
          style={{ backgroundColor: `${accent}22` }}
        >
          {wallet.icon}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-sans text-[13px] font-medium text-primary truncate">{wallet.name}</p>
          <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted mt-0.5">
            {WALLET_TYPE_LABEL[wallet.type] ?? wallet.type}
          </p>

          {isPostpaid && (
            <div className="mt-2 space-y-1">
              <ProgressBar pct={utilPct} height={3} over={utilPct > 0.9} />
              <p className="font-mono text-[10px] text-muted">
                {Math.round(utilPct * 100)}% dư nợ
              </p>
            </div>
          )}
        </div>

        <div className="text-right shrink-0">
          <Amount
            value={Number(wallet.balance)}
            size={16}
            weight={500}
            className={Number(wallet.balance) < 0 ? 'text-negative' : 'text-primary'}
          />
        </div>
      </div>

      <button
        onClick={() => onEdit(wallet)}
        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 font-mono text-[10px] uppercase tracking-[0.08em] px-2 py-1 rounded border border-border-hi text-muted hover:text-primary hover:border-accent/50 transition-all"
        aria-label={`Sửa ví ${wallet.name}`}
      >
        edit
      </button>
    </div>
  )
}

// ── Edit Modal ───────────────────────────────────────────────
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
    <BottomSheet open onClose={onClose} title="Sửa ví">
      <WalletForm
        initial={wallet}
        onSubmit={handleUpdate}
        onCancel={onClose}
        isPending={update.isPending}
      />
      <div className="border-t border-border pt-3 mt-3">
        {showDelete ? (
          <div className="space-y-3">
            <div className="p-3 rounded border border-negative/20 bg-negative/5 space-y-1">
              <p className="font-mono text-[11px] uppercase tracking-widest text-negative">
                Cảnh báo khi xóa ví
              </p>
              <p className="font-mono text-[11px] text-muted">
                Xóa <span className="text-primary">"{wallet.name}"</span> sẽ bỏ liên kết giao dịch.
                Số dư hiện tại:{' '}
                <span className="text-primary">{formatCurrency(Number(wallet.balance))}</span>.
              </p>
            </div>
            <p className="font-mono text-[10px] text-negative text-center uppercase tracking-widest">
              Không thể hoàn tác
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowDelete(false)} className="flex-1">Hủy</Button>
              <Button
                onClick={handleDelete}
                disabled={del.isPending}
                className="flex-1 !bg-negative !text-white"
              >
                {del.isPending ? 'Đang xóa...' : 'Xóa ví'}
              </Button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowDelete(true)}
            className="w-full text-center font-mono text-[10px] uppercase tracking-widest text-negative hover:underline py-1"
          >
            Xóa ví
          </button>
        )}
      </div>
    </BottomSheet>
  )
}

// ── Page ─────────────────────────────────────────────────────
export default function WalletsPage() {
  const navigate = useNavigate()
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
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display italic text-[28px] leading-none text-primary">Ví của tôi</h2>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted mt-1">
            {active.length} tài khoản
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Pill ghost onClick={() => navigate('/wallets/transfer')}>↔ Chuyển</Pill>
          <Pill accent onClick={() => setShowAdd(!showAdd)}>
            {showAdd ? '− Đóng' : '+ New wallet'}
          </Pill>
        </div>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-24 w-full rounded-lg" />)}
        </div>
      )}

      {/* Error */}
      {error && (
        <EmptyState icon="⚠️" title="Không tải được ví" description="Hãy thử lại sau." />
      )}

      {/* Wallet groups */}
      {!isLoading && !error && (
        <div className="space-y-6">
          {(['CASH', 'BANK', 'E_WALLET', 'POSTPAID'] as const).map((t) => {
            const items = byType[t]
            if (!items?.length) return null
            return (
              <div key={t} className="space-y-2">
                <SectionLabel right={`${items.length} accounts`}>
                  {GROUP_LABEL[t]}
                </SectionLabel>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
                <Pill accent onClick={() => setShowAdd(true)}>
                  + Tạo ví
                </Pill>
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
