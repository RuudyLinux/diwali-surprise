/**
 * ─────────────────────────────────────────────────────────────────────────────
 * SKY CELEBRATION ENGINE
 * Canvas particle show: fireworks → golden heart → her face in golden dots.
 *
 * Two stacked canvases:
 *   fx   — fireworks, rockets, smoke, heart, travelling dots. Faded (not cleared)
 *          every frame, so everything leaves natural light trails.
 *   main — crisp layer: star field, dark halo behind the portrait, settled
 *          portrait dots. Cleared every frame so the face never smears.
 *
 * The engine owns a scripted timeline (cues) and emits events (launch, explode,
 * heart-*, face-*, text, finale) so audio and captions stay in sync with the
 * actual animation rather than with wall-clock guesses.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { computeDots, drawColorDots, makeColorDotSprite, makeGlowSprite, textToCanvas, PORTRAIT_ASPECT } from './portraitDots'

const TAU = Math.PI * 2
const rand = (a, b) => a + Math.random() * (b - a)
const pick = (arr) => arr[(Math.random() * arr.length) | 0]
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v)
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const easeOut = (t) => 1 - Math.pow(1 - t, 3)
const smooth = (a, b, v) => {
  const t = clamp01((v - a) / (b - a))
  return t * t * (3 - 2 * t)
}

export const COLORS = {
  gold: [255, 194, 80],
  pale: [255, 236, 168],
  white: [255, 250, 238],
  champagne: [247, 226, 188],
  amber: [255, 162, 62],
  roseGold: [240, 168, 148],
}

export const QUALITY_PRESETS = {
  high: { dpr: 2, maxParticles: 4200, burstScale: 1, portraitCols: 128 },
  medium: { dpr: 1.5, maxParticles: 2600, burstScale: 0.72, portraitCols: 104 },
  low: { dpr: 1, maxParticles: 1400, burstScale: 0.48, portraitCols: 82 },
}
const DOWNGRADE = { high: 'medium', medium: 'low' }

export function detectQuality() {
  if (typeof window === 'undefined') return 'medium'
  const cores = navigator.hardwareConcurrency || 4
  const mem = navigator.deviceMemory || 4
  const small = Math.min(window.innerWidth, window.innerHeight) < 600
  if (cores <= 4 || mem <= 2) return small ? 'low' : 'medium'
  return small ? 'medium' : 'high'
}

/** Classic parametric heart, normalised to roughly x ∈ [-1, 1], y ∈ [-0.9, 0.9]. t = 0 is the top dip. */
export function heartPoint(t) {
  const s = Math.sin(t)
  const f = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)
  return { x: s * s * s, y: -f / 16 - 0.155 }
}

function pointInPoly(x, y, pts) {
  let inside = false
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const a = pts[i]
    const b = pts[j]
    if (a.y > y !== b.y > y && x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x) inside = !inside
  }
  return inside
}
const HEART_POLY = Array.from({ length: 180 }, (_, i) => heartPoint((i / 180) * TAU))

/**
 * Where everything goes on screen. Wide screens: portrait left, words right.
 * Tall screens: portrait on top, words underneath. Never overlapping.
 */
export function computeLayout(w, h, aspect = PORTRAIT_ASPECT) {
  const side = w / h > 1.2 && w >= 760
  let rect
  let text
  if (side) {
    const areaW = w * 0.56
    const areaH = h * 0.86
    let ph = areaH
    let pw = ph * aspect
    if (pw > areaW * 0.9) {
      pw = areaW * 0.9
      ph = pw / aspect
    }
    rect = { x: w * 0.03 + (areaW - pw) / 2, y: (h - ph) / 2, w: pw, h: ph }
    text = { mode: 'side', left: w * 0.58, top: h * 0.1, width: w * 0.37, height: h * 0.8 }
  } else {
    const areaH = h * 0.58
    const areaW = w * 0.92
    let ph = areaH
    let pw = ph * aspect
    if (pw > areaW) {
      pw = areaW
      ph = pw / aspect
    }
    rect = { x: (w - pw) / 2, y: h * 0.04 + (areaH - ph) / 2, w: pw, h: ph }
    const top = rect.y + ph + h * 0.02
    text = { mode: 'stack', left: w * 0.05, top, width: w * 0.9, height: h - top - h * 0.02 }
  }
  const hs = Math.min(w * 0.34, h * 0.27)
  const heart = { cx: w / 2, cy: h * 0.42, size: hs, textTop: h * 0.42 + hs * 1.05 + 14 }
  return { w, h, rect, text, heart }
}

function makeSmokeSprite(size = 128) {
  if (typeof document === 'undefined') return null
  const c = document.createElement('canvas')
  c.width = c.height = size
  const g = c.getContext('2d')
  if (!g || typeof g.createRadialGradient !== 'function') return null
  const h = size / 2
  const grad = g.createRadialGradient(h, h, 0, h, h, h)
  grad.addColorStop(0, 'rgba(150,135,170,0.5)')
  grad.addColorStop(0.5, 'rgba(110,95,135,0.2)')
  grad.addColorStop(1, 'rgba(90,80,110,0)')
  g.fillStyle = grad
  g.fillRect(0, 0, size, size)
  return c
}

// Portrait dot look: brighter photo areas → larger, brighter golden lights
export const DOT_ALPHA = (b) => 0.45 + 0.55 * b
export const DOT_RADIUS = (cell, b) => cell * (0.18 + 0.4 * Math.sqrt(b))

// Fireworks show choreography (seconds from start)
export const HEART_T0 = 16.2
export const FACE_T0 = 26.6

