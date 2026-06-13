import { useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/api/client'
import type { Budget, CreateBudgetRequest, Transaction } from '@/types'

export function useBudgets(period: string) {
  return useQuery<Budget[]>({
    queryKey: ['budgets', period],
    queryFn: () => apiClient.get<Budget[]>('/wallet/budgets', { params: { period } }).then((r) => r.data),
    enabled: !!period,
  })
}

export function useBudgetWithSpending(period: string) {
  const { data: budgets, ...rest } = useBudgets(period)

  // Lấy transactions để tính spending
  const { data: transactions } = useQuery<Transaction[]>({
    queryKey: ['transactions', period],
    queryFn: () => {
      const [year, month] = period.split('-').map(Number)
      // Real last day of month — a hardcoded "-31" is an invalid date in short
      // months (backend now rejects it with 400). Backend treats a date-only
      // dateTo as inclusive of the whole named day.
      const lastDay = new Date(year, month, 0).getDate()
      return apiClient.get<Transaction[]>('/wallet/transactions', {
        params: {
          dateFrom: `${period}-01`,
          dateTo: `${period}-${String(lastDay).padStart(2, '0')}`,
          size: 500, // default page size (20) would undercount monthly spending
        },
      }).then((r) => r.data)
    },
    enabled: !!period,
  })

  const budgetsWithSpending = useMemo(() => {
    if (!budgets || !transactions) return null
    return budgets.map((budget) => {
      const spent = transactions
        .filter((tx) => tx.type === 'EXPENSE' && tx.categoryId === budget.categoryId)
        .reduce((sum, tx) => sum + Number(tx.amount), 0)
      const percentage = budget.monthlyLimit > 0 ? (spent / budget.monthlyLimit) * 100 : 0
      const status: Budget['status'] = percentage >= 100 ? 'exceeded' : percentage >= 80 ? 'warning' : 'ok'
      return { ...budget, currentSpent: spent, percentage, status }
    })
  }, [budgets, transactions])

  return { data: budgetsWithSpending, ...rest }
}

export function useCreateBudget() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateBudgetRequest) =>
      apiClient.post('/wallet/budgets', body).then((r) => r.data),
    onSuccess: (_data, variables) =>
      qc.invalidateQueries({ queryKey: ['budgets', variables.period] }),
  })
}

export function useUpdateBudget() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...body }: CreateBudgetRequest & { id: number }) =>
      apiClient.put(`/wallet/budgets/${id}`, body).then((r) => r.data),
    onSuccess: (_data, variables) =>
      qc.invalidateQueries({ queryKey: ['budgets', variables.period] }),
  })
}

export function useDeleteBudget() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id }: { id: number; period: string }) =>
      apiClient.delete(`/wallet/budgets/${id}`).then((r) => r.data),
    onSuccess: (_data, variables) =>
      qc.invalidateQueries({ queryKey: ['budgets', variables.period] }),
  })
}
