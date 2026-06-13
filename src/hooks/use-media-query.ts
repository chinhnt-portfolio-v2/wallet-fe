import { useSyncExternalStore } from 'react'

/**
 * Flash-safe media query hook using useSyncExternalStore.
 * Server/SSR snapshot is `false` to avoid hydration mismatch.
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      if (typeof window === 'undefined') return () => {}
      const mql = window.matchMedia(query)
      mql.addEventListener('change', onChange)
      return () => mql.removeEventListener('change', onChange)
    },
    () => (typeof window !== 'undefined' ? window.matchMedia(query).matches : false),
    () => false,
  )
}

/** Matches Tailwind `sm` breakpoint (640px). Used by AddTransactionPage. */
export function useIsSm(): boolean {
  return useMediaQuery('(min-width: 640px)')
}

/** Matches Tailwind `md` breakpoint (768px). Used by RecurringPage. */
export function useIsMd(): boolean {
  return useMediaQuery('(min-width: 768px)')
}

/** Matches Tailwind `lg` breakpoint (1024px). Used by NotificationsPage. */
export function useIsLg(): boolean {
  return useMediaQuery('(min-width: 1024px)')
}
