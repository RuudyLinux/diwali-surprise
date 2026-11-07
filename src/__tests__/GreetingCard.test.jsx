import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { CardProvider } from '../context/CardContext'
import { CardPreview, CardEditor } from '../components/GreetingCard'

function withCard(ui) {
  return render(<CardProvider>{ui}</CardProvider>)
}

describe('CardPreview', () => {
  it('renders without crashing', () => {
    withCard(<CardPreview />)
    expect(screen.getByTestId('card-preview')).toBeTruthy()
  })

  it('shows default recipient name', () => {
    withCard(<CardPreview />)
    expect(screen.getByTestId('card-preview').textContent).toContain('Helly')
  })

  it('shows the diya emoji', () => {
    withCard(<CardPreview />)
    expect(screen.getByTestId('card-preview').textContent).toContain('🪔')
  })

  it('shows "Happy Diwali" text', () => {
    withCard(<CardPreview />)
    expect(screen.getByTestId('card-preview').textContent).toContain('Happy Diwali')
  })
})

describe('CardEditor', () => {
  it('renders without crashing', () => {
    withCard(<CardEditor />)
    expect(screen.getByTestId('card-editor')).toBeTruthy()
  })

  it('has recipient input pre-filled with default', () => {
    withCard(<CardEditor />)
    const input = screen.getByLabelText('Recipient name')
    expect(input.value).toBe('Helly')
  })

  it('updates recipient name on input change', () => {
    withCard(<>
      <CardEditor />
      <CardPreview />
    </>)
    const input = screen.getByLabelText('Recipient name')
    fireEvent.change(input, { target: { value: 'Meera' } })
    expect(screen.getByTestId('card-preview').textContent).toContain('Meera')
  })

  it('updates message on textarea change', () => {
    withCard(<>
      <CardEditor />
      <CardPreview />
    </>)
    const ta = screen.getByLabelText('Greeting message')
    fireEvent.change(ta, { target: { value: 'Test message 123' } })
    expect(screen.getByTestId('card-preview').textContent).toContain('Test message 123')
  })

  it('shows theme buttons', () => {
    withCard(<CardEditor />)
    expect(screen.getByLabelText('Theme: Night Valley')).toBeTruthy()
    expect(screen.getByLabelText('Theme: Golden Dawn')).toBeTruthy()
    expect(screen.getByLabelText('Theme: Rose Dusk')).toBeTruthy()
  })

  it('switches theme on button click', () => {
    withCard(<CardEditor />)
    const btn = screen.getByLabelText('Theme: Rose Dusk')
    fireEvent.click(btn)
    expect(btn.getAttribute('aria-pressed')).toBe('true')
  })

  it('reset button restores default recipient', () => {
    withCard(<>
      <CardEditor />
      <CardPreview />
    </>)
    fireEvent.change(screen.getByLabelText('Recipient name'), { target: { value: 'X' } })
    fireEvent.click(screen.getByText('Reset to defaults'))
    expect(screen.getByTestId('card-preview').textContent).toContain('Helly')
  })

  it('character counter shows correct length', () => {
    withCard(<CardEditor />)
    const msg = screen.getByLabelText('Greeting message').value
    expect(screen.getAllByText(`${msg.length}/240`).length).toBeGreaterThan(0)
  })
})
