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
  } catch (e: any) {
    return NextResponse.json({ message: e?.message || 'Unexpected error' }, { status: 500 })
  }
}







