import { useTranslation } from 'react-i18next'
import { Amount } from '@/design-system'
import type { Wallet } from '@/types'

function walletAccentColor(wallet: Wallet): string {
  if (wallet.color) return wallet.color
  const fallbacks: Record<string, string> = {
    CASH: '#16a34a', BANK: '#2f5bff', E_WALLET: '#db2777', POSTPAID: '#7c3aed',
    SAVINGS: '#0EA5E9', CREDIT: '#7c3aed',
  }
  return fallbacks[wallet.type] ?? '#64748B'
}

/**
 * Minh design wallet card.
 * Mobile: row with 3px left accent + icon chip + name/type + balance/note.
 * Desktop (lg): card with top accent + icon chip + name/type + balance.
 */
export function WalletCard({ wallet, onEdit }: { wallet: Wallet; onEdit: (w: Wallet) => void }) {
  const { t } = useTranslation()
  const accent = walletAccentColor(wallet)
  const isNegative = Number(wallet.balance) < 0
  const letter = (wallet.name.trim()[0] ?? '?').toUpperCase()

  return (
    <div
      className="relative group cursor-pointer"
      role="button"
      tabIndex={0}
      aria-label={t('wallet.editWalletAria', { name: wallet.name })}
      onClick={() => onEdit(wallet)}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onEdit(wallet)}
    >
      {/* ── Mobile list row ────────────────────────────────────── */}
      <div className="lg:hidden flex items-center gap-3 bg-surface border border-line border-l-[3px] rounded-lg px-3 py-3 hover:bg-hover transition-colors min-h-[60px]"
        style={{ borderLeftColor: accent }}
      >
        {/* Icon chip */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-base font-bold shrink-0"
          style={{ backgroundColor: `${accent}1a`, color: accent }}
          aria-hidden="true"
        >
          {wallet.icon || letter}
        </div>

        {/* Name + type */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-ink truncate">{wallet.name}</p>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.07em] text-muted mt-0.5">
            {t(`wallet.types.${wallet.type}`)}
          </p>
        </div>

        {/* Balance */}
        <div className="text-right shrink-0">
          <Amount
            value={Number(wallet.balance)}
            size={15}
            weight={800}
            className={isNegative ? 'text-negative' : 'text-ink'}
          />
        </div>
      </div>

      {/* ── Desktop card ───────────────────────────────────────── */}
      <div
        className="hidden lg:flex flex-col bg-surface border border-line border-t-[3px] rounded-xl p-4 hover:bg-hover transition-colors gap-3"
        style={{ borderTopColor: accent }}
      >
        {/* Top row: icon + type */}
        <div className="flex items-center justify-between">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-xl font-bold shrink-0"
            style={{ backgroundColor: `${accent}1a`, color: accent }}
            aria-hidden="true"
          >
            {wallet.icon || letter}
          </div>
          <span className="text-[10px] font-extrabold uppercase tracking-[0.07em] text-muted">
            {t(`wallet.types.${wallet.type}`)}
          </span>
        </div>

        {/* Name */}
        <p className="text-sm font-bold text-ink truncate mt-1">{wallet.name}</p>

        {/* Balance */}
        <Amount
          value={Number(wallet.balance)}
          size={21}
          weight={800}
          className={isNegative ? 'text-negative' : 'text-ink'}
        />

        {/* Edit button (hover reveal) */}
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(wallet) }}
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 focus:opacity-100 text-[10px] font-extrabold uppercase tracking-[0.07em] px-2 py-1 rounded-sm border border-line text-muted hover:text-ink hover:border-primary/40 transition-all"
          aria-label={t('wallet.editWalletAria', { name: wallet.name })}
          tabIndex={-1}
        >
          {t('common.edit')}
        </button>
      </div>
    </div>
  )
}
