import { useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/api/client'
import type { Budget, CreateBudgetRequest, Category } from '@/types'

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
  const { data: transactions } = useQuery({
    queryKey: ['transactions', period],
    queryFn: () => {
      const [year, month] = period.split('-')
      return apiClient.get('/wallet/transactions', {
        params: {
          dateFrom: `${year}-${month}-01`,
          dateTo: `${year}-${month}-31`,
        },
      }).then((r) => r.data)
    },
    enabled: !!period,
  })

  const budgetsWithSpending = useMemo(() => {
    if (!budgets || !transactions) return null
    return budgets.map((budget) => {
      const spent = transactions
        .filter((tx: any) => tx.type === 'EXPENSE' && tx.categoryId === budget.categoryId)
        .reduce((sum: number, tx: any) => sum + Number(tx.amount), 0)
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
    mutationFn: ({ id, period }: { id: number; period: string }) =>
      apiClient.delete(`/wallet/budgets/${id}`).then((r) => r.data),
    onSuccess: (_data, variables) =>
      qc.invalidateQueries({ queryKey: ['budgets', variables.period] }),
  })
}
