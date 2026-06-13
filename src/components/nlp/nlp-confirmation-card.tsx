import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Check, Pencil } from 'lucide-react'
import { Amount } from '@/design-system'
import { ymdToInstant } from '@/lib/date-utils'
import type { NlpParseResult, CreateTransactionRequest, TxnType } from '@/types'

interface NlpConfirmationCardProps {
  result: NlpParseResult
  wallets: { id: number; name: string; icon: string; color: string }[]
  categories: { id: number; name: string; icon: string; type: string }[]
  onConfirm: (req: CreateTransactionRequest) => void
  onEdit: (prefill: Partial<CreateTransactionRequest>) => void
  onDismiss: () => void
}

/**
 * NLP parsed-draft confirmation card (Minh design).
 * Shows parsed fields as editable chips with warning highlight for unresolved fields.
 * Compact: type toggle, amount, wallet, category, date, note, action buttons.
 */
export function NlpConfirmationCard({
  result,
  wallets,
  categories,
  onConfirm,
  onEdit,
  onDismiss,
}: NlpConfirmationCardProps) {
  const { t } = useTranslation()
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
      date: ymdToInstant(date),
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

  const filteredCategories = categories.filter((c) => c.type === type)

  const inputCls = (field: string) =>
    `w-full h-9 px-3 rounded-lg border bg-surface-2 text-ink text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20 ${
      isUnresolved(field)
        ? 'border-warning ring-1 ring-warning/20'
        : 'border-line'
    }`

  const amountNum = parseFloat(amount) || 0

  return (
    <div className="bg-surface border border-primary/30 rounded-xl p-4 space-y-3 shadow-pop">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-ink">{t('nlp.confirmTitle')}</p>
          <p className="text-[11px] text-muted mt-0.5">
            {t('nlp.accuracy', { pct: Math.round(result.confidence * 100) })}
            {result.unresolvedFields.length > 0 && (
              <span className="text-warning ml-1">
                · {t('nlp.needMore', { fields: result.unresolvedFields.join(', ') })}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={onDismiss}
          aria-label={t('nlp.closeAria')}
          className="w-7 h-7 flex items-center justify-center rounded-lg border border-line text-muted hover:bg-hover transition-colors shrink-0"
        >
          <X size={13} />
        </button>
      </div>

      {/* Type toggle */}
      <div className="flex gap-1 bg-surface-2 rounded-lg p-1 border border-line">
        {(['EXPENSE', 'INCOME'] as const).map((tt) => (
          <button
            key={tt}
            type="button"
            onClick={() => setType(tt)}
            className={`flex-1 h-7 rounded-md text-[11px] font-semibold uppercase tracking-[0.06em] transition-colors ${
              type === tt
                ? tt === 'EXPENSE'
                  ? 'bg-negative/10 text-negative'
                  : 'bg-positive/10 text-positive'
                : 'text-muted hover:text-ink'
            }`}
          >
            {tt === 'EXPENSE' ? t('nlp.expense') : t('nlp.income')}
          </button>
        ))}
      </div>

      {/* Amount — read-only display + edit field */}
      <div>
        <label className="block text-[10px] font-extrabold uppercase tracking-[0.07em] text-muted mb-1.5">
          {t('nlp.amount')}
          {isUnresolved('amount') && (
            <span className="text-warning ml-1 normal-case tracking-normal font-semibold">
              {t('nlp.unresolved')}
            </span>
          )}
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={inputCls('amount')}
            placeholder="0"
          />
          {amountNum > 0 && (
            <Amount
              value={type === 'INCOME' ? amountNum : -amountNum}
              size={13}
              weight={600}
              className={`shrink-0 ${type === 'INCOME' ? 'text-positive' : 'text-negative'}`}
            />
          )}
        </div>
      </div>

      {/* Wallet */}
      <div>
        <label className="block text-[10px] font-extrabold uppercase tracking-[0.07em] text-muted mb-1.5">
          {t('nlp.wallet')}
          {isUnresolved('walletId') && (
            <span className="text-warning ml-1 normal-case tracking-normal font-semibold">
              {t('nlp.unresolved')}
            </span>
          )}
        </label>
        <select
          value={walletId ?? ''}
          onChange={(e) => setWalletId(e.target.value ? Number(e.target.value) : null)}
          className={inputCls('walletId') + ' appearance-none'}
        >
          <option value="">{t('nlp.selectWallet')}</option>
          {wallets.map((w) => (
            <option key={w.id} value={w.id}>
              {w.icon} {w.name}
            </option>
          ))}
        </select>
      </div>

      {/* Category */}
      <div>
        <label className="block text-[10px] font-extrabold uppercase tracking-[0.07em] text-muted mb-1.5">
          {t('nlp.category')}
          {isUnresolved('categoryId') && (
            <span className="text-warning ml-1 normal-case tracking-normal font-semibold">
              {t('nlp.unresolved')}
            </span>
          )}
        </label>
        <select
          value={categoryId ?? ''}
          onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : null)}
          className={inputCls('categoryId') + ' appearance-none'}
        >
          <option value="">{t('nlp.noCategory')}</option>
          {filteredCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.icon} {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Date + Note — two columns */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-extrabold uppercase tracking-[0.07em] text-muted mb-1.5">
            {t('nlp.date')}
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={inputCls('date')}
          />
        </div>
        <div>
          <label className="block text-[10px] font-extrabold uppercase tracking-[0.07em] text-muted mb-1.5">
            {t('nlp.note')}
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t('nlp.notePlaceholder')}
            className={inputCls('note')}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={handleConfirm}
          disabled={!walletId || !amount}
          className="flex-1 h-10 flex items-center justify-center gap-1.5 rounded-lg bg-primary text-primary-ink text-[12px] font-semibold hover:bg-primary-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-button"
        >
          <Check size={13} aria-hidden="true" />
          {t('nlp.confirm')}
        </button>
        <button
          onClick={handleEdit}
          className="flex-1 h-10 flex items-center justify-center gap-1.5 rounded-lg border border-line bg-surface text-sub text-[12px] font-semibold hover:bg-hover transition-colors"
        >
          <Pencil size={12} aria-hidden="true" />
          {t('nlp.edit')}
        </button>
      </div>
    </div>
  )
}
