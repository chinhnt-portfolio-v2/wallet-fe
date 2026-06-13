import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDebtGroups } from '@/hooks/useDebtGroups'
import { CardSkeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { DebtRow } from '@/components/debts/debt-row'
import { DebtTimeline } from '@/components/debts/debt-timeline'
import { DebtEditModal } from '@/components/debts/debt-edit-modal'
import { DebtSummaryTiles } from '@/components/debts/debt-summary-tiles'
import { isReceivable } from '@/components/debts/debt-semantics'
import { SectionLabel, Pill } from '@/design-system'
import type { DebtGroup, GroupType } from '@/types'

const SECTION_ORDER: GroupType[] = ['PURCHASE_CREDIT', 'BNPL', 'DEBT', 'LOAN_GIVEN']
const SECTION_LABEL_KEY: Record<GroupType, string> = {
  PURCHASE_CREDIT: 'debt.kindCredit',
  BNPL:            'debt.descBnpl',
  DEBT:            'debt.kindFriend',
  LOAN_GIVEN:      'debt.kindLoanGiven',
}

const STATUS_OPTIONS = [
  { value: '',             labelKey: 'debt.filterAll' },
  { value: 'OPEN,PARTIAL', labelKey: 'debt.filterOpen' },
  { value: 'SETTLED',      labelKey: 'debt.filterSettled' },
]

export default function DebtGroupsPage() {
  const { t } = useTranslation()
  const [statusFilter, setStatusFilter] = useState('')
  const [editTarget, setEditTarget] = useState<DebtGroup | null>(null)

  const { data: groups, isLoading, error } = useDebtGroups(statusFilter || undefined)

  const openGroups = groups?.filter((g) => g.status !== 'SETTLED') ?? []

  const remainingOf = (g: DebtGroup) => Number(g.totalAmount) - Number(g.paidAmount)
  const payable = openGroups
    .filter((g) => !isReceivable(g.groupType))
    .reduce((acc, g) => acc + remainingOf(g), 0)
  const receivable = openGroups
    .filter((g) => isReceivable(g.groupType))
    .reduce((acc, g) => acc + remainingOf(g), 0)

  const [today] = useState(() => Date.now())
  const upcoming = openGroups.filter((g) => {
    if (!g.dueDate) return false
    const diff = new Date(g.dueDate).getTime() - today
    return diff >= 0 && diff <= 28 * 86_400_000
  })

  const sections = SECTION_ORDER.map((type) => ({
    type,
    label: t(SECTION_LABEL_KEY[type]),
    items: (groups ?? []).filter((g) => g.groupType === type),
  })).filter((s) => s.items.length > 0)

  return (
    <div className="page-enter space-y-5">
      {/* ── page header ── */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted mb-1">
            {t('debt.subtitle')}
          </p>
          <h1 className="text-xl font-extrabold tracking-[-0.02em] text-ink leading-tight">
            {t('debt.title')}
          </h1>
          <p className="text-[11px] text-sub mt-1">
            {t('debt.obligationsCount', { count: openGroups.length })}
          </p>
        </div>
        <a href="/debts/new" className="shrink-0 mt-1">
          <Pill accent>+ {t('debt.addDebt')}</Pill>
        </a>
      </div>

      {/* ── summary tiles ── */}
      <DebtSummaryTiles
        payable={payable}
        receivable={receivable}
        upcomingCount={upcoming.length}
      />

      {/* ── upcoming strip ── */}
      <DebtTimeline items={upcoming} />

      {/* ── status filter chips ── */}
      <div className="flex gap-2 flex-wrap" role="group" aria-label={t('debt.filterAll')}>
        {STATUS_OPTIONS.map(({ value, labelKey }) => (
          <button
            key={value}
            onClick={() => setStatusFilter(value)}
            className={`inline-flex items-center h-[44px] px-4 rounded-full text-[11px] font-semibold uppercase tracking-[0.06em] transition-colors border ${
              statusFilter === value
                ? 'bg-primary-soft text-primary border-primary/30'
                : 'bg-surface text-sub border-line hover:bg-hover'
            }`}
          >
            {t(labelKey)}
          </button>
        ))}
      </div>

      {/* ── loading ── */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <CardSkeleton key={i} />)}
        </div>
      )}

      {/* ── error ── */}
      {error && (
        <EmptyState
          icon="⚠️"
          title={t('debt.loadError')}
          description={t('wallet.tryAgainLater')}
          action={
            <Pill accent onClick={() => window.location.reload()}>
              {t('common.retry')}
            </Pill>
          }
        />
      )}

      {/* ── empty ── */}
      {!isLoading && !error && (groups ?? []).length === 0 && (
        <EmptyState
          icon="📒"
          title={t('debt.noDebtsRecorded')}
          description={t('debt.noDebtsDesc')}
          action={
            <a href="/debts/new">
              <Pill accent>+ {t('debt.addDebt')}</Pill>
            </a>
          }
        />
      )}

      {/* ── grouped sections ── */}
      {!isLoading && !error && sections.map((sec) => (
        <div key={sec.type}>
          <SectionLabel
            right={t('debt.itemsCount', { count: sec.items.length })}
            className="mb-2"
          >
            {sec.label}
          </SectionLabel>
          {/* desktop: 2-col grid of cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-3">
            {sec.items.map((g) =>
              /* mobile: border-grouped card; desktop: individual bordered cards */
              <div
                key={g.id}
                className="rounded-md border border-line bg-surface overflow-hidden"
              >
                <DebtRow group={g} onEdit={setEditTarget} />
              </div>
            )}
          </div>
        </div>
      ))}

      {/* ── edit modal ── */}
      {editTarget && (
        <DebtEditModal group={editTarget} onClose={() => setEditTarget(null)} />
      )}
    </div>
  )
}
