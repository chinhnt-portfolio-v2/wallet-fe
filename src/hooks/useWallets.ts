import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/api/client'
import type { Wallet, CreateWalletRequest } from '@/types'

export function useWallets() {
  return useQuery<Wallet[]>({
    queryKey: ['wallets'],
    queryFn: () => apiClient.get('/wallet/wallets').then((r) => r.data),
    staleTime: 0,
    refetchOnMount: true,
  })
}

export function useCreateWallet() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateWalletRequest) =>
      apiClient.post('/wallet/wallets', body).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wallets'] }),
  })
}

export function useUpdateWallet() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...body }: CreateWalletRequest & { id: number }) =>
      apiClient.put(`/wallet/wallets/${id}`, body).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wallets'] }),
  })
}

export function useDeleteWallet() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) =>
      apiClient.delete(`/wallet/wallets/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wallets'] }),
  })
}
