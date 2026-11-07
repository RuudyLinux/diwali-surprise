/**
 * ─────────────────────────────────────────────────────────────────────────────
 * GOLDEN DOT PORTRAIT
 * Turns a photograph into a halftone "constellation" of golden light dots.
 *
 * Identity first: every dot's position and brightness comes straight from the
 * photo's own pixels. Nothing is reshaped, warped, beautified or invented —
 * we only (1) measure luminance, (2) stretch contrast, (3) lightly sharpen local
 * detail so eyes / brows / lips survive the down-sampling, and (4) place one dot
 * per cell of a regular hex grid. Proportions are preserved because the grid
 * lives in the photo's own normalised coordinate space.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const PORTRAIT_ASPECT = 4 / 5 // width / height of the crop frame
export const PORTRAIT_OUTPUT = { width: 720, height: 900 }

export const clamp = (v, a, b) => (v < a ? a : v > b ? b : v)
const smoothstep = (a, b, v) => {
  const t = clamp((v - a) / (b - a), 0, 1)
  return t * t * (3 - 2 * t)
}

/**
 * Crop rectangle (in source pixels) for a { zoom, cx, cy } crop state.
 * Always keeps the requested aspect ratio and stays inside the image.
 */
export function cropRect(srcW, srcH, crop = {}, aspect = PORTRAIT_ASPECT) {
  let baseW
  let baseH
  if (srcW / srcH > aspect) {
    baseH = srcH
    baseW = srcH * aspect
  } else {
    baseW = srcW
    baseH = srcW / aspect
  }
  const zoom = clamp(crop.zoom ?? 1, 1, 6)
  const w = baseW / zoom
  const h = baseH / zoom
  const cx = clamp(crop.cx ?? srcW / 2, w / 2, srcW - w / 2)
  const cy = clamp(crop.cy ?? srcH / 2, h / 2, srcH - h / 2)
  return { x: cx - w / 2, y: cy - h / 2, w, h, cx, cy, zoom }
}

/** Relative luminance (0–1) per pixel from RGBA ImageData bytes. */
export function luminanceFromRGBA(data, count) {
  const lum = new Float32Array(count)
  for (let i = 0, p = 0; i < count; i++, p += 4) {
    const a = data[p + 3] / 255
    lum[i] = ((0.2126 * data[p] + 0.7152 * data[p + 1] + 0.0722 * data[p + 2]) / 255) * a
  }
  return lum
}

/** Separable box blur (used for unsharp-mask detail recovery). */
export function boxBlur(src, W, H, r) {
  if (r < 1) return Float32Array.from(src)
  const tmp = new Float32Array(src.length)
  const out = new Float32Array(src.length)
  const span = r * 2 + 1
  for (let y = 0; y < H; y++) {
    let acc = 0
    const row = y * W
    for (let x = -r; x <= r; x++) acc += src[row + clamp(x, 0, W - 1)]
    for (let x = 0; x < W; x++) {
      tmp[row + x] = acc / span
      acc += src[row + clamp(x + r + 1, 0, W - 1)] - src[row + clamp(x - r, 0, W - 1)]
    }
  }
  for (let x = 0; x < W; x++) {
    let acc = 0
    for (let y = -r; y <= r; y++) acc += tmp[clamp(y, 0, H - 1) * W + x]
    for (let y = 0; y < H; y++) {
      out[y * W + x] = acc / span
      acc += tmp[clamp(y + r + 1, 0, H - 1) * W + x] - tmp[clamp(y - r, 0, H - 1) * W + x]
    }
  }
  return out
}

function sampleAvg(arr, W, H, x, y, rad) {
  const x0 = clamp(Math.floor(x - rad), 0, W - 1)
  const x1 = clamp(Math.ceil(x + rad), 0, W - 1)
  const y0 = clamp(Math.floor(y - rad), 0, H - 1)
  const y1 = clamp(Math.ceil(y + rad), 0, H - 1)
  let s = 0
  let n = 0
  for (let yy = y0; yy <= y1; yy++) {
    const row = yy * W
    for (let xx = x0; xx <= x1; xx++) {
      s += arr[row + xx]
      n++
    }
  }
  return n ? s / n : 0
}

