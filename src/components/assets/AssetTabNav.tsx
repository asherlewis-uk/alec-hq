'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface Tab {
  id: string
  label: string
  icon: string
  content: ReactNode
}

interface AssetTabNavProps {
  tabs: Tab[]
}

export function AssetTabNav({ tabs }: AssetTabNavProps) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
      <Tabs defaultValue={tabs[0].id} className="w-full">
        <TabsList className="glass rounded-glass p-1 mb-6 w-full grid grid-cols-3 gap-1">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="data-[state=active]:bg-accent/20 data-[state=active]:text-accent text-text-secondary"
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id}>
            {tab.content}
          </TabsContent>
        ))}
      </Tabs>
    </motion.div>
  )
}