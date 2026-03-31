import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: string
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ icon = '📭', title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4 text-center', className)}>
      <span className="text-4xl mb-3">{icon}</span>
      <h3 className="text-sm font-medium text-primary dark:text-dark-primary mb-1">{title}</h3>
      {description && <p className="text-xs text-muted dark:text-dark-muted max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
