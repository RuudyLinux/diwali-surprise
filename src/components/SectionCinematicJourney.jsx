import React, { useRef, useState, useEffect } from 'react'
import RealisticDiya from './RealisticDiya'
import { DIWALI_CONFIG } from '../config/diwaliConfig'


const RING = 12

function MiniLamp({ lit }) {
  return (
    <span className="relative flex flex-col items-center">
      {/* flame */}
      <span
        className="block w-[9px] h-[16px] mb-[-3px] transition-all duration-700"
        style={{
          borderRadius: '50% 50% 35% 35% / 70% 70% 30% 30%',
          background: 'linear-gradient(180deg, #FF7A00 0%, #FFC94A 55%, #FFF6D8 100%)',
          boxShadow: '0 0 14px 5px rgba(255,159,46,0.65)',
          opacity: lit ? 1 : 0,
          transform: lit ? 'scale(1)' : 'scale(0.2)',
          animation: lit ? 'lanternFlicker 1.6s ease-in-out infinite' : 'none',
        }}
      />
      {/* clay bowl */}
      <span
        className="block w-[30px] h-[11px] rounded-b-full"
        style={{
          background: 'linear-gradient(180deg, #B4561C 0%, #6E2808 100%)',
          boxShadow: lit ? '0 -2px 10px rgba(255,159,46,0.5)' : 'none',
        }}
      />
    </span>
  )
}

export default function SectionCinematicJourney({ config = DIWALI_CONFIG }) {
  const containerRef = useRef(null)
  const [p, setP] = useState(0)

  useEffect(() => {
    // Progress only while the scene is pinned (sticky): 0 at pin, 1 at release
    function onScroll() {
      const el = containerRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const range = rect.height - window.innerHeight
      setP(range > 0 ? Math.max(0, Math.min(1, -rect.top / range)) : 1)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    onScroll()
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  // Map progress to scene beats
  const ringP = Math.max(0, Math.min(1, (p - 0.1) / 0.52)) // 0.10 → 0.62 lights the ring
  const litCount = Math.round(ringP * RING)
  const camera = 0.82 + Math.min(1, p / 0.75) * 0.2
  const line1 = Math.max(0, Math.min(1, (p + 0.02) / 0.12)) * (1 - Math.max(0, Math.min(1, (p - 0.4) / 0.12)))
  const line2 = Math.max(0, Math.min(1, (p - 0.6) / 0.15))
  const glow = 0.25 + ringP * 0.75

  return (
    <section
      id="chapter-journey"
      ref={containerRef}
      data-testid="section-cinematic-journey"
      className="relative w-full h-[260vh]"
    >
      <div className="sticky top-0 h-[100svh] w-full flex flex-col items-center justify-center overflow-hidden px-5">
        {/* warm bloom that grows as lamps light */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vmin] h-[90vmin] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(255,159,46,0.35) 0%, rgba(242,139,166,0.12) 40%, transparent 70%)',
            opacity: glow,
            filter: 'blur(30px)',
          }}
        />

        <p className="eyebrow absolute top-24 md:top-28">Chapter 02 · The walk into light</p>

        {/* Ring of lamps around the central diya */}
        <div
          className="relative -mt-[8vh] w-[62vmin] h-[62vmin] max-w-[460px] max-h-[460px] transition-transform duration-300 ease-out"
          style={{ transform: `scale(${camera})` }}
        >
          {Array.from({ length: RING }).map((_, i) => {
            const a = (i / RING) * Math.PI * 2 - Math.PI / 2
            return (
              <span
                key={i}
                className="absolute"
                style={{
                  left: `${50 + Math.cos(a) * 46}%`,
                  top: `${50 + Math.sin(a) * 46}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <MiniLamp lit={i < litCount} />
              </span>
            )
          })}

          {/* connecting thread of light */}
          <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="#F4C56A"
              strokeWidth="0.25"
              strokeDasharray={`${ringP * 289} 289`}
              transform="rotate(-90 50 50)"
              style={{ filter: 'drop-shadow(0 0 1.5px #FF9F2E)' }}
            />
          </svg>

          <div className="absolute inset-0 flex items-center justify-center">
            <RealisticDiya size={180} brightness={1 + ringP * 0.8} isLitUp={ringP > 0.5} />
          </div>
        </div>

        {/* Narrative lines */}
        <div className="absolute bottom-[10vh] inset-x-0 px-6 text-center pointer-events-none">
          <p
            className="font-heading italic text-2xl sm:text-3xl md:text-4xl text-[#FFF4DE] max-w-2xl mx-auto leading-snug transition-all duration-300"
            style={{ opacity: line1, transform: `translateY(${(1 - line1) * 18}px)` }}
          >
            &ldquo;{config.cinematicMidSentence || 'You make even the simplest moments feel magical.'}&rdquo;
          </p>
        </div>
        <div className="absolute bottom-[10vh] inset-x-0 px-6 text-center pointer-events-none">
          <p
            className="font-heading text-2xl sm:text-3xl md:text-4xl text-[#FFF4DE] max-w-2xl mx-auto leading-snug transition-all duration-300"
            style={{ opacity: line2, transform: `translateY(${(1 - line2) * 18}px)` }}
          >
            Twelve lamps, one for every month{' '}
            <span className="italic text-gold-shimmer">you made brighter.</span>
          </p>
        </div>
      </div>
    </section>
  )
}
