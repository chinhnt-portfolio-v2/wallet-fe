import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useWallets } from '@/hooks/useWallets'
import { useCreateDebtGroup } from '@/hooks/useDebtGroups'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Amount, SectionLabel } from '@/design-system'
import { DebtTypePicker } from '@/components/debts/debt-type-picker'
import { ymdToInstant } from '@/lib/date-utils'
import type { CreateDebtGroupRequest, GroupType } from '@/types'

// groupType → summary-strip label key.
const TYPE_LABEL_KEY: Record<GroupType, string> = {
  PURCHASE_CREDIT: 'debt.kindCredit',
  BNPL:            'debt.kindBnpl',
  DEBT:            'debt.kindFriend',
  LOAN_GIVEN:      'debt.kindLoanGiven',
}

export default function CreateDebtGroupPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { data: wallets } = useWallets()
  const createDebtGroup = useCreateDebtGroup()

  const [title, setTitle]           = useState('')
  const [groupType, setGroupType]   = useState<CreateDebtGroupRequest['groupType']>('DEBT')
  const [totalAmount, setTotalAmount] = useState('')
  const [walletId, setWalletId]     = useState<number | undefined>()
  const [counterparty, setCounterparty] = useState('')
  const [dueDate, setDueDate]       = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !totalAmount) {
      toast.error(t('debt.enterFullInfo'))
      return
    }
    if (parseFloat(totalAmount) <= 0) {
      toast.error(t('debt.amountMustBePositive'))
      return
    }

    const payload: CreateDebtGroupRequest = {
      title,
      groupType,
      totalAmount: parseFloat(totalAmount),
      walletId,
      counterparty: counterparty || undefined,
      // F2: ISO instant so the backend date parse succeeds (no more 500).
      dueDate: ymdToInstant(dueDate),
    }

    createDebtGroup.mutate(payload, {
      onSuccess: () => {
        toast.success(t('debt.created'))
        navigate('/debts')
      },
      onError: (err: Error) => {
        toast.error(err.message ?? t('debt.loadError'))
      },
    })
  }

  const submitDisabled = createDebtGroup.isPending || !title || !totalAmount

  return (
    <div className="page-enter space-y-5">
      {/* ── page header ── */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-widest text-secondary mb-1">
            {t('debt.subtitle')}
          </p>
          <h2 className="font-display italic text-2xl text-primary leading-tight">{t('debt.newDebt')}</h2>
          <p className="font-mono text-[11px] text-secondary mt-1">
            {t('debt.newDebtDesc')}
          </p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="mt-1 font-mono text-[11px] text-secondary hover:text-primary transition-colors uppercase tracking-[0.08em] shrink-0"
        >
          ← {t('common.back')}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* ── type selector ── */}
        <DebtTypePicker value={groupType} onChange={setGroupType} />

        {/* ── core fields ── */}
        <div className="rounded-sm border border-border bg-surface px-4 py-4 space-y-4">
          <SectionLabel className="mb-1">{t('debt.details')}</SectionLabel>

          {/* title */}
          <Input
            label={t('debt.groupTitle')}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={
              groupType === 'BNPL'       ? t('debt.titlePlaceholderBnpl') :
              groupType === 'LOAN_GIVEN' ? t('debt.titlePlaceholderLoan') :
                                           t('debt.titlePlaceholderDebt')
            }
            required
          />

          {/* amount — uses the shared Input atom so all field labels read one way */}
          <div>
            <Input
              label={t('debt.totalAmount')}
              type="number"
              inputMode="decimal"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              placeholder="0"
              required
              className="font-mono"
            />
            {totalAmount && parseFloat(totalAmount) > 0 && (
              <p className="font-mono text-[11px] text-secondary mt-1.5 flex items-center gap-1">
                <span className="text-faint">=</span>
                <Amount value={parseFloat(totalAmount)} size={11} />
              </p>
            )}
          </div>

          {/* counterparty */}
          <Input
            label={groupType === 'LOAN_GIVEN' ? t('debt.counterpartyLoan') : t('debt.counterparty')}
            value={counterparty}
            onChange={(e) => setCounterparty(e.target.value)}
            placeholder={groupType === 'LOAN_GIVEN' ? t('debt.counterpartyPlaceholderLoan') : t('debt.counterpartyPlaceholderDebt')}
          />

          {/* due date */}
          <Input
            label={t('debt.dueDateOptional')}
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        {/* ── wallet (optional) ── */}
        <div className="rounded-sm border border-border bg-surface px-4 py-4 space-y-3">
          <SectionLabel className="mb-1">{t('debt.paymentWallet')}</SectionLabel>
          <Select
            value={walletId ?? ''}
            onChange={(e) => setWalletId(e.target.value ? Number(e.target.value) : undefined)}
            options={[
              { value: '', label: t('debt.noSelection') },
              ...(wallets?.map((w) => ({ value: String(w.id), label: `${w.icon} ${w.name}` })) ?? []),
            ]}
          />
          <p className="font-mono text-[11px] text-secondary">
            {t('debt.paymentWalletHint')}
          </p>
        </div>

        {/* ── summary strip ── */}
        {title && totalAmount && parseFloat(totalAmount) > 0 && (
          <div className="rounded-sm border border-border-hi bg-surface-2 px-4 py-3 flex items-center justify-between gap-4">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-widest text-secondary mb-0.5">
                {t('debt.creating')}
              </p>
              <p className="font-sans text-sm font-medium text-primary truncate max-w-[160px]">
                {title}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="font-mono text-[11px] uppercase tracking-widest text-secondary mb-0.5">
                {t(TYPE_LABEL_KEY[groupType])}
              </p>
              <Amount
                value={parseFloat(totalAmount)}
                size={16}
                weight={500}
                style={{ color: groupType === 'LOAN_GIVEN' ? 'var(--color-positive)' : 'var(--color-negative)' }}
              />
            </div>
          </div>
        )}

        {/* ── submit — clear enabled (lime fill + ink + glow) vs disabled (dim) ── */}
        <button
          type="submit"
          disabled={submitDisabled}
          className={`w-full h-11 rounded-sm font-mono text-[12px] uppercase tracking-[0.05em] transition-all ${
            submitDisabled
              ? 'bg-surface-2 text-faint border border-border cursor-not-allowed'
              : 'bg-accent text-accent-ink hover:brightness-105 cta-glow'
          }`}
        >
          {createDebtGroup.isPending ? t('common.processing') : t('debt.createDebtGroup')}
        </button>
      </form>
    </div>
  )
}
