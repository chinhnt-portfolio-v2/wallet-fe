import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/api/client'
import type { RecurringRule, CreateRecurringRequest } from '@/types'

export function useRecurringRules() {
  return useQuery<RecurringRule[]>({
    queryKey: ['recurring'],
    queryFn: () => apiClient.get<RecurringRule[]>('/wallet/recurring').then((r) => r.data),
  })
}

export function useCreateRecurring() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateRecurringRequest) =>
      apiClient.post<RecurringRule>('/wallet/recurring', body).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recurring'] }),
  })
}

export function useUpdateRecurring() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...body }: CreateRecurringRequest & { id: number }) =>
      apiClient.put<RecurringRule>(`/wallet/recurring/${id}`, body).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recurring'] }),
  })
}

export function useToggleRecurring() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: 'ACTIVE' | 'PAUSED' }) =>
      apiClient.patch<RecurringRule>(`/wallet/recurring/${id}/status`, { status }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recurring'] }),
  })
}

export function useDeleteRecurring() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) =>
      apiClient.delete(`/wallet/recurring/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recurring'] }),
  })
}