export class CelebrationEngine {
  constructor({ fxCanvas, mainCanvas, portraitSource = null, portraitStyle = 'color', herName = '', reducedMotion = false, quality, onEvent } = {}) {
    this.portraitStyle = portraitStyle
    this.fx = fxCanvas
    this.main = mainCanvas
    this.fxCtx = fxCanvas?.getContext?.('2d') || null
    this.mainCtx = mainCanvas?.getContext?.('2d') || null
    const usable = (c) => c && typeof c.drawImage === 'function' && typeof c.fillRect === 'function' && typeof c.setTransform === 'function'
    this.canRender = !!(usable(this.fxCtx) && usable(this.mainCtx))
    this.onEvent = onEvent || (() => {})
    this.reduced = !!reducedMotion
    this.qualityName = quality || detectQuality()
    this.q = { ...QUALITY_PRESETS[this.qualityName] }
    this.portraitSource = portraitSource
    this.herName = herName
    this.sprites = {}
    for (const k of Object.keys(COLORS)) this.sprites[k] = makeGlowSprite(COLORS[k])
    this.smokeSprite = makeSmokeSprite()
    this.running = false
    this.raf = 0
    this.lastTs = 0
    this.frameAcc = 0
    this.frameN = 0
    this._frame = this._frame.bind(this)
    this._prepareSculpture()
    this.resize()
    this.reset()
  }

  // ── setup ────────────────────────────────────────────────────────────────
  _prepareSculpture() {
    let res = null
    if (this.portraitSource) {
      const color = this.portraitStyle !== 'gold'
      // true-colour mode keeps every cell (no brightness cut-off) → slightly coarser grid for the same cost
      res = computeDots(this.portraitSource, { cols: color ? Math.round(this.q.portraitCols * 0.86) : this.q.portraitCols, color })
    }
    if (res && res.dots.length >= 60) {
      this.sculpture = { ...res, fallback: false }
      return
    }
    // No photo → never invent a face. Her name written in stars instead.
    const canvas = textToCanvas(this.herName || 'You')
    const t = canvas ? computeDots(canvas, { cols: 150, threshold: 0.3, detail: 0, vignette: false, gamma: 1 }) : null
    this.sculpture = { ...(t || { dots: [], aspect: 1000 / 320, cols: 150 }), fallback: true }
    this.constellation = Array.from({ length: 11 }, (_, i) => ({
      x: 0.06 + (i / 10) * 0.88 + rand(-0.03, 0.03),
      y: i % 2 ? rand(-0.35, -0.15) : rand(1.15, 1.35),
      r: rand(1.2, 2),
    }))
  }

  resize() {
    if (typeof window === 'undefined') return
    const w = window.innerWidth
    const h = window.innerHeight
    const dpr = Math.min(window.devicePixelRatio || 1, this.q.dpr)
    this.w = w
    this.h = h
    this.dpr = dpr
    for (const c of [this.fx, this.main]) {
      if (!c) continue
      c.width = Math.round(w * dpr)
      c.height = Math.round(h * dpr)
    }
    this.scale = Math.max(0.5, Math.min(1.35, Math.min(w, h) / 760))
    this.layout = computeLayout(w, h, this.sculpture.aspect)
    this.needsFullPaint = true
    this.faceCache = null
    this._seedStars()
  }

  _seedStars() {
    const { w, h } = this
    const r = this.layout.rect
    const inRect = (x, y) => x > r.x - 20 && x < r.x + r.w + 20 && y > r.y - 20 && y < r.y + r.h + 20
    const count = Math.round((w * h) / 9000)
    this.stars = Array.from({ length: count }, () => ({
      x: rand(0, w),
      y: rand(0, h * 0.95),
      r: rand(0.3, 1.1),
      a: rand(0.15, 0.6),
      ph: rand(0, TAU),
      sp: rand(0.5, 2),
    }))
    this.portraitStars = []
    let guard = 0
    while (this.portraitStars.length < 60 && guard++ < 2000) {
      const x = rand(0, w)
      const y = rand(0, h * 0.9)
      if (inRect(x, y)) continue
      this.portraitStars.push({ x, y, r: rand(1, 2.4), ph: rand(0, TAU), sp: rand(1, 3) })
    }
  }

  reset() {
    this.t = 0
    this.sparks = []
    this.rockets = []
    this.smoke = []
    this.flashes = []
    this.heart = null
    this.face = null
    this.faceSettled = false
    this.bgActive = false
    this.bgNext = Infinity
    this.cues = this._buildTimeline()
    this.cueIndex = 0
    this.needsFullPaint = true
    this.faceCache = null
    if (this.canRender) {
      for (const c of [this.fxCtx, this.mainCtx]) {
        c.setTransform(1, 0, 0, 1, 0, 0)
        c.clearRect(0, 0, c.canvas.width, c.canvas.height)
      }
    }
  }

  start() {
    if (this.running) return
    this.running = true
    this.lastTs = 0
    this.raf = requestAnimationFrame(this._frame)
  }

  replay() {
    this.reset()
    this.emit('replay')
  }

  destroy() {
    this.running = false
    cancelAnimationFrame(this.raf)
    this.sparks = this.rockets = this.smoke = this.flashes = []
    this.heart = this.face = null
  }

  emit(type, data = {}) {
    try {
      this.onEvent({ type, ...data })
    } catch {
      /* listener errors must not stop the show */
    }
  }

  getLayout() {
    return this.layout
  }

