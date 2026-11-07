import { describe, it, expect } from 'vitest'
import { CelebrationEngine, computeLayout, heartPoint, FACE_T0, HEART_T0 } from '../utils/celebrationEngine'

function run(engine, seconds) {
  while (engine.t < seconds) {
    engine.update(0.05)
    engine.render(0.05)
  }
}

function makeEngine(opts = {}) {
  const events = []
  const engine = new CelebrationEngine({
    fxCanvas: document.createElement('canvas'),
    mainCanvas: document.createElement('canvas'),
    herName: 'Helly',
    quality: 'low',
    onEvent: (e) => events.push({ ...e, t: engine?.t ?? 0 }),
    ...opts,
  })
  return { engine, events }
}

describe('heartPoint', () => {
  it('is symmetric and spans roughly [-1, 1]', () => {
    const a = heartPoint(1.1)
    const b = heartPoint(-1.1)
    expect(a.x).toBeCloseTo(-b.x, 6)
    expect(a.y).toBeCloseTo(b.y, 6)
    expect(heartPoint(Math.PI / 2).x).toBeCloseTo(1, 5)
  })
})

describe('computeLayout', () => {
  it('wide screens: portrait left, words right, no overlap, aspect kept', () => {
    const L = computeLayout(1366, 800, 0.8)
    expect(L.text.mode).toBe('side')
    expect(L.rect.w / L.rect.h).toBeCloseTo(0.8, 5)
    expect(L.rect.x + L.rect.w).toBeLessThanOrEqual(L.text.left)
  })

  it('phones: portrait on top, words below it', () => {
    const L = computeLayout(390, 844, 0.8)
    expect(L.text.mode).toBe('stack')
    expect(L.rect.w / L.rect.h).toBeCloseTo(0.8, 5)
    expect(L.text.top).toBeGreaterThanOrEqual(L.rect.y + L.rect.h)
    expect(L.rect.x).toBeGreaterThanOrEqual(0)
    expect(L.rect.x + L.rect.w).toBeLessThanOrEqual(390)
  })
})

describe('CelebrationEngine timeline', () => {
  it('plays the story in order: fireworks → heart → face → message → finale', () => {
    const { engine, events } = makeEngine()
    run(engine, FACE_T0 + 18)
    const first = (type, key) => events.find((e) => e.type === type && (!key || e.key === key))
    expect(events.some((e) => e.type === 'launch')).toBe(true)
    expect(events.some((e) => e.type === 'explode')).toBe(true)
    const order = [
      first('heart-gather'),
      first('heart-form'),
      first('heart-fill'),
      first('text', 'heartLine'),
      first('face-start'),
      first('text', 'line1'),
      first('text', 'line2'),
      first('text', 'name'),
      first('text', 'signature'),
      first('finale'),
    ]
    order.forEach((e) => expect(e).toBeTruthy())
    for (let i = 1; i < order.length; i++) expect(order[i].t).toBeGreaterThanOrEqual(order[i - 1].t)
    expect(first('heart-gather').t).toBeGreaterThanOrEqual(HEART_T0)
  })

  it('without a photo it falls back to a constellation, never a fabricated face', () => {
    const { engine, events } = makeEngine({ portraitSource: null })
    expect(engine.sculpture.fallback).toBe(true)
    run(engine, FACE_T0 + 1)
    expect(events.find((e) => e.type === 'face-start').fallback).toBe(true)
  })

  it('replay resets the show to the beginning', () => {
    const { engine } = makeEngine()
    run(engine, 20)
    engine.replay()
    expect(engine.t).toBe(0)
    expect(engine.heart).toBeNull()
    expect(engine.face).toBeNull()
    expect(engine.sparks.length).toBe(0)
  })

  it('reduced motion: no rockets, still heart → face → message', () => {
    const { engine, events } = makeEngine({ reducedMotion: true })
    run(engine, 16)
    expect(events.some((e) => e.type === 'launch')).toBe(false)
    expect(events.some((e) => e.type === 'heart-gather')).toBe(true)
    expect(events.some((e) => e.type === 'face-start')).toBe(true)
    expect(events.some((e) => e.type === 'text' && e.key === 'signature')).toBe(true)
  })

  it('explode events keep their event type and report the shell separately (for sound sync)', () => {
    const { engine, events } = makeEngine()
    engine.burst('willow', 200, 200)
    const e = events.find((ev) => ev.type === 'explode')
    expect(e).toBeTruthy()
    expect(e.shell).toBe('willow')
  })

  it('falls back to the canvas-2D portrait when WebGL is unavailable', () => {
    const { engine, events } = makeEngine({ glCanvas: document.createElement('canvas') })
    expect(engine.glFace).toBeNull()
    run(engine, FACE_T0 + 8)
    expect(events.some((e) => e.type === 'face-settled')).toBe(true)
  })

  it('caps particles to the quality budget', () => {
    const { engine } = makeEngine()
    for (let i = 0; i < 40; i++) engine.burst('grand', 100, 100)
    expect(engine.sparks.length).toBeLessThanOrEqual(engine.q.maxParticles)
  })
})
