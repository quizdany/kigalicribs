"use client"

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function AuthButton() {
  const router = useRouter()
  const pathname = usePathname()
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
      <button onClick={handleLogout} className="rounded-xl px-3 py-2 text-sm font-semibold text-gray-700 transition-colors duration-300 hover:bg-gray-100">
        Sign out
      </button>
    )
  }

  return (
    <Link href={pathname && pathname !== '/' && !pathname.startsWith('/auth') ? `/auth?next=${encodeURIComponent(pathname)}` : '/auth'} className="inline-block rounded-xl bg-emerald-800 px-3 py-2 text-sm font-semibold text-white transition-colors duration-300 hover:bg-emerald-900">
      Sign in
    </Link>
  )
}
