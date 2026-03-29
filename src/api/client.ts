import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/api/v1`
  : '/api/v1'

// ─── Token Refresh State ────────────────────────────────────────────────────

let isRefreshing = false
let refreshSubscribers: Array<(token: string) => void> = []

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb)
}

function onRefreshComplete(newToken: string) {
  refreshSubscribers.forEach((cb) => cb(newToken))
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
        // Another refresh is already in-flight; queue this request.
        return new Promise((resolve) => {
          subscribeTokenRefresh((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            resolve(apiClient(originalRequest))
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
        .catch(() => {
          isRefreshing = false
          // Tokens already cleared + redirect inside refreshAccessToken()
          return Promise.reject(
            new Error('Hết phiên đăng nhập. Đang chuyển về trang đăng nhập...')
          )
        })
    }

    // ── Non-401 errors: humanize message ───────────────────────────────────
    const status = error.response?.status
    let message = 'Có lỗi xảy ra. Vui lòng thử lại.'

    if (status === 400) {
      message = 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.'
    } else if (status === 403) {
      message = 'Bạn không có quyền thực hiện thao tác này.'
    } else if (status === 404) {
      message = 'Không tìm thấy dữ liệu.'
    } else if (status === 409) {
      message = 'Dữ liệu bị xung đột. Vui lòng thử lại.'
    } else if (status === 422) {
      const detail = error.response?.data?.detail
      message = typeof detail === 'string' ? detail : 'Thông tin không hợp lệ. Vui lòng kiểm tra lại.'
    } else if (status === 429) {
      message = 'Thao tác quá nhanh. Vui lòng chở một chút rồi thử lại.'
    } else if (status === 500) {
      message = 'Máy chủ đang bận. Vui lòng thử lại sau.'
    } else if (!navigator.onLine) {
      message = 'Không có kết nối internet. Vui lòng kiểm tra mạng.'
    } else if (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK') {
      message = 'Kết nối bị gián đoạn. Vui lòng thử lại.'
    }

    return Promise.reject(new Error(message))
  }
)
