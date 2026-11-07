import React, { useState } from 'react'

export default function GameTreasureHunt({ config, onComplete }) {
  const [currentClueIdx, setCurrentClueIdx] = useState(0)
  const [selectedOption, setSelectedOption] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [envelopeOpen, setEnvelopeOpen] = useState(false)

  const clues = config?.clues || []
  const currentClue = clues[currentClueIdx]

  function handleAnswer(idx) {
    if (selectedOption !== null) return
    setSelectedOption(idx)

    const isCorrect = idx === currentClue.correctIndex
    if (isCorrect) {
      setFeedback({
        type: 'success',
        text: currentClue.successMessage,
      })
    } else {
      setFeedback({
        type: 'error',
        text: 'Almost! Think about what truly warms my heart the most ❤️ Try again!',
      })
    }
  }

  function handleNextClue() {
    setSelectedOption(null)
    setFeedback(null)
    if (currentClueIdx + 1 < clues.length) {
      setCurrentClueIdx((prev) => prev + 1)
    } else {
      setIsUnlocked(true)
      onComplete?.()
    }
  }

  function handleTryAgain() {
    setSelectedOption(null)
    setFeedback(null)
  }

  function handleReset() {
    setCurrentClueIdx(0)
    setSelectedOption(null)
    setFeedback(null)
    setIsUnlocked(false)
    setEnvelopeOpen(false)
  }

  // Final Treasure Screen
  if (isUnlocked) {
    const treasure = config?.finalTreasure || {}
    return (
      <div className="text-center p-6 md:p-8 space-y-6 max-w-lg mx-auto animate-fade-in">
        <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-tr from-[#D6AD62] to-[#E8A13A] flex items-center justify-center text-3xl shadow-lg animate-bounce">
          🗝️
        </div>

        <div>
          <span className="text-xs uppercase tracking-widest text-[#D6AD62] font-semibold">
            Treasure Unlocked
          </span>
          <h3 className="font-heading text-2xl md:text-3xl font-bold text-[#382A2B] mt-1">
            {treasure.headline || 'You Unlocked the Final Treasure! ✨'}
          </h3>
          <p className="text-xs text-[#633B48] mt-1">
            You solved all three clues with flying colors!
          </p>
        </div>

        {/* Digital Interactive Envelope */}
        {!envelopeOpen ? (
          <div
            onClick={() => setEnvelopeOpen(true)}
            className="p-8 rounded-3xl bg-gradient-to-b from-[#FFF8ED] to-[#FFFCF6] border-2 border-[#D6AD62] shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer group"
          >
            <div className="text-6xl mb-3 group-hover:scale-110 transition-transform">
              💌
            </div>
            <p className="font-heading text-lg font-bold text-[#382A2B]">
              {treasure.envelopeLabel || 'Tap to Open Your Secret Love Letter'}
            </p>
            <span className="text-xs text-[#D6AD62] font-semibold tracking-wider uppercase block mt-1">
              ✨ Sealed with love
            </span>
          </div>
        ) : (
          <div className="p-6 md:p-8 rounded-3xl bg-[#FFF8ED] border-2 border-[#D6AD62] shadow-2xl animate-fade-in space-y-4">
            <span className="text-4xl">📜</span>
            <p className="font-heading text-lg md:text-xl italic text-[#382A2B] leading-relaxed">
              &ldquo;{treasure.message}&rdquo;
            </p>
            <div className="pt-4 border-t border-[#D6AD62]/30 text-right">
              <span className="text-xs font-mono tracking-widest uppercase text-[#633B48]">
                Forever Yours
              </span>
            </div>
          </div>
        )}

        <button
          onClick={handleReset}
          className="btn-gold text-xs font-semibold px-5 py-2.5 tracking-wide"
        >
          🔄 Restart Hunt
        </button>
      </div>
    )
  }

  if (!currentClue) return null

  return (
    <div className="p-4 md:p-6 max-w-xl mx-auto space-y-6">
      {/* Header & Clue Progress Indicators */}
      <div className="flex items-center justify-between text-xs font-body text-[#633B48]">
        <div className="flex items-center gap-2">
          {clues.map((c, idx) => (
            <span
              key={c.id}
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                idx === currentClueIdx
                  ? 'bg-gradient-to-r from-[#D6AD62] to-[#E8A13A] text-[#382A2B] ring-2 ring-[#D6AD62]/40 shadow-xs'
                  : idx < currentClueIdx
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-[#FFF8ED] text-[#382A2B]/40 border border-[#D6AD62]/20'
              }`}
            >
              {idx < currentClueIdx ? '✓' : `0${idx + 1}`}
            </span>
          ))}
        </div>
        <span className="font-semibold uppercase tracking-wider text-[#D6AD62]">
          {currentClue.badge}
        </span>
      </div>

      {/* Clue Content */}
      <div className="text-center py-2 space-y-1">
        <span className="text-xs uppercase tracking-widest text-[#633B48]/70 font-semibold">
          {currentClue.name}
        </span>
        <h4 className="font-heading text-xl md:text-2xl font-bold text-[#382A2B] leading-snug">
          {currentClue.question}
        </h4>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {currentClue.options.map((opt, idx) => {
          const isSelected = selectedOption === idx
          const isCorrect = idx === currentClue.correctIndex

          let cardStyle =
            'border-[#D6AD62]/30 bg-[#FFF8ED] hover:border-[#D6AD62] hover:bg-[#FFFCF6]'
          if (selectedOption !== null) {
            if (isCorrect) {
              cardStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold'
            } else if (isSelected) {
              cardStyle = 'border-rose-400 bg-rose-50 text-rose-900'
            } else {
              cardStyle = 'opacity-60 border-gray-200'
            }
          }

          return (
            <button
              key={idx}
              onClick={() => handleAnswer(idx)}
              disabled={selectedOption !== null}
              className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center justify-between text-sm md:text-base font-body shadow-2xs ${cardStyle}`}
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs font-mono font-bold opacity-75">
                  {idx + 1}
                </span>
                <span>{opt}</span>
              </div>
              {selectedOption !== null && (
                <span>{isCorrect ? '🔓' : isSelected ? '🔒' : ''}</span>
              )}
            </button>
          )
        })}
      </div>

      {/* Feedback & Actions */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border text-center space-y-3 animate-fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900'
              : 'bg-rose-50/80 border-rose-300 text-rose-900'
          }`}
        >
          <p className="text-sm font-body font-medium">&ldquo;{feedback.text}&rdquo;</p>
          {feedback.type === 'success' ? (
            <button
              onClick={handleNextClue}
              className="btn-gold text-xs font-semibold px-6 py-2.5 tracking-wide"
            >
              {currentClueIdx + 1 < clues.length ? 'Unlock Next Clue 🔑' : 'Claim Final Treasure 🏆'}
            </button>
          ) : (
            <button
              onClick={handleTryAgain}
              className="px-4 py-2 rounded-full border border-rose-300 text-xs font-semibold text-rose-800 hover:bg-rose-100 transition-colors"
            >
              Try Again 🔄
            </button>
          )}
        </div>
      )}
    </div>
  )
}

