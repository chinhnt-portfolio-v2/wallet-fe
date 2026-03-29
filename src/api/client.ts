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
      return Promise.reject(new Error('Hết phiên đăng nhập. Đang chuyển về trang đăng nhập...'))
    }

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
      message = 'Thao tác quá nhanh. Vui lòng chờ một chút rồi thử lại.'
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