/**
 * Core sampler: luminance grid → dots on a hex grid.
 * Returns dots with normalised coordinates (0–1 of the image) and brightness b.
 */
export function dotsFromLuminance(lum, W, H, opts = {}) {
  const { cols = 110, threshold = 0.07, detail = 0.6, gamma = 1.08, vignette = true, rgb = null } = opts
  if (rgb) return colorDots(lum, rgb, W, H, { cols, vignette })

  // Robust contrast stretch (2nd → 98.5th percentile)
  const sorted = Float32Array.from(lum).sort()
  const lo = sorted[Math.floor(sorted.length * 0.02)] ?? 0
  const hi = sorted[Math.floor(sorted.length * 0.985)] ?? 1
  const range = Math.max(0.04, hi - lo)

  const step = W / cols
  const rowStep = step * 0.8660254
  const rows = Math.max(1, Math.floor(H / rowStep))
  const blur = detail > 0 ? boxBlur(lum, W, H, Math.max(1, Math.round(step * 1.4))) : null
  const rad = step / 2

  const dots = []
  for (let r = 0; r < rows; r++) {
    const y = (r + 0.5) * rowStep
    const offset = r % 2 ? step / 2 : 0
    for (let c = 0; c < cols; c++) {
      const x = (c + 0.5) * step + offset
      if (x > W - step * 0.25) continue
      let v = sampleAvg(lum, W, H, x, y, rad)
      if (blur) v += detail * (v - sampleAvg(blur, W, H, x, y, rad))
      v = clamp((v - lo) / range, 0, 1)
      v = Math.pow(v, gamma)
      if (vignette) {
        // Only the outermost corners fade — the face region is untouched.
        const nx = (x / W) * 2 - 1
        const ny = (y / H) * 2 - 1
        v *= 1 - smoothstep(0.95, 1.32, Math.sqrt(nx * nx + ny * ny))
      }
      if (v < threshold) continue
      dots.push({ x: x / W, y: y / H, b: v })
    }
  }
  return { dots, aspect: W / H, cols, rows }
}

/**
 * True-colour sampler: one dot per hex cell carrying the photo's own average
 * RGB for that cell — no tint, no contrast change, no brightness cut-off, so
 * hair, eyes, lips and skin keep their real colours. `a` only fades the
 * outermost corners; `b` (luminance) is kept for animation timing.
 */
function colorDots(lum, rgb, W, H, { cols, vignette }) {
  const step = W / cols
  const rowStep = step * 0.8660254
  const rows = Math.max(1, Math.floor(H / rowStep))
  const rad = step / 2
  const dots = []
  for (let r = 0; r < rows; r++) {
    const y = (r + 0.5) * rowStep
    const offset = r % 2 ? step / 2 : 0
    for (let c = 0; c < cols; c++) {
      const x = (c + 0.5) * step + offset
      if (x > W - step * 0.25) continue
      let a = 1
      if (vignette) {
        const nx = (x / W) * 2 - 1
        const ny = (y / H) * 2 - 1
        a = 1 - smoothstep(0.95, 1.32, Math.sqrt(nx * nx + ny * ny))
      }
      if (a < 0.03) continue
      dots.push({
        x: x / W,
        y: y / H,
        b: clamp(sampleAvg(lum, W, H, x, y, rad), 0, 1),
        a,
        c: [
          Math.round(sampleAvg(rgb.R, W, H, x, y, rad)),
          Math.round(sampleAvg(rgb.G, W, H, x, y, rad)),
          Math.round(sampleAvg(rgb.B, W, H, x, y, rad)),
        ],
      })
    }
  }
  return { dots, aspect: W / H, cols, rows, color: true }
}

function channelsFromRGBA(data, count) {
  const R = new Float32Array(count)
  const G = new Float32Array(count)
  const B = new Float32Array(count)
  for (let i = 0, p = 0; i < count; i++, p += 4) {
    const a = data[p + 3] / 255
    R[i] = data[p] * a
    G[i] = data[p + 1] * a
    B[i] = data[p + 2] * a
  }
  return { R, G, B }
}

