import React, { useEffect, useState } from 'react'

/**
 * Vertical "string of lamps" navigation. Each chapter is a small diya
 * that glows when its section is on screen.
 */
export default function ChapterNav({ chapters }) {
  const [active, setActive] = useState(chapters[0]?.id)

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible) setActive(visible.target.id)
      },
      { threshold: [0.25, 0.5, 0.75] }
    )
    chapters.forEach((c) => {
      const el = document.getElementById(c.id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [chapters])

  const go = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <nav
      aria-label="Chapters"
      className="fixed right-4 md:right-7 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col items-end gap-5"
    >
      {/* the string */}
      <span className="absolute right-[7px] top-2 bottom-2 w-px bg-gradient-to-b from-transparent via-[#F4C56A]/30 to-transparent" />
      {chapters.map((c, i) => {
        const on = c.id === active
        return (
          <button
            key={c.id}
            onClick={() => go(c.id)}
            className="group relative flex items-center gap-3"
            aria-current={on ? 'true' : undefined}
            aria-label={`Go to chapter ${i + 1}: ${c.label}`}
          >
            <span
              className={`px-2.5 py-1 rounded-full bg-[#07040F]/80 backdrop-blur font-body text-[11px] tracking-[0.2em] uppercase transition-all duration-300 whitespace-nowrap opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 group-focus-visible:opacity-100 ${
                on ? 'text-[#FBE3A8]' : 'text-[#FBE3A8]/70'
              }`}
            >
              {c.label}
            </span>
            <span
              className="relative block w-[15px] h-[15px] rounded-full transition-all duration-500"
              style={{
                background: on
                  ? 'radial-gradient(circle at 50% 60%, #FFF6D8 0%, #FFC25A 45%, #F07A1E 100%)'
                  : 'rgba(255,244,222,0.12)',
                border: on ? 'none' : '1px solid rgba(244,197,106,0.45)',
                boxShadow: on ? '0 0 14px 4px rgba(255,159,46,0.55)' : 'none',
              }}
            />
          </button>
        )
      })}
    </nav>
  )
}
