/**
 * Summary tiles for the Debt Groups list page.
 * Mobile: 2 tiles side-by-side (Phải trả / Phải thu).
 * Desktop: 3 tiles (+ upcoming count).
 */
import { useTranslation } from 'react-i18next'
import { Amount } from '@/design-system'

interface DebtSummaryTilesProps {
  payable: number
  receivable: number
  upcomingCount: number
}

export function DebtSummaryTiles({ payable, receivable, upcomingCount }: DebtSummaryTilesProps) {
  const { t } = useTranslation()

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {/* Payable tile */}
      <div className="rounded-md border border-line bg-surface px-4 py-3">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted mb-1.5">
          {t('debt.payableSummary')}
        </p>
        <Amount
          value={payable}
          size={22}
          weight={700}
          style={{ color: 'var(--negative)' }}
        />
        <p className="text-[10px] text-muted mt-1">{t('debt.tilePayableHint')}</p>
      </div>

      {/* Receivable tile */}
      <div className="rounded-md border border-line bg-surface px-4 py-3">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted mb-1.5">
          {t('debt.receivableSummary')}
        </p>
        <Amount
          value={receivable}
          size={22}
          weight={700}
          style={{ color: 'var(--positive)' }}
        />
        <p className="text-[10px] text-muted mt-1">{t('debt.tileReceivableHint')}</p>
      </div>

      {/* Upcoming tile — desktop only */}
      <div className="hidden md:block rounded-md border border-line bg-surface px-4 py-3">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted mb-1.5">
          {t('debt.tileUpcomingLabel')}
        </p>
        <p className="text-[22px] font-bold tabular-nums text-warning leading-none">
          {upcomingCount}
        </p>
        <p className="text-[10px] text-muted mt-1">{t('debt.tileUpcomingHint')}</p>
      </div>
    </div>
  )
}
