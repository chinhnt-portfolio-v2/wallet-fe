import { CreditCard, ShoppingBag, Users, HandCoins } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { SectionLabel } from '@/design-system'
import type { CreateDebtGroupRequest } from '@/types'

type GroupType = CreateDebtGroupRequest['groupType']

const GROUP_TYPES: {
  value: GroupType
  labelKey: string
  descKey: string
  Icon: LucideIcon
}[] = [
  { value: 'PURCHASE_CREDIT', labelKey: 'debt.kindCredit',    descKey: 'debt.creditCardDesc',   Icon: CreditCard },
  { value: 'BNPL',            labelKey: 'debt.kindBnpl',      descKey: 'debt.descBnpl',         Icon: ShoppingBag },
  { value: 'DEBT',            labelKey: 'debt.kindFriend',    descKey: 'debt.friendFamilyDesc', Icon: Users },
  { value: 'LOAN_GIVEN',      labelKey: 'debt.kindLoanGiven', descKey: 'debt.loanGivenDesc',    Icon: HandCoins },
]

export function DebtTypePicker({
  value,
  onChange,
}: {
  value: GroupType
  onChange: (v: GroupType) => void
}) {
  const { t } = useTranslation()
  return (
    <div>
      <SectionLabel className="mb-3">{t('debt.groupTypeLabel')}</SectionLabel>
      <div className="grid grid-cols-2 gap-2">
        {GROUP_TYPES.map(({ value: gt, labelKey, descKey, Icon }) => {
          const selected = value === gt
          return (
            <button
              key={gt}
              type="button"
              onClick={() => onChange(gt)}
              className={`rounded-sm border p-3 text-left transition-all ${
                selected
                  ? 'border-primary bg-primary-soft'
                  : 'border-line bg-surface-2 hover:bg-hover'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <Icon
                  size={15}
                  className={selected ? 'text-primary' : 'text-sub'}
                />
                <span className={`text-[11px] font-semibold ${selected ? 'text-primary' : 'text-ink'}`}>
                  {t(labelKey)}
                </span>
              </div>
              <p className="text-[11px] text-sub">{t(descKey)}</p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
