import { useState, useEffect } from 'react'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { useCreateWishlistItem, useUpdateWishlistItem } from '@/hooks/use-wishlist'
import type { WishlistItem, WishlistPriority, CreateWishlistItemRequest } from '@/types'
import { toast } from 'sonner'

interface WishlistFormProps {
  open: boolean
  onClose: () => void
  editing?: WishlistItem | null
}

const PRIORITIES: { value: WishlistPriority; label: string }[] = [
  { value: 'HIGH',   label: '🔴 Cao' },
  { value: 'MEDIUM', label: '🟡 Trung bình' },
  { value: 'LOW',    label: '🟢 Thấp' },
]

export function WishlistForm({ open, onClose, editing }: WishlistFormProps) {
  const create = useCreateWishlistItem()
  const update = useUpdateWishlistItem()

  const [name,       setName]       = useState('')
  const [price,      setPrice]      = useState('')
  const [priority,   setPriority]   = useState<WishlistPriority>('MEDIUM')
  const [targetDate, setTargetDate] = useState('')
  const [notes,      setNotes]      = useState('')
  const [url,        setUrl]        = useState('')
  const [urlError,   setUrlError]   = useState('')

  // Populate form when editing
  useEffect(() => {
    if (editing) {
      setName(editing.name)
      setPrice(editing.estimatedPrice != null ? String(editing.estimatedPrice) : '')
      setPriority(editing.priority)
      setTargetDate(editing.targetDate ?? '')
      setNotes(editing.notes ?? '')
      setUrl(editing.url ?? '')
    } else {
      setName(''); setPrice(''); setPriority('MEDIUM')
      setTargetDate(''); setNotes(''); setUrl('')
    }
    setUrlError('')
  }, [editing, open])

  function validateUrl(val: string): boolean {
    if (!val.trim()) return true
    if (!/^https?:\/\//.test(val)) {
      setUrlError('URL phải bắt đầu bằng https:// hoặc http://')
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
          onSuccess: () => { toast.success('Đã cập nhật!'); onClose() },
          onError: (err) => toast.error(err.message),
        }
      )
    } else {
      create.mutate(body, {
        onSuccess: () => { toast.success('Đã thêm vào danh sách!'); onClose() },
        onError: (err) => toast.error(err.message),
      })
    }
  }

  const isPending = create.isPending || update.isPending

  return (
    <BottomSheet open={open} onClose={onClose} title={editing ? 'Sửa mặt hàng' : 'Thêm mặt hàng'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="text-xs text-muted mb-1 block">Tên mặt hàng *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="VD: AirPods Pro 2"
            required
            className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-primary placeholder:text-muted outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {/* Price */}
        <div>
          <label className="text-xs text-muted mb-1 block">Giá dự kiến (VND)</label>
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
          <label className="text-xs text-muted mb-1 block">Ưu tiên</label>
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
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Target date */}
        <div>
          <label className="text-xs text-muted mb-1 block">Ngày dự kiến mua</label>
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-primary outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {/* URL */}
        <div>
          <label className="text-xs text-muted mb-1 block">Link sản phẩm</label>
          <input
            type="url"
            value={url}
            onChange={(e) => { setUrl(e.target.value); validateUrl(e.target.value) }}
            placeholder="https://shopee.vn/..."
            className={`w-full bg-surface-2 border rounded-lg px-3 py-2 text-sm text-primary placeholder:text-muted outline-none focus:ring-2 focus:ring-accent ${
              urlError ? 'border-negative' : 'border-border'
            }`}
          />
          {urlError && <p className="text-2xs text-negative mt-1">{urlError}</p>}
        </div>

        {/* Notes */}
        <div>
          <label className="text-xs text-muted mb-1 block">Ghi chú</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Màu đen mới..."
            className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-primary placeholder:text-muted outline-none focus:ring-2 focus:ring-accent resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={isPending || !name.trim()}
          className="w-full bg-accent text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50"
        >
          {isPending ? 'Đang lưu...' : editing ? 'Cập nhật' : 'Thêm vào danh sách'}
        </button>
      </form>
    </BottomSheet>
  )
}
