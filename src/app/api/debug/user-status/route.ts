import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()
    
    // Check auth.users table
    const { data: authUser, error: authError } = await supabase
      .from('auth.users')
      .select('id, email, email_confirmed_at, created_at')
      .eq('email', email)
      .single()

    // Check profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, username, "fullName", role, "createdAt"')
      .eq('id', authUser?.id || '')
      .single()

    return NextResponse.json({
      authUser: authUser || null,
      profile: profile || null,
      authError: authError?.message || null,
      profileError: profileError?.message || null,
      hasAuthUser: !!authUser,
      hasProfile: !!profile,
      isEmailConfirmed: !!authUser?.email_confirmed_at,
      role: profile?.role || null
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to check user status', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

