import { type CSSProperties } from 'react'
import { formatVndDigits } from '@/lib/utils'

interface AmountProps {
  value: number
  size?: number
  sign?: boolean
  dim?: boolean
  weight?: number
  className?: string
  style?: CSSProperties
  /** Hide the ₫ suffix */
  bare?: boolean
}

/** Tabular PJS VND amount. Pairs with DisplayAmount for hero values. */
export function Amount({
  value,
  size = 14,
  sign = false,
  dim = false,
  weight = 500,
  className,
  style,
  bare = false,
}: AmountProps) {
  const v = Math.round(value)
  const s = formatVndDigits(v)
  const signCh = v < 0 ? '−' : sign && v > 0 ? '+' : ''
  // When a caller overrides color (e.g. white text on a colored surface), the ₫
  // suffix follows that color via currentColor instead of the fixed muted grey —
  // otherwise the inline default would render dark on a tinted background.
  const hasColorOverride = style?.color != null
  return (
    <span
      className={`tabular-nums whitespace-nowrap ${className ?? ''}`}
      style={{
        fontSize: size,
        fontWeight: weight,
        lineHeight: 1,
        letterSpacing: '-0.01em',
        opacity: dim ? 0.5 : 1,
        color: dim ? 'var(--muted)' : 'var(--ink)',
        ...style,
      }}
    >
      {signCh}
      {s}
      {!bare && (
        <span
          style={{
            marginLeft: size * 0.1,
            color: hasColorOverride ? 'currentColor' : 'var(--muted)',
            opacity: hasColorOverride ? 0.7 : 1,
            fontSize: size * 0.7,
          }}
        >
          ₫
        </span>
      )}
    </span>
  )
}

interface DisplayAmountProps {
  value: number
  size?: number
  sub?: string
  className?: string
}

/** Hero amount — Plus Jakarta Sans 800, tabular-nums, no italic serif. */
export function DisplayAmount({ value, size = 76, sub, className }: DisplayAmountProps) {
  const v = Math.round(value)
  const s = formatVndDigits(v)
  return (
    <div className={`flex items-baseline gap-2.5 ${className ?? ''}`}>
      <span
        className="tabular-nums text-ink"
        style={{
          fontSize: size,
          lineHeight: 0.92,
          letterSpacing: '-0.025em',
          fontWeight: 800,
        }}
      >
        {v < 0 ? '−' : ''}
        {s}
      </span>
      <span
        className="text-muted"
        style={{ fontSize: size * 0.22, letterSpacing: '0.04em', fontWeight: 600 }}
      >
        VND
      </span>
      {sub && (
        <span className="text-muted text-[11px] ml-1.5">{sub}</span>
      )}
    </div>
  )
}
