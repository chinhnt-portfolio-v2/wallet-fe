import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/api/client'
import type { Transaction, CreateTransactionRequest } from '@/types'

export function useTransactions(params?: { type?: string; size?: number; groupId?: number }) {
  return useQuery<Transaction[]>({
    queryKey: ['transactions', params],
    queryFn: () => apiClient.get('/wallet/transactions', { params: params as Record<string, string | number> }).then((r) => r.data),
    staleTime: 0,
    refetchOnMount: true,
  })
}

export function useRecentTransactions(size = 5) {
  return useQuery<Transaction[]>({
    queryKey: ['recent-txs', size],
    queryFn: () => apiClient.get('/wallet/transactions', { params: { size } }).then((r) => r.data),
    staleTime: 0,
    refetchOnMount: true,
  })
}

export function useCreateTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateTransactionRequest) =>
      apiClient.post('/wallet/transactions', body).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dashboard-summary'] })
      qc.invalidateQueries({ queryKey: ['dashboard-debts'] })
      qc.invalidateQueries({ queryKey: ['recent-txs'] })
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['wallets'] })
    },
  })
}
