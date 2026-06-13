/**
 * SVG circular progress ring for debt detail.
 * Shows % paid as a stroke-dasharray arc.
 * Accessible: role="img" + aria-label (required — callers must always pass ariaLabel).
 * Reduced-motion: arc transition disabled under prefers-reduced-motion.
 */

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  )
}

interface DebtProgressRingProps {
  /** 0..1 ratio (clamped). */
  pct: number
  /** Ring outer diameter in px. Default 120. */
  size?: number
  /** Stroke thickness. Default 10. */
  strokeWidth?: number
  /** Primary stroke color token (CSS var). Defaults to var(--primary). */
  color?: string
  /** Track color. Defaults to var(--surface-2). */
  trackColor?: string
  /** Full aria-label for screen readers. Required — no hardcoded fallback. */
  ariaLabel: string
}

export function DebtProgressRing({
  pct,
  size = 120,
  strokeWidth = 10,
  color = 'var(--primary)',
  trackColor = 'var(--surface-2)',
  ariaLabel,
}: DebtProgressRingProps) {
  const clamped = Math.min(1, Math.max(0, pct))
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - clamped)
  const pctInt = Math.round(clamped * 100)
  const center = size / 2
  const reduceMotion = prefersReducedMotion()

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={ariaLabel}
      className="shrink-0"
    >
      {/* track */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={trackColor}
        strokeWidth={strokeWidth}
      />
      {/* filled arc — starts at top (−90°); transition disabled under reduced-motion */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${center} ${center})`}
        style={reduceMotion ? undefined : { transition: 'stroke-dashoffset 0.5s ease' }}
      />
      {/* center label */}
      <text
        x={center}
        y={center + 1}
        textAnchor="middle"
        dominantBaseline="middle"
        className="font-sans"
        style={{
          fontSize: size < 100 ? '14px' : '18px',
          fontWeight: 800,
          fill: 'var(--ink)',
          fontFamily: 'Plus Jakarta Sans, sans-serif',
          letterSpacing: '-0.02em',
        }}
      >
        {pctInt}%
      </text>
    </svg>
  )
}
