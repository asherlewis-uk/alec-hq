'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { supabase } from '@/lib/supabase'
import { WishlistPriority } from '@/lib/types'

interface AddWishlistModalProps {
  assetId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AddWishlistModal({
  assetId,
  open,
  onOpenChange,
  onSuccess,
}: AddWishlistModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    url: '',
    estimatedPrice: '',
    priority: 'MEDIUM' as WishlistPriority,
    notes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    await supabase.from('wishlist_items').insert([
      {
        asset_id: assetId,
        name: formData.name,
        brand: formData.brand || null,
        url: formData.url || null,
        estimated_price: formData.estimatedPrice ? parseFloat(formData.estimatedPrice) : null,
        priority: formData.priority,
        notes: formData.notes || null,
      },
    ])

    setFormData({
      name: '',
      brand: '',
      url: '',
      estimatedPrice: '',
      priority: 'MEDIUM',
      notes: '',
    })
    onOpenChange(false)
    onSuccess()
    setIsSubmitting(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-b from-white/10 to-white/5 border-white/20">
        <DialogHeader>
          <DialogTitle className="text-white">Add Wishlist Item</DialogTitle>
          <DialogDescription className="text-text-secondary">
            Add something you want to upgrade or purchase
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-white">Name *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., RTX 5090"
                className="mt-1 bg-white/10 border-white/20 text-white"
                required
              />
            </div>
            <div>
              <label className="text-sm text-white">Brand</label>
              <Input
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                placeholder="e.g., NVIDIA"
                className="mt-1 bg-white/10 border-white/20 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-white">Priority</label>
              <Select
                value={formData.priority}
                onValueChange={(v) => setFormData({ ...formData, priority: v as WishlistPriority })}
              >
                <SelectTrigger className="mt-1 bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black/80 border-white/20">
                  <SelectItem value="HIGH">🔴 High</SelectItem>
                  <SelectItem value="MEDIUM">🟡 Medium</SelectItem>
                  <SelectItem value="LOW">🔵 Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-white">Est. Price</label>
              <Input
                type="number"
                step="0.01"
                value={formData.estimatedPrice}
                onChange={(e) => setFormData({ ...formData, estimatedPrice: e.target.value })}
                placeholder="e.g., 1999.99"
                className="mt-1 bg-white/10 border-white/20 text-white text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-white">Product URL</label>
            <Input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="https://..."
              className="mt-1 bg-white/10 border-white/20 text-white text-sm"
            />
          </div>

          <div>
            <label className="text-sm text-white">Notes</label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Why you want this..."
              className="mt-1 bg-white/10 border-white/20 text-white text-xs"
              rows={2}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-white/20 text-white hover:bg-white/10 flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !formData.name}
              className="bg-accent hover:bg-accent/90 text-black flex-1 rounded-glass"
            >
              {isSubmitting ? 'Adding...' : 'Add Item'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}