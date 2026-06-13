import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useWallets } from '@/hooks/useWallets'
import { useTransfer } from '@/hooks/useTransfer'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { formatVndDigits } from '@/lib/utils'
import { Amount } from '@/design-system'
import { WalletSwapCard } from '@/components/wallets/wallet-swap-card'
import { QuickAmountChips } from '@/components/wallets/quick-amount-chips'
import type { Wallet } from '@/types'

// ── Info icon ────────────────────────────────────────────────
function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor"
      strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx={12} cy={12} r={9} />
      <line x1={12} y1={11} x2={12} y2={16} />
      <line x1={12} y1={8} x2={12} y2={8.01} />
    </svg>
  )
}

// ── Wallet picker sheet ───────────────────────────────────────
function WalletPickerSheet({
  open,
  onClose,
  wallets,
  excludeId,
  onSelect,
  title,
}: {
  open: boolean
  onClose: () => void
  wallets: Wallet[]
  excludeId: number | null
  onSelect: (id: number) => void
  title: string
}) {
  const { t } = useTranslation()
  const available = wallets.filter((w) => w.id !== excludeId)

  return (
    <BottomSheet open={open} onClose={onClose} title={title}>
      <div className="space-y-2 pb-2">
        {available.length === 0 && (
          <p className="text-[12px] text-muted text-center py-6">{t('transfer.noWalletsLeft')}</p>
        )}
        {available.map((w) => {
          const accent = w.color ?? '#64748B'
          return (
            <button
              key={w.id}
              type="button"
              onClick={() => { onSelect(w.id); onClose() }}
              className="w-full min-h-[56px] flex items-center gap-3 px-3 py-3 rounded-xl border border-line bg-surface hover:bg-hover transition-colors text-left"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                style={{ backgroundColor: `${accent}1a`, color: accent }}
                aria-hidden="true"
              >
                {w.icon || (w.name.trim()[0] ?? '?').toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-ink truncate">{w.name}</p>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.07em] text-muted mt-0.5">
                  {t(`wallet.types.${w.type}`)}
                </p>
              </div>
              <Amount value={Number(w.balance)} size={13} weight={700} className="text-ink tabular-nums shrink-0" />
            </button>
          )
        })}
      </div>
    </BottomSheet>
  )
}

// ── Page ─────────────────────────────────────────────────────
export default function TransferPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { data: wallets, isLoading } = useWallets()
  const transfer = useTransfer()

  const [fromId, setFromId] = useState<number | null>(null)
  const [toId, setToId] = useState<number | null>(null)
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [pickingFrom, setPickingFrom] = useState(false)
  const [pickingTo, setPickingTo] = useState(false)

  const activeWallets = wallets?.filter((w) => w.isActive) ?? []
  const fromWallet = activeWallets.find((w) => w.id === fromId)
  const toWallet = activeWallets.find((w) => w.id === toId)

  const sameWallet = fromId && toId && fromId === toId
  const parsedAmount = parseFloat(amount) || 0
  const overBalance = fromWallet ? parsedAmount > Number(fromWallet.balance) : false
  const canSubmit = (
    !transfer.isPending && fromId && toId && !sameWallet && parsedAmount > 0 && !overBalance
  )

  const handleSwap = () => {
    setFromId(toId)
    setToId(fromId)
  }

  const handleSubmit = () => {
    if (!fromId || !toId) { toast.error(t('transfer.selectFromTo')); return }
    if (sameWallet) { toast.error(t('transfer.sameWallet')); return }
    if (!amount || parsedAmount <= 0) { toast.error(t('transfer.enterValidAmount')); return }
    if (fromWallet && parsedAmount > Number(fromWallet.balance)) {
      toast.error(t('transfer.overBalance'))
      return
    }
    transfer.mutate(
      { fromWalletId: fromId, toWalletId: toId, amount: parsedAmount, note: note || undefined },
      {
        onSuccess: () => {
          toast.success(t('transfer.transferred'))
          navigate('/wallets')
        },
        onError: (err: Error) => toast.error(err.message),
      },
    )
  }

  return (
    <div className="page-enter space-y-5">
      {/* ── Back header (mobile sub-page style) ─────────────── */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-xl bg-surface border border-line flex items-center justify-center text-ink hover:bg-hover transition-colors shrink-0"
          aria-label={t('common.back')}
        >
          ←
        </button>
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.07em] text-muted">
            {t('transfer.subtitle')}
          </p>
          <h1 className="text-xl font-extrabold tracking-[-0.02em] text-ink leading-none">
            {t('transfer.title')}
          </h1>
        </div>
      </div>

      {/* ── Wallet swap card ─────────────────────────────────── */}
      {isLoading ? (
        <div className="space-y-2.5">
          <div className="h-24 rounded-xl bg-surface-2 animate-pulse" />
          <div className="h-24 rounded-xl bg-surface-2 animate-pulse" />
        </div>
      ) : (
        <WalletSwapCard
          fromWallet={fromWallet}
          toWallet={toWallet}
          onOpenFrom={() => setPickingFrom(true)}
          onOpenTo={() => setPickingTo(true)}
          onSwap={handleSwap}
        />
      )}

      {/* ── Amount section ───────────────────────────────────── */}
      <div className="space-y-3 text-center">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.07em] text-muted">
          {t('transfer.amount')}
        </p>

        {/* Big amount input */}
        <div className="relative">
          <div className="flex items-baseline justify-center gap-2">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={amount ? formatVndDigits(parsedAmount) : ''}
              onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))}
              className="bg-transparent text-[42px] font-extrabold tabular-nums tracking-[-0.03em] text-primary leading-none outline-none text-center w-full placeholder:text-muted/40"
              placeholder="0"
              aria-label={t('transfer.amountAria')}
            />
          </div>
          <span className="text-[18px] font-bold text-muted absolute right-4 top-1/2 -translate-y-1/2">₫</span>
        </div>

        {/* Over-balance warning */}
        {overBalance && (
          <p className="text-[11px] text-negative flex items-center justify-center gap-1.5">
            <span aria-hidden="true">▲</span>
            {t('transfer.overBalanceShort')}{' '}
            {fromWallet && (
              <Amount value={Number(fromWallet.balance)} size={11} className="text-negative" />
            )}
            {' '}{t('transfer.available')}
          </p>
        )}
        {fromWallet && parsedAmount > 0 && parsedAmount === Number(fromWallet.balance) && !overBalance && (
          <p className="text-[11px] text-muted">{t('transfer.transferAll')}</p>
        )}

        {/* Quick amount chips */}
        <QuickAmountChips
          current={parsedAmount}
          onSelect={(v) => setAmount(String(v))}
        />
      </div>

      {/* ── Note field ───────────────────────────────────────── */}
      <div className="space-y-2">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.06em] text-muted">
          {t('transfer.note')}
        </p>
        <Input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={t('transfer.notePlaceholder')}
        />
      </div>

      {/* ── Info banner "Tạo 1 chi + 1 thu" ─────────────────── */}
      {fromWallet && toWallet && (
        <div className="flex items-start gap-3 bg-primary-soft rounded-xl px-4 py-3">
          <span className="text-primary text-base mt-0.5 shrink-0">
            <InfoIcon />
          </span>
          <p className="text-[11.5px] font-semibold text-primary leading-snug">
            {t('transfer.infoBanner', { from: fromWallet.name, to: toWallet.name })}
          </p>
        </div>
      )}

      {/* ── Confirm button ───────────────────────────────────── */}
      <Button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="w-full h-14 text-[15px] font-extrabold rounded-xl shadow-button"
      >
        {transfer.isPending
          ? t('transfer.transferring')
          : parsedAmount > 0
            ? t('transfer.confirmWithAmount', { amount: formatVndDigits(parsedAmount) })
            : t('transfer.confirmTransfer')}
      </Button>

      {/* ── Wallet picker sheets ─────────────────────────────── */}
      <WalletPickerSheet
        open={pickingFrom}
        onClose={() => setPickingFrom(false)}
        wallets={activeWallets}
        excludeId={toId}
        onSelect={(id) => {
          setFromId(id)
          if (toId === id) setToId(null)
        }}
        title={t('transfer.from')}
      />
      <WalletPickerSheet
        open={pickingTo}
        onClose={() => setPickingTo(false)}
        wallets={activeWallets}
        excludeId={fromId}
        onSelect={setToId}
        title={t('transfer.to')}
      />
    </div>
  )
}
