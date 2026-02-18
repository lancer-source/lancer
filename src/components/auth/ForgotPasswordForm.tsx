'use client'

import { useState, FormEvent } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AuthInput } from '@/components/ui/AuthInput'
import { AuthButton } from '@/components/ui/AuthButton'
import Link from 'next/link'

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.')
      setStatus('error')
      return
    }

    setStatus('loading')
    setErrorMessage('')

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    })

    if (error) {
      setErrorMessage('Please wait a moment before requesting another reset email.')
      setStatus('error')
      return
    }

    // Always show success to prevent email enumeration
    setStatus('success')
  }

  if (status === 'success') {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-50">
          <svg className="h-6 w-6 text-brand-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-slate-900">Check your email</h2>
        <p className="text-sm text-slate-600">
          If an account exists with that email, we&apos;ve sent a password reset link.
        </p>
        <Link
          href="/login"
          className="inline-block text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          Back to login
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <AuthInput
        id="email"
        label="Email"
        type="email"
        value={email}
        onChange={(val) => {
          setEmail(val)
          if (status === 'error') setStatus('idle')
        }}
        placeholder="you@example.com"
        disabled={status === 'loading'}
        autoComplete="email"
      />

      {status === 'error' && errorMessage && (
        <p className="text-sm text-red-600">{errorMessage}</p>
      )}

      <AuthButton loading={status === 'loading'}>
        {status === 'loading' ? 'Sending...' : 'Send Reset Link'}
      </AuthButton>

      <p className="text-center text-sm text-slate-600">
        Remember your password?{' '}
        <Link href="/login" className="font-medium text-brand-600 hover:text-brand-700">
          Log in
        </Link>
      </p>
    </form>
  )
}
