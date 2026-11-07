import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { CardProvider, useCard, CARD_THEMES } from '../context/CardContext'

function Consumer() {
  const { card, update, reset } = useCard()
  return (
    <div>
      <span data-testid="recipient">{card.recipientName}</span>
      <span data-testid="theme">{card.theme}</span>
      <span data-testid="font">{card.font}</span>
      <button onClick={() => update({ recipientName: 'Anjali' })}>Set name</button>
      <button onClick={() => update({ theme: 'rose' })}>Set rose</button>
      <button onClick={reset}>Reset</button>
    </div>
  )
}

describe('CardContext', () => {
  function setup() {
    return render(<CardProvider><Consumer /></CardProvider>)
  }

  it('provides default recipientName', () => {
    setup()
    expect(screen.getByTestId('recipient').textContent).toBe('Helly')
  })

  it('provides default theme "night"', () => {
    setup()
    expect(screen.getByTestId('theme').textContent).toBe('night')
  })

  it('update changes recipientName', () => {
    setup()
    fireEvent.click(screen.getByText('Set name'))
    expect(screen.getByTestId('recipient').textContent).toBe('Anjali')
  })

  it('update changes theme independently', () => {
    setup()
    fireEvent.click(screen.getByText('Set rose'))
    expect(screen.getByTestId('theme').textContent).toBe('rose')
  })

  it('reset restores defaults', () => {
    setup()
    fireEvent.click(screen.getByText('Set name'))
    fireEvent.click(screen.getByText('Reset'))
    expect(screen.getByTestId('recipient').textContent).toBe('Helly')
  })

  it('provides CARD_THEMES constant with night, golden, rose', () => {
    expect(CARD_THEMES.night).toBeDefined()
    expect(CARD_THEMES.golden).toBeDefined()
    expect(CARD_THEMES.rose).toBeDefined()
  })

  it('throws if used outside provider', () => {
    expect(() => render(<Consumer />)).toThrow('useCard must be used inside CardProvider')
  })
})
