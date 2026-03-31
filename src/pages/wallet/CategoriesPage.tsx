import { useState } from 'react'
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/hooks/useCategories'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { BottomSheet } from '@/components/ui/BottomSheet'
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
    <Card className="space-y-4">
      <p className="text-sm font-medium text-primary dark:text-dark-primary">{initial?.id ? '✏️ Sửa danh mục' : '+ Tạo danh mục mới'}</p>

      {/* Type toggle */}
      <div className="flex gap-1 bg-surface-2 dark:bg-dark-surface-2 rounded-md p-1">
        {(['EXPENSE', 'INCOME'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={`flex-1 py-1.5 text-xs rounded-sm transition-colors ${
              type === t
                ? t === 'EXPENSE'
                  ? 'bg-negative text-white font-medium shadow-sm'
                  : 'bg-positive text-white font-medium shadow-sm'
                : 'text-muted dark:text-dark-muted hover:text-primary dark:hover:text-dark-primary'
            }`}
          >
            {t === 'EXPENSE' ? '💸 Chi' : '📥 Thu'}
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
        <label className="block text-xs font-medium text-secondary dark:text-dark-secondary mb-2">Icon</label>
        <div className="grid grid-cols-9 gap-1.5 max-h-36 overflow-y-auto pr-1">
          {CATEGORY_ICONS.map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIcon(i)}
              className={`w-8 h-8 text-base rounded-md border transition-all flex items-center justify-center ${
                icon === i
                  ? 'border-accent dark:border-dark-accent ring-2 ring-accent/30 dark:ring-dark-accent/30 bg-accent/10 dark:bg-dark-accent/10'
                  : 'border-border dark:border-dark-border hover:border-accent/50 dark:hover:border-dark-accent/50 hover:bg-surface-2 dark:hover:bg-dark-surface-2'
              }`}
            >
              {i}
            </button>
          ))}
        </div>
      </div>

      {/* Color picker */}
      <div>
        <label className="block text-xs font-medium text-secondary dark:text-dark-secondary mb-2">Màu</label>
        <div className="flex gap-2 flex-wrap">
          {CATEGORY_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`w-7 h-7 rounded-full transition-all ${
                color === c ? 'ring-2 ring-offset-2 scale-110' : 'hover:scale-110'
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      {/* Preview */}
      <div
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
        style={{ backgroundColor: `${color}20`, border: `1.5px solid ${color}`, color }}
      >
        <span>{icon}</span>
        <span>{name || 'Xem trước'}</span>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={onCancel} className="flex-1">Hủy</Button>
        <Button onClick={handleSubmit} disabled={isPending || !name.trim()} className="flex-1">
          {isPending ? 'Đang lưu...' : initial?.id ? 'Lưu thay đổi' : 'Tạo danh mục'}
        </Button>
      </div>
    </Card>
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
    <BottomSheet open onClose={onClose} title="✏️ Sửa danh mục">
      <CategoryForm
        initial={category}
        onSubmit={handleUpdate}
        onCancel={onClose}
        isPending={update.isPending}
      />
      {/* Delete */}
      <div className="border-t border-border dark:border-dark-border pt-3 mt-3">
        {showDelete ? (
          <div className="space-y-2">
            <p className="text-xs text-negative text-center">Bạn chắc chắn muốn xóa "{category.name}"?</p>
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
            className="w-full text-center text-xs text-negative hover:underline py-1"
          >
            🗑️ Xóa danh mục
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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-primary dark:text-dark-primary">Danh mục</h2>
          <p className="text-xs text-muted dark:text-dark-muted">{Array.isArray(categories) ? categories.length : 0} danh mục</p>
        </div>
        <Button
          variant={showForm ? 'outline' : 'accent'}
          size="sm"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '− Đóng' : '+ Thêm'}
        </Button>
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
      <div className="flex gap-1 bg-surface-2 dark:bg-dark-surface-2 rounded-md p-1">
        {(['EXPENSE', 'INCOME'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-1.5 text-xs rounded-sm transition-colors ${
              tab === t
                ? t === 'EXPENSE'
                  ? 'bg-negative text-white font-medium shadow-sm'
                  : 'bg-positive text-white font-medium shadow-sm'
                : 'text-muted dark:text-dark-muted hover:text-primary dark:hover:text-dark-primary'
            }`}
          >
            {t === 'EXPENSE' ? '💸 Chi' : '📥 Thu'}
          </button>
        ))}
      </div>

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

      {/* Grid */}
      {!isLoading && (
        <div className="grid grid-cols-3 gap-2">
          {visible.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setEditTarget(cat as typeof editTarget)}
              className="card p-3 flex flex-col items-center gap-2 text-center hover:border-accent/50 dark:hover:border-dark-accent/50 transition-all"
            >
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center text-xl"
                style={{ backgroundColor: `${cat.color}20` }}
              >
                {cat.icon}
              </div>
              <div className="min-w-0 w-full">
                <p className="text-xs font-medium text-primary dark:text-dark-primary truncate">{cat.name}</p>
                {cat.isDefault && <Badge variant="neutral" className="mt-0.5 text-2xs px-1 py-0">Mặc định</Badge>}
              </div>
            </button>
          ))}
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
