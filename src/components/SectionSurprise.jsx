import React, { useRef, useState } from 'react'
import RealisticDiya from './RealisticDiya'
import Rangoli from './Rangoli'
import { DIWALI_CONFIG } from '../config/diwaliConfig'

export default function SectionSurprise({ onOpenSurprise, config = DIWALI_CONFIG }) {
  const herName = config.herName || 'Helly'
  const stageRef = useRef(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })

  // Gentle parallax: the rangoli + diya lean toward the pointer
  function handleMove(e) {
    const el = stageRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    setTilt({
      x: ((e.clientX - r.left) / r.width - 0.5) * 2,
      y: ((e.clientY - r.top) / r.height - 0.5) * 2,
    })
  }

  return (
    <section
      id="chapter-surprise"
      data-testid="section-surprise"
      ref={stageRef}
      onPointerMove={handleMove}
      onPointerLeave={() => setTilt({ x: 0, y: 0 })}
      className="relative min-h-[100svh] w-full flex flex-col items-center justify-center px-5 pt-28 pb-16 overflow-hidden select-none"
    >
      {/* Rangoli halo behind the diya */}
      <div
        className="absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-700 ease-out"
        style={{ transform: `translate(calc(-50% + ${tilt.x * -14}px), calc(-50% + ${tilt.y * -14}px))` }}
      >
        <Rangoli size={620} className="w-[118vw] max-w-[620px] h-auto opacity-[0.28]" />
      </div>

      {/* Eyebrow */}
      <p className="eyebrow relative z-10 mb-12"style={{ animation: 'fadeIn 1.4s ease both' }}>
        A Diwali dedication · 2026
      </p>

      {/* Diya */}
      <div
        className="relative z-10 mb-6 transition-transform duration-700 ease-out"
        style={{
          transform: `translate(${tilt.x * 10}px, ${tilt.y * 6}px)`,
          animation: 'floatY 6s ease-in-out infinite',
        }}
      >
        <RealisticDiya size={200} isLitUp brightness={1.2} />
      </div>

      {/* Headline */}
      <h1
        data-testid="surprise-headline"
        className="relative z-10 text-center font-heading font-normal tracking-tight leading-[1.05] text-[#FFF4DE] text-[2.6rem] sm:text-6xl md:text-7xl lg:text-[5.6rem] max-w-5xl"
        style={{ animation: 'sheetIn 1.2s cubic-bezier(.2,.7,.2,1) .2s both' }}
      >
        This Diwali, my favourite{' '}
        <span className="italic text-gold-shimmer">light is you.</span>
      </h1>

      {/* Subtext */}
      <p
        data-testid="surprise-subtext"
        className="relative z-10 mt-6 text-center font-body text-base sm:text-lg text-[#FFF4DE]/70 max-w-md leading-relaxed"
        style={{ animation: 'fadeIn 1.4s ease .6s both' }}
      >
        I made something special, just for you,{' '}
        <span className="font-hand text-2xl text-[#FBE3A8]">{herName}</span>.
      </p>

      {/* CTA */}
      <div className="relative z-10 mt-10 flex flex-col items-center" style={{ animation: 'fadeIn 1.4s ease 1s both' }}>
        <button
          onClick={onOpenSurprise}
          data-testid="open-surprise-btn"
          className="btn-gold group px-9 py-4 text-base"
        >
          <span
            aria-hidden="true"
            className="absolute -inset-1 rounded-full animate-ping border border-[#FBE3A8]/70"
            style={{ animationDuration: '2.6s' }}
          />
          <span className="relative">{config.surpriseButton?.replace(' →', '') || 'Open Your Surprise'}</span>
          <span className="relative transition-transform duration-300 group-hover:translate-x-1">→</span>
        </button>
      </div>

      {/* Scroll cue */}
      <div aria-hidden="true" className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#FBE3A8]/50">
        <span className="font-body text-[10px] tracking-[0.35em] uppercase">Scroll</span>
        <span className="relative w-[22px] h-[34px] rounded-full border border-[#FBE3A8]/40">
          <span
            className="absolute left-1/2 top-1.5 -translate-x-1/2 w-1 h-2 rounded-full bg-[#F4C56A]"
            style={{ animation: 'scrollCue 1.8s ease-in-out infinite' }}
          />
        </span>
      </div>
    </section>
  )
}
