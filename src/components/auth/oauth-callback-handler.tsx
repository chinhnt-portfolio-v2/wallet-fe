import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

export function OAuthCallbackHandler() {
  const navigate = useNavigate()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    const accessToken = params.get('accessToken')
    const refreshToken = params.get('refreshToken')

    if (code) {
      fetch('/api/v1/auth/oauth2/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
        credentials: 'include',
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.accessToken) {
            // Update zustand store (it persists to localStorage itself) so
            // ProtectedRoute/LoginPage, which read store state, see the session.
            if (data.refreshToken) {
              useAuthStore.getState().setTokens(data.accessToken, data.refreshToken)
            } else {
              useAuthStore.getState().setToken(data.accessToken)
            }
          }
          window.history.replaceState(null, '', '/')
          navigate('/', { replace: true })
        })
        .catch(() => {
          window.history.replaceState(null, '', '/login')
          navigate('/login', { replace: true })
        })
      return
    }

    if (accessToken && refreshToken) {
      useAuthStore.getState().setTokens(accessToken, refreshToken)
      window.history.replaceState(null, '', '/')
      navigate('/', { replace: true })
    }
  }, [navigate])

  return null
}
