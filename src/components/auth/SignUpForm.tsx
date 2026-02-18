'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { AuthInput } from '@/components/ui/AuthInput'
import { AuthButton } from '@/components/ui/AuthButton'
import { UserTypeSelector } from '@/components/auth/UserTypeSelector'
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton'
import type { UserType } from '@/types/database'
import Link from 'next/link'

export function SignUpForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [userType, setUserType] = useState<UserType | ''>('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!userType) {
      setErrorMessage('Please select whether you offer or need services.')
      setStatus('error')
      return
    }

    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.')
      setStatus('error')
      return
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.')
      setStatus('error')
      return
    }

    setStatus('loading')
    setErrorMessage('')

    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { user_type: userType },
      },
    })

    if (error) {
      if (error.message.toLowerCase().includes('already registered')) {
        setErrorMessage('This email is already registered. Try logging in.')
      } else {
        setErrorMessage(error.message)
      }
      setStatus('error')
      return
    }

    // If Supabase returned a user but no session, email confirmation is required
    if (data?.user && !data.session) {
      setStatus('success')
      return
    }

    router.push('/profile/setup')
  }

  if (status === 'success') {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-50">
          <svg className="h-6 w-6 text-brand-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-slate-900">Check your email</h2>
        <p className="text-sm text-slate-600">
          We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.
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
      <UserTypeSelector
        value={userType}
        onChange={(val) => {
          setUserType(val)
          if (status === 'error') setStatus('idle')
        }}
        disabled={status === 'loading'}
      />

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
        placeholder="At least 6 characters"
        disabled={status === 'loading'}
        autoComplete="new-password"
      />

      {status === 'error' && errorMessage && (
        <p className="text-sm text-red-600">{errorMessage}</p>
      )}

      <AuthButton loading={status === 'loading'}>
        {status === 'loading' ? 'Creating account...' : 'Create Account'}
      </AuthButton>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-4 text-slate-500">or</span>
        </div>
      </div>

      <GoogleAuthButton label="Sign up with Google" userType={userType || undefined} />

      <p className="text-center text-sm text-slate-600">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-brand-600 hover:text-brand-700">
          Log in
        </Link>
      </p>
    </form>
  )
}
