import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  // Create a new Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      { 
        success: false,
        error: 'Missing Supabase credentials',
        details: 'Environment variables are not properly configured'
      },
      { status: 500 }
    )
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    // Simple query to test connection
    const { data, error } = await supabase
      .from('properties')
      .select('count')
      .limit(1)

    if (error) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Database connection failed', 
          details: error.message,
          code: error.code,
          hint: error.hint 
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully connected to Supabase',
      data: { count: data?.length || 0 }
    })

  } catch (error) {
    return NextResponse.json(
      { 
        success: false,
        error: 'Connection test failed', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}