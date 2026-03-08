'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('App error boundary:', error)
  }, [error])

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0d0d1a] to-[#1a0a00] flex items-center justify-center px-4">
      <div className="glass rounded-glass p-8 max-w-lg w-full">
        <h1 className="text-2xl font-bold text-white">Something went wrong</h1>
        <p className="text-text-secondary mt-2">{error.message || 'An unexpected error occurred.'}</p>
        <Button onClick={reset} className="mt-6 bg-accent hover:bg-accent/90 text-black rounded-glass">
          Try again
        </Button>
      </div>
    </main>
  )
}
