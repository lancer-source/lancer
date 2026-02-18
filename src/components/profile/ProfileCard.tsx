import Image from 'next/image'
import Link from 'next/link'
import type { Profile } from '@/types/database'

interface ProfileCardProps {
  profile: Profile
}

export function ProfileCard({ profile }: ProfileCardProps) {
  const initials = profile.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  const isLancer = profile.user_type === 'lancer'
  const tags = isLancer ? (profile.skills ?? []) : (profile.needs ?? [])
  const tagsLabel = isLancer ? 'Skills' : 'Home Service Needs'

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="flex flex-col items-center text-center">
        {/* Avatar */}
        <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-slate-200">
          {profile.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt={profile.full_name ?? 'Profile photo'}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-brand-100 text-xl font-bold text-brand-600">
              {initials}
            </div>
          )}
        </div>

        {/* Name and badge */}
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
          {profile.full_name ?? 'No name yet'}
        </h1>
        <span className="mt-2 inline-block rounded-full bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-700">
          {isLancer ? 'Lancer' : 'Homeowner'}
        </span>

        {/* Bio */}
        <div className="mt-6 w-full text-left">
          {profile.bio ? (
            <p className="text-base leading-relaxed text-slate-600">{profile.bio}</p>
          ) : (
            <p className="text-sm italic text-slate-400">
              Add a bio to tell people about yourself.
            </p>
          )}
        </div>

        {/* Skills / Needs */}
        <div className="mt-6 w-full text-left">
          <h2 className="mb-2 text-sm font-medium text-slate-700">{tagsLabel}</h2>
          {tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm italic text-slate-400">
              {isLancer ? 'Add your skills to help homeowners find you.' : 'Add your needs so Lancers know how to help.'}
            </p>
          )}
        </div>

        {/* Edit link */}
        <Link
          href="/profile/edit"
          className="mt-8 inline-flex items-center gap-2 rounded-full border border-slate-300 px-6 py-2.5 text-sm font-medium text-slate-700 transition-all hover:border-brand-500 hover:text-brand-600"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
          </svg>
          Edit Profile
        </Link>
      </div>
    </div>
  )
}
