import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    const { id, patch } = await request.json()
    if (!id || typeof patch !== 'object') {
      return NextResponse.json({ message: 'Invalid payload' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { error } = await supabase
      .from('matches')
      .update(patch)
      .eq('id', id)

    if (error) {
      return NextResponse.json({ message: error.message, code: error.code, details: error.details }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unexpected error'
    return NextResponse.json({ message }, { status: 500 })
  }
}







