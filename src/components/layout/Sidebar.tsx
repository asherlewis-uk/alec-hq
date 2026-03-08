'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Home, Zap, Cpu } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const navItems = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/garage', label: 'The Garage', icon: Zap },
  { href: '/rig', label: 'The Rig', icon: Cpu },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-full p-6 bg-black/20">
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-accent to-orange-400 bg-clip-text text-transparent">
          ALEC
        </h1>
        <p className="text-xs text-text-secondary mt-1">Command Center</p>
      </motion.div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 4 }}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-glass transition-all duration-200',
                  isActive ? 'glass-accent' : 'hover:glass'
                )}
              >
                <Icon className={cn('w-5 h-5', isActive ? 'text-accent' : 'text-text-secondary')} />
                <span className={cn('text-sm font-medium', isActive ? 'text-white' : 'text-text-secondary')}>
                  {item.label}
                </span>
              </motion.div>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="pt-6 border-t border-white/10"
      >
        <p className="text-xs text-text-muted">ALEC.HQ v1.0</p>
        <p className="text-xs text-text-muted mt-2">Personal Command Center</p>
      </motion.div>
    </div>
  )
}
