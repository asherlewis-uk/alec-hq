'use client'

import { useCallback, useState } from 'react'
import { apiRequest } from '@/lib/api/client'
import { CreateWishlistInput, WishlistItem } from '@/lib/types'

export function useWishlist(assetId: string) {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchWishlist = useCallback(async () => {
    if (!assetId) return
    try {
      setIsLoading(true)
      const data = await apiRequest<WishlistItem[]>(`/api/assets/${assetId}/wishlist`)
      setWishlist(data || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch wishlist')
    } finally {
      setIsLoading(false)
    }
  }, [assetId])

  const createItem = useCallback(async (item: CreateWishlistInput) => {
    try {
      const created = await apiRequest<WishlistItem>(`/api/assets/${assetId}/wishlist`, {
        method: 'POST',
        body: item,
      })
      setWishlist([...wishlist, created])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create item')
    }
  }, [assetId, wishlist])

  const deleteItem = useCallback(async (id: string) => {
    try {
      await apiRequest<void>(`/api/wishlist/${id}`, { method: 'DELETE' })
      setWishlist(wishlist.filter((i) => i.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete item')
    }
  }, [wishlist])

  return {
    wishlist,
    isLoading,
    error,
    fetchWishlist,
    createItem,
    deleteItem,
  }
}
