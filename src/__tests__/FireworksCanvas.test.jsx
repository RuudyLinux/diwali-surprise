import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import FireworksCanvas from '../components/FireworksCanvas'

describe('FireworksCanvas', () => {
  it('renders a canvas element', () => {
    render(<FireworksCanvas />)
    expect(screen.getByTestId('fireworks-canvas')).toBeTruthy()
  })

  it('canvas has role="img"', () => {
    render(<FireworksCanvas />)
    expect(screen.getByRole('img')).toBeTruthy()
  })

  it('canvas has an accessible label', () => {
    render(<FireworksCanvas />)
    expect(screen.getByLabelText(/fireworks/i)).toBeTruthy()
  })

  it('calls onBurst callback when clicked', () => {
    const onBurst = vi.fn()
    render(<FireworksCanvas onBurst={onBurst} autoPlay={false} />)
    fireEvent.click(screen.getByTestId('fireworks-canvas'), { clientX: 200, clientY: 300 })
    expect(onBurst).toHaveBeenCalledOnce()
  })

  it('onBurst is not required (no crash without it)', () => {
    expect(() => {
      render(<FireworksCanvas autoPlay={false} />)
      fireEvent.click(screen.getByTestId('fireworks-canvas'))
    }).not.toThrow()
  })

  it('canvas has cursor-crosshair style class', () => {
    render(<FireworksCanvas autoPlay={false} />)
    expect(screen.getByTestId('fireworks-canvas').className).toContain('cursor-crosshair')
  })

  it('canvas is fixed and covers the viewport', () => {
    render(<FireworksCanvas autoPlay={false} />)
    expect(screen.getByTestId('fireworks-canvas').className).toContain('fixed')
  })
})
