'use client'

import { Fragment, useEffect, useRef } from 'react'

// Large tagline whose words light up one at a time as they cross a line
// 40% up from the bottom of the viewport. One observer per word, no scroll listener.
export default function TaglineReveal({ lines }: { lines: string[] }) {
  const ref = useRef<HTMLParagraphElement | null>(null)

  useEffect(() => {
    const words = ref.current?.querySelectorAll<HTMLElement>('.tk-tagline-word')
    if (!words?.length) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-lit')
            observer.unobserve(entry.target)
          }
        }
      },
      { rootMargin: '0px 0px -40% 0px' },
    )
    words.forEach((w) => observer.observe(w))
    return () => observer.disconnect()
  }, [])

  return (
    <section aria-label="Why TuraKGL" className="bg-white px-4 py-24 sm:px-6 lg:px-8">
      <p ref={ref} className="mx-auto max-w-[680px] text-4xl font-semibold tracking-tight">
        {lines.map((line, i) => (
          <Fragment key={i}>
            {line.split(' ').map((word, j) => (
              <span key={j} className="tk-tagline-word">{word} </span>
            ))}
            {i < lines.length - 1 && <br className="hidden sm:block" />}
          </Fragment>
        ))}
      </p>
    </section>
  )
}
