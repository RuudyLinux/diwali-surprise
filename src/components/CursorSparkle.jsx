import React, { useEffect, useRef } from 'react'

/**
 * A soft trail of golden sparks that follows the pointer (fine pointers only).
 * Disabled for touch devices and reduced-motion users.
 */
export default function CursorSparkle() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const mq = window.matchMedia
    if (!mq) return
    if (!mq('(pointer: fine)').matches || mq('(prefers-reduced-motion: reduce)').matches) return

    const canvas = canvasRef.current
    const ctx = canvas?.getContext?.('2d')
    if (!canvas || !ctx || typeof ctx.arc !== 'function') return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const sparks = []
    let raf = null

    function resize() {
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
    }

    function loop() {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i]
        s.x += s.vx
        s.y += s.vy
        s.vy += 0.03
        s.life -= 0.022
        if (s.life <= 0) {
          sparks.splice(i, 1)
          continue
        }
        ctx.globalAlpha = s.life
        ctx.fillStyle = s.col
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r * s.life, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
      raf = sparks.length ? requestAnimationFrame(loop) : null
    }

    function onMove(e) {
      for (let i = 0; i < 2; i++) {
        sparks.push({
          x: e.clientX,
          y: e.clientY,
          vx: (Math.random() - 0.5) * 1.2,
          vy: (Math.random() - 0.8) * 1.2,
          r: Math.random() * 2.2 + 0.8,
          life: 1,
          col: Math.random() < 0.7 ? '#FFD98A' : '#FF9F2E',
        })
      }
      if (sparks.length > 160) sparks.splice(0, sparks.length - 160)
      if (!raf) raf = requestAnimationFrame(loop)
    }

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onMove)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 z-[60] w-full h-full pointer-events-none"
    />
  )
}
