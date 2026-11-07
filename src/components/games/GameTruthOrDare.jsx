import React, { useState } from 'react'

export default function GameTruthOrDare({ config, onComplete }) {
  const [mode, setMode] = useState('truth') // 'truth' | 'dare'
  const [truthIdx, setTruthIdx] = useState(0)
  const [dareIdx, setDareIdx] = useState(0)
  const [completedCount, setCompletedCount] = useState(0)
  const [hasCompletedCurrent, setHasCompletedCurrent] = useState(false)

  const truths = config?.truths || []
  const dares = config?.dares || []

  const currentItem = mode === 'truth' ? truths[truthIdx] : dares[dareIdx]

  function handleNext() {
    setHasCompletedCurrent(false)
    if (mode === 'truth') {
      setTruthIdx((prev) => (prev + 1) % truths.length)
    } else {
      setDareIdx((prev) => (prev + 1) % dares.length)
    }
  }

  function handleCompletePrompt() {
    setHasCompletedCurrent(true)
    setCompletedCount((prev) => prev + 1)
    onComplete?.()
  }

  return (
    <div className="p-4 md:p-6 max-w-xl mx-auto space-y-6">
      {/* Mode Selection Tabs */}
      <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
        <button
          onClick={() => {
            setMode('truth')
            setHasCompletedCurrent(false)
          }}
          className={`py-3 px-4 rounded-2xl font-heading font-bold text-base transition-all flex items-center justify-center gap-2 border ${
            mode === 'truth'
              ? 'bg-gradient-to-r from-[#D6AD62] to-[#E8A13A] text-[#382A2B] border-[#D6AD62] shadow-md scale-102'
              : 'bg-[#FFF8ED] text-[#633B48] border-[#D6AD62]/30 hover:border-[#D6AD62]'
          }`}
        >
          <span>💭</span>
          <span>Truth</span>
        </button>

        <button
          onClick={() => {
            setMode('dare')
            setHasCompletedCurrent(false)
          }}
          className={`py-3 px-4 rounded-2xl font-heading font-bold text-base transition-all flex items-center justify-center gap-2 border ${
            mode === 'dare'
              ? 'bg-gradient-to-r from-[#DFA5A0] to-[#E8A13A] text-[#382A2B] border-[#DFA5A0] shadow-md scale-102'
              : 'bg-[#FFF8ED] text-[#633B48] border-[#D6AD62]/30 hover:border-[#D6AD62]'
          }`}
        >
          <span>🔥</span>
          <span>Dare</span>
        </button>
      </div>

      {/* Main Prompt Card */}
      <div className="p-8 md:p-10 rounded-3xl bg-[#FFF8ED] border-2 border-[#D6AD62]/40 text-center shadow-lg space-y-4 min-h-[220px] flex flex-col justify-center items-center">
        <span className="text-xs uppercase tracking-widest font-mono font-semibold text-[#D6AD62]">
          {mode === 'truth' ? 'Romantic Truth' : 'Sweet Little Dare'}
        </span>

        <p className="font-heading text-xl md:text-2xl font-normal text-[#382A2B] leading-relaxed max-w-md">
          &ldquo;{currentItem}&rdquo;
        </p>

        {hasCompletedCurrent && (
          <div className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full animate-fade-in">
            ❤️ Beautifully Done!
          </div>
        )}
      </div>

      {/* Action Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          onClick={handleCompletePrompt}
          disabled={hasCompletedCurrent}
          className={`btn-gold text-xs sm:text-sm font-semibold px-6 py-3 tracking-wide ${
            hasCompletedCurrent ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <span>✅ Done / Answered!</span>
        </button>

        <button
          onClick={handleNext}
          className="px-6 py-3 rounded-full bg-[#FFFCF6] border border-[#D6AD62]/40 text-[#633B48] hover:text-[#382A2B] hover:border-[#D6AD62] text-xs sm:text-sm font-semibold transition-all flex items-center gap-2"
        >
          <span>🎲 Next {mode === 'truth' ? 'Truth' : 'Dare'}</span>
        </button>
      </div>

      <div className="text-center">
        <span className="text-[11px] text-[#633B48]/60 uppercase tracking-widest">
          Prompts shared: {completedCount}
        </span>
      </div>
    </div>
  )
}

