import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const userType = searchParams.get('user_type')

  if (!code) {
    return NextResponse.redirect(`${origin}/login`)
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(`${origin}/login`)
  }

  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, user_type')
      .eq('id', user.id)
      .single()

    // Apply user_type from OAuth redirect if the profile doesn't have one yet
    if (profile && userType && (userType === 'lancer' || userType === 'homeowner') && !profile.user_type) {
      await supabase
        .from('profiles')
        .update({ user_type: userType })
        .eq('id', user.id)
    }

    if (profile?.full_name) {
      return NextResponse.redirect(`${origin}/profile`)
    }
  }

  return NextResponse.redirect(`${origin}/profile/setup`)
}
