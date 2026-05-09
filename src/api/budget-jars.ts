import apiClient from '@/api/client'
import type { BudgetJar, BudgetJarsResponse, CreateBudgetJarRequest } from '@/types'

const BASE = '/wallet/budget-jars'

export const budgetJarsApi = {
  list: (period?: string) =>
    apiClient
      .get<BudgetJarsResponse>(BASE, { params: period ? { period } : undefined })
      .then((r) => r.data),

  create: (body: CreateBudgetJarRequest) =>
    apiClient.post<BudgetJar>(BASE, body).then((r) => r.data),

  createPreset: () =>
    apiClient.post<BudgetJarsResponse>(`${BASE}/preset`).then((r) => r.data),

  update: (id: number, body: CreateBudgetJarRequest) =>
    apiClient.put<BudgetJar>(`${BASE}/${id}`, body).then((r) => r.data),

  delete: (id: number) =>
    apiClient.delete(`${BASE}/${id}`).then((r) => r.data),
}
