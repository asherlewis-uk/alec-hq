'use client'

import { Asset } from '@/lib/types'
import { AssetCard } from './AssetCard'
import { motion } from 'framer-motion'

interface AssetGridProps {
  assets: Asset[]
  isLoading?: boolean
}

export function AssetGrid({ assets, isLoading }: AssetGridProps) {
  if (isLoading) {
    return <div className="text-center py-12 text-text-secondary">Loading...</div>
  }

  if (assets.length === 0) {
    return (
      <div className="glass rounded-glass p-12 text-center">
        <p className="text-text-secondary">No items in this category yet</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      {assets.map((asset) => (
        <AssetCard key={asset.id} asset={asset} />
      ))}
    </motion.div>
  )
}