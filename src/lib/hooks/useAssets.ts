'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Asset } from '@/lib/types'
import { useAppStore } from '@/lib/store/useAppStore'

export function useAssets(category?: string) {
  const { assets, setAssets, isLoading, setIsLoading } = useAppStore()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAssets()
  }, [category])

  const fetchAssets = async () => {
    try {
      setIsLoading(true)
      let query = supabase.from('assets').select('*')

      if (category) {
        query = query.eq('category', category)
      }

      const { data, error: err } = await query.order('updated_at', { ascending: false })

      if (err) throw err
      setAssets(data || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch assets')
    } finally {
      setIsLoading(false)
    }
  }

  const createAsset = async (asset: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const { data, error: err } = await supabase
        .from('assets')
        .insert([asset])
        .select()

      if (err) throw err
      if (data) {
        setAssets([...assets, ...data])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create asset')
    }
  }

  const updateAsset = async (id: string, updates: Partial<Asset>) => {
    try {
      const { error: err } = await supabase
        .from('assets')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (err) throw err
      await fetchAssets()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update asset')
    }
  }

  const deleteAsset = async (id: string) => {
    try {
      const { error: err } = await supabase.from('assets').delete().eq('id', id)

      if (err) throw err
      setAssets(assets.filter((a) => a.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete asset')
    }
  }

  return {
    assets,
    isLoading,
    error,
    fetchAssets,
    createAsset,
    updateAsset,
    deleteAsset,
  }
}