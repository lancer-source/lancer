import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm'
import Link from 'next/link'

export const metadata = {
  title: 'Reset Password — Lancer',
  description: 'Reset your Lancer account password.',
}

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="text-3xl font-bold tracking-tight text-brand-600 font-display">
            Lancer
          </Link>
          <h1 className="mt-6 text-2xl font-bold tracking-tight text-slate-900">
            Reset your password
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Enter your email and we&apos;ll send you a reset link.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  )
}
