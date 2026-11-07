import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import React from 'react'
import { CardProvider } from '../context/CardContext'
import TheatreCurtain from '../components/TheatreCurtain'

function setup(props = {}) {
  return render(
    <CardProvider>
      <TheatreCurtain {...props} />
    </CardProvider>
  )
}

describe('TheatreCurtain', () => {
  it('renders theatre curtains and valance', () => {
    setup()
    expect(screen.getByTestId('left-curtain')).toBeTruthy()
    expect(screen.getByTestId('right-curtain')).toBeTruthy()
    expect(screen.getByTestId('theatre-valance')).toBeTruthy()
  })

  it('renders countdown title with recipient name', () => {
    setup()
    const title = screen.getByTestId('countdown-title')
    expect(title.textContent).toContain('Helly')
    expect(title.textContent).toContain('Diwali')
  })

  it('renders 4 countdown timer units (Days, Hours, Mins, Secs)', () => {
    setup()
    const timer = screen.getByTestId('countdown-timer')
    expect(timer.textContent).toContain('Days')
    expect(timer.textContent).toContain('Hours')
    expect(timer.textContent).toContain('Mins')
    expect(timer.textContent).toContain('Secs')
  })

  it('renders unveil button and pull cord', () => {
    setup()
    expect(screen.getByTestId('open-curtain-btn')).toBeTruthy()
    expect(screen.getByTestId('pull-cord')).toBeTruthy()
  })

  it('calls onSwoosh and opens curtains when unveil button is clicked', async () => {
    vi.useFakeTimers()
    const onSwoosh = vi.fn()
    const onOpen = vi.fn()
    setup({ onSwoosh, onOpen })

    fireEvent.click(screen.getByTestId('open-curtain-btn'))
    expect(onSwoosh).toHaveBeenCalledOnce()

    act(() => {
      vi.advanceTimersByTime(500)
    })
    expect(onOpen).toHaveBeenCalledOnce()
    vi.useRealTimers()
  })
})
