import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { WishlistItemCard } from '@/components/wishlist/wishlist-item-card'
import { WishlistForm } from '@/components/wishlist/wishlist-form'
import { useWishlistItems } from '@/hooks/use-wishlist'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { SegmentedControl } from '@/components/ui/segmented-control'
import { SectionLabel, Amount, Pill } from '@/design-system'
import type { WishlistItem, WishlistStatus, WishlistPriority } from '@/types'

type Tab = WishlistStatus

// Color stripes per goal slot (cycles if more than 4)
const GOAL_ACCENTS = ['#c8f53a', '#5fb7ff', '#ff8ab6', '#e8c87a']

// Priority → contrast-raised pill (dark-theme tints, audit §2.14) + label key.
const PRIORITY_PILL: Record<WishlistPriority, { className: string; labelKey: string }> = {
  HIGH:   { className: 'bg-negative/20 text-negative', labelKey: 'wishlist.priorityHigh' },
  MEDIUM: { className: 'bg-warning/20 text-warning',   labelKey: 'wishlist.priorityMedium' },
  LOW:    { className: 'bg-positive/20 text-positive', labelKey: 'wishlist.priorityLow' },
}

function GoalCard({ item, accent, onEdit }: { item: WishlistItem; accent: string; onEdit: () => void }) {
  const { t } = useTranslation()
  const price = item.estimatedPrice ?? 0

  return (
    <button
      onClick={onEdit}
      className="bg-surface border border-border rounded-lg p-4 text-left w-full hover:border-border-hi transition-colors space-y-3"
    >
      {/* Color stripe top */}
      <div className="h-0.5 rounded-full w-full" style={{ background: accent }} aria-hidden="true" />

      {/* Name + priority */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-primary leading-tight truncate">{item.name}</span>
        <span className={`text-2xs px-1.5 py-0.5 rounded font-mono uppercase tracking-wide shrink-0 ${PRIORITY_PILL[item.priority].className}`}>
          {t(PRIORITY_PILL[item.priority].labelKey)}
        </span>
      </div>

      {/* Target price — "0 / 70.000.000₫" style, no serif-superscript "of" */}
      <div className="flex items-baseline gap-1.5">
        {price > 0 ? (
          <Amount value={price} size={20} weight={500} className="text-primary" />
        ) : (
          <span className="font-mono text-[11px] text-secondary">{t('wishlist.noTargetPrice')}</span>
        )}
      </div>

      {/* Meta row */}
      <div className="flex items-center justify-between font-mono text-[11px] text-secondary">
        {item.targetDate ? (
          <span>{t('wishlist.deadline', { date: new Date(item.targetDate).toLocaleDateString('vi-VN') })}</span>
        ) : (
          <span>{t('wishlist.noDeadline')}</span>
        )}
      </div>
    </button>
  )
}

export default function WishlistPage() {
  const { t } = useTranslation()
  const [tab,      setTab]      = useState<Tab>('SAVING')
  const [formOpen, setFormOpen] = useState(false)
  const [editing,  setEditing]  = useState<WishlistItem | null>(null)

  const { data: items, isLoading } = useWishlistItems(tab)

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(item: WishlistItem) {
    setEditing(item)
    setFormOpen(true)
  }

  const savingItems = items ?? []

  return (
    <div className="page-enter space-y-5">
      {/* Header — one page-title recipe (serif italic + mono eyebrow) */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-widest text-secondary mb-0.5">{t('wishlist.subtitle')}</p>
          <h1 className="font-display italic text-2xl text-primary leading-tight">{t('wishlist.title')}</h1>
        </div>
        <button
          onClick={openCreate}
          className="h-7 px-3 rounded-full font-mono text-[11px] uppercase tracking-[0.05em] bg-accent text-accent-ink hover:brightness-105 cta-glow transition-all"
        >
          + {t('wishlist.add')}
        </button>
      </div>

      {/* Tabs — one segmented style (lime) */}
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

      {/* Loading — shimmer skeletons */}
      {isLoading && (
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-surface border border-border rounded-lg p-4 space-y-3">
              <Skeleton className="h-0.5 w-full rounded-full" />
              <Skeleton className="h-3.5 w-2/3" />
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!isLoading && savingItems.length === 0 && (
        <EmptyState
          icon="🎯"
          title={t('wishlist.title')}
          description={
            tab === 'SAVING' ? t('wishlist.emptySaving')
            : tab === 'PURCHASED' ? t('wishlist.emptyPurchased')
            : t('wishlist.emptyCancelled')
          }
          action={
            tab === 'SAVING'
              ? <Pill accent className="cta-glow" onClick={openCreate}>+ {t('wishlist.add')}</Pill>
              : undefined
          }
        />
      )}

      {/* Goals grid — editorial savings layout for SAVING tab */}
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

      {/* List layout for PURCHASED / CANCELLED */}
      {!isLoading && savingItems.length > 0 && tab !== 'SAVING' && (
        <div className="space-y-3">
          <SectionLabel right={t('wishlist.itemsCount', { count: savingItems.length })}>
            {tab === 'PURCHASED' ? t('wishlist.purchased') : t('wishlist.cancelled')}
          </SectionLabel>
          <div className="bg-surface border border-border rounded-lg divide-y divide-border">
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
