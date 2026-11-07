import { useRef, useCallback, useEffect } from 'react'

const COLORS = [
  '#FFD700','#FF6B1A','#ff9500','#c2185b',
  '#e040fb','#4fc3f7','#ffffff','#fbbf24','#f472b6',
]

function rand(a, b)   { return a + Math.random() * (b - a) }
function randItem(arr) { return arr[Math.floor(rand(0, arr.length))] }

function createBurst(x, y, count = 80) {
  const particles = []
  const col = randItem(COLORS)
  for (let i = 0; i < count; i++) {
    const angle  = (i / count) * Math.PI * 2 + rand(-0.08, 0.08)
    const speed  = rand(1.5, 6.5)
    const life   = rand(0.55, 1.0)
    particles.push({
      x, y,
      vx:      Math.cos(angle) * speed,
      vy:      Math.sin(angle) * speed - rand(0, 1.5),
      col,
      r:       rand(1.5, 3.5),
      life,
      maxLife: life,
    })
  }
  // Bright core sparkles
  for (let i = 0; i < 18; i++) {
    particles.push({
      x, y,
      vx: rand(-2.5, 2.5), vy: rand(-3.5, 0.5),
      col: '#fffde7', r: rand(1, 2.2),
      life: 0.4, maxLife: 0.4,
    })
  }
  return particles
}

/**
 * useFireworks(canvasRef)
 * Returns { burst, startAuto, stopAuto }
 */
export function useFireworks(canvasRef) {
  const particles  = useRef([])
  const rafRef     = useRef(null)
  const autoRef    = useRef(null)
  const lastTs     = useRef(0)

  // ── render loop ──────────────────────────────────────────
  const renderLoop = useCallback((ts) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width / (window.devicePixelRatio || 1)
    const H = canvas.height / (window.devicePixelRatio || 1)
    const dt = Math.min(ts - lastTs.current, 50)
    lastTs.current = ts

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const pts = particles.current
    for (let i = pts.length - 1; i >= 0; i--) {
      const p = pts[i]
      p.x  += p.vx
      p.y  += p.vy
      p.vy += 0.09   // gravity
      p.vx *= 0.97
      p.vy *= 0.97
      p.life -= dt / 1000
      if (p.life <= 0) { pts.splice(i, 1); continue }

      const alpha = p.life / p.maxLife
      ctx.globalAlpha = alpha
      ctx.fillStyle   = p.col
      ctx.beginPath()
      ctx.arc(p.x * (window.devicePixelRatio||1),
              p.y * (window.devicePixelRatio||1),
              p.r * (window.devicePixelRatio||1), 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1

    if (pts.length > 0) {
      rafRef.current = requestAnimationFrame(renderLoop)
    } else {
      rafRef.current = null
    }
  }, [canvasRef])

  const ensureLoop = useCallback(() => {
    if (!rafRef.current) {
      lastTs.current = performance.now()
      rafRef.current = requestAnimationFrame(renderLoop)
    }
  }, [renderLoop])

  // ── public API ───────────────────────────────────────────
  const burst = useCallback((x, y, count) => {
    particles.current.push(...createBurst(x, y, count))
    ensureLoop()
  }, [ensureLoop])

  const startAuto = useCallback(() => {
    if (autoRef.current) return
    function schedule() {
      const canvas = canvasRef.current
      if (!canvas) return
      const W = canvas.width / (window.devicePixelRatio || 1)
      const H = canvas.height / (window.devicePixelRatio || 1)
      burst(rand(W * 0.1, W * 0.9), rand(H * 0.08, H * 0.5), 70)
      autoRef.current = setTimeout(schedule, rand(1200, 2600))
    }
    schedule()
  }, [burst, canvasRef])

  const stopAuto = useCallback(() => {
    clearTimeout(autoRef.current)
    autoRef.current = null
  }, [])

  useEffect(() => () => {
    cancelAnimationFrame(rafRef.current)
    clearTimeout(autoRef.current)
  }, [])

  return { burst, startAuto, stopAuto }
}

// Exported for unit tests
export { createBurst }
