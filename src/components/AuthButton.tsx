"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function AuthButton() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    let mounted = true

    const getSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (!mounted) return
      setUser(data.session?.user ?? null)
    }

    getSession()

    const { data: subscription } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setUser(session?.user ?? null)
    })

    return () => {
      mounted = false
      subscription?.subscription?.unsubscribe?.()
    }
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.push('/')
  }

  if (user) {
    return (
      <button onClick={handleLogout} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
        Logout
      </button>
    )
  }

  return (
    <Link href="/auth" className="px-4 py-2 text-green-600 font-medium rounded-lg border border-green-100 hover:bg-green-50 hover:text-green-800 transition-colors duration-200">
      Login / Sign Up
    </Link>
  )
}
