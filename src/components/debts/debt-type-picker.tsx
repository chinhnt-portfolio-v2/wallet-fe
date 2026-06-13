import { useTranslation } from 'react-i18next'
import { SectionLabel } from '@/design-system'
import type { CreateDebtGroupRequest } from '@/types'

type GroupType = CreateDebtGroupRequest['groupType']

const GROUP_TYPES: { value: GroupType; labelKey: string; descKey: string; glyph: string }[] = [
  { value: 'PURCHASE_CREDIT', labelKey: 'debt.kindCredit',    descKey: 'debt.creditCardDesc',   glyph: '◆' },
  { value: 'BNPL',            labelKey: 'debt.kindBnpl',      descKey: 'debt.descBnpl',         glyph: '◈' },
  { value: 'DEBT',            labelKey: 'debt.kindFriend',    descKey: 'debt.friendFamilyDesc', glyph: '◇' },
  { value: 'LOAN_GIVEN',      labelKey: 'debt.kindLoanGiven', descKey: 'debt.loanGivenDesc',    glyph: '◉' },
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
        {GROUP_TYPES.map((gt) => {
          const selected = value === gt.value
          return (
            <button
              key={gt.value}
              type="button"
              onClick={() => onChange(gt.value)}
              className={`rounded-sm border p-3 text-left transition-all ${
                selected ? 'border-accent bg-accent/5' : 'border-border bg-surface-2 hover:border-border-hi'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span
                  className="font-mono text-base"
                  style={{ color: selected ? 'var(--color-accent)' : 'var(--color-text-secondary)' }}
                  aria-hidden="true"
                >
                  {gt.glyph}
                </span>
                <span className="font-mono text-[11px] font-medium text-primary">{t(gt.labelKey)}</span>
              </div>
              <p className="font-mono text-[11px] text-secondary">{t(gt.descKey)}</p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
