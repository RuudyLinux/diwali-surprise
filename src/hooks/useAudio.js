import { useRef, useState, useCallback, useEffect } from 'react'
import {
  playCurtainSwoosh,
  playPageTurn,
  playDiyaLight,
  playFireworkPop,
  playVoiceNoteMelody
} from '../utils/audioSynthesis'

/**
 * Synthesise a looping ambient festive drone (Diwali raga drone)
 * using Web Audio API — no external audio files required.
 */
function buildAmbientOscillators(ctx) {
  const nodes = []
  // Harmonics of D / A (Indian classical festive tanpura frequencies)
  const freqs = [146.83, 220.00, 293.66, 440.00]
  for (const freq of freqs) {
    const osc  = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq + (Math.random() * 1.5 - 0.75)
    gain.gain.value = 0.035
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    nodes.push({ osc, gain })
  }
  return nodes
}

export function useAudio() {
  const ctxRef   = useRef(null)
  const droneRef = useRef([])
  const [musicOn, setMusicOn] = useState(false)
  const [sfxOn,   setSfxOn]   = useState(true)
  const [ready,   setReady]   = useState(false)

  // Lazily create AudioContext on user interaction
  const ensureCtx = useCallback(() => {
    if (ctxRef.current) return ctxRef.current
    if (typeof window === 'undefined') return null
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return null
    const ctx = new AC()
    ctxRef.current = ctx
    setReady(true)
    return ctx
  }, [])

  // ── SFX: firework pop ──
  const playPop = useCallback(() => {
    if (!sfxOn) return
    const ctx = ensureCtx()
    if (!ctx) return
    playFireworkPop(ctx)
  }, [sfxOn, ensureCtx])

  // ── SFX: curtain swoosh ──
  const playSwoosh = useCallback(() => {
    if (!sfxOn) return
    const ctx = ensureCtx()
    if (!ctx) return
    playCurtainSwoosh(ctx)
  }, [sfxOn, ensureCtx])

  // ── SFX: page turn rustle ──
  const playTurn = useCallback(() => {
    if (!sfxOn) return
    const ctx = ensureCtx()
    if (!ctx) return
    playPageTurn(ctx)
  }, [sfxOn, ensureCtx])

  // ── SFX: diya light chime ──
  const playDiya = useCallback(() => {
    if (!sfxOn) return
    const ctx = ensureCtx()
    if (!ctx) return
    playDiyaLight(ctx)
  }, [sfxOn, ensureCtx])

  // ── SFX: voice note melody ──
  const playVoiceNote = useCallback((onProgress, onFinish) => {
    const ctx = ensureCtx()
    if (!ctx) {
      onFinish?.()
      return () => {}
    }
    return playVoiceNoteMelody(ctx, onProgress, onFinish)
  }, [ensureCtx])

  // ── Music ──
  const startMusic = useCallback(() => {
    const ctx = ensureCtx()
    if (!ctx) return
    if (ctx.state === 'suspended') ctx.resume()
    if (droneRef.current.length > 0) return
    droneRef.current = buildAmbientOscillators(ctx)
    setMusicOn(true)
  }, [ensureCtx])

  const stopMusic = useCallback(() => {
    for (const { osc, gain } of droneRef.current) {
      try { gain.gain.linearRampToValueAtTime(0, ctxRef.current.currentTime + 0.4) }
      catch {}
      try { osc.stop(ctxRef.current.currentTime + 0.5) }
      catch {}
    }
    droneRef.current = []
    setMusicOn(false)
  }, [])

  const toggleMusic = useCallback(() => {
    musicOn ? stopMusic() : startMusic()
  }, [musicOn, startMusic, stopMusic])

  const toggleSfx = useCallback(() => setSfxOn(v => !v), [])

  useEffect(() => () => {
    stopMusic()
    try { ctxRef.current?.close() } catch {}
  }, [stopMusic])

  return {
    musicOn,
    sfxOn,
    ready,
    playPop,
    playSwoosh,
    playTurn,
    playDiya,
    playVoiceNote,
    toggleMusic,
    toggleSfx,
    ensureCtx,
  }
}
