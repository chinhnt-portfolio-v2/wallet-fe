import { type CSSProperties } from 'react'

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

/** Tabular mono VND amount. Pairs with DisplayAmount for hero values. */
export function Amount({
  value,
  size = 14,
  sign = false,
  dim = false,
  weight = 400,
  className,
  style,
  bare = false,
}: AmountProps) {
  const v = Math.round(value)
  const s = Math.abs(v).toLocaleString('en-US')
  const signCh = v < 0 ? '−' : sign && v > 0 ? '+' : ''
  return (
    <span
      className={`font-mono tabular whitespace-nowrap ${className ?? ''}`}
      style={{
        fontSize: size,
        fontWeight: weight,
        lineHeight: 1,
        letterSpacing: '-0.01em',
        opacity: dim ? 0.5 : 1,
        ...style,
      }}
    >
      {signCh}
      {s}
      {!bare && (
        <span
          style={{
            marginLeft: size * 0.1,
            color: dim ? 'inherit' : 'var(--color-text-muted)',
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

/** Editorial hero amount — Instrument Serif italic + VND tag. */
export function DisplayAmount({ value, size = 76, sub, className }: DisplayAmountProps) {
  const v = Math.round(value)
  const s = Math.abs(v).toLocaleString('en-US')
  return (
    <div className={`flex items-baseline gap-2.5 ${className ?? ''}`}>
      <span
        className="font-display tabular text-primary"
        style={{
          fontSize: size,
          lineHeight: 0.92,
          letterSpacing: '-0.015em',
          fontStyle: 'italic',
          fontWeight: 400,
        }}
      >
        {v < 0 ? '−' : ''}
        {s}
      </span>
      <span
        className="font-mono text-muted"
        style={{ fontSize: size * 0.22, letterSpacing: '0.04em' }}
      >
        VND
      </span>
      {sub && (
        <span className="font-mono text-muted text-[11px] ml-1.5">{sub}</span>
      )}
    </div>
  )
}
