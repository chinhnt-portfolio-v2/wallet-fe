import { useQuery } from '@tanstack/react-query'
import apiClient from '@/api/client'
import type { DashboardSummary, DebtSummary } from '@/types'

// Force fresh data on every mount to avoid stale error cache
export function useDashboardSummary() {
  return useQuery<DashboardSummary>({
    queryKey: ['dashboard-summary'],
    queryFn: () => apiClient.get('/wallet/dashboard/summary').then((r) => r.data),
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  })
}

export function useOpenDebts() {
  return useQuery<DebtSummary[]>({
    queryKey: ['dashboard-debts'],
    queryFn: () => apiClient.get('/wallet/groups?status=OPEN,PARTIAL').then((r) => r.data),
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  })
}
