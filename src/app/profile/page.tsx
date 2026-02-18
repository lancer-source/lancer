import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProfileCard } from '@/components/profile/ProfileCard'
import { LogoutButton } from '@/components/auth/LogoutButton'
import type { Profile } from '@/types/database'
import Link from 'next/link'

export const metadata = {
  title: 'My Profile — Lancer',
  description: 'View and manage your Lancer profile.',
}

export default async function ProfilePage() {
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
    <div className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold tracking-tight text-brand-600 font-display">
            Lancer
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              ← Home
            </Link>
            <LogoutButton />
          </div>
        </div>

        <ProfileCard profile={profile as Profile} />
      </div>
    </div>
  )
}
