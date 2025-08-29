import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/supabase'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const id: string | undefined = body?.id
    if (!id) {
      return NextResponse.json({ message: 'Missing player id' }, { status: 400 })
    }

    // Verify requester is admin
    const serverSupabase = createServerComponentClient<Database>({ cookies })
    const { data: { user } } = await serverSupabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    const { data: profile } = await serverSupabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    if (profile?.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    }

    // Perform cascading deletes with service role
    const admin = createAdminClient()
    // Delete goals by this player first to satisfy FK
    const { error: goalsError } = await admin.from('goals').delete().eq('playerId', id)
    if (goalsError) {
      return NextResponse.json({ message: goalsError.message, details: goalsError.details }, { status: 400 })
    }
    // Now delete the player
    const { error } = await admin.from('players').delete().eq('id', id)
    if (error) {
      return NextResponse.json({ message: error.message, details: error.details }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ message: e?.message || 'Unexpected error' }, { status: 500 })
  }
}


