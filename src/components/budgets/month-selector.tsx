/**
 * Month navigation control: ‹ Tháng 6, 2026 ›
 * Touch-target ≥44px on nav buttons.
 */
import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface MonthSelectorProps {
  year: number
  month: number
  onPrev: () => void
  onNext: () => void
}

export function MonthSelector({ year, month, onPrev, onNext }: MonthSelectorProps) {
  const { t } = useTranslation()
  const label = `${t(`budget.months.${month}`)} ${year}`

  return (
    <div className="flex items-center justify-between bg-surface border border-line rounded-md px-3 py-1">
      <button
        onClick={onPrev}
        aria-label={t('budget.prevMonth')}
        className="flex items-center justify-center min-w-[44px] min-h-[44px] text-muted hover:text-ink transition-colors"
      >
        <ChevronLeft size={18} />
      </button>

      <p className="text-[12px] font-semibold text-ink tracking-[0.04em]">
        {label}
      </p>

      <button
        onClick={onNext}
        aria-label={t('budget.nextMonth')}
        className="flex items-center justify-center min-w-[44px] min-h-[44px] text-muted hover:text-ink transition-colors"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  )
}
