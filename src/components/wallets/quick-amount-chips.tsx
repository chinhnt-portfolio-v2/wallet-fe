import { useTranslation } from 'react-i18next'

const QUICK_AMOUNTS = [
  { key: 'transfer.quickAmount1m', value: 1_000_000 },
  { key: 'transfer.quickAmount2m', value: 2_000_000 },
  { key: 'transfer.quickAmount5m', value: 5_000_000 },
  { key: 'transfer.quickAmount10m', value: 10_000_000 },
] as const

interface QuickAmountChipsProps {
  current: number
  onSelect: (amount: number) => void
}

/**
 * Quick-select amount chips (1tr / 2tr / 5tr / 10tr).
 * Active chip gets bg-primary text-primary-ink; others get surface/border.
 * Each chip is ≥44px tall for WCAG touch targets.
 */
export function QuickAmountChips({ current, onSelect }: QuickAmountChipsProps) {
  const { t } = useTranslation()

  return (
    <div className="flex gap-2 justify-center flex-wrap" role="group" aria-label={t('transfer.quickAmountsAria')}>
      {QUICK_AMOUNTS.map(({ key, value }) => {
        const active = current === value
        return (
          <button
            key={value}
            type="button"
            onClick={() => onSelect(value)}
            aria-pressed={active}
            className={[
              'min-h-[44px] px-4 rounded-full text-[12px] font-bold transition-colors',
              active
                ? 'bg-primary text-primary-ink'
                : 'bg-surface border border-line text-sub hover:bg-hover',
            ].join(' ')}
          >
            {t(key)}
          </button>
        )
      })}
    </div>
  )
}
