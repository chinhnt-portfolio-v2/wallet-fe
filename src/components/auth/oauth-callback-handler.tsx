import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

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
            localStorage.setItem('wallet_token', data.accessToken)
            localStorage.setItem('wallet_refresh_token', data.refreshToken ?? '')
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
      localStorage.setItem('wallet_token', accessToken)
      localStorage.setItem('wallet_refresh_token', refreshToken)
      window.history.replaceState(null, '', '/')
      navigate('/', { replace: true })
    }
  }, [navigate])

  return null
}
