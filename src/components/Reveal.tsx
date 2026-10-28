'use client'

import { useEffect, useRef, type ReactNode } from 'react'

// Rises 32px and fades in the first time it enters the viewport; never replays.
export default function Reveal({ children, className = '', as: Tag = 'div' }: { children: ReactNode; className?: string; as?: 'div' | 'section' }) {
  const ref = useRef<HTMLElement | null>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-visible')
          observer.disconnect()
        }
      },
      { rootMargin: '0px 0px -10% 0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return (
    <Tag ref={ref as any} className={`tk-reveal ${className}`}>
      {children}
    </Tag>
  )
}
