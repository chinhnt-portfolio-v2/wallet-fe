import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useStatsByCategory } from '@/hooks/useStats'
import { CategoryDonut } from '@/components/stats/category-donut'
import { Amount } from '@/design-system'
import { ListSkeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'

/** Current month as "YYYY-MM" (local calendar). */
function currentPeriod(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

/** Shift a "YYYY-MM" period by N months. */
function shiftPeriod(period: string, delta: number): string {
  const [y, m] = period.split('-').map(Number)
  const d = new Date(y, m - 1 + delta, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export default function StatsPage() {
  const { t } = useTranslation()
  const [period, setPeriod] = useState(currentPeriod())
  const { data, isLoading, error } = useStatsByCategory(period)

  const rows = useMemo(() => (Array.isArray(data) ? data : []), [data])
  const total = useMemo(() => rows.reduce((s, r) => s + r.total, 0), [rows])
  const [year, month] = period.split('-')
  const atCurrentMonth = period >= currentPeriod()

  return (
    <div className="page-enter space-y-5">
      {/* Header */}
      <div>
        <p className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-muted mb-1">
          {t('stats.subtitle')}
        </p>
        <h1 className="text-xl font-extrabold tracking-[-0.02em] text-ink leading-none">
          {t('stats.title')}
        </h1>
      </div>

      {/* Month selector */}
      <div className="flex items-center justify-between bg-surface border border-line rounded-xl px-2 py-1.5">
        <button
          onClick={() => setPeriod((p) => shiftPeriod(p, -1))}
          aria-label={t('stats.prevMonth')}
          className="w-9 h-9 flex items-center justify-center rounded-lg text-sub hover:bg-hover transition-colors"
        >
          <ChevronLeft size={18} aria-hidden="true" />
        </button>
        <span className="text-[13px] font-bold text-ink tabular-nums">
          {t('stats.monthLabel', { month: Number(month), year })}
        </span>
        <button
          onClick={() => setPeriod((p) => shiftPeriod(p, 1))}
          disabled={atCurrentMonth}
          aria-label={t('stats.nextMonth')}
          className="w-9 h-9 flex items-center justify-center rounded-lg text-sub hover:bg-hover transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight size={18} aria-hidden="true" />
        </button>
      </div>

      {isLoading ? (
        <ListSkeleton rows={6} />
      ) : error ? (
        <EmptyState icon="⚠️" title={t('stats.loadError')} description={t('wallet.tryAgainLater')} />
      ) : rows.length === 0 ? (
        <EmptyState icon="📊" title={t('stats.empty')} description={t('stats.emptyDesc')} />
      ) : (
        <>
          {/* Donut + total */}
          <div className="bg-surface border border-line rounded-xl p-5">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.07em] text-muted">
              {t('stats.totalSpent')}
            </p>
            <div className="mt-1">
              <Amount value={total} size={28} weight={800} className="text-ink tabular-nums" />
            </div>
            <div className="mt-3">
              <CategoryDonut data={rows} ariaLabel={t('stats.byCategory')} />
            </div>
          </div>

          {/* Ranked list */}
          <div className="space-y-2">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.06em] text-muted">
              {t('stats.byCategory')}
            </p>
            <ul role="list" className="space-y-1.5">
              {rows.map((r) => (
                <li key={r.categoryId} className="bg-surface border border-line rounded-xl px-3.5 py-3">
                  <div className="flex items-center gap-3">
                    <span
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-base shrink-0"
                      style={{ background: `${r.color ?? '#94a3b8'}22` }}
                      aria-hidden="true"
                    >
                      {r.icon ?? '📦'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[13px] font-bold text-ink truncate">
                          {r.name ?? t('stats.uncategorized')}
                        </span>
                        <Amount value={r.total} size={14} weight={700} className="text-ink tabular-nums shrink-0" />
                      </div>
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-surface-2 overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${r.pct}%`, background: r.color ?? 'var(--primary)' }}
                          />
                        </div>
                        <span className="text-[11px] font-semibold text-muted tabular-nums w-9 text-right">
                          {r.pct}%
                        </span>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  )
}
