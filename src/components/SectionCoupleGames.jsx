import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import GameThisOrThat from './games/GameThisOrThat'
import GameTreasureHunt from './games/GameTreasureHunt'
import GameTruthOrDare from './games/GameTruthOrDare'
import GameScratchCard from './games/GameScratchCard'
import GameSpinWheel from './games/GameSpinWheel'
import { DIWALI_CONFIG } from '../config/diwaliConfig'
import { useReveal } from '../hooks/useReveal'

function GameCard({ game, index, isDone, onOpen }) {
  // Spotlight follows the pointer across the card
  function handleMove(e) {
    const r = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
  }

  return (
    <button
      type="button"
      data-testid={`game-card-${game.id}`}
      onClick={onOpen}
      onPointerMove={handleMove}
      aria-label={`Open game: ${game.title}`}
      className={`reveal group relative overflow-hidden rounded-[30px] glass text-left p-7 md:p-8 flex flex-col justify-between transition-[transform,border-color,box-shadow] duration-500 hover:-translate-y-1.5 hover:border-[color:var(--accent)] ${game.span}`}
      style={{
        '--accent': game.accent,
        transitionDelay: `${index * 70}ms`,
        boxShadow: '0 30px 60px -30px rgba(0,0,0,0.6)',
      }}
    >
      {/* pointer spotlight */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(320px circle at var(--mx, 50%) var(--my, 50%), ${game.accent}33, transparent 60%)`,
        }}
      />
      {/* oversized background glyph */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-4 -bottom-8 text-[9rem] md:text-[11rem] leading-none opacity-[0.09] group-hover:opacity-[0.16] group-hover:-rotate-6 transition-all duration-700"
      >
        {game.icon}
      </span>

      <span className="relative flex items-start justify-between gap-3">
        <span
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6"
          style={{
            background: `linear-gradient(140deg, ${game.accent}40, ${game.accent}10)`,
            boxShadow: `0 0 0 1px ${game.accent}55 inset`,
          }}
        >
          {game.icon}
        </span>
        <span className="flex flex-col items-end gap-1.5">
          <span className="font-body text-[10px] tracking-[0.3em] uppercase text-[#FBE3A8]/50">
            Game 0{index + 1}
          </span>
          {isDone && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#F4C56A] text-[#2A1606]">
              ✓ Played
            </span>
          )}
        </span>
      </span>

      <span className="relative mt-10 block">
        <span className="block font-body text-[11px] tracking-[0.25em] uppercase mb-2" style={{ color: game.accent }}>
          {game.tag}
        </span>
        <span className={`block font-heading text-[#FFF4DE] leading-tight mb-2 ${game.big ? 'text-3xl md:text-4xl' : 'text-2xl'}`}>
          {game.title}
        </span>
        <span className="block font-body text-sm text-[#FFF4DE]/60 max-w-sm">{game.subtitle}</span>
        <span className="mt-6 inline-flex items-center gap-2 font-body text-xs font-semibold tracking-wider uppercase text-[#FBE3A8]">
          {isDone ? 'Play again' : 'Play now'}
          <span className="inline-block transition-transform duration-300 group-hover:translate-x-1.5">→</span>
        </span>
      </span>
    </button>
  )
}

export default function SectionCoupleGames({ config = DIWALI_CONFIG }) {
  const [activeGameId, setActiveGameId] = useState(null)
  const [completedGames, setCompletedGames] = useState({})
  const revealRef = useReveal()

  const gamesConf = config?.coupleGames || {}
  const herName = config?.herName || 'Helly'

  function markGameComplete(gameId) {
    setCompletedGames((prev) => ({ ...prev, [gameId]: true }))
  }

  const gameList = [
    {
      id: 'thisOrThat',
      title: 'This or That — Couple Edition',
      subtitle: 'Ten quick choices. Let’s see how alike our hearts really are.',
      tag: 'Quick choices',
      icon: '💞',
      accent: '#F28BA6',
      span: 'lg:col-span-2 min-h-[300px]',
      big: true,
      component: (
        <GameThisOrThat config={gamesConf.thisOrThat} onComplete={() => markGameComplete('thisOrThat')} />
      ),
    },
    {
      id: 'spinWheel',
      title: 'Spin the Love Wheel',
      subtitle: 'Compliments, wishes and warm hugs — fate decides.',
      tag: 'Lucky wheel',
      icon: '🎡',
      accent: '#FF9F2E',
      span: 'min-h-[300px]',
      component: (
        <GameSpinWheel config={gamesConf.spinWheel} onComplete={() => markGameComplete('spinWheel')} />
      ),
    },
    {
      id: 'treasureHunt',
      title: 'Love Treasure Hunt',
      subtitle: 'Solve three clues to unlock a secret envelope.',
      tag: 'Special experience',
      icon: '🗝️',
      accent: '#F4C56A',
      span: 'min-h-[280px]',
      component: (
        <GameTreasureHunt config={gamesConf.treasureHunt} onComplete={() => markGameComplete('treasureHunt')} />
      ),
    },
    {
      id: 'truthOrDare',
      title: 'Truth or Dare — Love Edition',
      subtitle: 'Sweet questions and playful little dares.',
      tag: 'Playful bond',
      icon: '😉',
      accent: '#C89BFF',
      span: 'min-h-[280px]',
      component: (
        <GameTruthOrDare config={gamesConf.truthOrDare} onComplete={() => markGameComplete('truthOrDare')} />
      ),
    },
    {
      id: 'scratchCard',
      title: 'Scratch to Reveal',
      subtitle: 'A golden foil card hiding something just for you.',
      tag: 'Golden surprise',
      icon: '✨',
      accent: '#FFD98A',
      span: 'min-h-[280px]',
      component: (
        <GameScratchCard config={gamesConf.scratchCard} onComplete={() => markGameComplete('scratchCard')} />
      ),
    },
  ]

  const activeGame = gameList.find((g) => g.id === activeGameId)
  const completedCount = Object.keys(completedGames).length
  const total = gameList.length

  // Escape closes the modal; lock page scroll while open
  useEffect(() => {
    if (!activeGameId) return
    const onKey = (e) => e.key === 'Escape' && setActiveGameId(null)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [activeGameId])

  return (
    <section
      id="chapter-games"
      ref={revealRef}
      data-testid="section-couple-games"
      className="relative w-full px-5 py-28 md:py-40"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-12 md:mb-16">
          <div className="reveal max-w-2xl">
            <p className="eyebrow mb-5">Chapter 04 · Playtime</p>
            <h2
              data-testid="couple-games-heading"
              className="font-heading text-4xl sm:text-5xl md:text-6xl text-[#FFF4DE] tracking-tight leading-[1.05]"
            >
              {gamesConf.heading || 'A Little Playtime for Us ❤️'}
            </h2>
            <p className="mt-5 font-body text-base sm:text-lg text-[#FFF4DE]/65 leading-relaxed">
              {gamesConf.subtext ||
                'Because every beautiful love story deserves a little fun, some laughter and a few unexpected surprises.'}
            </p>
          </div>

          {/* Lamp progress: one diya lights per finished game */}
          <div className="reveal glass rounded-2xl px-5 py-4 self-start md:self-auto">
            <div className="flex items-end gap-3" aria-hidden="true">
              {gameList.map((g) => {
                const on = !!completedGames[g.id]
                return (
                  <span key={g.id} className="flex flex-col items-center">
                    <span
                      className="block w-[7px] h-[12px] mb-[-2px] transition-all duration-700"
                      style={{
                        borderRadius: '50% 50% 35% 35% / 70% 70% 30% 30%',
                        background: 'linear-gradient(180deg, #FF7A00, #FFF0B8)',
                        boxShadow: '0 0 12px 4px rgba(255,159,46,0.6)',
                        opacity: on ? 1 : 0,
                        transform: on ? 'scale(1)' : 'scale(0.3)',
                      }}
                    />
                    <span className="block w-6 h-[9px] rounded-b-full bg-gradient-to-b from-[#B4561C] to-[#6E2808]" />
                  </span>
                )
              })}
            </div>
            <p className="mt-3 font-body text-[11px] tracking-[0.2em] uppercase text-[#FBE3A8]/70">
              Games explored: {completedCount} / {total}
            </p>
          </div>
        </div>

        {completedCount >= 3 && (
          <div
            className="mb-8 rounded-2xl px-6 py-4 text-center border border-[#F4C56A]/40"
            style={{
              background: 'linear-gradient(90deg, rgba(244,197,106,0.05), rgba(244,197,106,0.16), rgba(244,197,106,0.05))',
              animation: 'sheetIn .7s ease both',
            }}
          >
            <p className="font-heading text-lg text-[#FFF4DE]">You made it through our little world of fun! ❤️</p>
            <p className="font-body text-sm text-[#FFF4DE]/65 mt-1">
              Thank you for playing along, {herName}. You make every game so joyful!
            </p>
          </div>
        )}

        {/* Bento grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {gameList.map((game, i) => (
            <GameCard
              key={game.id}
              game={game}
              index={i}
              isDone={!!completedGames[game.id]}
              onOpen={() => setActiveGameId(game.id)}
            />
          ))}
        </div>
      </div>

      {/* Modal: warm paper sheet over the night */}
      {activeGame && createPortal(
        <div
          data-testid="game-modal-backdrop"
          onClick={() => setActiveGameId(null)}
          className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center sm:p-4 bg-[#07040F]/75 backdrop-blur-md"
          style={{ animation: 'fadeIn .3s ease both' }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="game-modal-title"
            onClick={(e) => e.stopPropagation()}
            className="paper-sheet relative w-full sm:max-w-2xl rounded-t-[32px] sm:rounded-[32px] max-h-[92svh] overflow-y-auto"
            style={{ animation: 'sheetIn .5s cubic-bezier(.2,.7,.2,1) both' }}
          >
            {/* grab handle (mobile) */}
            <span className="sm:hidden block mx-auto mt-3 w-10 h-1 rounded-full bg-[#D6AD62]/50" />
            <div className="sticky top-0 z-10 flex items-center justify-between gap-4 px-6 md:px-8 pt-5 pb-4 bg-[#FFF8EC]/90 backdrop-blur-sm border-b border-[#D6AD62]/25">
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className="w-11 h-11 shrink-0 rounded-2xl flex items-center justify-center text-xl"
                  style={{ background: `${activeGame.accent}33` }}
                >
                  {activeGame.icon}
                </span>
                <div className="min-w-0">
                  <h3 id="game-modal-title" className="font-heading text-xl md:text-2xl font-bold text-[#382A2B] truncate">
                    {activeGame.title}
                  </h3>
                  <span className="font-hand text-lg text-[#633B48]">made for {herName}</span>
                </div>
              </div>
              <button
                onClick={() => setActiveGameId(null)}
                className="w-10 h-10 shrink-0 rounded-full bg-[#382A2B] text-[#FFF4DE] hover:bg-[#633B48] flex items-center justify-center text-sm transition-colors"
                title="Close game"
                aria-label="Close game"
              >
                ✕
              </button>
            </div>
            <div className="px-5 md:px-8 py-6">{activeGame.component}</div>
          </div>
        </div>,
        document.body
      )}
    </section>
  )
}
