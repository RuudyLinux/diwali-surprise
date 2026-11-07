import React, { useCallback, useState } from 'react'
import { useShare } from '../hooks/useShare'
import { useCard } from '../context/CardContext'
import { generateSingleHtml } from '../utils/exportSingleHtml'

const PLATFORM_META = [
  { key: 'whatsapp', label: 'WhatsApp', color: '#25D366',
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.564 4.14 1.546 5.874L0 24l6.291-1.521A11.942 11.942 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.794 9.794 0 0 1-5.001-1.372l-.359-.214-3.724.9.934-3.618-.234-.372A9.774 9.774 0 0 1 2.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/>
      </svg>
    )},
  { key: 'twitter', label: 'X / Twitter', color: '#1DA1F2',
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    )},
  { key: 'facebook', label: 'Facebook', color: '#1877F2',
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    )},
  { key: 'telegram', label: 'Telegram', color: '#0088cc',
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
      </svg>
    )},
]

export default function SharePanel() {
  const { card } = useCard()
  const { shareNative, shareTo, copyLink, copied, sharing } = useShare({
    recipientName: card.recipientName,
    senderName:    card.senderName,
  })

  const [downloaded, setDownloaded] = useState(false)
  const hasNativeShare = typeof navigator !== 'undefined' && !!navigator.share

  const handleDownloadSingleHtml = useCallback(() => {
    try {
      const htmlContent = generateSingleHtml(card)
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      const safeName = (card.recipientName || 'diwali').toLowerCase().replace(/[^a-z0-9]/g, '-')
      a.href = url
      a.download = `curtain-drop-diwali-${safeName}.html`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      setDownloaded(true)
      setTimeout(() => setDownloaded(false), 2500)
    } catch (e) {
      console.error(e)
    }
  }, [card])

  return (
    <div data-testid="share-panel" className="space-y-4">
      {/* ── Single .HTML File Download ── */}
      <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-400/30 space-y-2">
        <p className="text-[11px] uppercase tracking-wider text-amber-300 font-bold flex items-center gap-1.5">
          <span>📦</span>
          <span>Send As One .HTML File</span>
        </p>
        <p className="text-xs text-parchment/70 dark:text-parchment/70 leading-relaxed">
          Download this entire customized Diwali experience as a single offline web page to email or send via WhatsApp.
        </p>
        <button
          onClick={handleDownloadSingleHtml}
          data-testid="download-single-html-btn"
          className="btn-primary w-full py-2.5 text-xs flex items-center justify-center gap-2"
        >
          <span>📥</span>
          <span>{downloaded ? 'Downloaded Successfully! ✨' : 'Download Single .HTML File'}</span>
        </button>
      </div>

      {/* Native share (mobile) */}
      {hasNativeShare && (
        <button
          onClick={shareNative}
          disabled={sharing}
          className="btn-primary w-full flex items-center justify-center gap-2"
          aria-label="Share using device share sheet"
        >
          <ShareIcon />
          {sharing ? 'Sharing…' : 'Share this wish'}
        </button>
      )}

      {/* Platform grid */}
      <div className="grid grid-cols-2 gap-2">
        {PLATFORM_META.map(({ key, label, color, icon }) => (
          <button
            key={key}
            onClick={() => shareTo(key)}
            aria-label={`Share on ${label}`}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl
                       border border-parchment/10 text-xs font-medium
                       hover:border-parchment/30 transition-all duration-200
                       hover:bg-parchment/5"
            style={{ color }}
          >
            {icon}
            <span className="text-parchment/70 dark:text-parchment/70
                             html:not(.dark):text-stone-700">
              {label}
            </span>
          </button>
        ))}
      </div>

      {/* Copy link */}
      <button
        onClick={copyLink}
        className="btn-ghost w-full flex items-center justify-center gap-2 text-xs"
        aria-label="Copy link to clipboard"
      >
        {copied ? (
          <><CheckIcon /><span>Copied!</span></>
        ) : (
          <><LinkIcon /><span>Copy link</span></>
        )}
      </button>
    </div>
  )
}

function ShareIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
}

function LinkIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  )
}
