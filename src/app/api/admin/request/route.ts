import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    const { updates } = await request.json()
    if (!Array.isArray(updates)) {
      return NextResponse.json({ message: 'Invalid payload' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Perform updates sequentially to surface first error clearly
    for (const u of updates) {
      if (!u?.id) continue
      const { error } = await supabase
        .from('players')
        .update({ teamId: u.teamId ?? null })
        .eq('id', u.id)
      if (error) {
        return NextResponse.json({ message: error.message, details: error.details, code: error.code }, { status: 400 })
      }
    }

    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unexpected error'
    return NextResponse.json({ message }, { status: 500 })
  }
}







