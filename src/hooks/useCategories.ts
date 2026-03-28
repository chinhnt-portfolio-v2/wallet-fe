import { useQuery } from '@tanstack/react-query'
import apiClient from '@/api/client'
import type { Category } from '@/types'

export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => apiClient.get('/wallet/categories').then((r) => r.data),
    staleTime: 0,
    refetchOnMount: true,
  })
}
