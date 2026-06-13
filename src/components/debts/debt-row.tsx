import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { CreditCard, ShoppingBag, Users, HandCoins } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { TFunction } from 'i18next'
import { Amount, ProgressBar } from '@/design-system'
import { isOverdue } from '@/lib/utils'
import { isReceivable, debtAmountColor, debtActionKey } from './debt-semantics'
import type { DebtGroup, GroupType } from '@/types'

const KIND_KEY: Record<GroupType, string> = {
  BNPL:            'debt.kindBnpl',
  DEBT:            'debt.kindFriend',
  LOAN_GIVEN:      'debt.kindLoanGiven',
  PURCHASE_CREDIT: 'debt.kindCredit',
}

const TYPE_ICON: Record<GroupType, LucideIcon> = {
  PURCHASE_CREDIT: CreditCard,
  BNPL:            ShoppingBag,
  DEBT:            Users,
  LOAN_GIVEN:      HandCoins,
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
  const [now] = useState(() => Date.now())
  const overdue = isOverdue(group.dueDate)
  const remaining = Number(group.totalAmount) - Number(group.paidAmount)
  const pct = Number(group.totalAmount) > 0
    ? Number(group.paidAmount) / Number(group.totalAmount)
    : 0
  const receivable = isReceivable(group.groupType)
  const amountColor = debtAmountColor(group.groupType)
  const Icon = TYPE_ICON[group.groupType]

  // Days until due — snapshotted at mount so lint purity rule is satisfied
  const dueDiff = group.dueDate
    ? Math.round((new Date(group.dueDate).getTime() - now) / 86_400_000)
    : null
  const dueSoon = dueDiff !== null && dueDiff >= 0 && dueDiff <= 14

  // Due pill styling
  const duePillClass = overdue
    ? 'bg-negative-soft text-negative'
    : 'bg-warning-soft text-warning'

  return (
    <div className="border-t border-line first:border-t-0 transition-colors hover:bg-hover">
      <div className="flex items-center gap-3 px-4 py-3">
        {/* icon chip */}
        <div
          className="w-8 h-8 rounded-xs flex items-center justify-center shrink-0"
          style={{
            backgroundColor: receivable ? 'var(--positive-soft)' : 'var(--negative-soft)',
          }}
          aria-hidden="true"
        >
          <Icon
            size={14}
            className={receivable ? 'text-positive' : 'text-negative'}
          />
        </div>

        {/* title + meta */}
        <div className="flex-1 min-w-0">
          <button
            onClick={() => onEdit(group)}
            className="text-left block w-full"
          >
            <p className="text-[13px] font-semibold text-ink truncate hover:text-primary transition-colors">
              {group.title}
            </p>
          </button>
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-muted">
              {t(KIND_KEY[group.groupType])}
            </span>
            {group.counterparty && (
              <>
                <span className="text-muted text-[10px]">·</span>
                <span className="text-[10px] text-sub truncate max-w-[80px]">
                  {group.counterparty}
                </span>
              </>
            )}
          </div>
          {/* progress bar */}
          <div className="mt-1.5">
            <ProgressBar
              pct={pct}
              height={3}
              color={receivable ? 'var(--positive)' : 'var(--primary)'}
            />
          </div>
        </div>

        {/* right column: due pill + amount */}
        <div className="shrink-0 text-right flex flex-col items-end gap-1.5">
          {group.dueDate && (
            <span
              className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                overdue || dueSoon ? duePillClass : 'text-muted'
              }`}
            >
              {relDue(group.dueDate, t)}
            </span>
          )}
          <Amount
            value={remaining}
            size={13}
            weight={600}
            style={{ color: amountColor }}
          />
        </div>
      </div>

      {/* action link — full-width tap area on mobile */}
      <div className="px-4 pb-2.5 flex justify-end">
        <Link
          to={`/debts/${group.id}`}
          aria-label={`${t(debtActionKey(group.groupType))} — ${group.title}`}
          className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-[0.08em] text-primary hover:text-primary-hover transition-colors min-h-[44px] py-1"
        >
          {t(debtActionKey(group.groupType))} →
        </Link>
      </div>
    </div>
  )
}
