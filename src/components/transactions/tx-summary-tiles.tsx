import { useTranslation } from 'react-i18next'
import { Amount } from '@/design-system'

interface TxSummaryData {
  totalIncome: number
  totalExpense: number
}

interface TxSummaryTilesProps {
  /** Mobile: show 2 tiles (Thu/Chi). Desktop: show 3 cards (+ net cashflow). */
  variant: 'mobile' | 'desktop'
  data: TxSummaryData
}

/**
 * Summary tiles/cards for Transactions page.
 * Mobile: 2 horizontal tiles (Thu/Chi).
 * Desktop: 3 summary cards (Tổng thu / Tổng chi / Dòng tiền ròng).
 */
export function TxSummaryTiles({ variant, data }: TxSummaryTilesProps) {
  const { t } = useTranslation()
  const net = data.totalIncome - data.totalExpense

  if (variant === 'desktop') {
    return (
      <div className="hidden sm:grid grid-cols-3 gap-4 mb-4">
        {/* Total income */}
        <div className="bg-surface border border-line rounded-xl p-4">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.07em] text-muted mb-2">
            {t('transaction.summaryIncome')}
          </p>
          <Amount value={data.totalIncome} size={18} weight={700} className="text-positive" />
        </div>
        {/* Total expense */}
        <div className="bg-surface border border-line rounded-xl p-4">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.07em] text-muted mb-2">
            {t('transaction.summaryExpense')}
          </p>
          <Amount value={data.totalExpense} size={18} weight={700} className="text-negative" />
        </div>
        {/* Net cashflow */}
        <div className="bg-surface border border-line rounded-xl p-4">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.07em] text-muted mb-2">
            {t('transaction.summaryCashflow')}
          </p>
          <Amount
            value={net}
            size={18}
            weight={700}
            className={net >= 0 ? 'text-positive' : 'text-negative'}
          />
        </div>
      </div>
    )
  }

  // Mobile tiles
  return (
    <div className="flex sm:hidden gap-3 mb-4">
      <div className="flex-1 bg-surface border border-line rounded-xl p-3">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.07em] text-muted mb-1">
          {t('transaction.summaryIncomeMobile')}
        </p>
        <Amount value={data.totalIncome} size={14} weight={700} className="text-positive" />
      </div>
      <div className="flex-1 bg-surface border border-line rounded-xl p-3">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.07em] text-muted mb-1">
          {t('transaction.summaryExpenseMobile')}
        </p>
        <Amount value={data.totalExpense} size={14} weight={700} className="text-negative" />
      </div>
    </div>
  )
}
