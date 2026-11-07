import { useEffect, useRef } from 'react'

/**
 * Adds `is-visible` to every `.reveal` element inside the returned ref
 * once it scrolls into view. Falls back to showing everything when
 * IntersectionObserver is unavailable (tests, old browsers).
 */
export function useReveal() {
  const ref = useRef(null)

  useEffect(() => {
    const root = ref.current
    if (!root) return
    const items = root.querySelectorAll('.reveal')
    if (typeof IntersectionObserver === 'undefined') {
      items.forEach((el) => el.classList.add('is-visible'))
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible')
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    )
    items.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  return ref
}

/**
 * Scroll progress (0 → 1) of an element travelling through the viewport.
 * `mode: 'through'` = from its top entering to its bottom leaving.
 * `mode: 'enter'`   = from its top entering to its bottom reaching viewport bottom.
 */
export function scrollProgressOf(el, mode = 'through') {
  if (!el) return 0
  const rect = el.getBoundingClientRect()
  const vh = window.innerHeight
  const total = mode === 'through' ? rect.height + vh : rect.height
  const current = vh - rect.top
  return Math.max(0, Math.min(1, current / (total || 1)))
}
