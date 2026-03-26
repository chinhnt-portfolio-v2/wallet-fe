import { useState } from 'react'
import { useTransactions } from '@/hooks/useTransactions'
import { ListSkeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function TransactionsPage() {
  const [typeFilter, setTypeFilter] = useState('')
  const { data: txs, isLoading, error } = useTransactions({ type: typeFilter || undefined, size: 50 })

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-primary">Giao dịch</h2>
        <p className="text-xs text-muted">{txs?.length ?? 0} giao dịch</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-surface-2 rounded-md p-1">
        {['', 'INCOME', 'EXPENSE'].map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`flex-1 py-1.5 text-xs rounded-sm transition-colors ${
              typeFilter === t
                ? 'bg-surface shadow-sm font-medium text-primary'
                : 'text-muted hover:text-primary'
            }`}
          >
            {t === '' ? 'Tất cả' : t === 'INCOME' ? '📥 Thu' : '💸 Chi'}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <ListSkeleton rows={8} />
      ) : error ? (
        <EmptyState
          icon="⚠️"
          title="Không tải được giao dịch"
          description="Hãy thử lại sau."
        />
      ) : txs && txs.length > 0 ? (
        <div className="bg-surface rounded-md border border-border divide-y divide-border">
          {txs.map((tx, i) => (
            <div key={tx.id} className="flex items-center gap-3 p-4">
              {/* Category icon */}
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0"
                style={{ backgroundColor: `${tx.category?.color ?? '#94A3B8'}20` }}
              >
                {tx.category?.icon ?? '📦'}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-primary truncate">
                  {tx.category?.name ?? 'Giao dịch'}
                </p>
                <p className="text-2xs text-muted truncate">
                  {tx.wallet?.icon} {tx.wallet?.name}
                  {tx.note && ` · ${tx.note}`}
                  {tx.groupId && (
                    <span className="ml-1 text-accent">📑 Nợ</span>
                  )}
                </p>
              </div>

              {/* Amount + date */}
              <div className="text-right shrink-0">
                <p className={`text-sm font-semibold font-mono tabular-nums ${
                  tx.type === 'INCOME' ? 'text-positive' : 'text-negative'
                }`}>
                  {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount)}
                </p>
                <p className="text-2xs text-muted">{formatDate(tx.date)}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon="📭"
          title="Chưa có giao dịch nào"
          description="Bắt đầu thêm giao dịch đầu tiên của bạn."
          action={
            <a href="/add" className="bg-accent text-white text-xs px-4 py-2 rounded-md font-medium">
              Thêm giao dịch
            </a>
          }
        />
      )}
    </div>
  )
}
