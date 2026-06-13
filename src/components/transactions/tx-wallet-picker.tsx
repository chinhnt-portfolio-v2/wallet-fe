import { useTranslation } from 'react-i18next'
import { Card } from '@/components/ui/Card'

interface Wallet {
  id: number
  name: string
  icon: string
  color: string
  type: string
}

interface TxWalletPickerProps {
  wallets: Wallet[]
  loading: boolean
  selectedId: number | null
  onSelect: (id: number) => void
}

/**
 * Horizontal scrolling wallet picker chips.
 * Selected: border-primary bg-primary-soft ring-primary/20.
 * Touch target: min-h-[44px].
 */
export function TxWalletPicker({ wallets, loading, selectedId, onSelect }: TxWalletPickerProps) {
  const { t } = useTranslation()

  if (loading) {
    return (
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex-shrink-0 w-32 h-12 rounded-lg bg-surface-2 animate-pulse" />
        ))}
      </div>
    )
  }

  if (!wallets || wallets.length === 0) {
    return (
      <Card className="p-4 text-center">
        <p className="text-sm font-medium text-muted">{t('transaction.noWalletLink')}</p>
        <a href="/wallets" className="text-[11px] text-primary hover:underline mt-1 block">
          {t('transaction.createWalletLink')} →
        </a>
      </Card>
    )
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
      {wallets.map((w) => {
        const sel = selectedId === w.id
        return (
          <button
            key={w.id}
            type="button"
            onClick={() => onSelect(w.id)}
            aria-pressed={sel}
            aria-label={t('wallet.selectWalletAria', { name: w.name })}
            className={`min-h-[44px] flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors text-xs font-medium ${
              sel
                ? 'border-primary bg-primary-soft text-primary ring-1 ring-primary/20'
                : 'border-line bg-surface text-sub hover:bg-hover'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-[3px] shrink-0" style={{ background: w.color }} />
            <span>{w.name}</span>
            <span className="text-[10px] text-muted">{t(`wallet.types.${w.type}`)}</span>
            {sel && <span className="text-[11px] text-primary" aria-hidden="true">✓</span>}
          </button>
        )
      })}
    </div>
  )
}
