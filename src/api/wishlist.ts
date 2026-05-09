import apiClient from '@/api/client'
import type { WishlistItem, WishlistStatus, CreateWishlistItemRequest } from '@/types'

const BASE = '/wallet/wishlist'

export const wishlistApi = {
  list: (status?: WishlistStatus) =>
    apiClient
      .get<WishlistItem[]>(BASE, { params: status ? { status } : undefined })
      .then((r) => r.data),

  create: (body: CreateWishlistItemRequest) =>
    apiClient.post<WishlistItem>(BASE, body).then((r) => r.data),

  update: (id: number, body: CreateWishlistItemRequest) =>
    apiClient.put<WishlistItem>(`${BASE}/${id}`, body).then((r) => r.data),

  updateStatus: (id: number, status: WishlistStatus) =>
    apiClient.patch<WishlistItem>(`${BASE}/${id}/status`, { status }).then((r) => r.data),

  delete: (id: number) =>
    apiClient.delete(`${BASE}/${id}`).then((r) => r.data),
}
