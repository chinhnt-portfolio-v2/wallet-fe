import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Amount } from '@/design-system'
import type { Wallet } from '@/types'

// ── Swap icon SVG ─────────────────────────────────────────────
function SwapIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M7 4v15" />
      <path d="M4 7l3-3 3 3" />
      <path d="M17 20V5" />
      <path d="M14 17l3 3 3-3" />
    </svg>
  )
}

// ── Single wallet selector card (From or To) ──────────────────
function WalletPickerCard({
  role,
  wallet,
  onOpen,
}: {
  role: 'from' | 'to'
  wallet: Wallet | undefined
  onOpen: () => void
}) {
  const { t } = useTranslation()
  const label = role === 'from' ? t('transfer.from') : t('transfer.to')
  const accent = wallet?.color ?? '#64748B'

  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full bg-surface border border-line rounded-xl p-4 text-left hover:bg-hover transition-colors"
      aria-label={`${label}: ${wallet ? wallet.name : t('transfer.selectWalletPlaceholder')}`}
    >
      <p className="text-[10px] font-extrabold uppercase tracking-[0.06em] text-muted mb-2.5">
        {label}
      </p>
      {wallet ? (
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
            style={{ backgroundColor: `${accent}1a`, color: accent }}
            aria-hidden="true"
          >
            {wallet.icon || (wallet.name.trim()[0] ?? '?').toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-ink truncate">{wallet.name}</p>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.07em] text-muted mt-0.5">
              {t(`wallet.types.${wallet.type}`)}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[10px] font-semibold text-muted mb-0.5">{t('transfer.balanceLabel')}</p>
            <Amount value={Number(wallet.balance)} size={13} weight={600} className="text-ink tabular-nums" />
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-surface-2 border border-line flex items-center justify-center text-muted text-lg shrink-0">
            +
          </div>
          <p className="text-sm font-semibold text-muted">{t('transfer.selectWalletPlaceholder')}</p>
        </div>
      )}
    </button>
  )
}

// ── WalletSwapCard ────────────────────────────────────────────
// Renders: [From card] [swap button overlapping the gap] [To card]
// Swap button rotates 180° on press.
export interface WalletSwapCardProps {
  fromWallet: Wallet | undefined
  toWallet: Wallet | undefined
  onOpenFrom: () => void
  onOpenTo: () => void
  onSwap: () => void
}

export function WalletSwapCard({
  fromWallet,
  toWallet,
  onOpenFrom,
  onOpenTo,
  onSwap,
}: WalletSwapCardProps) {
  const { t } = useTranslation()
  const [rotated, setRotated] = useState(false)

  const handleSwap = () => {
    setRotated((r) => !r)
    onSwap()
  }

  return (
    <div className="relative">
      <WalletPickerCard role="from" wallet={fromWallet} onOpen={onOpenFrom} />

      {/* Overlapping swap button — centered between the two cards */}
      <div className="relative h-2.5">
        <button
          type="button"
          onClick={handleSwap}
          aria-label={t('transfer.swapWalletsAria')}
          className={[
            'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10',
            'w-10 h-10 rounded-xl bg-primary text-primary-ink border-[3px] border-bg',
            'flex items-center justify-center text-lg',
            'hover:bg-primary-hover transition-all duration-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
            rotated ? 'rotate-180' : 'rotate-0',
          ].join(' ')}
          style={{ transition: 'background 0.15s ease, transform 0.2s ease' }}
        >
          <SwapIcon />
        </button>
      </div>

      <WalletPickerCard role="to" wallet={toWallet} onOpen={onOpenTo} />
    </div>
  )
}
