'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Asset } from '@/lib/types'
import { AssetDetailHeader } from '@/components/assets/AssetDetailHeader'
import { AssetTabNav } from '@/components/assets/AssetTabNav'
import { ComponentList } from '@/components/components-feature/ComponentList'
import { SpecCard } from '@/components/components-feature/SpecCard'
import { LogTimeline } from '@/components/logs/LogTimeline'
import { WishlistList } from '@/components/wishlist/WishlistList'
import { useComponents } from '@/lib/hooks/useComponents'
import { useLogs } from '@/lib/hooks/useLogs'
import { useWishlist } from '@/lib/hooks/useWishlist'
import { Skeleton } from '@/components/ui/skeleton'
import { useRouter } from 'next/navigation'

export default function RigDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [asset, setAsset] = useState<Asset | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const { components, fetchComponents } = useComponents(id)
  const { logs, fetchLogs } = useLogs(id)
  const { wishlist, fetchWishlist } = useWishlist(id)

  useEffect(() => {
    fetchAsset()
  }, [id])

  const fetchAsset = async () => {
    try {
      const { data, error } = await supabase.from('assets').select('*').eq('id', id).single()
      if (error) throw error
      setAsset(data)
    } catch (err) {
      console.error(err)
      router.push('/rig')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    await supabase.from('assets').delete().eq('id', id)
    router.push('/rig')
  }

  const handleTogglePublic = async (isPublic: boolean) => {
    await supabase.from('assets').update({ is_public: isPublic }).eq('id', id)
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
    { id: 'spec', label: 'Spec Card', icon: '📄', content: <SpecCard asset={asset} components={components} /> },
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