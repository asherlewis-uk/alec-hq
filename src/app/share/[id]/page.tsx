'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Asset, Component } from '@/lib/types'
import { PublicSpecCard } from '@/components/share/PublicSpecCard'

export default function SharePage() {
  const params = useParams()
  const id = params.id as string

  const [asset, setAsset] = useState<Asset | null>(null)
  const [components, setComponents] = useState<Component[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchPublicAsset()
  }, [id])

  const fetchPublicAsset = async () => {
    try {
      const { data: assetData, error: assetError } = await supabase
        .from('assets')
        .select('*')
        .eq('id', id)
        .eq('is_public', true)
        .single()

      if (assetError) throw new Error('Asset not found or not public')
      setAsset(assetData)

      const { data: componentsData } = await supabase
        .from('components')
        .select('*')
        .eq('asset_id', id)

      setComponents(componentsData || [])
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>
  }

  if (!asset) {
    return (
      <div className="bg-gradient-to-br from-[#0d0d1a] to-[#1a0a00] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Asset Not Found</h1>
          <p className="text-text-secondary">This asset is either private or does not exist</p>
        </div>
      </div>
    )
  }

  return <PublicSpecCard asset={asset} components={components} />
}