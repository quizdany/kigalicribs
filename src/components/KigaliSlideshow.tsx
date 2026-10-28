'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'

const slides = [
  { src: '/images/kigali-centre.jpg', label: 'Kigali Convention Centre', alt: 'An aerial view of Kigali Convention Centre and its surroundings' },
  { src: '/images/kigali-skyline.jpg', label: 'Kigali’s green neighbourhoods', alt: 'Green valleys and neighbourhoods across Kigali, Rwanda' },
  { src: '/images/kigali-hills.jpg', label: 'The hills of Nyamirambo', alt: 'Residential hills viewed from Nyamirambo in Kigali' },
]

export default function KigaliSlideshow({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [reduced, setReduced] = useState(true)
  const start = useRef<number | null>(null)
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(query.matches)
    update(); query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])
  useEffect(() => {
    if (paused || hovered || focused || reduced) return
    const timer = window.setInterval(() => {
      if (!document.hidden) setActive(value => (value + 1) % slides.length)
    }, 6500)
    return () => window.clearInterval(timer)
  }, [paused, hovered, focused, reduced])
  const go = (direction: number) => { setPaused(true); setActive(value => (value + direction + slides.length) % slides.length) }
  return <section className="kigali-hero" aria-label="Discover Kigali" aria-roledescription="carousel"
    onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false) }}>
    <div className="kigali-scenes" onTouchStart={event => { start.current = event.touches[0].clientX }} onTouchEnd={event => {
      if (start.current !== null) { const delta = event.changedTouches[0].clientX - start.current; if (Math.abs(delta) > 45) go(delta > 0 ? -1 : 1) }
      start.current = null
    }}>
      {slides.map((slide, index) => <img key={slide.src} src={slide.src} alt={slide.alt} aria-hidden={active !== index} className={`kigali-scene ${active === index ? 'is-active' : ''}`} fetchPriority={index === 0 ? 'high' : 'auto'} />)}
    </div>
    <div className="kigali-shade" />
    <div className="kigali-content">{children}</div>
    <div className="kigali-controls">
      <div className="kigali-buttons">
        <button type="button" onClick={() => go(-1)} aria-label="Previous Kigali photo"><ChevronLeft size={20} /></button>
        {slides.map((slide, index) => <button type="button" key={slide.src} aria-label={`Show ${slide.label}`} aria-pressed={active === index} className="slide-selector" onClick={() => { setActive(index); setPaused(true) }}><span /></button>)}
        <button type="button" onClick={() => go(1)} aria-label="Next Kigali photo"><ChevronRight size={20} /></button>
        {!reduced && <button type="button" onClick={() => setPaused(value => !value)} aria-label={paused ? 'Play slideshow' : 'Pause slideshow'}>{paused ? <Play size={16} /> : <Pause size={16} />}</button>}
      </div>
    </div>
  </section>
}
