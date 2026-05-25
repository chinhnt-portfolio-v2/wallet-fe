interface CategoryChipProps {
  /** Category id used to look up hue + label. Falls back to "other". */
  cat: string
  /** Human-readable name (first letter is rendered as the glyph). */
  name?: string
  /** Hue 0-360 for oklch coloring. */
  hue?: number
  size?: number
  className?: string
}

const CATEGORY_HUES: Record<string, { hue: number; label: string }> = {
  food: { hue: 18, label: 'Food' },
  coffee: { hue: 32, label: 'Coffee' },
  transit: { hue: 200, label: 'Transit' },
  rent: { hue: 260, label: 'Rent' },
  shopping: { hue: 320, label: 'Shopping' },
  health: { hue: 140, label: 'Health' },
  fun: { hue: 80, label: 'Fun' },
  other: { hue: 0, label: 'Other' },
}

/** Square hue-tinted category badge. Renders the first letter of the category name. */
export function CategoryChip({ cat, name, hue, size = 28, className }: CategoryChipProps) {
  const fallback = CATEGORY_HUES[cat] ?? CATEGORY_HUES.other
  const effectiveHue = hue ?? fallback.hue
  const effectiveName = name ?? fallback.label
  const bg = `oklch(0.32 0.06 ${effectiveHue})`
  const fg = `oklch(0.78 0.16 ${effectiveHue})`
  return (
    <div
      className={`flex items-center justify-center font-mono font-medium shrink-0 ${className ?? ''}`}
      style={{
        width: size,
        height: size,
        borderRadius: 8,
        background: bg,
        color: fg,
        fontSize: size * 0.5,
      }}
    >
      {effectiveName[0]?.toUpperCase()}
    </div>
  )
}
