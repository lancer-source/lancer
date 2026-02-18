import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProfileForm } from '@/components/profile/ProfileForm'
import type { Profile } from '@/types/database'
import Link from 'next/link'

export const metadata = {
  title: 'Edit Profile — Lancer',
  description: 'Edit your Lancer profile.',
}

export default async function ProfileEditPage() {
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
            Edit your profile
          </h1>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <ProfileForm profile={profile as Profile} mode="edit" />
        </div>

        <p className="mt-4 text-center">
          <Link href="/profile" className="text-sm text-slate-500 hover:text-slate-700">
            ← Back to profile
          </Link>
        </p>
      </div>
    </div>
  )
}
