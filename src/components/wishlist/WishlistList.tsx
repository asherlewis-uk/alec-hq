'use client'

import { WishlistItem } from '@/lib/types'
import { WishlistItemComponent } from './WishlistItem'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { AddWishlistModal } from './AddWishlistModal'
import { Plus } from 'lucide-react'
import { motion } from 'framer-motion'

interface WishlistListProps {
  assetId: string
  items: WishlistItem[]
  onItemAdded: () => void
  onItemDeleted: () => void
}

export function WishlistList({
  assetId,
  items,
  onItemAdded,
  onItemDeleted,
}: WishlistListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const sortedItems = [...items].sort((a, b) => {
    const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 }
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      {/* Add Button */}
      <Button
        onClick={() => setIsModalOpen(true)}
        className="bg-accent/20 hover:bg-accent/30 text-accent border border-accent/30 rounded-glass"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Wishlist Item
      </Button>

      {/* Modal */}
      <AddWishlistModal
        assetId={assetId}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSuccess={() => {
          setIsModalOpen(false)
          onItemAdded()
        }}
      />

      {/* Wishlist */}
      {sortedItems.length > 0 ? (
        <div className="space-y-3">
          {sortedItems.map((item) => (
            <WishlistItemComponent key={item.id} item={item} onDelete={onItemDeleted} />
          ))}
        </div>
      ) : (
        <div className="glass rounded-glass p-8 text-center">
          <p className="text-text-secondary">Nothing on your wishlist yet</p>
        </div>
      )}
    </motion.div>
  )
}