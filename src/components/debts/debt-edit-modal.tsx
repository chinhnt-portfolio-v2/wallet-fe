import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { CreditCard, ShoppingBag, Users, HandCoins } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useUpdateDebtGroup, useDeleteDebtGroup } from '@/hooks/useDebtGroups'
import { Button } from '@/components/ui/Button'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { Input } from '@/components/ui/Input'
import { ymdToInstant } from '@/lib/date-utils'
import type { DebtGroup } from '@/types'

const GROUP_TYPES: {
  value: DebtGroup['groupType']
  labelKey: string
  descKey: string
  Icon: LucideIcon
}[] = [
  { value: 'BNPL',            labelKey: 'debt.kindBnpl',      descKey: 'debt.descBnpl',      Icon: ShoppingBag },
  { value: 'DEBT',            labelKey: 'debt.kindFriend',    descKey: 'debt.descFriend',    Icon: Users },
  { value: 'LOAN_GIVEN',      labelKey: 'debt.kindLoanGiven', descKey: 'debt.descLoanGiven', Icon: HandCoins },
  { value: 'PURCHASE_CREDIT', labelKey: 'debt.kindCredit',    descKey: 'debt.descCredit',    Icon: CreditCard },
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
      {/* type picker */}
      <div>
        <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted mb-2">
          {t('debt.typeLabel')}
        </p>
        <div className="grid grid-cols-2 gap-2">
          {GROUP_TYPES.map(({ value, labelKey, descKey, Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setGroupType(value)}
              className={`rounded-sm border p-3 text-left transition-all ${
                groupType === value
                  ? 'border-primary bg-primary-soft'
                  : 'border-line bg-surface-2 hover:bg-hover'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon
                  size={13}
                  className={groupType === value ? 'text-primary' : 'text-sub'}
                />
                <p className={`text-[11px] font-semibold ${groupType === value ? 'text-primary' : 'text-ink'}`}>
                  {t(labelKey)}
                </p>
              </div>
              <p className="text-[11px] text-sub">{t(descKey)}</p>
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
        <label className="block text-[10px] font-extrabold uppercase tracking-widest text-muted mb-1.5">
          {t('debt.totalAmount')}
        </label>
        <input
          type="number"
          inputMode="decimal"
          value={totalAmount}
          onChange={(e) => setTotalAmount(e.target.value)}
          placeholder="0"
          required
          className="w-full rounded-sm border border-line bg-surface-2 px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary tabular-nums"
        />
      </div>

      <Input
        label={t('debt.counterparty')}
        value={counterparty}
        onChange={(e) => setCounterparty(e.target.value)}
        placeholder={
          groupType === 'LOAN_GIVEN'
            ? t('debt.counterpartyPlaceholderLoan')
            : t('debt.counterpartyPlaceholderDebt')
        }
      />

      <Input
        label={t('debt.dueDate')}
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
      />

      <div className="flex gap-2">
        <Button variant="outline" onClick={onCancel} type="button" className="flex-1">
          {t('common.cancel')}
        </Button>
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
      <DebtGroupForm
        initial={group}
        onSubmit={handleUpdate}
        onCancel={onClose}
        isPending={update.isPending}
      />
      <div className="border-t border-line pt-3 mt-3">
        {showDelete ? (
          <div className="space-y-2">
            <p className="text-[11px] font-medium text-negative text-center">
              {t('debt.deleteConfirm', { name: group.title })}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowDelete(false)} className="flex-1">
                {t('common.cancel')}
              </Button>
              <Button
                onClick={handleDelete}
                disabled={del.isPending}
                className="flex-1 !bg-negative !text-white hover:!bg-negative/90"
              >
                {del.isPending ? t('common.deleting') : t('common.delete')}
              </Button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowDelete(true)}
            className="w-full text-center text-[11px] font-medium text-negative hover:underline py-2 min-h-[44px]"
          >
            {t('debt.deleteDebtGroup')}
          </button>
        )}
      </div>
    </BottomSheet>
  )
}
