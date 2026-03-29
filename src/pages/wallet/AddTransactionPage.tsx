import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { useWallets, useCreateWallet } from '@/hooks/useWallets'
import { useCategories } from '@/hooks/useCategories'
import { useCreateTransaction } from '@/hooks/useTransactions'
import { formatCurrency } from '@/lib/utils'
import { WALLET_TYPE_LABEL } from '@/lib/utils'
import type { TxnType, CreateTransactionRequest } from '@/types'

// Helper: today's date + N days as YYYY-MM-DD
function addDays(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

export default function AddTransactionPage() {
  const navigate = useNavigate()
  const [txType, setTxType] = useState<TxnType>('EXPENSE')
  const [amount, setAmount] = useState('')
  const [walletId, setWalletId] = useState<number | null>(null)
  const [categoryId, setCategoryId] = useState<number | null>(null)
  const [note, setNote] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)

  // BNPL debt creation fields
  const [createDebt, setCreateDebt] = useState(false)
  const [debtTitle, setDebtTitle] = useState('')
  const [debtDueDate, setDebtDueDate] = useState(addDays(30))
  const [debtCounterparty, setDebtCounterparty] = useState('')

  const { data: wallets, isLoading: loadingWallets } = useWallets()
  const { data: categories } = useCategories()
  const createTx = useCreateTransaction()

  const filteredCategories = categories?.filter((c) => c.type === txType) ?? []

  // Selected wallet info
  const selectedWallet = wallets?.find((w) => w.id === walletId)
  const isPostpaid = selectedWallet?.type === 'POSTPAID'
  const isExpenseOnPostpaid = txType === 'EXPENSE' && isPostpaid

  // When category is selected and wallet is POSTPAID, pre-fill debt title
  const selectedCategory = categories?.find((c) => c.id === categoryId)
  if (isExpenseOnPostpaid && selectedCategory && !debtTitle) {
    setDebtTitle(`Mua hàng: ${selectedCategory.name}`)
  }

  const handleSubmit = () => {
    if (!walletId || !amount) {
      toast.error('Chọn ví và nhập số tiền')
      return
    }

    const payload: CreateTransactionRequest = {
      walletId,
      amount: parseFloat(amount),
      type: txType,
      categoryId: categoryId ?? undefined,
      note: note || undefined,
    }

    // If expense on POSTPAID wallet and user opted to create BNPL debt
    if (isExpenseOnPostpaid && createDebt) {
      payload.groupTitle = debtTitle || `Mua trả sau ${new Date().toLocaleDateString('vi-VN')}`
      payload.groupDueDate = debtDueDate || undefined
      payload.groupCounterparty = debtCounterparty || undefined
    }

    createTx.mutate(payload, {
      onSuccess: (res) => {
        toast.success('Đã thêm giao dịch!')
        if (res.group) {
          toast.info('Đã tạo nhóm nợ trả sau — vào mục Nhóm nợ để thanh toán khi đến hạn.')
        }
        navigate('/')
      },
      onError: (err: Error) => toast.error(err.message),
    })
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-primary">Thêm giao dịch</h2>
          <p className="text-xs text-muted">Nhanh — số tiền + ví</p>
        </div>
        <button onClick={() => navigate(-1)} className="btn-ghost text-sm px-2">←</button>
      </div>

      {/* Type toggle */}
      <div className="flex gap-1 bg-surface-2 rounded-md p-1">
        {(['EXPENSE', 'INCOME'] as const).map((t) => (
          <button
            key={t}
            onClick={() => {
              setTxType(t)
              // Reset debt creation when switching away from expense
              if (t !== 'EXPENSE') setCreateDebt(false)
            }}
            className={`flex-1 py-2 text-sm rounded-sm transition-all ${
              txType === t
                ? t === 'EXPENSE'
                  ? 'bg-negative text-white shadow-sm font-medium'
                  : 'bg-positive text-white shadow-sm font-medium'
                : 'text-muted hover:text-primary'
            }`}
          >
            {t === 'EXPENSE' ? '💸 Chi' : '📥 Thu'}
          </button>
        ))}
      </div>

      {/* Amount */}
      <div>
        <label className="block text-xs font-medium text-secondary mb-1.5">Số tiền (VND)</label>
        <div className="relative">
          <input
            type="number"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="input text-xl font-bold font-mono pr-12 py-3"
            placeholder="0"
            autoFocus
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted">₫</span>
        </div>
        {amount && (
          <p className="text-2xs text-muted mt-1">
            = {formatCurrency(parseFloat(amount) || 0)}
          </p>
        )}
      </div>

      {/* Wallet */}
      <div>
        <label className="block text-xs font-medium text-secondary mb-2">Chọn ví</label>
        {loadingWallets ? (
          <div className="grid grid-cols-2 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="card p-3 animate-pulse">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-surface-2" />
                  <div className="space-y-1">
                    <div className="h-3 w-16 bg-surface-2 rounded" />
                    <div className="h-2 w-10 bg-surface-2 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : wallets && wallets.length > 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {wallets.map((w) => (
              <button
                key={w.id}
                onClick={() => setWalletId(w.id)}
                className={`card p-3 text-left transition-all ${
                  walletId === w.id
                    ? 'border-accent ring-2 ring-accent/20'
                    : 'hover:border-accent/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-lg"
                    style={{ backgroundColor: `${w.color}20` }}
                  >
                    {w.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-primary truncate">{w.name}</p>
                    <p className="text-2xs text-muted">{WALLET_TYPE_LABEL[w.type] ?? w.type}</p>
                  </div>
                </div>
                {walletId === w.id && (
                  <div className="absolute top-2 right-2 w-4 h-4 bg-accent rounded-full flex items-center justify-center">
                    <span className="text-white text-2xs">✓</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        ) : (
          <Card className="p-4 text-center">
            <p className="text-sm text-muted">Chưa có ví nào.</p>
            <a href="/wallets" className="text-xs text-accent hover:underline mt-1 block">
              Tạo ví mới →
            </a>
          </Card>
        )}
      </div>

      {/* Advanced toggle */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="text-xs text-accent hover:underline"
      >
        {showAdvanced ? '▲ Thu gọn' : '▼ Thêm chi tiết'}
      </button>

      {showAdvanced && (
        <div className="space-y-4 border-t border-border pt-4">
          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-secondary mb-2">Danh mục</label>
            <div className="flex flex-wrap gap-2">
              {filteredCategories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCategoryId(categoryId === c.id ? null : c.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all ${
                    categoryId === c.id ? 'ring-2 ring-primary/40' : 'hover:opacity-80'
                  }`}
                  style={{
                    backgroundColor: `${c.color}20`,
                    border: `1.5px solid ${c.color}`,
                    color: c.color,
                  }}
                >
                  <span>{c.icon}</span>
                  <span>{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Note */}
          <Input
            label="Ghi chú"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="VD: Ăn trưa công ty"
          />

          {/* BNPL Debt toggle — shown only for EXPENSE on POSTPAID wallet */}
          {isExpenseOnPostpaid && (
            <div className="border border-negative/30 bg-negative/5 rounded-md p-3 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-negative">🛒 Ghi nhận nợ trả sau</p>
                  <p className="text-2xs text-muted mt-0.5">
                    Tạo nhóm nợ BNPL để theo dõi và thanh toán sau
                  </p>
                </div>
                <button
                  onClick={() => setCreateDebt(!createDebt)}
                  className={`w-10 h-6 rounded-full transition-all relative shrink-0 ${
                    createDebt ? 'bg-negative' : 'bg-border'
                  }`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${
                    createDebt ? 'right-1' : 'left-1'
                  }`} />
                </button>
              </div>

              {createDebt && (
                <div className="space-y-2">
                  <Input
                    label="Tên khoản nợ"
                    value={debtTitle}
                    onChange={(e) => setDebtTitle(e.target.value)}
                    placeholder="VD: Mua trả sau tháng 3"
                  />
                  <Input
                    label="Ngày hết hạn"
                    type="date"
                    value={debtDueDate}
                    onChange={(e) => setDebtDueDate(e.target.value)}
                    hint="Mặc định: 30 ngày sau"
                  />
                  <Input
                    label="Đơn vị / người bán (tùy chọn)"
                    value={debtCounterparty}
                    onChange={(e) => setDebtCounterparty(e.target.value)}
                    placeholder="VD: Shopee, MoMo, Lazada..."
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* BNPL notice when wallet is POSTPAID but not creating debt */}
      {isExpenseOnPostpaid && !createDebt && (
        <div className="flex items-start gap-2 p-3 border border-border rounded-md bg-surface-2">
          <span className="text-negative text-sm">⚠️</span>
          <p className="text-xs text-muted">
            Ví trả sau. Nếu muốn theo dõi khoản nợ để thanh toán sau, bấm{' '}
            <button onClick={() => setShowAdvanced(true)} className="text-accent hover:underline">
              Thêm chi tiết
            </button>{' '}
            và bật <strong className="text-primary">"Ghi nhận nợ trả sau"</strong>.
          </p>
        </div>
      )}

      {/* Submit */}
      <Button
        onClick={handleSubmit}
        disabled={createTx.isPending || !walletId || !amount}
        className="w-full py-3 text-base"
      >
        {createTx.isPending ? 'Đang lưu...' : '✓ Lưu giao dịch'}
      </Button>
    </div>
  )
}
