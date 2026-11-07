import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { ThemeProvider } from '../context/ThemeContext'
import Toolbar from '../components/Toolbar'

function setup(overrides = {}) {
  const defaults = {
    musicOn:       false,
    sfxOn:         true,
    onToggleMusic: vi.fn(),
    onToggleSfx:   vi.fn(),
  }
  const props = { ...defaults, ...overrides }
  return {
    ...render(<ThemeProvider><Toolbar {...props} /></ThemeProvider>),
    props,
  }
}

describe('Toolbar', () => {
  it('renders without crashing', () => {
    setup()
    expect(screen.getByTestId('toolbar')).toBeTruthy()
  })

  it('music button has aria-pressed=false when musicOn=false', () => {
    setup({ musicOn: false })
    expect(screen.getByLabelText('Play ambient music').getAttribute('aria-pressed')).toBe('false')
  })

  it('music button has aria-pressed=true when musicOn=true', () => {
    setup({ musicOn: true })
    expect(screen.getByLabelText('Mute music').getAttribute('aria-pressed')).toBe('true')
  })

  it('clicking music button calls onToggleMusic', () => {
    const { props } = setup()
    fireEvent.click(screen.getByLabelText('Play ambient music'))
    expect(props.onToggleMusic).toHaveBeenCalledOnce()
  })

  it('sfx button has aria-pressed=true when sfxOn=true', () => {
    setup({ sfxOn: true })
    expect(screen.getByLabelText('Mute sound effects').getAttribute('aria-pressed')).toBe('true')
  })

  it('sfx button has aria-pressed=false when sfxOn=false', () => {
    setup({ sfxOn: false })
    expect(screen.getByLabelText('Enable sound effects').getAttribute('aria-pressed')).toBe('false')
  })

  it('clicking sfx button calls onToggleSfx', () => {
    const { props } = setup()
    fireEvent.click(screen.getByLabelText('Mute sound effects'))
    expect(props.onToggleSfx).toHaveBeenCalledOnce()
  })

  it('dark mode toggle button is present', () => {
    setup()
    // The label is dynamic — matches whichever mode is currently active
    const btn = screen.queryByLabelText(/switch to (dark|light) mode/i)
    expect(btn).toBeTruthy()
  })

  it('renders 3 buttons', () => {
    setup()
    const toolbar = screen.getByTestId('toolbar')
    expect(toolbar.querySelectorAll('button').length).toBe(3)
  })
})
