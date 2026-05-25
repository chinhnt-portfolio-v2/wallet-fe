import { useState } from 'react'
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/hooks/useCategories'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { SectionLabel, CategoryChip } from '@/design-system'
import { toast } from 'sonner'

// Rich category icon palette
const CATEGORY_ICONS = [
  '🍔', '🛒', '🏠', '🚗', '⛽', '🔋',
  '💊', '🏥', '👔', '🎓', '📱', '💻',
  '✈️', '🏨', '🎬', '🎮', '🎵', '📚',
  '☕', '🍺', '🎁', '💇', '🐾', '👶',
  '💰', '📈', '💼', '🎯', '🔧', '📦',
  '📸', '🎨', '🏋️', '⚽', '🚕', '🚌',
  '🏦', '💳', '📱', '🌐', '☁️', '🎥',
]

const CATEGORY_COLORS = [
  '#EF4444', '#F97316', '#EAB308', '#22C55E',
  '#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899',
  '#F43F5E', '#64748B',
]

function CategoryForm({
  initial,
  onSubmit,
  onCancel,
  isPending,
}: {
  initial?: { id?: number; name: string; icon: string; color: string; type: 'INCOME' | 'EXPENSE' }
  onSubmit: (data: { name: string; icon: string; color: string; type: 'INCOME' | 'EXPENSE' }) => void
  onCancel: () => void
  isPending: boolean
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [icon, setIcon] = useState(initial?.icon ?? '📦')
  const [color, setColor] = useState(initial?.color ?? '#3B82F6')
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>(initial?.type ?? 'EXPENSE')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { toast.error('Nhập tên danh mục'); return }
    onSubmit({ name: name.trim(), icon, color, type })
  }

  return (
    <div className="bg-surface border border-border rounded-lg p-4 space-y-4">
      <SectionLabel>{initial?.id ? 'Sửa danh mục' : 'Tạo danh mục mới'}</SectionLabel>

      {/* Type toggle */}
      <div className="flex gap-1 bg-surface-2 rounded-md p-1">
        {(['EXPENSE', 'INCOME'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={`flex-1 py-1.5 font-mono text-[11px] uppercase tracking-wide rounded-sm transition-colors ${
              type === t
                ? t === 'EXPENSE'
                  ? 'bg-negative text-white font-medium shadow-sm'
                  : 'bg-positive text-white font-medium shadow-sm'
                : 'text-muted hover:text-primary hover:bg-surface-2'
            }`}
          >
            {t === 'EXPENSE' ? 'Chi' : 'Thu'}
          </button>
        ))}
      </div>

      <Input
        label="Tên danh mục"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="VD: Ăn uống, Đi lại..."
        required
      />

      {/* Icon picker */}
      <div>
        <label className="block font-mono text-[10px] uppercase tracking-widest text-muted mb-2">Icon</label>
        <div className="grid grid-cols-9 gap-1.5 max-h-36 overflow-y-auto pr-1">
          {CATEGORY_ICONS.map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIcon(i)}
              className={`w-8 h-8 text-base rounded-md border transition-all flex items-center justify-center ${
                icon === i
                  ? 'border-accent ring-2 ring-accent/30 bg-accent/10'
                  : 'border-border hover:border-accent/50 hover:bg-surface-2'
              }`}
            >
              {i}
            </button>
          ))}
        </div>
      </div>

      {/* Color picker */}
      <div>
        <label className="block font-mono text-[10px] uppercase tracking-widest text-muted mb-2">Màu</label>
        <div className="flex gap-2 flex-wrap">
          {CATEGORY_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`w-7 h-7 rounded-full transition-all ${
                color === c ? 'ring-2 ring-offset-2 ring-primary scale-110' : 'hover:scale-110'
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="flex items-center gap-3">
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted">Preview</span>
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium"
          style={{ backgroundColor: `${color}20`, border: `1.5px solid ${color}`, color }}
        >
          <span>{icon}</span>
          <span className="font-mono text-[12px]">{name || 'Xem trước'}</span>
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <Button variant="outline" onClick={onCancel} className="flex-1">Hủy</Button>
        <Button onClick={handleSubmit} disabled={isPending || !name.trim()} className="flex-1">
          {isPending ? 'Đang lưu...' : initial?.id ? 'Lưu thay đổi' : 'Tạo danh mục'}
        </Button>
      </div>
    </div>
  )
}

function EditModal({
  category,
  onClose,
}: {
  category: { id: number; name: string; icon: string; color: string; type: 'INCOME' | 'EXPENSE' }
  onClose: () => void
}) {
  const update = useUpdateCategory()
  const del = useDeleteCategory()
  const [showDelete, setShowDelete] = useState(false)

  const handleUpdate = (data: { name: string; icon: string; color: string; type: 'INCOME' | 'EXPENSE' }) => {
    update.mutate({ id: category.id, ...data }, {
      onSuccess: () => { toast.success('Đã cập nhật!'); onClose() },
      onError: (e: Error) => toast.error(e.message),
    })
  }

  const handleDelete = () => {
    del.mutate(category.id, {
      onSuccess: () => { toast.success('Đã xóa danh mục'); onClose() },
      onError: (e: Error) => toast.error(e.message),
    })
  }

  return (
    <BottomSheet open onClose={onClose} title="Sửa danh mục">
      <CategoryForm
        initial={category}
        onSubmit={handleUpdate}
        onCancel={onClose}
        isPending={update.isPending}
      />
      <div className="border-t border-border pt-3 mt-3">
        {showDelete ? (
          <div className="space-y-2">
            <p className="font-mono text-[11px] text-negative text-center">
              Xóa "{category.name}"? Không thể hoàn tác.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowDelete(false)} className="flex-1">Hủy</Button>
              <Button
                onClick={handleDelete}
                disabled={del.isPending}
                className="flex-1 !bg-negative !text-white"
              >
                {del.isPending ? 'Đang xóa...' : 'Xóa danh mục'}
              </Button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowDelete(true)}
            className="w-full text-center font-mono text-[11px] text-negative hover:underline py-1 uppercase tracking-wide"
          >
            Xóa danh mục
          </button>
        )}
      </div>
    </BottomSheet>
  )
}

export default function CategoriesPage() {
  const { data: categories, isLoading } = useCategories()
  const createCategory = useCreateCategory()
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState<{ id: number; name: string; icon: string; color: string; type: 'INCOME' | 'EXPENSE' } | null>(null)
  const [tab, setTab] = useState<'EXPENSE' | 'INCOME'>('EXPENSE')

  const visible = Array.isArray(categories) ? categories.filter((c) => c.type === tab) : []

  const handleCreate = (data: { name: string; icon: string; color: string; type: 'INCOME' | 'EXPENSE' }) => {
    createCategory.mutate(data, {
      onSuccess: () => { toast.success('Đã tạo danh mục!'); setShowForm(false) },
      onError: (e: Error) => toast.error(e.message),
    })
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted mb-0.5">Money / Categories</p>
          <h2 className="text-base font-semibold text-primary">Danh mục</h2>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`h-7 px-3 rounded-full font-mono text-[11px] uppercase tracking-[0.05em] transition-all ${
            showForm
              ? 'bg-transparent shadow-[inset_0_0_0_1px_var(--color-border-hi)] text-primary hover:bg-surface-2'
              : 'bg-accent text-accent-ink hover:brightness-105'
          }`}
        >
          {showForm ? '− Đóng' : '+ Thêm'}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <CategoryForm
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
          isPending={createCategory.isPending}
        />
      )}

      {/* Tab */}
      <div className="flex gap-1 bg-surface-2 rounded-md p-1">
        {(['EXPENSE', 'INCOME'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-1.5 font-mono text-[11px] uppercase tracking-wide rounded-sm transition-colors ${
              tab === t
                ? t === 'EXPENSE'
                  ? 'bg-negative text-white font-medium shadow-sm'
                  : 'bg-positive text-white font-medium shadow-sm'
                : 'text-muted hover:text-primary hover:bg-surface-2'
            }`}
          >
            {t === 'EXPENSE' ? 'Chi tiêu' : 'Thu nhập'}
          </button>
        ))}
      </div>

      {/* Section label with count */}
      {!isLoading && (
        <SectionLabel right={`${visible.length} danh mục`}>
          {tab === 'EXPENSE' ? 'Chi tiêu' : 'Thu nhập'}
        </SectionLabel>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-3 gap-2">
          {[...Array(9)].map((_, i) => <Skeleton key={i} className="h-20 rounded-md" />)}
        </div>
      )}

      {/* Empty */}
      {!isLoading && visible.length === 0 && (
        <EmptyState
          icon="🏷️"
          title="Chưa có danh mục"
          description={`Bạn chưa tạo danh mục ${tab === 'EXPENSE' ? 'chi tiêu' : 'thu nhập'} nào.`}
        />
      )}

      {/* List — editorial row layout with CategoryChip */}
      {!isLoading && visible.length > 0 && (
        <div className="bg-surface border border-border rounded-lg divide-y divide-border">
          {visible.map((cat) => {
            // Derive hue from cat.color hex for CategoryChip — best-effort
            const hue = cat.color
              ? Math.round((parseInt(cat.color.slice(1, 3), 16) / 255) * 120 +
                  (parseInt(cat.color.slice(3, 5), 16) / 255) * 60 +
                  (parseInt(cat.color.slice(5, 7), 16) / 255) * 180) % 360
              : 0
            return (
              <button
                key={cat.id}
                onClick={() => setEditTarget(cat as typeof editTarget)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-2 transition-colors text-left"
              >
                <CategoryChip cat="other" name={cat.name} hue={hue} size={32} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-primary truncate">{cat.name}</p>
                  <p className="font-mono text-[11px] text-muted">{cat.icon}</p>
                </div>
                {cat.isDefault && (
                  <Badge variant="neutral" className="text-2xs px-1.5 py-0 shrink-0">Mặc định</Badge>
                )}
                <span className="font-mono text-[11px] text-muted shrink-0">→</span>
              </button>
            )
          })}
        </div>
      )}

      {/* Edit modal */}
      {editTarget && (
        <EditModal
          category={editTarget}
          onClose={() => setEditTarget(null)}
        />
      )}
    </div>
  )
}
