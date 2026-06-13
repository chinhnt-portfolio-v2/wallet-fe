import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useBudgetWithSpending } from '@/hooks/useBudgets'
import { Amount, SectionLabel, ProgressBar, CategoryChip } from '@/design-system'
import { Card } from '@/components/ui/Card'

export function BudgetAlerts() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const now = new Date()
  const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const { data: budgets } = useBudgetWithSpending(period)

  const atRisk = [...(budgets ?? [])]
    .filter((b) => b.status === 'exceeded' || b.status === 'warning')
    .sort((a, b) => (b.percentage ?? 0) - (a.percentage ?? 0))
    .slice(0, 3)

  if (atRisk.length === 0) return null

  return (
    <div className="space-y-2">
      <SectionLabel
        right={
          <button
            onClick={() => navigate('/budgets')}
            className="hover:text-primary transition-colors min-h-[44px] px-1 flex items-center"
          >
            {t('common.viewAll')} →
          </button>
        }
      >
        {t('dashboard.budgetWatch')}
      </SectionLabel>
      <Card padding="md">
        <div className="space-y-4">
          {atRisk.map((b) => {
            const exceeded = b.status === 'exceeded'
            return (
              <div key={b.id} className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <CategoryChip
                      cat={b.category?.name?.toLowerCase() ?? 'other'}
                      name={b.category?.name}
                      size={24}
                    />
                    <span className="text-sm font-medium text-ink truncate">
                      {b.category?.name ?? t('budget.category')}
                    </span>
                  </div>
                  <span
                    className={`text-[11px] font-bold tabular-nums shrink-0 ${
                      exceeded ? 'text-negative' : 'text-warning'
                    }`}
                  >
                    {Math.round(b.percentage ?? 0)}%
                  </span>
                </div>
                <ProgressBar
                  pct={(b.percentage ?? 0) / 100}
                  over={exceeded}
                  height={3}
                  color={exceeded ? 'var(--negative)' : 'var(--warning)'}
                />
                <div className="flex justify-between text-[10px] font-semibold text-muted">
                  <span>
                    <Amount value={b.currentSpent ?? 0} size={10} bare /> /{' '}
                    <Amount value={b.monthlyLimit} size={10} bare />
                  </span>
                  <span className={exceeded ? 'text-negative' : 'text-warning'}>
                    {exceeded ? t('dashboard.overBudget') : t('dashboard.nearLimit')}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
