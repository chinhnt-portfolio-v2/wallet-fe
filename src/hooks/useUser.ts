import { useQuery } from '@tanstack/react-query'
import apiClient from '@/api/client'

export interface UserProfile {
  id: string
  email: string
  name: string | null
  picture: string | null
  provider: string
  createdAt: string
}

export function useUser() {
  return useQuery<UserProfile>({
    queryKey: ['user-profile'],
    queryFn: () => apiClient.get('/auth/me').then((r) => r.data),
    staleTime: 10 * 60 * 1000,
    refetchOnMount: false,
  })
}
