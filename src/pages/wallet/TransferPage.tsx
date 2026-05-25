import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useWallets } from '@/hooks/useWallets'
import { useTransfer } from '@/hooks/useTransfer'
import { Input } from '@/components/ui/Input'
import { Amount, SectionLabel, Pill } from '@/design-system'
import { WALLET_TYPE_LABEL } from '@/lib/utils'
import type { Wallet } from '@/types'

// ── Wallet selector row ──────────────────────────────────────
function WalletRow({
  wallet,
  selected,
  onSelect,
  role,
}: {
  wallet: Wallet
  selected: boolean
  onSelect: () => void
  role: 'from' | 'to'
}) {
  const accent = wallet.color ?? '#64748B'
  return (
    <button
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={`Chọn ví ${role === 'from' ? 'nguồn' : 'đích'} ${wallet.name}`}
      className={`w-full text-left rounded-lg border transition-all flex items-center gap-3 px-3 py-2.5 group ${
        selected
          ? 'border-accent bg-surface-2 ring-1 ring-accent/20'
          : 'border-border bg-surface hover:border-border-hi hover:bg-surface-2'
      }`}
    >
      <div
        className="w-9 h-9 rounded flex items-center justify-center text-lg shrink-0"
        style={{ backgroundColor: `${accent}22` }}
      >
        {wallet.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-sans text-[13px] font-medium text-primary truncate">{wallet.name}</p>
        <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted">
          {WALLET_TYPE_LABEL[wallet.type] ?? wallet.type}
        </p>
      </div>
      <div className="text-right shrink-0">
        <Amount value={Number(wallet.balance)} size={13} weight={500} />
      </div>
      {selected && (
        <span
          className="w-5 h-5 rounded-full bg-accent flex items-center justify-center shrink-0 font-mono text-[10px] text-accent-ink"
          aria-hidden="true"
        >
          ✓
        </span>
      )}
    </button>
  )
}

// ── Page ─────────────────────────────────────────────────────
export default function TransferPage() {
  const navigate = useNavigate()
  const { data: wallets, isLoading } = useWallets()
  const transfer = useTransfer()

  const [fromId, setFromId] = useState<number | null>(null)
  const [toId, setToId] = useState<number | null>(null)
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')

  const fromWallet = wallets?.find((w) => w.id === fromId)
  const toWallet = wallets?.find((w) => w.id === toId)
  const sameWallet = fromId && toId && fromId === toId
  const parsedAmount = parseFloat(amount) || 0
  const overBalance = fromWallet ? parsedAmount > Number(fromWallet.balance) : false
  const canSubmit = !transfer.isPending && fromId && toId && !sameWallet && parsedAmount > 0 && !overBalance

  const handleSubmit = () => {
    if (!fromId || !toId) { toast.error('Chọn ví nguồn và ví đích'); return }
    if (sameWallet) { toast.error('Ví nguồn và ví đích không được trùng nhau'); return }
    if (!amount || parsedAmount <= 0) { toast.error('Nhập số tiền hợp lệ'); return }
    if (fromWallet && parsedAmount > Number(fromWallet.balance)) {
      toast.error('Số tiền vượt quá số dư khả dụng')
      return
    }

    transfer.mutate(
      { fromWalletId: fromId, toWalletId: toId, amount: parsedAmount, note: note || undefined },
      {
        onSuccess: () => {
          toast.success('Đã chuyển tiền!')
          navigate('/wallets')
        },
        onError: (err: Error) => toast.error(err.message),
      }
    )
  }

  const activeWallets = wallets?.filter((w) => w.isActive) ?? []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display italic text-[28px] leading-none text-primary">Chuyển tiền</h2>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted mt-1">
            Di chuyển giữa các ví
          </p>
        </div>
        <Pill ghost onClick={() => navigate(-1)}>← Back</Pill>
      </div>

      {/* From wallet */}
      <div className="space-y-2">
        <SectionLabel>Từ ví</SectionLabel>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-14 rounded-lg bg-surface-2 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {activeWallets.map((w) => (
              <WalletRow
                key={w.id}
                wallet={w}
                selected={fromId === w.id}
                role="from"
                onSelect={() => {
                  setFromId(w.id)
                  if (toId === w.id) setToId(null)
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Arrow divider */}
      <div className="flex justify-center">
        <div className="w-8 h-8 rounded-full border border-border-hi bg-surface-2 flex items-center justify-center font-mono text-[14px] text-muted">
          ↓
        </div>
      </div>

      {/* To wallet */}
      <div className="space-y-2">
        <SectionLabel>Đến ví</SectionLabel>
        <div className="space-y-2">
          {activeWallets.filter((w) => w.id !== fromId).map((w) => (
            <WalletRow
              key={w.id}
              wallet={w}
              selected={toId === w.id}
              role="to"
              onSelect={() => setToId(w.id)}
            />
          ))}
          {activeWallets.filter((w) => w.id !== fromId).length === 0 && fromId && (
            <p className="font-mono text-[11px] text-muted text-center py-4">
              Không còn ví khả dụng
            </p>
          )}
        </div>
      </div>

      {/* Amount — editorial big serif italic input */}
      <div className="space-y-2">
        <SectionLabel>Số tiền</SectionLabel>
        <div className="relative bg-surface border border-border rounded-lg overflow-hidden focus-within:border-accent/60 focus-within:ring-1 focus-within:ring-accent/20 transition-all">
          <input
            type="number"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-transparent px-4 pt-4 pb-3 font-display italic text-[40px] leading-none text-primary outline-none pr-16 placeholder:text-muted/40"
            placeholder="0"
            aria-label="Số tiền chuyển"
          />
          <span className="absolute right-4 bottom-4 font-mono text-[11px] uppercase tracking-widest text-muted">
            VND
          </span>
        </div>

        {/* Amount feedback lines */}
        {overBalance && (
          <p className="font-mono text-[11px] text-negative flex items-center gap-1.5">
            <span aria-hidden="true">▲</span>
            Vượt số dư —{' '}
            {fromWallet && (
              <Amount value={Number(fromWallet.balance)} size={11} className="text-negative" />
            )}
            {' '}khả dụng
          </p>
        )}
        {fromWallet && parsedAmount > 0 && parsedAmount === Number(fromWallet.balance) && (
          <p className="font-mono text-[11px] text-muted">
            ◇ Chuyển toàn bộ — ví nguồn về 0₫
          </p>
        )}
      </div>

      {/* Note */}
      <div className="space-y-2">
        <SectionLabel>Ghi chú</SectionLabel>
        <Input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="VD: Chuyển tiền tiêu tháng"
        />
      </div>

      {/* Preview panel */}
      {fromWallet && toWallet && parsedAmount > 0 && (
        <div className="rounded-lg border border-border-hi bg-surface-2 p-4 space-y-3">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted">Xem trước</p>
          <div className="flex items-center gap-4">
            {/* From */}
            <div className="flex-1 min-w-0 space-y-0.5">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted">Nguồn</p>
              <p className="font-sans text-[13px] font-medium text-primary truncate">{fromWallet.name}</p>
              <Amount value={-parsedAmount} size={13} sign className="text-negative" />
            </div>
            {/* Arrow */}
            <span className="font-mono text-[18px] text-muted shrink-0">→</span>
            {/* To */}
            <div className="flex-1 min-w-0 text-right space-y-0.5">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted">Đích</p>
              <p className="font-sans text-[13px] font-medium text-primary truncate">{toWallet.name}</p>
              <Amount value={parsedAmount} size={13} sign className="text-positive" />
            </div>
          </div>
        </div>
      )}

      {/* Submit */}
      <Pill
        accent
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="w-full justify-center h-11 text-[13px] rounded-lg"
      >
        {transfer.isPending ? 'Đang chuyển...' : '✓ Xác nhận chuyển tiền'}
      </Pill>
    </div>
  )
}
