import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import type { TFunction } from 'i18next'
import { Amount, Pill } from '@/design-system'
import { formatDate, isOverdue } from '@/lib/utils'
import { isReceivable, debtAmountColor, debtActionKey } from './debt-semantics'
import type { DebtGroup, GroupType } from '@/types'

// groupType → short label i18n key (row meta).
const KIND_KEY: Record<GroupType, string> = {
  BNPL:            'debt.kindBnpl',
  DEBT:            'debt.kindFriend',
  LOAN_GIVEN:      'debt.kindLoanGiven',
  PURCHASE_CREDIT: 'debt.kindCredit',
}

export function relDue(dateStr: string | null | undefined, t: TFunction): string {
  if (!dateStr) return '—'
  const diff = Math.round((new Date(dateStr).getTime() - Date.now()) / 86_400_000)
  if (diff < 0)  return t('debt.relOverdue', { days: Math.abs(diff) })
  if (diff === 0) return t('debt.relDueToday')
  if (diff < 7)  return t('debt.relDaysLeft', { days: diff })
  if (diff < 30) return t('debt.relWeeksLeft', { weeks: Math.round(diff / 7) })
  return t('debt.relMonthsLeft', { months: Math.round(diff / 30) })
}

export function DebtRow({ group, onEdit }: { group: DebtGroup; onEdit: (g: DebtGroup) => void }) {
  const { t } = useTranslation()
  const overdue = isOverdue(group.dueDate)
  const remaining = Number(group.totalAmount) - Number(group.paidAmount)
  const receivable = isReceivable(group.groupType)
  const amountColor = debtAmountColor(group.groupType)

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-t border-border first:border-t-0 transition-colors hover:bg-surface-2">
      {/* direction glyph: ↘ money out (payable) / ↗ money in (receivable) */}
      <span
        className="font-mono text-base shrink-0 w-4 text-center"
        style={{ color: overdue ? 'var(--color-negative)' : amountColor }}
        aria-label={receivable ? t('debt.receivableLabel') : t('debt.payableLabel')}
      >
        {receivable ? '↗' : '↘'}
      </span>

      {/* title + meta */}
      <div className="flex-1 min-w-0">
        <button onClick={() => onEdit(group)} className="text-left block w-full">
          <p className="font-sans text-sm font-medium text-primary truncate hover:text-accent transition-colors">
            {group.title}
          </p>
        </button>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-secondary">
            {t(KIND_KEY[group.groupType])}
          </span>
          {group.counterparty && (
            <>
              <span className="text-faint font-mono text-[11px]">·</span>
              <span className="font-mono text-[11px] text-secondary truncate">{group.counterparty}</span>
            </>
          )}
        </div>
      </div>

      {/* due date */}
      <div className="shrink-0 text-right hidden sm:block">
        <p className={`font-mono text-[11px] ${overdue ? 'text-negative' : 'text-secondary'}`}>
          {relDue(group.dueDate, t)}
        </p>
        {group.dueDate && (
          <p className="font-mono text-[11px] text-faint">{formatDate(group.dueDate)}</p>
        )}
      </div>

      {/* amount — green for receivables, red for payables */}
      <div className="shrink-0 text-right">
        <Amount value={remaining} size={13} weight={500} style={{ color: amountColor }} />
      </div>

      {/* action pill: Collect vs Pay */}
      <Link to={`/debts/${group.id}`}>
        <Pill accent className="shrink-0 min-h-[44px] sm:min-h-0">{t(debtActionKey(group.groupType))}</Pill>
      </Link>
    </div>
  )
}
