import { useTranslation } from 'react-i18next'
import { isOverdue } from '@/lib/utils'
import { isReceivable } from './debt-semantics'
import { relDue } from './debt-row'
import type { DebtGroup } from '@/types'

/**
 * Compact "next due" strip — slim horizontal scroll of nearest upcoming
 * due items (up to 5). Each chip shows a colored status dot, title, rel-due.
 */
export function DebtTimeline({ items }: { items: DebtGroup[] }) {
  const { t } = useTranslation()
  if (items.length === 0) return null

  const ordered = [...items]
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 5)

  return (
    <div className="rounded-sm border border-line bg-surface-2 px-4 py-2.5">
      <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted mb-2">
        {t('debt.upcomingPayments')}
      </p>
      <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-none">
        {ordered.map((g) => {
          const late = isOverdue(g.dueDate)
          const collect = isReceivable(g.groupType)
          const dotColor = late ? 'var(--negative)' : collect ? 'var(--positive)' : 'var(--warning)'
          const textColor = late ? 'text-negative' : 'text-sub'

          return (
            <a
              key={g.id}
              href={`/debts/${g.id}`}
              title={g.title}
              className="shrink-0 inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-1 text-[11px] font-medium text-ink hover:border-primary/50 transition-colors min-h-[36px]"
            >
              <span
                className="inline-block w-1.5 h-1.5 rounded-full shrink-0"
                style={{ background: dotColor }}
                aria-hidden="true"
              />
              <span className="max-w-[110px] truncate">{g.title}</span>
              <span className={`shrink-0 ${textColor}`}>
                · {relDue(g.dueDate, t)}
              </span>
            </a>
          )
        })}
      </div>
    </div>
  )
}