/**
 * Sample any drawable (img / canvas / ImageBitmap) into dots.
 * opts.color = true → true-colour dots; otherwise golden halftone dots.
 * Returns { dots: [], aspect } when canvas pixel access is unavailable.
 */
export function computeDots(source, opts = {}) {
  const sw = source?.naturalWidth || source?.width || 0
  const sh = source?.naturalHeight || source?.height || 0
  const aspect = sw && sh ? sw / sh : PORTRAIT_ASPECT
  const empty = { dots: [], aspect, cols: opts.cols || 110, rows: 0 }
  if (!sw || !sh || typeof document === 'undefined') return empty
  const cols = opts.cols || 110
  const W = cols * 3
  const H = Math.max(3, Math.round(W / aspect))
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const g = c.getContext('2d', { willReadFrequently: true })
  if (!g || typeof g.drawImage !== 'function' || typeof g.getImageData !== 'function') return empty
  try {
    g.drawImage(source, 0, 0, W, H)
    const { data } = g.getImageData(0, 0, W, H)
    const rgb = opts.color ? channelsFromRGBA(data, W * H) : null
    return dotsFromLuminance(luminanceFromRGBA(data, W * H), W, H, { ...opts, cols, rgb })
  } catch {
    return empty
  }
}

/** Soft glowing particle sprite (white-hot core → coloured halo). */
export function makeGlowSprite(rgb = [255, 200, 90], size = 64) {
  if (typeof document === 'undefined') return null
  const c = document.createElement('canvas')
  c.width = c.height = size
  const g = c.getContext('2d')
  if (!g || typeof g.createRadialGradient !== 'function') return null
  const h = size / 2
  const grad = g.createRadialGradient(h, h, 0, h, h, h)
  const col = rgb.join(',')
  grad.addColorStop(0, 'rgba(255,255,244,1)')
  grad.addColorStop(0.16, `rgba(${col},1)`)
  grad.addColorStop(0.34, `rgba(${col},0.45)`)
  grad.addColorStop(0.62, `rgba(${col},0.1)`)
  grad.addColorStop(1, `rgba(${col},0)`)
  g.fillStyle = grad
  g.fillRect(0, 0, size, size)
  return c
}

const dotTier = (b) => (b > 0.66 ? 'pale' : b > 0.33 ? 'gold' : 'amber')
export const DOT_COLORS = { pale: [255, 236, 168], gold: [255, 198, 82], amber: [255, 162, 62] }

/** Static render of a dot portrait into a canvas (used by the uploader preview). */
export function renderDotPreview(canvas, result, sprites) {
  const g = canvas?.getContext?.('2d')
  if (!g || typeof g.fillRect !== 'function') return
  const W = canvas.width
  const H = canvas.height
  g.globalCompositeOperation = 'source-over'
  g.fillStyle = '#07040F'
  g.fillRect(0, 0, W, H)
  if (!result?.dots?.length || typeof g.drawImage !== 'function') return
  const rw = Math.min(W, H * result.aspect)
  const rh = rw / result.aspect
  const ox = (W - rw) / 2
  const oy = (H - rh) / 2
  const cell = rw / result.cols
  if (result.color) {
    drawColorDots(g, result.dots, ox, oy, rw, rh, cell)
    return
  }
  g.globalCompositeOperation = 'lighter'
  for (const d of result.dots) {
    const sp = sprites?.[dotTier(d.b)]
    if (!sp) continue
    const r = cell * (0.18 + 0.4 * Math.sqrt(d.b))
    const s = r * 3.6
    g.globalAlpha = 0.45 + 0.55 * d.b
    g.drawImage(sp, ox + d.x * rw - s / 2, oy + d.y * rh - s / 2, s, s)
  }
  g.globalAlpha = 1
  g.globalCompositeOperation = 'source-over'
}

