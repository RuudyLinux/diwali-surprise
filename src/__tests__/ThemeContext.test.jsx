import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import React from 'react'
import { ThemeProvider, useTheme } from '../context/ThemeContext'

function ThemeConsumer() {
  const { dark, toggle } = useTheme()
  return (
    <div>
      <span data-testid="mode">{dark ? 'dark' : 'light'}</span>
      <button onClick={toggle}>Toggle</button>
    </div>
  )
}

describe('ThemeContext', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark', 'light')
    // Default: system prefers dark
    vi.spyOn(window, 'matchMedia').mockReturnValue({ matches: true })
  })

  it('defaults to dark when system prefers dark', () => {
    render(<ThemeProvider><ThemeConsumer /></ThemeProvider>)
    expect(screen.getByTestId('mode').textContent).toBe('dark')
  })

  it('defaults to light when system prefers light', () => {
    window.matchMedia.mockReturnValue({ matches: false })
    localStorage.clear()
    render(<ThemeProvider><ThemeConsumer /></ThemeProvider>)
    expect(screen.getByTestId('mode').textContent).toBe('light')
  })

  it('restores theme from localStorage', () => {
    localStorage.setItem('diwali-theme', 'light')
    render(<ThemeProvider><ThemeConsumer /></ThemeProvider>)
    expect(screen.getByTestId('mode').textContent).toBe('light')
  })

  it('toggle switches dark → light', () => {
    render(<ThemeProvider><ThemeConsumer /></ThemeProvider>)
    expect(screen.getByTestId('mode').textContent).toBe('dark')
    fireEvent.click(screen.getByText('Toggle'))
    expect(screen.getByTestId('mode').textContent).toBe('light')
  })

  it('toggle switches light → dark', () => {
    localStorage.setItem('diwali-theme', 'light')
    render(<ThemeProvider><ThemeConsumer /></ThemeProvider>)
    fireEvent.click(screen.getByText('Toggle'))
    expect(screen.getByTestId('mode').textContent).toBe('dark')
  })

  it('persists theme change to localStorage', () => {
    render(<ThemeProvider><ThemeConsumer /></ThemeProvider>)
    fireEvent.click(screen.getByText('Toggle'))
    expect(localStorage.getItem('diwali-theme')).toBe('light')
  })

  it('applies "dark" class to <html> when dark', () => {
    render(<ThemeProvider><ThemeConsumer /></ThemeProvider>)
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('removes "dark" class from <html> when light', () => {
    render(<ThemeProvider><ThemeConsumer /></ThemeProvider>)
    act(() => { fireEvent.click(screen.getByText('Toggle')) })
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('throws if used outside ThemeProvider', () => {
    expect(() => render(<ThemeConsumer />)).toThrow()
  })
})
