import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { budgetJarsApi } from '@/api/budget-jars'
import type { CreateBudgetJarRequest } from '@/types'

const QUERY_KEY = 'budget-jars'

export function useBudgetJars(period?: string) {
  return useQuery({
    queryKey: [QUERY_KEY, period ?? ''],
    queryFn: () => budgetJarsApi.list(period),
  })
}

export function useCreatePresetJars() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => budgetJarsApi.createPreset(),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  })
}

export function useCreateBudgetJar() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateBudgetJarRequest) => budgetJarsApi.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  })
}

export function useUpdateBudgetJar() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...body }: CreateBudgetJarRequest & { id: number }) =>
      budgetJarsApi.update(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  })
}

export function useDeleteBudgetJar() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => budgetJarsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  })
}
