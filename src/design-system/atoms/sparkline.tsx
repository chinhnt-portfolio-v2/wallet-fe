import { useId } from 'react'

interface SparklineProps {
  points: number[]
  /** Internal viewBox width. SVG scales to its container via w-full. */
  width?: number
  /** Internal viewBox height. */
  height?: number
  color?: string
  fill?: boolean
  dotLast?: boolean
  className?: string
}

/**
 * Compact line + area chart for cash-flow / spend trends.
 *
 * Responsive: renders into a fixed viewBox and stretches to the container width
 * (`w-full`) with `preserveAspectRatio="none"` — so callers (e.g. Dashboard mobile)
 * can constrain width without the SVG overflowing the viewport. The line is a smooth
 * Catmull-Rom curve and the area fades to transparent via a vertical gradient.
 */
export function Sparkline({
  points,
  width = 220,
  height = 60,
  color = 'var(--color-accent)',
  fill = true,
  dotLast = true,
  className,
}: SparklineProps) {
  const gradientId = useId()
  if (!points || points.length === 0) return null

  const min = Math.min(...points)
  const max = Math.max(...points)
  const span = max - min || 1
  const xs = points.map((_, i) => (i / Math.max(1, points.length - 1)) * width)
  const ys = points.map((p) => height - ((p - min) / span) * (height - 6) - 3)

  const line = smoothPath(xs, ys)
  const area = `${line} L${width} ${height} L0 ${height} Z`

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={`block w-full ${className ?? ''}`}
      style={{ height }}
      role="img"
    >
      {fill && (
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.22} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
      )}
      {fill && <path d={area} fill={`url(#${gradientId})`} />}
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      {dotLast && (
        <circle
          cx={xs[xs.length - 1]}
          cy={ys[ys.length - 1]}
          r={2.5}
          fill={color}
          vectorEffect="non-scaling-stroke"
        />
      )}
    </svg>
  )
}

/** Smooth path through points using a Catmull-Rom → cubic-bezier conversion. */
function smoothPath(xs: number[], ys: number[]): string {
  if (xs.length < 2) return `M${xs[0]?.toFixed(1) ?? 0} ${ys[0]?.toFixed(1) ?? 0}`
  let d = `M${xs[0].toFixed(1)} ${ys[0].toFixed(1)}`
  for (let i = 0; i < xs.length - 1; i++) {
    const x0 = xs[i === 0 ? 0 : i - 1]
    const y0 = ys[i === 0 ? 0 : i - 1]
    const x1 = xs[i]
    const y1 = ys[i]
    const x2 = xs[i + 1]
    const y2 = ys[i + 1]
    const x3 = xs[i + 2 < xs.length ? i + 2 : i + 1]
    const y3 = ys[i + 2 < ys.length ? i + 2 : i + 1]
    const c1x = x1 + (x2 - x0) / 6
    const c1y = y1 + (y2 - y0) / 6
    const c2x = x2 - (x3 - x1) / 6
    const c2y = y2 - (y3 - y1) / 6
    d += ` C${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${x2.toFixed(1)} ${y2.toFixed(1)}`
  }
  return d
}
