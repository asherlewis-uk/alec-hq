'use client'

import { useParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { Asset, Component } from '@/lib/types'
import { PublicSpecCard } from '@/components/share/PublicSpecCard'
import { apiRequest } from '@/lib/api/client'

export default function SharePage() {
  const params = useParams()
  const id = params.id as string

  const [asset, setAsset] = useState<Asset | null>(null)
  const [components, setComponents] = useState<Component[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPublicAsset = useCallback(async () => {
    try {
      const data = await apiRequest<{ asset: Asset; components: Component[] }>(`/api/public/assets/${id}`)
      setAsset(data.asset)
      setComponents(data.components || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Asset not found or not public')
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchPublicAsset()
  }, [fetchPublicAsset])

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>
  }

  if (!asset) {
    return (
      <div className="bg-gradient-to-br from-[#0d0d1a] to-[#1a0a00] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Asset Not Found</h1>
          <p className="text-text-secondary">{error ?? 'This asset is either private or does not exist'}</p>
        </div>
      </div>
    )
  }

  return <PublicSpecCard asset={asset} components={components} />
}
