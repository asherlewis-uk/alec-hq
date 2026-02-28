'use client'

import { Asset } from '@/lib/types'
import { AssetCard } from '@/components/assets/AssetCard'
import { motion } from 'framer-motion'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'

interface RecentAssetStripProps {
  assets: Asset[]
}

export function RecentAssetStrip({ assets }: RecentAssetStripProps) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
      <h3 className="text-lg font-semibold text-white mb-4">Recently Updated</h3>
      <ScrollArea className="w-full rounded-glass">
        <div className="flex gap-4 p-4">
          {assets.map((asset) => (
            <div key={asset.id} className="flex-shrink-0 w-64">
              <AssetCard asset={asset} />
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </motion.div>
  )
}