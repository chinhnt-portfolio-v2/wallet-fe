import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
  /** Adds hover lift shadow — use for interactive cards. */
  lift?: boolean
}

const paddings = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-5',
}

export function Card({ children, className, padding = 'md', lift = false }: CardProps) {
  return (
    <div className={cn(
      'bg-surface rounded-lg border border-line',
      lift && 'hover:shadow-pop transition-shadow duration-150',
      paddings[padding],
      className
    )}>
      {children}
    </div>
  )
}
