import { useTranslation } from 'react-i18next'
import { useMonthlyComparison } from '@/hooks/useDashboard'
import { Amount, SectionLabel } from '@/design-system'
import { Card } from '@/components/ui/Card'
import { CashflowChart } from './cashflow-chart'

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  )
}

export function CashFlowCard() {
  const { t } = useTranslation()
  const { data: months, isLoading } = useMonthlyComparison(6)

  if (isLoading || !months || months.length === 0) return null

  const series = [...months].reverse()
  const totalIncome = series.reduce((s, m) => s + m.totalIncome, 0)
  const totalExpense = series.reduce((s, m) => s + m.totalExpense, 0)
  const reducedMotion = prefersReducedMotion()

  return (
    <div className="space-y-2">
      <SectionLabel right={t('dashboard.sixMonths')}>{t('dashboard.cashFlow')}</SectionLabel>
      <Card padding="none">
        <div className="px-4 pt-4 pb-1">
          {/* Legend with totals */}
          <div className="flex items-center gap-5 mb-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-positive shrink-0" aria-hidden="true" />
              <span className="text-[11px] font-bold text-sub">{t('transaction.incomeShort')}</span>
              <Amount
                value={totalIncome}
                size={12}
                weight={700}
                style={{ color: 'var(--positive)' }}
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-negative shrink-0" aria-hidden="true" />
              <span className="text-[11px] font-bold text-sub">{t('transaction.expenseShort')}</span>
              <Amount
                value={totalExpense}
                size={12}
                weight={700}
                style={{ color: 'var(--negative)' }}
              />
            </div>
          </div>

          <CashflowChart
            data={series}
            reducedMotion={reducedMotion}
            ariaLabel={t('dashboard.cashFlow')}
          />
        </div>
      </Card>
    </div>
  )
}
