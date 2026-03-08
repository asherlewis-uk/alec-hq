'use client'

import { Asset } from '@/lib/types'
import { getCategoryEmoji, getCategoryLabel, formatDate } from '@/lib/utils/formatters'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye, Share2, Trash2 } from 'lucide-react'
import { useState } from 'react'

interface AssetDetailHeaderProps {
  asset: Asset
  onDelete: () => void
  onTogglePublic: (isPublic: boolean) => void
}

export function AssetDetailHeader({ asset, onDelete, onTogglePublic }: AssetDetailHeaderProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this asset?')) {
      setIsDeleting(true)
      await onDelete()
    }
  }

  const shareUrl = asset.isPublic ? `${window.location.origin}/share/${asset.id}` : null

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-glass p-6 md:p-8 mb-6"
    >
      {/* Header Row */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4">
          <span className="text-5xl">{getCategoryEmoji(asset.category)}</span>
          <div>
            <p className="text-sm text-text-secondary">{getCategoryLabel(asset.category)}</p>
            <h1 className="text-3xl md:text-4xl font-bold text-white mt-1">{asset.name}</h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {asset.isPublic && shareUrl && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(shareUrl)
              }}
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Share2 className="w-4 h-4 mr-1" />
              Copy Link
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => onTogglePublic(!asset.isPublic)}
            className="border-white/20 text-white hover:bg-white/10"
          >
            <Eye className="w-4 h-4 mr-1" />
            {asset.isPublic ? 'Public' : 'Private'}
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="border-red-500/20"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Metadata */}
      <div className="flex flex-wrap gap-3 items-center">
        <Badge className="bg-accent/20 text-accent border-accent/30 border">{asset.status}</Badge>
        <span className="text-sm text-text-secondary">
          Created {formatDate(asset.createdAt)}
        </span>
        {asset.purchasePrice && (
          <span className="text-sm text-text-secondary">
            • ${asset.purchasePrice.toLocaleString()}
          </span>
        )}
      </div>

      {/* Notes */}
      {asset.notes && <p className="text-sm text-text-secondary mt-4 italic">{asset.notes}</p>}
    </motion.div>
  )
}
