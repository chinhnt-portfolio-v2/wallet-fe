import { create } from 'zustand'

interface AuthState {
  token: string | null
  setToken: (token: string) => void
  clearToken: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('wallet_token'),
  setToken: (token) => {
    localStorage.setItem('wallet_token', token)
    set({ token })
  },
  clearToken: () => {
    localStorage.removeItem('wallet_token')
    set({ token: null })
  },
}))
