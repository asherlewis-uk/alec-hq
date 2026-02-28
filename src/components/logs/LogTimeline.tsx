'use client'

import { AssetLog } from '@/lib/types'
import { LogEntry } from './LogEntry'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { AddLogModal } from './AddLogModal'
import { Plus } from 'lucide-react'
import { motion } from 'framer-motion'

interface LogTimelineProps {
  assetId: string
  logs: AssetLog[]
  onLogAdded: () => void
  onLogDeleted: () => void
}

export function LogTimeline({ assetId, logs, onLogAdded, onLogDeleted }: LogTimelineProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      {/* Add Button */}
      <Button
        onClick={() => setIsModalOpen(true)}
        className="bg-accent/20 hover:bg-accent/30 text-accent border border-accent/30 rounded-glass"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Log Entry
      </Button>

      {/* Modal */}
      <AddLogModal
        assetId={assetId}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSuccess={() => {
          setIsModalOpen(false)
          onLogAdded()
        }}
      />

      {/* Timeline */}
      {logs.length > 0 ? (
        <div className="space-y-4">
          {logs.map((log, index) => (
            <LogEntry key={log.id} log={log} isLast={index === logs.length - 1} onDelete={onLogDeleted} />
          ))}
        </div>
      ) : (
        <div className="glass rounded-glass p-8 text-center">
          <p className="text-text-secondary">No log entries yet</p>
        </div>
      )}
    </motion.div>
  )
}