import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    const { updates } = await request.json()
    if (!Array.isArray(updates)) {
      return NextResponse.json({ message: 'Invalid payload' }, { status: 400 })
    }

    const supabase = createAdminClient()

    for (const update of updates) {
      if (!update?.id) continue
      const { error } = await supabase
        .from('players')
        .update({ teamId: update.teamId ?? null })
        .eq('id', update.id)
      if (error) {
        return NextResponse.json(
          { message: error.message, details: error.details, code: error.code },
          { status: 400 }
        )
      }
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ message: e?.message || 'Unexpected error' }, { status: 500 })
  }
}







