import React from 'react'
import { useCard, CARD_THEMES } from '../context/CardContext'

/* ── Preview card (the actual card people see / share) ─────── */
export function CardPreview({ className = '' }) {
  const { card, CARD_THEMES } = useCard()
  const theme = CARD_THEMES[card.theme]

  return (
    <div
      data-testid="card-preview"
      className={`relative overflow-hidden rounded-2xl border border-parchment/10
                  flex flex-col items-center justify-center text-center
                  p-6 md:p-10 select-none ${className}`}
      style={{ background: `linear-gradient(135deg, var(--tw-gradient-stops))` }}
    >
      {/* Background gradient layer */}
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.bg} opacity-90 rounded-2xl`} />

      {/* Stars */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
        {Array.from({ length: 28 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white animate-pulse-slow"
            style={{
              width:  `${1 + (i % 3) * 0.5}px`,
              height: `${1 + (i % 3) * 0.5}px`,
              left:   `${(i * 37.5) % 100}%`,
              top:    `${(i * 23.7) % 55}%`,
              opacity: 0.3 + (i % 4) * 0.15,
              animationDelay: `${i * 0.18}s`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 space-y-3">
        <p className="text-xs uppercase tracking-widest opacity-60"
           style={{ fontFamily: 'Manrope, sans-serif' }}>
          A Diwali wish
        </p>
        <div className="text-5xl md:text-6xl animate-float">🪔</div>

        <h2
          className={`text-2xl md:text-4xl leading-tight font-semibold text-parchment
                      ${card.font === 'display' ? 'font-display' : 'font-body'}`}
          style={{ color: '#f7e8c0' }}
        >
          Happy Diwali,<br />{card.recipientName || 'dear one'}!
        </h2>

        <p
          className="text-sm md:text-base leading-relaxed max-w-xs mx-auto"
          style={{ color: 'rgba(247,232,192,0.75)', fontFamily: 'Manrope, sans-serif' }}
        >
          {card.message}
        </p>

        <p className="text-xs opacity-50 pt-2"
           style={{ color: '#f7e8c0', fontFamily: 'Manrope, sans-serif' }}>
          — with love, {card.senderName || 'someone who cares'}
        </p>
      </div>
    </div>
  )
}

/* ── Editor panel ───────────────────────────────────────────── */
export function CardEditor() {
  const { card, update, reset, CARD_THEMES } = useCard()

  return (
    <div data-testid="card-editor" className="space-y-5 text-sm">
      {/* Recipient */}
      <Field label="To">
        <input
          type="text"
          value={card.recipientName}
          onChange={e => update({ recipientName: e.target.value })}
          placeholder="Recipient's name"
          maxLength={40}
          className="input-field"
          aria-label="Recipient name"
        />
      </Field>

      {/* Sender */}
      <Field label="From">
        <input
          type="text"
          value={card.senderName}
          onChange={e => update({ senderName: e.target.value })}
          placeholder="Your name"
          maxLength={40}
          className="input-field"
          aria-label="Sender name"
        />
      </Field>

      {/* Message */}
      <Field label="Message">
        <textarea
          value={card.message}
          onChange={e => update({ message: e.target.value })}
          rows={3}
          maxLength={240}
          placeholder="Your Diwali wish…"
          className="input-field resize-none"
          aria-label="Greeting message"
        />
        <p className="text-right text-xs opacity-40 mt-1">
          {card.message.length}/240
        </p>
      </Field>

      {/* Tagline */}
      <Field label="Tagline">
        <input
          type="text"
          value={card.tagline || ''}
          onChange={e => update({ tagline: e.target.value })}
          placeholder="e.g. To dearest Helly..."
          maxLength={70}
          className="input-field"
          aria-label="Festival tagline"
        />
      </Field>

      {/* Countdown Date */}
      <Field label="Diwali Countdown Target">
        <input
          type="datetime-local"
          value={card.targetDate ? card.targetDate.slice(0, 16) : ''}
          onChange={e => update({ targetDate: e.target.value })}
          className="input-field"
          aria-label="Target countdown date"
        />
      </Field>

      {/* Theme */}
      <Field label="Theme">
        <div className="flex gap-2">
          {Object.entries(CARD_THEMES).map(([key, t]) => (
            <button
              key={key}
              onClick={() => update({ theme: key })}
              aria-pressed={card.theme === key}
              aria-label={`Theme: ${t.label}`}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium border
                          transition-all duration-200
                          ${card.theme === key
                            ? 'border-flame text-flame bg-flame/10'
                            : 'border-parchment/15 text-parchment/50 hover:border-parchment/40'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </Field>

      {/* Font */}
      <Field label="Style">
        <div className="flex gap-2">
          {[
            { key: 'display', label: 'Serif' },
            { key: 'body',    label: 'Sans' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => update({ font: key })}
              aria-pressed={card.font === key}
              aria-label={`Font: ${label}`}
              className={`flex-1 py-2 rounded-xl text-xs font-medium border
                          transition-all duration-200
                          ${card.font === key
                            ? 'border-flame text-flame bg-flame/10'
                            : 'border-parchment/15 text-parchment/50 hover:border-parchment/40'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </Field>

      <button onClick={reset} className="btn-ghost w-full text-xs opacity-60">
        Reset to defaults
      </button>

      <style>{`
        .input-field {
          width: 100%;
          background: rgba(247,232,192,.06);
          border: 1px solid rgba(247,232,192,.15);
          border-radius: 10px;
          padding: 8px 12px;
          color: #f7e8c0;
          font-family: Manrope, sans-serif;
          font-size: 13px;
          outline: none;
          transition: border-color .2s;
        }
        html:not(.dark) .input-field {
          background: rgba(0,0,0,.04);
          border-color: rgba(0,0,0,.15);
          color: #1c1917;
        }
        .input-field:focus {
          border-color: rgba(255,149,0,.6);
        }
      `}</style>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium uppercase tracking-wider opacity-50">
        {label}
      </label>
      {children}
    </div>
  )
}
