import React, { useRef, useState, useEffect } from 'react'
import { DIWALI_CONFIG } from '../config/diwaliConfig'
import { scrollProgressOf, useReveal } from '../hooks/useReveal'

const PILLAR_ICONS = {
  smile: '☺',
  presence: '✧',
  happiness: '❀',
  memories: '❦',
}

function FlipCard({ pillar, index, flipped, onFlip }) {
  return (
    <button
      type="button"
      onClick={onFlip}
      aria-pressed={flipped}
      aria-label={`Romantic message: ${pillar.title}`}
      className="reveal perspective group block w-full h-[260px] text-left"
      style={{ transitionDelay: `${index * 90}ms` }}
    >
      <span
        className={`relative block w-full h-full preserve-3d transition-transform duration-700 ease-[cubic-bezier(.2,.7,.2,1)] ${
          flipped ? 'rotate-y-180' : 'group-hover:[transform:rotateY(8deg)]'
        }`}
      >
        {/* Front */}
        <span className="absolute inset-0 backface-hidden glass rounded-[28px] p-6 flex flex-col justify-between overflow-hidden">
          <span
            className="absolute -top-16 -right-16 w-44 h-44 rounded-full opacity-60 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
            style={{ background: 'radial-gradient(circle, rgba(255,159,46,0.45), transparent 70%)' }}
          />
          <span className="flex items-center justify-between">
            <span className="font-heading text-4xl text-[#F4C56A]">{PILLAR_ICONS[pillar.id] || '✦'}</span>
            <span className="font-body text-[10px] tracking-[0.3em] uppercase text-[#FBE3A8]/50">
              0{index + 1}
            </span>
          </span>
          <span>
            <span className="block font-heading text-2xl text-[#FFF4DE] mb-1">{pillar.title}</span>
            <span className="block font-body text-sm text-[#FFF4DE]/60">{pillar.preview}</span>
            <span className="mt-4 inline-flex items-center gap-1.5 font-body text-[11px] tracking-[0.2em] uppercase text-[#F4C56A]">
              Tap to turn <span aria-hidden="true">↻</span>
            </span>
          </span>
        </span>

        {/* Back */}
        <span
          className="absolute inset-0 backface-hidden rotate-y-180 rounded-[28px] p-6 flex flex-col justify-center"
          style={{
            background: 'linear-gradient(155deg, #FFF6E2 0%, #FBE3A8 55%, #F4C56A 100%)',
            boxShadow: '0 20px 60px -15px rgba(255,159,46,0.6)',
          }}
        >
          <span className="font-hand text-[22px] leading-snug text-[#3A1F14]">
            {pillar.romanticMessage}
          </span>
          <span className="mt-4 font-body text-[10px] tracking-[0.3em] uppercase text-[#7A3E1C]/70">
            — {pillar.title}
          </span>
        </span>
      </span>
    </button>
  )
}

export default function SectionHeartMessage({ config = DIWALI_CONFIG }) {
  const textRef = useRef(null)
  const revealRef = useReveal()
  const [p, setP] = useState(0)
  const [flipped, setFlipped] = useState({})

  const words = config.heartMessageWords || []
  const pillars = config.interactivePillars || []

  useEffect(() => {
    function onScroll() {
      setP(scrollProgressOf(textRef.current, 'through'))
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Words ignite between 15% and 55% of the paragraph's journey through the viewport
  const lit = Math.ceil(Math.max(0, Math.min(1, (p - 0.15) / 0.4)) * words.length)

  return (
    <section
      id="chapter-heart"
      ref={revealRef}
      data-testid="section-heart-message"
      className="relative w-full px-5 py-28 md:py-40"
    >
      <div className="max-w-5xl mx-auto">
        <div className="reveal text-center mb-14 md:mb-20">
          <p className="eyebrow mb-5">Chapter 03 · Words I keep for you</p>
          <h2 className="font-heading text-4xl sm:text-5xl md:text-6xl text-[#FFF4DE] tracking-tight">
            {config.heartHeading || 'A little something from my heart...'}
          </h2>
        </div>

        {/* Letter: words ignite one by one */}
        <div ref={textRef} className="relative max-w-4xl mx-auto">
          <span
            aria-hidden="true"
            className="absolute -left-2 -top-10 md:-left-10 font-heading text-[9rem] leading-none text-[#F4C56A]/15 select-none"
          >
            &ldquo;
          </span>
          <p className="relative font-heading text-[1.6rem] sm:text-3xl md:text-[2.6rem] leading-[1.5] md:leading-[1.45]">
            {words.map((word, idx) => {
              const on = idx < lit
              return (
                <span
                  key={idx}
                  className="inline-block mr-[0.28em] transition-all duration-500"
                  style={{
                    color: on ? '#FFF4DE' : 'rgba(255,244,222,0.14)',
                    textShadow: on ? '0 0 22px rgba(255,159,46,0.45)' : 'none',
                    transform: on ? 'none' : 'translateY(6px)',
                  }}
                >
                  {word}
                </span>
              )
            })}
          </p>
          <p
            className="mt-8 text-right font-hand text-3xl text-[#FBE3A8] transition-opacity duration-700"
            style={{ opacity: lit >= words.length ? 1 : 0 }}
          >
            — {config.yourName}
          </p>
        </div>

        {/* Flip cards */}
        <div className="mt-24 md:mt-32">
          <p className="reveal text-center font-body text-xs uppercase tracking-[0.3em] text-[#FBE3A8]/60 mb-8">
            Four little things · turn each card
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {pillars.map((pillar, i) => (
              <FlipCard
                key={pillar.id}
                pillar={pillar}
                index={i}
                flipped={!!flipped[pillar.id]}
                onFlip={() => setFlipped((f) => ({ ...f, [pillar.id]: !f[pillar.id] }))}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
