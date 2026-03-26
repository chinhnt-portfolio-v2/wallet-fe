import { create } from 'zustand'

export const WALLET_ICONS = ['💰', '🏦', '💳', '📱', '🎁', '🏠', '🚗', '✈️']
export const WALLET_COLORS = ['#0EA5E9', '#10B981', '#F97316', '#8B5CF6', '#EC4899', '#F59E0B', '#06B6D4', '#64748B']

interface WalletStore {
  wallets: Array<{ id: number; name: string; icon: string; color: string; type: string }>
  categories: Array<{ id: number; name: string; icon: string; color: string; type: string }>
  setWallets: (w: WalletStore['wallets']) => void
  setCategories: (c: WalletStore['categories']) => void
}

export const useWalletStore = create<WalletStore>((set) => ({
  wallets: [],
  categories: [],
  setWallets: (wallets) => set({ wallets }),
  setCategories: (categories) => set({ categories }),
}))
