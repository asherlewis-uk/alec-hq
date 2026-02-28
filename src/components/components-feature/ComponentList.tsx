'use client'

import { Component } from '@/lib/types'
import { ComponentCard } from './ComponentCard'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { AddComponentModal } from './AddComponentModal'
import { Plus } from 'lucide-react'
import { motion } from 'framer-motion'

interface ComponentListProps {
  assetId: string
  components: Component[]
  onComponentAdded: () => void
  onComponentDeleted: () => void
}

export function ComponentList({
  assetId,
  components,
  onComponentAdded,
  onComponentDeleted,
}: ComponentListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      {/* Add Button */}
      <Button
        onClick={() => setIsModalOpen(true)}
        className="bg-accent/20 hover:bg-accent/30 text-accent border border-accent/30 rounded-glass"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Component
      </Button>

      {/* Modal */}
      <AddComponentModal
        assetId={assetId}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSuccess={() => {
          setIsModalOpen(false)
          onComponentAdded()
        }}
      />

      {/* Component List */}
      {components.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {components.map((component) => (
            <ComponentCard
              key={component.id}
              component={component}
              onDelete={onComponentDeleted}
            />
          ))}
        </div>
      ) : (
        <div className="glass rounded-glass p-8 text-center">
          <p className="text-text-secondary">No components added yet</p>
        </div>
      )}
    </motion.div>
  )
}