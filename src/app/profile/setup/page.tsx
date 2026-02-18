import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProfileForm } from '@/components/profile/ProfileForm'
import type { Profile } from '@/types/database'
import Link from 'next/link'

export const metadata = {
  title: 'Complete Your Profile — Lancer',
  description: 'Set up your Lancer profile with a name, bio, photo, and skills.',
}

export default async function ProfileSetupPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    await supabase.auth.signOut()
    redirect('/signup')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="text-3xl font-bold tracking-tight text-brand-600 font-display">
            Lancer
          </Link>
          <h1 className="mt-6 text-2xl font-bold tracking-tight text-slate-900">
            Complete your profile
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Help others get to know you.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <ProfileForm profile={profile as Profile} mode="setup" />
        </div>
      </div>
    </div>
  )
}
