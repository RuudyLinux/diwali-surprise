import { describe, it, expect } from 'vitest'
import { cropRect, dotsFromLuminance, PORTRAIT_ASPECT } from '../utils/portraitDots'
import { validatePortraitFile } from '../components/PortraitUploader'

// Synthetic "photo": dark background, bright oval face, two dark eyes, dark mouth.
function syntheticFace(W = 180, H = 225) {
  const lum = new Float32Array(W * H)
  const face = { cx: W / 2, cy: H * 0.48, rx: W * 0.3, ry: H * 0.34 }
  const eyes = [
    { x: W * 0.4, y: H * 0.42 },
    { x: W * 0.6, y: H * 0.42 },
  ]
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      let v = 0.04
      const nx = (x - face.cx) / face.rx
      const ny = (y - face.cy) / face.ry
      if (nx * nx + ny * ny <= 1) v = 0.85
      for (const e of eyes) if (Math.hypot(x - e.x, y - e.y) < W * 0.045) v = 0.06
      if (Math.abs(x - W / 2) < W * 0.09 && Math.abs(y - H * 0.62) < H * 0.015) v = 0.08
      lum[y * W + x] = v
    }
  }
  return { lum, W, H, face, eyes }
}

describe('cropRect', () => {
  it('keeps the 4:5 portrait aspect and stays inside the image', () => {
    const r = cropRect(1600, 900, { zoom: 1, cx: 0, cy: 0 })
    expect(r.w / r.h).toBeCloseTo(PORTRAIT_ASPECT, 5)
    expect(r.x).toBeGreaterThanOrEqual(0)
    expect(r.y).toBeGreaterThanOrEqual(0)
    expect(r.x + r.w).toBeLessThanOrEqual(1600)
    expect(r.y + r.h).toBeLessThanOrEqual(900)
  })

  it('zoom shrinks the crop around the chosen centre', () => {
    const a = cropRect(1000, 1000, { zoom: 1 })
    const b = cropRect(1000, 1000, { zoom: 2, cx: 500, cy: 500 })
    expect(b.w).toBeCloseTo(a.w / 2, 5)
    expect(b.cx).toBe(500)
  })
})

describe('dotsFromLuminance (identity-preserving sampling)', () => {
  const { lum, W, H, face, eyes } = syntheticFace()
  const res = dotsFromLuminance(lum, W, H, { cols: 60, detail: 0.6 })

  it('preserves the source aspect ratio and normalised coordinates', () => {
    expect(res.aspect).toBeCloseTo(W / H, 5)
    expect(res.dots.length).toBeGreaterThan(300)
    for (const d of res.dots) {
      expect(d.x).toBeGreaterThanOrEqual(0)
      expect(d.x).toBeLessThanOrEqual(1)
      expect(d.y).toBeGreaterThanOrEqual(0)
      expect(d.y).toBeLessThanOrEqual(1)
    }
  })

  it('places lights on the bright face and none on the dark background', () => {
    const inFace = res.dots.filter((d) => {
      const nx = (d.x * W - face.cx) / face.rx
      const ny = (d.y * H - face.cy) / face.ry
      return nx * nx + ny * ny <= 1.1
    })
    expect(inFace.length / res.dots.length).toBeGreaterThan(0.97)
  })

  it('keeps the eyes dark (features are not filled in or invented)', () => {
    for (const e of eyes) {
      const near = res.dots.filter((d) => Math.hypot(d.x * W - e.x, d.y * H - e.y) < W * 0.02)
      expect(near.length).toBe(0)
    }
  })

  it('the face shape keeps its proportions (bounding box matches the source oval)', () => {
    const xs = res.dots.map((d) => d.x * W)
    const ys = res.dots.map((d) => d.y * H)
    const w = Math.max(...xs) - Math.min(...xs)
    const h = Math.max(...ys) - Math.min(...ys)
    expect(w / h).toBeCloseTo((face.rx * 2) / (face.ry * 2), 1)
  })
})

describe('true-colour dots', () => {
  it('each dot carries the photo’s own colour and dark areas are kept (not thrown away)', () => {
    const W = 120
    const H = 150
    const lum = new Float32Array(W * H)
    const R = new Float32Array(W * H)
    const G = new Float32Array(W * H)
    const B = new Float32Array(W * H)
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const i = y * W + x
        // left half: warm skin tone · right half: near-black hair
        const [r, g, b] = x < W / 2 ? [214, 160, 130] : [28, 20, 18]
        R[i] = r
        G[i] = g
        B[i] = b
        lum[i] = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
      }
    }
    const res = dotsFromLuminance(lum, W, H, { cols: 40, rgb: { R, G, B }, vignette: false })
    expect(res.color).toBe(true)
    expect(res.aspect).toBeCloseTo(W / H, 5)
    const left = res.dots.filter((d) => d.x < 0.4)
    const right = res.dots.filter((d) => d.x > 0.6)
    expect(left.length).toBeGreaterThan(50)
    expect(right.length).toBeGreaterThan(50) // dark hair is kept as dark dots
    left.forEach((d) => expect(d.c).toEqual([214, 160, 130]))
    right.forEach((d) => expect(d.c).toEqual([28, 20, 18]))
  })
})

describe('validatePortraitFile', () => {
  it('accepts JPG / PNG / WebP and rejects other files', () => {
    expect(validatePortraitFile({ type: 'image/jpeg', size: 1000, name: 'a.jpg' })).toBeNull()
    expect(validatePortraitFile({ type: 'image/png', size: 1000, name: 'a.png' })).toBeNull()
    expect(validatePortraitFile({ type: 'image/webp', size: 1000, name: 'a.webp' })).toBeNull()
    expect(validatePortraitFile({ type: '', size: 1000, name: 'a.JPEG' })).toBeNull()
    expect(validatePortraitFile({ type: 'image/gif', size: 1000, name: 'a.gif' })).toMatch(/JPG/)
    expect(validatePortraitFile({ type: 'image/jpeg', size: 30 * 1024 * 1024, name: 'big.jpg' })).toMatch(/25 MB/)
  })
})
