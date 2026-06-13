import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

/**
 * F9: route gating reads from a single source of truth — `authStore` — instead
 * of touching localStorage directly. This removes the login/redirect race where
 * the store and localStorage could disagree for a render.
 *
 * Token presence only gates rendering; true authorization is enforced by the
 * API (401 handling lives in the axios client).
 */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token)
  if (!token) return <Navigate to="/login" replace />
  return <>{children}</>
}
