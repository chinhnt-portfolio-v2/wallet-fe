import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/api/v1`
  : '/api/v1'

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
})

export const { get, post, put, delete: del, patch } = apiClient
export default apiClient

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('wallet_token')
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('wallet_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
