import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  PORTRAIT_ASPECT,
  PORTRAIT_OUTPUT,
  computeDots,
  cropRect,
  cropToCanvas,
  fileToCanvas,
  loadImage,
  makeDotSprites,
  renderDotPreview,
} from '../utils/portraitDots'
import { useSkyPortrait } from '../hooks/useSkyPortrait'

const ACCEPT = ['image/jpeg', 'image/png', 'image/webp']
const ACCEPT_EXT = /\.(jpe?g|png|webp)$/i
const MAX_BYTES = 25 * 1024 * 1024

export function validatePortraitFile(file) {
  if (!file) return 'No file selected.'
  const okType = ACCEPT.includes(file.type) || (!file.type && ACCEPT_EXT.test(file.name || ''))
  if (!okType) return 'Please choose a JPG, JPEG, PNG or WebP photo.'
  if (file.size > MAX_BYTES) return 'That photo is larger than 25 MB — please pick a smaller one.'
  return null
}

function Editor({ source, crop, setCrop }) {
  const frameRef = useRef(null)
  const canvasRef = useRef(null)
  const pointers = useRef(new Map())
  const pinch = useRef(null)
  const rect = useMemo(() => cropRect(source.width, source.height, crop), [source, crop])

  // Draw the current crop into the frame
  useEffect(() => {
    const c = canvasRef.current
    const frame = frameRef.current
    if (!c || !frame) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const W = Math.max(1, Math.round(frame.clientWidth * dpr))
    const H = Math.max(1, Math.round(frame.clientHeight * dpr))
    if (c.width !== W) c.width = W
    if (c.height !== H) c.height = H
    const g = c.getContext('2d')
    if (!g || typeof g.drawImage !== 'function') return
    g.imageSmoothingQuality = 'high'
    g.drawImage(source, rect.x, rect.y, rect.w, rect.h, 0, 0, W, H)
  }, [source, rect])

  const pan = useCallback(
    (dxCss, dyCss) => {
      const fw = frameRef.current?.clientWidth || 1
      const k = rect.w / fw
      setCrop((c) => {
        const r = cropRect(source.width, source.height, c)
        return { ...c, cx: r.cx - dxCss * k, cy: r.cy - dyCss * k }
      })
    },
    [rect.w, setCrop, source]
  )
  const zoomTo = useCallback(
    (z) => setCrop((c) => ({ ...c, zoom: Math.max(1, Math.min(4, z)) })),
    [setCrop]
  )

  const onPointerDown = (e) => {
    e.currentTarget.setPointerCapture?.(e.pointerId)
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()]
      pinch.current = { d: Math.hypot(a.x - b.x, a.y - b.y), zoom: crop.zoom }
    }
  }
  const onPointerMove = (e) => {
    const prev = pointers.current.get(e.pointerId)
    if (!prev) return
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (pointers.current.size === 2 && pinch.current) {
      const [a, b] = [...pointers.current.values()]
      zoomTo(pinch.current.zoom * (Math.hypot(a.x - b.x, a.y - b.y) / pinch.current.d))
    } else if (pointers.current.size === 1) {
      pan(e.clientX - prev.x, e.clientY - prev.y)
    }
  }
  const onPointerUp = (e) => {
    pointers.current.delete(e.pointerId)
    if (pointers.current.size < 2) pinch.current = null
  }
  const onWheel = (e) => {
    e.preventDefault()
    zoomTo(crop.zoom * Math.exp(-e.deltaY * 0.0015))
  }
  useEffect(() => {
    const el = frameRef.current
    if (!el) return
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  })
  const onKeyDown = (e) => {
    const step = (frameRef.current?.clientWidth || 300) * 0.03
    const map = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }
    if (map[e.key]) {
      e.preventDefault()
      pan(...map[e.key])
    } else if (e.key === '+' || e.key === '=') zoomTo(crop.zoom * 1.08)
    else if (e.key === '-') zoomTo(crop.zoom / 1.08)
  }

  const nudge = 'w-9 h-9 rounded-full bg-white/70 border border-[#D6AD62]/40 text-[#633B48] hover:bg-white flex items-center justify-center text-sm transition'

  return (
    <div className="space-y-3">
      <div
        ref={frameRef}
        tabIndex={0}
        role="application"
        aria-label="Crop frame. Drag to reposition, scroll or pinch to zoom, arrow keys to move."
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
        className="relative w-full max-w-[300px] mx-auto rounded-2xl overflow-hidden bg-[#2A1B26] cursor-grab active:cursor-grabbing shadow-[0_18px_40px_-12px_rgba(56,42,43,0.45)]"
        style={{ aspectRatio: `${PORTRAIT_ASPECT}`, touchAction: 'none' }}
      >
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        {/* face guide */}
        <svg viewBox="0 0 80 100" className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
          <ellipse cx="40" cy="44" rx="21" ry="28" fill="none" stroke="rgba(255,244,222,0.75)" strokeWidth="0.5" strokeDasharray="2 2" />
          <path d="M26.7 0v100M53.3 0v100M0 33.3h80M0 66.7h80" stroke="rgba(255,255,255,0.15)" strokeWidth="0.3" />
        </svg>
        <span className="absolute bottom-2 inset-x-0 text-center text-[10px] tracking-wider uppercase text-white/80 pointer-events-none">
          Fit her face inside the oval
        </span>
      </div>

      <div className="flex items-center gap-3 max-w-[300px] mx-auto">
        <button type="button" className={nudge} onClick={() => zoomTo(crop.zoom / 1.15)} aria-label="Zoom out">
          −
        </button>
        <input
          type="range"
          min="1"
          max="4"
          step="0.01"
          value={crop.zoom}
          onChange={(e) => zoomTo(parseFloat(e.target.value))}
          aria-label="Zoom"
          className="flex-1 accent-[#B38B39]"
        />
        <button type="button" className={nudge} onClick={() => zoomTo(crop.zoom * 1.15)} aria-label="Zoom in">
          +
        </button>
      </div>
      <div className="flex items-center justify-center gap-1.5">
        <button type="button" className={nudge} onClick={() => pan(-12, 0)} aria-label="Move left">←</button>
        <button type="button" className={nudge} onClick={() => pan(0, -12)} aria-label="Move up">↑</button>
        <button type="button" className={nudge} onClick={() => pan(0, 12)} aria-label="Move down">↓</button>
        <button type="button" className={nudge} onClick={() => pan(12, 0)} aria-label="Move right">→</button>
        <button
          type="button"
          className="ml-2 h-9 px-3 rounded-full text-[11px] uppercase tracking-wider text-[#633B48] border border-[#D6AD62]/40 hover:bg-white/60 transition"
          onClick={() => setCrop({ zoom: 1, cx: source.width / 2, cy: source.height * 0.45 })}
        >
          Reset
        </button>
      </div>
    </div>
  )
}

