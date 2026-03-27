import { useState } from 'react'
import { useDebtGroups } from '@/hooks/useDebtGroups'
import { CardSkeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatCurrency, formatDate, isOverdue, GROUP_TYPE_LABEL, GROUP_STATUS_LABEL } from '@/lib/utils'

export default function DebtGroupsPage() {
  const [statusFilter, setStatusFilter] = useState<string>('')
  const { data: groups, isLoading, error } = useDebtGroups(statusFilter || undefined)

  const openGroups = groups?.filter((g) => g.status !== 'SETTLED') ?? []

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-primary">Nhóm nợ</h2>
          <p className="text-xs text-muted">{openGroups.length} nhóm đang mở</p>
        </div>
        <a href="/debts/new" className="btn-accent text-xs px-3 py-1.5 rounded-sm">
          + Tạo nợ
        </a>
      </div>

      {/* Filter */}
      <div className="flex gap-1 bg-surface-2 rounded-md p-1">
        {[{ v: '', l: 'Tất cả' }, { v: 'OPEN,PARTIAL', l: 'Đang mở' }, { v: 'SETTLED', l: 'Đã thanh toán' }].map(
          ({ v, l }) => (
            <button
              key={v}
              onClick={() => setStatusFilter(v)}
              className={`flex-1 py-1.5 text-xs rounded-sm transition-colors ${
                statusFilter === v ? 'bg-surface shadow-sm font-medium text-primary' : 'text-muted hover:text-primary'
              }`}
            >
              {l}
            </button>
          )
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <CardSkeleton key={i} />)}
        </div>
      )}

      {/* Error */}
      {error && (
        <EmptyState icon="⚠️" title="Không tải được" description="Hãy thử lại sau." />
      )}

      {/* Empty */}
      {!isLoading && !error && openGroups.length === 0 && (
        <EmptyState
          icon="📭"
          title="Không có nhóm nợ nào"
          description="Khi bạn ghi nhận giao dịch vay nợ, nhóm nợ sẽ hiện ở đây."
        />
      )}

      {/* Groups */}
      {!isLoading && !error && openGroups.length > 0 && (
        <div className="space-y-3">
          {openGroups.map((g) => {
            const overdue = isOverdue(g.dueDate)
            const progress = Number(g.totalAmount) > 0
              ? (Number(g.paidAmount) / Number(g.totalAmount)) * 100
              : 0
            const remaining = Number(g.totalAmount) - Number(g.paidAmount)

            return (
              <div key={g.id} className="card p-4 space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-primary truncate">{g.title}</p>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <Badge variant="neutral">{GROUP_TYPE_LABEL[g.groupType] ?? g.groupType}</Badge>
                      <Badge variant={g.status === 'PARTIAL' ? 'warning' : 'negative'}>
                        {GROUP_STATUS_LABEL[g.status] ?? g.status}
                      </Badge>
                      {overdue && <Badge variant="negative">Quá hạn</Badge>}
                    </div>
                  </div>
                </div>

                {/* Progress */}
                <div>
                  <div className="flex justify-between text-2xs text-muted mb-1.5">
                    <span>Đã trả</span>
                    <span>{progress.toFixed(0)}%</span>
                  </div>
                  <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-positive rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-2xs text-muted mt-1">
                    <span>{formatCurrency(Number(g.paidAmount))} đã trả</span>
                    <span>{formatCurrency(Number(g.totalAmount))} tổng</span>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-end justify-between pt-2 border-t border-border">
                  <div>
                    <p className="text-2xs text-muted">Còn lại</p>
                    <p className="text-base font-bold text-negative font-mono tabular-nums">
                      {formatCurrency(remaining)}
                    </p>
                  </div>
                  <div className="text-right">
                    {g.dueDate && (
                      <p className={`text-2xs ${overdue ? 'text-negative' : 'text-muted'}`}>
                        ⏰ {formatDate(g.dueDate)}
                      </p>
                    )}
                    {g.wallet && (
                      <p className="text-2xs text-muted mt-0.5">
                        {g.wallet.icon} {g.wallet.name}
                      </p>
                    )}
                  </div>
                </div>

                {/* Action */}
                <a
                  href={`/debts/${g.id}`}
                  className="block w-full text-center py-2 text-xs font-medium bg-accent text-white rounded-sm hover:bg-accent/90 transition-colors"
                >
                  Thanh toán
                </a>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
