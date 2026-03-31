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
          <label className="block text-xs font-medium text-secondary dark:text-dark-secondary">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full rounded-sm border bg-surface dark:bg-dark-surface px-3 py-2 text-sm text-primary dark:text-dark-primary',
            'placeholder:text-muted dark:placeholder:text-dark-muted',
            'focus:outline-none',
            'focus:ring-2 focus:ring-accent/30 focus:border-accent',
            'dark:focus:ring-dark-accent/30 dark:focus:border-dark-accent',
            'transition-all duration-150',
            error
              ? 'border-negative dark:border-dark-negative focus:ring-negative/30 dark:focus:ring-dark-negative/30 focus:border-negative dark:focus:border-dark-negative'
              : 'border-border dark:border-dark-border',
            className
          )}
          {...props}
        />
        {hint && !error && <p className="text-xs text-muted dark:text-dark-muted">{hint}</p>}
        {error && <p className="text-xs text-negative dark:text-dark-negative">{error}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'
