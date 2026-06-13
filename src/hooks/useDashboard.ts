import { useQuery } from '@tanstack/react-query'
import apiClient from '@/api/client'
import type { DashboardSummary, DebtGroup, DebtSummary } from '@/types'

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
    // The endpoint returns DebtGroup objects (`id`, `wallet.name`) — map them to
    // the DebtSummary shape the dashboard widget renders (`groupId`, `walletName`).
    queryFn: () =>
      apiClient.get<DebtGroup[]>('/wallet/groups?status=OPEN,PARTIAL').then((r) =>
        r.data.map((g) => ({
          groupId: g.id,
          title: g.title,
          groupType: g.groupType,
          remaining: g.remaining,
          dueDate: g.dueDate,
          walletName: g.wallet?.name ?? '',
          walletIcon: g.wallet?.icon ?? '',
          isOverdue: g.dueDate
            ? g.dueDate.slice(0, 10) < new Date().toISOString().slice(0, 10)
            : false,
        })),
      ),
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