function DotPreview({ source, crop }) {
  const canvasRef = useRef(null)
  const sprites = useMemo(() => makeDotSprites(), [])
  const [count, setCount] = useState(0)

  useEffect(() => {
    const id = setTimeout(() => {
      const c = canvasRef.current
      if (!c) return
      const rect = cropRect(source.width, source.height, crop)
      let res = null
      try {
        const cropped = cropToCanvas(source, rect, { width: 320, height: 400 })
        res = computeDots(cropped, { cols: 96 })
      } catch {
        res = null
      }
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      c.width = Math.round(c.clientWidth * dpr) || 240
      c.height = Math.round(c.clientHeight * dpr) || 300
      renderDotPreview(c, res, sprites)
      setCount(res?.dots?.length || 0)
    }, 120)
    return () => clearTimeout(id)
  }, [source, crop, sprites])

  return (
    <div className="w-full max-w-[300px] mx-auto">
      <div className="relative rounded-2xl overflow-hidden bg-[#07040F] shadow-[0_18px_40px_-12px_rgba(7,4,15,0.6)]" style={{ aspectRatio: `${PORTRAIT_ASPECT}` }}>
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" data-testid="dot-preview" />
      </div>
      <p className="mt-2 text-center text-[11px] text-[#633B48]/80">
        Golden-dot preview{count ? ` · ${count.toLocaleString()} lights` : ''}
      </p>
    </div>
  )
}

