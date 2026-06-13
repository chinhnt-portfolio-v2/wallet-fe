/**
 * Settlement form — amount input + source wallet select + confirm CTA.
 * Extracted from DebtGroupDetailPage to keep page ≤200 LOC.
 * Pure presentational: all state/mutation owned by parent.
 */
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import { Amount } from '@/design-system'
import { formatVndDigits } from '@/lib/utils'
import type { Wallet } from '@/types'

interface SettlementFormProps {
  remaining: number
  wallets: Wallet[] | undefined
  settleAmount: string
  settleWalletId: number | null
  isPending: boolean
  isReceivable: boolean
  onAmountChange: (v: string) => void
  onWalletChange: (id: number | null) => void
  onConfirm: () => void
  onCancel: () => void
}

export function SettlementForm({
  remaining,
  wallets,
  settleAmount,
  settleWalletId,
  isPending,
  isReceivable,
  onAmountChange,
  onWalletChange,
  onConfirm,
  onCancel,
}: SettlementFormProps) {
  const { t } = useTranslation()

  return (
    <div className="rounded-md border border-line bg-surface px-4 py-4 space-y-3">
      <p className="text-[11px] font-extrabold uppercase tracking-widest text-muted">
        {isReceivable ? t('debt.recordCollection') : t('debt.recordPayment')}
      </p>

      {/* amount */}
      <div>
        <label className="block text-[10px] font-extrabold uppercase tracking-widest text-muted mb-1.5">
          {t('debt.settleAmount')}
        </label>
        <input
          type="number"
          inputMode="decimal"
          value={settleAmount}
          onChange={(e) => onAmountChange(e.target.value)}
          placeholder={`Max ${formatVndDigits(remaining)}`}
          className="w-full rounded-sm border border-line bg-surface-2 px-3 py-2 text-sm text-ink tabular-nums placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
        {settleAmount && (
          <p className="text-[10px] text-muted mt-1">
            = <Amount value={parseFloat(settleAmount) || 0} size={10} />
          </p>
        )}
      </div>

      {/* wallet */}
      <div>
        <label className="block text-[10px] font-extrabold uppercase tracking-widest text-muted mb-1.5">
          {t('debt.settleFromWallet')}
        </label>
        <select
          value={settleWalletId ?? ''}
          onChange={(e) => onWalletChange(Number(e.target.value) || null)}
          className="w-full rounded-sm border border-line bg-surface-2 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        >
          <option value="">{t('debt.selectWalletAndAmount')}</option>
          {wallets?.map((w) => (
            <option key={w.id} value={w.id}>{w.icon} {w.name}</option>
          ))}
        </select>
      </div>

      {/* actions */}
      <div className="flex gap-2 pt-1">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          {t('common.cancel')}
        </Button>
        <Button
          onClick={onConfirm}
          disabled={isPending || !settleWalletId || !settleAmount}
          className="flex-1"
        >
          {isPending
            ? t('common.processing')
            : isReceivable
              ? t('debt.confirmCollection')
              : t('debt.confirmPayment')}
        </Button>
      </div>
    </div>
  )
}
