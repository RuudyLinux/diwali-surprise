import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'
import { CardProvider } from '../context/CardContext'
import SharePanel from '../components/SharePanel'

function setup() {
  return render(<CardProvider><SharePanel /></CardProvider>)
}

describe('SharePanel', () => {
  it('renders without crashing', () => {
    setup()
    expect(screen.getByTestId('share-panel')).toBeTruthy()
  })

  it('shows WhatsApp share button', () => {
    setup()
    expect(screen.getByLabelText('Share on WhatsApp')).toBeTruthy()
  })

  it('shows Twitter share button', () => {
    setup()
    expect(screen.getByLabelText('Share on X / Twitter')).toBeTruthy()
  })

  it('shows Facebook share button', () => {
    setup()
    expect(screen.getByLabelText('Share on Facebook')).toBeTruthy()
  })

  it('shows Telegram share button', () => {
    setup()
    expect(screen.getByLabelText('Share on Telegram')).toBeTruthy()
  })

  it('shows Copy link button', () => {
    setup()
    expect(screen.getByLabelText('Copy link to clipboard')).toBeTruthy()
  })

  it('copy link button shows "Copied!" after click', async () => {
    setup()
    fireEvent.click(screen.getByLabelText('Copy link to clipboard'))
    await waitFor(() => {
      expect(screen.getByText('Copied!')).toBeTruthy()
    })
  })

  it('platform buttons open in a new window (window.open call)', () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)
    setup()
    fireEvent.click(screen.getByLabelText('Share on WhatsApp'))
    expect(openSpy).toHaveBeenCalledWith(
      expect.stringContaining('wa.me'),
      '_blank',
      expect.any(String)
    )
    openSpy.mockRestore()
  })

  it('renders native share button when navigator.share is available', () => {
    setup()
    // navigator.share is mocked in setupTests
    expect(screen.getByLabelText('Share using device share sheet')).toBeTruthy()
  })
})
