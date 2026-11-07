import React, { useRef, useEffect, useCallback } from 'react'
import { useFireworks } from '../hooks/useFireworks'

/**
 * Full-screen canvas that renders fireworks.
 * Exposes burst(x, y) via forwarded ref.
 */
export default function FireworksCanvas({ onBurst, autoPlay = true }) {
  const canvasRef = useRef(null)
  const { burst, startAuto, stopAuto } = useFireworks(canvasRef)

  // Resize canvas to match DPR
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      canvas.width  = window.innerWidth  * dpr
      canvas.height = window.innerHeight * dpr
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  // Auto-play bursts
  useEffect(() => {
    if (autoPlay) startAuto()
    return () => stopAuto()
  }, [autoPlay, startAuto, stopAuto])

  // Click handler
  const handleClick = useCallback((e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    burst(x, y, 90)
    onBurst?.(x, y)
  }, [burst, onBurst])

  // Touch handler (without blocking native scroll)
  const handleTouch = useCallback((e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    for (const t of e.changedTouches) {
      const x = t.clientX - rect.left
      const y = t.clientY - rect.top
      burst(x, y, 70)
      onBurst?.(x, y)
    }
  }, [burst, onBurst])

  return (
    <canvas
      ref={canvasRef}
      data-testid="fireworks-canvas"
      className="fixed inset-0 z-0 w-full h-full cursor-crosshair"
      style={{ pointerEvents: 'auto' }}
      onClick={handleClick}
      onTouchEnd={handleTouch}
      aria-label="Click to launch fireworks"
      role="img"
    />
  )
}
