'use client'

import { motion } from 'framer-motion'

interface StatCardProps {
  label: string
  value: string
  emoji: string
}

export function StatCard({ label, value, emoji }: StatCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="glass glass-accent rounded-glass p-6"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-secondary text-sm">{label}</p>
          <h3 className="text-3xl font-bold text-primary mt-2">{value}</h3>
        </div>
        <span className="text-3xl">{emoji}</span>
      </div>
    </motion.div>
  )
}
