import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const paddings = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-5',
}

export function Card({ children, className, padding = 'md' }: CardProps) {
  return (
    <div className={cn(
      'bg-surface dark:bg-dark-surface rounded-md border border-border dark:border-dark-border shadow-sm',
      paddings[padding],
      className
    )}>
      {children}
    </div>
  )
}
