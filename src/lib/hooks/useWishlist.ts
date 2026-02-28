'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { WishlistItem } from '@/lib/types'

export function useWishlist(assetId: string) {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (assetId) {
      fetchWishlist()
    }
  }, [assetId])

  const fetchWishlist = async () => {
    try {
      setIsLoading(true)
      const { data, error: err } = await supabase
        .from('wishlist_items')
        .select('*')
        .eq('asset_id', assetId)
        .order('priority', { ascending: false })

      if (err) throw err
      setWishlist(data || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch wishlist')
    } finally {
      setIsLoading(false)
    }
  }

  const createItem = async (item: Omit<WishlistItem, 'id' | 'createdAt'>) => {
    try {
      const { data, error: err } = await supabase
        .from('wishlist_items')
        .insert([item])
        .select()

      if (err) throw err
      if (data) {
        setWishlist([...wishlist, ...data])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create item')
    }
  }

  const deleteItem = async (id: string) => {
    try {
      const { error: err } = await supabase.from('wishlist_items').delete().eq('id', id)

      if (err) throw err
      setWishlist(wishlist.filter((i) => i.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete item')
    }
  }

  return {
    wishlist,
    isLoading,
    error,
    fetchWishlist,
    createItem,
    deleteItem,
  }
}