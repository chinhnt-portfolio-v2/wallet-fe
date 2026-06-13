import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronLeft } from 'lucide-react'
import { toast } from 'sonner'
import { useDebtGroup, useSettleDebt } from '@/hooks/useDebtGroups'
import { useWallets } from '@/hooks/useWallets'
import { useTransactions } from '@/hooks/useTransactions'
import { Skeleton } from '@/components/ui/Skeleton'
import { DebtProgressRing } from '@/components/debts/debt-progress-ring'
import { SettlementForm } from '@/components/debts/settlement-form'
import { Amount, SectionLabel, Pill, ProgressBar } from '@/design-system'
import { formatDate, isOverdue } from '@/lib/utils'
import { isReceivable, debtSettleKey, debtAmountColor } from '@/components/debts/debt-semantics'
import { relDue } from '@/components/debts/debt-row'

export default function DebtGroupDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [showSettle, setShowSettle] = useState(false)
  const [settleAmount, setSettleAmount] = useState('')
  const [settleWalletId, setSettleWalletId] = useState<number | null>(null)

  const { data: group, isLoading } = useDebtGroup(id!)
  const { data: wallets } = useWallets()
  const { data: txs } = useTransactions({ groupId: Number(id) })
  const settleMutation = useSettleDebt(id!)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }
  if (!group) {
    return <div className="text-center py-16 text-[12px] text-sub">{t('debt.notFound')}</div>
  }

  const remaining = Number(group.totalAmount) - Number(group.paidAmount)
  const pct = Number(group.totalAmount) > 0
    ? Number(group.paidAmount) / Number(group.totalAmount)
    : 0
  const overdue = isOverdue(group.dueDate)
  const receivable = isReceivable(group.groupType)
  const accentColor = debtAmountColor(group.groupType)
  const ringColor = receivable ? 'var(--positive)' : 'var(--primary)'

  const handleSettle = () => {
    if (!settleWalletId || !settleAmount) { toast.error(t('debt.selectWalletAndAmount')); return }
    if (parseFloat(settleAmount) > remaining) { toast.error(t('debt.amountExceedsRemaining')); return }
    settleMutation.mutate(
      { amount: parseFloat(settleAmount), walletId: settleWalletId },
      {
        onSuccess: () => { toast.success(t('debt.settled')); setShowSettle(false); setSettleAmount('') },
        onError: (err: Error) => toast.error(err.message),
      }
    )
  }

  return (
    <div className="page-enter space-y-5">
      {/* back */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1 text-[11px] font-extrabold text-sub hover:text-ink transition-colors uppercase tracking-[0.08em]"
      >
        <ChevronLeft size={14} />
        {t('debt.title')}
      </button>

      {/* ── hero card: ring + stats ── */}
      <div className="rounded-md border border-line bg-surface px-5 py-5">
        <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start">
          {/* ring */}
          <DebtProgressRing
            pct={pct}
            size={120}
            color={ringColor}
            ariaLabel={`${receivable ? t('debt.collected', { pct: Math.round(pct * 100) }) : t('debt.paid', { pct: Math.round(pct * 100) })}`}
          />

          {/* stats */}
          <div className="flex-1 min-w-0 text-center sm:text-left">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted mb-1">
              {t(`debt.types.${group.groupType}`)}
              {overdue && (
                <span className="ml-2 text-negative">· {t('debt.overdue')}</span>
              )}
            </p>
            <h1 className="text-[15px] font-bold text-ink mb-3">{group.title}</h1>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-muted mb-1">
                  {receivable ? t('debt.collected', { pct: '' }).replace(' ', '') : t('debt.paid', { pct: '' }).replace(' ', '')}
                </p>
                <Amount value={Number(group.paidAmount)} size={14} weight={600}
                  style={{ color: 'var(--positive)' }} />
              </div>
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-muted mb-1">
                  {t('debt.remaining')}
                </p>
                <Amount value={remaining} size={14} weight={600} style={{ color: accentColor }} />
              </div>
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-muted mb-1">
                  {t('debt.total')}
                </p>
                <Amount value={Number(group.totalAmount)} size={14} weight={500} />
              </div>
            </div>

            <div className="mt-3">
              <ProgressBar pct={pct} height={4} color={ringColor} />
            </div>
          </div>
        </div>

        {/* meta row: due date + counterparty */}
        <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-line">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-muted mb-1">
              {t('debt.dueDate')}
            </p>
            <p className={`text-[13px] font-semibold tabular-nums ${overdue ? 'text-negative' : 'text-ink'}`}>
              {relDue(group.dueDate, t)}
            </p>
            {group.dueDate && (
              <p className="text-[10px] text-muted mt-0.5">{formatDate(group.dueDate)}</p>
            )}
          </div>
          {group.counterparty && (
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-muted mb-1">
                {t('debt.counterpartyLabel')}
              </p>
              <p className="text-[13px] font-semibold text-ink">{group.counterparty}</p>
            </div>
          )}
        </div>
      </div>

      {/* ── settle action ── */}
      {group.status === 'SETTLED' ? (
        <div className="rounded-md border border-positive/30 bg-positive-soft px-4 py-3 text-center">
          <p className="text-[11px] text-positive uppercase tracking-widest font-extrabold">
            {receivable ? t('debt.collectedInFull') : t('debt.settledInFull')}
          </p>
        </div>
      ) : showSettle ? (
        <SettlementForm
          remaining={remaining}
          wallets={wallets}
          settleAmount={settleAmount}
          settleWalletId={settleWalletId}
          isPending={settleMutation.isPending}
          isReceivable={receivable}
          onAmountChange={setSettleAmount}
          onWalletChange={setSettleWalletId}
          onConfirm={handleSettle}
          onCancel={() => setShowSettle(false)}
        />
      ) : (
        <Pill
          accent
          onClick={() => setShowSettle(true)}
          className="w-full !h-11 !rounded-md !text-[12px] justify-center"
        >
          {t(debtSettleKey(group.groupType))}
        </Pill>
      )}

      {/* ── payment history ── */}
      <div>
        <SectionLabel
          right={t('debt.payHistoryEntries', { count: txs?.length ?? 0 })}
          className="mb-2"
        >
          {t('debt.payHistory')}
        </SectionLabel>

        <div className="rounded-md border border-line bg-surface overflow-hidden">
          {txs && txs.length > 0 ? txs.map((tx, i) => (
            <div
              key={tx.id}
              className={`flex items-center gap-3 px-4 py-3 ${i < txs.length - 1 ? 'border-b border-line' : ''}`}
            >
              <span
                className="text-sm shrink-0 w-4 text-center"
                style={{ color: tx.txnType === 'PRINCIPAL' ? 'var(--negative)' : 'var(--positive)' }}
                aria-hidden="true"
              >
                {tx.txnType === 'PRINCIPAL' ? '↓' : '↑'}
              </span>
              <div className="flex-1">
                <p className="text-[13px] font-medium text-ink">
                  {tx.txnType === 'PRINCIPAL'     ? t('debt.txPrincipal')
                   : tx.txnType === 'FINAL_PAYMENT' ? t('debt.txFinalPayment')
                   : tx.txnType === 'INTEREST'      ? t('debt.txInterest')
                   : t('debt.txPayment')}
                </p>
                <p className="text-[10px] text-muted mt-0.5">{formatDate(tx.date)}</p>
              </div>
              <Amount
                value={Number(tx.amount)}
                size={13}
                weight={500}
                sign
                style={{ color: tx.type === 'INCOME' ? 'var(--positive)' : 'var(--negative)' }}
              />
            </div>
          )) : (
            <div className="px-4 py-8 text-center text-[10px] font-extrabold text-muted uppercase tracking-widest">
              {t('debt.noPayHistory')}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
