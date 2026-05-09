import { useState } from 'react'
import type { NlpParseResult, CreateTransactionRequest, TxnType } from '@/types'

interface NlpConfirmationCardProps {
  result: NlpParseResult
  wallets: { id: number; name: string; icon: string; color: string }[]
  categories: { id: number; name: string; icon: string; type: string }[]
  onConfirm: (req: CreateTransactionRequest) => void
  onEdit: (prefill: Partial<CreateTransactionRequest>) => void
  onDismiss: () => void
}

export function NlpConfirmationCard({
  result,
  wallets,
  categories,
  onConfirm,
  onEdit,
  onDismiss,
}: NlpConfirmationCardProps) {
  const [walletId, setWalletId] = useState<number | null>(result.walletId ?? null)
  const [categoryId, setCategoryId] = useState<number | null>(result.categoryId ?? null)
  const [amount, setAmount] = useState<string>(result.amount != null ? String(result.amount) : '')
  const [type, setType] = useState<TxnType>(result.type)
  const [date, setDate] = useState<string>(result.date ?? new Date().toISOString().split('T')[0])
  const [note, setNote] = useState<string>(result.note ?? '')

  const isUnresolved = (field: string) => result.unresolvedFields.includes(field)

  function handleConfirm() {
    if (!walletId || !amount) return
    const req: CreateTransactionRequest = {
      walletId,
      categoryId: categoryId ?? undefined,
      amount: parseFloat(amount),
      type,
      date,
      note: note || undefined,
    }
    onConfirm(req)
  }

  function handleEdit() {
    onEdit({
      walletId: walletId ?? undefined,
      categoryId: categoryId ?? undefined,
      amount: amount ? parseFloat(amount) : undefined,
      type,
      date,
      note: note || undefined,
    })
  }

  const fieldClass = (field: string) =>
    `input text-sm w-full ${isUnresolved(field) ? 'border-warning ring-1 ring-warning/30' : ''}`

  const filteredCategories = categories.filter((c) => c.type === type)

  return (
    <div className="card p-4 space-y-3 border-accent/50 ring-1 ring-accent/20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-primary">Xác nhận giao dịch</p>
          <p className="text-xs text-muted">
            Độ chính xác: {Math.round(result.confidence * 100)}%
            {result.unresolvedFields.length > 0 && (
              <span className="text-warning ml-1">
                · Cần bổ sung: {result.unresolvedFields.join(', ')}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={onDismiss}
          aria-label="Đóng xác nhận"
          className="btn-ghost text-muted text-sm px-2"
        >
          ✕
        </button>
      </div>

      {/* Type toggle */}
      <div className="flex gap-1 bg-surface-2 rounded-md p-1">
        {(['EXPENSE', 'INCOME'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`flex-1 py-1.5 text-xs rounded-sm transition-all ${
              type === t
                ? t === 'EXPENSE'
                  ? 'bg-negative text-white font-medium'
                  : 'bg-positive text-white font-medium'
                : 'text-muted hover:text-primary'
            }`}
          >
            {t === 'EXPENSE' ? '💸 Chi' : '📥 Thu'}
          </button>
        ))}
      </div>

      {/* Amount */}
      <div>
        <label className="block text-xs font-medium text-secondary mb-1">
          Số tiền {isUnresolved('amount') && <span className="text-warning">(chưa rõ)</span>}
        </label>
        <input
          type="number"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className={fieldClass('amount')}
          placeholder="0"
        />
      </div>

      {/* Wallet */}
      <div>
        <label className="block text-xs font-medium text-secondary mb-1">
          Ví {isUnresolved('walletId') && <span className="text-warning">(chưa rõ)</span>}
        </label>
        <select
          value={walletId ?? ''}
          onChange={(e) => setWalletId(e.target.value ? Number(e.target.value) : null)}
          className={fieldClass('walletId')}
        >
          <option value="">-- Chọn ví --</option>
          {wallets.map((w) => (
            <option key={w.id} value={w.id}>
              {w.icon} {w.name}
            </option>
          ))}
        </select>
      </div>

      {/* Category */}
      <div>
        <label className="block text-xs font-medium text-secondary mb-1">
          Danh mục {isUnresolved('categoryId') && <span className="text-warning">(chưa rõ)</span>}
        </label>
        <select
          value={categoryId ?? ''}
          onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : null)}
          className={fieldClass('categoryId')}
        >
          <option value="">-- Không có danh mục --</option>
          {filteredCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.icon} {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Date */}
      <div>
        <label className="block text-xs font-medium text-secondary mb-1">Ngày</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="input text-sm w-full"
        />
      </div>

      {/* Note */}
      <div>
        <label className="block text-xs font-medium text-secondary mb-1">Ghi chú</label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Không có ghi chú"
          className="input text-sm w-full"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={handleConfirm}
          disabled={!walletId || !amount}
          className="flex-1 btn-primary py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ✓ Xác nhận
        </button>
        <button
          onClick={handleEdit}
          className="flex-1 btn-ghost py-2 text-sm border border-border"
        >
          ✏️ Chỉnh sửa
        </button>
      </div>
    </div>
  )
}
