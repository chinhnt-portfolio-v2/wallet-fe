import { useTranslation } from 'react-i18next'
import { isOverdue } from '@/lib/utils'
import { isReceivable } from './debt-semantics'
import { relDue } from './debt-row'
import type { DebtGroup } from '@/types'

/**
 * Compact "next due" strip (audit §2.4 — the old 28-day timeline band was too
 * dominant for the information it carried). Renders a slim horizontal list of
 * the nearest upcoming due items instead of a tall axis with a single dot.
 */
export function DebtTimeline({ items }: { items: DebtGroup[] }) {
  const { t } = useTranslation()
  if (items.length === 0) return null

  // Nearest-due first, cap at the 5 most imminent to keep the strip slim.
  const ordered = [...items]
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 5)

  return (
    <div className="rounded-sm border border-border bg-surface-2 px-4 py-2.5">
      <p className="font-mono text-[11px] uppercase tracking-widest text-secondary mb-2">
        {t('debt.upcomingPayments')}
      </p>
      <div className="flex gap-2 overflow-x-auto pb-0.5">
        {ordered.map((g) => {
          const late = isOverdue(g.dueDate)
          const collect = isReceivable(g.groupType)
          const dot = late
            ? 'var(--color-negative)'
            : collect
              ? 'var(--color-positive)'
              : 'var(--color-warning)'
          return (
            <a
              key={g.id}
              href={`/debts/${g.id}`}
              title={g.title}
              className="shrink-0 inline-flex items-center gap-1.5 rounded-full border border-border-hi bg-surface px-2.5 py-1 font-mono text-[11px] text-primary hover:border-accent/50 transition-colors"
            >
              <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: dot }} aria-hidden="true" />
              <span className="max-w-[110px] truncate">{g.title}</span>
              <span className={late ? 'text-negative' : 'text-secondary'}>· {relDue(g.dueDate, t)}</span>
            </a>
          )
        })}
      </div>
    </div>
  )
}
