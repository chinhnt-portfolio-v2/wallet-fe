import { useRef, useCallback } from 'react'
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
  /** Accessible group label (visually hidden if not placed visibly). Required for a11y. */
  ariaLabel?: string
  className?: string
}

const sizeStyles = {
  sm: 'h-7 text-[11px] px-2.5',
  md: 'h-9 text-xs px-3',
}

/**
 * Segmented control — Minh design.
 * ARIA: radiogroup + radio + aria-checked (correct for mutually-exclusive choice).
 * Keyboard: Left/Right and Up/Down arrows move + select; roving tabindex.
 * Track: `bg-surface-2` pill; active segment: `bg-primary text-primary-ink`.
 */
export function SegmentedControl<T extends string = string>({
  options,
  value,
  onChange,
  size = 'md',
  ariaLabel,
  className,
}: SegmentedControlProps<T>) {
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([])

  const moveTo = useCallback(
    (index: number) => {
      const next = (index + options.length) % options.length
      onChange(options[next].value)
      buttonRefs.current[next]?.focus()
    },
    [options, onChange],
  )

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      moveTo(index + 1)
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      moveTo(index - 1)
    }
  }

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn(
        'inline-flex items-center gap-1 rounded-lg border border-line bg-surface-2 p-1',
        className,
      )}
    >
      {options.map((opt, i) => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            ref={(el) => { buttonRefs.current[i] = el }}
            type="button"
            role="radio"
            aria-checked={active}
            /* Roving tabindex: only the selected option is in tab order */
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(opt.value)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            className={cn(
              'rounded-md font-sans font-semibold uppercase tracking-wider transition-colors duration-150',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
              sizeStyles[size],
              active
                ? 'bg-primary text-primary-ink'
                : 'text-muted hover:text-ink',
            )}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
