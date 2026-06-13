import { useTranslation } from 'react-i18next'
import { Amount, ProgressBar } from '@/design-system'
import type { Wallet } from '@/types'

// Wallet type → fallback accent colour when the wallet has no custom colour.
function walletAccentColor(wallet: Wallet): string {
  if (wallet.color) return wallet.color
  const fallbacks: Record<string, string> = {
    CASH: '#c8f53a', BANK: '#0EA5E9', E_WALLET: '#8B5CF6', POSTPAID: '#F97316',
  }
  return fallbacks[wallet.type] ?? '#64748B'
}

/**
 * Flat wallet card (audit §2.6). Editorial letter tile (wallet colour tint + first
 * letter) replaces the off-brand emoji, the balance is the prominent figure, and
 * the redundant name/type duplication is gone (type rendered once, smaller).
 */
export function WalletCard({ wallet, onEdit }: { wallet: Wallet; onEdit: (w: Wallet) => void }) {
  const { t } = useTranslation()
  const accent = walletAccentColor(wallet)
  const isPostpaid = wallet.type === 'POSTPAID'
  const spent = isPostpaid ? Math.abs(Math.min(0, Number(wallet.balance))) : 0
  const limit = 10_000_000 // wallet model has no limit field — display placeholder
  const utilPct = isPostpaid ? spent / limit : 0
  const letter = (wallet.name.trim()[0] ?? '?').toUpperCase()

  return (
    <div
      className="relative overflow-hidden rounded-lg border border-border bg-surface group cursor-pointer hover:border-border-hi transition-colors"
      style={{ backgroundImage: `linear-gradient(135deg, ${accent}12 0%, transparent 55%)` }}
    >
      <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ backgroundColor: accent }} />

      <div className="p-4 flex items-start gap-3">
        {/* letter tile — colour-tinted, editorial (no emoji) */}
        <div
          className="w-10 h-10 rounded flex items-center justify-center font-mono text-base font-semibold shrink-0"
          style={{ backgroundColor: `${accent}22`, color: accent }}
          aria-hidden="true"
        >
          {letter}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-sans text-[13px] font-medium text-primary truncate">{wallet.name}</p>
          <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-secondary mt-0.5">
            {t(`wallet.types.${wallet.type}`)}
          </p>

          {isPostpaid && (
            <div className="mt-2 space-y-1">
              <ProgressBar pct={utilPct} height={3} over={utilPct > 0.9} />
              <p className="font-mono text-[11px] text-secondary">
                {t('wallet.utilization', { pct: Math.round(utilPct * 100) })}
              </p>
            </div>
          )}
        </div>

        {/* balance — prominent figure */}
        <div className="text-right shrink-0">
          <Amount
            value={Number(wallet.balance)}
            size={18}
            weight={600}
            className={Number(wallet.balance) < 0 ? 'text-negative' : 'text-primary'}
          />
        </div>
      </div>

      <button
        onClick={() => onEdit(wallet)}
        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 focus:opacity-100 font-mono text-[11px] uppercase tracking-[0.08em] px-2 py-1 rounded border border-border-hi text-secondary hover:text-primary hover:border-accent/50 transition-all"
        aria-label={t('wallet.editWalletAria', { name: wallet.name })}
      >
        {t('common.edit')}
      </button>
    </div>
  )
}
