import { useTranslation } from 'react-i18next'

interface DateRangePanelProps {
  dateFrom: string
  dateTo: string
  onChange: (from: string, to: string) => void
}

export function DateRangePanel({ dateFrom, dateTo, onChange }: DateRangePanelProps) {
  const { t } = useTranslation()
  return (
    <div className="pt-3 pb-4 border-b border-line">
      <p className="text-[10px] font-extrabold uppercase tracking-[0.07em] text-muted mb-2">
        {t('transaction.dateRange')}
      </p>
      <div className="flex gap-2">
        <input type="date" value={dateFrom}
          onChange={(e) => onChange(e.target.value, dateTo)}
          className="input text-xs flex-1" title={t('transaction.fromDate')} />
        <span className="text-muted self-center text-xs">–</span>
        <input type="date" value={dateTo}
          onChange={(e) => onChange(dateFrom, e.target.value)}
          className="input text-xs flex-1" title={t('transaction.toDate')} />
      </div>
    </div>
  )
}

interface DateGroupHeaderProps {
  label: string
  /** Net amount for the day — positive = net income, negative = net expense */
  total: number
}

export function DateGroupHeader({ label, total }: DateGroupHeaderProps) {
  const { t } = useTranslation()
  const isPositive = total >= 0
  return (
    <div className="flex items-center justify-between py-2 px-1 border-b border-line mt-3 first:mt-0">
      <span className="text-[10px] font-extrabold uppercase tracking-[0.07em] text-muted">{label}</span>
      <span className={`text-[11px] font-semibold tabular-nums ${isPositive ? 'text-positive' : 'text-negative'}`}>
        {isPositive ? '+' : '−'}{Math.abs(total).toLocaleString('vi-VN')}
        <span className="text-muted ml-0.5">{t('common.currency')}</span>
      </span>
    </div>
  )
}
