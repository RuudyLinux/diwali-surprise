/**
 * Web Audio API synthesizer for the Diwali experience.
 * 100% self-contained, no external audio files required.
 */

// Safe helper to create or retrieve an AudioContext
export function getAudioContext() {
  const AC = typeof window !== 'undefined' ? (window.AudioContext || window.webkitAudioContext) : null
  if (!AC) return null
  return new AC()
}

/**
 * Theatrical curtain opening swoosh + golden orchestral chime
 */
export function playCurtainSwoosh(ctx) {
  if (!ctx) return
  try {
    if (ctx.state === 'suspended') ctx.resume()
    const now = ctx.currentTime

    // Velvet friction swoosh (filtered noise sweep)
    const bufLen = Math.floor(ctx.sampleRate * 1.2)
    const buffer = ctx.createBuffer(1, bufLen, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufLen; i++) {
      const progress = i / bufLen
      const envelope = Math.sin(progress * Math.PI) * (1 - progress * 0.4)
      data[i] = (Math.random() * 2 - 1) * envelope
    }
    const noiseSource = ctx.createBufferSource()
    noiseSource.buffer = buffer

    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(200, now)
    filter.frequency.exponentialRampToValueAtTime(1400, now + 0.5)
    filter.frequency.exponentialRampToValueAtTime(250, now + 1.2)

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.01, now)
    gain.gain.linearRampToValueAtTime(0.35, now + 0.3)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2)

    noiseSource.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)
    noiseSource.start(now)

    // Golden fanfare chimes (triumphant brass / bells chords)
    const chord = [392.0, 523.25, 659.25, 783.99, 1046.5] // G4, C5, E5, G5, C6
    chord.forEach((freq, idx) => {
      const osc = ctx.createOscillator()
      const oscGain = ctx.createGain()
      const startTime = now + 0.35 + idx * 0.08
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(freq, startTime)

      oscGain.gain.setValueAtTime(0.001, startTime)
      oscGain.gain.linearRampToValueAtTime(0.12 / (idx + 1), startTime + 0.04)
      oscGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.4)

      osc.connect(oscGain)
      oscGain.connect(ctx.destination)
      osc.start(startTime)
      osc.stop(startTime + 1.5)
    })
  } catch (err) {
    // Gracefully ignore audio errors in restricted environments
  }
}

/**
 * Tactile scrapbook page turn rustle
 */
export function playPageTurn(ctx) {
  if (!ctx) return
  try {
    if (ctx.state === 'suspended') ctx.resume()
    const now = ctx.currentTime
    const bufLen = Math.floor(ctx.sampleRate * 0.3)
    const buffer = ctx.createBuffer(1, bufLen, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufLen; i++) {
      const p = i / bufLen
      data[i] = (Math.random() * 2 - 1) * Math.sin(p * Math.PI) * Math.exp(-p * 4)
    }

    const src = ctx.createBufferSource()
    src.buffer = buffer

    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(1800, now)
    filter.Q.setValueAtTime(1.8, now)

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.25, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3)

    src.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)
    src.start(now)
  } catch {}
}

/**
 * Sacred diya lighting chime
 */
export function playDiyaLight(ctx) {
  if (!ctx) return
  try {
    if (ctx.state === 'suspended') ctx.resume()
    const now = ctx.currentTime
    const freqs = [528, 660, 792, 1056] // Solfeggio / harmonious tones
    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator()
      const g = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(f, now + i * 0.05)
      g.gain.setValueAtTime(0.001, now + i * 0.05)
      g.gain.linearRampToValueAtTime(0.15 / (i + 1), now + i * 0.05 + 0.03)
      g.gain.exponentialRampToValueAtTime(0.0001, now + 1.6)

      osc.connect(g)
      g.connect(ctx.destination)
      osc.start(now + i * 0.05)
      osc.stop(now + 1.7)
    })
  } catch {}
}

/**
 * Firework pop / cracker sound
 */
export function playFireworkPop(ctx) {
  if (!ctx) return
  try {
    if (ctx.state === 'suspended') ctx.resume()
    const now = ctx.currentTime
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.35, now)
    gain.gain.linearRampToValueAtTime(0, now + 0.35)
    gain.connect(ctx.destination)

    const bufLen = Math.floor(ctx.sampleRate * 0.35)
    const buffer = ctx.createBuffer(1, bufLen, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufLen; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufLen, 2)
    const src = ctx.createBufferSource()
    src.buffer = buffer
    src.connect(gain)
    src.start(now)

    const osc = ctx.createOscillator()
    const og = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = 750 + Math.random() * 350
    og.gain.setValueAtTime(0.18, now)
    og.gain.linearRampToValueAtTime(0, now + 0.2)
    osc.connect(og)
    og.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.2)
  } catch {}
}

/**
 * Festive melody synthesizer for the chat voice note.
 * Plays Raag Bhupali / festive flute chime sequence with callbacks.
 */
export function playVoiceNoteMelody(ctx, onProgress, onFinish) {
  if (!ctx) {
    onFinish?.()
    return () => {}
  }

  let active = true
  try {
    if (ctx.state === 'suspended') ctx.resume()
    const now = ctx.currentTime

    // Notes: C4, D4, E4, G4, A4, C5, D5, E5 (Raag Bhupali)
    const melody = [
      { note: 523.25, dur: 0.4 }, // C5
      { note: 587.33, dur: 0.3 }, // D5
      { note: 659.25, dur: 0.5 }, // E5
      { note: 587.33, dur: 0.3 }, // D5
      { note: 523.25, dur: 0.4 }, // C5
      { note: 440.00, dur: 0.4 }, // A4
      { note: 392.00, dur: 0.6 }, // G4
      { note: 440.00, dur: 0.3 }, // A4
      { note: 523.25, dur: 0.5 }, // C5
      { note: 659.25, dur: 0.4 }, // E5
      { note: 783.99, dur: 0.6 }, // G5
      { note: 659.25, dur: 0.4 }, // E5
      { note: 587.33, dur: 0.4 }, // D5
      { note: 523.25, dur: 0.8 }, // C5 (resolving flourish)
    ]

    let timeOffset = 0
    const totalDuration = melody.reduce((acc, n) => acc + n.dur, 0)
    const scheduledNodes = []

    melody.forEach((item) => {
      const noteTime = now + timeOffset
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      // Warm sitar / flute overtone mixture
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(item.note, noteTime)

      gain.gain.setValueAtTime(0.001, noteTime)
      gain.gain.linearRampToValueAtTime(0.18, noteTime + 0.04)
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + item.dur * 0.95)

      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(noteTime)
      osc.stop(noteTime + item.dur)

      scheduledNodes.push({ osc, gain })
      timeOffset += item.dur
    })

    // Progress interval
    const startTs = Date.now()
    const timer = setInterval(() => {
      if (!active) {
        clearInterval(timer)
        return
      }
      const elapsed = (Date.now() - startTs) / 1000
      const progress = Math.min(1, elapsed / totalDuration)
      onProgress?.(progress, elapsed, totalDuration)
      if (progress >= 1) {
        clearInterval(timer)
        onFinish?.()
      }
    }, 100)

    return () => {
      active = false
      clearInterval(timer)
      scheduledNodes.forEach(({ osc, gain }) => {
        try {
          gain.gain.setValueAtTime(0, ctx.currentTime)
          osc.stop()
        } catch {}
      })
    }
  } catch (e) {
    onFinish?.()
    return () => {}
  }
}

