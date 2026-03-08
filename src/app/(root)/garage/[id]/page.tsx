'use client'

import { useParams, useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { Asset } from '@/lib/types'
import { AssetDetailHeader } from '@/components/assets/AssetDetailHeader'
import { AssetTabNav } from '@/components/assets/AssetTabNav'
import { ComponentList } from '@/components/components-feature/ComponentList'
import { LogTimeline } from '@/components/logs/LogTimeline'
import { WishlistList } from '@/components/wishlist/WishlistList'
import { useComponents } from '@/lib/hooks/useComponents'
import { useLogs } from '@/lib/hooks/useLogs'
import { useWishlist } from '@/lib/hooks/useWishlist'
import { Skeleton } from '@/components/ui/skeleton'
import { apiRequest } from '@/lib/api/client'

export default function GarageDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [asset, setAsset] = useState<Asset | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const { components, fetchComponents } = useComponents(id)
  const { logs, fetchLogs } = useLogs(id)
  const { wishlist, fetchWishlist } = useWishlist(id)

  const fetchAsset = useCallback(async () => {
    try {
      const data = await apiRequest<Asset>(`/api/assets/${id}`)
      setAsset(data)
    } catch {
      router.push('/garage')
    } finally {
      setIsLoading(false)
    }
  }, [id, router])

  useEffect(() => {
    fetchAsset()
    fetchComponents()
    fetchLogs()
    fetchWishlist()
  }, [fetchAsset, fetchComponents, fetchLogs, fetchWishlist])

  const handleDelete = async () => {
    await apiRequest<void>(`/api/assets/${id}`, { method: 'DELETE' })
    router.push('/garage')
  }

  const handleTogglePublic = async (isPublic: boolean) => {
    await apiRequest<Asset>(`/api/assets/${id}`, { method: 'PATCH', body: { isPublic } })
    fetchAsset()
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 rounded-glass bg-white/5" />
        <Skeleton className="h-96 rounded-glass bg-white/5" />
      </div>
    )
  }

  if (!asset) {
    return <div className="text-center text-text-secondary py-12">Asset not found</div>
  }

  const tabs = [
    { id: 'components', label: 'Components', icon: '⚙️', content: <ComponentList assetId={id} components={components} onComponentAdded={fetchComponents} onComponentDeleted={fetchComponents} /> },
    { id: 'logs', label: 'Logs', icon: '📋', content: <LogTimeline assetId={id} logs={logs} onLogAdded={fetchLogs} onLogDeleted={fetchLogs} /> },
    { id: 'wishlist', label: 'Wishlist', icon: '⭐', content: <WishlistList assetId={id} items={wishlist} onItemAdded={fetchWishlist} onItemDeleted={fetchWishlist} /> },
  ]

  return (
    <div className="space-y-6">
      <AssetDetailHeader asset={asset} onDelete={handleDelete} onTogglePublic={handleTogglePublic} />
      <AssetTabNav tabs={tabs} />
    </div>
  )
}
