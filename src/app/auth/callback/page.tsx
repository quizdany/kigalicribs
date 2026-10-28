'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { safeNext } from '@/lib/auth'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { error } = await supabase.auth.getSession()
        if (error) throw error
        
        // Successful authentication, return to where sign-in started
        router.replace(safeNext(new URLSearchParams(window.location.search).get('next')))
      } catch (error) {
        console.error('Error during auth callback:', error)
        router.push('/auth?error=Authentication%20failed')
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="tk-page min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <h2 className="tk-section-title text-2xl font-semibold mb-4">Completing sign in...</h2>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mx-auto"></div>
      </div>
    </div>
  )
}