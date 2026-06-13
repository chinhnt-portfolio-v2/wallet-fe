import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
}

export function BottomSheet({ open, onClose, title, children, className }: BottomSheetProps) {
  const { t } = useTranslation()
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      requestAnimationFrame(() => closeButtonRef.current?.focus())
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

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
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={cn(
          'relative bg-surface w-full max-w-md rounded-t-2xl sm:rounded-2xl',
          'shadow-xl max-h-[90vh] flex flex-col overflow-hidden',
          'animate-slide-up',
          className
        )}
      >
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-border shrink-0">
          {title && (
            <p className="text-sm font-semibold text-primary">{title}</p>
          )}
          <button
            ref={closeButtonRef}
            onClick={onClose}
            aria-label={t('common.close')}
            className="text-muted hover:text-primary text-xl transition-colors ml-auto"
          >
            &times;
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-5 py-4">
          {children}
        </div>
      </div>
    </div>
  )
}
