import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ExternalLink } from 'lucide-react'
import { WishlistItemCard } from '@/components/wishlist/wishlist-item-card'
import { WishlistForm } from '@/components/wishlist/wishlist-form'
import { useWishlistItems } from '@/hooks/use-wishlist'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { SegmentedControl } from '@/components/ui/segmented-control'
import { SectionLabel, Amount, Pill, ProgressBar } from '@/design-system'
import { formatCurrency } from '@/lib/utils'
import type { WishlistItem, WishlistStatus, WishlistPriority } from '@/types'

type Tab = WishlistStatus

// Top-stripe accent colors per card slot (cycles)
const GOAL_ACCENTS = ['#2f5bff', '#5fb7ff', '#ff8ab6', '#e8c87a']

// Priority → Minh semantic pill style. CAO=negative, TRUNG BÌNH=warning, THẤP=primary.
const PRIORITY_PILL: Record<WishlistPriority, { className: string; labelKey: string }> = {
  HIGH:   { className: 'bg-negative-soft text-negative',  labelKey: 'wishlist.priorityHigh' },
  MEDIUM: { className: 'bg-warning-soft text-warning',    labelKey: 'wishlist.priorityMedium' },
  LOW:    { className: 'bg-primary-soft text-primary',    labelKey: 'wishlist.priorityLow' },
}

// ── Goal card (SAVING tab) ────────────────────────────────────────────────
function GoalCard({ item, accent, onEdit }: { item: WishlistItem; accent: string; onEdit: () => void }) {
  const { t } = useTranslation()
  const price = item.estimatedPrice ?? 0
  const pill = PRIORITY_PILL[item.priority]

  return (
    <button
      onClick={onEdit}
      className="group bg-surface border border-line rounded-md text-left w-full hover:shadow-pop transition-all overflow-hidden"
    >
      {/* Top color stripe */}
      <div className="h-1 w-full" style={{ background: accent }} aria-hidden="true" />

      <div className="p-4 space-y-3">
        {/* Name + priority pill */}
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-bold text-ink leading-tight line-clamp-2 flex-1">
            {item.name}
          </span>
          <span className={`shrink-0 text-[10px] font-extrabold uppercase tracking-[0.07em] px-1.5 py-0.5 rounded-sm ${pill.className}`}>
            {t(pill.labelKey)}
          </span>
        </div>

        {/* Target price */}
        {price > 0 ? (
          <Amount value={price} size={15} weight={700} className="text-ink tabular-nums" />
        ) : (
          <span className="text-[10px] font-semibold text-muted">{t('wishlist.noTargetPrice')}</span>
        )}

        {/* Progress bar placeholder (no savedAmount from API) */}
        {price > 0 && (
          <ProgressBar pct={0} height={4} />
        )}

        {/* Meta: deadline + product URL */}
        <div className="flex items-center justify-between text-[10px] font-semibold text-muted">
          <span>
            {item.targetDate
              ? t('wishlist.deadline', { date: new Date(item.targetDate).toLocaleDateString('vi-VN') })
              : t('wishlist.noDeadline')}
          </span>
          {item.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t('wishlist.productLinkAria', { name: item.name })}
              onClick={(e) => e.stopPropagation()}
              className="text-primary hover:text-primary-hover transition-colors"
            >
              <ExternalLink size={12} strokeWidth={2.2} />
            </a>
          )}
        </div>
      </div>
    </button>
  )
}

// ── Desktop summary tiles ─────────────────────────────────────────────────
function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface border border-line rounded-md p-4">
      <p className="text-[10px] font-extrabold uppercase tracking-[0.07em] text-muted mb-1">{label}</p>
      <p className="text-base font-extrabold text-ink tabular-nums">{value}</p>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────
