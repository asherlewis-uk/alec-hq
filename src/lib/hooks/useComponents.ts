'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Component } from '@/lib/types'

export function useComponents(assetId: string) {
  const [components, setComponents] = useState<Component[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (assetId) {
      fetchComponents()
    }
  }, [assetId])

  const fetchComponents = async () => {
    try {
      setIsLoading(true)
      const { data, error: err } = await supabase
        .from('components')
        .select('*')
        .eq('asset_id', assetId)
        .order('created_at', { ascending: false })

      if (err) throw err
      setComponents(data || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch components')
    } finally {
      setIsLoading(false)
    }
  }

  const createComponent = async (component: Omit<Component, 'id' | 'createdAt'>) => {
    try {
      const { data, error: err } = await supabase
        .from('components')
        .insert([component])
        .select()

      if (err) throw err
      if (data) {
        setComponents([...components, ...data])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create component')
    }
  }

  const updateComponent = async (id: string, updates: Partial<Component>) => {
    try {
      const { error: err } = await supabase
        .from('components')
        .update(updates)
        .eq('id', id)

      if (err) throw err
      await fetchComponents()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update component')
    }
  }

  const deleteComponent = async (id: string) => {
    try {
      const { error: err } = await supabase.from('components').delete().eq('id', id)

      if (err) throw err
      setComponents(components.filter((c) => c.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete component')
    }
  }

  return {
    components,
    isLoading,
    error,
    fetchComponents,
    createComponent,
    updateComponent,
    deleteComponent,
  }
}