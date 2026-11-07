import React from 'react'
import { useTheme } from '../context/ThemeContext'

export default function Toolbar({ musicOn, sfxOn, onToggleMusic, onToggleSfx }) {
  const { dark, toggle: toggleTheme } = useTheme()

  return (
    <div
      data-testid="toolbar"
      className="flex items-center gap-1.5"
      role="toolbar"
      aria-label="Controls"
    >
      {/* Music */}
      <ToolBtn
        onClick={onToggleMusic}
        pressed={musicOn}
        label={musicOn ? 'Mute music' : 'Play ambient music'}
        title="Background music"
      >
        {musicOn ? <SpeakerWaveIcon /> : <SpeakerXIcon />}
      </ToolBtn>

      {/* SFX */}
      <ToolBtn
        onClick={onToggleSfx}
        pressed={sfxOn}
        label={sfxOn ? 'Mute sound effects' : 'Enable sound effects'}
        title="Sound effects"
      >
        {sfxOn ? <BellIcon /> : <BellSlashIcon />}
      </ToolBtn>

      {/* Dark mode */}
      <ToolBtn
        onClick={toggleTheme}
        pressed={dark}
        label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
        title="Toggle dark mode"
      >
        {dark ? <SunIcon /> : <MoonIcon />}
      </ToolBtn>
    </div>
  )
}

function ToolBtn({ onClick, pressed, label, title, children }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={pressed}
      aria-label={label}
      title={title}
      className={`w-9 h-9 rounded-full grid place-items-center
                  border transition-all duration-200
                  focus-visible:outline focus-visible:outline-2 focus-visible:outline-flame
                  ${pressed
                    ? 'border-flame/60 bg-flame/15 text-flame'
                    : 'border-parchment/15 text-parchment/50 hover:border-parchment/40 hover:text-parchment'}`}
    >
      {children}
    </button>
  )
}

/* ── icons (inline SVG, no deps) ─────────────────────────────── */
const ico = (d, extra) => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
       stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
       {...extra}>
    <path d={d} />
  </svg>
)

function SpeakerWaveIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 9.5v5h3.5L12 18V6L7.5 9.5Z" />
      <path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" />
    </svg>
  )
}
function SpeakerXIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 9.5v5h3.5L12 18V6L7.5 9.5Z" />
      <path d="m16 10 4 4m0-4-4 4" />
    </svg>
  )
}
function BellIcon() {
  return ico('M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9')
}
function BellSlashIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.354 3.573A6 6 0 0118 9v2.159M6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h11M15 17v1a3 3 0 11-6 0v-1m9-14L3 21"/>
    </svg>
  )
}
function SunIcon() {
  return ico('M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 7a5 5 0 1 0 0 10A5 5 0 0 0 12 7z')
}
function MoonIcon() {
  return ico('M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z')
}