  // ── timeline ─────────────────────────────────────────────────────────────
  _buildTimeline() {
    const cues = []
    const at = (time, run) => cues.push({ at: time, run })
    const text = (time, key, visible = true) => at(time, () => this.emit('text', { key, visible }))

    if (this.reduced) {
      at(0, () => this.emit('phase', { name: 'sky' }))
      at(0.6, () => this._startHeart())
      text(1.8, 'heartLine')
      text(5.2, 'heartLine', false)
      at(6, () => this._startFace())
      text(8.4, 'line1')
      text(10.6, 'line2')
      text(12.4, 'name')
      text(14, 'signature')
      at(14.5, () => this.emit('finale'))
      return cues
    }

    at(0, () => this.emit('phase', { name: 'sky' }))
    // 1 · a few distant fireworks
    ;[
      [0.9, 0.22, 0.34],
      [1.7, 0.78, 0.3],
      [2.4, 0.56, 0.24],
      [3.1, 0.34, 0.3],
      [3.6, 0.88, 0.38],
    ].forEach(([tt, x, y]) => at(tt, () => this.fire(pick(['chrysanthemum', 'champagne', 'white']), x, y, { distant: true })))
    // 2 · golden comets rising
    ;[0.15, 0.85, 0.4, 0.62, 0.28, 0.74].forEach((x, i) => at(4.1 + i * 0.38, () => this.comet(x)))
    at(6.2, () => this.emit('phase', { name: 'fireworks' }))
    // 3 · big golden show + 4 · sparkling background fill
    ;[
      [6.6, 'chrysanthemum', 0.3, 0.3],
      [7.2, 'chrysanthemum', 0.7, 0.26],
      [7.9, 'willow', 0.5, 0.2],
      [8.5, 'champagne', 0.18, 0.35],
      [8.9, 'roseGold', 0.82, 0.32],
      [9.4, 'glitter', 0.4, 0.22],
      [9.8, 'white', 0.62, 0.3],
      [10.3, 'chrysanthemum', 0.25, 0.18],
      [10.6, 'willow', 0.75, 0.2],
      [11.1, 'white', 0.1, 0.3],
      [11.2, 'white', 0.9, 0.28],
      [11.6, 'glitter', 0.5, 0.3],
      [12.0, 'roseGold', 0.35, 0.38],
      [12.4, 'champagne', 0.65, 0.36],
      [12.9, 'chrysanthemum', 0.14, 0.22],
      [13.1, 'chrysanthemum', 0.86, 0.22],
    ].forEach(([tt, type, x, y]) => at(tt, () => this.fire(type, x, y)))
    ;[12.6, 13.0, 13.4, 13.8].forEach((tt) => at(tt, () => this.fire('mini', rand(0.08, 0.92), rand(0.12, 0.4), { distant: true })))
    // 5 · the central spectacular explosion that prepares the heart
    at(13.9, () => {
      this.emit('phase', { name: 'grand' })
      this.fire('grand', 0.5, 0.36, { size: 1.35 })
    })
    // Heart
    at(HEART_T0, () => this._startHeart())
    text(HEART_T0 + 4.6, 'heartLine')
    ;[5.6, 6.3, 7.0, 7.7, 8.4].forEach((d, i) =>
      at(HEART_T0 + d, () => {
        const L = this.layout.heart
        const a = (i / 5) * TAU + rand(-0.3, 0.3)
        this.burst(pick(['mini', 'white']), L.cx + Math.cos(a) * L.size * 1.45, L.cy + Math.sin(a) * L.size * 1.25, { size: 0.55 }, true)
      })
    )
    text(HEART_T0 + 9.2, 'heartLine', false)
    // Face
    at(FACE_T0, () => this._startFace())
    at(FACE_T0 + 4.6, () => {
      this.bgActive = true
      this.bgNext = this.t + 1.5
    })
    text(FACE_T0 + 5.8, 'line1')
    text(FACE_T0 + 9.6, 'line2')
    text(FACE_T0 + 12.6, 'name')
    text(FACE_T0 + 15, 'signature')
    at(FACE_T0 + 16, () => {
      this.emit('finale')
      for (let i = 0; i < 4; i++) setTimeout(() => this.running && this._backgroundFirework(), i * 450)
    })
    return cues
  }

  // ── fireworks ────────────────────────────────────────────────────────────
  fire(type, nx, ny, { distant = false, size = 1, faint = false } = {}) {
    if (this.reduced) return
    const { w, h } = this
    const sx = nx * w + rand(-40, 40)
    const sy = h + 10
    const tx = nx * w
    const ty = ny * h
    const G = 300 * this.scale
    const vy = -Math.sqrt(2 * G * Math.max(60, sy - ty))
    const T = -vy / G
    this.rockets.push({ x: sx, y: sy, vx: (tx - sx) / T, vy, G, ty, type, size, distant, faint, comet: false })
    this.emit('launch', { pan: this._pan(sx), distant, comet: false })
  }

  comet(nx) {
    if (this.reduced) return
    const { w, h } = this
    const G = 220 * this.scale
    const sx = nx * w
    const ty = h * rand(0.06, 0.2)
    const vy = -Math.sqrt(2 * G * (h - ty))
    this.rockets.push({ x: sx, y: h + 10, vx: rand(-25, 25), vy, G, ty, type: 'comet', size: 1, distant: false, comet: true })
    this.emit('launch', { pan: this._pan(sx), distant: false, comet: true })
  }

  _pan(x) {
    return ((x / this.w) * 2 - 1) * 0.75
  }

  _addSpark(p) {
    if (this.sparks.length >= this.q.maxParticles) return
    this.sparks.push(p)
  }

  /** Sphere-projected shell: dense centre, natural 3D look. */
  _shell(x, y, n, o) {
    for (let i = 0; i < n; i++) {
      let vx
      let vy
      if (o.ring) {
        const a = (i / n) * TAU + rand(-0.04, 0.04)
        const sp = o.speed * rand(0.92, 1.04)
        vx = Math.cos(a) * sp
        vy = Math.sin(a) * sp
      } else {
        const u = rand(-1, 1)
        const th = rand(0, TAU)
        const r = Math.sqrt(1 - u * u) * o.speed * rand(0.9, 1.05)
        vx = Math.cos(th) * r
        vy = Math.sin(th) * r
      }
      const life = rand(o.life[0], o.life[1])
      this._addSpark({
        x,
        y,
        vx,
        vy,
        life,
        max: life,
        col: typeof o.col === 'function' ? o.col() : o.col,
        fadeTo: o.fadeTo,
        size: o.size * rand(0.8, 1.2),
        drag: o.drag,
        g: o.g,
        flicker: !!o.flicker,
        glitter: o.glitter || 0,
      })
    }
  }

