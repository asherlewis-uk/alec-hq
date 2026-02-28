'use client'

import { WishlistItem } from '@/lib/types'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trash2, ExternalLink } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useState } from 'react'
import { formatCurrency } from '@/lib/utils/formatters'

interface WishlistItemComponentProps {
  item: WishlistItem
  onDelete: () => void
}

export function WishlistItemComponent({ item, onDelete }: WishlistItemComponentProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    await supabase.from('wishlist_items').delete().eq('id', item.id)
    onDelete()
  }

  const priorityColor = {
    HIGH: 'bg-red-500/20 border-red-500/30',
    MEDIUM: 'bg-yellow-500/20 border-yellow-500/30',
    LOW: 'bg-blue-500/20 border-blue-500/30',
  }

  return (
    <motion.div
      whileHover={{ x: 4 }}
      className={`glass rounded-glass p-4 border ${priorityColor[item.priority]}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-white">{item.name}</h3>
          {item.brand && <p className="text-sm text-text-secondary">{item.brand}</p>}
          {item.notes && (
            <p className="text-sm text-text-muted mt-2 italic">"{item.notes}"</p>
          )}
        </div>
        <div className="flex gap-2">
          {item.url && (
            <Button
              size="sm"
              variant="ghost"
              asChild
              className="text-accent hover:text-accent/80"
            >
              <a href={item.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-red-400 hover:text-red-300"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3">
        <Badge
          variant="outline"
          className="text-xs bg-white/5 border-white/20 capitalize"
        >
          {item.priority}
        </Badge>
        {item.estimatedPrice && (
          <span className="text-sm font-mono text-accent">
            {formatCurrency(item.estimatedPrice)}
          </span>
        )}
      </div>
    </motion.div>
  )
}