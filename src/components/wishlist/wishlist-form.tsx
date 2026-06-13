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

// CAO=negative, TRUNG BÌNH=warning, THẤP=primary (Minh spec §11)
const PRIORITIES: {
  value: WishlistPriority
  labelKey: string
  activeClass: string
}[] = [
  { value: 'HIGH',   labelKey: 'wishlist.priorityHigh',   activeClass: 'border-negative bg-negative-soft text-negative' },
  { value: 'MEDIUM', labelKey: 'wishlist.priorityMedium', activeClass: 'border-warning bg-warning-soft text-warning' },
  { value: 'LOW',    labelKey: 'wishlist.priorityLow',    activeClass: 'border-primary bg-primary-soft text-primary' },
]

const inputCls =
  'w-full bg-surface border border-line rounded-md px-3 py-2.5 text-sm text-ink placeholder:text-muted outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors'

export function WishlistForm({ open, onClose, editing }: WishlistFormProps) {
  const { t } = useTranslation()
  const create = useCreateWishlistItem()
  const update = useUpdateWishlistItem()

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
          <label className="block text-[10px] font-extrabold uppercase tracking-[0.07em] text-sub mb-1.5">
            {t('wishlist.name')}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('wishlist.namePlaceholder')}
            required
            className={inputCls}
          />
        </div>

        {/* Price */}
        <div>
          <label className="block text-[10px] font-extrabold uppercase tracking-[0.07em] text-sub mb-1.5">
            {t('wishlist.price')}
          </label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="5990000"
            min={0}
            className={`${inputCls} tabular-nums`}
          />
        </div>

        {/* Priority — CAO=negative / TRUNG BÌNH=warning / THẤP=primary */}
        <div>
          <label className="block text-[10px] font-extrabold uppercase tracking-[0.07em] text-sub mb-1.5">
            {t('wishlist.priority')}
          </label>
          <div className="flex gap-2">
            {PRIORITIES.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setPriority(p.value)}
                className={`flex-1 min-h-[44px] text-[11px] font-bold uppercase tracking-[0.05em] rounded-md border transition-colors ${
                  priority === p.value
                    ? p.activeClass
                    : 'border-line text-muted bg-surface-2 hover:border-primary/40 hover:bg-hover'
                }`}
              >
                {t(p.labelKey)}
              </button>
            ))}
          </div>
        </div>

        {/* Target date */}
        <div>
          <label className="block text-[10px] font-extrabold uppercase tracking-[0.07em] text-sub mb-1.5">
            {t('wishlist.targetDate')}
          </label>
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className={inputCls}
          />
        </div>

        {/* Product URL */}
        <div>
          <label className="block text-[10px] font-extrabold uppercase tracking-[0.07em] text-sub mb-1.5">
            {t('wishlist.productLink')}
          </label>
          <input
            type="url"
            value={url}
            onChange={(e) => { setUrl(e.target.value); validateUrl(e.target.value) }}
            placeholder={t('wishlist.productLinkPlaceholder')}
            className={`${inputCls} ${urlError ? 'border-negative focus:border-negative focus:ring-negative/20' : ''}`}
          />
          {urlError && (
            <p className="text-[10px] font-semibold text-negative mt-1">{urlError}</p>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="block text-[10px] font-extrabold uppercase tracking-[0.07em] text-sub mb-1.5">
            {t('wishlist.notes')}
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder={t('wishlist.notesPlaceholder')}
            className={`${inputCls} resize-none`}
          />
        </div>

        <button
          type="submit"
          disabled={isPending || !name.trim()}
          className="w-full min-h-[44px] bg-primary text-primary-ink rounded-md text-sm font-bold hover:bg-primary-hover transition-colors disabled:opacity-50 shadow-button"
        >
          {isPending ? t('common.saving') : editing ? t('wishlist.update') : t('wishlist.addToList')}
        </button>
      </form>
    </BottomSheet>
  )
}