  burst(type, x, y, { size = 1, distant = false } = {}, silent = false) {
    const s = this.scale * size * (distant ? 0.5 : 1)
    const n = this.q.burstScale * (distant ? 0.45 : 1) * Math.min(1.3, size)
    const N = (k) => Math.max(8, Math.round(k * n))
    switch (type) {
      case 'chrysanthemum':
        this._shell(x, y, N(150), { speed: 270 * s, life: [1.5, 2.2], col: 'gold', drag: 0.966, g: 70 * s, size: 2.3 })
        this._shell(x, y, N(40), { speed: 110 * s, life: [0.8, 1.2], col: 'pale', drag: 0.96, g: 50 * s, size: 1.8 })
        break
      case 'willow':
        this._shell(x, y, N(120), { speed: 210 * s, life: [3, 4.2], col: 'gold', fadeTo: 'amber', drag: 0.976, g: 40 * s, size: 1.9, glitter: 0.03 })
        break
      case 'white':
        this._shell(x, y, N(110), { speed: 240 * s, life: [1, 1.5], col: 'white', drag: 0.958, g: 60 * s, size: 1.6, flicker: true })
        break
      case 'champagne':
        this._shell(x, y, N(130), { speed: 250 * s, life: [1.5, 2.2], col: 'champagne', drag: 0.966, g: 65 * s, size: 2.1, ring: Math.random() < 0.4 })
        break
      case 'roseGold':
        this._shell(x, y, N(110), { speed: 230 * s, life: [1.4, 2], col: 'roseGold', drag: 0.964, g: 62 * s, size: 2.1 })
        this._shell(x, y, N(36), { speed: 90 * s, life: [0.8, 1.1], col: 'gold', drag: 0.96, g: 40 * s, size: 1.6 })
        break
      case 'glitter':
        this._shell(x, y, N(80), { speed: 210 * s, life: [1.9, 2.7], col: 'gold', drag: 0.968, g: 55 * s, size: 1.8, glitter: 0.22 })
        break
      case 'grand':
        this._shell(x, y, N(260), { speed: 360 * s, life: [2.2, 2.9], col: 'gold', drag: 0.968, g: 55 * s, size: 2.6 })
        this._shell(x, y, N(150), { speed: 240 * s, life: [1.8, 2.4], col: 'pale', drag: 0.964, g: 50 * s, size: 2.1, ring: true })
        this._shell(x, y, N(110), { speed: 150 * s, life: [1.3, 1.8], col: 'white', drag: 0.96, g: 45 * s, size: 1.6, flicker: true })
        this._shell(x, y, N(90), { speed: 300 * s, life: [3.4, 4.4], col: 'gold', fadeTo: 'amber', drag: 0.978, g: 38 * s, size: 1.8, glitter: 0.12 })
        break
      case 'mini':
      default:
        this._shell(x, y, N(46), { speed: 130 * s, life: [0.8, 1.2], col: () => pick(['gold', 'pale', 'champagne']), drag: 0.955, g: 45 * s, size: 1.6 })
    }
    // flash + smoke
    this.flashes.push({ x, y, r: (type === 'grand' ? 420 : 220) * s, life: 0.35, max: 0.35 })
    if (!distant && this.smokeSprite) {
      for (let i = 0; i < 3; i++) {
        this.smoke.push({ x: x + rand(-30, 30) * s, y: y + rand(-20, 30) * s, r: rand(50, 90) * s, vr: rand(14, 26) * s, vx: rand(-8, 8), vy: rand(-4, 6), life: 4.5, max: 4.5 })
      }
    }
    if (!silent) {
      this.emit('explode', { x, y, shell: type, size: type === 'grand' ? 1.5 : distant ? 0.45 : size, distance: distant ? 0.8 : 0.15, pan: this._pan(x) })
    } else {
      this.emit('explode', { x, y, shell: 'mini', size: 0.3, distance: 0.6, pan: this._pan(x) })
    }
  }

  _backgroundFirework() {
    const L = this.layout
    const r = L.rect
    let nx
    let ny
    if (L.text.mode === 'side') {
      if (Math.random() < 0.5 && r.x / L.w > 0.1) {
        nx = rand(0.02, r.x / L.w - 0.04)
        ny = rand(0.08, 0.45)
      } else {
        nx = rand(0.62, 0.96)
        ny = rand(0.06, 0.16)
      }
    } else {
      nx = Math.random() < 0.5 ? rand(0.04, 0.16) : rand(0.84, 0.96)
      ny = rand(0.05, 0.26)
    }
    this.fire(pick(['chrysanthemum', 'champagne', 'willow', 'roseGold', 'white', 'glitter']), nx, ny, { size: 0.6, faint: true })
  }

  // ── heart ────────────────────────────────────────────────────────────────
  _startHeart() {
    this.emit('phase', { name: 'heart' })
    this.emit('heart-gather')
    const hq = Math.max(0.55, this.q.burstScale)
    const nOut = Math.round(380 * hq)
    const nFill = Math.round(560 * hq)
    const { cx, cy } = this.layout.heart
    const R = Math.min(this.w, this.h) * 0.45
    const parts = []
    for (let i = 0; i < nOut; i++) {
      const a = rand(0, TAU)
      const d = Math.sqrt(Math.random()) * R
      const t = ((i + 0.5) / nOut) * TAU - Math.PI
      parts.push({
        kind: 'o',
        t,
        sx: cx + Math.cos(a) * d,
        sy: cy + Math.sin(a) * d,
        gDelay: rand(0, 0.5),
        fDelay: (Math.abs(t) / Math.PI) * 0.25 + rand(0, 0.15),
        dur: rand(1.9, 2.4),
        size: rand(1.7, 2.7),
        col: Math.random() < 0.35 ? 'pale' : 'gold',
        fallAt: Math.random() < 0.12 ? rand(6.4, 9.2) : Infinity,
        drift: rand(-20, 20),
        ph: rand(0, TAU),
        x: cx,
        y: cy,
      })
    }
    let guard = 0
    while (parts.length < nOut + nFill && guard++ < nFill * 6) {
      const hx = rand(-1, 1)
      const hy = rand(-0.9, 0.95)
      if (!pointInPoly(hx, hy, HEART_POLY)) continue
      parts.push({
        kind: 'f',
        hx,
        hy,
        d: Math.min(1, Math.hypot(hx, hy - 0.05)),
        size: rand(1.1, 1.9),
        col: pick(['pale', 'gold', 'champagne']),
        fallAt: Math.random() < 0.08 ? rand(6.8, 9.4) : Infinity,
        drift: rand(-20, 20),
        ph: rand(0, TAU),
        x: cx,
        y: cy,
      })
    }
    this.heart = { t0: this.t, parts, formedSent: false, filledSent: false }
  }

