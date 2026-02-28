'use client'

import { Component } from '@/lib/types'
import { getConditionColor } from '@/lib/utils/formatters'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useState } from 'react'

interface ComponentCardProps {
  component: Component
  onDelete: () => void
}

export function ComponentCard({ component, onDelete }: ComponentCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    await supabase.from('components').delete().eq('id', component.id)
    onDelete()
  }

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`glass rounded-glass p-4 border-l-2 ${getConditionColor(
        component.condition
      )}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-white">{component.name}</h3>
          {component.brand && (
            <p className="text-sm text-text-secondary">{component.brand}</p>
          )}
        </div>
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

      {/* Specs */}
      {component.specs && Object.keys(component.specs).length > 0 && (
        <div className="mb-3 space-y-1">
          {Object.entries(component.specs).map(([key, value]) => (
            <div key={key} className="text-xs">
              <span className="text-text-secondary">{key}:</span>
              <span className="text-white ml-2">{value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Condition Badge */}
      <Badge variant="outline" className="text-xs bg-white/5 border-white/20">
        {component.condition}
      </Badge>

      {/* Notes */}
      {component.notes && (
        <p className="text-xs text-text-muted mt-3 italic">"{component.notes}"</p>
      )}
    </motion.div>
  )
}