import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface PillProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  /** Primary brand variant — use for primary actions. */
  accent?: boolean
  /** Outlined transparent variant — use for secondary actions. */
  ghost?: boolean
}

/** Small uppercase pill button. Three variants: default, accent (→primary), ghost. */
export function Pill({ children, accent, ghost, className, style, ...rest }: PillProps) {
  const base =
    'inline-flex items-center gap-1.5 h-7 px-3 rounded-full font-sans text-[11px] uppercase tracking-[0.05em] border-0 cursor-pointer transition-colors'
  const variant = accent
    ? 'bg-primary text-primary-ink hover:bg-primary-hover'
    : ghost
      ? 'bg-transparent text-sub border border-line hover:bg-hover'
      : 'bg-surface-2 text-sub hover:bg-hover'
  return (
    <button {...rest} className={`${base} ${variant} ${className ?? ''}`} style={style}>
      {children}
    </button>
  )
}
