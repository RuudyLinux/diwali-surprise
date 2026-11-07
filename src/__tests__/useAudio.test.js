import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAudio } from '../hooks/useAudio'

describe('useAudio', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('initialises with musicOn=false', () => {
    const { result } = renderHook(() => useAudio())
    expect(result.current.musicOn).toBe(false)
  })

  it('initialises with sfxOn=true', () => {
    const { result } = renderHook(() => useAudio())
    expect(result.current.sfxOn).toBe(true)
  })

  it('toggleSfx flips sfxOn to false', () => {
    const { result } = renderHook(() => useAudio())
    act(() => result.current.toggleSfx())
    expect(result.current.sfxOn).toBe(false)
  })

  it('toggleSfx flips sfxOn back to true', () => {
    const { result } = renderHook(() => useAudio())
    act(() => result.current.toggleSfx())
    act(() => result.current.toggleSfx())
    expect(result.current.sfxOn).toBe(true)
  })

  it('toggleMusic sets musicOn to true', () => {
    const { result } = renderHook(() => useAudio())
    act(() => result.current.toggleMusic())
    expect(result.current.musicOn).toBe(true)
  })

  it('toggleMusic called twice sets musicOn back to false', () => {
    const { result } = renderHook(() => useAudio())
    act(() => result.current.toggleMusic())
    act(() => result.current.toggleMusic())
    expect(result.current.musicOn).toBe(false)
  })

  it('playPop does not throw when sfxOn=false', () => {
    const { result } = renderHook(() => useAudio())
    act(() => result.current.toggleSfx()) // sfxOn → false
    expect(() => act(() => result.current.playPop())).not.toThrow()
  })

  it('playPop does not throw when sfxOn=true', () => {
    const { result } = renderHook(() => useAudio())
    expect(() => act(() => result.current.playPop())).not.toThrow()
  })
})
