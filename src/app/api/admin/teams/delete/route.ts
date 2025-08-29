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
      return NextResponse.json({ message: 'Missing team id' }, { status: 400 })
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

    const admin = createAdminClient()
    // Clean up dependent records to satisfy FKs
    // 1) Unassign players from the team
    const { error: unassignError } = await admin
      .from('players')
      .update({ teamId: null })
      .eq('teamId', id)
    if (unassignError) {
      return NextResponse.json({ message: unassignError.message, details: unassignError.details }, { status: 400 })
    }
    // 2) Delete matches involving this team (and cascading goals will be removed via FK on goals.match_id)
    const { error: deleteMatchesError1 } = await admin
      .from('matches')
      .delete()
      .or(`homeTeamId.eq.${id},awayTeamId.eq.${id}`)
    if (deleteMatchesError1) {
      return NextResponse.json({ message: deleteMatchesError1.message, details: deleteMatchesError1.details }, { status: 400 })
    }
    // 3) Finally delete the team
    const { error } = await admin.from('teams').delete().eq('id', id)
    if (error) {
      return NextResponse.json({ message: error.message, details: error.details }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ message: e?.message || 'Unexpected error' }, { status: 500 })
  }
}


