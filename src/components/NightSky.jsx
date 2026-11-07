import React, { useEffect, useMemo, useRef } from 'react'

/**
 * Fixed full-page backdrop: midnight gradient, twinkling star field (canvas),
 * soft aurora glows and a slow procession of floating sky lanterns.
 * Purely decorative — never intercepts pointer events.
 */
export default function NightSky({ lanternCount = 14 }) {
  const canvasRef = useRef(null)

  // Star field on canvas (cheap: redraw only twinkle alpha)
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext?.('2d')
    if (!canvas || !ctx || typeof ctx.arc !== 'function') return

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
    let stars = []
    let raf = null
    let w = 0
    let h = 0
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    function seed() {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      const count = Math.round((w * h) / 5200)
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h * 0.85,
        r: Math.random() * 1.1 + 0.25,
        base: Math.random() * 0.5 + 0.2,
        speed: Math.random() * 0.002 + 0.0006,
        phase: Math.random() * Math.PI * 2,
        warm: Math.random() < 0.25,
      }))
    }

    function draw(t = 0) {
      // paused while the full-screen celebration covers the page
      if (document.documentElement.classList.contains('sky-celebrating')) {
        if (!reduce) raf = requestAnimationFrame(draw)
        return
      }
      ctx.setTransform?.(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)
      for (const s of stars) {
        const a = s.base + Math.sin(t * s.speed + s.phase) * 0.35
        ctx.globalAlpha = Math.max(0.05, Math.min(1, a))
        ctx.fillStyle = s.warm ? '#FFE3A3' : '#F4EEFF'
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
      if (!reduce) raf = requestAnimationFrame(draw)
    }

    seed()
    draw()
    const onResize = () => {
      seed()
      if (reduce) draw()
    }
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  // Deterministic lantern layout so SSR/tests stay stable
  const lanterns = useMemo(
    () =>
      Array.from({ length: lanternCount }, (_, i) => {
        const depth = (i * 37) % 10 // 0 = far, 9 = near
        return {
          id: i,
          left: (i * 61.8 + 4) % 96,
          size: 14 + depth * 2.6,
          duration: 38 - depth * 1.6,
          delay: -((i * 7.3) % 38),
          drift: ((i % 2 ? 1 : -1) * (20 + (i * 13) % 60)),
          opacity: 0.35 + depth * 0.06,
          blur: depth < 3 ? 1.5 : 0,
        }
      }),
    [lanternCount]
  )

  return (
    <div aria-hidden="true" className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Sky gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 80% at 50% 110%, #3B1E4F 0%, #1C0F31 38%, #0D0819 65%, #07040F 100%)',
        }}
      />
      {/* Aurora glows */}
      <div
        className="absolute -top-40 -left-40 w-[60vw] h-[60vw] rounded-full opacity-40 blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(242,139,166,0.22), transparent 65%)' }}
      />
      <div
        className="absolute top-1/3 -right-52 w-[55vw] h-[55vw] rounded-full opacity-40 blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(255,159,46,0.18), transparent 65%)' }}
      />

      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Floating sky lanterns */}
      {lanterns.map((l) => (
        <span
          key={l.id}
          className="absolute bottom-[-12vh]"
          style={{
            left: `${l.left}%`,
            width: l.size,
            height: l.size * 1.3,
            filter: l.blur ? `blur(${l.blur}px)` : undefined,
            animation: `lanternRise ${l.duration}s linear ${l.delay}s infinite`,
            '--drift': `${l.drift}px`,
            '--lantern-opacity': l.opacity,
          }}
        >
          <span
            className="block w-full h-full"
            style={{
              borderRadius: '42% 42% 30% 30% / 50% 50% 22% 22%',
              background:
                'radial-gradient(circle at 50% 78%, #FFF4C8 0%, #FFC25A 30%, #F07A1E 72%, #8E2F12 100%)',
              boxShadow: `0 0 ${l.size}px ${l.size * 0.35}px rgba(255,159,46,0.45)`,
              animation: `lanternFlicker ${2 + (l.id % 3)}s ease-in-out infinite`,
            }}
          />
        </span>
      ))}

      {/* Ground haze */}
      <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-[#2A1338]/60 to-transparent" />
    </div>
  )
}
