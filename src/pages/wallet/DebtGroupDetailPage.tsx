import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import { toast } from 'sonner'
import { useDebtGroup, useSettleDebt } from '@/hooks/useDebtGroups'
import { useWallets } from '@/hooks/useWallets'
import { useTransactions } from '@/hooks/useTransactions'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { DisplayAmount, Amount, SectionLabel, ProgressBar, Pill } from '@/design-system'
import { formatDate, isOverdue, formatVndDigits } from '@/lib/utils'
import { isReceivable, debtSettleKey, debtAmountColor } from '@/components/debts/debt-semantics'

function relDue(dateStr: string | null | undefined, t: TFunction): string {
  if (!dateStr) return '—'
  const diff = Math.round((new Date(dateStr).getTime() - Date.now()) / 86_400_000)
  if (diff < 0)  return t('debt.relOverdue', { days: Math.abs(diff) })
  if (diff === 0) return t('debt.relDueToday2')
  if (diff < 7)  return t('debt.relDueInDays', { days: diff })
  if (diff < 30) return t('debt.relDueInWeeks', { weeks: Math.round(diff / 7) })
  return t('debt.relDueInMonths', { months: Math.round(diff / 30) })
}

export default function DebtGroupDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()
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
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  if (!group) {
    return (
      <div className="text-center py-16 font-mono text-[12px] text-secondary">
        {t('debt.notFound')}
      </div>
    )
  }

  const remaining = Number(group.totalAmount) - Number(group.paidAmount)
  const progress  = Number(group.totalAmount) > 0
    ? Number(group.paidAmount) / Number(group.totalAmount)
    : 0
  const overdue = isOverdue(group.dueDate)
  // Direction semantics: receivables (loan given) are green + "Collect"; payables red + "Pay".
  const receivable = isReceivable(group.groupType)
  const accentColor = debtAmountColor(group.groupType)

  const handleSettle = () => {
    if (!settleWalletId || !settleAmount) {
      toast.error(t('debt.selectWalletAndAmount'))
      return
    }
    if (parseFloat(settleAmount) > remaining) {
      toast.error(t('debt.amountExceedsRemaining'))
      return
    }
    settleMutation.mutate(
      { amount: parseFloat(settleAmount), walletId: settleWalletId },
      {
        onSuccess: () => {
          toast.success(t('debt.settled'))
          setShowSettle(false)
          setSettleAmount('')
        },
        onError: (err: Error) => toast.error(err.message),
      }
    )
  }

  return (
    <div className="page-enter space-y-5">
      {/* ── back breadcrumb ── */}
      <button
        onClick={() => navigate(-1)}
        className="font-mono text-[11px] text-secondary hover:text-primary transition-colors uppercase tracking-[0.08em]"
      >
        ← {t('debt.title')}
      </button>

      {/* ── hero card ── */}
      <div
        className="rounded-sm border px-6 py-5"
        style={{
          background: `linear-gradient(135deg, ${accentColor}11, transparent)`,
          borderColor: `color-mix(in srgb, ${accentColor} 25%, transparent)`,
        }}
      >
        {/* eyebrow */}
        <div className="flex items-center gap-2 mb-4">
          <p className="font-mono text-[11px] uppercase tracking-widest text-secondary">
            {t(`debt.types.${group.groupType}`)}
          </p>
          <span
            className="font-mono text-[11px] uppercase tracking-[0.08em]"
            style={{ color: accentColor }}
          >
            · {receivable ? t('debt.directionReceivable') : t('debt.directionPayable')}
          </span>
          {overdue && (
            <span className="font-mono text-[11px] text-negative uppercase tracking-[0.08em]">
              · {t('debt.overdue')}
            </span>
          )}
        </div>

        {/* title */}
        <h2 className="font-sans text-base font-semibold text-primary mb-4">{group.title}</h2>

        {/* hero amount row */}
        <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-4 items-start">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-secondary mb-2">
              {receivable ? t('debt.toCollect') : t('debt.outstanding')}
            </p>
            <DisplayAmount value={remaining} size={40} />
          </div>

          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted mb-1.5">
              {t('debt.total')}
            </p>
            <Amount value={Number(group.totalAmount)} size={14} weight={500} />
          </div>

          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted mb-1.5">
              {t('debt.dueDate')}
            </p>
            <p className={`font-mono text-[13px] ${overdue ? 'text-negative' : 'text-primary'}`}>
              {relDue(group.dueDate, t)}
            </p>
            {group.dueDate && (
              <p className="font-mono text-[10px] text-faint mt-0.5">{formatDate(group.dueDate)}</p>
            )}
          </div>
        </div>

        {/* progress */}
        <div className="mt-5">
          <ProgressBar
            pct={progress}
            height={4}
            color={accentColor}
            background="var(--color-border)"
          />
          <div className="flex justify-between mt-1.5 font-mono text-[11px] text-secondary">
            <span>{receivable ? t('debt.collected', { pct: Math.round(progress * 100) }) : t('debt.paid', { pct: Math.round(progress * 100) })}</span>
            <span><Amount value={Number(group.paidAmount)} size={11} bare /> / <Amount value={Number(group.totalAmount)} size={11} bare />₫</span>
          </div>
        </div>

        {/* counterparty */}
        {group.counterparty && (
          <p className="mt-4 font-mono text-[11px] text-secondary">
            {t('debt.counterpartyLabel')} · <span className="text-primary">{group.counterparty}</span>
          </p>
        )}
      </div>

      {/* ── settle action ── */}
      {group.status === 'SETTLED' ? (
        <div className="rounded-sm border border-positive/30 bg-positive/5 px-4 py-3 text-center">
          <p className="font-mono text-[12px] text-positive uppercase tracking-widest">
            {receivable ? t('debt.collectedInFull') : t('debt.settledInFull')}
          </p>
        </div>
      ) : showSettle ? (
        <div className="rounded-sm border border-border bg-surface px-4 py-4 space-y-3">
          <p className="font-mono text-[11px] uppercase tracking-widest text-secondary">
            {receivable ? t('debt.recordCollection') : t('debt.recordPayment')}
          </p>

          <div>
            <label className="block font-mono text-[10px] uppercase tracking-widest text-muted mb-1.5">
              {t('debt.settleAmount')}
            </label>
            <input
              type="number"
              inputMode="decimal"
              value={settleAmount}
              onChange={(e) => setSettleAmount(e.target.value)}
              placeholder={`Max ${formatVndDigits(remaining)}`}
              className="w-full rounded-sm border border-border bg-surface-2 px-3 py-2 font-mono text-sm text-primary [color-scheme:dark] placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
            />
            {settleAmount && (
              <p className="font-mono text-[10px] text-muted mt-1">
                = <Amount value={parseFloat(settleAmount) || 0} size={10} />
              </p>
            )}
          </div>

          <div>
            <label className="block font-mono text-[10px] uppercase tracking-widest text-muted mb-1.5">
              {t('debt.settleFromWallet')}
            </label>
            <select
              value={settleWalletId ?? ''}
              onChange={(e) => setSettleWalletId(Number(e.target.value) || null)}
              className="w-full rounded-sm border border-border bg-surface-2 px-3 py-2 font-mono text-sm text-primary [color-scheme:dark] focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
            >
              <option value="">{t('debt.selectWalletAndAmount')}</option>
              {wallets?.map((w) => (
                <option key={w.id} value={w.id}>{w.icon} {w.name}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 pt-1">
            <Button variant="outline" onClick={() => setShowSettle(false)} className="flex-1">
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleSettle}
              disabled={settleMutation.isPending || !settleWalletId || !settleAmount}
              className="flex-1"
            >
              {settleMutation.isPending ? t('common.processing') : t('common.confirm')}
            </Button>
          </div>
        </div>
      ) : (
        <Pill
          accent
          onClick={() => setShowSettle(true)}
          className="w-full !h-11 !rounded-sm !text-[12px] justify-center cta-glow"
        >
          {t(debtSettleKey(group.groupType))}
        </Pill>
      )}

      {/* ── pay history ── */}
      <div>
        <SectionLabel right={t('debt.payHistoryEntries', { count: txs?.length ?? 0 })} className="mb-2">
          {t('debt.payHistory')}
        </SectionLabel>

        <div className="rounded-sm border border-border bg-surface overflow-hidden">
          {txs && txs.length > 0 ? txs.map((tx, i) => (
            <div
              key={tx.id}
              className={`flex items-center gap-3 px-4 py-3 ${i < txs.length - 1 ? 'border-b border-border' : ''}`}
            >
              {/* type glyph */}
              <span
                className="font-mono text-base shrink-0 w-4 text-center"
                style={{
                  color: tx.txnType === 'PRINCIPAL'
                    ? 'var(--color-negative)'
                    : 'var(--color-positive)',
                }}
              >
                {tx.txnType === 'PRINCIPAL' ? '◖' : '◗'}
              </span>

              {/* label + date */}
              <div className="flex-1">
                <p className="font-sans text-sm text-primary">
                  {tx.txnType === 'PRINCIPAL'    ? t('debt.txPrincipal')
                   : tx.txnType === 'FINAL_PAYMENT' ? t('debt.txFinalPayment')
                   : tx.txnType === 'INTEREST'    ? t('debt.txInterest')
                   : t('debt.txPayment')}
                </p>
                <p className="font-mono text-[10px] text-muted mt-0.5">{formatDate(tx.date)}</p>
              </div>

              {/* amount */}
              <Amount
                value={Number(tx.amount)}
                size={13}
                weight={500}
                sign
                style={{
                  color: tx.type === 'INCOME'
                    ? 'var(--color-positive)'
                    : 'var(--color-negative)',
                }}
              />
            </div>
          )) : (
            <div className="px-4 py-8 text-center font-mono text-[11px] text-faint uppercase tracking-widest">
              {t('debt.noPayHistory')}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
