'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import AuthButton from '@/components/AuthButton'
import { supabase } from '@/lib/supabase'

const links = [
  { href: '/properties', label: 'Find a home' },
  { href: '/properties/new', label: 'List a property' },
  { href: '/assistant', label: 'Assistant' },
  { href: '/help', label: 'Help' },
]
const memberLinks = [
  { href: '/requests', label: 'My requests' },
  { href: '/owners/properties', label: 'My properties' },
]
const adminLinks = [
  { href: '/admin/verifications', label: 'Verify properties' },
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

// Two lines that rotate into an X, so the toggle animates instead of swapping icons.
function MenuGlyph({ open }: { open: boolean }) {
  const line = 'absolute left-0 h-0.5 w-5 rounded-full bg-current transition-transform duration-500'
  return (
    <span className="relative block h-4 w-5" aria-hidden="true">
      <span className={`${line} top-1 ${open ? 'translate-y-1 rotate-45' : ''}`} />
      <span className={`${line} top-3 ${open ? '-translate-y-1 -rotate-45' : ''}`} />
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
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const visible = [...links, ...(signedIn ? memberLinks : []), ...(isAdmin ? adminLinks : [])]
  const isActive = (href: string) => pathname === href || (href !== '/properties' && !!pathname?.startsWith(href + '/'))
  const linkClass = (href: string) =>
    `rounded-full px-3 py-2 text-sm font-semibold transition-colors duration-300 ${isActive(href) ? 'bg-emerald-800 text-white' : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-800'}`
  // Cap the whole entrance sequence at 400ms however long the menu gets.
  const step = Math.min(60, 400 / Math.max(visible.length, 1))

  return (
    <>
      <header className="sticky top-0 z-40 px-4 pt-3 print:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-2xl border border-white/60 bg-white/80 py-2 pl-4 pr-2 shadow-[0_8px_24px_rgb(18_46_40/8%)] backdrop-blur-xl">
          <Link href="/" className="flex shrink-0 items-center text-gray-900" aria-label="TuraKGL home">
            <img src="/images/turakgl-home-finder.svg" alt="" className="h-8 w-8" />
            <Wordmark className="ml-2 text-xl" />
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
              className="grid h-11 w-11 place-items-center rounded-xl text-gray-900 transition-colors duration-300 hover:bg-gray-100 lg:hidden"
              onClick={() => setOpen(!open)}
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              aria-controls="mobile-menu"
            >
              <MenuGlyph open={open} />
            </button>
          </div>
        </div>
      </header>

      {open && (
        <nav
          id="mobile-menu"
          aria-label="Main"
          className="fixed inset-0 z-30 flex flex-col bg-gray-50/95 px-6 pb-8 pt-24 backdrop-blur-2xl lg:hidden"
        >
          <div className="grid gap-2">
            {visible.map((l, i) => (
              <Link
                key={l.href}
                href={l.href}
                style={{ animationDelay: `${i * step}ms` }}
                aria-current={isActive(l.href) ? 'page' : undefined}
                className={`tk-menu-link rounded-xl px-4 py-3 text-2xl font-semibold tracking-tight ${isActive(l.href) ? 'bg-emerald-800 text-white' : 'text-gray-900 hover:bg-white'}`}
              >
                {l.label}
              </Link>
            ))}
          </div>
          <div className="tk-menu-link mt-auto" style={{ animationDelay: `${visible.length * step}ms` }}>
            <AuthButton />
          </div>
        </nav>
      )}
    </>
  )
}
