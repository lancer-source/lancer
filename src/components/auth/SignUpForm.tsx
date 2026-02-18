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
  const [confirmPassword, setConfirmPassword] = useState('')
  const [userType, setUserType] = useState<UserType | ''>('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!userType) {
      setErrorMessage("Please select whether you're a Lancer or homeowner.")
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

    if (password !== confirmPassword) {
      setErrorMessage('Passwords don\'t match.')
      setStatus('error')
      return
    }

    setStatus('loading')
    setErrorMessage('')

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
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

    setStatus('success')
    router.push('/profile/setup')
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

      <AuthInput
        id="confirm-password"
        label="Confirm Password"
        type="password"
        value={confirmPassword}
        onChange={(val) => {
          setConfirmPassword(val)
          if (status === 'error') setStatus('idle')
        }}
        placeholder="Confirm your password"
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

      <GoogleAuthButton label="Sign up with Google" />

      <p className="text-center text-sm text-slate-600">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-brand-600 hover:text-brand-700">
          Log in
        </Link>
      </p>
    </form>
  )
}
