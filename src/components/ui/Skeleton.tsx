import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn('animate-pulse bg-surface-2 dark:bg-dark-surface-2 rounded', className)} />
}

export function CardSkeleton() {
  return (
    <div className="card p-4 space-y-3">
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-3 w-1/3" />
    </div>
  )
}

export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-md border border-border dark:border-dark-border bg-surface dark:bg-dark-surface">
          <Skeleton className="w-10 h-10 rounded-full shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <Skeleton className="w-20 h-4" />
        </div>
      ))}
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      {/* Zone A */}
      <div className="card p-5 space-y-4">
        <div className="text-center pb-4 border-b border-border dark:border-dark-border space-y-2">
          <Skeleton className="h-3 w-20 mx-auto" />
          <Skeleton className="h-8 w-40 mx-auto" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="text-center space-y-1">
              <Skeleton className="h-3 w-12 mx-auto" />
              <Skeleton className="h-4 w-20 mx-auto" />
            </div>
          ))}
        </div>
      </div>
      {/* Zone E */}
      <div className="card p-4 space-y-2">
        <Skeleton className="h-3 w-24" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between p-3 bg-surface-2 dark:bg-dark-surface-2 rounded-md">
            <div className="space-y-1">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-7 w-20 rounded-sm" />
          </div>
        ))}
      </div>
    </div>
  )
}
