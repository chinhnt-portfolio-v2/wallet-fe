import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: string
  title: string
  description?: string
  action?: React.ReactNode
  /** Optional example chips rendered under the description (e.g. suggestions). */
  examples?: string[]
  className?: string
}

export function EmptyState({ icon = '📭', title, description, action, examples, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4 text-center', className)}>
      <span className="text-4xl mb-3" aria-hidden="true">{icon}</span>
      <h3 className="text-sm font-medium text-primary mb-1">{title}</h3>
      {description && <p className="text-xs text-secondary max-w-xs leading-relaxed">{description}</p>}
      {examples && examples.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
          {examples.map((ex) => (
            <span
              key={ex}
              className="font-mono text-[11px] text-secondary bg-surface-2 border border-border rounded-full px-2.5 py-1"
            >
              {ex}
            </span>
          ))}
        </div>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
