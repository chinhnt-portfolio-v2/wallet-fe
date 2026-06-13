import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronLeft } from 'lucide-react'
import { toast } from 'sonner'
import { useWallets } from '@/hooks/useWallets'
import { useCreateDebtGroup } from '@/hooks/useDebtGroups'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Amount, SectionLabel } from '@/design-system'
import { DebtTypePicker } from '@/components/debts/debt-type-picker'
import { ymdToInstant } from '@/lib/date-utils'
import type { CreateDebtGroupRequest, GroupType } from '@/types'

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

  const [title, setTitle]               = useState('')
  const [groupType, setGroupType]       = useState<CreateDebtGroupRequest['groupType']>('DEBT')
  const [totalAmount, setTotalAmount]   = useState('')
  const [walletId, setWalletId]         = useState<number | undefined>()
  const [counterparty, setCounterparty] = useState('')
  const [dueDate, setDueDate]           = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !totalAmount) { toast.error(t('debt.enterFullInfo')); return }
    if (parseFloat(totalAmount) <= 0) { toast.error(t('debt.amountMustBePositive')); return }

    const payload: CreateDebtGroupRequest = {
      title,
      groupType,
      totalAmount: parseFloat(totalAmount),
      walletId,
      counterparty: counterparty || undefined,
      dueDate: ymdToInstant(dueDate),
    }

    createDebtGroup.mutate(payload, {
      onSuccess: () => { toast.success(t('debt.created')); navigate('/debts') },
      onError: (err: Error) => toast.error(err.message ?? t('debt.loadError')),
    })
  }

  const submitDisabled = createDebtGroup.isPending || !title || !totalAmount

  return (
    <div className="page-enter space-y-5">
      {/* ── header ── */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted mb-1">
            {t('debt.subtitle')}
          </p>
          <h1 className="text-xl font-extrabold tracking-[-0.02em] text-ink leading-tight">
            {t('debt.newDebt')}
          </h1>
          <p className="text-[11px] text-sub mt-1">{t('debt.newDebtDesc')}</p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="mt-1 inline-flex items-center gap-1 text-[11px] font-extrabold text-sub hover:text-ink transition-colors uppercase tracking-[0.08em] shrink-0 min-h-[44px]"
        >
          <ChevronLeft size={14} />
          {t('common.back')}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* type picker */}
        <DebtTypePicker value={groupType} onChange={setGroupType} />

        {/* core fields */}
        <div className="rounded-md border border-line bg-surface px-4 py-4 space-y-4">
          <SectionLabel className="mb-1">{t('debt.details')}</SectionLabel>

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

          <div>
            <Input
              label={t('debt.totalAmount')}
              type="number"
              inputMode="decimal"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              placeholder="0"
              required
              className="tabular-nums"
            />
            {totalAmount && parseFloat(totalAmount) > 0 && (
              <p className="text-[11px] text-sub mt-1.5 flex items-center gap-1">
                <span className="text-muted">=</span>
                <Amount value={parseFloat(totalAmount)} size={11} />
              </p>
            )}
          </div>

          <Input
            label={groupType === 'LOAN_GIVEN' ? t('debt.counterpartyLoan') : t('debt.counterparty')}
            value={counterparty}
            onChange={(e) => setCounterparty(e.target.value)}
            placeholder={
              groupType === 'LOAN_GIVEN'
                ? t('debt.counterpartyPlaceholderLoan')
                : t('debt.counterpartyPlaceholderDebt')
            }
          />

          <Input
            label={t('debt.dueDateOptional')}
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        {/* wallet (optional) */}
        <div className="rounded-md border border-line bg-surface px-4 py-4 space-y-3">
          <SectionLabel className="mb-1">{t('debt.paymentWallet')}</SectionLabel>
          <Select
            value={walletId ?? ''}
            onChange={(e) => setWalletId(e.target.value ? Number(e.target.value) : undefined)}
            options={[
              { value: '', label: t('debt.noSelection') },
              ...(wallets?.map((w) => ({ value: String(w.id), label: `${w.icon} ${w.name}` })) ?? []),
            ]}
          />
          <p className="text-[11px] text-sub">{t('debt.paymentWalletHint')}</p>
        </div>

        {/* summary strip */}
        {title && totalAmount && parseFloat(totalAmount) > 0 && (
          <div className="rounded-md border border-line bg-surface-2 px-4 py-3 flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted mb-0.5">
                {t('debt.creating')}
              </p>
              <p className="text-[13px] font-semibold text-ink truncate max-w-[160px]">{title}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted mb-0.5">
                {t(TYPE_LABEL_KEY[groupType])}
              </p>
              <Amount
                value={parseFloat(totalAmount)}
                size={16}
                weight={600}
                style={{ color: groupType === 'LOAN_GIVEN' ? 'var(--positive)' : 'var(--negative)' }}
              />
            </div>
          </div>
        )}

        {/* submit */}
        <button
          type="submit"
          disabled={submitDisabled}
          className={`w-full h-11 rounded-md text-[12px] font-semibold uppercase tracking-[0.05em] transition-all ${
            submitDisabled
              ? 'bg-surface-2 text-muted border border-line cursor-not-allowed'
              : 'bg-primary text-primary-ink hover:bg-primary-hover shadow-button'
          }`}
        >
          {createDebtGroup.isPending ? t('common.processing') : t('debt.createDebtGroup')}
        </button>
      </form>
    </div>
  )
}