export default function WishlistPage() {
  const { t } = useTranslation()
  const [tab,      setTab]      = useState<Tab>('SAVING')
  const [formOpen, setFormOpen] = useState(false)
  const [editing,  setEditing]  = useState<WishlistItem | null>(null)

  const { data: items, isLoading } = useWishlistItems(tab)

  function openCreate() { setEditing(null); setFormOpen(true) }
  function openEdit(item: WishlistItem) { setEditing(item); setFormOpen(true) }

  const savingItems = items ?? []

  // Desktop summary stats for SAVING tab
  const totalValue  = savingItems.reduce((s, i) => s + (i.estimatedPrice ?? 0), 0)

  return (
    <div className="page-enter space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.07em] text-muted mb-0.5">
            {t('wishlist.subtitle')}
          </p>
          <h1 className="text-xl font-extrabold tracking-[-0.02em] text-ink leading-tight">
            {t('wishlist.title')}
          </h1>
        </div>
        <Pill accent onClick={openCreate} className="min-h-[44px]">
          + {t('wishlist.add')}
        </Pill>
      </div>

      {/* Desktop summary tiles — only on SAVING tab with data */}
      {!isLoading && tab === 'SAVING' && savingItems.length > 0 && (
        <div className="hidden md:grid md:grid-cols-3 gap-3">
          <SummaryTile
            label={t('wishlist.summaryCount')}
            value={t('wishlist.goalsCount', { count: savingItems.length })}
          />
          <SummaryTile
            label={t('wishlist.summaryTotal')}
            value={formatCurrency(totalValue)}
          />
          <SummaryTile
            label={t('wishlist.summarySaved')}
            value={formatCurrency(0)}
          />
        </div>
      )}

      {/* Tabs */}
      <SegmentedControl
        options={[
          { value: 'SAVING',    label: t('wishlist.saving') },
          { value: 'PURCHASED', label: t('wishlist.purchased') },
          { value: 'CANCELLED', label: t('wishlist.cancelled') },
        ]}
        value={tab}
        onChange={(v) => setTab(v as Tab)}
        ariaLabel={t('wishlist.title')}
        className="w-full grid grid-cols-3"
      />

      {/* Loading skeletons */}
      {isLoading && (
        <div className="grid grid-cols-2 md:grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-surface border border-line rounded-md overflow-hidden">
              <Skeleton className="h-1 w-full" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-3.5 w-2/3" />
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-1 w-full rounded-full" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && savingItems.length === 0 && (
        <EmptyState
          icon="🎯"
          title={t('wishlist.title')}
          description={
            tab === 'SAVING'    ? t('wishlist.emptySaving')
            : tab === 'PURCHASED' ? t('wishlist.emptyPurchased')
            : t('wishlist.emptyCancelled')
          }
          action={
            tab === 'SAVING'
              ? <Pill accent onClick={openCreate}>+ {t('wishlist.add')}</Pill>
              : undefined
          }
        />
      )}

      {/* Goal card grid — SAVING tab */}
      {!isLoading && savingItems.length > 0 && tab === 'SAVING' && (
        <div className="space-y-3">
          <SectionLabel right={t('wishlist.goalsCount', { count: savingItems.length })}>
            {t('wishlist.saving')}
          </SectionLabel>
          <div className="grid grid-cols-2 gap-3">
            {savingItems.map((item, idx) => (
              <GoalCard
                key={item.id}
                item={item}
                accent={GOAL_ACCENTS[idx % GOAL_ACCENTS.length]}
                onEdit={() => openEdit(item)}
              />
            ))}
          </div>
        </div>
      )}

      {/* List layout — PURCHASED / CANCELLED */}
      {!isLoading && savingItems.length > 0 && tab !== 'SAVING' && (
        <div className="space-y-3">
          <SectionLabel right={t('wishlist.itemsCount', { count: savingItems.length })}>
            {tab === 'PURCHASED' ? t('wishlist.purchased') : t('wishlist.cancelled')}
          </SectionLabel>
          <div className="bg-surface border border-line rounded-md divide-y divide-line">
            {savingItems.map((item) => (
              <WishlistItemCard key={item.id} item={item} onEdit={openEdit} />
            ))}
          </div>
        </div>
      )}

      <WishlistForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        editing={editing}
      />
    </div>
  )
}
