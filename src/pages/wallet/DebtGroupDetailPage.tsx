import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useDebtGroup, useSettleDebt } from '@/hooks/useDebtGroups'
import { useWallets } from '@/hooks/useWallets'
import { useTransactions } from '@/hooks/useTransactions'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatCurrency, formatDate, isOverdue, GROUP_TYPE_LABEL } from '@/lib/utils'

export default function DebtGroupDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [showSettle, setShowSettle] = useState(false)
  const [settleAmount, setSettleAmount] = useState('')
  const [settleWalletId, setSettleWalletId] = useState<number | null>(null)

  const { data: group, isLoading: loadingGroup } = useDebtGroup(id!)
  const { data: wallets } = useWallets()
  const { data: txs } = useTransactions({ groupId: Number(id) })

  const settleMutation = useSettleDebt(id!)

  if (loadingGroup) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-24" />
        <Card padding="lg" className="space-y-4">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-10 w-full" />
        </Card>
      </div>
    )
  }

  if (!group) {
    return (
      <div className="text-center py-12 text-muted text-sm">
        Không tìm thấy nhóm nợ
      </div>
    )
  }

  const remaining = Number(group.totalAmount) - Number(group.paidAmount)
  const progress = Number(group.totalAmount) > 0
    ? (Number(group.paidAmount) / Number(group.totalAmount)) * 100
    : 0
  const overdue = isOverdue(group.dueDate)

  const handleSettle = () => {
    if (!settleWalletId || !settleAmount) {
      toast.error('Chọn ví và nhập số tiền')
      return
    }
    settleMutation.mutate(
      { amount: parseFloat(settleAmount), walletId: settleWalletId },
      {
        onSuccess: () => {
          toast.success('Đã thanh toán!')
          setShowSettle(false)
          setSettleAmount('')
        },
        onError: (err: Error) => toast.error(err.message),
      }
    )
  }

  return (
    <div className="space-y-4">
      <button
        onClick={() => navigate(-1)}
        className="btn-ghost text-sm px-2"
      >
        ← Quay lại
      </button>

      {/* Header card */}
      <Card padding="lg">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-primary">{group.title}</h2>
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            <Badge variant="neutral">{GROUP_TYPE_LABEL[group.groupType] ?? group.groupType}</Badge>
            {overdue && <Badge variant="negative">Quá hạn</Badge>}
          </div>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-2">
            <span className="text-muted">Đã thanh toán</span>
            <span className="font-medium text-positive">{progress.toFixed(0)}%</span>
          </div>
          <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-positive rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-2xs text-muted mt-1.5">
            <span>{formatCurrency(Number(group.paidAmount))} đã trả</span>
            <span>{formatCurrency(Number(group.totalAmount))} tổng</span>
          </div>
        </div>

        {/* Remaining */}
        <div className="text-center p-4 bg-surface-2 rounded-md">
          <p className="text-2xs text-muted uppercase tracking-wide">Còn phải trả</p>
          <p className="text-2xl font-bold text-negative font-mono tabular-nums mt-1">
            {formatCurrency(remaining)}
          </p>
          {group.dueDate && (
            <p className={`text-2xs mt-1.5 ${overdue ? 'text-negative' : 'text-muted'}`}>
              ⏰ Hết hạn: {formatDate(group.dueDate)}
            </p>
          )}
        </div>

        {group.counterparty && (
          <p className="mt-3 text-center text-xs text-muted">
            👤 {group.counterparty}
          </p>
        )}
      </Card>

      {/* Settle */}
      {showSettle ? (
        <Card className="space-y-3">
          <p className="text-sm font-medium text-primary">💳 Thanh toán nợ</p>
          <Input
            label="Số tiền thanh toán"
            type="number"
            value={settleAmount}
            onChange={(e) => setSettleAmount(e.target.value)}
            placeholder={`Tối đa ${formatCurrency(remaining)}`}
            hint={`Tương đương ${formatCurrency(parseFloat(settleAmount) || 0)}`}
          />
          <div>
            <label className="block text-xs font-medium text-secondary mb-1">Thanh toán từ ví</label>
            <select
              value={settleWalletId ?? ''}
              onChange={(e) => setSettleWalletId(Number(e.target.value) || null)}
              className="w-full rounded-sm border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
            >
              <option value="">Chọn ví...</option>
              {wallets?.map((w) => (
                <option key={w.id} value={w.id}>{w.icon} {w.name}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowSettle(false)} className="flex-1">
              Hủy
            </Button>
            <Button
              onClick={handleSettle}
              disabled={settleMutation.isPending || !settleWalletId || !settleAmount}
              className="flex-1"
            >
              {settleMutation.isPending ? 'Đang xử lý...' : 'Xác nhận'}
            </Button>
          </div>
        </Card>
      ) : group.status !== 'SETTLED' ? (
        <Button onClick={() => setShowSettle(true)} className="w-full py-3">
          💳 Thanh toán nợ
        </Button>
      ) : (
        <Card className="text-center">
          <p className="text-positive text-sm font-medium">✅ Đã thanh toán xong!</p>
        </Card>
      )}

      {/* Transaction history */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted uppercase tracking-wide">
          Lịch sử ({txs?.length ?? 0})
        </p>
        <Card padding="none">
          {txs && txs.length > 0 ? txs.map((tx, i) => (
            <div
              key={tx.id}
              className={`flex items-center gap-3 p-3 ${i < txs.length - 1 ? 'border-b border-border' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 ${
                tx.txnType === 'PRINCIPAL' ? 'bg-negative/10 text-negative' : 'bg-positive/10 text-positive'
              }`}>
                {tx.txnType === 'PRINCIPAL' ? '📋' : '✓'}
              </div>
              <div className="flex-1">
                <p className="text-sm text-primary">
                  {tx.txnType === 'PRINCIPAL' ? 'Phát sinh nợ'
                    : tx.txnType === 'FINAL_PAYMENT' ? 'Thanh toán cuối'
                    : tx.txnType === 'INTEREST' ? 'Lãi suất'
                    : 'Thanh toán'}
                </p>
                <p className="text-2xs text-muted">{formatDate(tx.date)}</p>
              </div>
              <p className={`text-sm font-semibold font-mono tabular-nums ${
                tx.type === 'INCOME' ? 'text-positive' : 'text-negative'
              }`}>
                {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(Number(tx.amount))}
              </p>
            </div>
          )) : (
            <div className="p-4 text-center text-xs text-muted">Chưa có giao dịch</div>
          )}
        </Card>
      </div>
    </div>
  )
}

