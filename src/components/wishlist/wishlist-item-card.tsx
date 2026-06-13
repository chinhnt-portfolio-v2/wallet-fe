import { useTranslation } from 'react-i18next'
import { ExternalLink, Trash2, Calendar } from 'lucide-react'
import type { WishlistItem, WishlistPriority } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { useUpdateWishlistStatus, useDeleteWishlistItem } from '@/hooks/use-wishlist'
import { toast } from 'sonner'

// CAO=negative, TRUNG BÌNH=warning, THẤP=primary (Minh spec §11)
const PRIORITY_BADGE: Record<WishlistPriority, { labelKey: string; className: string }> = {
  HIGH:   { labelKey: 'wishlist.priorityHigh',   className: 'bg-negative-soft text-negative' },
  MEDIUM: { labelKey: 'wishlist.priorityMedium', className: 'bg-warning-soft text-warning' },
  LOW:    { labelKey: 'wishlist.priorityLow',    className: 'bg-primary-soft text-primary' },
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
    <div className="flex items-start gap-3 px-4 py-3 hover:bg-hover transition-colors">
      {/* Clickable info area */}
      <div
        className="flex-1 min-w-0 cursor-pointer"
        role="button"
        tabIndex={0}
        onClick={() => onEdit(item)}
        onKeyDown={(e) => e.key === 'Enter' && onEdit(item)}
      >
        {/* Name + priority */}
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <p className="text-sm font-bold text-ink truncate">{item.name}</p>
          <span className={`text-[10px] font-extrabold uppercase tracking-[0.07em] px-1.5 py-0.5 rounded-sm ${badge.className}`}>
            {t(badge.labelKey)}
          </span>
        </div>

        {/* Price */}
        {item.estimatedPrice != null && (
          <p className="text-sm font-bold text-primary tabular-nums">
            {formatCurrency(item.estimatedPrice)}
          </p>
        )}

        {/* Meta: date + URL */}
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          {item.targetDate && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-muted">
              <Calendar size={10} strokeWidth={2} aria-hidden="true" />
              {new Date(item.targetDate).toLocaleDateString('vi-VN')}
            </span>
          )}
          {item.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t('wishlist.productLinkAria', { name: item.name })}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary hover:text-primary-hover transition-colors"
            >
              <ExternalLink size={10} strokeWidth={2} />
              {t('wishlist.link')}
            </a>
          )}
          {item.notes && (
            <p className="text-[10px] font-semibold text-muted truncate max-w-[180px]">{item.notes}</p>
          )}
        </div>
      </div>

      {/* Actions — SAVING */}
      {item.status === 'SAVING' && (
        <div className="flex flex-col gap-1 shrink-0">
          <button
            onClick={handlePurchased}
            disabled={updateStatus.isPending}
            className="min-h-[44px] text-[11px] font-bold uppercase tracking-[0.05em] bg-positive-soft text-positive px-2 py-1 rounded-sm hover:bg-positive/20 transition-colors whitespace-nowrap"
          >
            ✓ {t('wishlist.markPurchased')}
          </button>
          <button
            onClick={handleCancelled}
            disabled={updateStatus.isPending}
            className="text-[11px] font-bold uppercase tracking-[0.05em] bg-surface-2 text-muted px-2 py-1 rounded-sm hover:bg-hover transition-colors whitespace-nowrap"
          >
            {t('wishlist.cancel')}
          </button>
        </div>
      )}

      {/* Delete — PURCHASED / CANCELLED */}
      {item.status !== 'SAVING' && (
        <button
          onClick={handleDelete}
          disabled={deleteItem.isPending}
          aria-label={t('wishlist.deleteAria')}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-muted hover:text-negative transition-colors shrink-0"
        >
          <Trash2 size={14} strokeWidth={2} />
        </button>
      )}
    </div>
  )
}
