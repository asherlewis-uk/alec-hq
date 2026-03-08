'use client'

import { AssetLog } from '@/lib/types'
import { formatDate, getLogTypeIcon } from '@/lib/utils/formatters'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import { apiRequest } from '@/lib/api/client'

interface LogEntryProps {
  log: AssetLog
  isLast?: boolean
  onDelete: () => void
}

export function LogEntry({ log, isLast, onDelete }: LogEntryProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await apiRequest<void>(`/api/logs/${log.id}`, { method: 'DELETE' })
      onDelete()
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="relative flex gap-4"
    >
      {/* Timeline Dot */}
      <div className="flex flex-col items-center">
        <div className="w-3 h-3 rounded-full bg-accent mt-2" />
        {!isLast && <div className="w-0.5 h-16 bg-accent/20 mt-1" />}
      </div>

      {/* Content */}
      <div className="glass rounded-glass p-4 flex-1 mb-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span>{getLogTypeIcon(log.type)}</span>
              <h3 className="font-bold text-white">{log.title}</h3>
            </div>
            <p className="text-sm text-text-secondary">{formatDate(log.date)}</p>
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

        {log.description && (
          <p className="text-sm text-white mt-3">{log.description}</p>
        )}

        {/* Meta Info */}
        <div className="flex flex-wrap gap-4 mt-3 text-xs text-text-secondary">
          {log.mileage && <span>Mileage: {log.mileage.toLocaleString()} mi</span>}
          {log.cost && <span>Cost: ${log.cost.toLocaleString()}</span>}
          {log.performedBy && <span>By: {log.performedBy}</span>}
        </div>
      </div>
    </motion.div>
  )
}
