import React, { useState } from 'react'

export default function GameThisOrThat({ config, onComplete }) {
  const [currentRound, setCurrentRound] = useState(0)
  const [selections, setSelections] = useState([])
  const [isFinished, setIsFinished] = useState(false)
  const [animatingChoice, setAnimatingChoice] = useState(null)

  const rounds = config?.rounds || []
  const round = rounds[currentRound]

  function handleChoose(choice) {
    if (animatingChoice) return
    setAnimatingChoice(choice)

    setTimeout(() => {
      const nextSelections = [...selections, { round: round.id, choice }]
      setSelections(nextSelections)
      setAnimatingChoice(null)

      if (currentRound + 1 < rounds.length) {
        setCurrentRound((prev) => prev + 1)
      } else {
        setIsFinished(true)
        onComplete?.()
      }
    }, 400)
  }

  function handleRestart() {
    setCurrentRound(0)
    setSelections([])
    setIsFinished(false)
    setAnimatingChoice(null)
  }

  if (isFinished) {
    return (
      <div className="text-center p-6 md:p-8 space-y-6 max-w-xl mx-auto animate-fade-in">
        <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-tr from-[#DFA5A0] to-[#E8A13A] flex items-center justify-center text-3xl shadow-md">
          ✨
        </div>

        <div>
          <span className="text-xs uppercase tracking-widest text-[#D6AD62] font-semibold">
            Preferences Discovered
          </span>
          <h3 className="font-heading text-2xl md:text-3xl font-bold text-[#382A2B] mt-1">
            Our Little Choices Gallery
          </h3>
          <p className="text-sm font-body text-[#633B48] mt-2 italic">
            &ldquo;{config?.finalMessage || "Every little choice becomes special when it's with you."}&rdquo;
          </p>
        </div>

        {/* Selected Summary Chips */}
        <div className="p-4 rounded-2xl bg-[#FFF8ED] border border-[#D6AD62]/30 max-h-56 overflow-y-auto">
          <div className="flex flex-wrap gap-2 justify-center">
            {selections.map((sel, idx) => (
              <span
                key={idx}
                className="px-3.5 py-1.5 rounded-full bg-[#FFFCF6] border border-[#D6AD62]/40 text-xs font-semibold text-[#382A2B] shadow-2xs"
              >
                {sel.choice}
              </span>
            ))}
          </div>
        </div>

        <button
          onClick={handleRestart}
          className="btn-gold text-sm font-semibold px-6 py-3 tracking-wide"
        >
          🔄 Play Again
        </button>
      </div>
    )
  }

  if (!round) return null

  return (
    <div className="p-4 md:p-6 max-w-xl mx-auto space-y-6">
      {/* Header & Progress */}
      <div className="flex items-center justify-between text-xs font-body text-[#633B48]">
        <span className="font-semibold tracking-wider uppercase text-[#D6AD62]">
          Round {currentRound + 1} of {rounds.length}
        </span>
        <span className="text-xs text-[#633B48]/70">Tap your preference</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-[#FFF8ED] rounded-full overflow-hidden border border-[#D6AD62]/20">
        <div
          className="h-full bg-gradient-to-r from-[#D6AD62] to-[#E8A13A] transition-all duration-300"
          style={{ width: `${((currentRound + 1) / rounds.length) * 100}%` }}
        />
      </div>

      <div className="text-center py-1">
        <p className="text-xs uppercase tracking-widest text-[#633B48] font-medium">
          Which one calls to your heart?
        </p>
      </div>

      {/* Side-by-side Choice Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Option A */}
        <button
          onClick={() => handleChoose(round.optionA)}
          disabled={animatingChoice !== null}
          className={`p-6 md:p-8 rounded-2xl border text-center transition-all duration-300 flex flex-col items-center justify-center gap-3 cursor-pointer group shadow-xs ${
            animatingChoice === round.optionA
              ? 'scale-105 border-[#D6AD62] bg-[#FFF8ED] ring-2 ring-[#D6AD62]'
              : 'border-[#D6AD62]/30 bg-[#FFFCF6] hover:border-[#D6AD62] hover:bg-[#FFF8ED] hover:-translate-y-1'
          }`}
        >
          <span className="text-xs font-mono uppercase tracking-widest text-[#D6AD62] font-semibold">
            Option A
          </span>
          <span className="font-heading text-lg md:text-xl font-bold text-[#382A2B] group-hover:text-[#633B48] transition-colors">
            {round.optionA}
          </span>
          <span className="text-xs text-[#633B48]/70 group-hover:scale-110 transition-transform">
            ❤️ Choose This
          </span>
        </button>

        {/* Option B */}
        <button
          onClick={() => handleChoose(round.optionB)}
          disabled={animatingChoice !== null}
          className={`p-6 md:p-8 rounded-2xl border text-center transition-all duration-300 flex flex-col items-center justify-center gap-3 cursor-pointer group shadow-xs ${
            animatingChoice === round.optionB
              ? 'scale-105 border-[#D6AD62] bg-[#FFF8ED] ring-2 ring-[#D6AD62]'
              : 'border-[#D6AD62]/30 bg-[#FFFCF6] hover:border-[#D6AD62] hover:bg-[#FFF8ED] hover:-translate-y-1'
          }`}
        >
          <span className="text-xs font-mono uppercase tracking-widest text-[#D6AD62] font-semibold">
            Option B
          </span>
          <span className="font-heading text-lg md:text-xl font-bold text-[#382A2B] group-hover:text-[#633B48] transition-colors">
            {round.optionB}
          </span>
          <span className="text-xs text-[#633B48]/70 group-hover:scale-110 transition-transform">
            ❤️ Choose This
          </span>
        </button>
      </div>
    </div>
  )
}

