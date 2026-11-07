import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useShare, PLATFORMS } from '../hooks/useShare'

describe('PLATFORMS', () => {
  it('generates a WhatsApp URL with encoded text and url', () => {
    const url  = 'https://example.com'
    const text = 'Happy Diwali!'
    const link = PLATFORMS.whatsapp(url, text)
    expect(link).toContain('wa.me')
    expect(link).toContain(encodeURIComponent(text))
  })

  it('generates a Twitter URL with text param', () => {
    const link = PLATFORMS.twitter('https://x.com', 'Diwali')
    expect(link).toContain('twitter.com/intent/tweet')
    expect(link).toContain('text=')
  })

  it('generates a Facebook sharer URL', () => {
    const link = PLATFORMS.facebook('https://fb.com')
    expect(link).toContain('facebook.com/sharer')
  })

  it('generates a Telegram share URL', () => {
    const link = PLATFORMS.telegram('https://t.me', 'Hi')
    expect(link).toContain('t.me/share/url')
  })
})

describe('useShare', () => {
  const defaults = { recipientName: 'Priya', senderName: 'Ravi' }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('copyLink calls clipboard.writeText with the page URL', async () => {
    const { result } = renderHook(() => useShare(defaults))
    await act(async () => { await result.current.copyLink() })
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(window.location.href)
  })

  it('copied becomes true after copyLink and resets to false', async () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useShare(defaults))
    await act(async () => { await result.current.copyLink() })
    expect(result.current.copied).toBe(true)
    act(() => { vi.advanceTimersByTime(2100) })
    expect(result.current.copied).toBe(false)
    vi.useRealTimers()
  })

  it('shareText contains both names', () => {
    const { result } = renderHook(() => useShare(defaults))
    expect(result.current.shareText).toContain('Priya')
    expect(result.current.shareText).toContain('Ravi')
  })

  it('shareNative returns false when navigator.share is undefined', async () => {
    const origShare = navigator.share
    navigator.share = undefined
    const { result } = renderHook(() => useShare(defaults))
    const res = await act(async () => result.current.shareNative())
    expect(res).toBe(false)
    navigator.share = origShare
  })

  it('shareNative calls navigator.share with correct args when available', async () => {
    const { result } = renderHook(() => useShare(defaults))
    await act(async () => { await result.current.shareNative() })
    expect(navigator.share).toHaveBeenCalledWith(expect.objectContaining({
      title: expect.stringContaining('Diwali'),
      text:  expect.stringContaining('Priya'),
    }))
  })
})
