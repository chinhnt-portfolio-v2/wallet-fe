import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/api/client'
import type { DebtGroup, CreateDebtGroupRequest, SettleDebtRequest } from '@/types'

export function useDebtGroups(status?: string) {
  return useQuery<DebtGroup[]>({
    queryKey: ['debt-groups', status],
    queryFn: () => apiClient.get('/wallet/groups', { params: { status } }).then((r) => r.data),
    staleTime: 0,
    refetchOnMount: true,
  })
}

export function useDebtGroup(id: number | string) {
  return useQuery<DebtGroup>({
    queryKey: ['debt-group', id],
    queryFn: () => apiClient.get(`/wallet/groups/${id}`).then((r) => r.data),
    enabled: !!id,
    staleTime: 0,
    refetchOnMount: true,
  })
}

export function useCreateDebtGroup() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateDebtGroupRequest) =>
      apiClient.post('/wallet/groups', body).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['debt-groups'] }),
  })
}

export function useSettleDebt(groupId: number | string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: SettleDebtRequest) =>
      apiClient.post(`/wallet/groups/${groupId}/settle`, body).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['debt-group', groupId] })
      qc.invalidateQueries({ queryKey: ['debt-group-txs', groupId] })
      qc.invalidateQueries({ queryKey: ['dashboard-debts'] })
      qc.invalidateQueries({ queryKey: ['wallets'] })
    },
  })
}

export function useUpdateDebtGroup() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...body }: CreateDebtGroupRequest & { id: number }) =>
      apiClient.put(`/wallet/groups/${id}`, body).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['debt-groups'] }),
  })
}

export function useDeleteDebtGroup() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) =>
      apiClient.delete(`/wallet/groups/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['debt-groups'] }),
  })
}
