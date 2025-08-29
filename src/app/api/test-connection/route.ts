import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Check if environment variables are set
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!url || !serviceKey) {
      return NextResponse.json(
        { 
          error: 'Missing environment variables', 
          details: `URL: ${url ? 'Set' : 'Missing'}, Service Key: ${serviceKey ? 'Set' : 'Missing'}` 
        },
        { status: 500 }
      )
    }

    // Validate URL format
    try {
      new URL(url)
    } catch {
      return NextResponse.json(
        { error: 'Invalid Supabase URL format', details: url },
        { status: 500 }
      )
    }

    const supabase = createAdminClient()

    // Test connection by fetching from profiles table
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, fullName, university, role')
      .limit(1)

    if (error) {
      return NextResponse.json(
        { error: 'Database connection failed', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      status: 'success',
      message: 'Supabase connection working',
      dataPreview: data,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Connection test failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}