import { useState, useCallback } from 'react'

const PLATFORMS = {
  whatsapp: (url, text) =>
    `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
  twitter: (url, text) =>
    `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
  facebook: (url) =>
    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  telegram: (url, text) =>
    `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
}

export function buildShareUrl({ recipientName, senderName, message, theme }) {
  if (typeof window === 'undefined') return ''
  try {
    const url = new URL(window.location.origin + window.location.pathname)
    if (recipientName) url.searchParams.set('to', recipientName)
    if (senderName)    url.searchParams.set('from', senderName)
    if (message)       url.searchParams.set('msg', message)
    if (theme)         url.searchParams.set('theme', theme)
    return url.toString()
  } catch {
    return typeof window !== 'undefined' ? window.location.href : ''
  }
}

export function useShare({ recipientName, senderName }) {
  const [copied, setCopied]   = useState(false)
  const [sharing, setSharing] = useState(false)

  const pageUrl = typeof window !== 'undefined' ? window.location.href : ''
  const shareText = `🪔 Wishing ${recipientName} a Happy Diwali! — from ${senderName}`

  // Native share sheet (mobile)
  const shareNative = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.share) return false
    setSharing(true)
    try {
      await navigator.share({ title: 'Happy Diwali 🪔', text: shareText, url: pageUrl })
      return true
    } catch {
      return false
    } finally {
      setSharing(false)
    }
  }, [shareText, pageUrl])

  // Platform-specific
  const shareTo = useCallback((platform) => {
    const fn = PLATFORMS[platform]
    if (!fn) return
    if (typeof window !== 'undefined') {
      window.open(fn(pageUrl, shareText), '_blank', 'noopener,noreferrer,width=600,height=500')
    }
  }, [pageUrl, shareText])

  // Copy link to clipboard
  const copyLink = useCallback(async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(pageUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch {
      /* silently fail in test environments */
    }
  }, [pageUrl])

  return { shareNative, shareTo, copyLink, copied, sharing, pageUrl, shareText, buildShareUrl }
}

export { PLATFORMS }
