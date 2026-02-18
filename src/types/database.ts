export type UserType = 'lancer' | 'homeowner'

export interface Profile {
  id: string
  user_type: UserType
  full_name: string | null
  bio: string | null
  avatar_url: string | null
  skills: string[] | null
  needs: string[] | null
  created_at: string
  updated_at: string
}
