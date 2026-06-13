import { useQuery } from '@tanstack/react-query'
import apiClient from '@/api/client'

/** One category's spending for a period, with its share (%) of total spend. */
export interface CategorySpend {
  categoryId: number
  name: string | null
  icon: string | null
  color: string | null
  total: number
  pct: number
}

/** Expense grouped by category for a "YYYY-MM" period (sorted high→low by the backend). */
export function useStatsByCategory(period: string) {
  return useQuery<CategorySpend[]>({
    queryKey: ['stats-by-category', period],
    queryFn: () =>
      apiClient
        .get('/wallet/stats/by-category', { params: { period } })
        .then((r) => r.data),
    staleTime: 0,
    refetchOnMount: true,
  })
}
