import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useUpdateDebtGroup, useDeleteDebtGroup } from '@/hooks/useDebtGroups'
import { Button } from '@/components/ui/Button'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { Input } from '@/components/ui/Input'
import { ymdToInstant } from '@/lib/date-utils'
import type { DebtGroup } from '@/types'

const GROUP_TYPES: { value: DebtGroup['groupType']; labelKey: string; descKey: string }[] = [
  { value: 'BNPL',            labelKey: 'debt.kindBnpl',      descKey: 'debt.descBnpl' },
  { value: 'DEBT',            labelKey: 'debt.types.DEBT',    descKey: 'debt.descFriend' },
  { value: 'LOAN_GIVEN',      labelKey: 'debt.kindLoanGiven', descKey: 'debt.descLoanGiven' },
  { value: 'PURCHASE_CREDIT', labelKey: 'debt.kindCredit',   descKey: 'debt.descCredit' },
]

interface FormPayload {
  title: string
  groupType: DebtGroup['groupType']
  totalAmount: number
  dueDate?: string
  counterparty?: string
}

function DebtGroupForm({
  initial,
  onSubmit,
  onCancel,
  isPending,
}: {
  initial: DebtGroup
  onSubmit: (data: FormPayload) => void
  onCancel: () => void
  isPending: boolean
}) {
  const { t } = useTranslation()
  const [title, setTitle] = useState(initial.title)
  const [groupType, setGroupType] = useState<DebtGroup['groupType']>(initial.groupType)
  const [totalAmount, setTotalAmount] = useState(Number(initial.totalAmount).toString())
  const [dueDate, setDueDate] = useState(initial.dueDate ? initial.dueDate.split('T')[0] : '')
  const [counterparty, setCounterparty] = useState(initial.counterparty ?? '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) { toast.error(t('debt.enterTitle')); return }
    if (!totalAmount)  { toast.error(t('debt.enterAmount')); return }
    onSubmit({
      title: title.trim(),
      groupType,
      totalAmount: parseFloat(totalAmount),
      dueDate: ymdToInstant(dueDate),
      counterparty: counterparty || undefined,
    })
  }

  const canSubmit = !!title.trim() && !!totalAmount && !isPending

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-widest text-secondary mb-2">{t('debt.typeLabel')}</p>
        <div className="grid grid-cols-2 gap-2">
          {GROUP_TYPES.map((gt) => (
            <button
              key={gt.value}
              type="button"
              onClick={() => setGroupType(gt.value)}
              className={`rounded-sm border p-3 text-left transition-all ${
                groupType === gt.value
                  ? 'border-accent bg-accent/5'
                  : 'border-border bg-surface-2 hover:border-border-hi'
              }`}
            >
              <p className="font-mono text-[11px] font-medium text-primary">{t(gt.labelKey)}</p>
              <p className="font-mono text-[11px] text-secondary mt-0.5">{t(gt.descKey)}</p>
            </button>
          ))}
        </div>
      </div>

      <Input
        label={t('debt.groupTitle')}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={t('debt.groupTitlePlaceholder')}
        required
      />

      <div>
        <label className="block font-mono text-[11px] uppercase tracking-widest text-secondary mb-1.5">
          {t('debt.totalAmount')}
        </label>
        <input
          type="number"
          inputMode="decimal"
          value={totalAmount}
          onChange={(e) => setTotalAmount(e.target.value)}
          placeholder="0"
          required
          className="w-full rounded-sm border border-border bg-surface-2 px-3 py-2 font-mono text-sm text-primary [color-scheme:dark] placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
        />
      </div>

      <Input
        label={t('debt.counterparty')}
        value={counterparty}
        onChange={(e) => setCounterparty(e.target.value)}
        placeholder={groupType === 'LOAN_GIVEN' ? t('debt.counterpartyPlaceholderLoan') : t('debt.counterpartyPlaceholderDebt')}
      />

      <Input
        label={t('debt.dueDate')}
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
      />

      <div className="flex gap-2">
        <Button variant="outline" onClick={onCancel} type="button" className="flex-1">{t('common.cancel')}</Button>
        <Button type="submit" disabled={!canSubmit} className="flex-1">
          {isPending ? t('common.saving') : t('common.saveChanges')}
        </Button>
      </div>
    </form>
  )
}

export function DebtEditModal({ group, onClose }: { group: DebtGroup; onClose: () => void }) {
  const { t } = useTranslation()
  const update = useUpdateDebtGroup()
  const del    = useDeleteDebtGroup()
  const [showDelete, setShowDelete] = useState(false)

  const handleUpdate = (data: FormPayload) => {
    update.mutate({ id: group.id, ...data }, {
      onSuccess: () => { toast.success(t('debt.updated')); onClose() },
      onError: (e: Error) => toast.error(e.message),
    })
  }

  const handleDelete = () => {
    del.mutate(group.id, {
      onSuccess: () => { toast.success(t('debt.deleted')); onClose() },
      onError: (e: Error) => toast.error(e.message),
    })
  }

  return (
    <BottomSheet open onClose={onClose} title={t('debt.editDebtGroup')}>
      <DebtGroupForm initial={group} onSubmit={handleUpdate} onCancel={onClose} isPending={update.isPending} />
      <div className="border-t border-border pt-3 mt-3">
        {showDelete ? (
          <div className="space-y-2">
            <p className="font-mono text-[11px] text-negative text-center">
              {t('debt.deleteConfirm', { name: group.title })}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowDelete(false)} className="flex-1">{t('common.cancel')}</Button>
              <Button onClick={handleDelete} disabled={del.isPending} className="flex-1 !bg-negative !text-white">
                {del.isPending ? t('common.deleting') : t('common.delete')}
              </Button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowDelete(true)}
            className="w-full text-center font-mono text-[11px] text-negative hover:underline py-1"
          >
            {t('debt.deleteDebtGroup')}
          </button>
        )}
      </div>
    </BottomSheet>
  )
}
