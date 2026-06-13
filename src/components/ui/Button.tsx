import { cn } from '@/lib/utils'
import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'outline' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

const variants = {
  primary: 'bg-primary text-primary-ink hover:bg-primary-hover shadow-button',
  ghost: 'bg-transparent text-sub hover:bg-hover',
  outline: 'border border-line bg-transparent text-sub hover:bg-hover',
  danger: 'bg-negative text-white hover:bg-negative/90',
}

const sizes = {
  sm: 'h-7 px-3 text-xs rounded-sm',
  md: 'h-9 px-4 text-sm rounded-md',
  lg: 'h-11 px-5 text-sm rounded-md',
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
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        'disabled:opacity-50 disabled:pointer-events-none',
        'active:scale-[.98]',
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
