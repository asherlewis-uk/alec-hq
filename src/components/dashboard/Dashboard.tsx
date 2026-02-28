'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAssets } from '@/lib/hooks/useAssets'
import { StatCard } from './StatCard'
import { RecentAssetStrip } from './RecentAssetStrip'
import { Skeleton } from '@/components/ui/skeleton'

export function Dashboard() {
  const { assets, isLoading, fetchAssets } = useAssets()

  useEffect(() => {
    fetchAssets()
  }, [])

  const stats = {
    totalAssets: assets.length,
    maintenanceDue: assets.filter((a) => a.category === 'VEHICLE').length,
    wishlistCount: assets.filter((a) => a.status === 'WISHLIST').length,
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-glass bg-white/5" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-glass bg-white/5" />
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Total Assets" value={stats.totalAssets.toString()} emoji="📦" />
        <StatCard label="Vehicles" value={stats.maintenanceDue.toString()} emoji="🏍️" />
        <StatCard label="Wishlist" value={stats.wishlistCount.toString()} emoji="⭐" />
      </div>

      {/* Recent Assets */}
      {assets.length > 0 && <RecentAssetStrip assets={assets.slice(0, 5)} />}

      {/* Empty State */}
      {assets.length === 0 && (
        <div className="glass rounded-glass p-12 text-center">
          <p className="text-text-secondary text-lg">No assets yet. Start by adding one!</p>
        </div>
      )}
    </motion.div>
  )
}