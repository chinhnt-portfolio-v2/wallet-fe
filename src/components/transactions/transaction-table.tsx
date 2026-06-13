import { useTranslation } from 'react-i18next'
import { Amount, CategoryChip } from '@/design-system'
import { formatDate } from '@/lib/utils'
import type { Transaction } from '@/types'
import { debtChipKey } from './debt-chip'

interface TransactionTableProps {
  txs: Transaction[]
  page: number
  hasNext: boolean
  onEdit: (tx: Transaction) => void
  onPrev: () => void
  onNext: () => void
}

/**
 * Desktop table view for transactions.
 * Columns: Giao dịch · Danh mục pill · Ví · Ngày · Số tiền
 * Numbered pagination at footer.
 */
export function TransactionTable({
  txs,
  page,
  hasNext,
  onEdit,
  onPrev,
  onNext,
}: TransactionTableProps) {
  const { t } = useTranslation()

  return (
    <div>
      <table className="w-full border-collapse" role="table">
        <thead>
          <tr className="border-b border-line">
            <th className="text-left py-2.5 text-[10px] font-extrabold uppercase tracking-[0.07em] text-muted w-[44%]">
              {t('transaction.colMerchant')}
            </th>
            <th className="text-left py-2.5 text-[10px] font-extrabold uppercase tracking-[0.07em] text-muted w-[18%]">
              {t('transaction.category')}
            </th>
            <th className="text-left py-2.5 text-[10px] font-extrabold uppercase tracking-[0.07em] text-muted w-[16%]">
              {t('transaction.wallet')}
            </th>
            <th className="text-left py-2.5 text-[10px] font-extrabold uppercase tracking-[0.07em] text-muted w-[10%]">
              {t('transaction.colDate')}
            </th>
            <th className="text-right py-2.5 text-[10px] font-extrabold uppercase tracking-[0.07em] text-muted w-[12%]">
              {t('transaction.colAmount')}
            </th>
          </tr>
        </thead>
        <tbody>
          {txs.map((tx) => {
            const isIncome = tx.type === 'INCOME'
            const primary =
              tx.note?.trim() ||
              tx.category?.name ||
              (isIncome ? t('transaction.income') : t('transaction.transactionFallback'))

            const debtChipKeyValue = debtChipKey(tx)
            const debtChip = debtChipKeyValue ? t(debtChipKeyValue) : null

            return (
              <tr
                key={tx.id}
                className="border-b border-line hover:bg-hover transition-colors cursor-pointer group"
                onClick={() => onEdit(tx)}
                tabIndex={0}
                role="button"
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onEdit(tx) }}
                aria-label={`${primary} — ${isIncome ? '+' : '−'}${tx.amount.toLocaleString('vi-VN')}₫`}
              >
                {/* Merchant */}
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {isIncome ? (
                      <div className="w-7 h-7 rounded-md bg-positive/10 text-positive flex items-center justify-center shrink-0">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 19V5M5 12l7-7 7 7" />
                        </svg>
                      </div>
                    ) : (
                      <CategoryChip
                        cat={tx.category?.name?.toLowerCase() ?? 'other'}
                        name={tx.category?.name ?? 'Other'}
                        size={28}
                        className="shrink-0"
                      />
                    )}
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium text-ink truncate leading-tight">
                        {primary}
                      </p>
                      {debtChip && (
                        <span className="inline-flex items-center px-1.5 py-0.5 mt-0.5 rounded-xs text-[10px] font-semibold bg-warning-soft text-warning border border-warning/20">
                          {debtChip}
                        </span>
                      )}
                    </div>
                  </div>
                </td>

                {/* Category pill */}
                <td className="py-3 pr-4">
                  {tx.category ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium bg-surface-2 text-sub border border-line truncate max-w-[120px]">
                      {tx.category.name}
                    </span>
                  ) : (
                    <span className="text-[11px] text-muted">—</span>
                  )}
                </td>

                {/* Wallet */}
                <td className="py-3 pr-4">
                  <span className="text-[12px] text-sub truncate">
                    {tx.wallet?.icon} {tx.wallet?.name}
                  </span>
                </td>

                {/* Date */}
                <td className="py-3 pr-4">
                  <span className="text-[11px] text-muted tabular-nums whitespace-nowrap">
                    {formatDate(tx.date)}
                  </span>
                </td>

                {/* Amount */}
                <td className="py-3 text-right">
                  <Amount
                    value={isIncome ? tx.amount : -tx.amount}
                    size={13}
                    weight={600}
                    className={isIncome ? 'text-positive' : 'text-ink'}
                  />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {/* Numbered pagination */}
      {(page > 1 || hasNext) && (
        <div className="pt-4 flex items-center justify-center gap-2">
          <button
            onClick={onPrev}
            disabled={page <= 1}
            className="h-8 px-3 rounded-md border border-line text-[11px] font-medium text-sub hover:bg-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors tabular-nums"
            aria-label={t('transaction.prev')}
          >
            ←
          </button>
          <span className="h-8 px-3 rounded-md bg-primary-soft text-primary text-[11px] font-semibold flex items-center tabular-nums">
            {page}
          </span>
          <button
            onClick={onNext}
            disabled={!hasNext}
            className="h-8 px-3 rounded-md border border-line text-[11px] font-medium text-sub hover:bg-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors tabular-nums"
            aria-label={t('transaction.nextPage')}
          >
            →
          </button>
        </div>
      )}
    </div>
  )
}
