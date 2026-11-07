import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useCard } from '../context/CardContext'

export default function TheatreCurtain({ onOpen, onSwoosh }) {
  const { card, toggleCurtain } = useCard()
  const isOpened = card.curtainOpened

  // Countdown state
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, passed: false })
  const [cordPulled, setCordPulled] = useState(false)

  // Compute countdown to targetDate
  useEffect(() => {
    function calculateTime() {
      const target = new Date(card.targetDate || '2026-11-08T18:00:00').getTime()
      const now = Date.now()
      const diff = target - now

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, passed: true })
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
        const minutes = Math.floor((diff / (1000 * 60)) % 60)
        const seconds = Math.floor((diff / 1000) % 60)
        setTimeLeft({ days, hours, minutes, seconds, passed: false })
      }
    }

    calculateTime()
    const timer = setInterval(calculateTime, 1000)
    return () => clearInterval(timer)
  }, [card.targetDate])

  const handleOpenCurtain = useCallback(() => {
    if (isOpened) return
    setCordPulled(true)
    onSwoosh?.()
    setTimeout(() => {
      toggleCurtain(true)
      onOpen?.()
    }, 450)
  }, [isOpened, onSwoosh, toggleCurtain, onOpen])

  const handleReplayCurtains = useCallback((e) => {
    e.stopPropagation()
    toggleCurtain(false)
    setCordPulled(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [toggleCurtain])

  const pad = (n) => String(n).padStart(2, '0')

  return (
    <div
      data-testid="theatre-curtain-container"
      className={`fixed inset-0 pointer-events-none transition-all duration-1000 ${
        isOpened ? 'z-30' : 'z-50'
      }`}
    >
      {/* ── Left Velvet Curtain ── */}
      <div
        data-testid="left-curtain"
        className={`absolute top-0 bottom-0 left-0 w-1/2 pointer-events-auto transition-transform duration-1000 ease-out origin-left ${
          isOpened ? '-translate-x-[92%] scale-x-[0.2]' : 'translate-x-0 scale-x-100'
        }`}
        style={{
          background: `
            repeating-linear-gradient(
              90deg,
              #4a0007 0px,
              #800010 18px,
              #b3001b 36px,
              #e61932 54px,
              #990014 72px,
              #4a0007 90px
            )
          `,
          boxShadow: isOpened
            ? '15px 0 35px rgba(0,0,0,0.85), inset -10px 0 25px rgba(0,0,0,0.7)'
            : '10px 0 40px rgba(0,0,0,0.85), inset -15px 0 30px rgba(0,0,0,0.7)',
        }}
      >
        {/* Velvet Sheen & Gold Trim */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/60 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-3 bg-gradient-to-b from-[#ffd700] via-[#b8860b] to-[#ffd700] opacity-80" />
        {/* Bottom Gold Fringes */}
        <div className="absolute bottom-0 left-0 right-0 h-10 flex overflow-hidden opacity-90">
          {Array.from({ length: 40 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 bg-gradient-to-b from-[#ffe066] to-[#b8860b] rounded-b-sm border-r border-amber-900/30"
              style={{ height: `${32 + (i % 3) * 4}px` }}
            />
          ))}
        </div>
      </div>

      {/* ── Right Velvet Curtain ── */}
      <div
        data-testid="right-curtain"
        className={`absolute top-0 bottom-0 right-0 w-1/2 pointer-events-auto transition-transform duration-1000 ease-out origin-right ${
          isOpened ? 'translate-x-[92%] scale-x-[0.2]' : 'translate-x-0 scale-x-100'
        }`}
        style={{
          background: `
            repeating-linear-gradient(
              90deg,
              #4a0007 0px,
              #990014 18px,
              #e61932 36px,
              #b3001b 54px,
              #800010 72px,
              #4a0007 90px
            )
          `,
          boxShadow: isOpened
            ? '-15px 0 35px rgba(0,0,0,0.85), inset 10px 0 25px rgba(0,0,0,0.7)'
            : '-10px 0 40px rgba(0,0,0,0.85), inset 15px 0 30px rgba(0,0,0,0.7)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-l from-black/40 via-transparent to-black/60 pointer-events-none" />
        <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-b from-[#ffd700] via-[#b8860b] to-[#ffd700] opacity-80" />
        <div className="absolute bottom-0 left-0 right-0 h-10 flex overflow-hidden opacity-90">
          {Array.from({ length: 40 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 bg-gradient-to-b from-[#ffe066] to-[#b8860b] rounded-b-sm border-l border-amber-900/30"
              style={{ height: `${32 + (i % 3) * 4}px` }}
            />
          ))}
        </div>
      </div>

      {/* ── Top Theatre Pelmet / Valance ── */}
      <div
        data-testid="theatre-valance"
        className="absolute top-0 left-0 right-0 z-40 pointer-events-none transition-transform duration-700"
        style={{
          height: '80px',
          background: 'linear-gradient(180deg, #3d0006 0%, #800010 70%, #59000b 100%)',
          boxShadow: '0 8px 30px rgba(0,0,0,0.8)',
          borderBottom: '3px solid #d4af37',
        }}
      >
        {/* Scalloped Swags */}
        <div className="absolute -bottom-4 left-0 right-0 flex justify-around">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="w-20 md:w-32 h-6 md:h-8 rounded-b-full bg-gradient-to-b from-[#800010] to-[#ffd700]/70 border-b-2 border-[#ffd700]"
              style={{ boxShadow: '0 4px 10px rgba(0,0,0,0.5)' }}
            />
          ))}
        </div>
        {/* Center Royal Crest Diya */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-[-18px] w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 via-amber-600 to-amber-900 flex items-center justify-center border-2 border-[#ffd700] shadow-lg">
          <span className="text-xl">🪔</span>
        </div>
      </div>

      {/* ── Interactive Gold Pull Cord (Right Side) ── */}
      {!isOpened && (
        <div
          data-testid="pull-cord"
          onClick={handleOpenCurtain}
          className={`absolute right-4 md:right-12 top-20 z-40 cursor-pointer pointer-events-auto flex flex-col items-center group transition-transform duration-300 ${
            cordPulled ? 'translate-y-12' : 'translate-y-0'
          }`}
          title="Pull cord to open curtains"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') handleOpenCurtain()
          }}
          aria-label="Pull cord to unveil curtains"
        >
          {/* Braided Gold Rope */}
          <div className="w-1.5 h-36 md:h-48 bg-gradient-to-b from-[#ffd700] via-[#b8860b] to-[#d4af37] shadow-md group-hover:scale-y-105 transition-transform" />
          {/* Tassel Grip */}
          <div className="w-7 h-10 rounded-full bg-gradient-to-br from-amber-300 to-amber-700 border border-amber-200 shadow-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <span className="text-xs">✨</span>
          </div>
          {/* Tassel Strands */}
          <div className="w-5 h-8 bg-gradient-to-b from-amber-400 to-amber-800 rounded-b-lg shadow" />
          <span className="mt-2 text-[10px] uppercase font-bold tracking-widest text-amber-300 bg-black/60 px-2 py-0.5 rounded-full border border-amber-500/40 backdrop-blur-sm shadow group-hover:text-white">
            Pull Cord
          </span>
        </div>
      )}

      {/* ── Replay Curtains Button (When opened) ── */}
      {isOpened && (
        <button
          onClick={handleReplayCurtains}
          className="absolute top-24 right-4 md:right-8 z-40 pointer-events-auto bg-black/70 hover:bg-black/90 text-amber-300 text-xs font-medium px-3.5 py-1.5 rounded-full border border-amber-400/40 shadow-xl backdrop-blur-md transition-all flex items-center gap-1.5 active:scale-95"
          title="Close curtains to see the countdown again"
          aria-label="Close theatre curtains"
        >
          <span>🎪</span>
          <span>Close Curtains</span>
        </button>
      )}

      {/* ── Countdown & Opening Stage Overlay (Visible only before curtains open) ── */}
      {!isOpened && (
        <div
          data-testid="curtain-stage-content"
          className="absolute inset-0 z-30 pointer-events-auto flex flex-col items-center justify-center text-center px-4 overflow-y-auto"
        >
          {/* Glowing Aura */}
          <div className="absolute w-[90vw] max-w-2xl h-[400px] rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />

          {/* Golden Theatrical Plaque */}
          <div className="relative max-w-xl w-full p-6 md:p-8 rounded-3xl bg-gradient-to-b from-black/85 via-[#1a0005]/90 to-black/90 border-2 border-amber-400/50 shadow-[0_0_50px_rgba(255,149,0,0.35)] backdrop-blur-md space-y-6">
            {/* Header Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-400/40 text-amber-300 text-xs uppercase tracking-widest font-semibold">
              <span className="text-sm">🪔</span>
              <span>Auspicious Deepavali Unveiling</span>
              <span className="text-sm">🪔</span>
            </div>

            {/* Recipient Dedication */}
            <div className="space-y-2">
              <p className="text-xs md:text-sm font-medium uppercase tracking-[0.25em] text-amber-200/80">
                Counting down to
              </p>
              <h1
                className="text-3xl md:text-5xl font-display font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#ffe066] via-[#ff9500] to-[#ffd700] drop-shadow-md"
                data-testid="countdown-title"
              >
                {card.recipientName}&apos;s Diwali
              </h1>
              <p className="text-xs md:text-sm text-amber-100/70 italic font-display">
                {card.tagline || 'May your life be as radiant as a thousand diyas'}
              </p>
            </div>

            {/* ── Countdown Clocks ── */}
            <div
              data-testid="countdown-timer"
              className="grid grid-cols-4 gap-2 md:gap-4 max-w-md mx-auto pt-2"
            >
              {[
                { label: 'Days', val: pad(timeLeft.days) },
                { label: 'Hours', val: pad(timeLeft.hours) },
                { label: 'Mins', val: pad(timeLeft.minutes) },
                { label: 'Secs', val: pad(timeLeft.seconds) },
              ].map(({ label, val }) => (
                <div
                  key={label}
                  className="flex flex-col items-center justify-center p-2.5 md:p-3.5 rounded-2xl bg-gradient-to-b from-[#2e0007] to-[#120002] border border-amber-400/30 shadow-inner"
                >
                  <span className="text-2xl md:text-4xl font-bold font-mono tracking-tight text-[#ffda66] drop-shadow">
                    {val}
                  </span>
                  <span className="text-[10px] md:text-xs uppercase font-medium tracking-wider text-amber-300/60 mt-1">
                    {label}
                  </span>
                </div>
              ))}
            </div>

            {/* Status if passed */}
            {timeLeft.passed && (
              <p className="text-sm font-semibold text-amber-400 animate-pulse">
                🌟 The auspicious moment has arrived! Shubh Deepavali! 🌟
              </p>
            )}

            {/* Unveil Action Button */}
            <div className="pt-2">
              <button
                onClick={handleOpenCurtain}
                data-testid="open-curtain-btn"
                className="btn-primary w-full max-w-sm py-3.5 px-6 rounded-2xl font-bold text-base md:text-lg tracking-wide uppercase bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-stone-950 shadow-[0_0_30px_rgba(255,149,0,0.6)] border border-amber-200 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 mx-auto"
              >
                <span>🪔</span>
                <span>Unveil Diwali Magic</span>
                <span>✨</span>
              </button>
              <p className="text-[11px] text-amber-200/50 mt-2 tracking-wider">
                Tap button or pull the golden rope on the right to open curtains
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

