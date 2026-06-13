import { useTranslation } from 'react-i18next'
import { Amount, CategoryChip } from '@/design-system'
import { formatDate } from '@/lib/utils'
import type { Transaction } from '@/types'

interface TransactionRowProps {
  tx: Transaction
  /** No top border on the first row (the section already has a divider). */
  first: boolean
  onEdit: () => void
}

/**
 * Responsive transaction row.
 *
 * Mobile (<640px): a card — merchant/note is the PRIMARY line (never dropped),
 * category + wallet form the secondary line, amount is right-aligned. The avatar
 * is `shrink-0` so it can't overlap the text (audit §2.2 fix).
 *
 * Desktop (≥640px): the original 4-column grid (date · merchant · category · amount).
 */
export function TransactionRow({ tx, first, onEdit }: TransactionRowProps) {
  const { t } = useTranslation()
  const isIncome = tx.type === 'INCOME'

  // Primary label: the merchant/note is the useful info — fall back to the
  // category name, then a generic label. Never show a bare category on mobile.
  const primary =
    tx.note?.trim() ||
    tx.category?.name ||
    (isIncome ? t('transaction.income') : t('transaction.transactionFallback'))

  const categoryLabel = isIncome
    ? t('transaction.incomeRow')
    : (tx.category?.name ?? '—')

  const Avatar = isIncome ? (
    <div className="w-[26px] h-[26px] rounded-[6px] bg-accent/15 text-accent flex items-center justify-center font-mono text-[13px] shrink-0">
      ↓
    </div>
  ) : (
    <CategoryChip
      cat={tx.category?.name?.toLowerCase() ?? 'other'}
      name={tx.category?.name ?? 'Other'}
      size={26}
      className="shrink-0"
    />
  )

  return (
    <button
      onClick={onEdit}
      className="w-full text-left transition-colors hover:bg-surface-2 group"
      style={{ borderTop: first ? 'none' : '1px solid var(--color-border)' }}
    >
      {/* ── Mobile card (<640px) ───────────────────────────────────── */}
      <div className="flex sm:hidden items-start gap-3 px-1 py-3 min-h-[44px]">
        {Avatar}
        <div className="flex-1 min-w-0">
          <p className="font-sans text-[14px] text-primary truncate leading-tight">
            {primary}
          </p>
          <p className="font-mono text-[11px] text-muted truncate mt-1">
            {categoryLabel}
            <span className="text-faint"> · {tx.wallet?.icon} {tx.wallet?.name}</span>
            {tx.groupId && <span className="ml-1.5 text-accent">◈ {t('transaction.bnpl')}</span>}
          </p>
          <p className="font-mono text-[10px] text-faint mt-0.5 tabular-nums">
            {formatDate(tx.date)}
          </p>
        </div>
        <div className="shrink-0 pt-0.5">
          <Amount
            value={isIncome ? tx.amount : -tx.amount}
            size={14}
            weight={500}
            className={isIncome ? 'text-positive' : 'text-primary'}
          />
        </div>
      </div>

      {/* ── Desktop grid (≥640px) ──────────────────────────────────── */}
      <div
        className="hidden sm:grid gap-3 px-0 py-3 items-center"
        style={{ gridTemplateColumns: '100px 1fr 120px 110px' }}
      >
        {/* date */}
        <span className="font-mono text-[11px] text-secondary tabular-nums">
          {formatDate(tx.date)}
        </span>

        {/* merchant + wallet */}
        <div className="flex items-center gap-2.5 min-w-0">
          {Avatar}
          <div className="min-w-0">
            <p className="font-sans text-[13px] text-primary truncate leading-tight">
              {primary}
            </p>
            <p className="font-mono text-[10px] text-faint truncate mt-0.5">
              {tx.wallet?.icon} {tx.wallet?.name}
              {tx.groupId && <span className="ml-1.5 text-accent">◈ {t('transaction.bnpl')}</span>}
            </p>
          </div>
        </div>

        {/* category */}
        <div className="flex items-center min-w-0">
          <span className="font-mono text-[11px] text-muted truncate">
            {isIncome ? `— ${t('transaction.incomeRow')}` : (tx.category?.name ?? '—')}
          </span>
        </div>

        {/* amount */}
        <div className="flex items-center justify-end">
          <Amount
            value={isIncome ? tx.amount : -tx.amount}
            size={13}
            weight={500}
            className={isIncome ? 'text-positive' : 'text-primary'}
          />
        </div>
      </div>
    </button>
  )
}
