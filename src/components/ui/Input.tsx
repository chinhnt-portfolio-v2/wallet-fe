import type { InputHTMLAttributes } from 'react'
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-xs font-medium text-sub">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full rounded-sm border bg-surface px-3 py-2 text-sm text-ink',
            'placeholder:text-muted',
            'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
            'transition-all duration-150',
            error ? 'border-negative focus:ring-negative/20 focus:border-negative' : 'border-line',
            className
          )}
          {...props}
        />
        {hint && !error && <p className="text-xs text-muted">{hint}</p>}
        {error && <p className="text-xs text-negative">{error}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'
