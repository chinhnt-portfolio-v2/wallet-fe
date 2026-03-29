import { useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/api/client'
import type { TransferRequest, TransferResult } from '@/types'

export function useTransfer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: TransferRequest) =>
      apiClient.post<TransferResult>('/wallet/transfer', body).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wallets'] })
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['dashboard-summary'] })
    },
  })
}
