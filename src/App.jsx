import React, { useState, useEffect, useCallback, useRef } from 'react'
import SectionSurprise from './components/SectionSurprise'
import SectionCinematicJourney from './components/SectionCinematicJourney'
import SectionHeartMessage from './components/SectionHeartMessage'
import SectionCoupleGames from './components/SectionCoupleGames'
import SectionFinalWish from './components/SectionFinalWish'
import NightSky from './components/NightSky'
import CursorSparkle from './components/CursorSparkle'
import ChapterNav from './components/ChapterNav'
import PortraitUploader from './components/PortraitUploader'
import { getResolvedConfig } from './config/diwaliConfig'
import { generateSingleHtml } from './utils/exportSingleHtml'
import { useAudio } from './hooks/useAudio'

const CHAPTERS = [
  { id: 'chapter-surprise', label: 'The surprise' },
  { id: 'chapter-journey', label: 'Into the light' },
  { id: 'chapter-heart', label: 'From my heart' },
  { id: 'chapter-games', label: 'Playtime' },
  { id: 'chapter-wish', label: 'The wish' },
]

const FIELD =
  'w-full bg-white/70 border border-[#D6AD62]/40 rounded-xl px-3.5 py-2.5 text-sm text-[#382A2B] placeholder:text-[#633B48]/40 focus:outline-none focus:border-[#D6AD62] focus:ring-2 focus:ring-[#F4C56A]/30 transition'
const LABEL = 'block font-body text-[10px] uppercase tracking-[0.25em] font-semibold text-[#633B48] mb-1.5'
const MEMORY_FIELDS = [
  { key: 'mem1', label: 'Memory 1 · A memory to remember' },
  { key: 'mem2', label: 'Memory 2 · A moment I treasure' },
  { key: 'mem3', label: 'Memory 3 · My favourite feeling' },
]

