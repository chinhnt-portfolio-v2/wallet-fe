import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { SegmentedControl } from '@/components/ui/segmented-control'
import { SectionLabel } from '@/design-system'

// Rich category icon palette
const CATEGORY_ICONS = [
  '🍔', '🛒', '🏠', '🚗', '⛽', '🔋',
  '💊', '🏥', '👔', '🎓', '📱', '💻',
  '✈️', '🏨', '🎬', '🎮', '🎵', '📚',
  '☕', '🍺', '🎁', '💇', '🐾', '👶',
  '💰', '📈', '💼', '🎯', '🔧', '📦',
  '📸', '🎨', '🏋️', '⚽', '🚕', '🚌',
  '🏦', '💳', '🌐', '☁️', '🎥',
]

const CATEGORY_COLORS = [
  '#EF4444', '#F97316', '#EAB308', '#22C55E',
  '#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899',
  '#F43F5E', '#64748B',
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
  const [name, setName] = useState(initial?.name ?? '')
  const [icon, setIcon] = useState(initial?.icon ?? '📦')
  const [color, setColor] = useState(initial?.color ?? '#3B82F6')
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>(initial?.type ?? 'EXPENSE')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { toast.error(t('category.enterName')); return }
    onSubmit({ name: name.trim(), icon, color, type })
  }

  return (
    <div className="bg-surface border border-border rounded-lg p-4 space-y-4">
      <SectionLabel>{initial?.id ? t('category.editCategory') : t('category.createCategory')}</SectionLabel>

      {/* Type toggle — one segmented style (lime), never coral */}
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
        <label className="block font-mono text-[11px] uppercase tracking-widest text-secondary mb-2">{t('category.icon')}</label>
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
        <label className="block font-mono text-[11px] uppercase tracking-widest text-secondary mb-2">{t('category.color')}</label>
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

      {/* Preview */}
      <div className="flex items-center gap-3">
        <span className="font-mono text-[11px] uppercase tracking-widest text-secondary">{t('common.preview')}</span>
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium"
          style={{ backgroundColor: `${color}20`, border: `1.5px solid ${color}`, color }}
        >
          <span aria-hidden="true">{icon}</span>
          <span className="font-mono text-[12px]">{name || t('common.preview')}</span>
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <Button variant="outline" onClick={onCancel} className="flex-1">{t('common.cancel')}</Button>
        <Button onClick={handleSubmit} disabled={isPending || !name.trim()} className="flex-1">
          {isPending ? t('common.saving') : initial?.id ? t('common.saveChanges') : t('category.createCategoryShort')}
        </Button>
      </div>
    </div>
  )
}
