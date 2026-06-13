import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'positive' | 'negative' | 'neutral' | 'primary' | 'warning'
  className?: string
}

const variants = {
  positive: 'bg-positive-soft text-positive',
  negative: 'bg-negative-soft text-negative',
  neutral: 'bg-surface-2 text-muted',
  primary: 'bg-primary-soft text-primary',
  warning: 'bg-warning-soft text-warning',
}

export function Badge({ children, variant = 'neutral', className }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
      variants[variant],
      className
    )}>
      {children}
    </span>
  )
}
