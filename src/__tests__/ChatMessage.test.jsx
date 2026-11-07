import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { CardProvider } from '../context/CardContext'
import ChatMessage from '../components/ChatMessage'

function setup(props = {}) {
  return render(
    <CardProvider>
      <ChatMessage {...props} />
    </CardProvider>
  )
}

describe('ChatMessage', () => {
  it('renders chat message section and bubbles', () => {
    setup()
    expect(screen.getByTestId('chat-message-section')).toBeTruthy()
    expect(screen.getByTestId('voice-note-bubble')).toBeTruthy()
    expect(screen.getByTestId('core-chat-bubble')).toBeTruthy()
  })

  it('displays default core personal message for Helly', () => {
    setup()
    const bubble = screen.getByTestId('core-chat-bubble')
    expect(bubble.textContent).toContain('Helly')
    expect(bubble.textContent).toContain('glow of diyas')
  })

  it('allows clicking voice note play button', () => {
    const onPlayVoiceNote = vi.fn()
    setup({ onPlayVoiceNote })

    const playBtn = screen.getByTestId('voice-note-play-btn')
    fireEvent.click(playBtn)
    expect(onPlayVoiceNote).toHaveBeenCalledOnce()
  })

  it('increments emoji reaction count on click', () => {
    setup()
    const diyaReactBtn = screen.getByTestId('react-btn-🪔')
    expect(diyaReactBtn.textContent).toContain('14')
    fireEvent.click(diyaReactBtn)
    expect(diyaReactBtn.textContent).toContain('15')
  })
})
