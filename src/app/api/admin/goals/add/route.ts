import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    const { matchId, playerId, minute } = await request.json()
    if (!matchId || !playerId) {
      return NextResponse.json({ message: 'Missing matchId or playerId' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { error } = await supabase
      .from('goals')
      .insert({ matchId, playerId, minute: minute ?? 0 })

    if (error) {
      return NextResponse.json({ message: error.message, code: error.code, details: error.details }, { status: 400 })
    }
    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unexpected error'
    return NextResponse.json({ message }, { status: 500 })
  }
}







