import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useWallets } from '@/hooks/useWallets'
import { useTransfer } from '@/hooks/useTransfer'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { formatCurrency, WALLET_TYPE_LABEL } from '@/lib/utils'

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

  const handleSubmit = () => {
    if (!fromId || !toId) { toast.error('Chọn ví nguồn và ví đích'); return }
    if (sameWallet) { toast.error('Ví nguồn và ví đích không được trùng nhau'); return }
    if (!amount || parseFloat(amount) <= 0) { toast.error('Nhập số tiền hợp lệ'); return }
    if (fromWallet && parseFloat(amount) > fromWallet.balance) {
      toast.error('Số tiền vượt quá số dư khả dụng')
      return
    }

    transfer.mutate(
      { fromWalletId: fromId, toWalletId: toId, amount: parseFloat(amount), note: note || undefined },
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
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-primary dark:text-dark-primary">Chuyển tiền</h2>
          <p className="text-xs text-muted dark:text-dark-muted">Di chuyển giữa các ví của bạn</p>
        </div>
        <button onClick={() => navigate(-1)} className="btn-ghost text-sm px-2 dark:text-dark-secondary">←</button>
      </div>

      {/* From wallet */}
      <div>
        <label className="block text-xs font-medium text-secondary dark:text-dark-secondary mb-2">
          Từ ví
        </label>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => <div key={i} className="card p-3 h-16 animate-pulse" />)}
          </div>
        ) : (
          <div className="space-y-2">
            {activeWallets.map((w) => (
              <button
                key={w.id}
                onClick={() => { setFromId(w.id); if (toId === w.id) setToId(null) }}
                aria-pressed={fromId === w.id}
                aria-label={`Chọn ví nguồn ${w.name}`}
                className={`card p-3 w-full text-left transition-all flex items-center gap-3 ${
                  fromId === w.id ? 'border-accent dark:border-dark-accent ring-2 ring-accent/20 dark:ring-dark-accent/20' : 'hover:border-accent/50 dark:hover:border-dark-accent/50'
                }`}
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg" style={{ backgroundColor: `${w.color}20` }}>
                  {w.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-primary dark:text-dark-primary truncate">{w.name}</p>
                  <p className="text-xs text-muted dark:text-dark-muted">{WALLET_TYPE_LABEL[w.type]}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold font-mono text-primary dark:text-dark-primary tabular-nums">
                    {formatCurrency(Number(w.balance))}₫
                  </p>
                </div>
                {fromId === w.id && (
                  <span className="w-5 h-5 bg-accent dark:bg-dark-accent rounded-full flex items-center justify-center shrink-0">
                    <span className="text-white text-xs">✓</span>
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Arrow */}
      <div className="flex justify-center">
        <div className="w-8 h-8 rounded-full bg-surface-2 dark:bg-dark-surface-2 flex items-center justify-center text-muted dark:text-dark-muted">
          ↓
        </div>
      </div>

      {/* To wallet */}
      <div>
        <label className="block text-xs font-medium text-secondary dark:text-dark-secondary mb-2">
          Đến ví
        </label>
        <div className="space-y-2">
          {activeWallets.filter((w) => w.id !== fromId).map((w) => (
            <button
              key={w.id}
              onClick={() => setToId(w.id)}
              aria-pressed={toId === w.id}
              aria-label={`Chọn ví đích ${w.name}`}
              className={`card p-3 w-full text-left transition-all flex items-center gap-3 ${
                toId === w.id ? 'border-accent dark:border-dark-accent ring-2 ring-accent/20 dark:ring-dark-accent/20' : 'hover:border-accent/50 dark:hover:border-dark-accent/50'
              }`}
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg" style={{ backgroundColor: `${w.color}20` }}>
                {w.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-primary dark:text-dark-primary truncate">{w.name}</p>
                <p className="text-xs text-muted dark:text-dark-muted">{WALLET_TYPE_LABEL[w.type]}</p>
              </div>
              {toId === w.id && (
                <span className="w-5 h-5 bg-accent dark:bg-dark-accent rounded-full flex items-center justify-center shrink-0">
                  <span className="text-white text-xs">✓</span>
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Amount */}
      <div>
        <label className="block text-xs font-medium text-secondary dark:text-dark-secondary mb-1.5">
          Số tiền (VND)
        </label>
        <div className="relative">
          <input
            type="number"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="input text-xl font-bold font-mono pr-12 py-3"
            placeholder="0"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted dark:text-dark-muted">₫</span>
        </div>
        {amount && (
          <p className="text-xs text-muted dark:text-dark-muted mt-1">
            = {formatCurrency(parseFloat(amount) || 0)}
          </p>
        )}
        {fromWallet && amount && parseFloat(amount) > fromWallet.balance && (
          <p className="text-xs text-negative dark:text-dark-negative mt-1 font-medium">
            ⚠️ Số tiền vượt quá số dư ({formatCurrency(Number(fromWallet.balance))}₫)
          </p>
        )}
        {fromWallet && amount && parseFloat(amount) === fromWallet.balance && (
          <p className="text-xs text-muted dark:text-dark-muted mt-1">
            💡 Chuyển toàn bộ số dư — ví nguồn sẽ về 0₫
          </p>
        )}
      </div>

      {/* Note */}
      <Input
        label="Ghi chú (tùy chọn)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="VD: Chuyển tiền tiêu tháng"
      />

      {/* Preview */}
      {fromWallet && toWallet && amount && parseFloat(amount) > 0 && (
        <Card className="p-4 space-y-2">
          <p className="text-xs font-medium text-muted dark:text-dark-muted uppercase tracking-wide">Xem trước</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 text-center">
              <p className="text-xs text-muted dark:text-dark-muted">Nguồn</p>
              <p className="text-sm font-semibold text-primary dark:text-dark-primary truncate">{fromWallet.name}</p>
              <p className="text-sm font-mono text-negative dark:text-dark-negative tabular-nums">
                -{formatCurrency(parseFloat(amount))}₫
              </p>
            </div>
            <span className="text-muted dark:text-dark-muted">→</span>
            <div className="flex-1 text-center">
              <p className="text-xs text-muted dark:text-dark-muted">Đích</p>
              <p className="text-sm font-semibold text-primary dark:text-dark-primary truncate">{toWallet.name}</p>
              <p className="text-sm font-mono text-positive dark:text-dark-positive tabular-nums">
                +{formatCurrency(parseFloat(amount))}₫
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Submit */}
      <Button
        onClick={handleSubmit}
        disabled={transfer.isPending || !fromId || !toId || !amount || sameWallet || parseFloat(amount) <= 0}
        className="w-full py-3"
      >
        {transfer.isPending ? 'Đang chuyển...' : '✓ Chuyển tiền'}
      </Button>
    </div>
  )
}
