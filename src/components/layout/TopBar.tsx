'use client'

import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { QuickAddSheet } from '@/components/dashboard/QuickAddSheet'
import { useState } from 'react'

const pathLabels: Record<string, string> = {
  '/': 'Dashboard',
  '/garage': 'The Garage',
  '/rig': 'The Rig',
}

export function TopBar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const getLabel = () => {
    if (pathname.startsWith('/garage/')) return 'Vehicle Details'
    if (pathname.startsWith('/rig/')) return 'Rig Details'
    return pathLabels[pathname] || 'ALEC.HQ'
  }

  return (
    <div className="flex items-center justify-between p-4 md:p-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h2 className="text-2xl font-bold text-white">{getLabel()}</h2>
      </motion.div>

      <div className="flex items-center gap-3">
        <QuickAddSheet open={isOpen} onOpenChange={setIsOpen}>
          <Button
            onClick={() => setIsOpen(true)}
            className="bg-accent hover:bg-accent/90 text-black rounded-glass"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </QuickAddSheet>
      </div>
    </div>
  )
}