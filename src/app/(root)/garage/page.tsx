'use client'

import { useAssets } from '@/lib/hooks/useAssets'
import { AssetGrid } from '@/components/assets/AssetGrid'
import { useEffect } from 'react'

export default function GaragePage() {
  const { assets, isLoading, fetchAssets } = useAssets('VEHICLE')

  useEffect(() => {
    fetchAssets()
  }, [])

  const filteredAssets = assets.filter((a) => a.category === 'VEHICLE')

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">🏍️ The Garage</h1>
      <AssetGrid assets={filteredAssets} isLoading={isLoading} />
    </div>
  )
}