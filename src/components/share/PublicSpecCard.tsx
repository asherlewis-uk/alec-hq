'use client'

import { Asset, Component } from '@/lib/types'
import { getCategoryEmoji, getCategoryLabel, formatDate } from '@/lib/utils/formatters'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'

interface PublicSpecCardProps {
  asset: Asset
  components: Component[]
}

export function PublicSpecCard({ asset, components }: PublicSpecCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gradient-to-br from-[#0d0d1a] to-[#1a0a00] min-h-screen p-4 md:p-8"
    >
      <div className="max-w-2xl mx-auto">
        {/* Header Card */}
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className="glass rounded-glass p-8 mb-6"
        >
          <div className="flex items-center gap-4 mb-4">
            <span className="text-6xl">{getCategoryEmoji(asset.category)}</span>
            <div>
              <p className="text-sm text-text-secondary">{getCategoryLabel(asset.category)}</p>
              <h1 className="text-4xl font-bold text-white">{asset.name}</h1>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            <Badge className="bg-accent/20 text-accent border-accent/30 border">
              {asset.status}
            </Badge>
            <span className="text-sm text-text-secondary">
              Created {formatDate(asset.createdAt)}
            </span>
          </div>

          {asset.notes && <p className="text-sm text-text-secondary mt-4 italic">{asset.notes}</p>}
        </motion.div>

        {/* Specifications */}
        {components.length > 0 ? (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-glass p-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Specifications</h2>

            <div className="space-y-8">
              {components.map((component) => (
                <div key={component.id} className="border-l-2 border-accent/30 pl-6">
                  <h3 className="text-lg font-semibold text-white">{component.name}</h3>
                  {component.brand && (
                    <p className="text-sm text-text-secondary">{component.brand}</p>
                  )}

                  {component.specs && Object.keys(component.specs).length > 0 && (
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      {Object.entries(component.specs).map(([key, value]) => (
                        <div key={key}>
                          <p className="text-xs text-text-secondary uppercase tracking-wider">
                            {key}
                          </p>
                          <p className="text-base text-white font-mono mt-1">{value}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <Badge
                    variant="outline"
                    className="mt-4 bg-white/5 border-white/20 text-xs"
                  >
                    {component.condition}
                  </Badge>

                  {component.notes && <p className="text-xs text-text-muted mt-3 italic">{component.notes}</p>}
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <div className="glass rounded-glass p-8 text-center">
            <p className="text-text-secondary">No specifications added yet</p>
          </div>
        )}

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mt-8"
        >
          <p className="text-xs text-text-muted">Built with ALEC.HQ</p>
        </motion.div>
      </div>
    </motion.div>
  )
}
