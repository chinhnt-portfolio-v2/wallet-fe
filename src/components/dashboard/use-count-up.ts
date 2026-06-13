import { useEffect, useRef, useState } from 'react'

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  )
}

/**
 * Animates from 0 → `target` over `durationMs` (ease-out cubic) using rAF.
 * Fires ONCE on mount. Under `prefers-reduced-motion` or when target is 0,
 * returns `target` immediately (state initialised to target, no animation).
 */
export function useCountUp(target: number, durationMs = 800): number {
  // Lazy initialiser: if reduced-motion or no value, start at target (no flash)
  const [value, setValue] = useState<number>(() =>
    prefersReducedMotion() || target === 0 ? target : 0,
  )
  const hasAnimatedRef = useRef(false)

  useEffect(() => {
    // Skip if already ran, or no-op cases
    if (hasAnimatedRef.current) return
    if (prefersReducedMotion() || target === 0) {
      hasAnimatedRef.current = true
      return
    }

    hasAnimatedRef.current = true
    let rafId = 0
    let startTime: number | null = null

    const tick = (now: number) => {
      if (startTime === null) startTime = now
      const elapsed = now - startTime
      const t = Math.min(1, elapsed / durationMs)
      const eased = 1 - Math.pow(1 - t, 3) // ease-out cubic
      setValue(Math.round(target * eased))
      if (t < 1) {
        rafId = requestAnimationFrame(tick)
      }
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // mount-only: hasAnimatedRef guards against re-runs

  // Keep value in sync if target changes after first mount (no re-animation)
  useEffect(() => {
    if (hasAnimatedRef.current) {
      setValue(target)
    }
  }, [target])

  return value
}
