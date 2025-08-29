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
  } catch (e: any) {
    return NextResponse.json({ message: e?.message || 'Unexpected error' }, { status: 500 })
  }
}







