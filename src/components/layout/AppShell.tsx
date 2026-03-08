'use client'

import { ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex h-screen bg-gradient-to-br from-[#0d0d1a] to-[#1a0a00] overflow-hidden">
      {/* Sidebar */}
      <div className="hidden md:block w-64 border-r border-white/10 overflow-y-auto">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="border-b border-white/10 backdrop-blur-sm">
          <TopBar />
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <main className="p-4 md:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  )
}
