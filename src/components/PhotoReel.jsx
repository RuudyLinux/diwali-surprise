import React, { useState, useCallback } from 'react'
import { useCard } from '../context/CardContext'

export default function PhotoReel() {
  const { card, update } = useCard()
  const photos = card.photos || []

  // Lightbox state
  const [selectedPhoto, setSelectedPhoto] = useState(null)
  // Edit / Add photo modal state
  const [showAddModal, setShowAddModal] = useState(false)
  const [newPhotoUrl, setNewPhotoUrl] = useState('')
  const [newCaption, setNewCaption] = useState('')
  const [newDate, setNewDate] = useState('')

  const handleFileUpload = useCallback((e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setNewPhotoUrl(ev.target.result)
    }
    reader.readAsDataURL(file)
  }, [])

  const handleAddPhoto = useCallback(() => {
    if (!newPhotoUrl) return
    const newEntry = {
      id: `p-${Date.now()}`,
      url: newPhotoUrl,
      caption: newCaption || 'Festival of Light Memory',
      date: newDate || 'Diwali Celebration',
      rotation: (Math.random() * 6 - 3),
    }
    update({ photos: [...photos, newEntry] })
    setNewPhotoUrl('')
    setNewCaption('')
    setNewDate('')
    setShowAddModal(false)
  }, [newPhotoUrl, newCaption, newDate, photos, update])

  const handleDeletePhoto = useCallback((id, e) => {
    e.stopPropagation()
    const updated = photos.filter(p => p.id !== id)
    update({ photos: updated })
    if (selectedPhoto?.id === id) setSelectedPhoto(null)
  }, [photos, selectedPhoto, update])

  return (
    <section
      data-testid="photo-reel-section"
      className="relative py-16 px-4 md:px-8 max-w-6xl mx-auto z-10"
      aria-label="Diwali Photo Reel"
    >
      {/* ── Section Title ── */}
      <div className="text-center space-y-3 mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-xs uppercase tracking-widest">
          <span>✨</span>
          <span>Cherished Memories</span>
          <span>✨</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-display font-light tracking-tight text-[#f7e8c0]">
          Moments with <span className="italic text-[#ff9500] font-normal">{card.recipientName}</span>
        </h2>
        <p className="text-sm md:text-base max-w-lg mx-auto text-[#f7e8c0]/70 font-body">
          Every light shines brighter with you. Scrolling through our most radiant Diwali chapters.
        </p>

        {/* Add photo trigger */}
        <div className="pt-2">
          <button
            onClick={() => setShowAddModal(true)}
            data-testid="open-add-photo-btn"
            className="btn-ghost inline-flex items-center gap-2 text-xs py-2 px-4 rounded-full border border-amber-400/40 text-amber-300 hover:bg-amber-400/10 transition-all"
          >
            <span>📷</span>
            <span>Add Your Own Photo</span>
          </button>
        </div>
      </div>

      {/* ── Polaroid Reel Grid ── */}
      <div
        data-testid="photo-grid"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-6 pt-4"
      >
        {photos.map((item, idx) => (
          <div
            key={item.id}
            data-testid={`photo-card-${idx}`}
            onClick={() => setSelectedPhoto(item)}
            className="group relative cursor-pointer select-none transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
            style={{
              transform: `rotate(${item.rotation || 0}deg)`,
            }}
          >
            {/* Washi Tape or Golden Brass Clip */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20 w-14 h-5 bg-gradient-to-r from-amber-400/80 via-yellow-200/90 to-amber-500/80 rounded-sm shadow-md border-t border-b border-amber-600/40 opacity-90 transform -rotate-1" />

            {/* Polaroid Frame */}
            <div className="p-3.5 pb-6 bg-[#fdfbf7] rounded-xl shadow-xl border border-stone-200/60 transition-colors group-hover:bg-[#fffdf9]">
              {/* Photo Image Container */}
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-stone-900 border border-stone-200/40">
                <img
                  src={item.url}
                  alt={item.caption}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                {/* Light leak warm glow */}
                <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 via-transparent to-rose-500/10 pointer-events-none" />
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-[10px] text-amber-200 px-2 py-0.5 rounded-full font-mono">
                  {item.date}
                </div>
              </div>

              {/* Handwritten Style Caption */}
              <div className="mt-3 text-center px-1">
                <p className="font-display text-base font-medium text-stone-800 line-clamp-2">
                  {item.caption}
                </p>
                <p className="text-[11px] text-stone-400 mt-0.5 tracking-wider uppercase font-body">
                  Tap to view
                </p>
              </div>

              {/* Delete Button (optional for user customization) */}
              {photos.length > 1 && (
                <button
                  onClick={(e) => handleDeletePhoto(item.id, e)}
                  title="Remove photo"
                  aria-label="Remove photo"
                  className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 p-1 rounded-full text-stone-400 hover:text-rose-600 hover:bg-stone-100 transition-opacity"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── Lightbox Modal ── */}
      {selectedPhoto && (
        <div
          data-testid="photo-lightbox"
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-2xl w-full bg-[#fdfbf7] rounded-2xl p-4 md:p-6 shadow-2xl border border-amber-400/40 animate-in fade-in zoom-in-95 duration-200"
          >
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-stone-200 text-stone-700 hover:bg-stone-300 flex items-center justify-center text-sm font-bold z-10"
              aria-label="Close photo preview"
            >
              ✕
            </button>
            <div className="aspect-[4/3] rounded-xl overflow-hidden bg-stone-900 border border-stone-300">
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.caption}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="mt-4 text-center">
              <h3 className="font-display text-2xl font-bold text-stone-900">
                {selectedPhoto.caption}
              </h3>
              <p className="text-xs uppercase font-mono text-stone-500 mt-1">
                {selectedPhoto.date}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Photo Modal ── */}
      {showAddModal && (
        <div
          data-testid="add-photo-modal"
          onClick={() => setShowAddModal(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-md w-full bg-gradient-to-b from-stone-900 to-stone-950 border border-amber-400/40 rounded-2xl p-6 shadow-2xl text-amber-100 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-amber-400/20 pb-3">
              <h3 className="font-display text-xl font-bold text-amber-300">
                Add a Diwali Photo
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-stone-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block uppercase tracking-wider text-amber-200/70 mb-1">
                  Upload Image from Device
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="w-full text-stone-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-amber-500/20 file:text-amber-300 hover:file:bg-amber-500/30 cursor-pointer"
                />
              </div>

              <div className="relative flex items-center justify-center my-2">
                <span className="bg-stone-900 px-2 text-[10px] text-stone-500 uppercase">Or Image URL</span>
              </div>

              <div>
                <input
                  type="url"
                  placeholder="Paste https:// image URL..."
                  value={newPhotoUrl}
                  onChange={(e) => setNewPhotoUrl(e.target.value)}
                  className="w-full bg-stone-800/80 border border-amber-400/20 rounded-xl px-3 py-2 text-amber-100 placeholder-stone-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              {newPhotoUrl && (
                <div className="aspect-[4/3] rounded-lg overflow-hidden border border-amber-400/30 max-h-36 mx-auto bg-stone-900">
                  <img src={newPhotoUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}

              <div>
                <label className="block uppercase tracking-wider text-amber-200/70 mb-1">
                  Caption
                </label>
                <input
                  type="text"
                  placeholder="e.g. Joyful Diwali smiles ✨"
                  value={newCaption}
                  onChange={(e) => setNewCaption(e.target.value)}
                  maxLength={60}
                  className="w-full bg-stone-800/80 border border-amber-400/20 rounded-xl px-3 py-2 text-amber-100 placeholder-stone-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block uppercase tracking-wider text-amber-200/70 mb-1">
                  Date / Moment
                </label>
                <input
                  type="text"
                  placeholder="e.g. Diwali Night 2026"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  maxLength={30}
                  className="w-full bg-stone-800/80 border border-amber-400/20 rounded-xl px-3 py-2 text-amber-100 placeholder-stone-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="btn-ghost flex-1 py-2 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPhoto}
                disabled={!newPhotoUrl}
                className="btn-primary flex-1 py-2 text-xs disabled:opacity-40"
              >
                Add to Reel
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

