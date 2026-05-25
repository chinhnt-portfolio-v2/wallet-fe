interface SparklineProps {
  points: number[]
  width?: number
  height?: number
  color?: string
  fill?: boolean
  dotLast?: boolean
  className?: string
}

/** Compact line+area chart for cash-flow/spend trends. */
export function Sparkline({
  points,
  width = 220,
  height = 60,
  color = 'var(--color-accent)',
  fill = true,
  dotLast = true,
  className,
}: SparklineProps) {
  if (!points || points.length === 0) return null
  const min = Math.min(...points)
  const max = Math.max(...points)
  const span = max - min || 1
  const xs = points.map((_, i) => (i / (points.length - 1)) * width)
  const ys = points.map((p) => height - ((p - min) / span) * (height - 6) - 3)
  const d = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${ys[i].toFixed(1)}`).join(' ')
  const area = `${d} L${width} ${height} L0 ${height} Z`
  return (
    <svg width={width} height={height} className={`block ${className ?? ''}`}>
      {fill && <path d={area} fill={color} opacity={0.12} />}
      <path d={d} fill="none" stroke={color} strokeWidth={1.5} />
      {dotLast && <circle cx={xs[xs.length - 1]} cy={ys[ys.length - 1]} r={2.5} fill={color} />}
    </svg>
  )
}
