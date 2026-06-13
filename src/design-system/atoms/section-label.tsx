import type { ReactNode } from 'react'

interface SectionLabelProps {
  children: ReactNode
  right?: ReactNode
  className?: string
}

/**
 * Small uppercase mono label with rule + tick. Editorial divider for content sections.
 *
 * Legibility floor (audit §3): informational micro-labels render at min 11px and the
 * `text-muted` tier (45% opacity). The 28% `text-faint` tier is reserved for purely
 * decorative elements (the crosshair tick + the hairline rule), never for readable copy.
 */
export function SectionLabel({ children, right, className }: SectionLabelProps) {
  return (
    <div className={`flex items-center gap-2 ${className ?? ''}`}>
      <Tick />
      <span className="font-mono text-[11px] uppercase tracking-widest text-muted">
        {children}
      </span>
      <div className="flex-1 h-px bg-border" />
      {right && (
        <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted">
          {right}
        </span>
      )}
    </div>
  )
}

interface TickProps {
  size?: number
  className?: string
}

/** Decorative crosshair tick — used as bullet/separator. */
export function Tick({ size = 8, className }: TickProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 10 10"
      className={`shrink-0 text-faint ${className ?? ''}`}
    >
      <path d="M5 0v10M0 5h10" stroke="currentColor" strokeWidth="1" />
    </svg>
  )
}
