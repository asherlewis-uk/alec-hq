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
import { ComponentCondition } from '@/lib/types'

interface AddComponentModalProps {
  assetId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AddComponentModal({
  assetId,
  open,
  onOpenChange,
  onSuccess,
}: AddComponentModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    model: '',
    condition: 'STOCK' as ComponentCondition,
    specs: '',
    notes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const specs: Record<string, string> = {}
    if (formData.specs) {
      formData.specs.split('\n').forEach((line) => {
        const [key, value] = line.split(':').map((s) => s.trim())
        if (key && value) specs[key] = value
      })
    }

    await supabase.from('components').insert([
      {
        asset_id: assetId,
        name: formData.name,
        brand: formData.brand || null,
        model: formData.model || null,
        condition: formData.condition,
        specs: specs,
        notes: formData.notes || null,
      },
    ])

    setFormData({ name: '', brand: '', model: '', condition: 'STOCK', specs: '', notes: '' })
    onOpenChange(false)
    onSuccess()
    setIsSubmitting(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-b from-white/10 to-white/5 border-white/20">
        <DialogHeader>
          <DialogTitle className="text-white">Add Component</DialogTitle>
          <DialogDescription className="text-text-secondary">
            Add a new component to this asset
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-white">Name *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., GPU"
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
              <label className="text-sm text-white">Model</label>
              <Input
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                placeholder="e.g., RTX 4090"
                className="mt-1 bg-white/10 border-white/20 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-white">Condition</label>
              <Select
                value={formData.condition}
                onValueChange={(v) => setFormData({ ...formData, condition: v as ComponentCondition })}
              >
                <SelectTrigger className="mt-1 bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black/80 border-white/20">
                  <SelectItem value="STOCK">Stock</SelectItem>
                  <SelectItem value="UPGRADED">Upgraded</SelectItem>
                  <SelectItem value="AFTERMARKET">Aftermarket</SelectItem>
                  <SelectItem value="WORN">Worn</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm text-white">Specs (key: value, one per line)</label>
            <Textarea
              value={formData.specs}
              onChange={(e) => setFormData({ ...formData, specs: e.target.value })}
              placeholder="e.g.,&#10;VRAM: 16GB&#10;Clock Speed: 2.5GHz"
              className="mt-1 bg-white/10 border-white/20 text-white text-xs"
              rows={3}
            />
          </div>

          <div>
            <label className="text-sm text-white">Notes</label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional notes..."
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
              {isSubmitting ? 'Adding...' : 'Add Component'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}