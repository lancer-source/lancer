'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { AuthInput } from '@/components/ui/AuthInput'
import { AuthButton } from '@/components/ui/AuthButton'
import { AvatarUpload } from '@/components/profile/AvatarUpload'
import { SkillsInput } from '@/components/profile/SkillsInput'
import type { Profile, UserType } from '@/types/database'
import Link from 'next/link'

interface ProfileFormProps {
  profile: Profile
  mode: 'setup' | 'edit'
}

export function ProfileForm({ profile, mode }: ProfileFormProps) {
  const router = useRouter()
  const [fullName, setFullName] = useState(profile.full_name ?? '')
  const [bio, setBio] = useState(profile.bio ?? '')
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url)
  const [skills, setSkills] = useState<string[]>(profile.skills ?? [])
  const [needs, setNeeds] = useState<string[]>(profile.needs ?? [])
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const isLancer = profile.user_type === 'lancer'

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMessage('')

    const supabase = createClient()

    const updates: Partial<Profile> = {
      full_name: fullName.trim() || null,
      bio: bio.trim() || null,
      avatar_url: avatarUrl,
      skills: isLancer ? skills : null,
      needs: !isLancer ? needs : null,
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', profile.id)

    if (error) {
      setErrorMessage('Something went wrong. Please try again.')
      setStatus('error')
      return
    }

    router.push('/profile')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <AvatarUpload
        userId={profile.id}
        currentUrl={avatarUrl}
        fullName={fullName}
        onUpload={setAvatarUrl}
      />

      <AuthInput
        id="full-name"
        label="Full Name"
        value={fullName}
        onChange={setFullName}
        placeholder="Your full name"
        maxLength={100}
        disabled={status === 'loading'}
        autoComplete="name"
      />

      <div>
        <label htmlFor="bio" className="mb-1.5 block text-sm font-medium text-slate-700">
          Bio
        </label>
        <textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell people a bit about yourself..."
          maxLength={500}
          disabled={status === 'loading'}
          rows={4}
          className="w-full rounded-2xl border border-slate-300 bg-white px-5 py-3 text-base text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:opacity-60 resize-none"
        />
        <p className="mt-1 text-right text-xs text-slate-400">{bio.length}/500</p>
      </div>

      {isLancer ? (
        <SkillsInput
          label="Your Skills"
          placeholder="e.g. plumbing, electrical, painting..."
          value={skills}
          onChange={setSkills}
          disabled={status === 'loading'}
        />
      ) : (
        <SkillsInput
          label="Your Home Service Needs"
          placeholder="e.g. kitchen remodel, lawn care..."
          value={needs}
          onChange={setNeeds}
          disabled={status === 'loading'}
        />
      )}

      {status === 'error' && errorMessage && (
        <p className="text-sm text-red-600">{errorMessage}</p>
      )}

      <AuthButton loading={status === 'loading'}>
        {status === 'loading' ? 'Saving...' : 'Save Profile'}
      </AuthButton>

      {mode === 'setup' && (
        <p className="text-center">
          <Link href="/profile" className="text-sm text-slate-500 hover:text-slate-700">
            Skip for now
          </Link>
        </p>
      )}
    </form>
  )
}