function UploaderSheet({ onClose }) {
  const { src: savedSrc, origin, isDev, save, remove } = useSkyPortrait()
  const [source, setSource] = useState(null)
  const [crop, setCrop] = useState({ zoom: 1 })
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState(null) // { dataUrl, project, device }
  const [confirmRemove, setConfirmRemove] = useState(false)
  const fileRef = useRef(null)

  // Re-open an already saved portrait for adjustment
  useEffect(() => {
    if (source || !savedSrc) return
    let alive = true
    loadImage(savedSrc)
      .then((img) => {
        if (!alive) return
        const c = document.createElement('canvas')
        c.width = img.naturalWidth
        c.height = img.naturalHeight
        c.getContext('2d')?.drawImage?.(img, 0, 0)
        setSource(c)
        setCrop({ zoom: 1, cx: c.width / 2, cy: c.height / 2 })
      })
      .catch(() => {})
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedSrc])

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  const takeFile = async (file) => {
    const problem = validatePortraitFile(file)
    if (problem) {
      setError(problem)
      return
    }
    setError('')
    setResult(null)
    setBusy(true)
    try {
      const c = await fileToCanvas(file)
      setSource(c)
      setCrop({ zoom: 1, cx: c.width / 2, cy: c.height * 0.45 })
    } catch {
      setError('Sorry, that photo could not be opened. Try another JPG, PNG or WebP.')
    } finally {
      setBusy(false)
    }
  }

  const onDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer?.files?.[0]
    if (file) takeFile(file)
  }

  const usePhoto = async () => {
    if (!source) return
    setBusy(true)
    try {
      const out = cropToCanvas(source, cropRect(source.width, source.height, crop), PORTRAIT_OUTPUT)
      const dataUrl = out.toDataURL('image/jpeg', 0.9)
      const saved = await save(dataUrl)
      setResult({ dataUrl, ...saved })
    } catch {
      setError('Could not prepare the portrait. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  const doRemove = async () => {
    if (!confirmRemove) {
      setConfirmRemove(true)
      return
    }
    await remove()
    setSource(null)
    setResult(null)
    setConfirmRemove(false)
  }

  const pickFile = () => fileRef.current?.click()

  return (
    <div
      className="fixed inset-0 z-[80] bg-[#07040F]/80 backdrop-blur-md flex items-end sm:items-center justify-center sm:p-4"
      style={{ animation: 'fadeIn .3s ease both' }}
      onDragOver={(e) => {
        e.preventDefault()
        setDragOver(true)
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="portrait-title"
        data-testid="portrait-uploader"
        className="paper-sheet relative w-full sm:max-w-3xl rounded-t-[32px] sm:rounded-[32px] p-6 md:p-9 max-h-[94svh] overflow-y-auto"
        style={{ animation: 'sheetIn .5s cubic-bezier(.2,.7,.2,1) both' }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close photo setup"
          className="absolute top-5 right-5 w-10 h-10 rounded-full bg-[#382A2B] text-[#FFF4DE] hover:bg-[#633B48] flex items-center justify-center text-sm transition-colors"
        >
          ✕
        </button>

        <div className="text-center max-w-md mx-auto mb-7 pr-6 sm:pr-0">
          <p className="font-hand text-xl text-[#B38B39]">for the final surprise</p>
          <h3 id="portrait-title" className="font-heading text-2xl md:text-3xl font-bold text-[#382A2B]">
            Make the Sky Shine With You
          </h3>
          <p className="mt-2 text-sm text-[#633B48]">
            Add her favourite photograph and let the stars create a little magic.
          </p>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
          className="sr-only"
          data-testid="portrait-file-input"
          onChange={(e) => {
            const f = e.target.files?.[0]
            e.target.value = ''
            if (f) takeFile(f)
          }}
        />

        {!source ? (
          <button
            type="button"
            onClick={pickFile}
            className={`w-full rounded-3xl border-2 border-dashed px-6 py-14 flex flex-col items-center gap-4 transition-colors ${
              dragOver ? 'border-[#B38B39] bg-[#F4C56A]/15' : 'border-[#D6AD62]/50 hover:bg-white/50'
            }`}
          >
            <span className="w-16 h-16 rounded-full flex items-center justify-center text-2xl bg-gradient-to-br from-[#F7D58A] to-[#FF9F2E] shadow-lg">
              ✦
            </span>
            <span className="btn-gold pointer-events-none">{busy ? 'Opening…' : 'Upload Her Photo'}</span>
            <span className="text-xs text-[#633B48]/80">or drag &amp; drop · JPG, JPEG, PNG, WebP</span>
          </button>
        ) : (
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#633B48] mb-3 text-center">1 · Crop &amp; position</p>
              <Editor source={source} crop={crop} setCrop={setCrop} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#633B48] mb-3 text-center">2 · How she’ll shine in the sky</p>
              <DotPreview source={source} crop={crop} />
            </div>
          </div>
        )}

        {error && (
          <p role="alert" className="mt-4 text-center text-sm text-[#9E2A2B]">
            {error}
          </p>
        )}

        {result && (
          <div role="status" className="mt-6 rounded-2xl border border-[#D6AD62]/50 bg-white/60 p-4 text-sm text-[#382A2B]">
            <p className="font-semibold">✓ Her portrait is ready for the sky.</p>
            {result.project ? (
              <p className="mt-1 text-[#633B48]">
                Saved into the project as <code className="px-1 rounded bg-[#FFF4DE]">public/her-portrait.jpg</code> — it will be included
                in the next <code className="px-1 rounded bg-[#FFF4DE]">npm run build</code> and appear on every device once deployed.
              </p>
            ) : (
              <p className="mt-1 text-[#633B48]">
                Saved on this device{result.device ? '' : ' for this session'}. To show it on every device, download the prepared photo and place it
                in your project at <code className="px-1 rounded bg-[#FFF4DE]">public/her-portrait.jpg</code>, then rebuild &amp; deploy.
              </p>
            )}
            <a
              href={result.dataUrl}
              download="her-portrait.jpg"
              className="inline-block mt-3 text-xs font-semibold uppercase tracking-wider text-[#B38B39] underline underline-offset-4"
            >
              ↓ Download her-portrait.jpg
            </a>
          </div>
        )}

        <div className="mt-7 pt-5 border-t border-[#D6AD62]/30 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {source && (
              <button type="button" onClick={pickFile} className="btn-outline-gold !py-2.5">
                Replace photo
              </button>
            )}
            {(source || savedSrc) && (
              <button
                type="button"
                onClick={doRemove}
                className={`btn-outline-gold !py-2.5 ${confirmRemove ? '!border-[#9E2A2B] !text-[#9E2A2B]' : ''}`}
              >
                {confirmRemove ? 'Tap again to remove' : 'Remove photo'}
              </button>
            )}
          </div>
          {source && (
            <button
              type="button"
              onClick={usePhoto}
              disabled={busy}
              className="rounded-full px-6 py-3 text-xs font-semibold tracking-wider uppercase text-[#FFF4DE] bg-[#382A2B] hover:bg-[#633B48] disabled:opacity-60 transition-colors"
            >
              {busy ? 'Preparing…' : result ? 'Update Photo ✨' : 'Use This Photo ✨'}
            </button>
          )}
        </div>

        <p className="mt-5 text-[11px] leading-relaxed text-[#633B48]/70 text-center">
          Her photo stays private to this website: it is processed only in your browser
          {isDev ? ' and saved into your local project folder' : ''}. It is never sent to any AI or third-party service.
          {origin === 'project' && !source ? ' Currently using the portrait shipped with the website.' : ''}
        </p>
      </div>
    </div>
  )
}

export default function PortraitUploader({ open, onClose }) {
  if (!open || typeof document === 'undefined') return null
  return createPortal(<UploaderSheet onClose={onClose} />, document.body)
}
