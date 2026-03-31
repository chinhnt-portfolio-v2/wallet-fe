import { cn } from '@/lib/utils'
import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'accent' | 'ghost' | 'outline' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

const variants = {
  primary: 'bg-primary text-white hover:bg-primary/90 dark:bg-dark-primary',
  accent:  'bg-accent  text-white hover:bg-accent/90  dark:bg-dark-accent',
  ghost:   'bg-transparent text-secondary hover:bg-surface-2 dark:text-dark-secondary dark:hover:bg-dark-surface-2',
  outline: 'border border-border bg-transparent text-secondary hover:bg-surface-2 dark:border-dark-border dark:text-dark-secondary dark:hover:bg-dark-surface-2',
  danger:  'bg-negative text-white hover:bg-negative/90 dark:bg-dark-negative',
}

const sizes = {
  sm: 'h-7 px-3 text-xs rounded-sm',
  md: 'h-9 px-4 text-sm',
  lg: 'h-11 px-5 text-sm',
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium transition-all duration-150',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 dark:focus-visible:ring-dark-accent dark:focus-visible:ring-offset-dark-surface',
        'active:scale-95 disabled:opacity-50 disabled:pointer-events-none',
        'rounded-md',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
