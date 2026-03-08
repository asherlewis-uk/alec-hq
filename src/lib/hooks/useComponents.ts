'use client'

import { useCallback, useState } from 'react'
import { apiRequest } from '@/lib/api/client'
import { Component, CreateComponentInput } from '@/lib/types'

export function useComponents(assetId: string) {
  const [components, setComponents] = useState<Component[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchComponents = useCallback(async () => {
    if (!assetId) return
    try {
      setIsLoading(true)
      const data = await apiRequest<Component[]>(`/api/assets/${assetId}/components`)
      setComponents(data || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch components')
    } finally {
      setIsLoading(false)
    }
  }, [assetId])

  const createComponent = useCallback(async (component: CreateComponentInput) => {
    try {
      const created = await apiRequest<Component>(`/api/assets/${assetId}/components`, {
        method: 'POST',
        body: component,
      })
      setComponents([created, ...components])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create component')
    }
  }, [assetId, components])

  const deleteComponent = useCallback(async (id: string) => {
    try {
      await apiRequest<void>(`/api/components/${id}`, { method: 'DELETE' })
      setComponents(components.filter((c) => c.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete component')
    }
  }, [components])

  return {
    components,
    isLoading,
    error,
    fetchComponents,
    createComponent,
    deleteComponent,
  }
}
