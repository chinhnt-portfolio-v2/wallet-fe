import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useRecentTransactions } from '@/hooks/useTransactions'
import { Amount, SectionLabel, CategoryChip } from '@/design-system'
import { Card } from '@/components/ui/Card'

export function RecentTransactions() {
  const { t } = useTranslation()
  const { data: txs, isLoading, isError, refetch } = useRecentTransactions(6)
  const navigate = useNavigate()

  return (
    <div className="space-y-2">
      <SectionLabel
        right={
          <button
            onClick={() => navigate('/transactions')}
            className="hover:text-primary transition-colors min-h-[44px] px-1 flex items-center"
          >
            {t('common.viewAll')} →
          </button>
        }
      >
        {t('dashboard.recentActivity')}
      </SectionLabel>
      <Card padding="none">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-md bg-surface-2 animate-pulse" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-2/3 bg-surface-2 rounded animate-pulse" />
                  <div className="h-2 w-1/3 bg-surface-2 rounded animate-pulse" />
                </div>
                <div className="h-4 w-16 bg-surface-2 rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="p-6 text-center space-y-2">
            <p className="text-sm text-negative">{t('transaction.loadError')}</p>
            <button
              onClick={() => refetch()}
              className="text-[11px] uppercase tracking-[0.08em] text-primary hover:underline min-h-[44px] px-3"
            >
              {t('common.retry')}
            </button>
          </div>
        ) : Array.isArray(txs) && txs.length > 0 ? (
          txs.map((tx, i) => (
            <div
              key={tx.id}
              className={`flex items-center gap-3 p-3 hover:bg-hover transition-colors ${
                i < txs.length - 1 ? 'border-b border-line' : ''
              }`}
            >
              <CategoryChip
                cat={(tx.category?.name ?? 'other').toLowerCase()}
                name={tx.category?.name}
                size={28}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink truncate">
                  {tx.category?.name ?? t('transaction.transactionFallback')}
                </p>
                {tx.note && (
                  <p className="text-[10px] font-semibold text-muted truncate mt-0.5">
                    {tx.note}
                  </p>
                )}
              </div>
              <Amount
                value={tx.type === 'INCOME' ? tx.amount : -tx.amount}
                size={13}
                weight={600}
                sign
                style={{ color: tx.type === 'INCOME' ? 'var(--positive)' : 'var(--ink)' }}
              />
            </div>
          ))
        ) : (
          <p className="p-6 text-center text-sm text-muted">
            {t('transaction.noTransactionsYet')}
          </p>
        )}
      </Card>
    </div>
  )
}
