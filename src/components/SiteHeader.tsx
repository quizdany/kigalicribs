'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import AuthButton from '@/components/AuthButton'
import { supabase } from '@/lib/supabase'

const links = [
  { href: '/properties', label: 'Find a Property' },
  { href: '/properties/new', label: 'List a Property' },
  { href: '/assistant', label: 'Assistant' },
  { href: '/help', label: 'Help' },
]
const memberLinks = [
  { href: '/requests', label: 'My Requests' },
  { href: '/owners/properties', label: 'My Properties' },
]
const adminLinks = [
  { href: '/admin/verifications', label: 'Verify Properties' },
  { href: '/admin/agents', label: 'Operations' },
]

export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`tracking-tighter ${className}`}>
      <span className="font-bold">T</span>
      <span className="opacity-70">ura</span>
      <span className="font-bold">KGL</span>
    </span>
  )
}

export default function SiteHeader() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [signedIn, setSignedIn] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    let mounted = true
    const check = async (userId?: string) => {
      setSignedIn(!!userId)
      if (!userId) return setIsAdmin(false)
      const { data } = await supabase.from('users').select('role').eq('id', userId).maybeSingle()
      if (mounted) setIsAdmin((data as { role?: string } | null)?.role === 'admin')
    }
    supabase.auth.getSession().then(({ data }) => { if (mounted) check(data.session?.user.id) })
    const { data: subscription } = supabase.auth.onAuthStateChange((_event: any, session: any) => check(session?.user?.id))
    return () => {
      mounted = false
      subscription?.subscription?.unsubscribe?.()
    }
  }, [])

  useEffect(() => setOpen(false), [pathname])

  const visible = [...links, ...(signedIn ? memberLinks : []), ...(isAdmin ? adminLinks : [])]
  const isActive = (href: string) => pathname === href || (href !== '/properties' && pathname?.startsWith(href + '/'))
  const linkClass = (href: string) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive(href) ? 'bg-emerald-50 text-emerald-800' : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-800'}`

  return (
    <header className="site-header sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur print:hidden">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center text-gray-900" aria-label="TuraKGL home">
          <img src="/images/turakgl-home-finder.svg" alt="" className="h-10 w-10" />
          <Wordmark className="ml-2 text-2xl" />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {visible.map((l) => (
            <Link key={l.href} href={l.href} className={linkClass(l.href)} aria-current={isActive(l.href) ? 'page' : undefined}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <AuthButton />
          </div>
          <button
            className="rounded-lg p-2 text-gray-700 hover:bg-gray-100 lg:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Toggle navigation"
            aria-expanded={open}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <nav aria-label="Main" className="border-t bg-white lg:hidden">
          <div className="mx-auto grid max-w-7xl gap-1 p-3">
            {visible.map((l) => (
              <Link key={l.href} href={l.href} className={linkClass(l.href)}>
                {l.label}
              </Link>
            ))}
            <div className="px-3 pt-2 sm:hidden">
              <AuthButton />
            </div>
          </div>
        </nav>
      )}
    </header>
  )
}
