import { useSyncExternalStore } from 'react'

/**
 * Where her sky portrait lives
 * ───────────────────────────
 * 1. This device:  localStorage (instant, survives reloads on the author's machine).
 * 2. The project:  public/her-portrait.jpg — shipped with every build, so the
 *    portrait appears on any device once deployed.
 *    • During `npm run dev`, "Use This Photo" writes that file for you through a
 *      local-only dev-server endpoint (see vite.config.js). Nothing leaves your machine.
 *    • Otherwise, download the prepared JPG and place it at public/her-portrait.jpg.
 *
 * The photo is never sent to any third-party or AI service.
 */

export const STORAGE_KEY = 'diwali.skyPortrait.v1'
export const DISABLED_VALUE = 'none'
export const PROJECT_FILE = 'her-portrait.jpg'
export const DEV_ENDPOINT = '/__diwali/portrait'

const base = (typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL) || '/'
export const PROJECT_SRC = `${base}${PROJECT_FILE}`
const IS_DEV = !!(typeof import.meta !== 'undefined' && import.meta.env?.DEV)

let state = { status: 'loading', src: null, origin: null }
const listeners = new Set()
let started = false

function setState(next) {
  state = { ...state, ...next }
  listeners.forEach((l) => l())
}

function readLocal() {
  try {
    return window.localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

function probe(src) {
  return new Promise((resolve) => {
    if (typeof Image === 'undefined') return resolve(false)
    const img = new Image()
    img.onload = () => resolve(img.naturalWidth > 0)
    img.onerror = () => resolve(false)
    img.src = src
  })
}

export function initSkyPortrait() {
  if (started || typeof window === 'undefined') return
  started = true
  const local = readLocal()
  if (local === DISABLED_VALUE) return setState({ status: 'empty', src: null, origin: null })
  if (local) return setState({ status: 'ready', src: local, origin: 'device' })
  probe(PROJECT_SRC).then((ok) =>
    setState(ok ? { status: 'ready', src: PROJECT_SRC, origin: 'project' } : { status: 'empty', src: null, origin: null })
  )
}

function dataUrlToBlob(dataUrl) {
  const [head, body] = dataUrl.split(',')
  const mime = /data:([^;]+)/.exec(head)?.[1] || 'image/jpeg'
  const bin = atob(body)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return new Blob([bytes], { type: mime })
}

/** Save a prepared JPEG data URL. Returns where it was stored. */
export async function saveSkyPortrait(dataUrl) {
  let device = false
  let project = false
  try {
    window.localStorage.setItem(STORAGE_KEY, dataUrl)
    device = true
  } catch {
    device = false
  }
  if (IS_DEV) {
    try {
      const res = await fetch(DEV_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'image/jpeg' },
        body: dataUrlToBlob(dataUrl),
      })
      project = res.ok
    } catch {
      project = false
    }
  }
  setState({ status: 'ready', src: dataUrl, origin: device ? 'device' : 'session' })
  return { device, project, isDev: IS_DEV }
}

export async function removeSkyPortrait() {
  try {
    window.localStorage.setItem(STORAGE_KEY, DISABLED_VALUE)
  } catch {
    /* storage unavailable */
  }
  if (IS_DEV) {
    try {
      await fetch(DEV_ENDPOINT, { method: 'DELETE' })
    } catch {
      /* dev endpoint unavailable */
    }
  }
  setState({ status: 'empty', src: null, origin: null })
  return { isDev: IS_DEV }
}

function subscribe(fn) {
  listeners.add(fn)
  initSkyPortrait()
  return () => listeners.delete(fn)
}
const getSnapshot = () => state

export function useSkyPortrait() {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  return { ...snap, isDev: IS_DEV, save: saveSkyPortrait, remove: removeSkyPortrait }
}

/** Test helper */
export function __resetSkyPortraitStore() {
  state = { status: 'loading', src: null, origin: null }
  started = false
}
