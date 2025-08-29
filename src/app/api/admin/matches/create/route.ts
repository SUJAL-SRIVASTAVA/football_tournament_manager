import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { homeTeamId, awayTeamId, startsAt, venue, status, homeScore, awayScore } = body || {}

    if (!homeTeamId || !awayTeamId || !startsAt || !venue) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
    }
    if (homeTeamId === awayTeamId) {
      return NextResponse.json({ message: 'Home and away team must be different' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { error } = await supabase
      .from('matches')
      .insert({
        homeTeamId,
        awayTeamId,
        startsAt,
        venue,
        status: status ?? 'UPCOMING',
        homeScore: homeScore ?? 0,
        awayScore: awayScore ?? 0
      })

    if (error) {
      return NextResponse.json({ message: error.message, details: error.details, code: error.code }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ message: e?.message || 'Unexpected error' }, { status: 500 })
  }
}







