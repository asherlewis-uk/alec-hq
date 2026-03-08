'use client'

import { FormEvent, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { apiRequest } from '@/lib/api/client'
import { Button } from '@/components/ui/button'

function PinInput({
  length = 6,
  value,
  onChange,
  disabled,
}: {
  length?: number
  value: string
  onChange: (v: string) => void
  disabled?: boolean
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([])

  const focusIndex = useCallback(
    (i: number) => {
      if (i >= 0 && i < length) refs.current[i]?.focus()
    },
    [length],
  )

  const handleChange = (i: number, char: string) => {
    if (!/^\d?$/.test(char)) return
    const arr = value.split('')
    arr[i] = char
    const next = arr.join('').slice(0, length)
    onChange(next)
    if (char && i < length - 1) focusIndex(i + 1)
  }

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !value[i] && i > 0) {
      focusIndex(i - 1)
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    if (pasted) {
      onChange(pasted)
      focusIndex(Math.min(pasted.length, length - 1))
    }
  }

  return (
    <div className="flex gap-3 justify-center" onPaste={handlePaste}>
      {Array.from({ length }, (_, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] ?? ''}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onFocus={(e) => e.target.select()}
          disabled={disabled}
          autoFocus={i === 0}
          className="w-12 h-14 text-center text-2xl font-mono rounded-xl bg-white/10 border border-white/20 text-white focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors disabled:opacity-40"
          aria-label={`PIN digit ${i + 1}`}
        />
      ))}
    </div>
  )
}

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextPath = searchParams.get('next') || '/'

  const [pin, setPin] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasPin, setHasPin] = useState<boolean | null>(null)

  useEffect(() => {
    apiRequest<{ hasPin: boolean }>('/api/auth/pin/status')
      .then((data) => setHasPin(data.hasPin))
      .catch(() => setHasPin(false))
  }, [])

  const isSetup = hasPin === false
  const canSubmit = isSetup ? pin.length === 6 && confirm.length === 6 : pin.length === 6

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    if (!canSubmit) return

    if (isSetup && pin !== confirm) {
      setError('PINs do not match.')
      return
    }

    setIsSubmitting(true)
    try {
      await apiRequest('/api/auth/pin', {
        method: 'POST',
        body: isSetup ? { pin, confirm } : { pin },
      })
      router.replace(nextPath)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (hasPin === null) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-[#0d0d1a] to-[#1a0a00] flex items-center justify-center" />
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0d0d1a] to-[#1a0a00] flex items-center justify-center px-4">
      <div className="glass rounded-glass w-full max-w-sm p-8 text-center">
        <h1 className="text-3xl font-bold text-white">ALEC.HQ</h1>
        <p className="text-text-secondary mt-2">
          {isSetup ? 'Create a 6-digit PIN to secure your app.' : 'Enter your PIN to continue.'}
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-2">
            {isSetup && <p className="text-xs text-text-secondary uppercase tracking-wider">New PIN</p>}
            <PinInput value={pin} onChange={setPin} disabled={isSubmitting} />
          </div>

          {isSetup && (
            <div className="space-y-2">
              <p className="text-xs text-text-secondary uppercase tracking-wider">Confirm PIN</p>
              <PinInput value={confirm} onChange={setConfirm} disabled={isSubmitting} />
            </div>
          )}

          {error && <p className="text-sm text-red-300">{error}</p>}

          <Button
            type="submit"
            disabled={isSubmitting || !canSubmit}
            className="w-full bg-accent hover:bg-accent/90 text-black rounded-glass"
          >
            {isSubmitting ? (isSetup ? 'Setting up...' : 'Unlocking...') : isSetup ? 'Set PIN' : 'Unlock'}
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
