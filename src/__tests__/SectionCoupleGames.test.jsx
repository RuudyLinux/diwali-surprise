import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import SectionCoupleGames from '../components/SectionCoupleGames'
import { DIWALI_CONFIG } from '../config/diwaliConfig'

describe('SectionCoupleGames', () => {
  it('renders section heading and all five game cards (no quiz)', () => {
    render(<SectionCoupleGames config={DIWALI_CONFIG} />)

    expect(screen.getByTestId('couple-games-heading')).toHaveTextContent(
      'A Little Playtime for Us ❤️'
    )

    // Quiz challenge was removed
    expect(screen.queryByTestId('game-card-quiz')).toBeNull()
    expect(screen.queryByText(/How Well Do You Know Me/i)).toBeNull()

    // Verify all 5 games exist
    expect(screen.getByTestId('game-card-thisOrThat')).toBeInTheDocument()
    expect(screen.getByTestId('game-card-treasureHunt')).toBeInTheDocument()
    expect(screen.getByTestId('game-card-truthOrDare')).toBeInTheDocument()
    expect(screen.getByTestId('game-card-scratchCard')).toBeInTheDocument()
    expect(screen.getByTestId('game-card-spinWheel')).toBeInTheDocument()

    // Must NOT contain "Match Our Memories"
    expect(screen.queryByText(/Match Our Memories/i)).toBeNull()
  })

  it('opens and closes a game modal', () => {
    render(<SectionCoupleGames config={DIWALI_CONFIG} />)

    fireEvent.click(screen.getByTestId('game-card-thisOrThat'))
    expect(screen.getByTestId('game-modal-backdrop')).toBeInTheDocument()
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    fireEvent.click(screen.getByLabelText('Close game'))
    expect(screen.queryByTestId('game-modal-backdrop')).toBeNull()
  })

  it('closes the game modal with Escape', () => {
    render(<SectionCoupleGames config={DIWALI_CONFIG} />)

    fireEvent.click(screen.getByTestId('game-card-spinWheel'))
    expect(screen.getByTestId('game-modal-backdrop')).toBeInTheDocument()

    fireEvent.keyDown(window, { key: 'Escape' })
    expect(screen.queryByTestId('game-modal-backdrop')).toBeNull()
  })

  it('allows playing a round of This or That', () => {
    render(<SectionCoupleGames config={DIWALI_CONFIG} />)

    // Open This or That
    fireEvent.click(screen.getByTestId('game-card-thisOrThat'))

    expect(screen.getByText(/Long Drives/i)).toBeInTheDocument()
    expect(screen.getByText(/Movie Nights/i)).toBeInTheDocument()

    // Choose Long Drives
    fireEvent.click(screen.getByText(/Long Drives/i))
  })

  it('allows answering a clue in Love Treasure Hunt', () => {
    render(<SectionCoupleGames config={DIWALI_CONFIG} />)

    // Open Treasure Hunt
    fireEvent.click(screen.getByTestId('game-card-treasureHunt'))

    expect(
      screen.getByText('What is the one thing that makes my day instantly better?')
    ).toBeInTheDocument()

    // Click correct option
    fireEvent.click(screen.getByText('Your morning text & sweet voice'))

    expect(
      screen.getByText(/Correct! You already know how to make my world brighter./i)
    ).toBeInTheDocument()
  })

  it('switches between Truth and Dare tabs', () => {
    render(<SectionCoupleGames config={DIWALI_CONFIG} />)

    // Open Truth or Dare
    fireEvent.click(screen.getByTestId('game-card-truthOrDare'))

    // Initially on Truth
    expect(screen.getByText(/Romantic Truth/i)).toBeInTheDocument()

    // Switch to Dare
    fireEvent.click(screen.getByRole('button', { name: /🔥 Dare/i }))
    expect(screen.getByText(/Sweet Little Dare/i)).toBeInTheDocument()
  })
})
