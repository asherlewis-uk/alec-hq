'use client'

import { useAssets } from '@/lib/hooks/useAssets'
import { AssetGrid } from '@/components/assets/AssetGrid'
import { useEffect } from 'react'

export default function RigPage() {
  const { assets, isLoading, error, fetchAssets } = useAssets()

  useEffect(() => {
    fetchAssets()
  }, [fetchAssets])

  const filteredAssets = assets.filter(
    (a) => a.category === 'RIG' || a.category === 'PERIPHERAL' || a.category === 'NETWORK'
  )

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">💻 The Rig</h1>
      {error && <p className="text-red-300 text-sm">{error}</p>}
      <AssetGrid assets={filteredAssets} isLoading={isLoading} />
    </div>
  )
}