export default function App() {
  const [config, setConfig] = useState(() => getResolvedConfig())
  const [scrollWidth, setScrollWidth] = useState(0)
  const [showPersonalizeModal, setShowPersonalizeModal] = useState(false)
  const [showPortraitSetup, setShowPortraitSetup] = useState(false)
  const [customForm, setCustomForm] = useState({
    herName: config.herName,
    yourName: config.yourName,
    mem1: config.relationshipMemories[0]?.content || '',
    mem2: config.relationshipMemories[1]?.content || '',
    mem3: config.relationshipMemories[2]?.content || '',
  })

  const { musicOn, toggleMusic, playDiya } = useAudio()
  const journeySectionRef = useRef(null)

  // Continuous Scroll Progress Calculation
  useEffect(() => {
    function onScroll() {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      if (docHeight > 0) {
        setScrollWidth((scrollTop / docHeight) * 100)
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Escape closes the personalise sheet
  useEffect(() => {
    if (!showPersonalizeModal) return
    const onKey = (e) => e.key === 'Escape' && setShowPersonalizeModal(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showPersonalizeModal])

  // Open Your Surprise -> Smooth scroll to Section 02
  const handleOpenSurprise = useCallback(() => {
    playDiya()
    if (journeySectionRef.current) {
      journeySectionRef.current.scrollIntoView({ behavior: 'smooth' })
    } else {
      window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })
    }
  }, [playDiya])

  // Save personalized settings
  const handleSavePersonalization = useCallback(() => {
    setConfig((prev) => {
      const updatedMemories = [...prev.relationshipMemories]
      if (updatedMemories[0]) updatedMemories[0].content = customForm.mem1
      if (updatedMemories[1]) updatedMemories[1].content = customForm.mem2
      if (updatedMemories[2]) updatedMemories[2].content = customForm.mem3

      return {
        ...prev,
        herName: customForm.herName,
        yourName: customForm.yourName,
        surpriseSubtext: `I made something special, just for you, ${customForm.herName}.`,
        finalWish: {
          ...prev.finalWish,
          mainWish: `Happy Diwali, ${customForm.herName} ❤️`,
        },
        relationshipMemories: updatedMemories,
      }
    })
    setShowPersonalizeModal(false)
  }, [customForm])

  // Download Single .html File
  const handleDownloadSingleFile = useCallback(() => {
    const cardData = {
      recipientName: config.herName,
      senderName: config.yourName,
      message: config.finalWish.message,
      tagline: `To dearest ${config.herName} — my favourite light is you.`,
      targetDate: '2026-11-08T18:00:00',
    }
    const html = generateSingleHtml(cardData)
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `diwali-for-${config.herName.toLowerCase()}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [config])

  return (
    <div data-testid="app-root" className="relative min-h-screen text-[#FFF4DE] font-body">
      <NightSky />
      <CursorSparkle />

      {/* ── Burning-fuse scroll progress ── */}
      <div id="scroll-progress" style={{ width: `${scrollWidth}%` }} aria-hidden="true" />

      {/* ── Floating glass header ── */}
      <header className="fixed top-3 md:top-5 inset-x-0 z-50 px-3 md:px-8 pointer-events-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <a
            href="#chapter-surprise"
            className="pointer-events-auto glass rounded-full pl-3 pr-4 py-2 flex items-center gap-2.5 hover:border-[#F4C56A]/50 transition-colors"
          >
            <span className="relative flex w-2.5 h-2.5">
              <span className="absolute inset-0 rounded-full bg-[#FF9F2E] animate-ping opacity-60" />
              <span className="relative w-2.5 h-2.5 rounded-full bg-[#F4C56A]" />
            </span>
            <span className="font-heading italic text-sm md:text-base text-[#FFF4DE]">For {config.herName}</span>
            <span className="hidden sm:inline font-body text-[10px] tracking-[0.25em] text-[#F4C56A]/70">· 2026</span>
          </a>

          <div className="pointer-events-auto glass rounded-full p-1 flex items-center gap-1">
            <button
              onClick={toggleMusic}
              data-testid="music-toggle-btn"
              className={`h-9 px-3 rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors ${
                musicOn ? 'bg-[#F4C56A]/20 text-[#FBE3A8]' : 'text-[#FFF4DE]/70 hover:text-[#FFF4DE] hover:bg-white/5'
              }`}
              title="Toggle ambient festive melody (no autoplay)"
              aria-label={musicOn ? 'Mute ambient melody' : 'Play ambient melody'}
            >
              {/* equaliser bars dance while music plays */}
              <span className="flex items-end gap-[2px] h-3" aria-hidden="true">
                {[0, 1, 2].map((b) => (
                  <span
                    key={b}
                    className="w-[2px] rounded-full bg-current"
                    style={{
                      height: musicOn ? `${6 + b * 3}px` : '4px',
                      animation: musicOn ? `floatY ${0.6 + b * 0.2}s ease-in-out infinite` : 'none',
                    }}
                  />
                ))}
              </span>
              <span className="hidden sm:inline">{musicOn ? 'Music On' : 'Music Off'}</span>
            </button>

            <button
              onClick={() => setShowPersonalizeModal(true)}
              data-testid="personalize-btn"
              className="h-9 px-3 rounded-full text-xs font-medium text-[#FFF4DE]/70 hover:text-[#FFF4DE] hover:bg-white/5 flex items-center gap-1.5 transition-colors"
              title="Edit names and personal memories"
            >
              <span aria-hidden="true">✎</span>
              <span className="hidden sm:inline">Personalize</span>
            </button>

            <button
              onClick={handleDownloadSingleFile}
              data-testid="download-file-btn"
              className="h-9 px-3.5 rounded-full text-xs font-semibold text-[#2A1606] bg-gradient-to-r from-[#F7D58A] to-[#FF9F2E] hover:brightness-110 flex items-center gap-1.5 transition"
              title="Download this website as a standalone .html file"
            >
              <span aria-hidden="true">↓</span>
              <span className="hidden sm:inline">Single .HTML</span>
            </button>
          </div>
        </div>
      </header>

      <ChapterNav chapters={CHAPTERS} />

      {/* ── The story ── */}
      <main className="relative z-10 w-full flex flex-col">
        <SectionSurprise onOpenSurprise={handleOpenSurprise} config={config} />
        <div ref={journeySectionRef}>
          <SectionCinematicJourney config={config} />
        </div>
        <SectionHeartMessage config={config} />
        <SectionCoupleGames config={config} />
        <SectionFinalWish onDiyaLit={playDiya} config={config} />
      </main>

      {/* ── Footer ── */}
      <footer className="relative z-10 px-6 pt-16 pb-12 text-center">
        <div className="max-w-xs mx-auto h-px bg-gradient-to-r from-transparent via-[#F4C56A]/50 to-transparent mb-10" />
        <p className="font-heading italic text-xl md:text-2xl text-[#FFF4DE]/85">
          &ldquo;In every lifetime, in every light — you are my favourite.&rdquo;
        </p>
        <p className="font-body text-[10px] text-[#FBE3A8]/45 mt-4 tracking-[0.35em] uppercase">
          Happy Diwali {config.herName} · Handcrafted with love
        </p>
      </footer>

      {/* ── Personalize sheet ── */}
      {showPersonalizeModal && (
        <div
          data-testid="personalize-modal"
          onClick={() => setShowPersonalizeModal(false)}
          className="fixed inset-0 z-[70] bg-[#07040F]/75 backdrop-blur-md flex items-end sm:items-center justify-center sm:p-4"
          style={{ animation: 'fadeIn .3s ease both' }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="personalize-title"
            onClick={(e) => e.stopPropagation()}
            className="paper-sheet relative w-full sm:max-w-lg rounded-t-[32px] sm:rounded-[32px] p-6 md:p-8 max-h-[92svh] overflow-y-auto"
            style={{ animation: 'sheetIn .5s cubic-bezier(.2,.7,.2,1) both' }}
          >
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <p className="font-hand text-xl text-[#B38B39]">make it yours</p>
                <h3 id="personalize-title" className="font-heading text-2xl font-bold text-[#382A2B]">
                  Personalise for Your Girlfriend
                </h3>
                <p className="text-xs text-[#633B48] mt-1">
                  Update her name, your name, and your 3 relationship memories
                </p>
              </div>
              <button
                onClick={() => setShowPersonalizeModal(false)}
                aria-label="Close personalise"
                className="w-10 h-10 shrink-0 rounded-full bg-[#382A2B] text-[#FFF4DE] hover:bg-[#633B48] flex items-center justify-center text-sm transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="pf-her" className={LABEL}>Girlfriend&apos;s Name</label>
                  <input
                    id="pf-her"
                    type="text"
                    value={customForm.herName}
                    onChange={(e) => setCustomForm({ ...customForm, herName: e.target.value })}
                    className={FIELD}
                  />
                </div>
                <div>
                  <label htmlFor="pf-you" className={LABEL}>Your Name</label>
                  <input
                    id="pf-you"
                    type="text"
                    value={customForm.yourName}
                    onChange={(e) => setCustomForm({ ...customForm, yourName: e.target.value })}
                    className={FIELD}
                  />
                </div>
              </div>

              {MEMORY_FIELDS.map((m) => (
                <div key={m.key}>
                  <label htmlFor={`pf-${m.key}`} className={LABEL}>{m.label}</label>
                  <textarea
                    id={`pf-${m.key}`}
                    value={customForm[m.key]}
                    onChange={(e) => setCustomForm({ ...customForm, [m.key]: e.target.value })}
                    rows={2}
                    className={`${FIELD} resize-none`}
                  />
                </div>
              ))}

              {/* Her golden-dot sky portrait for the final celebration */}
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#D6AD62]/40 bg-white/50 px-4 py-3">
                <div>
                  <p className={LABEL + ' !mb-0.5'}>Sky portrait</p>
                  <p className="text-xs text-[#633B48]">Her photo, drawn in golden stars at the finale</p>
                </div>
                <button
                  type="button"
                  data-testid="open-portrait-setup"
                  onClick={() => setShowPortraitSetup(true)}
                  className="btn-outline-gold !px-4 !py-2 shrink-0"
                >
                  Photo setup
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-6 mt-6 border-t border-[#D6AD62]/30">
              <button onClick={() => setShowPersonalizeModal(false)} className="btn-outline-gold flex-1">
                Cancel
              </button>
              <button
                onClick={handleSavePersonalization}
                className="flex-1 rounded-full py-3 text-xs font-semibold tracking-wider uppercase text-[#FFF4DE] bg-[#382A2B] hover:bg-[#633B48] transition-colors"
              >
                Save Changes ✨
              </button>
            </div>
          </div>
        </div>
      )}

      <PortraitUploader open={showPortraitSetup} onClose={() => setShowPortraitSetup(false)} />
    </div>
  )
}
