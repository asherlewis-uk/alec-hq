'use client'

import { FormEvent, Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { apiRequest } from '@/lib/api/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextPath = searchParams.get('next') || '/'

  const [passcode, setPasscode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      await apiRequest('/api/auth/passcode', {
        method: 'POST',
        body: { passcode },
      })
      router.replace(nextPath)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0d0d1a] to-[#1a0a00] flex items-center justify-center px-4">
      <div className="glass rounded-glass w-full max-w-md p-8">
        <h1 className="text-3xl font-bold text-white">ALEC.HQ</h1>
        <p className="text-text-secondary mt-2">Enter your passcode to continue.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="passcode" className="text-sm text-white">
              Passcode
            </label>
            <Input
              id="passcode"
              type="password"
              value={passcode}
              onChange={(event) => setPasscode(event.target.value)}
              autoFocus
              required
              className="mt-1 bg-white/10 border-white/20 text-white"
            />
          </div>

          {error && <p className="text-sm text-red-300">{error}</p>}

          <Button
            type="submit"
            disabled={isSubmitting || passcode.length === 0}
            className="w-full bg-accent hover:bg-accent/90 text-black rounded-glass"
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
      </div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-gradient-to-br from-[#0d0d1a] to-[#1a0a00]" />}>
      <LoginContent />
    </Suspense>
  )
}
