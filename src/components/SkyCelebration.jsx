import React, { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { CelebrationEngine, computeLayout } from '../utils/celebrationEngine'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches

function Caption({ show, className = '', style, children, delay = 0 }) {
  return (
    <div
      className={`transition-all duration-[1400ms] ease-[cubic-bezier(.2,.7,.2,1)] ${className}`}
      style={{
        opacity: show ? 1 : 0,
        transform: show ? 'none' : 'translateY(18px)',
        transitionDelay: show ? `${delay}ms` : '0ms',
        ...style,
      }}
      aria-hidden={!show}
    >
      {children}
    </div>
  )
}

function Scene({ onClose, portraitSource, portraitStyle, herName, yourName, audio, volume, muted, onVolumeChange, onMuteToggle }) {
  const fxRef = useRef(null)
  const mainRef = useRef(null)
  const glRef = useRef(null)
  const engineRef = useRef(null)
  const idleTimer = useRef(null)
  const [texts, setTexts] = useState({})
  const [layout, setLayout] = useState(() =>
    typeof window !== 'undefined' ? computeLayout(window.innerWidth, window.innerHeight) : null
  )
  const [closing, setClosing] = useState(false)
  const [dusk, setDusk] = useState(true)
  const [idle, setIdle] = useState(false)
  const [phase, setPhase] = useState('sky')

  // Engine events → audio + captions (always in sync with the animation itself)
  const handleEvent = useCallback(
    (e) => {
      switch (e.type) {
        case 'launch':
          audio?.launch(e)
          break
        case 'explode':
          audio?.explode({ ...e, type: e.shell })
          break
        case 'heart-gather':
          audio?.magicSwell()
          break
        case 'heart-form':
          audio?.heartChime()
          break
        case 'heart-fill':
          audio?.sparkleWash()
          break
        case 'face-start':
          audio?.faceShimmer(5)
          break
        case 'face-settled':
          audio?.settleChord()
          break
        case 'finale':
          audio?.finale()
          break
        case 'text':
          setTexts((t) => ({ ...t, [e.key]: e.visible }))
          break
        case 'phase':
          setPhase(e.name)
          break
        default:
      }
    },
    [audio]
  )

  useEffect(() => {
    const engine = new CelebrationEngine({
      fxCanvas: fxRef.current,
      mainCanvas: mainRef.current,
      glCanvas: glRef.current,
      portraitSource,
      portraitStyle,
      herName,
      reducedMotion: prefersReducedMotion(),
      onEvent: handleEvent,
    })
    engineRef.current = engine
    if (import.meta.env?.DEV) window.__skyEngine = engine // dev-only debugging handle
    setLayout(engine.getLayout())
    engine.start()
    const duskTimer = setTimeout(() => setDusk(false), 600)

    const onResize = () => {
      engine.resize()
      setLayout({ ...engine.getLayout() })
    }
    window.addEventListener('resize', onResize)
    window.addEventListener('orientationchange', onResize)

    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    // once the overlay is opaque, stop painting the page underneath (smoother show)
    const hideTimer = setTimeout(() => document.documentElement.classList.add('sky-celebrating'), 1300)
    return () => {
      clearTimeout(hideTimer)
      document.documentElement.classList.remove('sky-celebrating')
      clearTimeout(duskTimer)
      engine.destroy()
      window.removeEventListener('resize', onResize)
      window.removeEventListener('orientationchange', onResize)
      document.body.style.overflow = prevOverflow
    }
    // engine is created once per mount; replay resets it in place
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Controls dim after a few quiet seconds, return on any movement
  const wake = useCallback(() => {
    setIdle(false)
    clearTimeout(idleTimer.current)
    idleTimer.current = setTimeout(() => setIdle(true), 3500)
  }, [])
  useEffect(() => {
    wake()
    return () => clearTimeout(idleTimer.current)
  }, [wake])

  const close = useCallback(() => {
    if (closing) return
    setClosing(true)
    document.documentElement.classList.remove('sky-celebrating')
    audio?.stopAmbience(1.4)
    setTimeout(onClose, 900)
  }, [audio, closing, onClose])

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [close])

  const replay = () => {
    setTexts({})
    audio?.startAmbience()
    engineRef.current?.replay()
  }

  const t = layout?.text
  const side = t?.mode === 'side'
  const ctrlBtn =
    'h-10 min-w-10 px-3 rounded-full flex items-center justify-center gap-1.5 text-xs font-medium text-[#FFF4DE]/85 hover:text-white hover:bg-white/10 transition-colors'

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Diwali sky celebration"
      data-testid="sky-celebration"
      onPointerMove={wake}
      onTouchStart={wake}
      className="fixed inset-0 z-[90] overflow-hidden select-none"
      style={{
        opacity: closing ? 0 : 1,
        transition: 'opacity .9s ease',
        animation: 'fadeIn 1.2s ease both',
        touchAction: 'none',
      }}
    >
      {/* night sky, with a warm dusk that melts away */}
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(130% 90% at 50% 105%, #2A1238 0%, #120A22 40%, #07040F 75%, #030208 100%)' }}
      />
      <div
        className="absolute inset-0 transition-opacity duration-[4000ms] ease-out"
        style={{
          opacity: dusk ? 1 : 0,
          background: 'linear-gradient(to top, #D9733A 0%, #9C3F57 20%, #4A2152 45%, #160C2A 75%, #07040F 100%)',
        }}
      />
      <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-[#1A0B22] to-transparent" />

      <canvas ref={fxRef} className="absolute inset-0 w-full h-full" aria-hidden="true" />
      <canvas ref={mainRef} className="absolute inset-0 w-full h-full" aria-hidden="true" />
      <canvas ref={glRef} className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true" />

      {/* captions (never placed over the portrait) */}
      <div aria-live="polite" className="absolute inset-0 pointer-events-none">
        {layout && (
          <Caption
            show={!!texts.heartLine}
            className="absolute inset-x-0 px-6 text-center"
            style={{ top: Math.min(layout.heart.textTop, layout.h - 80) }}
          >
            <p className="font-heading italic text-xl sm:text-2xl md:text-3xl text-[#FFF4DE]" style={{ textShadow: '0 0 24px rgba(255,159,46,0.6)' }}>
              Every little light reminds me of you.
            </p>
          </Caption>
        )}

        {t && (
          <div
            className={`absolute flex flex-col justify-center ${side ? 'items-start text-left' : 'items-center text-center'}`}
            style={{ left: t.left, top: t.top, width: t.width, height: t.height }}
          >
            <Caption show={!!texts.line1}>
              <p className={`font-heading italic text-[#FFF4DE]/80 leading-snug ${side ? 'text-xl lg:text-2xl xl:text-[1.7rem]' : 'text-[15px] sm:text-lg'}`}>
                Among a thousand lights, a million wishes and countless beautiful moments...
              </p>
            </Caption>
            <Caption show={!!texts.line2} className={side ? 'mt-6' : 'mt-2'}>
              <p
                className={`font-heading text-[#FFF4DE] leading-tight ${side ? 'text-3xl lg:text-4xl xl:text-5xl' : 'text-xl sm:text-2xl'}`}
                style={{ textShadow: '0 0 30px rgba(255,159,46,0.45)' }}
              >
                <span className="text-gold-shimmer font-semibold">YOU</span> will always be my favourite light. ❤️
              </p>
            </Caption>
            <Caption show={!!texts.name} className={side ? 'mt-8' : 'mt-3'}>
              <p className={`font-heading text-[#FFF4DE] ${side ? 'text-4xl lg:text-5xl xl:text-6xl' : 'text-2xl sm:text-3xl'}`}>
                Happy Diwali, <span className="italic text-gold-shimmer">{herName}</span>
              </p>
            </Caption>
            <Caption show={!!texts.signature} className={side ? 'mt-8' : 'mt-3'}>
              <p className="font-body text-[10px] sm:text-xs uppercase tracking-[0.32em] text-[#FBE3A8]/70">With all my love,</p>
              <p className={`font-heading italic text-[#FBE3A8] mt-1 ${side ? 'text-3xl' : 'text-2xl'}`}>{yourName}</p>
            </Caption>
          </div>
        )}
      </div>

      {/* minimal controls */}
      <div
        className="absolute top-3 right-3 sm:top-5 sm:right-5 z-10 transition-opacity duration-700"
        style={{ opacity: idle ? 0.28 : 1 }}
        onFocusCapture={wake}
      >
        <div className="glass rounded-full p-1 flex items-center gap-0.5">
          <button
            type="button"
            onClick={onMuteToggle}
            className={ctrlBtn}
            aria-label={muted ? 'Unmute sound' : 'Mute sound'}
            title={muted ? 'Sound off' : 'Sound on'}
            data-testid="sky-mute-btn"
          >
            <span aria-hidden="true">{muted ? '🔇' : '🔊'}</span>
          </button>
          <label className="hidden sm:flex items-center pr-2" title="Volume">
            <span className="sr-only">Volume</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={muted ? 0 : volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-20 accent-[#F4C56A] cursor-pointer"
              aria-label="Volume"
              data-testid="sky-volume"
            />
          </label>
          <button type="button" onClick={replay} className={ctrlBtn} aria-label="Replay celebration" title="Replay" data-testid="sky-replay-btn">
            <span aria-hidden="true">↻</span>
            <span className="hidden md:inline">Replay</span>
          </button>
          <button type="button" onClick={close} className={ctrlBtn} aria-label="Close celebration" title="Close" data-testid="sky-close-btn">
            <span aria-hidden="true">✕</span>
          </button>
        </div>
        {/* volume on touch screens */}
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={muted ? 0 : volume}
          onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
          className="sm:hidden mt-2 ml-auto block w-28 accent-[#F4C56A]"
          aria-label="Volume"
        />
      </div>

      <span className="sr-only">Celebration stage: {phase}</span>
    </div>
  )
}

export default function SkyCelebration({ open, ...props }) {
  if (!open || typeof document === 'undefined') return null
  return createPortal(<Scene {...props} />, document.body)
}
