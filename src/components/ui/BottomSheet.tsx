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

const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

function getFocusable(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS))
}

export function BottomSheet({ open, onClose, title, children, className }: BottomSheetProps) {
  const { t } = useTranslation()
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  // Scroll lock + initial focus
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      requestAnimationFrame(() => closeButtonRef.current?.focus())
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  // ESC to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  // Focus trap: cycle Tab/Shift+Tab within panel's focusable elements
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !panelRef.current) return
      const focusable = getFocusable(panelRef.current)
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end sm:items-center sm:justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* Scrim — Minh: rgba(15,23,42,.28) + blur */}
      <div
        className="absolute inset-0 backdrop-blur-sm"
        style={{ background: 'rgba(15,23,42,.28)' }}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        className={cn(
          'relative bg-surface w-full max-w-md rounded-t-xl sm:rounded-xl',
          'shadow-modal max-h-[90vh] flex flex-col overflow-hidden',
          'animate-slide-up',
          className,
        )}
      >
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-line shrink-0">
          {title && (
            <p className="text-sm font-semibold text-ink">{title}</p>
          )}
          <button
            ref={closeButtonRef}
            onClick={onClose}
            aria-label={t('common.close')}
            className="text-muted hover:text-ink text-xl transition-colors ml-auto"
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
