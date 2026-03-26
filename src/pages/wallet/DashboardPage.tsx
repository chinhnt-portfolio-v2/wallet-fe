import { useNavigate } from 'react-router-dom'
import { useDashboardSummary, useOpenDebts } from '@/hooks/useDashboard'
import { useRecentTransactions } from '@/hooks/useTransactions'
import { DashboardSkeleton } from '@/components/ui/Skeleton'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency } from '@/lib/utils'

function ZoneA() {
  const { data: summary, isLoading } = useDashboardSummary()

  if (isLoading) return <DashboardSkeleton />

  const s = summary ?? { totalAssets: 0, totalDebt: 0, totalReceivable: 0, netWorth: 0, currency: 'VND' }

  return (
    <Card padding="lg">
      {/* Net worth hero */}
      <div className="text-center mb-4 pb-4 border-b border-border">
        <p className="text-xs text-muted uppercase tracking-wide mb-1">Số dư thực</p>
        <p className="text-2xl font-bold text-primary font-mono tabular-nums">
          {formatCurrency(s.netWorth)}
        </p>
      </div>

      {/* 3 columns */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center">
          <p className="text-2xs text-muted mb-1">💰 Tài sản</p>
          <p className="text-sm font-semibold text-positive font-mono tabular-nums">
            {formatCurrency(s.totalAssets)}
          </p>
        </div>
        <div className="text-center border-x border-border">
          <p className="text-2xs text-muted mb-1">📋 Nợ phải trả</p>
          <p className="text-sm font-semibold text-negative font-mono tabular-nums">
            {formatCurrency(s.totalDebt)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-2xs text-muted mb-1">📬 Cần thu</p>
          <p className="text-sm font-semibold text-accent font-mono tabular-nums">
            {formatCurrency(s.totalReceivable)}
          </p>
        </div>
      </div>
    </Card>
  )
}

function ZoneE() {
  const { data: debts } = useOpenDebts()
  const navigate = useNavigate()

  if (!debts || debts.length === 0) return null

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted uppercase tracking-wide">📋 Nợ đang mở</p>
        <a href="/debts" className="text-xs text-accent hover:underline">Xem tất cả</a>
      </div>
      <Card padding="none">
        {debts.slice(0, 3).map((d, i) => (
          <div
            key={d.groupId}
            className={`flex items-center justify-between p-3 ${i < Math.min(debts.length, 3) - 1 ? 'border-b border-border' : ''}`}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-primary truncate">{d.title}</p>
              <p className="text-2xs text-muted">
                {d.walletIcon} {d.walletName}
                {d.dueDate && (
                  <span className={d.isOverdue ? 'text-negative ml-1' : 'ml-1'}>
                    · Hết hạn {new Date(d.dueDate).toLocaleDateString('vi-VN')}
                  </span>
                )}
                {d.isOverdue && <Badge variant="negative" className="ml-1">Quá hạn</Badge>}
              </p>
            </div>
            <div className="flex items-center gap-2 ml-3">
              <p className="text-sm font-semibold text-negative font-mono tabular-nums whitespace-nowrap">
                {formatCurrency(d.remaining)}
              </p>
              <a
                href={`/debts/${d.groupId}`}
                className="bg-accent text-white text-xs px-3 py-1.5 rounded-sm font-medium hover:bg-accent/90 transition-colors whitespace-nowrap"
              >
                Thanh toán
              </a>
            </div>
          </div>
        ))}
      </Card>
    </div>
  )
}

function ZoneF() {
  const { data: txs, isLoading } = useRecentTransactions(5)
  const navigate = useNavigate()

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted uppercase tracking-wide">Gần đây</p>
        <a href="/transactions" className="text-xs text-accent hover:underline">Xem tất cả</a>
      </div>
      <Card padding="none">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-9 h-9 rounded-full bg-surface-2" />
                <div className="flex-1 space-y-1">
                  <div className="h-3 w-2/3 bg-surface-2 rounded" />
                  <div className="h-2 w-1/3 bg-surface-2 rounded" />
                </div>
                <div className="h-4 w-16 bg-surface-2 rounded" />
              </div>
            ))}
          </div>
        ) : txs && txs.length > 0 ? txs.map((tx, i) => (
          <div
            key={tx.id}
            className={`flex items-center gap-3 p-3 ${i < txs.length - 1 ? 'border-b border-border' : ''}`}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-base shrink-0"
              style={{ backgroundColor: `${tx.category?.color ?? '#94A3B8'}20` }}
            >
              {tx.category?.icon ?? '📦'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-primary truncate">{tx.category?.name ?? 'Giao dịch'}</p>
              {tx.note && <p className="text-2xs text-muted truncate">{tx.note}</p>}
            </div>
            <p className={`text-sm font-semibold font-mono tabular-nums whitespace-nowrap ${
              tx.type === 'INCOME' ? 'text-positive' : 'text-negative'
            }`}>
              {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount)}
            </p>
          </div>
        )) : (
          <div className="p-6 text-center text-sm text-muted">Chưa có giao dịch nào</div>
        )}
      </Card>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <div className="space-y-4">
      <ZoneA />
      <ZoneE />
      <ZoneF />
    </div>
  )
}
