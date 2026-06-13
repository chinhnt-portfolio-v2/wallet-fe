import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useOpenDebts } from '@/hooks/useDashboard'
import { checkDueDebts } from '@/lib/notifications'
import { Amount, SectionLabel, Pill } from '@/design-system'
import { Card } from '@/components/ui/Card'
import { isReceivable, debtActionKey } from '@/components/debts/debt-semantics'

export function OpenDebts() {
  const { t, i18n } = useTranslation()
  const { data: debts, isLoading } = useOpenDebts()
  const navigate = useNavigate()

  useEffect(() => {
    if (debts && debts.length > 0) {
      checkDueDebts(
        debts.map((d) => ({
          id: d.groupId,
          title: d.title,
          dueDate: d.dueDate,
          remaining: d.remaining,
        })),
      )
    }
  }, [debts])

  if (isLoading || !debts || debts.length === 0) return null
  const visible = debts.slice(0, 3)

  return (
    <div className="space-y-2">
      <SectionLabel
        right={
          <button
            onClick={() => navigate('/debts')}
            className="hover:text-primary transition-colors min-h-[44px] px-1 flex items-center"
          >
            {t('common.viewAll')} →
          </button>
        }
      >
        {t('dashboard.openDebts')}
      </SectionLabel>
      <Card padding="none">
        {visible.map((d, i) => (
          <div
            key={d.groupId}
            className={`flex items-center gap-3 p-3 hover:bg-hover transition-colors ${
              i < visible.length - 1 ? 'border-b border-line' : ''
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                d.isOverdue ? 'bg-negative' : 'bg-warning'
              }`}
              aria-hidden="true"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ink truncate">{d.title}</p>
              <p className="text-[10px] font-semibold text-muted mt-0.5 truncate">
                {d.walletName}
                {d.dueDate && (
                  <span className={d.isOverdue ? ' text-negative' : ''}>
                    {' · '}
                    {t('dashboard.due', {
                      date: new Date(d.dueDate).toLocaleDateString(
                        i18n.language === 'vi' ? 'vi-VN' : 'en-US',
                        { month: 'short', day: 'numeric' },
                      ),
                    })}
                  </span>
                )}
              </p>
            </div>
            <Amount
              value={d.remaining}
              size={13}
              weight={600}
              style={{
                color: isReceivable(d.groupType) ? 'var(--positive)' : 'var(--negative)',
              }}
            />
            <Pill onClick={() => navigate(`/debts/${d.groupId}`)}>
              {t(debtActionKey(d.groupType))}
            </Pill>
          </div>
        ))}
      </Card>
    </div>
  )
}
