import React, { useState, useCallback, useEffect, useRef } from 'react'
import RealisticDiya from './RealisticDiya'
import SkyCelebration from './SkyCelebration'
import PortraitUploader from './PortraitUploader'
import { DIWALI_CONFIG } from '../config/diwaliConfig'
import { useFireworks } from '../hooks/useFireworks'
import { useReveal } from '../hooks/useReveal'
import { useSkyPortrait } from '../hooks/useSkyPortrait'
import { loadImage } from '../utils/portraitDots'
import { CelebrationAudio } from '../utils/celebrationAudio'

export const IGNITION_MS = 2600
export const SKY_DELAY_S = 5

export default function SectionFinalWish({ onDiyaLit, config = DIWALI_CONFIG }) {
  // stage: idle → igniting (flame grows) → lit (existing celebration) → sky show after 5 s
  const [stage, setStage] = useState('idle')
  const isDiyaLit = stage === 'lit'
  const [petals, setPetals] = useState([])
  const [embers, setEmbers] = useState([])
  const [countdown, setCountdown] = useState(null)
  const [skyOpen, setSkyOpen] = useState(false)
  const [skyShown, setSkyShown] = useState(false)
  const [uploaderOpen, setUploaderOpen] = useState(false)
  const [volume, setVolume] = useState(0.8)
  const [muted, setMuted] = useState(false)
  const [portraitImg, setPortraitImg] = useState(null)

  const sectionRef = useRef(null)
  const canvasRef = useRef(null)
  const diyaRef = useRef(null)
  const timers = useRef([])
  const audioRef = useRef(null)
  const revealRef = useReveal()
  const { burst } = useFireworks(canvasRef)
  const portrait = useSkyPortrait()

  const final = config.finalWish || {}
  const herName = config.herName || 'Helly'
  const yourName = config.yourName || 'Your Name'

  const audio = () => {
    if (!audioRef.current) audioRef.current = new CelebrationAudio()
    return audioRef.current
  }

  // Decode her portrait ahead of time so the sky show starts instantly
  useEffect(() => {
    let alive = true
    if (!portrait.src) {
      setPortraitImg(null)
      return
    }
    loadImage(portrait.src)
      .then((img) => alive && setPortraitImg(img))
      .catch(() => alive && setPortraitImg(null))
    return () => {
      alive = false
    }
  }, [portrait.src])

  useEffect(() => {
    audioRef.current?.setVolume(volume)
  }, [volume])
  useEffect(() => {
    audioRef.current?.setMuted(muted)
  }, [muted])

  // Cleanup timers + audio on unmount
  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout)
      audioRef.current?.destroy()
    },
    []
  )

  const later = (fn, ms) => {
    const id = setTimeout(fn, ms)
    timers.current.push(id)
    return id
  }

  // Keep the fireworks canvas matched to the section size
  useEffect(() => {
    function resize() {
      const c = canvasRef.current
      const s = sectionRef.current
      if (!c || !s) return
      const dpr = window.devicePixelRatio || 1
      c.width = s.offsetWidth * dpr
      c.height = s.offsetHeight * dpr
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [isDiyaLit])

  const celebrate = useCallback(
    (count = 5) => {
      const s = sectionRef.current
      if (!s) return
      const w = s.offsetWidth
      for (let i = 0; i < count; i++) {
        setTimeout(() => {
          // aim at whatever part of the section is on screen right now
          const visibleTop = Math.max(0, -s.getBoundingClientRect().top)
          const y = visibleTop + window.innerHeight * (0.1 + Math.random() * 0.35)
          burst(w * (0.12 + Math.random() * 0.76), y, 90)
        }, i * 320)
      }
    },
    [burst]
  )

  const openSky = useCallback(() => {
    setCountdown(null)
    audioRef.current?.init()
    audioRef.current?.startAmbience()
    setSkyOpen(true)
    setSkyShown(true)
  }, [])

  const handleLightDiya = useCallback(() => {
    if (stage !== 'idle') return
    // Stage 1 · ignition — audio may only start from this click
    const a = audio()
    a.init()
    a.setVolume(volume)
    a.setMuted(muted)
    a.ignite()
    a.startAmbience(0.035)
    onDiyaLit?.()
    setStage('igniting')
    diyaRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'center' })
    setEmbers(
      Array.from({ length: 16 }, (_, i) => ({
        id: `ember-${i}`,
        x: (Math.random() - 0.5) * 90,
        size: 2 + Math.random() * 3,
        duration: 1.8 + Math.random() * 1.8,
        delay: 0.4 + Math.random() * 2.4,
      }))
    )

    later(() => {
      // Diya fully lit → the existing lit celebration, then the sky after 5 s
      setStage('lit')
      celebrate(6)
      setPetals(
        Array.from({ length: 26 }, (_, i) => ({
          id: `petal-${i}`,
          left: Math.random() * 100,
          size: 10 + Math.random() * 10,
          duration: 6 + Math.random() * 5,
          delay: Math.random() * 3,
          sway: (Math.random() - 0.5) * 160,
          hue: Math.random() < 0.6 ? '#FFB23F' : Math.random() < 0.5 ? '#FF7A1A' : '#F28BA6',
        }))
      )
      setCountdown(SKY_DELAY_S)
      for (let s = 1; s < SKY_DELAY_S; s++) later(() => setCountdown(SKY_DELAY_S - s), s * 1000)
      later(openSky, SKY_DELAY_S * 1000)
    }, IGNITION_MS)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, onDiyaLit, celebrate, openSky, volume, muted])

  // After lighting, tapping the sky launches a firework at that point
  function handleSkyTap(e) {
    // ignore events bubbling from portals (sky overlay, uploader)
    if (!isDiyaLit || skyOpen || !sectionRef.current?.contains(e.target)) return
    if (e.target.closest('button, a, input, label')) return
    const r = sectionRef.current.getBoundingClientRect()
    burst(e.clientX - r.left, e.clientY - r.top, 80)
  }

  const flameScale = stage === 'idle' ? 0.42 : 1
  const igniting = stage === 'igniting'
  const showUploadCard = stage === 'idle' && portrait.status === 'empty'

  return (
    <section
      id="chapter-wish"
      ref={(el) => {
        sectionRef.current = el
        revealRef.current = el
      }}
      onClick={handleSkyTap}
      data-testid="section-final-wish"
      className={`relative w-full min-h-[100svh] px-5 py-28 md:py-40 flex flex-col items-center justify-center text-center overflow-hidden ${
        isDiyaLit ? 'cursor-crosshair' : ''
      }`}
    >
      <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 w-full h-full pointer-events-none z-0" />

      {/* ignition focus: darken the edges so all eyes go to the flame */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none z-[5] transition-opacity duration-[1200ms]"
        style={{
          opacity: igniting ? 1 : 0,
          background: 'radial-gradient(45% 40% at 50% 55%, transparent 0%, rgba(7,4,15,0.55) 60%, rgba(7,4,15,0.85) 100%)',
        }}
      />

      {/* golden dawn when lit */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none transition-opacity duration-[2000ms]"
        style={{
          opacity: isDiyaLit ? 1 : 0,
          background: 'radial-gradient(70% 55% at 50% 62%, rgba(255,159,46,0.32), rgba(242,139,166,0.08) 55%, transparent 75%)',
        }}
      />

      {/* marigold rain */}
      {petals.map((p) => (
        <span
          key={p.id}
          aria-hidden="true"
          className="absolute top-0 pointer-events-none z-10"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 1.4,
            background: `radial-gradient(circle at 30% 30%, #FFE6A6, ${p.hue})`,
            borderRadius: '60% 40% 60% 40%',
            animation: `petalFall ${p.duration}s linear ${p.delay}s infinite`,
            '--sway': `${p.sway}px`,
          }}
        />
      ))}

      <div className="relative z-20 flex flex-col items-center">
        <p className="reveal eyebrow mb-5">Chapter 05 · One last wish</p>
        <h2 className="reveal font-heading text-4xl sm:text-5xl md:text-6xl text-[#FFF4DE] tracking-tight max-w-3xl leading-[1.08]">
          {final.heading || 'A thousand diyas, one special wish.'}
        </h2>
        <p className="reveal mt-6 font-heading italic text-lg sm:text-xl md:text-2xl text-[#FFF4DE]/70 max-w-2xl leading-relaxed">
          &ldquo;{final.message ||
            'May your life always shine with happiness, your dreams find their way to reality, and your smile never lose its brightness.'}&rdquo;
        </p>

        <div
          ref={diyaRef}
          data-testid="final-diya"
          data-stage={stage}
          className="relative my-12 transition-all ease-out"
          style={{
            transitionDuration: igniting ? `${IGNITION_MS}ms` : '1500ms',
            filter: stage === 'idle' ? 'grayscale(0.55) brightness(0.65)' : 'none',
            transform: igniting ? 'scale(1.16)' : isDiyaLit ? 'scale(1.08)' : 'scale(1)',
          }}
        >
          {/* warm floor reflection */}
          <span
            aria-hidden="true"
            className="absolute left-1/2 -translate-x-1/2 -bottom-6 w-[150%] h-14 rounded-[50%] pointer-events-none transition-opacity duration-[2000ms]"
            style={{
              opacity: stage === 'idle' ? 0 : 1,
              background: 'radial-gradient(ellipse, rgba(255,170,60,0.45) 0%, rgba(255,140,40,0.12) 45%, transparent 72%)',
              filter: 'blur(6px)',
            }}
          />
          {/* rising embers during ignition */}
          {stage !== 'idle' &&
            embers.map((e) => (
              <span
                key={e.id}
                aria-hidden="true"
                className="absolute left-1/2 top-[18%] rounded-full pointer-events-none"
                style={{
                  marginLeft: e.x,
                  width: e.size,
                  height: e.size,
                  background: 'radial-gradient(circle, #FFF6D8 0%, #FFB23F 60%, transparent 100%)',
                  boxShadow: '0 0 8px 2px rgba(255,159,46,0.7)',
                  animation: `riseUp ${e.duration}s ease-out ${e.delay}s both`,
                }}
              />
            ))}
          <RealisticDiya
            size={240}
            brightness={stage === 'idle' ? 0.7 : igniting ? 1.35 : 1.7}
            isLitUp={stage !== 'idle'}
            flameScale={flameScale}
            flameTransitionMs={IGNITION_MS}
          />
        </div>

        <h1
          data-testid="final-main-wish"
          className="font-heading text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-[#FFF4DE] tracking-tight leading-none"
        >
          Happy Diwali, <span className="italic text-gold-shimmer">{herName}</span>{' '}
          <span className="text-[#FF9F2E]">❤️</span>
        </h1>
        <p className="mt-5 font-body text-base sm:text-lg text-[#FFF4DE]/65 max-w-md">
          {final.supportingMessage || 'Thank you for being one of the most beautiful parts of my life.'}
        </p>

        {showUploadCard && (
          <div className="mt-10 glass rounded-3xl px-6 py-5 max-w-md text-center" data-testid="sky-portrait-card">
            <p className="font-heading text-xl text-[#FFF4DE]">Make the Sky Shine With You</p>
            <p className="mt-1 text-sm text-[#FFF4DE]/60">Add her favourite photograph and let the stars create a little magic.</p>
            <button type="button" onClick={() => setUploaderOpen(true)} className="btn-ghost mt-4">
              ✦ Upload Her Photo
            </button>
          </div>
        )}

        {stage === 'idle' && (
          <div className="mt-10">
            <button onClick={handleLightDiya} data-testid="light-diya-for-us-btn" className="btn-gold px-9 py-4 text-base">
              <span
                aria-hidden="true"
                className="absolute -inset-1 rounded-full animate-ping border border-[#FBE3A8]/70"
                style={{ animationDuration: '2.2s' }}
              />
              <span className="relative">{final.buttonText || 'Light a Diya for Us ✨'}</span>
            </button>
            <p className="mt-3 font-body text-xs tracking-[0.2em] uppercase text-[#FBE3A8]/45">Tap to light up our sky</p>
          </div>
        )}

        {igniting && (
          <p className="mt-10 font-heading italic text-xl text-[#FBE3A8]" style={{ animation: 'fadeIn 1s ease both' }} role="status">
            The flame is waking up…
          </p>
        )}

        {isDiyaLit && (
          <div
            className="paper-sheet mt-12 max-w-lg w-full rounded-[28px] p-7 md:p-9 text-left"
            style={{ animation: 'sheetIn .9s cubic-bezier(.2,.7,.2,1) .3s both' }}
          >
            <p className="font-heading italic text-xl md:text-2xl text-[#382A2B] leading-relaxed">
              &ldquo;{final.afterLightQuote || 'No matter how many lights surround us, you will always be my favourite one.'}&rdquo;
            </p>
            <div className="mt-6 pt-5 border-t border-[#D6AD62]/35 flex items-end justify-between gap-4">
              <div className="flex flex-col items-start gap-2">
                <button onClick={() => celebrate(4)} className="btn-outline-gold !px-4 !py-2 !text-[10px]">
                  🎆 More fireworks
                </button>
                {skyShown && !skyOpen && (
                  <button onClick={openSky} className="btn-outline-gold !px-4 !py-2 !text-[10px]" data-testid="relive-sky-btn">
                    ✨ Relive the sky
                  </button>
                )}
              </div>
              <div className="text-right">
                <p className="font-body text-[10px] uppercase tracking-[0.3em] text-[#633B48]/70">{final.signatureIntro || 'With all my love,'}</p>
                <p className="font-hand text-4xl text-[#633B48] leading-none mt-1">{yourName}</p>
              </div>
            </div>
          </div>
        )}

        {isDiyaLit && countdown !== null && (
          <div className="mt-6 flex items-center gap-3 text-[#FBE3A8]" role="status" data-testid="sky-countdown" style={{ animation: 'fadeIn .8s ease both' }}>
            <span className="relative w-9 h-9">
              <svg viewBox="0 0 36 36" className="absolute inset-0 -rotate-90" aria-hidden="true">
                <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(251,227,168,0.2)" strokeWidth="2" />
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  stroke="#F4C56A"
                  strokeWidth="2"
                  strokeDasharray="100.5"
                  strokeDashoffset={100.5 * (countdown / SKY_DELAY_S)}
                  style={{ transition: 'stroke-dashoffset 1s linear' }}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold">{countdown}</span>
            </span>
            <span className="font-body text-xs tracking-[0.25em] uppercase">Look up… the sky is waking</span>
          </div>
        )}

        {isDiyaLit && countdown === null && (
          <p className="mt-6 font-body text-[11px] tracking-[0.25em] uppercase text-[#FBE3A8]/45" style={{ animation: 'fadeIn 1s ease both' }}>
            Tap anywhere in the sky ✦
          </p>
        )}
      </div>

      <SkyCelebration
        open={skyOpen}
        onClose={() => setSkyOpen(false)}
        portraitSource={portraitImg}
        herName={herName}
        yourName={yourName}
        audio={audioRef.current}
        volume={volume}
        muted={muted}
        onVolumeChange={(v) => {
          setVolume(v)
          if (v > 0 && muted) setMuted(false)
        }}
        onMuteToggle={() => setMuted((m) => !m)}
      />
      <PortraitUploader open={uploaderOpen} onClose={() => setUploaderOpen(false)} />
    </section>
  )
}
