import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { useCreateWishlistItem, useUpdateWishlistItem } from '@/hooks/use-wishlist'
import type { WishlistItem, WishlistPriority, CreateWishlistItemRequest } from '@/types'
import { toast } from 'sonner'

interface WishlistFormProps {
  open: boolean
  onClose: () => void
  editing?: WishlistItem | null
}

const PRIORITIES: { value: WishlistPriority; emoji: string; labelKey: string }[] = [
  { value: 'HIGH',   emoji: '🔴', labelKey: 'wishlist.priorityHigh' },
  { value: 'MEDIUM', emoji: '🟡', labelKey: 'wishlist.priorityMedium' },
  { value: 'LOW',    emoji: '🟢', labelKey: 'wishlist.priorityLow' },
]

export function WishlistForm({ open, onClose, editing }: WishlistFormProps) {
  const { t } = useTranslation()
  const create = useCreateWishlistItem()
  const update = useUpdateWishlistItem()

  // Reset key — when editing target or open state changes, this changes and we
  // re-seed local state during render (the recommended "store previous prop"
  // pattern) instead of calling setState inside an effect.
  const resetKey = `${open ? 1 : 0}:${editing?.id ?? 'new'}`
  const [seededKey, setSeededKey] = useState(resetKey)

  const [name,       setName]       = useState(editing?.name ?? '')
  const [price,      setPrice]      = useState(editing?.estimatedPrice != null ? String(editing.estimatedPrice) : '')
  const [priority,   setPriority]   = useState<WishlistPriority>(editing?.priority ?? 'MEDIUM')
  const [targetDate, setTargetDate] = useState(editing?.targetDate ?? '')
  const [notes,      setNotes]      = useState(editing?.notes ?? '')
  const [url,        setUrl]        = useState(editing?.url ?? '')
  const [urlError,   setUrlError]   = useState('')

  if (seededKey !== resetKey) {
    // Re-seed fields from the (possibly new) editing target. Runs during render,
    // synchronously, before the form is painted.
    setSeededKey(resetKey)
    setName(editing?.name ?? '')
    setPrice(editing?.estimatedPrice != null ? String(editing.estimatedPrice) : '')
    setPriority(editing?.priority ?? 'MEDIUM')
    setTargetDate(editing?.targetDate ?? '')
    setNotes(editing?.notes ?? '')
    setUrl(editing?.url ?? '')
    setUrlError('')
  }

  function validateUrl(val: string): boolean {
    if (!val.trim()) return true
    if (!/^https?:\/\//.test(val)) {
      setUrlError(t('wishlist.urlError'))
      return false
    }
    setUrlError('')
    return true
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    if (!validateUrl(url)) return

    const body: CreateWishlistItemRequest = {
      name: name.trim(),
      estimatedPrice: price ? Number(price) : undefined,
      priority,
      targetDate: targetDate || undefined,
      notes: notes.trim() || undefined,
      url: url.trim() || undefined,
    }

    if (editing) {
      update.mutate(
        { id: editing.id, ...body },
        {
          onSuccess: () => { toast.success(t('wishlist.updated')); onClose() },
          onError: (err) => toast.error(err.message),
        }
      )
    } else {
      create.mutate(body, {
        onSuccess: () => { toast.success(t('wishlist.added')); onClose() },
        onError: (err) => toast.error(err.message),
      })
    }
  }

  const isPending = create.isPending || update.isPending

  return (
    <BottomSheet open={open} onClose={onClose} title={editing ? t('wishlist.editItem') : t('wishlist.addItem')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="text-xs text-muted mb-1 block">{t('wishlist.name')}</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('wishlist.namePlaceholder')}
            required
            className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-primary placeholder:text-muted outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {/* Price */}
        <div>
          <label className="text-xs text-muted mb-1 block">{t('wishlist.price')}</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="5,990,000"
            min={0}
            className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-primary placeholder:text-muted outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {/* Priority */}
        <div>
          <label className="text-xs text-muted mb-1 block">{t('wishlist.priority')}</label>
          <div className="flex gap-2">
            {PRIORITIES.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setPriority(p.value)}
                className={`flex-1 text-xs py-2 px-2 rounded-lg border transition-colors ${
                  priority === p.value
                    ? 'border-accent bg-accent/10 text-accent font-semibold'
                    : 'border-border text-muted bg-surface-2'
                }`}
              >
                {p.emoji} {t(p.labelKey)}
              </button>
            ))}
          </div>
        </div>

        {/* Target date */}
        <div>
          <label className="text-xs text-muted mb-1 block">{t('wishlist.targetDate')}</label>
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-primary outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {/* URL */}
        <div>
          <label className="text-xs text-muted mb-1 block">{t('wishlist.productLink')}</label>
          <input
            type="url"
            value={url}
            onChange={(e) => { setUrl(e.target.value); validateUrl(e.target.value) }}
            placeholder={t('wishlist.productLinkPlaceholder')}
            className={`w-full bg-surface-2 border rounded-lg px-3 py-2 text-sm text-primary placeholder:text-muted outline-none focus:ring-2 focus:ring-accent ${
              urlError ? 'border-negative' : 'border-border'
            }`}
          />
          {urlError && <p className="text-2xs text-negative mt-1">{urlError}</p>}
        </div>

        {/* Notes */}
        <div>
          <label className="text-xs text-muted mb-1 block">{t('wishlist.notes')}</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder={t('wishlist.notesPlaceholder')}
            className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-primary placeholder:text-muted outline-none focus:ring-2 focus:ring-accent resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={isPending || !name.trim()}
          className="w-full bg-accent text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50"
        >
          {isPending ? t('common.saving') : editing ? t('wishlist.update') : t('wishlist.addToList')}
        </button>
      </form>
    </BottomSheet>
  )
}