/** Exact-colour dots (solid circles), used for the settled sky portrait + preview. */
export const COLOR_DOT_RADIUS = 0.5 // × cell width → neighbouring dots just touch
export function drawColorDots(g, dots, ox, oy, rw, rh, cell) {
  if (typeof g.arc !== 'function') return
  const r = cell * COLOR_DOT_RADIUS
  g.globalCompositeOperation = 'source-over'
  for (const d of dots) {
    g.globalAlpha = d.a
    g.fillStyle = `rgb(${d.c[0]},${d.c[1]},${d.c[2]})`
    g.beginPath()
    g.arc(ox + d.x * rw, oy + d.y * rh, r, 0, Math.PI * 2)
    g.fill()
  }
  g.globalAlpha = 1
}

/** Soft dot sprite in a given colour (solid core, gentle halo) for flying dots. */
export function makeColorDotSprite(rgb, size = 24) {
  if (typeof document === 'undefined') return null
  const c = document.createElement('canvas')
  c.width = c.height = size
  const g = c.getContext('2d')
  if (!g || typeof g.createRadialGradient !== 'function') return null
  const h = size / 2
  const grad = g.createRadialGradient(h, h, 0, h, h, h)
  const col = rgb.join(',')
  grad.addColorStop(0, `rgba(${col},1)`)
  grad.addColorStop(0.45, `rgba(${col},1)`)
  grad.addColorStop(0.7, `rgba(${col},0.35)`)
  grad.addColorStop(1, `rgba(${col},0)`)
  g.fillStyle = grad
  g.fillRect(0, 0, size, size)
  return c
}

export function makeDotSprites() {
  return {
    pale: makeGlowSprite(DOT_COLORS.pale),
    gold: makeGlowSprite(DOT_COLORS.gold),
    amber: makeGlowSprite(DOT_COLORS.amber),
  }
}
export { dotTier }

/** Decode a File into a normalised canvas (EXIF orientation applied, max side capped). */
export async function fileToCanvas(file, maxSide = 2000) {
  let source
  let w
  let h
  if (typeof createImageBitmap === 'function') {
    try {
      source = await createImageBitmap(file, { imageOrientation: 'from-image' })
      w = source.width
      h = source.height
    } catch {
      source = null
    }
  }
  if (!source) {
    const url = URL.createObjectURL(file)
    try {
      source = await loadImage(url)
      w = source.naturalWidth
      h = source.naturalHeight
    } finally {
      URL.revokeObjectURL(url)
    }
  }
  const s = Math.min(1, maxSide / Math.max(w, h))
  const c = document.createElement('canvas')
  c.width = Math.round(w * s)
  c.height = Math.round(h * s)
  c.getContext('2d').drawImage(source, 0, 0, c.width, c.height)
  source.close?.()
  return c
}

export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.decoding = 'async'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Image failed to load'))
    img.src = src
  })
}

/** Cut the crop out of a source into a fresh canvas of the output size. */
export function cropToCanvas(source, rect, out = PORTRAIT_OUTPUT) {
  const c = document.createElement('canvas')
  c.width = out.width
  c.height = out.height
  const g = c.getContext('2d')
  g.imageSmoothingQuality = 'high'
  g.drawImage(source, rect.x, rect.y, rect.w, rect.h, 0, 0, out.width, out.height)
  return c
}

/** Render text into a canvas (used for the no-photo constellation fallback). */
export function textToCanvas(text, { width = 1000, height = 320, font = 'italic 600 190px "Playfair Display", Georgia, serif' } = {}) {
  if (typeof document === 'undefined') return null
  const c = document.createElement('canvas')
  c.width = width
  c.height = height
  const g = c.getContext('2d')
  if (!g || typeof g.fillText !== 'function') return null
  g.fillStyle = '#000'
  g.fillRect(0, 0, width, height)
  g.fillStyle = '#fff'
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  let size = 190
  g.font = font
  while (size > 40 && g.measureText(text).width > width * 0.9) {
    size -= 10
    g.font = font.replace(/\d+px/, `${size}px`)
  }
  g.fillText(text, width / 2, height / 2 + size * 0.04)
  return c
}
