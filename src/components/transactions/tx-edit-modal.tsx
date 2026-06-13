import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { SegmentedControl } from '@/components/ui/segmented-control'
import { Amount, SectionLabel } from '@/design-system'
import { CategoryGrid } from '@/components/transactions/category-grid'
import { useUpdateTransaction, useDeleteTransaction } from '@/hooks/useTransactions'
import { useWallets } from '@/hooks/useWallets'
import { useCategories } from '@/hooks/useCategories'
import { ymdToInstant, isoToInputDate, todayYmd } from '@/lib/date-utils'
import type { TxnType } from '@/types'

interface EditTarget {
  id: number
  walletId: number
  categoryId: number | null
  amount: number
  type: TxnType
  note: string | null
  date: string
}

interface TxEditModalProps {
  tx: EditTarget
  onClose: () => void
}

/** Inner edit form — state is local; lifted only on submit. */
function EditForm({ tx, onClose }: TxEditModalProps) {
  const { t } = useTranslation()
  const [txType, setTxType] = useState<TxnType>(tx.type)
  const [amount, setAmount] = useState(tx.amount.toString())
  const [walletId, setWalletId] = useState<number | null>(tx.walletId)
  const [categoryId, setCategoryId] = useState<number | null>(tx.categoryId)
  const [note, setNote] = useState(tx.note ?? '')
  const [date, setDate] = useState(isoToInputDate(tx.date) || todayYmd())
  const [showDelete, setShowDelete] = useState(false)

  const { data: wallets } = useWallets()
  const { data: categories } = useCategories()
  const update = useUpdateTransaction()
  const del = useDeleteTransaction()

  const filteredCats = (categories ?? []).filter((c) => c.type === txType)
  const amountNum = parseFloat(amount) || 0

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!walletId || !amount) { toast.error(t('transaction.selectWalletAndAmount')); return }
    update.mutate(
      { id: tx.id, walletId, categoryId: categoryId ?? undefined, amount: parseFloat(amount), type: txType, note: note || undefined, date: ymdToInstant(date) },
      { onSuccess: () => { toast.success(t('transaction.updated')); onClose() }, onError: (e: Error) => toast.error(e.message) },
    )
  }

  const handleDelete = () => {
    del.mutate(tx.id, {
      onSuccess: () => { toast.success(t('transaction.deleted')); onClose() },
      onError: (e: Error) => toast.error(e.message),
    })
  }

  return (
    <form onSubmit={handleUpdate} className="space-y-4 p-1">
      {/* Type segmented */}
      <SegmentedControl
        size="sm"
        ariaLabel={t('transaction.typeFilter')}
        value={txType}
        onChange={(v) => { setTxType(v as TxnType); setCategoryId(null) }}
        options={[
          { value: 'EXPENSE', label: t('transaction.expense') },
          { value: 'INCOME', label: t('transaction.income') },
        ]}
      />

      {/* Amount */}
      <div>
        <SectionLabel className="mb-2">{t('transaction.amountLabel')}</SectionLabel>
        <div className="relative">
          <input
            type="number" inputMode="decimal" value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full h-11 px-3 pr-14 rounded-lg border border-line bg-surface-2 text-ink text-xl tabular-nums outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            placeholder="0"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted">VND</span>
        </div>
        {amountNum > 0 && (
          <div className="mt-1.5">
            <Amount value={txType === 'INCOME' ? amountNum : -amountNum} size={12} className={txType === 'INCOME' ? 'text-positive' : 'text-negative'} />
          </div>
        )}
      </div>

      {/* Wallet */}
      <div>
        <SectionLabel className="mb-2">{t('transaction.wallet')}</SectionLabel>
        <select
          value={walletId ?? ''}
          onChange={(e) => setWalletId(Number(e.target.value) || null)}
          className="w-full h-10 px-3 rounded-lg border border-line bg-surface-2 text-ink text-sm outline-none appearance-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        >
          <option value="">{t('transaction.selectWalletOption')}</option>
          {wallets?.map((w) => <option key={w.id} value={w.id}>{w.icon} {w.name}</option>)}
        </select>
      </div>

      {/* Category grid */}
      {filteredCats.length > 0 && (
        <div>
          <SectionLabel className="mb-2">{t('transaction.category')}</SectionLabel>
          <CategoryGrid
            categories={filteredCats}
            selectedId={categoryId}
            onSelect={setCategoryId}
            ariaLabel={t('transaction.category')}
          />
        </div>
      )}

      {/* Note + Date */}
      <Input label={t('transaction.merchantNote')} value={note} onChange={(e) => setNote(e.target.value)} placeholder={t('transaction.notePlaceholderExpense')} />
      <div>
        <SectionLabel className="mb-2">{t('transaction.date')}</SectionLabel>
        <input
          type="date" value={date} onChange={(e) => setDate(e.target.value)}
          className="w-full h-10 px-3 rounded-lg border border-line bg-surface-2 text-ink text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Save / Cancel */}
      <div className="flex gap-2 pt-1">
        <Button variant="outline" type="button" onClick={onClose} className="flex-1">{t('common.cancel')}</Button>
        <Button type="submit" disabled={update.isPending || !walletId || !amount} className="flex-1">
          {update.isPending ? t('common.saving') : t('common.save')}
        </Button>
      </div>

      {/* Delete zone */}
      <div className="border-t border-line pt-4">
        {showDelete ? (
          <div className="space-y-3">
            <p className="text-[11px] text-negative text-center uppercase tracking-[0.08em]">{t('transaction.deleteTransactionConfirm')}</p>
            <div className="flex gap-2">
              <Button variant="outline" type="button" onClick={() => setShowDelete(false)} className="flex-1">{t('common.cancel')}</Button>
              <Button type="button" onClick={handleDelete} disabled={del.isPending} className="flex-1 !bg-negative !text-white">
                {del.isPending ? t('common.deleting') : t('common.delete')}
              </Button>
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => setShowDelete(true)} className="w-full text-center text-[11px] uppercase tracking-[0.08em] text-negative hover:underline py-1">
            {t('transaction.deleteTransaction')}
          </button>
        )}
      </div>
    </form>
  )
}

/** BottomSheet wrapper for the edit form. */
export function TxEditModal({ tx, onClose }: TxEditModalProps) {
  const { t } = useTranslation()
  return (
    <BottomSheet open onClose={onClose} title={t('transaction.editTransaction')}>
      <EditForm tx={tx} onClose={onClose} />
    </BottomSheet>
  )
}
