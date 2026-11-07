import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import React from 'react'
import { CardProvider } from '../context/CardContext'
import Scrapbook from '../components/Scrapbook'

function setup(props = {}) {
  return render(
    <CardProvider>
      <Scrapbook {...props} />
    </CardProvider>
  )
}

describe('Scrapbook', () => {
  it('renders scrapbook album and first page content for Helly', () => {
    setup()
    expect(screen.getByTestId('scrapbook-section')).toBeTruthy()
    expect(screen.getByTestId('scrapbook-album')).toBeTruthy()
    expect(screen.getByText("The Warmth of Helly's Light")).toBeTruthy()
    expect(screen.getByText('Page 1 of 4')).toBeTruthy()
  })

  it('turns to next page when next button is clicked', async () => {
    vi.useFakeTimers()
    const onPageTurn = vi.fn()
    setup({ onPageTurn })

    fireEvent.click(screen.getByTestId('scrapbook-next-btn'))
    expect(onPageTurn).toHaveBeenCalledOnce()

    act(() => {
      vi.advanceTimersByTime(400)
    })

    expect(screen.getByText('Flavors of Joy with Helly')).toBeTruthy()
    expect(screen.getByText('Page 2 of 4')).toBeTruthy()
    vi.useRealTimers()
  })

  it('navigates to page 3 and allows toggling sacred diya for Helly', async () => {
    vi.useFakeTimers()
    const onLightDiya = vi.fn()
    setup({ onLightDiya })

    // Page 1 -> 2
    fireEvent.click(screen.getByTestId('scrapbook-next-btn'))
    act(() => {
      vi.advanceTimersByTime(400)
    })

    // Page 2 -> 3
    fireEvent.click(screen.getByTestId('scrapbook-next-btn'))
    act(() => {
      vi.advanceTimersByTime(400)
    })

    expect(screen.getByText('A Sacred Diya for Helly')).toBeTruthy()
    const diyaTrigger = screen.getByTestId('interactive-diya-trigger')
    expect(diyaTrigger).toBeTruthy()

    fireEvent.click(diyaTrigger)
    expect(onLightDiya).toHaveBeenCalledOnce()
    vi.useRealTimers()
  })
})
