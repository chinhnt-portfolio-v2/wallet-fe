import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { WishlistItemCard } from '@/components/wishlist/wishlist-item-card'
import { WishlistForm } from '@/components/wishlist/wishlist-form'
import { useWishlistItems } from '@/hooks/use-wishlist'
import type { WishlistItem, WishlistStatus } from '@/types'

type Tab = WishlistStatus

const TABS: { value: Tab; label: string }[] = [
  { value: 'SAVING',    label: '🛒 Đang tiết kiệm' },
  { value: 'PURCHASED', label: '✅ Đã mua' },
  { value: 'CANCELLED', label: '❌ Đã huỷ' },
]

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

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-base font-semibold text-primary">🎯 Danh sách mong muốn</h1>
        <button
          onClick={openCreate}
          className="bg-accent text-white text-xs px-3 py-1.5 rounded-lg font-medium hover:bg-accent/90 transition-colors"
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
            className={`flex-1 text-xs py-1.5 rounded-md transition-colors font-medium ${
              tab === t.value
                ? 'bg-surface text-primary shadow-sm'
                : 'text-muted hover:text-primary'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <Card padding="none">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-2/3 bg-surface-2 rounded" />
                  <div className="h-2 w-1/3 bg-surface-2 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : !items || items.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-2xl mb-2">🛒</p>
            <p className="text-sm text-muted">
              {tab === 'SAVING'
                ? 'Chưa có mặt hàng nào. Thêm ngay!'
                : tab === 'PURCHASED'
                ? 'Chưa có mặt hàng đã mua.'
                : 'Chưa có mặt hàng đã huỷ.'}
            </p>
          </div>
        ) : (
          items.map((item) => (
            <WishlistItemCard key={item.id} item={item} onEdit={openEdit} />
          ))
        )}
      </Card>

      <WishlistForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        editing={editing}
      />
    </div>
  )
}
