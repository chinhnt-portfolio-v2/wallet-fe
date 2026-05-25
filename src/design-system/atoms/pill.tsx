import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface PillProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  /** Filled acid-lime variant — use for primary actions. */
  accent?: boolean
  /** Outlined transparent variant — use for secondary actions. */
  ghost?: boolean
}

/** Small uppercase mono pill button. Three variants: default, accent, ghost. */
export function Pill({ children, accent, ghost, className, style, ...rest }: PillProps) {
  const base =
    'inline-flex items-center gap-1.5 h-7 px-3 rounded-full font-mono text-[11px] uppercase tracking-[0.05em] border-0 cursor-pointer transition-colors'
  const variant = accent
    ? 'bg-accent text-accent-ink hover:brightness-105'
    : ghost
      ? 'bg-transparent text-primary shadow-[inset_0_0_0_1px_var(--color-border-hi)] hover:bg-surface-2'
      : 'bg-surface-2 text-primary hover:bg-surface-3'
  return (
    <button {...rest} className={`${base} ${variant} ${className ?? ''}`} style={style}>
      {children}
    </button>
  )
}
