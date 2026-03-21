'use client'

import Link from 'next/link'
import { Asset } from '@/lib/types'
import { getCategoryEmoji, getCategoryLabel, getStatusColor } from '@/lib/utils/formatters'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'

interface AssetCardProps {
  asset: Asset
}

export function AssetCard({ asset }: AssetCardProps) {
  const routePrefix = asset.category === 'VEHICLE' ? '/garage' : '/rig'

  return (
    <Link href={`${routePrefix}/${asset.id}`}>
      <motion.div
        whileHover={{ y: -4 }}
        className={`glass ${getStatusColor(asset.status)} rounded-glass p-4 cursor-pointer transition-all duration-200 h-full`}
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-xs text-secondary">{getCategoryLabel(asset.category)}</p>
            <h3 className="text-lg font-bold text-primary mt-1 line-clamp-2">{asset.name}</h3>
          </div>
          <span className="text-2xl">{getCategoryEmoji(asset.category)}</span>
        </div>

        <Badge variant="outline" className="text-xs bg-white/10 border-white/20">
          {asset.status}
        </Badge>

        <p className="text-xs text-muted mt-4">
          Updated {new Date(asset.updatedAt).toLocaleDateString()}
        </p>
      </motion.div>
    </Link>
  )
}
