import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useCreateRecurring, useUpdateRecurring } from '@/hooks/useRecurring'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { SegmentedControl } from '@/components/ui/segmented-control'
import { SectionLabel } from '@/design-system'
import type { RecurringFrequency, RecurringRule, Wallet, Category, TxnType } from '@/types'

const FREQ_OPTIONS: RecurringFrequency[] = ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']

// Form payload shared between create and update. `type` is a TxnType.
export interface RecurringFormData {
  walletId: number
  categoryId: number
  amount: number
  type: TxnType
  frequency: RecurringFrequency
  startDate: string
  endDate?: string
  note?: string
}

export function RecurringForm({
  editRule,
  wallets,
  categories,
  onClose,
  onSubmit,
}: {
  editRule?: RecurringRule
  wallets: Wallet[]
  categories: Category[]
  onClose: () => void
  onSubmit: (data: RecurringFormData) => void
}) {
  const { t } = useTranslation()
  const create = useCreateRecurring()
  const update = useUpdateRecurring()
  const isEditing = !!editRule

  const today = new Date().toISOString().split('T')[0]

  const [walletId, setWalletId] = useState<number>(editRule?.walletId ?? 0)
  const [categoryId, setCategoryId] = useState<number>(editRule?.categoryId ?? 0)
  const [amount, setAmount] = useState(editRule?.amount?.toString() ?? '')
  const [type, setType] = useState<TxnType>(editRule?.type ?? 'EXPENSE')
  const [frequency, setFrequency] = useState<RecurringFrequency>(editRule?.frequency ?? 'MONTHLY')
  const [startDate, setStartDate] = useState(editRule?.startDate ?? today)
  const [endDate, setEndDate] = useState(editRule?.endDate ?? '')
  const [note, setNote] = useState(editRule?.note ?? '')

  const isPending = create.isPending || update.isPending

  const handleSubmit = () => {
    if (!walletId) { toast.error(t('recurring.selectWallet')); return }
    if (!categoryId) { toast.error(t('recurring.selectCategory')); return }
    if (!amount || parseFloat(amount) <= 0) { toast.error(t('recurring.enterAmount')); return }
    onSubmit({
      walletId, categoryId, amount: parseFloat(amount), type,
      frequency, startDate, endDate: endDate || undefined, note: note || undefined,
    })
  }

  const filteredCats = categories.filter((c) => c.type === type)
  const activeWallets = wallets.filter((w) => w.isActive !== false)

  return (
    <div className="space-y-4">
      <SectionLabel>{isEditing ? t('recurring.editRecurring') : t('recurring.createRecurring')}</SectionLabel>

      {/* Type — one segmented style (lime), never coral */}
      <SegmentedControl
        options={[
          { value: 'EXPENSE', label: t('transaction.expenseShort') },
          { value: 'INCOME',  label: t('transaction.incomeShort') },
        ]}
        value={type}
        onChange={(v) => { setType(v as TxnType); setCategoryId(0) }}
        ariaLabel={t('recurring.title')}
        className="w-full grid grid-cols-2"
      />

      {/* Wallet */}
      <div>
        <label className="block font-mono text-[11px] uppercase tracking-widest text-secondary mb-1.5">{t('recurring.wallet')}</label>
        <select
          value={walletId}
          onChange={(e) => setWalletId(Number(e.target.value))}
          className="input [color-scheme:dark]"
        >
          <option value={0}>{t('recurring.selectWalletOption')}</option>
          {activeWallets.map((w) => (
            <option key={w.id} value={w.id}>{w.name}</option>
          ))}
        </select>
      </div>

      {/* Amount */}
      <Input
        label={t('recurring.amount')}
        type="number"
        inputMode="decimal"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder={t('recurring.amountPlaceholder')}
        className="font-mono"
      />

      {/* Category */}
      <div>
        <label className="block font-mono text-[11px] uppercase tracking-widest text-secondary mb-2">{t('recurring.category')}</label>
        <div className="flex flex-wrap gap-2">
          {filteredCats.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategoryId(c.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono text-[11px] transition-all ${
                categoryId === c.id ? 'ring-2 ring-primary/40' : 'hover:opacity-80'
              }`}
              style={{ backgroundColor: `${c.color}20`, border: `1.5px solid ${c.color}`, color: c.color }}
            >
              <span aria-hidden="true">{c.icon}</span><span>{c.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Frequency */}
      <div>
        <label className="block font-mono text-[11px] uppercase tracking-widest text-secondary mb-2">{t('recurring.frequency')}</label>
        <div className="grid grid-cols-2 gap-2">
          {FREQ_OPTIONS.map((f) => (
            <button
              key={f}
              onClick={() => setFrequency(f)}
              className={`py-2 font-mono text-[11px] uppercase tracking-wide rounded-md border transition-all ${
                frequency === f
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-border text-secondary hover:border-accent/50'
              }`}
            >
              {t(`recurring.frequencies.${f}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-3">
        <Input label={t('recurring.startDate')} type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <Input label={t('recurring.endDateOptional')} type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
      </div>

      {/* Note */}
      <Input label={t('recurring.note')} value={note} onChange={(e) => setNote(e.target.value)} placeholder={t('recurring.notePlaceholder')} />

      <div className="flex gap-2 pt-2">
        <Button variant="outline" onClick={onClose} className="flex-1">{t('common.cancel')}</Button>
        <Button onClick={handleSubmit} disabled={isPending} className="flex-1">
          {isPending ? t('common.saving') : isEditing ? t('common.saveChanges') : t('common.create')}
        </Button>
      </div>
    </div>
  )
}