  _heartScale(ht) {
    if (ht < 5.2) return 1
    const beat = (ht * 1.1) % 1
    const p = Math.exp(-(((beat - 0.1) / 0.06) ** 2)) + 0.6 * Math.exp(-(((beat - 0.3) / 0.06) ** 2))
    return 1 + 0.035 * p
  }

  _updateDrawHeart(ctx) {
    const H = this.heart
    if (!H) return
    const ht = this.t - H.t0
    const L = this.layout.heart
    const fadeOut = this.reduced ? 1 - smooth(4.5, 6, ht) : 1 - smooth(9.6, 11.2, ht)
    if (fadeOut <= 0) {
      this.heart = null
      return
    }
    if (!this.reduced) {
      if (ht > 1.3 && !H.formedSent) {
        H.formedSent = true
        this.emit('heart-form')
      }
      if (ht > 4.1 && !H.filledSent) {
        H.filledSent = true
        this.emit('heart-fill')
        this.flashes.push({ x: L.cx, y: L.cy, r: L.size * 2.6, life: 0.6, max: 0.6 })
      }
    }
    const sc = this._heartScale(ht)
    const map = (p) => ({ x: L.cx + p.x * L.size * sc, y: L.cy + p.y * L.size * sc })
    const dip = map(heartPoint(0))
    const reducedIn = smooth(0, 1.5, ht)

    // soft bloom inside the heart once formed
    if (ctx && (this.reduced || ht > 4.1)) {
      const glow = (this.reduced ? reducedIn : smooth(4.1, 5, ht)) * fadeOut * (0.22 + 0.1 * (sc - 1) * 28)
      this._sprite(ctx, 'gold', L.cx, L.cy, L.size * 3.4, glow * 0.6)
    }

    for (const p of H.parts) {
      let x
      let y
      let a = 1
      if (p.kind === 'o') {
        if (this.reduced) {
          ;({ x, y } = map(heartPoint(p.t)))
          a = reducedIn
        } else if (ht < 1.3) {
          const e = easeInOut(clamp01((ht - p.gDelay) / (1.3 - p.gDelay)))
          x = p.sx + (dip.x - p.sx) * e
          y = p.sy + (dip.y - p.sy) * e
          a = 0.35 + 0.65 * e
        } else {
          const local = clamp01((ht - 1.3 - p.fDelay) / p.dur)
          ;({ x, y } = map(heartPoint(p.t * easeInOut(local))))
        }
      } else {
        if (this.reduced) {
          x = L.cx + p.hx * L.size * sc
          y = L.cy + p.hy * L.size * sc
          a = reducedIn * 0.8
        } else {
          const local = clamp01((ht - 4.1 - p.d * 0.8) / 0.55)
          if (local <= 0) continue
          const e = easeOut(local)
          x = L.cx + p.hx * L.size * sc * e
          y = L.cy + p.hy * L.size * sc * e
          a = local * 0.8
        }
      }
      // twinkle + a few sparks drifting away under gravity
      a *= 0.82 + 0.18 * Math.sin(p.ph + this.t * 6)
      if (!this.reduced && ht > p.fallAt) {
        const ft = ht - p.fallAt
        x += p.drift * ft
        y += 0.5 * 110 * this.scale * ft * ft
        a *= 1 - clamp01(ft / 2.2)
      }
      p.x = x
      p.y = y
      if (ctx) this._sprite(ctx, p.col, x, y, p.size * 5 * this.scale, a * fadeOut)
    }
  }

  // ── face ─────────────────────────────────────────────────────────────────
  _startFace() {
    this.emit('phase', { name: 'face' })
    this.emit('face-start', { fallback: this.sculpture.fallback })
    const heartPts = this.heart ? this.heart.parts : []
    const { w, h } = this
    this.face = this.sculpture.dots.map((d) => {
      let sx
      let sy
      if (heartPts.length && Math.random() < 0.3) {
        const hp = heartPts[(Math.random() * heartPts.length) | 0]
        sx = hp.x / w
        sy = hp.y / h
      } else {
        sx = rand(-0.05, 1.05)
        sy = rand(-0.05, 0.95)
      }
      return {
        nx: d.x,
        ny: d.y,
        b: d.b,
        sx,
        sy,
        delay: rand(0, 1.5) + (1 - d.b) * 0.7,
        dur: rand(1.9, 2.7),
        curve: rand(-0.18, 0.18),
        ph: rand(0, TAU),
        tw: rand(0.6, 1.6),
        col: d.b > 0.66 ? 'pale' : d.b > 0.33 ? 'gold' : 'amber',
        rgb: d.c || null,
        a: d.a ?? 1,
      }
    })
    this.faceT0 = this.t
    this.faceSettled = false
  }

