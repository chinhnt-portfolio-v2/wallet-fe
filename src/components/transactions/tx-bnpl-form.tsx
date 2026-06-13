import { useTranslation } from 'react-i18next'
import { Input } from '@/components/ui/Input'

interface TxBnplFormProps {
  enabled: boolean
  onToggle: () => void
  title: string
  onTitleChange: (v: string) => void
  dueDate: string
  onDueDateChange: (v: string) => void
  counterparty: string
  onCounterpartyChange: (v: string) => void
}

/**
 * BNPL / debt-tracking sub-form.
 * Toggle switch + expandable fields (title, due date, counterparty).
 * Only rendered for EXPENSE on POSTPAID wallet.
 */
export function TxBnplForm({
  enabled,
  onToggle,
  title,
  onTitleChange,
  dueDate,
  onDueDateChange,
  counterparty,
  onCounterpartyChange,
}: TxBnplFormProps) {
  const { t } = useTranslation()

  return (
    <div className="border border-negative/30 bg-negative-soft rounded-xl p-4 space-y-3">
      {/* Header row with toggle */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.07em] text-negative">
            {t('transaction.bnplTracking')}
          </p>
          <p className="text-xs text-muted mt-0.5">{t('transaction.bnplCreateGroup')}</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label={t('transaction.bnplToggleAria')}
          onClick={onToggle}
          className={`w-10 h-6 rounded-full transition-all relative shrink-0 ${
            enabled ? 'bg-negative' : 'bg-line'
          }`}
        >
          <span
            className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${
              enabled ? 'right-1' : 'left-1'
            }`}
            aria-hidden="true"
          />
        </button>
      </div>

      {/* Expanded fields */}
      {enabled && (
        <div className="space-y-2 pt-1">
          <Input
            label={t('transaction.debtTitle')}
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder={t('transaction.debtTitlePlaceholder')}
          />
          <Input
            label={t('transaction.debtDueDate')}
            type="date"
            value={dueDate}
            onChange={(e) => onDueDateChange(e.target.value)}
            hint={t('transaction.debtDueDateHint')}
          />
          <Input
            label={t('transaction.debtCounterparty')}
            value={counterparty}
            onChange={(e) => onCounterpartyChange(e.target.value)}
            placeholder={t('transaction.debtCounterpartyPlaceholder')}
          />
        </div>
      )}
    </div>
  )
}
