import React, { useState, useCallback, useEffect } from 'react'
import { useCard } from '../context/CardContext'

export default function Scrapbook({ onPageTurn, onLightDiya }) {
  const { card, update } = useCard()
  const pages = card.scrapbookPages || []
  const [currentPage, setCurrentPage] = useState(0)
  const [flipping, setFlipping] = useState(false)
  const [direction, setDirection] = useState('next')

  const totalPages = pages.length

  const handleNextPage = useCallback(() => {
    if (currentPage >= totalPages - 1 || flipping) return
    setDirection('next')
    setFlipping(true)
    onPageTurn?.()
    setTimeout(() => {
      setCurrentPage((p) => p + 1)
      setFlipping(false)
    }, 350)
  }, [currentPage, totalPages, flipping, onPageTurn])

  const handlePrevPage = useCallback(() => {
    if (currentPage <= 0 || flipping) return
    setDirection('prev')
    setFlipping(true)
    onPageTurn?.()
    setTimeout(() => {
      setCurrentPage((p) => p - 1)
      setFlipping(false)
    }, 350)
  }, [currentPage, flipping, onPageTurn])

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'ArrowRight') handleNextPage()
      if (e.key === 'ArrowLeft') handlePrevPage()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleNextPage, handlePrevPage])

  const handleTogglePageDiya = useCallback(
    (pageIndex) => {
      const updated = [...pages]
      updated[pageIndex] = {
        ...updated[pageIndex],
        diyaLit: !updated[pageIndex].diyaLit,
      }
      update({ scrapbookPages: updated })
      onLightDiya?.()
    },
    [pages, update, onLightDiya]
  )

  const activePage = pages[currentPage] || pages[0]

  return (
    <section
      data-testid="scrapbook-section"
      className="relative py-16 px-4 md:px-8 max-w-5xl mx-auto z-10"
      aria-label="Diwali Flip-Through Scrapbook"
    >
      {/* ── Section Title ── */}
      <div className="text-center space-y-3 mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-xs uppercase tracking-widest">
          <span>📖</span>
          <span>Interactive Flip-Through Scrapbook</span>
          <span>📖</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-display font-light tracking-tight text-[#f7e8c0]">
          The Diwali <span className="italic text-[#ff9500] font-normal">Chronicles</span>
        </h2>
        <p className="text-sm md:text-base max-w-md mx-auto text-[#f7e8c0]/70 font-body">
          Turn through the handcrafted pages filled with pressed marigolds, festive warmth, and blessings.
        </p>
      </div>

      {/* ── The 3D Album Book Container ── */}
      <div className="relative max-w-3xl mx-auto perspective-[1400px]">
        {/* Leather/Silk Album Cover Frame */}
        <div
          data-testid="scrapbook-album"
          className="relative rounded-3xl p-3 md:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.85)] border-4 border-amber-600/40"
          style={{
            background: 'linear-gradient(135deg, #38040a 0%, #1e0205 50%, #4a060e 100%)',
          }}
        >
          {/* Gold Embossed Ornate Metal Corners */}
          <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-[#ffd700] rounded-tl-lg pointer-events-none" />
          <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-[#ffd700] rounded-tr-lg pointer-events-none" />
          <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-[#ffd700] rounded-bl-lg pointer-events-none" />
          <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-[#ffd700] rounded-br-lg pointer-events-none" />

          {/* Book Spine Visual */}
          <div className="hidden md:block absolute left-1/2 top-4 bottom-4 -translate-x-1/2 w-4 bg-gradient-to-r from-black/60 via-amber-900/40 to-black/60 z-20 pointer-events-none shadow-inner" />

          {/* Silk Bookmark Ribbon */}
          <div
            className="absolute top-0 right-16 w-5 h-16 bg-gradient-to-b from-[#e63946] to-[#990014] shadow-md z-30 pointer-events-none"
            style={{
              clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 82%, 0 100%)',
            }}
          />

          {/* ── The Page Spread ── */}
          <div
            data-testid="scrapbook-page-sheet"
            className={`relative min-h-[460px] md:min-h-[500px] bg-[#fbf6ea] rounded-2xl p-6 md:p-10 shadow-inner border border-amber-900/10 text-stone-800 flex flex-col justify-between transition-all duration-300 ${
              flipping
                ? direction === 'next'
                  ? 'rotate-y-[-12deg] opacity-75 scale-95'
                  : 'rotate-y-[12deg] opacity-75 scale-95'
                : 'rotate-y-0 opacity-100 scale-100'
            }`}
            style={{
              backgroundImage: `
                radial-gradient(#e4d5b7 0.75px, transparent 0.75px),
                linear-gradient(180deg, rgba(254,249,235,1) 0%, rgba(245,236,215,1) 100%)
              `,
              backgroundSize: '16px 16px, 100% 100%',
              boxShadow: 'inset 0 0 40px rgba(180, 130, 70, 0.2), 0 5px 25px rgba(0,0,0,0.15)',
            }}
          >
            {/* Page Header (Washi Tape & Stickers) */}
            <div className="flex items-center justify-between border-b border-amber-900/15 pb-4">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-sm font-bold text-amber-900 font-mono">
                  {currentPage + 1}
                </span>
                <div>
                  <h3 className="font-display text-xl md:text-2xl font-bold text-stone-900 tracking-tight">
                    {activePage.title}
                  </h3>
                  <p className="text-xs text-stone-500 font-body italic">
                    {activePage.subtitle}
                  </p>
                </div>
              </div>

              {/* Decorative Stickers */}
              <div className="flex gap-1.5 text-lg">
                {activePage.stickers?.map((stk, i) => (
                  <span
                    key={i}
                    className="inline-block transform hover:scale-125 transition-transform cursor-default"
                  >
                    {stk}
                  </span>
                ))}
              </div>
            </div>

            {/* Page Body Content */}
            <div className="my-6 space-y-5 flex-1 flex flex-col justify-center">
              {/* Handwritten Note Paragraph */}
              <div className="relative bg-white/70 backdrop-blur-xs p-5 md:p-6 rounded-2xl border border-amber-800/10 shadow-xs">
                {/* Vintage Tape on Note */}
                <div className="absolute -top-3 left-6 w-16 h-4 bg-amber-300/60 rounded-xs shadow-xs transform -rotate-2" />
                <p className="font-display text-lg md:text-xl text-stone-800 leading-relaxed italic">
                  &ldquo;{activePage.content}&rdquo;
                </p>
              </div>

              {/* Special Interactive Diya on Page 3 */}
              {activePage.id === 'page-3' && (
                <div className="text-center py-3 space-y-3">
                  <div
                    onClick={() => handleTogglePageDiya(currentPage)}
                    data-testid="interactive-diya-trigger"
                    className="inline-flex flex-col items-center cursor-pointer group"
                    role="button"
                    tabIndex={0}
                    aria-label="Light Sacred Diya"
                  >
                    <div className="relative">
                      {/* Burning Aura */}
                      <div
                        className={`absolute -top-6 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-amber-400 blur-md transition-opacity duration-500 ${
                          activePage.diyaLit ? 'opacity-90 animate-pulse' : 'opacity-0'
                        }`}
                      />
                      <span className="text-5xl md:text-6xl transform group-hover:scale-110 transition-transform block">
                        {activePage.diyaLit ? '🔥' : '🪔'}
                      </span>
                    </div>
                    <span className="mt-2 text-xs font-semibold uppercase tracking-wider text-amber-900 bg-amber-200/80 px-3 py-1 rounded-full border border-amber-400/50 shadow-xs group-hover:bg-amber-300">
                      {activePage.diyaLit ? '✨ Diya is Glowing! Tap to extinguish' : '✨ Tap to Light the Diya ✨'}
                    </span>
                  </div>
                </div>
              )}

              {/* Blessing Note Footer */}
              {activePage.blessing && (
                <div className="flex items-center gap-3 p-3.5 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-950 text-xs md:text-sm font-medium">
                  <span className="text-lg">✨</span>
                  <span className="italic">{activePage.blessing}</span>
                </div>
              )}
            </div>

            {/* ── Page Footer & Turn Controls ── */}
            <div className="flex items-center justify-between pt-4 border-t border-amber-900/15">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 0 || flipping}
                data-testid="scrapbook-prev-btn"
                className="btn-ghost text-xs px-4 py-2 rounded-full border border-amber-800/30 text-amber-900 hover:bg-amber-800/10 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1.5 font-medium"
                aria-label="Previous Page"
              >
                <span>←</span>
                <span>Previous Page</span>
              </button>

              <span className="text-xs font-mono font-semibold text-stone-500 tracking-widest">
                Page {currentPage + 1} of {totalPages}
              </span>

              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages - 1 || flipping}
                data-testid="scrapbook-next-btn"
                className="btn-ghost text-xs px-4 py-2 rounded-full border border-amber-800/30 text-amber-900 hover:bg-amber-800/10 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1.5 font-medium"
                aria-label="Next Page"
              >
                <span>Next Page</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tactile Page Dots Navigation */}
        <div className="flex justify-center gap-2 mt-6">
          {pages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (idx !== currentPage) {
                  onPageTurn?.()
                  setCurrentPage(idx)
                }
              }}
              aria-label={`Go to scrapbook page ${idx + 1}`}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                currentPage === idx
                  ? 'bg-amber-400 w-8 shadow-[0_0_10px_rgba(255,191,0,0.8)]'
                  : 'bg-amber-500/30 hover:bg-amber-500/60'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