  _drawFace(fxCtx, mainCtx) {
    if (!this.face) return
    const ft = this.t - this.faceT0
    const L = this.layout
    const r = L.rect
    const breathe = 1 + 0.004 * Math.sin(this.t * 0.8)
    const rw = r.w * breathe
    const rh = r.h * breathe
    const rx = r.x + (r.w - rw) / 2
    const ry = r.y + (r.h - rh) / 2
    const cell = rw / this.sculpture.cols
    const fallback = this.sculpture.fallback

    if (mainCtx) {
      // dark halo so background fireworks never wash over her face
      const va = 0.78 * smooth(0, 2.5, ft)
      if (va > 0.01 && typeof mainCtx.createRadialGradient === 'function') {
        const cx = r.x + r.w / 2
        const cy = r.y + r.h / 2
        const R = Math.max(r.w, r.h) * 0.72
        const g = mainCtx.createRadialGradient(cx, cy, R * 0.25, cx, cy, R)
        g.addColorStop(0, `rgba(6,3,14,${va})`)
        g.addColorStop(1, 'rgba(6,3,14,0)')
        mainCtx.globalCompositeOperation = 'source-over'
        mainCtx.globalAlpha = 1
        mainCtx.fillStyle = g
        mainCtx.fillRect(cx - R, cy - R, R * 2, R * 2)
      }
      mainCtx.globalCompositeOperation = 'lighter'
      const settledGlow = smooth(3.5, 6, ft)
      if (settledGlow > 0) {
        this._sprite(mainCtx, 'gold', r.x + r.w / 2, r.y + r.h * 0.45, Math.max(r.w, r.h) * 1.5, settledGlow * (this.sculpture.color ? 0.4 : 1) * (0.1 + 0.03 * Math.sin(this.t * 1.3)))
      }
    }

    // Once settled, the portrait is one cached bitmap (cheap) plus a sprinkle of
    // individually twinkling lights. Positions never change → identity is stable.
    let usedCache = false
    if (this.faceSettled && mainCtx && !this.reduced) {
      if (!this.faceCache) this.faceCache = this._buildFaceCache()
      if (this.faceCache) {
        const pad = this.faceCache.pad
        const k = rw / r.w
        const box = [rx - pad * k, ry - pad * k, (r.w + pad * 2) * k, (r.h + pad * 2) * k]
        mainCtx.globalAlpha = 1
        if (this.faceCache.glow) {
          // true colours: exact dots, then a soft blurred bloom so she glows like light
          mainCtx.globalCompositeOperation = 'source-over'
          mainCtx.drawImage(this.faceCache.canvas, ...box)
          mainCtx.globalCompositeOperation = 'lighter'
          mainCtx.globalAlpha = 0.16 + 0.03 * Math.sin(this.t * 1.1)
          mainCtx.drawImage(this.faceCache.glow, ...box)
          mainCtx.globalAlpha = 1
        } else {
          mainCtx.globalCompositeOperation = 'lighter'
          mainCtx.drawImage(this.faceCache.canvas, ...box)
        }
        mainCtx.globalCompositeOperation = 'lighter'
        for (const p of this.twinklers) {
          const a = 0.32 * Math.pow(Math.max(0, Math.sin(this.t * p.tw * 1.6 + p.ph)), 8)
          if (a > 0.02) this._sprite(mainCtx, 'pale', rx + p.nx * rw, ry + p.ny * rh, cell * 2.6, a)
        }
        usedCache = true
      }
    }

    let allSettled = true
    for (const p of usedCache ? [] : this.face) {
      const tx = rx + p.nx * rw
      const ty = ry + p.ny * rh
      if (this.reduced) {
        if (mainCtx) this._faceDot(mainCtx, p, tx, ty, cell, 1, smooth(0, 2.2, ft) * (0.9 + 0.1 * Math.sin(this.t * p.tw + p.ph)))
        continue
      }
      const local = clamp01((ft - p.delay) / p.dur)
      if (local < 1) {
        allSettled = false
        const sx = p.sx * this.w
        const sy = p.sy * this.h
        if (local <= 0) {
          // waiting stars scattered across the sky
          if (fxCtx) this._faceDot(fxCtx, p, sx, sy, cell, 0.9, 0.25 * smooth(0, 0.8, ft))
          continue
        }
        const e = easeInOut(local)
        const dx = tx - sx
        const dy = ty - sy
        const bend = p.curve * Math.sin(Math.PI * e)
        const x = sx + dx * e - dy * bend
        const y = sy + dy * e + dx * bend
        if (fxCtx) this._faceDot(fxCtx, p, x, y, cell, 1 + (1 - e) * 0.55, 0.3 + 0.7 * e)
      } else if (mainCtx) {
        this._faceDot(mainCtx, p, tx, ty, cell, 1, 0.88 + 0.12 * Math.sin(this.t * p.tw + p.ph))
      }
    }

    if (this.reduced && ft > 2.2) allSettled = true
    if (allSettled && !this.faceSettled) {
      this.faceSettled = true
      this.emit('face-settled', { fallback })
    }

    if (mainCtx && fallback && this.constellation) {
      // her name in stars, framed by a delicate constellation
      const ca = smooth(2, 5, ft)
      if (ca > 0 && typeof mainCtx.beginPath === 'function') {
        mainCtx.globalCompositeOperation = 'lighter'
        mainCtx.strokeStyle = `rgba(255,214,140,${0.22 * ca})`
        mainCtx.lineWidth = 0.8
        mainCtx.beginPath()
        this.constellation.forEach((s, i) => {
          const x = r.x + s.x * r.w
          const y = r.y + s.y * r.h
          if (i === 0) mainCtx.moveTo(x, y)
          else mainCtx.lineTo(x, y)
        })
        mainCtx.stroke()
        for (const s of this.constellation) {
          this._sprite(mainCtx, 'pale', r.x + s.x * r.w, r.y + s.y * r.h, 18 * s.r * this.scale, ca * (0.7 + 0.3 * Math.sin(this.t * 2 + s.x * 9)))
        }
      }
    }
  }

