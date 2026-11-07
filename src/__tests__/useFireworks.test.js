import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createBurst } from '../hooks/useFireworks'

describe('createBurst', () => {
  it('returns at least the requested count of particles', () => {
    const pts = createBurst(100, 200, 80)
    expect(pts.length).toBeGreaterThanOrEqual(80)
  })

  it('includes extra sparkle particles beyond base count', () => {
    const pts = createBurst(100, 200, 50)
    expect(pts.length).toBeGreaterThan(50)
  })

  it('all particles start at the burst origin', () => {
    const pts = createBurst(300, 400, 20)
    for (const p of pts) {
      expect(p.x).toBe(300)
      expect(p.y).toBe(400)
    }
  })

  it('all particles have positive life and maxLife', () => {
    const pts = createBurst(0, 0, 40)
    for (const p of pts) {
      expect(p.life).toBeGreaterThan(0)
      expect(p.maxLife).toBeGreaterThan(0)
      expect(p.life).toBeLessThanOrEqual(p.maxLife + 0.001)
    }
  })

  it('particles have velocities in both directions', () => {
    const pts = createBurst(0, 0, 60)
    const posVX = pts.some(p => p.vx > 0)
    const negVX = pts.some(p => p.vx < 0)
    expect(posVX).toBe(true)
    expect(negVX).toBe(true)
  })

  it('all particles have a colour string', () => {
    const pts = createBurst(0, 0, 10)
    for (const p of pts) {
      expect(typeof p.col).toBe('string')
      expect(p.col.length).toBeGreaterThan(0)
    }
  })

  it('all particles have a radius > 0', () => {
    const pts = createBurst(0, 0, 10)
    for (const p of pts) {
      expect(p.r).toBeGreaterThan(0)
    }
  })
})
