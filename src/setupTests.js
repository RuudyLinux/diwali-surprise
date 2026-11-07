import '@testing-library/jest-dom'

// Mock window.matchMedia (jsdom doesn't implement it)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn((query) => ({
    matches: query.includes('dark'),
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock canvas API (jsdom doesn't implement it)
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  clearRect: vi.fn(),
  fillRect: vi.fn(),
  beginPath: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
  createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
  setTransform: vi.fn(),
  globalAlpha: 1,
  fillStyle: '',
}))

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn(cb => setTimeout(cb, 16))
global.cancelAnimationFrame  = vi.fn(id => clearTimeout(id))

// Mock Web Audio API
global.AudioContext = vi.fn(() => ({
  createOscillator:  vi.fn(() => ({ connect: vi.fn(), start: vi.fn(), stop: vi.fn(), frequency: { value: 0 }, type: '' })),
  createGain:        vi.fn(() => ({ connect: vi.fn(), gain: { value: 1, linearRampToValueAtTime: vi.fn(), setValueAtTime: vi.fn() } })),
  createBufferSource:vi.fn(() => ({ connect: vi.fn(), start: vi.fn(), buffer: null, loop: false })),
  createBuffer:      vi.fn(() => ({ getChannelData: vi.fn(() => new Float32Array(0)) })),
  destination:       {},
  currentTime:       0,
  state:             'running',
  resume:            vi.fn(),
  close:             vi.fn(() => Promise.resolve()),
}))
global.webkitAudioContext = global.AudioContext

// Mock clipboard
Object.assign(navigator, {
  clipboard: { writeText: vi.fn(() => Promise.resolve()) },
  share:     vi.fn(() => Promise.resolve()),
})
