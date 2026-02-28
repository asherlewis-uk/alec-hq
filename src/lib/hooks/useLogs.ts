'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { AssetLog } from '@/lib/types'

export function useLogs(assetId: string) {
  const [logs, setLogs] = useState<AssetLog[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (assetId) {
      fetchLogs()
    }
  }, [assetId])

  const fetchLogs = async () => {
    try {
      setIsLoading(true)
      const { data, error: err } = await supabase
        .from('asset_logs')
        .select('*')
        .eq('asset_id', assetId)
        .order('date', { ascending: false })

      if (err) throw err
      setLogs(data || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch logs')
    } finally {
      setIsLoading(false)
    }
  }

  const createLog = async (log: Omit<AssetLog, 'id' | 'createdAt'>) => {
    try {
      const { data, error: err } = await supabase
        .from('asset_logs')
        .insert([log])
        .select()

      if (err) throw err
      if (data) {
        setLogs([...data, ...logs])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create log')
    }
  }

  const deleteLog = async (id: string) => {
    try {
      const { error: err } = await supabase.from('asset_logs').delete().eq('id', id)

      if (err) throw err
      setLogs(logs.filter((l) => l.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete log')
    }
  }

  return {
    logs,
    isLoading,
    error,
    fetchLogs,
    createLog,
    deleteLog,
  }
}