import { useTranslation } from 'react-i18next'
import type { WishlistItem, WishlistPriority } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { useUpdateWishlistStatus, useDeleteWishlistItem } from '@/hooks/use-wishlist'
import { toast } from 'sonner'

// Priority → badge label i18n key + style class.
// Raised contrast for the dark theme (audit §2.14): solid-tinted backgrounds with
// bright foreground text instead of the washed-out light-mode `*-100/*-700` pairs.
const PRIORITY_BADGE: Record<WishlistPriority, { labelKey: string; className: string }> = {
  HIGH:   { labelKey: 'wishlist.priorityHigh',   className: 'bg-negative/20 text-negative' },
  MEDIUM: { labelKey: 'wishlist.priorityMedium', className: 'bg-warning/20 text-warning' },
  LOW:    { labelKey: 'wishlist.priorityLow',    className: 'bg-positive/20 text-positive' },
}

interface WishlistItemCardProps {
  item: WishlistItem
  onEdit: (item: WishlistItem) => void
}

export function WishlistItemCard({ item, onEdit }: WishlistItemCardProps) {
  const { t } = useTranslation()
  const updateStatus = useUpdateWishlistStatus()
  const deleteItem   = useDeleteWishlistItem()

  const badge = PRIORITY_BADGE[item.priority]

  function handlePurchased() {
    updateStatus.mutate(
      { id: item.id, status: 'PURCHASED' },
      { onSuccess: () => toast.success(t('wishlist.markedPurchased')) }
    )
  }

  function handleCancelled() {
    updateStatus.mutate(
      { id: item.id, status: 'CANCELLED' },
      { onSuccess: () => toast.success(t('wishlist.markedCancelled')) }
    )
  }

  function handleDelete() {
    if (!window.confirm(t('wishlist.deleteConfirm', { name: item.name }))) return
    deleteItem.mutate(item.id, {
      onSuccess: () => toast.success(t('wishlist.deleted')),
    })
  }

  return (
    <div className="flex items-start gap-3 p-3 border-b border-border last:border-0">
      {/* Info */}
      <div className="flex-1 min-w-0" role="button" tabIndex={0} onClick={() => onEdit(item)} onKeyDown={(e) => e.key === 'Enter' && onEdit(item)}>
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium text-primary truncate">{item.name}</p>
          <span className={`text-2xs px-1.5 py-0.5 rounded font-mono uppercase tracking-wide ${badge.className}`}>
            {t(badge.labelKey)}
          </span>
        </div>

        {item.estimatedPrice != null && (
          <p className="text-sm font-semibold text-accent font-mono tabular-nums mt-0.5">
            {formatCurrency(item.estimatedPrice)}
          </p>
        )}

        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {item.targetDate && (
            <p className="text-2xs text-secondary">
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
              🔗 {t('wishlist.link')}
            </a>
          )}
          {item.notes && (
            <p className="text-2xs text-secondary truncate max-w-[200px]">{item.notes}</p>
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
            ✓ {t('wishlist.markPurchased')}
          </button>
          <button
            onClick={handleCancelled}
            disabled={updateStatus.isPending}
            className="text-2xs bg-surface-2 text-muted px-2 py-1 rounded font-medium hover:bg-surface-3 transition-colors whitespace-nowrap"
          >
            {t('wishlist.cancel')}
          </button>
        </div>
      )}

      {item.status !== 'SAVING' && (
        <button
          onClick={handleDelete}
          disabled={deleteItem.isPending}
          className="text-2xs text-negative/70 hover:text-negative px-2 py-1 transition-colors shrink-0"
          aria-label={t('wishlist.deleteAria')}
        >
          🗑
        </button>
      )}
    </div>
  )
}
