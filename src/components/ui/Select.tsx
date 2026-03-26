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
          <label className="block text-xs font-medium text-secondary">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={cn(
            'w-full rounded-sm border bg-surface px-3 py-2 text-sm text-primary',
            'focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent',
            'transition-all duration-150 cursor-pointer',
            error ? 'border-negative' : 'border-border',
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
