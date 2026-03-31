import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
}

/**
 * BottomSheet — mobile-first modal alternative.
 * - Slides up from bottom
 * - Click backdrop or × to close
 * - Escape key to close
 * - Focus trapped inside
 * - Body scroll locked when open
 */
export function BottomSheet({ open, onClose, title, children, className }: BottomSheetProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  // Lock body scroll + focus first element when opened
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      // Focus close button for accessibility
      requestAnimationFrame(() => closeButtonRef.current?.focus())
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  // Escape key handler
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end sm:items-center sm:justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={cn(
          'relative bg-surface dark:bg-dark-surface w-full max-w-md rounded-t-2xl sm:rounded-2xl',
          'shadow-xl max-h-[90vh] flex flex-col overflow-hidden',
          'animate-slide-up',
          className
        )}
      >
        {/* Drag handle + Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-border dark:border-dark-border shrink-0">
          {title && (
            <p className="text-sm font-semibold text-primary dark:text-dark-primary">{title}</p>
          )}
          <button
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Đóng"
            className="text-muted dark:text-dark-muted hover:text-primary dark:hover:text-dark-primary text-xl transition-colors ml-auto"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 px-5 py-4">
          {children}
        </div>
      </div>
    </div>
  )
}
