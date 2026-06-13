import { CategoryChip } from '@/design-system'

interface CategoryItem {
  id: number
  name: string
  icon: string
  type: string
}

interface CategoryGridProps {
  categories: CategoryItem[]
  selectedId: number | null
  onSelect: (id: number | null) => void
  /** aria-label for the grid region */
  ariaLabel?: string
}

/**
 * 4-column selectable category icon grid.
 * Selected cell: bg-primary-soft + border-primary.
 * Each cell min-h-[44px] for touch target compliance.
 */
export function CategoryGrid({
  categories,
  selectedId,
  onSelect,
  ariaLabel,
}: CategoryGridProps) {
  if (categories.length === 0) return null

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="grid grid-cols-4 gap-2"
    >
      {categories.map((c) => {
        const selected = selectedId === c.id
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => onSelect(selected ? null : c.id)}
            aria-pressed={selected}
            aria-label={c.name}
            className={`min-h-[44px] flex flex-col items-center justify-center gap-1.5 px-1 py-2 rounded-lg border transition-colors ${
              selected
                ? 'border-primary bg-primary-soft'
                : 'border-line bg-surface hover:bg-hover'
            }`}
          >
            <CategoryChip
              cat={c.name.toLowerCase()}
              name={c.name}
              size={26}
            />
            <span
              className={`text-[10px] font-semibold text-center leading-none truncate w-full px-0.5 ${
                selected ? 'text-primary' : 'text-sub'
              }`}
            >
              {c.name}
            </span>
          </button>
        )
      })}
    </div>
  )
}
