import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { SegmentedControl } from '@/components/ui/segmented-control'
import { SectionLabel } from '@/design-system'

const CATEGORY_ICONS = [
  '🍔', '🛒', '🏠', '🚗', '⛽', '🔋',
  '💊', '🏥', '👔', '🎓', '📱', '💻',
  '✈️', '🏨', '🎬', '🎮', '🎵', '📚',
  '☕', '🍺', '🎁', '💇', '🐾', '👶',
  '💰', '📈', '💼', '🎯', '🔧', '📦',
  '📸', '🎨', '🏋️', '⚽', '🚕', '🚌',
  '🏦', '💳', '🌐', '☁️', '🎥',
]

// Minh category accent palette — fixed, theme-independent
const CATEGORY_COLORS = [
  '#d97706', '#6366f1', '#db2777', '#0891b2',
  '#b45309', '#7c3aed', '#e5484d', '#0d9488',
  '#2563eb', '#16a34a', '#64748b', '#f97316',
]

export interface CategoryFormData {
  name: string
  icon: string
  color: string
  type: 'INCOME' | 'EXPENSE'
}

export function CategoryForm({
  initial,
  onSubmit,
  onCancel,
  isPending,
}: {
  initial?: { id?: number } & CategoryFormData
  onSubmit: (data: CategoryFormData) => void
  onCancel: () => void
  isPending: boolean
}) {
  const { t } = useTranslation()
  const [name,  setName]  = useState(initial?.name  ?? '')
  const [icon,  setIcon]  = useState(initial?.icon  ?? '📦')
  const [color, setColor] = useState(initial?.color ?? '#2563eb')
  const [type,  setType]  = useState<'INCOME' | 'EXPENSE'>(initial?.type ?? 'EXPENSE')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { toast.error(t('category.enterName')); return }
    onSubmit({ name: name.trim(), icon, color, type })
  }

  const chipBg = `${color}1f`

  return (
    <div className="bg-surface border border-line rounded-md p-4 space-y-4">
      <SectionLabel>
        {initial?.id ? t('category.editCategory') : t('category.createCategory')}
      </SectionLabel>

      <SegmentedControl
        options={[
          { value: 'EXPENSE', label: t('category.expenseShort') },
          { value: 'INCOME',  label: t('category.incomeShort') },
        ]}
        value={type}
        onChange={(v) => setType(v as 'INCOME' | 'EXPENSE')}
        ariaLabel={t('category.title')}
        className="w-full grid grid-cols-2"
      />

      <Input
        label={t('category.name')}
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t('category.namePlaceholder')}
        required
      />

      {/* Icon picker */}
      <div>
        <label className="block text-[10px] font-extrabold uppercase tracking-[0.07em] text-sub mb-2">
          {t('category.icon')}
        </label>
        <div className="grid grid-cols-9 gap-1.5 max-h-36 overflow-y-auto pr-1">
          {CATEGORY_ICONS.map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIcon(i)}
              className={`w-8 h-8 text-base rounded-sm border transition-all flex items-center justify-center ${
                icon === i
                  ? 'border-primary ring-2 ring-primary/30 bg-primary-soft'
                  : 'border-line hover:border-primary/50 hover:bg-surface-2'
              }`}
            >
              {i}
            </button>
          ))}
        </div>
      </div>

      {/* Color picker */}
      <div>
        <label className="block text-[10px] font-extrabold uppercase tracking-[0.07em] text-sub mb-2">
          {t('category.color')}
        </label>
        <div className="flex gap-2 flex-wrap">
          {CATEGORY_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              aria-label={c}
              className={`w-7 h-7 rounded-full transition-all ${
                color === c ? 'ring-2 ring-offset-2 ring-primary scale-110' : 'hover:scale-110'
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      {/* Live preview chip */}
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-extrabold uppercase tracking-[0.07em] text-sub">
          {t('common.preview')}
        </span>
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold"
          style={{ backgroundColor: chipBg, border: `1.5px solid ${color}`, color }}
        >
          <span aria-hidden="true">{icon}</span>
          <span className="text-[12px]">{name || t('common.preview')}</span>
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <Button variant="outline" onClick={onCancel} className="flex-1 min-h-[44px]">
          {t('common.cancel')}
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isPending || !name.trim()}
          className="flex-1 min-h-[44px]"
        >
          {isPending
            ? t('common.saving')
            : initial?.id
              ? t('common.saveChanges')
              : t('category.createCategoryShort')}
        </Button>
      </div>
    </div>
  )
}
