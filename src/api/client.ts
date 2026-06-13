import axios from 'axios'
import i18n from '@/i18n'

// Dev: use relative /api/v1 so Vite proxy (vite.config.ts) forwards to backend
// (avoids CORS). Prod: use absolute VITE_API_BASE_URL for direct calls.
const BASE_URL = import.meta.env.DEV
  ? '/api/v1'
  : import.meta.env.VITE_API_BASE_URL
    ? `${import.meta.env.VITE_API_BASE_URL}/api/v1`
    : '/api/v1'

// ─── Token Refresh State ────────────────────────────────────────────────────

let isRefreshing = false

// Queued 401 requests waiting on an in-flight refresh. Both callbacks are kept
// so a failed refresh can reject every waiter (otherwise they hang forever).
interface RefreshSubscriber {
  resolve: (token: string) => void
  reject: (err: unknown) => void
}
let refreshSubscribers: RefreshSubscriber[] = []

function subscribeTokenRefresh(subscriber: RefreshSubscriber) {
  refreshSubscribers.push(subscriber)
}

function onRefreshComplete(newToken: string) {
  refreshSubscribers.forEach((s) => s.resolve(newToken))
  refreshSubscribers = []
}

function onRefreshFailed(err: unknown) {
  refreshSubscribers.forEach((s) => s.reject(err))
  refreshSubscribers = []
}

async function refreshAccessToken(): Promise<string> {
  const refreshToken = localStorage.getItem('wallet_refresh_token')

  const response = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })

  if (!response.ok) {
    localStorage.removeItem('wallet_token')
    localStorage.removeItem('wallet_refresh_token')
    window.location.href = '/login'
    throw new Error('Refresh failed')
  }

  const data = await response.json()
  const newToken = data.accessToken
  localStorage.setItem('wallet_token', newToken)
  if (data.refreshToken) {
    localStorage.setItem('wallet_refresh_token', data.refreshToken)
  }
  return newToken
}

// ─── Axios Client ───────────────────────────────────────────────────────────

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
})

export const { get, post, put, delete: del, patch } = apiClient
export default apiClient

// ─── Request Interceptor ───────────────────────────────────────────────────

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('wallet_token')
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ─── Response Interceptor ──────────────────────────────────────────────────

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config

    // ── 401: Token refresh flow ────────────────────────────────────────────
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Another refresh is already in-flight; queue this request. If the
        // refresh fails, reject() flushes us so the caller doesn't hang.
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`
              resolve(apiClient(originalRequest))
            },
            reject,
          })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      return refreshAccessToken()
        .then((newToken: string) => {
          onRefreshComplete(newToken)
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          isRefreshing = false
          return apiClient(originalRequest)
        })
        .catch((err: unknown) => {
          isRefreshing = false
          // Flush queued requests with the failure so they don't hang forever.
          const sessionError = new Error(i18n.t('errors.sessionExpired'))
          onRefreshFailed(sessionError)
          // Tokens already cleared + redirect inside refreshAccessToken()
          void err
          return Promise.reject(sessionError)
        })
    }

    // ── Non-401 errors: humanize message (via i18n, EN/VI parity) ──────────
    const status = error.response?.status
    let message = i18n.t('errors.generic')

    if (status === 400) {
      message = i18n.t('errors.badRequest')
    } else if (status === 403) {
      message = i18n.t('errors.forbidden')
    } else if (status === 404) {
      message = i18n.t('errors.notFound')
    } else if (status === 409) {
      message = i18n.t('errors.conflict')
    } else if (status === 422) {
      const detail = error.response?.data?.detail
      message = typeof detail === 'string' ? detail : i18n.t('errors.unprocessable')
    } else if (status === 429) {
      message = i18n.t('errors.tooManyRequests')
    } else if (status === 500) {
      message = i18n.t('errors.server')
    } else if (!navigator.onLine) {
      message = i18n.t('errors.offline')
    } else if (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK') {
      message = i18n.t('errors.network')
    }

    return Promise.reject(new Error(message))
  }
)
