import type { WishlistItem, WishlistPriority } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { useUpdateWishlistStatus, useDeleteWishlistItem } from '@/hooks/use-wishlist'
import { toast } from 'sonner'

const PRIORITY_BADGE: Record<WishlistPriority, { label: string; className: string }> = {
  HIGH:   { label: 'Cao',    className: 'bg-red-100 text-red-700' },
  MEDIUM: { label: 'Trung bình', className: 'bg-yellow-100 text-yellow-700' },
  LOW:    { label: 'Thấp',   className: 'bg-green-100 text-green-700' },
}

interface WishlistItemCardProps {
  item: WishlistItem
  onEdit: (item: WishlistItem) => void
}

export function WishlistItemCard({ item, onEdit }: WishlistItemCardProps) {
  const updateStatus = useUpdateWishlistStatus()
  const deleteItem   = useDeleteWishlistItem()

  const badge = PRIORITY_BADGE[item.priority]

  function handlePurchased() {
    updateStatus.mutate(
      { id: item.id, status: 'PURCHASED' },
      { onSuccess: () => toast.success('Đã đánh dấu đã mua!') }
    )
  }

  function handleCancelled() {
    updateStatus.mutate(
      { id: item.id, status: 'CANCELLED' },
      { onSuccess: () => toast.success('Đã huỷ mặt hàng.') }
    )
  }

  function handleDelete() {
    if (!window.confirm(`Xóa "${item.name}"?`)) return
    deleteItem.mutate(item.id, {
      onSuccess: () => toast.success('Đã xóa.'),
    })
  }

  return (
    <div className="flex items-start gap-3 p-3 border-b border-border last:border-0">
      {/* Info */}
      <div className="flex-1 min-w-0" role="button" tabIndex={0} onClick={() => onEdit(item)} onKeyDown={(e) => e.key === 'Enter' && onEdit(item)}>
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium text-primary truncate">{item.name}</p>
          <span className={`text-2xs px-1.5 py-0.5 rounded font-medium ${badge.className}`}>
            {badge.label}
          </span>
        </div>

        {item.estimatedPrice != null && (
          <p className="text-sm font-semibold text-accent font-mono tabular-nums mt-0.5">
            {formatCurrency(item.estimatedPrice)}
          </p>
        )}

        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {item.targetDate && (
            <p className="text-2xs text-muted">
              🗓 {new Date(item.targetDate).toLocaleDateString('vi-VN')}
            </p>
          )}
          {item.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-2xs text-accent hover:underline"
            >
              🔗 Link
            </a>
          )}
          {item.notes && (
            <p className="text-2xs text-muted truncate max-w-[200px]">{item.notes}</p>
          )}
        </div>
      </div>

      {/* Actions */}
      {item.status === 'SAVING' && (
        <div className="flex flex-col gap-1 shrink-0">
          <button
            onClick={handlePurchased}
            disabled={updateStatus.isPending}
            className="text-2xs bg-positive/10 text-positive px-2 py-1 rounded font-medium hover:bg-positive/20 transition-colors whitespace-nowrap"
          >
            ✓ Đã mua
          </button>
          <button
            onClick={handleCancelled}
            disabled={updateStatus.isPending}
            className="text-2xs bg-surface-2 text-muted px-2 py-1 rounded font-medium hover:bg-surface-3 transition-colors whitespace-nowrap"
          >
            Huỷ
          </button>
        </div>
      )}

      {item.status !== 'SAVING' && (
        <button
          onClick={handleDelete}
          disabled={deleteItem.isPending}
          className="text-2xs text-negative/70 hover:text-negative px-2 py-1 transition-colors shrink-0"
          aria-label="Xóa"
        >
          🗑
        </button>
      )}
    </div>
  )
}
