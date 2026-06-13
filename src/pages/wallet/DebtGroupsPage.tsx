import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDebtGroups } from '@/hooks/useDebtGroups'
import { CardSkeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { SegmentedControl } from '@/components/ui/segmented-control'
import { DebtRow } from '@/components/debts/debt-row'
import { DebtTimeline } from '@/components/debts/debt-timeline'
import { DebtEditModal } from '@/components/debts/debt-edit-modal'
import { isReceivable } from '@/components/debts/debt-semantics'
import { Amount, SectionLabel, Pill } from '@/design-system'
import type { DebtGroup, GroupType } from '@/types'

// Section grouping by type (payables first, receivables last).
const SECTION_ORDER: GroupType[] = ['PURCHASE_CREDIT', 'BNPL', 'DEBT', 'LOAN_GIVEN']
const SECTION_LABEL_KEY: Record<GroupType, string> = {
  PURCHASE_CREDIT: 'debt.kindCredit',
  BNPL:            'debt.descBnpl',
  DEBT:            'debt.kindFriend',
  LOAN_GIVEN:      'debt.kindLoanGiven',
}

export default function DebtGroupsPage() {
  const { t } = useTranslation()
  const [statusFilter, setStatusFilter] = useState('')
  const [editTarget, setEditTarget] = useState<DebtGroup | null>(null)

  const { data: groups, isLoading, error } = useDebtGroups(statusFilter || undefined)

  const openGroups = groups?.filter((g) => g.status !== 'SETTLED') ?? []

  // Split summary by direction — NEVER sum payable + receivable into one "owed".
  const remainingOf = (g: DebtGroup) => Number(g.totalAmount) - Number(g.paidAmount)
  const payable = openGroups
    .filter((g) => !isReceivable(g.groupType))
    .reduce((acc, g) => acc + remainingOf(g), 0)
  const receivable = openGroups
    .filter((g) => isReceivable(g.groupType))
    .reduce((acc, g) => acc + remainingOf(g), 0)

  // Upcoming items with a dueDate inside the next 28 days. `today` is a stable
  // session value via a lazy initializer (react-hooks/purity).
  const [today] = useState(() => Date.now())
  const upcoming = openGroups.filter((g) => {
    if (!g.dueDate) return false
    const diff = new Date(g.dueDate).getTime() - today
    return diff >= 0 && diff <= 28 * 86_400_000
  })

  const sections = SECTION_ORDER.map((type) => ({
    type,
    label: t(SECTION_LABEL_KEY[type]),
    items: openGroups.filter((g) => g.groupType === type),
  })).filter((s) => s.items.length > 0)

  const statusOptions = [
    { value: '',             label: t('debt.filterAll') },
    { value: 'OPEN,PARTIAL', label: t('debt.filterOpen') },
    { value: 'SETTLED',      label: t('debt.filterSettled') },
  ]

  return (
    <div className="page-enter space-y-5">
      {/* ── page header ── */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-widest text-secondary mb-1">
            {t('debt.subtitle')}
          </p>
          <h2 className="font-display italic text-2xl text-primary leading-tight">{t('debt.title')}</h2>
          {/* split summary: payable vs receivable, never summed */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1 font-mono text-[11px] text-secondary">
            <span>{t('debt.obligationsCount', { count: openGroups.length })}</span>
            {payable > 0 && (
              <span className="flex items-center gap-1">
                · {t('debt.payableSummary')} <Amount value={payable} size={11} style={{ color: 'var(--color-negative)' }} />
              </span>
            )}
            {receivable > 0 && (
              <span className="flex items-center gap-1">
                · {t('debt.receivableSummary')} <Amount value={receivable} size={11} style={{ color: 'var(--color-positive)' }} />
              </span>
            )}
          </div>
        </div>
        <a href="/debts/new" className="shrink-0 mt-1">
          <Pill accent className="cta-glow">+ {t('debt.addDebt')}</Pill>
        </a>
      </div>

      {/* ── slim "next due" strip ── */}
      <DebtTimeline items={upcoming} />

      {/* ── status filter ── */}
      <SegmentedControl
        options={statusOptions}
        value={statusFilter}
        onChange={setStatusFilter}
        ariaLabel={t('debt.filterAll')}
        className="w-full grid grid-cols-3"
      />

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
          action={<Pill accent onClick={() => window.location.reload()}>{t('common.retry')}</Pill>}
        />
      )}

      {/* ── empty ── */}
      {!isLoading && !error && openGroups.length === 0 && (
        <EmptyState
          icon="📒"
          title={t('debt.noDebtsRecorded')}
          description={t('debt.noDebtsDesc')}
          action={<a href="/debts/new"><Pill accent>+ {t('debt.addDebt')}</Pill></a>}
        />
      )}

      {/* ── grouped sections ── */}
      {!isLoading && !error && sections.map((sec) => (
        <div key={sec.type}>
          <SectionLabel right={t('debt.itemsCount', { count: sec.items.length })} className="mb-2">
            {sec.label}
          </SectionLabel>
          <div className="rounded-sm border border-border bg-surface overflow-hidden">
            {sec.items.map((g) => (
              <DebtRow key={g.id} group={g} onEdit={setEditTarget} />
            ))}
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
