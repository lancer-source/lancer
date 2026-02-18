'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { AuthInput } from '@/components/ui/AuthInput'
import { AuthButton } from '@/components/ui/AuthButton'
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton'
import Link from 'next/link'

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.')
      setStatus('error')
      return
    }

    if (!password) {
      setErrorMessage('Please enter your password.')
      setStatus('error')
      return
    }

    setStatus('loading')
    setErrorMessage('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setErrorMessage('Invalid email or password.')
      setStatus('error')
      return
    }

    router.push('/profile')
    router.refresh()
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

      <AuthInput
        id="password"
        label="Password"
        type="password"
        value={password}
        onChange={(val) => {
          setPassword(val)
          if (status === 'error') setStatus('idle')
        }}
        placeholder="Your password"
        disabled={status === 'loading'}
        autoComplete="current-password"
      />

      <div className="flex justify-end">
        <Link
          href="/forgot-password"
          className="text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          Forgot password?
        </Link>
      </div>

      {status === 'error' && errorMessage && (
        <p className="text-sm text-red-600">{errorMessage}</p>
      )}

      <AuthButton loading={status === 'loading'}>
        {status === 'loading' ? 'Logging in...' : 'Log In'}
      </AuthButton>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-4 text-slate-500">or</span>
        </div>
      </div>

      <GoogleAuthButton />

      <p className="text-center text-sm text-slate-600">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="font-medium text-brand-600 hover:text-brand-700">
          Sign up
        </Link>
      </p>
    </form>
  )
}
