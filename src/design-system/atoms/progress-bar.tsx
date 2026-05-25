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

/** Minimal rounded progress bar. Use over=true to surface overspend. */
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
        className="absolute inset-0 rounded-full"
        style={{
          width: `${w}%`,
          background: over ? 'var(--color-negative)' : color,
        }}
      />
    </div>
  )
}
