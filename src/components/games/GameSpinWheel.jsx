import React, { useState, useRef } from 'react'

export default function GameSpinWheel({ config, onComplete }) {
  const [isSpinning, setIsSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [selectedResult, setSelectedResult] = useState(null)

  const segments = config?.segments || []
  const numSegments = segments.length || 8
  const sliceAngle = 360 / numSegments

  function handleSpin() {
    if (isSpinning) return

    setIsSpinning(true)
    setSelectedResult(null)

    // Random segment index
    const chosenIdx = Math.floor(Math.random() * numSegments)
    // Extra rotations (5 to 8 full spins)
    const extraSpins = (5 + Math.floor(Math.random() * 4)) * 360
    // Center of chosen slice under top pointer (top pointer is at angle 270 or 0deg depending on coordinates)
    // If pointer is at 0 degrees (top), segment index i spans [i*sliceAngle, (i+1)*sliceAngle].
    // Segment center is (i + 0.5) * sliceAngle.
    // To align that segment to the top (0deg), the wheel needs to rotate such that:
    // targetAngle = 360 - (chosenIdx + 0.5) * sliceAngle.
    const targetAngle = 360 - (chosenIdx + 0.5) * sliceAngle
    const newRotation = rotation + extraSpins + (targetAngle - (rotation % 360))

    setRotation(newRotation)

    // Animation takes 3.8 seconds
    setTimeout(() => {
      setIsSpinning(false)
      setSelectedResult(segments[chosenIdx])
      onComplete?.()
    }, 3900)
  }

  return (
    <div className="p-4 md:p-6 max-w-xl mx-auto text-center space-y-6">
      <div>
        <span className="text-xs uppercase tracking-widest text-[#D6AD62] font-semibold">
          Touch or Click to Spin
        </span>
        <h4 className="font-heading text-xl md:text-2xl font-bold text-[#382A2B] mt-1">
          {config?.title || "Let's Spin Some Love!"}
        </h4>
        <p className="text-xs text-[#633B48] mt-1">
          {config?.description || 'Who knows what little surprise is waiting for you?'}
        </p>
      </div>

      {/* Wheel Stage with Pointer */}
      <div className="relative w-[280px] sm:w-[320px] h-[280px] sm:h-[320px] mx-auto">
        {/* Top Fixed Pointer Arrow */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-[#633B48] filter drop-shadow-md" />

        {/* The Wheel */}
        <div
          className="w-full h-full rounded-full border-4 border-[#D6AD62] shadow-2xl relative overflow-hidden transition-transform duration-[3800ms] ease-[cubic-bezier(0.15,0.85,0.25,1)]"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {/* Wheel Segments SVG */}
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {segments.map((seg, idx) => {
              const startAngle = (idx * sliceAngle * Math.PI) / 180
              const endAngle = (((idx + 1) * sliceAngle) * Math.PI) / 180
              const x1 = 50 + 50 * Math.cos(startAngle)
              const y1 = 50 + 50 * Math.sin(startAngle)
              const x2 = 50 + 50 * Math.cos(endAngle)
              const y2 = 50 + 50 * Math.sin(endAngle)
              const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`

              return (
                <path
                  key={idx}
                  d={pathData}
                  fill={seg.color || (idx % 2 === 0 ? '#D6AD62' : '#FFF8ED')}
                  stroke="#FFFCF6"
                  strokeWidth="0.8"
                />
              )
            })}
          </svg>

          {/* Segment Labels Layer */}
          {segments.map((seg, idx) => {
            const angle = (idx + 0.5) * sliceAngle
            return (
              <div
                key={idx}
                className="absolute inset-0 flex items-start justify-center pt-3 pointer-events-none"
                style={{
                  transform: `rotate(${angle}deg)`,
                  transformOrigin: '50% 50%',
                }}
              >
                <div className="flex flex-col items-center">
                  <span className="text-sm">{seg.icon || '✨'}</span>
                  <span className="text-[8px] font-bold tracking-tight text-[#382A2B] uppercase mt-0.5 max-w-[42px] leading-tight text-center">
                    {seg.label}
                  </span>
                </div>
              </div>
            )
          })}

          {/* Center Diya Emblem / Wheel Cap */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-gradient-to-tr from-[#D6AD62] to-[#E8A13A] border-2 border-white shadow-md flex items-center justify-center text-base z-10">
            🪔
          </div>
        </div>
      </div>

      {/* Spin Button */}
      <div>
        <button
          onClick={handleSpin}
          disabled={isSpinning}
          className={`btn-gold text-sm font-semibold px-8 py-3.5 tracking-wide shadow-md ${
            isSpinning ? 'opacity-60 cursor-not-allowed' : 'hover:scale-105 active:scale-95'
          }`}
        >
          <span>{isSpinning ? 'Spinning with Love... 💫' : 'Spin the Love Wheel ✨'}</span>
        </button>
      </div>

      {/* Selected Result Card */}
      {selectedResult && (
        <div className="p-6 rounded-2xl bg-[#FFF8ED] border-2 border-[#D6AD62]/40 shadow-xl max-w-md mx-auto animate-fade-in space-y-3">
          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl">{selectedResult.icon}</span>
            <h5 className="font-heading text-lg font-bold text-[#382A2B]">
              {selectedResult.label}
            </h5>
          </div>

          <p className="font-heading text-base md:text-lg italic text-[#633B48] leading-relaxed">
            &ldquo;{selectedResult.result}&rdquo;
          </p>

          <span className="text-xs uppercase tracking-widest text-[#D6AD62] font-semibold block pt-2">
            A little surprise just for you
          </span>
        </div>
      )}
    </div>
  )
}

