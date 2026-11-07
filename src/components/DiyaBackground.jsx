import React, { useRef, useEffect } from 'react'

const DIYA_COUNT  = 320
const rand = (a, b) => a + Math.random() * (b - a)

function buildDiyas(W, H) {
  return Array.from({ length: DIYA_COUNT }, () => ({
    x:    rand(0.02, 0.98),
    y:    rand(0.3,  0.98),
    hue:  rand(28, 46),
    sat:  rand(85, 100),
    lit:  rand(55, 90),
    r:    rand(1.2, 4.0),
    flk:  rand(0, Math.PI * 2),
    fs:   rand(0.7, 2.2),
    a:    rand(0.4, 1.0),
  }))
}

export default function DiyaBackground() {
  const canvasRef = useRef(null)
  const diyas     = useRef([])
  const rafRef    = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let W, H, dpr

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      W   = window.innerWidth
      H   = window.innerHeight
      canvas.width  = W * dpr
      canvas.height = H * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      diyas.current = buildDiyas(W, H)
    }
    resize()
    window.addEventListener('resize', resize)

    function frame(ts) {
      ctx.clearRect(0, 0, W, H)

      // Sky
      const sky = ctx.createLinearGradient(0, 0, 0, H)
      sky.addColorStop(0.0, '#040010')
      sky.addColorStop(0.4, '#0a0005')
      sky.addColorStop(0.75,'#140820')
      sky.addColorStop(1.0, '#1a0510')
      ctx.fillStyle = sky
      ctx.fillRect(0, 0, W, H)

      // Stars (static — cheap)
      for (let i = 0; i < 120; i++) {
        const sx = ((i * 137.5) % 100) / 100 * W
        const sy = ((i * 79.3)  % 60)  / 100 * H
        const f  = 0.3 + 0.7 * Math.sin(ts * 0.0008 * (0.4 + i % 5 * 0.3) + i)
        ctx.globalAlpha = f * 0.55
        ctx.fillStyle   = '#ffffff'
        ctx.beginPath()
        ctx.arc(sx, sy, 0.5 + (i % 3) * 0.3, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1

      // Diyas
      for (const p of diyas.current) {
        const sx = p.x * W
        const sy = p.y * H
        const flicker = Math.sin(ts * p.fs * 0.001 + p.flk)
        const lit = p.lit + flicker * 7
        const alpha = p.a * (0.75 + 0.25 * flicker)

        // Bloom
        for (let g = 4; g >= 1; g--) {
          const gr = p.r * g * 2.8
          const ga = alpha * 0.12 / g
          const grd = ctx.createRadialGradient(sx, sy, 0, sx, sy, gr)
          grd.addColorStop(0, `hsla(${p.hue},${p.sat}%,${lit}%,${ga})`)
          grd.addColorStop(1, 'transparent')
          ctx.fillStyle = grd
          ctx.beginPath(); ctx.arc(sx, sy, gr, 0, Math.PI * 2); ctx.fill()
        }

        // Core
        ctx.globalAlpha = alpha
        ctx.fillStyle   = `hsl(${p.hue},${p.sat}%,${Math.min(lit + 20, 98)}%)`
        ctx.beginPath(); ctx.arc(sx, sy, p.r, 0, Math.PI * 2); ctx.fill()
      }
      ctx.globalAlpha = 1

      // Vignette
      const vig = ctx.createRadialGradient(W/2, H/2, Math.min(W,H)*0.3, W/2, H/2, Math.max(W,H)*0.75)
      vig.addColorStop(0, 'transparent')
      vig.addColorStop(1, 'rgba(4,0,10,0.72)')
      ctx.fillStyle = vig
      ctx.fillRect(0, 0, W, H)

      rafRef.current = requestAnimationFrame(frame)
    }
    rafRef.current = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      data-testid="diya-background"
      className="fixed inset-0 z-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    />
  )
}
