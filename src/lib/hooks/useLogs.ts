'use client'

import { useCallback, useState } from 'react'
import { apiRequest } from '@/lib/api/client'
import { AssetLog, CreateAssetLogInput } from '@/lib/types'

export function useLogs(assetId: string) {
  const [logs, setLogs] = useState<AssetLog[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchLogs = useCallback(async () => {
    if (!assetId) return
    try {
      setIsLoading(true)
      const data = await apiRequest<AssetLog[]>(`/api/assets/${assetId}/logs`)
      setLogs(data || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch logs')
    } finally {
      setIsLoading(false)
    }
  }, [assetId])

  const createLog = useCallback(async (log: CreateAssetLogInput) => {
    try {
      const created = await apiRequest<AssetLog>(`/api/assets/${assetId}/logs`, {
        method: 'POST',
        body: log,
      })
      setLogs([created, ...logs])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create log')
    }
  }, [assetId, logs])

  const deleteLog = useCallback(async (id: string) => {
    try {
      await apiRequest<void>(`/api/logs/${id}`, { method: 'DELETE' })
      setLogs(logs.filter((l) => l.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete log')
    }
  }, [logs])

  return {
    logs,
    isLoading,
    error,
    fetchLogs,
    createLog,
    deleteLog,
  }
}
