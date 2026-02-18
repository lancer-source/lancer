import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SignUpForm } from '@/components/auth/SignUpForm'
import Link from 'next/link'

export const metadata = {
  title: 'Sign Up — Lancer',
  description: 'Create your Lancer account to connect with homeowners or find skilled workers.',
}

export default async function SignUpPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) redirect('/profile')

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="text-3xl font-bold tracking-tight text-brand-600 font-display">
            Lancer
          </Link>
          <h1 className="mt-6 text-2xl font-bold tracking-tight text-slate-900">
            Create your account
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Join the marketplace — it&apos;s free.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <SignUpForm />
        </div>
      </div>
    </div>
  )
}
