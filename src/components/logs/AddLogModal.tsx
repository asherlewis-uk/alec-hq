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
import { LogType } from '@/lib/types'
import { apiRequest } from '@/lib/api/client'

interface AddLogModalProps {
  assetId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AddLogModal({ assetId, open, onOpenChange, onSuccess }: AddLogModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    type: 'MAINTENANCE' as LogType,
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    mileage: '',
    cost: '',
    performedBy: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    try {
      await apiRequest(`/api/assets/${assetId}/logs`, {
        method: 'POST',
        body: {
          type: formData.type,
          title: formData.title,
          description: formData.description || null,
          date: formData.date,
          mileage: formData.mileage ? parseFloat(formData.mileage) : null,
          cost: formData.cost ? parseFloat(formData.cost) : null,
          performedBy: formData.performedBy || null,
        },
      })

      setFormData({
        type: 'MAINTENANCE',
        title: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        mileage: '',
        cost: '',
        performedBy: '',
      })
      onOpenChange(false)
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add log entry')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-b from-white/10 to-white/5 border-white/20">
        <DialogHeader>
          <DialogTitle className="text-white">Add Log Entry</DialogTitle>
          <DialogDescription className="text-text-secondary">
            Record maintenance, upgrades, or notes
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-white">Type *</label>
              <Select
                value={formData.type}
                onValueChange={(v) => setFormData({ ...formData, type: v as LogType })}
              >
                <SelectTrigger className="mt-1 bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black/80 border-white/20">
                  <SelectItem value="MAINTENANCE">🔧 Maintenance</SelectItem>
                  <SelectItem value="UPGRADE">⬆️ Upgrade</SelectItem>
                  <SelectItem value="REPAIR">🛠️ Repair</SelectItem>
                  <SelectItem value="INSPECTION">👀 Inspection</SelectItem>
                  <SelectItem value="NOTE">📝 Note</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-white">Date *</label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="mt-1 bg-white/10 border-white/20 text-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-white">Title *</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Oil change"
              className="mt-1 bg-white/10 border-white/20 text-white"
              required
            />
          </div>

          <div>
            <label className="text-sm text-white">Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Details about the service..."
              className="mt-1 bg-white/10 border-white/20 text-white text-xs"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-white">Mileage</label>
              <Input
                type="number"
                value={formData.mileage}
                onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                placeholder="e.g., 45000"
                className="mt-1 bg-white/10 border-white/20 text-white text-sm"
              />
            </div>
            <div>
              <label className="text-sm text-white">Cost</label>
              <Input
                type="number"
                step="0.01"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                placeholder="e.g., 150.00"
                className="mt-1 bg-white/10 border-white/20 text-white text-sm"
              />
            </div>
            <div>
              <label className="text-sm text-white">Performed By</label>
              <Input
                value={formData.performedBy}
                onChange={(e) => setFormData({ ...formData, performedBy: e.target.value })}
                placeholder="self, shop name"
                className="mt-1 bg-white/10 border-white/20 text-white text-sm"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            {error && <p className="text-red-300 text-sm">{error}</p>}
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
              disabled={isSubmitting || !formData.title}
              className="bg-accent hover:bg-accent/90 text-black flex-1 rounded-glass"
            >
              {isSubmitting ? 'Adding...' : 'Add Entry'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
