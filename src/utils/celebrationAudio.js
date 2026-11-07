/**
 * ─────────────────────────────────────────────────────────────────────────────
 * CELEBRATION AUDIO — fully synthesised with the Web Audio API.
 * No audio files, no copyrighted music. Created only after the user clicks
 * "Light a Diya for Us" (browsers block audio before a gesture anyway).
 *
 * Signal path:  voices → (panner) → master ─┬→ compressor → speakers
 *                          └→ reverb send ──┘
 * Every public method is wrapped so a missing Web Audio feature can never
 * break the visual experience.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const rand = (a, b) => a + Math.random() * (b - a)
const PENTA = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.51, 1567.98, 1760]

export class CelebrationAudio {
  constructor() {
    this.ctx = null
    this.volume = 0.8
    this.muted = false
    this.ambience = null
    this.activeCrackles = 0
  }

  /** Create / resume the AudioContext. Must be called from a user gesture. */
  init() {
    try {
      if (this.ctx) {
        if (this.ctx.state === 'suspended') this.ctx.resume?.()
        return true
      }
      const AC = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)
      if (!AC) return false
      const ctx = new AC()
      this.ctx = ctx
      this.master = ctx.createGain()
      this.master.gain.value = this.muted ? 0 : this.volume
      if (typeof ctx.createDynamicsCompressor === 'function') {
        const comp = ctx.createDynamicsCompressor()
        comp.threshold.value = -16
        comp.knee.value = 20
        comp.ratio.value = 4
        comp.attack.value = 0.004
        comp.release.value = 0.25
        this.master.connect(comp)
        comp.connect(ctx.destination)
      } else {
        this.master.connect(ctx.destination)
      }
      if (typeof ctx.createConvolver === 'function') {
        this.reverb = ctx.createConvolver()
        this.reverb.buffer = this._impulse(3.2, 2.6)
        this.reverbReturn = ctx.createGain()
        this.reverbReturn.gain.value = 0.55
        this.reverb.connect(this.reverbReturn)
        this.reverbReturn.connect(this.master)
      }
      this.noise = this._noiseBuffer(2.5)
      return true
    } catch {
      return false
    }
  }

  get ready() {
    return !!this.ctx
  }

  setVolume(v) {
    this.volume = Math.max(0, Math.min(1, v))
    this._applyGain()
  }

  setMuted(m) {
    this.muted = !!m
    this._applyGain()
  }

  _applyGain() {
    try {
      if (!this.master) return
      const target = this.muted ? 0 : this.volume
      this.master.gain.setTargetAtTime(target, this.ctx.currentTime, 0.08)
    } catch {
      /* noop */
    }
  }

  // ── building blocks ──────────────────────────────────────────────────────
  _noiseBuffer(seconds) {
    const ctx = this.ctx
    const len = Math.floor(ctx.sampleRate * seconds)
    const buf = ctx.createBuffer(1, len, ctx.sampleRate)
    const d = buf.getChannelData(0)
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
    return buf
  }

  _impulse(seconds, decay) {
    const ctx = this.ctx
    const len = Math.floor(ctx.sampleRate * seconds)
    const buf = ctx.createBuffer(2, len, ctx.sampleRate)
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch)
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, decay)
    }
    return buf
  }

  _filter(type, freq, q = 0.7) {
    const f = this.ctx.createBiquadFilter()
    f.type = type
    f.frequency.value = freq
    f.Q.value = q
    return f
  }

  /** Route a node to the master (optionally panned) with a reverb send. */
  _out(node, { pan = 0, wet = 0.2 } = {}) {
    const ctx = this.ctx
    let tail = node
    if (pan && typeof ctx.createStereoPanner === 'function') {
      const p = ctx.createStereoPanner()
      p.pan.value = Math.max(-1, Math.min(1, pan))
      node.connect(p)
      tail = p
    }
    tail.connect(this.master)
    if (this.reverb && wet > 0) {
      const send = ctx.createGain()
      send.gain.value = wet
      tail.connect(send)
      send.connect(this.reverb)
    }
  }

  _env(gainNode, t0, attack, peak, decay) {
    const g = gainNode.gain
    g.setValueAtTime(0.0001, t0)
    g.linearRampToValueAtTime(peak, t0 + attack)
    g.exponentialRampToValueAtTime(0.0001, t0 + attack + decay)
  }

  _noise(t0, dur, loop = false) {
    const src = this.ctx.createBufferSource()
    src.buffer = this.noise
    src.loop = loop
    src.start(t0, rand(0, 1.5))
    src.stop(t0 + dur + 0.05)
    return src
  }

  _tone(type, freq, t0, attack, peak, decay, opts = {}) {
    const o = this.ctx.createOscillator()
    o.type = type
    o.frequency.setValueAtTime(freq, t0)
    if (opts.glideTo) o.frequency.exponentialRampToValueAtTime(opts.glideTo, t0 + (opts.glideTime || decay))
    const g = this.ctx.createGain()
    this._env(g, t0, attack, peak, decay)
    o.connect(g)
    this._out(g, opts)
    o.start(t0)
    o.stop(t0 + attack + decay + 0.1)
  }

  _bell(freq, t0, peak = 0.06, decay = 2.2, pan = 0) {
    this._tone('sine', freq, t0, 0.004, peak, decay, { pan, wet: 0.7 })
    this._tone('sine', freq * 2.76, t0, 0.002, peak * 0.25, decay * 0.4, { pan, wet: 0.7 })
  }

  _safe(fn) {
    try {
      if (!this.ctx) return
      fn(this.ctx.currentTime)
    } catch {
      /* never let audio break the show */
    }
  }

  // ── sound effects ────────────────────────────────────────────────────────
  /** Match strike + warm "fwoomp" as the diya catches. */
  ignite() {
    this._safe((now) => {
      for (const off of [0, 0.07]) {
        const s = this._noise(now + off, 0.14)
        const f = this._filter('bandpass', rand(2400, 3200), 1.4)
        const g = this.ctx.createGain()
        this._env(g, now + off, 0.004, 0.32, 0.12)
        s.connect(f).connect(g)
        this._out(g, { wet: 0.15 })
      }
      const s = this._noise(now + 0.12, 1.6)
      const f = this._filter('lowpass', 180, 0.9)
      f.frequency.setValueAtTime(180, now + 0.12)
      f.frequency.exponentialRampToValueAtTime(1500, now + 0.75)
      f.frequency.exponentialRampToValueAtTime(400, now + 1.7)
      const g = this.ctx.createGain()
      this._env(g, now + 0.12, 0.3, 0.3, 1.3)
      s.connect(f).connect(g)
      this._out(g, { wet: 0.35 })
      this._tone('sine', 220, now + 0.3, 1.2, 0.05, 2.6, { wet: 0.6 })
      this._tone('sine', 330, now + 0.5, 1.2, 0.035, 2.4, { wet: 0.6 })
    })
  }

  /** Soft cinematic pad + air that sits under everything. */
  startAmbience(level = 0.05) {
    this._safe((now) => {
      if (this.ambience) return
      const bus = this.ctx.createGain()
      bus.gain.setValueAtTime(0.0001, now)
      bus.gain.linearRampToValueAtTime(level, now + 5)
      const lp = this._filter('lowpass', 900, 0.5)
      lp.connect(bus)
      this._out(bus, { wet: 0.5 })
      const oscs = []
      ;[110, 164.81, 220, 277.18, 329.63].forEach((freq, i) => {
        const o = this.ctx.createOscillator()
        o.type = i % 2 ? 'triangle' : 'sine'
        o.frequency.value = freq
        o.detune.value = rand(-7, 7)
        const g = this.ctx.createGain()
        g.gain.value = i === 0 ? 0.5 : 0.28
        o.connect(g).connect(lp)
        o.start(now)
        oscs.push(o)
      })
      const lfo = this.ctx.createOscillator()
      const lfoGain = this.ctx.createGain()
      lfo.frequency.value = 0.07
      lfoGain.gain.value = 350
      lfo.connect(lfoGain).connect(lp.frequency)
      lfo.start(now)
      oscs.push(lfo)
      const air = this._noise(now, 600, true)
      const airF = this._filter('bandpass', 5200, 0.6)
      const airG = this.ctx.createGain()
      airG.gain.value = 0.05
      air.connect(airF).connect(airG).connect(bus)
      oscs.push(air)
      this.ambience = { bus, oscs }
    })
  }

  stopAmbience(fade = 1.6) {
    this._safe((now) => {
      const a = this.ambience
      if (!a) return
      this.ambience = null
      a.bus.gain.cancelScheduledValues(now)
      a.bus.gain.setValueAtTime(a.bus.gain.value, now)
      a.bus.gain.linearRampToValueAtTime(0.0001, now + fade)
      a.oscs.forEach((o) => {
        try {
          o.stop(now + fade + 0.1)
        } catch {
          /* already stopped */
        }
      })
    })
  }

  /** Rising whoosh (and sometimes a whistle) as a shell leaves the ground. */
  launch({ pan = 0, comet = false, distant = false } = {}) {
    this._safe((now) => {
      const dur = comet ? 1.8 : 1.25
      const s = this._noise(now, dur + 0.2)
      const f = this._filter('bandpass', 300, 2.2)
      f.frequency.setValueAtTime(320, now)
      f.frequency.exponentialRampToValueAtTime(comet ? 2600 : 1900, now + dur)
      const g = this.ctx.createGain()
      this._env(g, now, 0.12, distant ? 0.035 : comet ? 0.12 : 0.15, dur)
      s.connect(f).connect(g)
      this._out(g, { pan, wet: distant ? 0.6 : 0.2 })
      if (!distant && Math.random() < 0.35) {
        this._tone('sine', rand(800, 1000), now + 0.05, 0.1, 0.018, dur * 0.9, {
          glideTo: rand(1700, 2300),
          glideTime: dur,
          pan,
          wet: 0.3,
        })
      }
    })
  }

  /** Boom: noise body + sub thump + crack, distance = 0 (near) → 1 (far). */
  explode({ size = 1, pan = 0, distance = 0.2, type = 'chrysanthemum' } = {}) {
    this._safe((now) => {
      const t0 = now + 0.04 + distance * 0.28
      const near = 1 - distance * 0.7
      const body = this._noise(t0, 3)
      const lp = this._filter('lowpass', 1300 - distance * 750, 0.6)
      const g = this.ctx.createGain()
      this._env(g, t0, 0.006, 0.5 * Math.min(1.4, size) * near, 1 + size * 1.3)
      body.connect(lp).connect(g)
      this._out(g, { pan, wet: 0.25 + distance * 0.45 })
      this._tone('sine', 78, t0, 0.005, 0.55 * Math.min(1.4, size) * near, 0.7, { glideTo: 32, glideTime: 0.6, pan, wet: 0.1 })
      const crack = this._noise(t0, 0.08)
      const hp = this._filter('highpass', 2600, 0.7)
      const cg = this.ctx.createGain()
      this._env(cg, t0, 0.002, 0.22 * near, 0.07)
      crack.connect(hp).connect(cg)
      this._out(cg, { pan, wet: 0.2 })
      if (['glitter', 'white', 'willow', 'grand'].includes(type)) {
        this.crackle({ duration: type === 'willow' ? 2.6 : 1.8, pan, delay: t0 - now + 0.35, level: near })
      }
    })
  }

  /** Sizzling glitter crackle made of tiny filtered noise grains. */
  crackle({ duration = 1.8, pan = 0, delay = 0, level = 1 } = {}) {
    this._safe((now) => {
      if (this.activeCrackles >= 3) return
      this.activeCrackles++
      setTimeout(() => this.activeCrackles--, (delay + duration) * 1000)
      const n = Math.round(duration * 34)
      for (let i = 0; i < n; i++) {
        const t = now + delay + Math.pow(Math.random(), 0.8) * duration
        const s = this._noise(t, 0.04)
        const f = this._filter('highpass', rand(2500, 6000), 0.9)
        const g = this.ctx.createGain()
        this._env(g, t, 0.001, rand(0.015, 0.07) * level, rand(0.01, 0.035))
        s.connect(f).connect(g)
        this._out(g, { pan: pan + rand(-0.25, 0.25), wet: 0.15 })
      }
    })
  }

  /** Airy swell as sparks gather for the heart. */
  magicSwell() {
    this._safe((now) => {
      const s = this._noise(now, 2.4)
      const f = this._filter('bandpass', 1200, 3)
      f.frequency.setValueAtTime(900, now)
      f.frequency.exponentialRampToValueAtTime(6500, now + 2)
      const g = this.ctx.createGain()
      g.gain.setValueAtTime(0.0001, now)
      g.gain.linearRampToValueAtTime(0.09, now + 1.6)
      g.gain.exponentialRampToValueAtTime(0.0001, now + 2.3)
      s.connect(f).connect(g)
      this._out(g, { wet: 0.7 })
      ;[392, 523.25, 659.25].forEach((fr, i) => this._tone('sine', fr, now + i * 0.25, 1.2, 0.025, 2.5, { wet: 0.8 }))
    })
  }

  /** Bell arpeggio while the heart outline draws itself. */
  heartChime() {
    this._safe((now) => {
      ;[523.25, 659.25, 783.99, 987.77, 1046.5, 1318.51, 1567.98].forEach((fr, i) =>
        this._bell(fr, now + i * 0.32, 0.055, 2.6, i % 2 ? 0.3 : -0.3)
      )
      this._tone('triangle', 261.63, now, 1.5, 0.04, 4, { wet: 0.7 })
      this._tone('sine', 392, now + 0.4, 1.5, 0.03, 4, { wet: 0.7 })
    })
  }

  /** Glitter wash as the heart fills with light. */
  sparkleWash() {
    this._safe((now) => {
      for (let i = 0; i < 16; i++) this._bell(PENTA[(Math.random() * PENTA.length) | 0] * 2, now + Math.random() * 1.3, 0.018, 1.2, rand(-0.6, 0.6))
      this._tone('sine', 523.25, now, 0.6, 0.03, 3, { wet: 0.8 })
      this._tone('sine', 783.99, now + 0.1, 0.6, 0.025, 3, { wet: 0.8 })
    })
  }

  /** Shimmering stardust while her face assembles. */
  faceShimmer(duration = 5) {
    this._safe((now) => {
      const n = Math.round(duration * 9)
      for (let i = 0; i < n; i++) {
        const t = now + (i / n) * duration + rand(0, 0.2)
        const fr = PENTA[(Math.random() * PENTA.length) | 0] * (Math.random() < 0.4 ? 2 : 1)
        this._bell(fr, t, 0.014 + (i / n) * 0.016, 1.6, rand(-0.7, 0.7))
      }
      ;[220, 277.18, 329.63, 440].forEach((fr, i) =>
        this._tone('sine', fr, now + i * 0.2, duration * 0.8, 0.028, 4, { wet: 0.8 })
      )
    })
  }

  /** Gentle resolved chord when the portrait settles. */
  settleChord() {
    this._safe((now) => {
      ;[261.63, 329.63, 392, 493.88].forEach((fr, i) => this._tone('triangle', fr, now + i * 0.06, 1.2, 0.03, 4.5, { wet: 0.8 }))
      this._bell(1046.5, now + 0.3, 0.04, 3)
    })
  }

  /** Final celebration: warm chord swell + descending bells. */
  finale() {
    this._safe((now) => {
      ;[130.81, 196, 261.63, 329.63, 392, 523.25].forEach((fr, i) =>
        this._tone(i < 2 ? 'sine' : 'triangle', fr, now + i * 0.08, 1.6, i < 2 ? 0.05 : 0.032, 5.5, { wet: 0.75 })
      )
      ;[1567.98, 1318.51, 1046.5, 783.99, 659.25, 523.25].forEach((fr, i) => this._bell(fr, now + 0.6 + i * 0.22, 0.04, 3, i % 2 ? 0.4 : -0.4))
    })
  }

  destroy() {
    try {
      this.stopAmbience(0.2)
      const ctx = this.ctx
      this.ctx = null
      if (ctx) setTimeout(() => ctx.close?.(), 400)
    } catch {
      /* noop */
    }
  }
}
