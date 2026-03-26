import { useQuery } from '@tanstack/react-query'
import apiClient from '@/api/client'
import type { DashboardSummary, DebtSummary } from '@/types'

export function useDashboardSummary() {
  return useQuery<DashboardSummary>({
    queryKey: ['dashboard-summary'],
    queryFn: () => apiClient.get('/wallet/dashboard/summary').then((r) => r.data),
  })
}

export function useOpenDebts() {
  return useQuery<DebtSummary[]>({
    queryKey: ['dashboard-debts'],
    queryFn: () => apiClient.get('/wallet/groups?status=OPEN,PARTIAL').then((r) => r.data),
  })
}
