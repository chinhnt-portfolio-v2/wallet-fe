import { useTranslation } from 'react-i18next'
import { Amount, CategoryChip } from '@/design-system'
import type { Transaction } from '@/types'

interface TransactionRowProps {
  tx: Transaction
  /** No top border on the first row (the section already has a divider). */
  first: boolean
  onEdit: () => void
}

/**
 * Responsive transaction row (Minh design).
 *
 * Mobile (<640px): category icon + name/sub-line + signed amount + time.
 * Desktop (≥640px): handled by TransactionTable — this renders mobile only.
 * Both: debt-linked rows show a Trả nợ/Phải thu chip.
 */
export function TransactionRow({ tx, first, onEdit }: TransactionRowProps) {
  const { t } = useTranslation()
  const isIncome = tx.type === 'INCOME'

  const primary =
    tx.note?.trim() ||
    tx.category?.name ||
    (isIncome ? t('transaction.income') : t('transaction.transactionFallback'))

  const categoryLabel = isIncome
    ? t('transaction.incomeRow')
    : (tx.category?.name ?? '—')

  // Debt chip label based on group type
  const debtChip =
    tx.group?.groupType === 'LOAN_GIVEN'
      ? t('transaction.chipReceivable')
      : tx.groupId
        ? t('transaction.chipPayDebt')
        : null

  const Avatar = isIncome ? (
    <div
      className="w-[30px] h-[30px] rounded-md bg-positive/10 text-positive flex items-center justify-center shrink-0"
      aria-hidden="true"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    </div>
  ) : (
    <CategoryChip
      cat={tx.category?.name?.toLowerCase() ?? 'other'}
      name={tx.category?.name ?? 'Other'}
      size={30}
      className="shrink-0"
    />
  )

  // Format time from ISO string (HH:MM)
  const timeStr = (() => {
    try {
      const d = new Date(tx.date)
      return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false })
    } catch {
      return ''
    }
  })()

  return (
    <button
      onClick={onEdit}
      aria-label={`${primary} — ${isIncome ? '+' : '−'}${tx.amount.toLocaleString('vi-VN')}₫`}
      className="w-full text-left transition-colors hover:bg-hover group"
      style={{ borderTop: first ? 'none' : '1px solid var(--line)' }}
    >
      {/* ── Single row layout (mobile + used by page in mobile mode) ── */}
      <div className="flex items-center gap-3 px-1 py-3 min-h-[52px]">
        {Avatar}

        {/* name + sub-line */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <p className="text-[13px] font-medium text-ink truncate leading-tight">
              {primary}
            </p>
            {debtChip && (
              <span className="shrink-0 inline-flex items-center px-1.5 py-0.5 rounded-xs text-[10px] font-semibold bg-warning-soft text-warning border border-warning/20">
                {debtChip}
              </span>
            )}
          </div>
          <p className="text-[11px] text-muted truncate mt-0.5">
            {tx.wallet?.icon} {tx.wallet?.name}
            {categoryLabel !== t('transaction.incomeRow') && (
              <span className="text-muted"> · {categoryLabel}</span>
            )}
          </p>
        </div>

        {/* amount + time */}
        <div className="shrink-0 flex flex-col items-end gap-0.5">
          <Amount
            value={isIncome ? tx.amount : -tx.amount}
            size={13}
            weight={600}
            className={isIncome ? 'text-positive' : 'text-ink'}
          />
          <span className="text-[10px] text-muted tabular-nums">{timeStr}</span>
        </div>
      </div>
    </button>
  )
}
