import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { CardProvider } from '../context/CardContext'
import PhotoReel from '../components/PhotoReel'

function setup() {
  return render(
    <CardProvider>
      <PhotoReel />
    </CardProvider>
  )
}

describe('PhotoReel', () => {
  it('renders section and photo cards', () => {
    setup()
    expect(screen.getByTestId('photo-reel-section')).toBeTruthy()
    expect(screen.getByTestId('photo-grid')).toBeTruthy()
    expect(screen.getByTestId('photo-card-0')).toBeTruthy()
  })

  it('opens lightbox when photo card is clicked', () => {
    setup()
    fireEvent.click(screen.getByTestId('photo-card-0'))
    expect(screen.getByTestId('photo-lightbox')).toBeTruthy()

    // Close on button click
    fireEvent.click(screen.getByLabelText('Close photo preview'))
    expect(screen.queryByTestId('photo-lightbox')).toBeNull()
  })

  it('opens add photo modal when button is clicked', () => {
    setup()
    fireEvent.click(screen.getByTestId('open-add-photo-btn'))
    expect(screen.getByTestId('add-photo-modal')).toBeTruthy()
  })
})

