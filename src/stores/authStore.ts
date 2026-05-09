import { create } from 'zustand'

interface AuthState {
  token: string | null
  refreshToken: string | null
  setToken: (token: string) => void
  setTokens: (accessToken: string, refreshToken: string) => void
  clearToken: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('wallet_token'),
  refreshToken: localStorage.getItem('wallet_refresh_token'),
  setToken: (token) => {
    localStorage.setItem('wallet_token', token)
    set({ token })
  },
  setTokens: (accessToken, refreshToken) => {
    localStorage.setItem('wallet_token', accessToken)
    localStorage.setItem('wallet_refresh_token', refreshToken)
    set({ token: accessToken, refreshToken })
  },
  clearToken: () => {
    localStorage.removeItem('wallet_token')
    localStorage.removeItem('wallet_refresh_token')
    set({ token: null, refreshToken: null })
  },
}))
