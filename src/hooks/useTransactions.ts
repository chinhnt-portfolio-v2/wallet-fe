import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/api/client'
import type { Transaction, CreateTransactionRequest } from '@/types'

export interface TransactionFilters {
  type?: string
  size?: number
  page?: number
  groupId?: number
  dateFrom?: string
  dateTo?: string
  search?: string
}

export function useTransactions(params?: TransactionFilters) {
  const { page = 1, size = 20, ...rest } = params ?? {}
  // BE pagination starts from 0, FE starts from 1
  const pageParam = page - 1
  return useQuery<Transaction[]>({
    queryKey: ['transactions', { page: pageParam, size, ...rest }],
    queryFn: () => {
      const queryParams: Record<string, string | number> = {
        page: pageParam,
        size,
        ...(rest.type ? { type: rest.type } : {}),
        ...(rest.groupId ? { groupId: rest.groupId } : {}),
        ...(rest.dateFrom ? { dateFrom: rest.dateFrom } : {}),
        ...(rest.dateTo ? { dateTo: rest.dateTo } : {}),
        ...(rest.search ? { search: rest.search } : {}),
      }
      return apiClient.get('/wallet/transactions', { params: queryParams }).then((r) => r.data)
    },
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
      qc.invalidateQueries({ queryKey: ['debt-groups'] })
    },
  })
}

export function useUpdateTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...body }: CreateTransactionRequest & { id: number }) =>
      apiClient.put(`/wallet/transactions/${id}`, body).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['recent-txs'] })
      qc.invalidateQueries({ queryKey: ['dashboard-summary'] })
    },
  })
}

export function useDeleteTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) =>
      apiClient.delete(`/wallet/transactions/${id}`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['recent-txs'] })
      qc.invalidateQueries({ queryKey: ['dashboard-summary'] })
    },
  })
}
