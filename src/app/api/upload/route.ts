import { NextResponse } from 'next/server'
import { supabase as supabaseClient } from '@/lib/supabase'

const supabase: any = supabaseClient

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const urls: string[] = []
    const userId = formData.get('userId') as string

    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId is required' }, { status: 400 })
    }

    // Get all files from form data
    const entries = Array.from(formData.entries())
    
    for (const [key, value] of entries) {
      if (value instanceof File) {
        const file = value
        const fileExt = file.name.split('.').pop()
        const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from('property-images')
          .upload(fileName, file, {
            contentType: file.type,
            upsert: false
          })

        if (error) {
          console.error('Upload error:', error)
          throw new Error(`Failed to upload ${file.name}: ${error.message}`)
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('property-images')
          .getPublicUrl(fileName)

        urls.push(publicUrl)
      }
    }

    return NextResponse.json({ success: true, urls })
  } catch (err) {
    return NextResponse.json({ 
      success: false, 
      error: err instanceof Error ? err.message : 'Unknown error' 
    }, { status: 500 })
  }
}
