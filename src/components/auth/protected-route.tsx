import { Navigate } from 'react-router-dom'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('wallet_token')
  if (!token) return <Navigate to="/login" replace />
  return <>{children}</>
}
