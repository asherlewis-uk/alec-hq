'use client'

import { Asset, Component } from '@/lib/types'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'

interface SpecCardProps {
  asset: Asset
  components: Component[]
}

export function SpecCard({ asset, components }: SpecCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="glass rounded-glass p-8"
    >
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">{asset.name}</h2>
        <p className="text-sm text-text-secondary mt-1">Specification Card</p>
      </div>

      {/* Specs Grid */}
      {components.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {components.map((component) => (
            <div key={component.id} className="border-l-2 border-accent/30 pl-4">
              <h3 className="font-semibold text-white">{component.name}</h3>
              {component.brand && (
                <p className="text-sm text-text-secondary">{component.brand}</p>
              )}

              {component.specs && Object.keys(component.specs).length > 0 && (
                <div className="mt-3 space-y-1">
                  {Object.entries(component.specs).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-text-secondary">{key}</span>
                      <span className="text-white font-mono">{value}</span>
                    </div>
                  ))}
                </div>
              )}

              <Badge variant="outline" className="mt-3 bg-white/5 border-white/20 text-xs">
                {component.condition}
              </Badge>

              {component.notes && <p className="text-xs text-text-muted mt-3 italic">{component.notes}</p>}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-text-secondary">No components added yet</p>
      )}
    </motion.div>
  )
}
