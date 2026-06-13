import { cn } from '@/lib/utils'

export interface SegmentedOption<T extends string = string> {
  value: T
  label: string
}

interface SegmentedControlProps<T extends string = string> {
  options: SegmentedOption<T>[]
  value: T
  onChange: (value: T) => void
  size?: 'sm' | 'md'
  /** Accessible group label (visually hidden). */
  ariaLabel?: string
  className?: string
}

const sizeStyles = {
  sm: 'h-7 text-[11px] px-2.5',
  md: 'h-9 text-xs px-3',
}

/**
 * The single segmented-control for the app (audit §3 / checklist 19).
 *
 * One active style everywhere: lime pill (`bg-accent` + ink text). Replaces the
 * three divergent active styles (lime / dark / coral) found across Transactions,
 * Debts, Categories and Wishlist. Selected state is never coral — coral is the
 * negative/error color and must not double as "selected".
 *
 * Touch targets meet the 44px floor at `md` via the wrapper padding; `sm` is for
 * dense desktop toolbars only.
 */
export function SegmentedControl<T extends string = string>({
  options,
  value,
  onChange,
  size = 'md',
  ariaLabel,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        'inline-flex items-center gap-1 rounded-lg border border-border bg-surface-2 p-1',
        className
      )}
    >
      {options.map((opt) => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              'rounded-md font-mono uppercase tracking-wider transition-colors duration-150',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40',
              sizeStyles[size],
              active
                ? 'bg-accent text-accent-ink font-semibold'
                : 'text-muted hover:text-primary'
            )}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
