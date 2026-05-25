import { useState } from 'react'
import { WishlistItemCard } from '@/components/wishlist/wishlist-item-card'
import { WishlistForm } from '@/components/wishlist/wishlist-form'
import { useWishlistItems } from '@/hooks/use-wishlist'
import { SectionLabel } from '@/design-system'
import { Amount, ProgressBar } from '@/design-system'
import type { WishlistItem, WishlistStatus } from '@/types'

type Tab = WishlistStatus

const TABS: { value: Tab; label: string }[] = [
  { value: 'SAVING',    label: 'Đang tiết kiệm' },
  { value: 'PURCHASED', label: 'Đã mua' },
  { value: 'CANCELLED', label: 'Đã huỷ' },
]

// Color stripes per goal slot (cycles if more than 4)
const GOAL_ACCENTS = ['#c8f53a', '#5fb7ff', '#ff8ab6', '#e8c87a']

function GoalCard({ item, accent, onEdit }: { item: WishlistItem; accent: string; onEdit: () => void }) {
  const price = item.estimatedPrice ?? 0
  // For SAVING items we treat estimatedPrice as target; no saved amount tracked on backend
  // so pct is 0 unless purchased — visual only
  const pct = item.status === 'PURCHASED' ? 1 : 0

  return (
    <button
      onClick={onEdit}
      className="bg-surface border border-border rounded-lg p-4 text-left w-full hover:border-border-hi transition-colors space-y-3"
    >
      {/* Color stripe top */}
      <div className="h-0.5 rounded-full w-full" style={{ background: accent }} />

      {/* Name + percent */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-primary leading-tight">{item.name}</span>
        <span className="font-mono text-[11px] shrink-0" style={{ color: accent }}>
          {Math.round(pct * 100)}%
        </span>
      </div>

      {/* Amount */}
      <div className="flex items-baseline gap-2">
        {price > 0 ? (
          <>
            <Amount value={pct * price} size={20} weight={500} className="text-primary" />
            <span className="font-mono text-[11px] text-muted">
              of <Amount value={price} size={11} dim />
            </span>
          </>
        ) : (
          <span className="font-mono text-[11px] text-muted">Chưa có giá mục tiêu</span>
        )}
      </div>

      {/* Progress bar */}
      {price > 0 && <ProgressBar pct={pct} height={5} color={accent} />}

      {/* Meta row */}
      <div className="flex items-center justify-between font-mono text-[11px] text-muted">
        {item.targetDate ? (
          <span>Hạn: {item.targetDate}</span>
        ) : (
          <span>Không có hạn</span>
        )}
        <span className="uppercase tracking-wide">{item.priority}</span>
      </div>
    </button>
  )
}

export default function WishlistPage() {
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
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted mb-0.5">Money / Goals</p>
          <h1 className="text-base font-semibold text-primary">Danh sách mong muốn</h1>
        </div>
        <button
          onClick={openCreate}
          className="h-7 px-3 rounded-full font-mono text-[11px] uppercase tracking-[0.05em] bg-accent text-accent-ink hover:brightness-105 transition-all"
        >
          + Thêm
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-2 p-1 rounded-lg">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`flex-1 font-mono text-[11px] uppercase tracking-wide py-1.5 rounded-md transition-colors ${
              tab === t.value
                ? 'bg-surface text-primary shadow-sm'
                : 'text-muted hover:text-primary'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-surface border border-border rounded-lg p-4 h-36 animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty */}
      {!isLoading && savingItems.length === 0 && (
        <div className="bg-surface border border-border rounded-lg p-8 text-center space-y-2">
          <SectionLabel>Trống</SectionLabel>
          <p className="text-sm text-muted mt-4">
            {tab === 'SAVING'
              ? 'Chưa có mặt hàng nào. Thêm mục tiêu đầu tiên!'
              : tab === 'PURCHASED'
              ? 'Chưa có mặt hàng đã mua.'
              : 'Chưa có mặt hàng đã huỷ.'}
          </p>
        </div>
      )}

      {/* Goals grid — editorial savings layout for SAVING tab */}
      {!isLoading && savingItems.length > 0 && tab === 'SAVING' && (
        <div className="space-y-3">
          <SectionLabel right={`${savingItems.length} mục tiêu`}>
            Đang tiết kiệm
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
          <SectionLabel right={`${savingItems.length} mục`}>
            {tab === 'PURCHASED' ? 'Đã mua' : 'Đã huỷ'}
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
