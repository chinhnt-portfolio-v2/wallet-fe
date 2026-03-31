import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'positive' | 'negative' | 'neutral' | 'accent' | 'warning'
  className?: string
}

const variants = {
  positive: 'bg-positive/10 text-positive dark:bg-dark-positive/10 dark:text-dark-positive',
  negative: 'bg-negative/10 text-negative dark:bg-dark-negative/10 dark:text-dark-negative',
  neutral: 'bg-surface-2 text-muted dark:bg-dark-surface-2 dark:text-dark-muted',
  accent:  'bg-accent/10 text-accent  dark:bg-dark-accent/10  dark:text-dark-accent',
  warning: 'bg-warning/10 text-warning dark:bg-dark-warning/10 dark:text-dark-warning',
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
