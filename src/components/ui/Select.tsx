import type { SelectHTMLAttributes } from 'react'
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: Array<{ value: string; label: string }>
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-xs font-medium text-sub">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={cn(
            'w-full rounded-sm border bg-surface px-3 py-2 text-sm text-ink',
            'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
            'transition-all duration-150 cursor-pointer',
            error ? 'border-negative' : 'border-line',
            className
          )}
          {...props}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        {error && <p className="text-xs text-negative">{error}</p>}
      </div>
    )
  }
)
Select.displayName = 'Select'
