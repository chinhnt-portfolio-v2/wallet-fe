interface ProgressBarProps {
  /** 0..1 ratio. Clamped. */
  pct: number
  height?: number
  color?: string
  background?: string
  /** When true, paint bar in danger color regardless of `color`. */
  over?: boolean
  className?: string
}

/**
 * Minimal rounded progress bar. Use over=true to surface overspend.
 *
 * Fancy (audit §4.5): the fill animates its width on mount/change via a CSS
 * transition. The transition is disabled under `prefers-reduced-motion: reduce`
 * (handled by the `.progress-fill` rule in index.css), so motion-sensitive users
 * see the bar snap to its final width with no tween.
 */
export function ProgressBar({
  pct,
  height = 4,
  color = 'var(--color-accent)',
  background = 'var(--color-border)',
  over = false,
  className,
}: ProgressBarProps) {
  const w = Math.min(100, Math.max(0, pct * 100))
  return (
    <div
      className={`relative overflow-hidden rounded-full ${className ?? ''}`}
      style={{ height, background }}
    >
      <div
        className="progress-fill absolute inset-y-0 left-0 rounded-full"
        style={{
          width: `${w}%`,
          background: over ? 'var(--color-negative)' : color,
        }}
      />
    </div>
  )
}
