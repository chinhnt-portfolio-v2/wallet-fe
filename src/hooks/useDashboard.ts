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

export interface MonthlyStats {
  month: string        // "2026-03"
  label: string        // "Thg 3"
  totalIncome: number
  totalExpense: number
  netSavings: number
  transactionCount: number
}

export function useMonthlyComparison(months = 3) {
  return useQuery<MonthlyStats[]>({
    queryKey: ['monthly-comparison', months],
    queryFn: () => apiClient.get('/wallet/dashboard/monthly', { params: { months } }).then((r) => r.data),
    staleTime: 5 * 60 * 1000,
    refetchOnMount: true,
  })
}
