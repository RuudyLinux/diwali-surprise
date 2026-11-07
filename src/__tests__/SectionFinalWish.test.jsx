import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import SectionFinalWish, { IGNITION_MS, SKY_DELAY_S } from '../components/SectionFinalWish'
import { DIWALI_CONFIG } from '../config/diwaliConfig'

describe('SectionFinalWish — diya → sky celebration', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('ignites the diya, waits 5 s after it is lit, then opens the sky celebration', () => {
    const onDiyaLit = vi.fn()
    render(<SectionFinalWish config={DIWALI_CONFIG} onDiyaLit={onDiyaLit} />)

    fireEvent.click(screen.getByTestId('light-diya-for-us-btn'))
    expect(onDiyaLit).toHaveBeenCalledTimes(1)
    expect(screen.getByTestId('final-diya')).toHaveAttribute('data-stage', 'igniting')
    expect(screen.queryByTestId('light-diya-for-us-btn')).toBeNull()

    act(() => vi.advanceTimersByTime(IGNITION_MS))
    expect(screen.getByTestId('final-diya')).toHaveAttribute('data-stage', 'lit')
    expect(screen.getByTestId('sky-countdown')).toBeInTheDocument()
    expect(screen.queryByTestId('sky-celebration')).toBeNull()

    act(() => vi.advanceTimersByTime(SKY_DELAY_S * 1000 - 100))
    expect(screen.queryByTestId('sky-celebration')).toBeNull()

    act(() => vi.advanceTimersByTime(200))
    expect(screen.getByRole('dialog', { name: 'Diwali sky celebration' })).toBeInTheDocument()
  })

  it('has sound, volume, replay and close controls; close returns to the section', () => {
    render(<SectionFinalWish config={DIWALI_CONFIG} />)
    fireEvent.click(screen.getByTestId('light-diya-for-us-btn'))
    act(() => vi.advanceTimersByTime(IGNITION_MS + SKY_DELAY_S * 1000 + 50))

    const mute = screen.getByTestId('sky-mute-btn')
    expect(mute).toHaveAttribute('aria-label', 'Mute sound')
    fireEvent.click(mute)
    expect(screen.getByTestId('sky-mute-btn')).toHaveAttribute('aria-label', 'Unmute sound')
    fireEvent.change(screen.getByTestId('sky-volume'), { target: { value: '0.5' } })
    expect(screen.getByTestId('sky-mute-btn')).toHaveAttribute('aria-label', 'Mute sound')

    fireEvent.click(screen.getByTestId('sky-replay-btn'))
    expect(screen.getByTestId('sky-celebration')).toBeInTheDocument()

    fireEvent.click(screen.getByTestId('sky-close-btn'))
    act(() => vi.advanceTimersByTime(1000))
    expect(screen.queryByTestId('sky-celebration')).toBeNull()
    expect(screen.getByTestId('relive-sky-btn')).toBeInTheDocument()
  })
})
