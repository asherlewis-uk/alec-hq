'use client'

import { useCallback, useState } from 'react'
import { apiRequest } from '@/lib/api/client'
import { Asset, AssetCategory, CreateAssetInput, UpdateAssetInput } from '@/lib/types'
import { useAppStore } from '@/lib/store/useAppStore'

export function useAssets(category?: AssetCategory) {
  const { assets, setAssets, isLoading, setIsLoading } = useAppStore()
  const [error, setError] = useState<string | null>(null)

  const fetchAssets = useCallback(async () => {
    try {
      setIsLoading(true)
      const qs = category ? `?category=${encodeURIComponent(category)}` : ''
      const data = await apiRequest<Asset[]>(`/api/assets${qs}`)
      setAssets(data || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch assets')
    } finally {
      setIsLoading(false)
    }
  }, [category, setAssets, setIsLoading])

  const createAsset = useCallback(async (asset: CreateAssetInput) => {
    try {
      const created = await apiRequest<Asset>('/api/assets', { method: 'POST', body: asset })
      setAssets([created, ...assets])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create asset')
      throw err
    }
  }, [assets, setAssets])

  const updateAsset = useCallback(async (id: string, updates: UpdateAssetInput) => {
    try {
      await apiRequest<Asset>(`/api/assets/${id}`, { method: 'PATCH', body: updates })
      await fetchAssets()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update asset')
    }
  }, [fetchAssets])

  const deleteAsset = useCallback(async (id: string) => {
    try {
      await apiRequest<void>(`/api/assets/${id}`, { method: 'DELETE' })
      setAssets(assets.filter((a) => a.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete asset')
    }
  }, [assets, setAssets])

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