  _buildFaceCache() {
    if (typeof document === 'undefined') return null
    const r = this.layout.rect
    const cell = r.w / this.sculpture.cols
    const pad = Math.ceil(cell * 3)
    const dpr = this.dpr
    const c = document.createElement('canvas')
    c.width = Math.max(1, Math.round((r.w + pad * 2) * dpr))
    c.height = Math.max(1, Math.round((r.h + pad * 2) * dpr))
    const g = c.getContext('2d')
    if (!g || typeof g.drawImage !== 'function') return null
    g.setTransform(dpr, 0, 0, dpr, 0, 0)
    this.twinklers = this.face.filter((p) => p.b > 0.35 && Math.random() < (this.sculpture.color ? 0.015 : 0.035))
    if (this.sculpture.color) {
      drawColorDots(g, this.sculpture.dots, pad, pad, r.w, r.h, cell)
      const glow = document.createElement('canvas')
      glow.width = c.width
      glow.height = c.height
      const gg = glow.getContext('2d')
      if (gg && typeof gg.drawImage === 'function') {
        gg.filter = `blur(${Math.max(2, cell * 1.4 * dpr)}px)`
        gg.drawImage(c, 0, 0)
      }
      return { canvas: c, glow, pad }
    }
    g.globalCompositeOperation = 'lighter'
    for (const p of this.face) {
      this._sprite(g, p.col, pad + p.nx * r.w, pad + p.ny * r.h, DOT_RADIUS(cell, p.b) * 3.6, DOT_ALPHA(p.b) * 0.95)
    }
    return { canvas: c, pad }
  }

  /** One portrait dot: true-colour sprite, or golden sprite sized by brightness. */
  _faceDot(ctx, p, x, y, cell, sizeMul, a) {
    if (p.rgb) {
      const sp = this._colorSprite(p.rgb)
      if (!sp) return
      const d = cell * 2.3 * sizeMul
      const al = a * p.a
      if (al <= 0.004) return
      // normal blending: additive 'lighter' would shift her real colours
      const prev = ctx.globalCompositeOperation
      ctx.globalCompositeOperation = 'source-over'
      ctx.globalAlpha = al > 1 ? 1 : al
      ctx.drawImage(sp, x - d / 2, y - d / 2, d, d)
      ctx.globalCompositeOperation = prev
      return
    }
    this._sprite(ctx, p.col, x, y, DOT_RADIUS(cell, p.b) * 3.6 * sizeMul, a * DOT_ALPHA(p.b))
  }

  /** Colour sprites quantised to 16 levels per channel, created lazily and reused. */
  _colorSprite(rgb) {
    const q = (v) => Math.min(15, Math.max(0, v) >> 4)
    const key = (q(rgb[0]) << 8) | (q(rgb[1]) << 4) | q(rgb[2])
    if (!this.colorSprites) this.colorSprites = new Map()
    let sp = this.colorSprites.get(key)
    if (sp === undefined) {
      sp = makeColorDotSprite([q(rgb[0]) * 16 + 8, q(rgb[1]) * 16 + 8, q(rgb[2]) * 16 + 8])
      this.colorSprites.set(key, sp)
    }
    return sp
  }

  // ── frame loop ───────────────────────────────────────────────────────────
  _frame(ts) {
    if (!this.running) return
    const now = typeof ts === 'number' ? ts : typeof performance !== 'undefined' ? performance.now() : Date.now()
    const real = this.lastTs ? Math.max(0, (now - this.lastTs) / 1000) : 1 / 60
    this.lastTs = now
    // Story clock follows real time (so captions & sound stay on schedule even on
    // slow frames); physics steps are capped for stability.
    const story = Math.min(real, 0.25)
    const dt = Math.min(real, 0.05)
    this.update(dt, story)
    this.render(dt)
    this._adapt(real)
    this.raf = requestAnimationFrame(this._frame)
  }

  /** Advance simulation & timeline by dt seconds (separate from rendering for tests). */
  update(dt, story = dt) {
    this.t += story
    while (this.cueIndex < this.cues.length && this.cues[this.cueIndex].at <= this.t) {
      this.cues[this.cueIndex++].run()
    }
    if (this.bgActive && this.t >= this.bgNext) {
      this._backgroundFirework()
      this.bgNext = this.t + rand(2.4, 4.2)
    }

    // rockets & comets
    for (let i = this.rockets.length - 1; i >= 0; i--) {
      const r = this.rockets[i]
      r.px = r.x
      r.py = r.y
      r.vy += r.G * dt
      r.x += r.vx * dt
      r.y += r.vy * dt
      const emberCount = r.comet ? 3 : r.distant || r.faint ? (Math.random() < 0.5 ? 1 : 0) : 2
      for (let k = 0; k < emberCount; k++) {
        const life = rand(0.25, r.comet ? 1.1 : 0.6)
        this._addSpark({ x: r.x + rand(-1.5, 1.5), y: r.y + rand(0, 4), vx: rand(-14, 14), vy: rand(10, 50), life, max: life, col: r.comet ? 'gold' : 'amber', size: r.distant ? 0.9 : 1.3, drag: 0.94, g: 30, flicker: Math.random() < 0.3, glitter: 0 })
      }
      if (r.y <= r.ty || r.vy >= -18) {
        this.rockets.splice(i, 1)
        if (r.comet) this._shell(r.x, r.y, 14, { speed: 50 * this.scale, life: [0.5, 0.9], col: 'pale', drag: 0.95, g: 30, size: 1.4, flicker: true })
        else this.burst(r.type, r.x, r.y, { size: r.size, distant: r.distant })
      }
    }

    // sparks
    const sparks = this.sparks
    for (let i = sparks.length - 1; i >= 0; i--) {
      const p = sparks[i]
      const dragF = Math.pow(p.drag, dt * 60)
      p.vx *= dragF
      p.vy = p.vy * dragF + p.g * dt
      p.x += p.vx * dt
      p.y += p.vy * dt
      p.life -= dt
      if (p.life <= 0) {
        sparks[i] = sparks[sparks.length - 1]
        sparks.pop()
        continue
      }
      if (p.glitter && Math.random() < p.glitter * dt * 60) {
        this._addSpark({ x: p.x, y: p.y, vx: rand(-20, 20), vy: rand(-10, 30), life: 0.35, max: 0.35, col: 'white', size: 1, drag: 0.9, g: 40, flicker: true, glitter: 0 })
      }
    }
    for (let i = this.smoke.length - 1; i >= 0; i--) {
      const s = this.smoke[i]
      s.life -= dt
      s.r += s.vr * dt
      s.x += s.vx * dt
      s.y += s.vy * dt
      if (s.life <= 0) this.smoke.splice(i, 1)
    }
    for (let i = this.flashes.length - 1; i >= 0; i--) {
      this.flashes[i].life -= dt
      if (this.flashes[i].life <= 0) this.flashes.splice(i, 1)
    }
  }

