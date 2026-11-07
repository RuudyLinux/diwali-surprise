import React, { useState, useCallback, useRef, useEffect } from 'react'
import { useCard } from '../context/CardContext'

export default function ChatMessage({ onPlayVoiceNote }) {
  const { card, update } = useCard()
  const [isPlayingVoice, setIsPlayingVoice] = useState(false)
  const [voiceProgress, setVoiceProgress] = useState(0)
  const [voiceCurrentSec, setVoiceCurrentSec] = useState(0)
  const [reactions, setReactions] = useState({
    '🪔': 14,
    '🎆': 9,
    '💖': 22,
    '🍬': 11,
    '✨': 28,
  })
  const [floatingParticles, setFloatingParticles] = useState([])
  const [isEditing, setIsEditing] = useState(false)
  const stopVoiceRef = useRef(null)

  // Floating reaction particle burst
  const handleReact = useCallback((emoji) => {
    setReactions((prev) => ({
      ...prev,
      [emoji]: (prev[emoji] || 0) + 1,
    }))

    const newParticles = Array.from({ length: 6 }).map((_, i) => ({
      id: `${emoji}-${Date.now()}-${i}`,
      emoji,
      left: 30 + Math.random() * 40,
      animDuration: 1.2 + Math.random() * 0.8,
    }))

    setFloatingParticles((prev) => [...prev, ...newParticles])
    setTimeout(() => {
      setFloatingParticles((prev) =>
        prev.filter((p) => !newParticles.some((np) => np.id === p.id))
      )
    }, 2000)
  }, [])

  // Voice note play / pause
  const handleToggleVoice = useCallback(() => {
    if (isPlayingVoice) {
      stopVoiceRef.current?.()
      setIsPlayingVoice(false)
      setVoiceProgress(0)
      setVoiceCurrentSec(0)
      return
    }

    setIsPlayingVoice(true)
    const cleanup = onPlayVoiceNote?.(
      (prog, elapsed, total) => {
        setVoiceProgress(prog * 100)
        setVoiceCurrentSec(Math.floor(elapsed))
      },
      () => {
        setIsPlayingVoice(false)
        setVoiceProgress(0)
        setVoiceCurrentSec(0)
      }
    )
    stopVoiceRef.current = cleanup
  }, [isPlayingVoice, onPlayVoiceNote])

  useEffect(() => {
    return () => {
      stopVoiceRef.current?.()
    }
  }, [])

  return (
    <section
      data-testid="chat-message-section"
      className="relative py-16 px-4 md:px-8 max-w-4xl mx-auto z-10"
      aria-label="Diwali Chat Message"
    >
      {/* ── Section Title ── */}
      <div className="text-center space-y-3 mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-xs uppercase tracking-widest">
          <span>💬</span>
          <span>A Personal Message From Me</span>
          <span>💬</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-display font-light tracking-tight text-[#f7e8c0]">
          Words from the <span className="italic text-[#ff9500] font-normal">Heart</span>
        </h2>
        <p className="text-sm md:text-base max-w-md mx-auto text-[#f7e8c0]/70 font-body">
          A personal note written just for you, sealed with warmth and festival joy.
        </p>
      </div>

      {/* ── Festive Chat Window Container ── */}
      <div className="relative max-w-xl mx-auto rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-amber-500/30 bg-stone-950/90 backdrop-blur-md">
        {/* Chat Header */}
        <div className="bg-gradient-to-r from-stone-900 via-[#2a040b] to-stone-900 px-5 py-3.5 border-b border-amber-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center text-lg shadow-md border-2 border-amber-300">
                🪔
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-stone-900" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-amber-200">
                {card.senderName || 'Someone who loves you'}
              </h3>
              <p className="text-[11px] text-amber-300/70 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Active now · Lighting diyas 🪔</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsEditing((v) => !v)}
            data-testid="edit-message-toggle"
            className="text-xs text-amber-300 hover:text-white px-2.5 py-1 rounded-lg border border-amber-400/30 hover:bg-amber-400/10 transition-colors"
          >
            {isEditing ? 'Done' : 'Edit Text'}
          </button>
        </div>

        {/* Chat Thread Messages */}
        <div className="p-5 md:p-6 space-y-4 bg-gradient-to-b from-stone-950/70 via-stone-900/60 to-stone-950/90 min-h-[380px]">
          {/* Timestamp Header */}
          <div className="text-center">
            <span className="text-[10px] uppercase font-mono tracking-widest text-amber-300/40 bg-black/40 px-3 py-1 rounded-full border border-amber-500/10">
              Today · Auspicious Diwali Night
            </span>
          </div>

          {/* Bubble 1: Friendly Greeting */}
          <div className="flex flex-col items-end space-y-1">
            <div className="max-w-[85%] rounded-2xl rounded-tr-xs bg-gradient-to-r from-amber-600 to-orange-600 text-stone-950 p-3.5 shadow-md font-body text-sm leading-relaxed font-medium">
              <p>
                Hey {card.recipientName || 'dear one'}! 🪔 Happy Diwali! I wanted to make something special for you rather than just forwarding a random message.
              </p>
            </div>
            <span className="text-[10px] text-amber-200/40 pr-1">8:00 PM · Delivered</span>
          </div>

          {/* Bubble 2: Interactive Voice Note */}
          <div className="flex flex-col items-end space-y-1">
            <div
              data-testid="voice-note-bubble"
              className="max-w-[88%] rounded-2xl rounded-tr-xs bg-gradient-to-r from-amber-700/80 to-amber-900/90 text-amber-100 p-3.5 shadow-md border border-amber-400/30 flex items-center gap-3 w-full"
            >
              <button
                onClick={handleToggleVoice}
                data-testid="voice-note-play-btn"
                className="w-10 h-10 rounded-full bg-amber-400 hover:bg-amber-300 text-stone-950 flex items-center justify-center font-bold text-sm shadow-md transition-transform active:scale-95 shrink-0"
                aria-label={isPlayingVoice ? 'Pause voice note' : 'Play voice note'}
              >
                {isPlayingVoice ? '⏸' : '▶'}
              </button>

              <div className="flex-1 space-y-1.5 min-w-0">
                <div className="flex items-center justify-between text-xs font-medium text-amber-200">
                  <span className="truncate">🎵 Diwali Melodic Wish</span>
                  <span className="font-mono text-[10px] text-amber-300/70">
                    {isPlayingVoice
                      ? `0:${String(voiceCurrentSec).padStart(2, '0')}`
                      : '0:30'}
                  </span>
                </div>

                {/* Animated Waveform Visualization */}
                <div className="flex items-center gap-0.5 h-6">
                  {Array.from({ length: 24 }).map((_, i) => {
                    const barProgress = (i / 24) * 100
                    const isPlayed = barProgress <= voiceProgress
                    const heightPercent = 25 + Math.sin(i * 0.8) * 45 + ((i % 3) * 15)
                    return (
                      <span
                        key={i}
                        className={`flex-1 rounded-full transition-all duration-150 ${
                          isPlayed
                            ? 'bg-amber-300 shadow-[0_0_5px_rgba(255,215,0,0.8)]'
                            : 'bg-amber-700/50'
                        } ${isPlayingVoice ? 'animate-pulse' : ''}`}
                        style={{ height: `${Math.max(15, heightPercent)}%` }}
                      />
                    )
                  })}
                </div>
              </div>
            </div>
            <span className="text-[10px] text-amber-200/40 pr-1">8:01 PM · Tap to listen</span>
          </div>

          {/* Bubble 3: Core Personal Message */}
          <div className="flex flex-col items-end space-y-1">
            <div
              data-testid="core-chat-bubble"
              className="max-w-[90%] rounded-2xl rounded-tr-xs bg-gradient-to-br from-[#800010] to-[#4a0007] text-[#f7e8c0] p-4 shadow-xl border border-amber-400/40 space-y-2"
            >
              <p className="font-display text-base md:text-lg leading-relaxed italic">
                &ldquo;{card.message}&rdquo;
              </p>
              <div className="pt-1 text-right text-xs font-semibold text-amber-300">
                — with all my love, {card.senderName || 'Your friend'} ✨
              </div>
            </div>
            <span className="text-[10px] text-amber-200/40 pr-1">8:02 PM · Read</span>
          </div>

          {/* Optional inline message edit */}
          {isEditing && (
            <div className="bg-stone-900 border border-amber-400/30 rounded-2xl p-3.5 space-y-2 text-xs">
              <label className="block text-amber-200 uppercase font-semibold">
                Edit Your Message Live:
              </label>
              <textarea
                value={card.message}
                onChange={(e) => update({ message: e.target.value })}
                rows={3}
                className="w-full bg-stone-950 border border-amber-500/30 rounded-xl p-2.5 text-amber-100 outline-none focus:border-amber-400 resize-none font-body"
              />
            </div>
          )}

          {/* Bubble 4: Sweet sticker */}
          <div className="flex flex-col items-end space-y-1">
            <div className="bg-amber-500/15 border border-amber-400/30 rounded-2xl p-2.5 flex items-center gap-2 text-amber-200 text-xs">
              <span className="text-xl">🥮🍬</span>
              <span>Sending you boxes of fresh mithai &amp; smiles!</span>
            </div>
          </div>
        </div>

        {/* ── Interactive Emoji Reactions Bar ── */}
        <div className="bg-stone-900/90 px-4 py-3 border-t border-amber-500/20 flex items-center justify-between">
          <span className="text-xs text-amber-200/60 font-medium">Send Reaction:</span>
          <div className="flex items-center gap-1.5">
            {Object.entries(reactions).map(([emoji, count]) => (
              <button
                key={emoji}
                onClick={() => handleReact(emoji)}
                data-testid={`react-btn-${emoji}`}
                className="px-2.5 py-1 rounded-full bg-stone-800 hover:bg-amber-500/20 border border-amber-400/20 hover:border-amber-400/50 text-xs font-medium text-amber-200 transition-transform active:scale-125 flex items-center gap-1"
                title={`React with ${emoji}`}
              >
                <span>{emoji}</span>
                <span className="text-[10px] font-mono opacity-70">{count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Floating Confetti Particles Layer */}
        {floatingParticles.map((p) => (
          <span
            key={p.id}
            className="absolute bottom-12 pointer-events-none text-2xl animate-float-fade"
            style={{
              left: `${p.left}%`,
              animationDuration: `${p.animDuration}s`,
            }}
          >
            {p.emoji}
          </span>
        ))}
      </div>
    </section>
  )
}

