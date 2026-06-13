import type { ReactNode } from 'react'

interface SectionLabelProps {
  children: ReactNode
  right?: ReactNode
  className?: string
}

/**
 * Eyebrow section label — PJS 800, uppercase, 0.07em tracking.
 * Minh: `text-[10px] font-extrabold uppercase tracking-[0.07em] text-muted`.
 */
export function SectionLabel({ children, right, className }: SectionLabelProps) {
  return (
    <div className={`flex items-center gap-2 ${className ?? ''}`}>
      <Tick />
      <span className="text-[10px] font-extrabold uppercase tracking-[0.07em] text-muted">
        {children}
      </span>
      <div className="flex-1 h-px bg-line" />
      {right && (
        <span className="text-[10px] font-extrabold uppercase tracking-[0.07em] text-muted">
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
      className={`shrink-0 text-muted ${className ?? ''}`}
    >
      <path d="M5 0v10M0 5h10" stroke="currentColor" strokeWidth="1" />
    </svg>
  )
}
