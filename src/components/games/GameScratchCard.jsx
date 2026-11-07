import React, { useRef, useState, useEffect, useCallback } from 'react'

export default function GameScratchCard({ config, onComplete }) {
  const canvasRef = useRef(null)
  const isDrawing = useRef(false)
  const [msgIdx, setMsgIdx] = useState(0)
  const [isRevealed, setIsRevealed] = useState(false)
  const [scratchPercent, setScratchPercent] = useState(0)

  const messages = config?.messages || [
    "You're my favourite reason to smile.",
    'My world becomes brighter because of you.',
    'You are my favourite Diwali blessing.',
    'One lifetime, countless memories with you.',
  ]
  const currentMsg = messages[msgIdx]

  // Initialize Canvas Gold Foil Layer
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const width = canvas.width
    const height = canvas.height

    // Reset composite operation
    ctx.globalCompositeOperation = 'source-over'

    // Gold Foil Gradient
    const grad = ctx.createLinearGradient(0, 0, width, height)
    grad.addColorStop(0, '#E8C785')
    grad.addColorStop(0.3, '#D6AD62')
    grad.addColorStop(0.6, '#F3A52F')
    grad.addColorStop(1, '#D6AD62')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, width, height)

    // Festive Sparkles Pattern on Top
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)'
    for (let i = 0; i < 40; i++) {
      const x = Math.random() * width
      const y = Math.random() * height
      const r = Math.random() * 2.5 + 1
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fill()
    }

    // Text Overlay on Coating
    ctx.fillStyle = '#382A2B'
    ctx.font = 'bold 15px "Playfair Display", Georgia, serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('✨ Scratch to Reveal Your Surprise ✨', width / 2, height / 2)

    setIsRevealed(false)
    setScratchPercent(0)
  }, [])

  useEffect(() => {
    initCanvas()
  }, [initCanvas, msgIdx])

  // Calculate Scratched Area Percentage
  const checkScratchPercentage = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || isRevealed) return
    const ctx = canvas.getContext('2d')
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const pixels = imgData.data
    let transparent = 0

    // Sample every 4th pixel for high performance
    for (let i = 3; i < pixels.length; i += 16) {
      if (pixels[i] < 128) {
        transparent++
      }
    }

    const pct = Math.round((transparent / (pixels.length / 16)) * 100)
    setScratchPercent(pct)

    if (pct >= 40 && !isRevealed) {
      setIsRevealed(true)
      onComplete?.()
      // Cleanly clear remaining canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
  }, [isRevealed, onComplete])

  // Scratch Action (Brush)
  const scratchAt = useCallback(
    (clientX, clientY) => {
      const canvas = canvasRef.current
      if (!canvas || isRevealed) return
      const ctx = canvas.getContext('2d')
      const rect = canvas.getBoundingClientRect()
      const x = (clientX - rect.left) * (canvas.width / rect.width)
      const y = (clientY - rect.top) * (canvas.height / rect.height)

      ctx.globalCompositeOperation = 'destination-out'
      ctx.beginPath()
      ctx.arc(x, y, 22, 0, Math.PI * 2)
      ctx.fill()

      checkScratchPercentage()
    },
    [isRevealed, checkScratchPercentage]
  )

  // Mouse Handlers
  function onMouseDown(e) {
    isDrawing.current = true
    scratchAt(e.clientX, e.clientY)
  }
  function onMouseMove(e) {
    if (!isDrawing.current) return
    scratchAt(e.clientX, e.clientY)
  }
  function onMouseUp() {
    isDrawing.current = false
  }

  // Touch Handlers
  function onTouchStart(e) {
    isDrawing.current = true
    if (e.touches[0]) {
      scratchAt(e.touches[0].clientX, e.touches[0].clientY)
    }
  }
  function onTouchMove(e) {
    if (!isDrawing.current) return
    if (e.touches[0]) {
      scratchAt(e.touches[0].clientX, e.touches[0].clientY)
    }
  }
  function onTouchEnd() {
    isDrawing.current = false
  }

  function handleNextCard() {
    setMsgIdx((prev) => (prev + 1) % messages.length)
  }

  return (
    <div className="p-4 md:p-6 max-w-lg mx-auto text-center space-y-6">
      <div>
        <span className="text-xs uppercase tracking-widest text-[#D6AD62] font-semibold">
          Touch or Drag to Scratch
        </span>
        <h4 className="font-heading text-xl md:text-2xl font-bold text-[#382A2B] mt-1">
          {config?.title || 'A Little Surprise Just for You'}
        </h4>
        <p className="text-xs text-[#633B48] mt-1">
          {config?.instruction || 'Scratch here to reveal your surprise ✨'}
        </p>
      </div>

      {/* The Scratch Card Container */}
      <div className="relative w-full max-w-[340px] sm:max-w-[380px] h-[210px] sm:h-[230px] mx-auto rounded-3xl overflow-hidden border-2 border-[#D6AD62]/40 shadow-xl bg-gradient-to-b from-[#FFF8ED] to-[#FFFCF6]">
        {/* Hidden Message Underneath */}
        <div className="absolute inset-0 p-6 flex flex-col items-center justify-center text-center select-none space-y-2">
          <span className="text-3xl animate-bounce">💖</span>
          <p className="font-heading text-lg sm:text-xl md:text-2xl italic text-[#382A2B] leading-snug">
            &ldquo;{currentMsg}&rdquo;
          </p>
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#D6AD62] font-semibold pt-2">
            ✨ Unlocked with Love ✨
          </span>
        </div>

        {/* Scratch Canvas Foil */}
        <canvas
          ref={canvasRef}
          width={380}
          height={230}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          className={`absolute inset-0 w-full h-full cursor-crosshair transition-opacity duration-700 ${
            isRevealed ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
          style={{ touchAction: 'none' }}
        />
      </div>

      {/* Progress & Status */}
      <div className="space-y-3">
        <p className="text-xs text-[#633B48]">
          {isRevealed
            ? '🎉 100% Revealed!'
            : `Scratched: ${scratchPercent}% (Scratch ~40% to auto-unveil)`}
        </p>

        {isRevealed && (
          <button
            onClick={handleNextCard}
            className="btn-gold text-xs sm:text-sm font-semibold px-6 py-2.5 tracking-wide animate-fade-in"
          >
            🔄 New Scratch Card
          </button>
        )}
      </div>
    </div>
  )
}

