import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { PHOTO_DIYAS, PHOTO_RANGOLI, PHOTO_SWEETS, PHOTO_LANTERNS } from '../utils/defaultAssets'

const CardContext = createContext(null)

export const CARD_THEMES = {
  night: { label: 'Night Valley', bg: 'from-void to-violet/40', accent: '#ff9500' },
  golden: { label: 'Golden Dawn', bg: 'from-amber-900 to-amber-600', accent: '#fbbf24' },
  rose: { label: 'Rose Dusk', bg: 'from-rose-950 to-pink-700', accent: '#f472b6' },
}

export const DEFAULT_PHOTOS = [
  {
    id: 'p1',
    url: PHOTO_DIYAS,
    caption: 'Golden diyas lit with Helly 🪔',
    date: 'Diwali Night',
    rotation: -2,
  },
  {
    id: 'p2',
    url: PHOTO_RANGOLI,
    caption: "Helly's radiant smile & rangoli colors 🌸",
    date: 'Festive Morning',
    rotation: 2.5,
  },
  {
    id: 'p3',
    url: PHOTO_SWEETS,
    caption: 'Sharing boxes of fresh kaju katli with Helly 🍬',
    date: 'Festive Feast',
    rotation: -1.5,
  },
  {
    id: 'p4',
    url: PHOTO_LANTERNS,
    caption: 'Sending sky lanterns & wishes for Helly ✨',
    date: 'Midnight Glow',
    rotation: 2,
  },
]

export const DEFAULT_SCRAPBOOK_PAGES = [
  {
    id: 'page-1',
    title: "The Warmth of Helly's Light",
    subtitle: 'Where every moment turns golden',
    content: 'Dearest Helly, remember the crackle of sparklers and the warmth that filled our festive nights? Your laughter brings more brightness into our lives than a thousand glowing diyas. Every light lit tonight is a wish made for you.',
    stickers: ['🪔', '✨', '🌸'],
    blessing: 'May your smile shine brighter with every passing year, Helly.',
  },
  {
    id: 'page-2',
    title: 'Flavors of Joy with Helly',
    subtitle: 'Sweet memories sweeter than mithai',
    content: 'A pinch of festive sweetness, endless laughter, and boxes of fresh kaju katli shared together. Celebrating this festival with you, Helly, makes every single moment unforgettable.',
    stickers: ['🍬', '🍯', '🎆'],
    blessing: 'May sweetness and laughter overflow in every chapter of your life.',
  },
  {
    id: 'page-3',
    title: 'A Sacred Diya for Helly',
    subtitle: 'Click the diya to ignite the flame in her honor',
    content: 'Ancient traditions whisper that lighting a sacred diya in someone’s name welcomes eternal health, peace, and abundance into their home. This sacred flame is lit especially for you, Helly.',
    stickers: ['🪔', '🔥', '🙏'],
    diyaLit: false,
    blessing: 'Shubh Deepavali, Helly! May divine grace illuminate your journey.',
  },
  {
    id: 'page-4',
    title: 'Golden Wishes for Helly',
    subtitle: 'A prosperous and radiant year ahead',
    content: 'May all your cherished dreams soar as high as fireworks illuminating the midnight sky. Step into this auspicious new year with happiness, radiant health, and unwavering peace, Helly.',
    stickers: ['🌟', '💖', '🪅'],
    blessing: 'Always in your corner, celebrating your brightest light.',
  },
]

export const DEFAULTS = {
  recipientName: 'Helly',
  senderName: 'Your name',
  message: 'Dear Helly, may the radiant glow of diyas light your path with boundless joy, peace, and prosperity. You make every celebration so much brighter. Happy Diwali! 🪔✨',
  theme: 'night',
  font: 'display',
  targetDate: '2026-11-08T18:00:00',
  tagline: 'To dearest Helly — may your light forever outshine the stars.',
  curtainOpened: false,
  photos: DEFAULT_PHOTOS,
  scrapbookPages: DEFAULT_SCRAPBOOK_PAGES,
  chat: {
    avatar: '🪔',
    sender: 'Me',
    status: 'Active now · Lighting diyas for Helly 🪔',
    reactions: { '🪔': 18, '🎆': 12, '💖': 26, '✨': 35 },
  },
}

function parseUrlParams() {
  if (typeof window === 'undefined' || !window.location.search) return {}
  try {
    const params = new URLSearchParams(window.location.search)
    const result = {}
    if (params.get('to')) result.recipientName = params.get('to')
    if (params.get('from')) result.senderName = params.get('from')
    if (params.get('msg')) result.message = params.get('msg')
    if (params.get('theme') && CARD_THEMES[params.get('theme')]) result.theme = params.get('theme')
    if (params.get('date')) result.targetDate = params.get('date')
    if (params.get('opened') === '1') result.curtainOpened = true
    return result
  } catch {
    return {}
  }
}

export function CardProvider({ children }) {
  const [card, setCard] = useState(() => {
    const fromUrl = parseUrlParams()
    return { ...DEFAULTS, ...fromUrl }
  })

  const update = useCallback((patch) => {
    setCard(prev => {
      const next = { ...prev, ...patch }
      return next
    })
  }, [])

  const reset = useCallback(() => {
    setCard(DEFAULTS)
  }, [])

  const toggleCurtain = useCallback((opened) => {
    setCard(prev => ({
      ...prev,
      curtainOpened: typeof opened === 'boolean' ? opened : !prev.curtainOpened
    }))
  }, [])

  return (
    <CardContext.Provider value={{ card, update, reset, toggleCurtain, CARD_THEMES, parseUrlParams }}>
      {children}
    </CardContext.Provider>
  )
}

export function useCard() {
  const ctx = useContext(CardContext)
  if (!ctx) throw new Error('useCard must be used inside CardProvider')
  return ctx
}
