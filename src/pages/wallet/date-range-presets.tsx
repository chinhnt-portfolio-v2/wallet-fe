import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

export interface Preset {
  labelKey: string
  days: number | null
  key: string
}

export const PRESETS: Preset[] = [
  { labelKey: 'export.presetAll',       days: null, key: 'all'        },
  { labelKey: 'export.preset7d',        days: 7,    key: '7d'         },
  { labelKey: 'export.preset30d',       days: 30,   key: '30d'        },
  { labelKey: 'export.preset90d',       days: 90,   key: '90d'        },
  { labelKey: 'export.presetThisMonth', days: null, key: 'this-month' },
  { labelKey: 'export.presetLastMonth', days: null, key: 'last-month' },
]

export function getDateRange(key: string): { from: string; to: string } | null {
  const to = new Date()
  const toStr = to.toISOString().split('T')[0]

  switch (key) {
    case 'all': return null
    case '7d': {
      const d = new Date(); d.setDate(d.getDate() - 7)
      return { from: d.toISOString().split('T')[0], to: toStr }
    }
    case '30d': {
      const d = new Date(); d.setDate(d.getDate() - 30)
      return { from: d.toISOString().split('T')[0], to: toStr }
    }
    case '90d': {
      const d = new Date(); d.setDate(d.getDate() - 90)
      return { from: d.toISOString().split('T')[0], to: toStr }
    }
    case 'this-month': {
      const from = new Date(to.getFullYear(), to.getMonth(), 1).toISOString().split('T')[0]
      return { from, to: toStr }
    }
    case 'last-month': {
      const lastMonth = new Date(to.getFullYear(), to.getMonth() - 1, 1)
      const from = lastMonth.toISOString().split('T')[0]
      const toPrev = new Date(to.getFullYear(), to.getMonth(), 0).toISOString().split('T')[0]
      return { from, to: toPrev }
    }
    default: return null
  }
}

/** Render ISO yyyy-mm-dd as dd/mm/yyyy. */
export function fmtDateRange(iso: string): string {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

interface DateRangePresetsProps {
  selected: string
  onSelect: (key: string) => void
  range: { from: string; to: string } | null
}

export function DateRangePresets({ selected, onSelect, range }: DateRangePresetsProps) {
  const { t } = useTranslation()

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {PRESETS.map((p) => {
          const active = selected === p.key
          return (
            <button
              key={p.key}
              type="button"
              onClick={() => onSelect(p.key)}
              aria-pressed={active}
              className={cn(
                'py-3 text-[11px] font-semibold uppercase tracking-wide rounded-xl border transition-all min-h-[44px]',
                active
                  ? 'border-primary bg-primary-soft text-primary'
                  : 'border-line bg-surface text-muted hover:bg-hover hover:text-sub',
              )}
            >
              {t(p.labelKey)}
            </button>
          )
        })}
      </div>

      {range && (
        <p className="text-xs text-muted">
          {fmtDateRange(range.from)} → {fmtDateRange(range.to)}
        </p>
      )}
    </div>
  )
}