  /** Sky gradient: warm dusk melting into deep night over the first seconds. */
  _skyFill() {
    const ctx = this.fxCtx
    const dusk = this.reduced ? 0 : 1 - smooth(0.3, 4.8, this.t)
    const key = dusk > 0 ? Math.round(dusk * 60) : -1
    if (this._skyKey === key && this._skyH === this.h && this._sky) return this._sky
    const night = [[3, 2, 8], [11, 6, 24], [26, 13, 42], [42, 18, 56]]
    const warm = [[22, 12, 42], [74, 33, 82], [156, 63, 87], [217, 115, 58]]
    const g = ctx.createLinearGradient(0, 0, 0, this.h)
    ;[0, 0.45, 0.8, 1].forEach((stop, i) => {
      const c = night[i].map((v, k) => Math.round(v + (warm[i][k] - v) * dusk))
      g.addColorStop(stop, `rgb(${c[0]},${c[1]},${c[2]})`)
    })
    this._sky = g
    this._skyKey = key
    this._skyH = this.h
    return g
  }

  _sprite(ctx, key, x, y, d, a) {
    const sp = this.sprites[key]
    if (!sp || a <= 0.004) return
    ctx.globalAlpha = a > 1 ? 1 : a
    ctx.drawImage(sp, x - d / 2, y - d / 2, d, d)
  }

  render(dt = 1 / 60) {
    if (!this.canRender) {
      // Still advance sculpture logic so events fire in non-rendering envs
      this._updateDrawHeart(null)
      this._drawFace(null, null)
      return
    }
    const { w, h, dpr } = this
    const fx = this.fxCtx
    const m = this.mainCtx

    // fx layer: fade the previous frame toward the sky itself → clean light trails
    // (fading toward an opaque sky avoids the grey residue an alpha-erase leaves)
    fx.setTransform(dpr, 0, 0, dpr, 0, 0)
    fx.globalCompositeOperation = 'source-over'
    fx.globalAlpha = this.needsFullPaint ? 1 : 1 - Math.pow(0.78, dt * 60)
    this.needsFullPaint = false
    fx.fillStyle = this._skyFill()
    fx.fillRect(0, 0, w, h)

    if (this.smokeSprite && this.smoke.length) {
      fx.globalCompositeOperation = 'source-over'
      for (const s of this.smoke) {
        fx.globalAlpha = 0.014 * (s.life / s.max)
        fx.drawImage(this.smokeSprite, s.x - s.r, s.y - s.r, s.r * 2, s.r * 2)
      }
    }

    fx.globalCompositeOperation = 'lighter'
    for (const f of this.flashes) this._sprite(fx, 'pale', f.x, f.y, f.r, 0.28 * (f.life / f.max))
    for (const r of this.rockets) this._sprite(fx, r.comet ? 'pale' : 'gold', r.x, r.y, (r.distant || r.faint ? 7 : 12) * this.scale, r.faint ? 0.6 : 1)
    for (const p of this.sparks) {
      const life = p.life / p.max
      let a = life < 0.3 ? life / 0.3 : 1
      if (p.flicker) a *= Math.random() < 0.5 ? 1 : 0.25
      const key = p.fadeTo && life < 0.55 ? p.fadeTo : p.col
      this._sprite(fx, key, p.x, p.y, p.size * 4.6 * this.scale * (0.6 + 0.4 * life), a)
    }
    this._updateDrawHeart(fx)

    // main layer: stars, portrait halo, settled portrait
    m.setTransform(dpr, 0, 0, dpr, 0, 0)
    m.globalCompositeOperation = 'source-over'
    m.globalAlpha = 1
    m.clearRect(0, 0, w, h)
    m.globalCompositeOperation = 'lighter'
    for (const s of this.stars) {
      this._sprite(m, 'white', s.x, s.y, s.r * 6, s.a * (0.6 + 0.4 * Math.sin(this.t * s.sp + s.ph)))
    }
    this._drawFace(fx, m)
    if (this.face) {
      const sa = smooth(2.5, 5, this.t - this.faceT0)
      if (sa > 0) {
        m.globalCompositeOperation = 'lighter'
        for (const s of this.portraitStars) {
          this._sprite(m, 'pale', s.x, s.y, s.r * 7, sa * (0.45 + 0.55 * Math.abs(Math.sin(this.t * s.sp + s.ph))))
        }
      }
    }
    fx.globalAlpha = 1
    m.globalAlpha = 1
  }

  /** Adaptive quality: if frames get slow, lighten the load once per step. */
  _adapt(dt) {
    this.frameAcc += dt
    this.frameN++
    if (this.frameN < 90) return
    const avg = this.frameAcc / this.frameN
    this.frameAcc = 0
    this.frameN = 0
    const next = DOWNGRADE[this.qualityName]
    if (avg > 1 / 36 && next) {
      this.qualityName = next
      const p = QUALITY_PRESETS[next]
      this.q = { ...this.q, dpr: p.dpr, maxParticles: p.maxParticles, burstScale: p.burstScale }
      this.resize()
    }
  }
}
