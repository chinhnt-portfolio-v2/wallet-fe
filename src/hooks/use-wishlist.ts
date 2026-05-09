import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { wishlistApi } from '@/api/wishlist'
import type { WishlistStatus, CreateWishlistItemRequest } from '@/types'

const KEY = 'wishlist'

export function useWishlistItems(status?: WishlistStatus) {
  return useQuery({
    queryKey: [KEY, status ?? 'ALL'],
    queryFn: () => wishlistApi.list(status),
    staleTime: 30_000,
  })
}

export function useCreateWishlistItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateWishlistItemRequest) => wishlistApi.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}

export function useUpdateWishlistItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...body }: CreateWishlistItemRequest & { id: number }) =>
      wishlistApi.update(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}

export function useUpdateWishlistStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: WishlistStatus }) =>
      wishlistApi.updateStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}

export function useDeleteWishlistItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => wishlistApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}
