import React, { useState } from 'react'
import { DIWALI_CONFIG } from '../config/diwaliConfig'

export default function SectionMemories({ config = DIWALI_CONFIG }) {
  const memories = config.relationshipMemories || []
  const [activeMemory, setActiveMemory] = useState(null)

  return (
    <section
      data-testid="section-memories"
      className="relative min-h-screen w-full bg-[#FFFCF6] text-[#382A2B] px-6 py-24 md:py-32 flex flex-col items-center justify-center overflow-hidden"
    >
      {/* ── Soft Ambient Glow ── */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] rounded-full bg-gradient-to-b from-[#FFF8ED] via-[#D6AD62]/10 to-transparent blur-3xl pointer-events-none" />

      {/* ── Section Header ── */}
      <div className="relative z-10 text-center max-w-2xl mb-16">
        <span className="inline-block px-4 py-1.5 rounded-full bg-[#FFF8ED] border border-[#D6AD62]/30 text-[#633B48] font-body text-xs font-semibold uppercase tracking-[0.2em] mb-4 shadow-xs">
          Section 04 · Our Story
        </span>
        <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-normal text-[#382A2B] tracking-tight leading-tight mb-4">
          {config.memoriesHeading || 'If I could wish for anything...'}
        </h2>
        <p className="font-body text-base sm:text-lg text-[#633B48] max-w-lg mx-auto font-normal leading-relaxed opacity-90">
          {config.memoriesSubtext || 'It would be to see you smiling, today and every day after.'}
        </p>
        <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-[#D6AD62] to-transparent mx-auto mt-6" />
      </div>

      {/* ── Editorial Photography Memory Cards Grid ── */}
      <div className="relative z-10 max-w-6xl w-full mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 lg:gap-8">
        {memories.map((mem, index) => (
          <article
            key={mem.id}
            data-testid={`memory-card-${index}`}
            onClick={() => setActiveMemory(activeMemory === mem.id ? null : mem.id)}
            className="group relative bg-[#FFF8ED] rounded-2xl overflow-hidden border border-[#D6AD62]/25 shadow-[0_12px_40px_rgba(99,59,72,0.06)] hover:shadow-[0_20px_50px_rgba(232,161,58,0.14)] hover:border-[#D6AD62]/60 transition-all duration-500 cursor-pointer flex flex-col"
          >
            {/* Photographic Image Frame */}
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#382A2B]/10">
              <img
                src={mem.image}
                alt={mem.imageAlt}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                loading="lazy"
              />
              {/* Warm Golden Color Grade Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#382A2B]/60 via-transparent to-transparent opacity-80" />

              {/* Tag Pill */}
              <div className="absolute bottom-3 left-4">
                <span className="inline-block px-3 py-1 rounded-full bg-[#FFF8ED]/90 backdrop-blur-xs text-[#382A2B] font-body text-[11px] font-semibold tracking-wide uppercase border border-[#D6AD62]/30 shadow-xs">
                  {mem.tag}
                </span>
              </div>
            </div>

            {/* Editorial Content */}
            <div className="p-6 md:p-7 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#D6AD62] font-semibold block mb-2">
                  0{index + 1} · Chapter
                </span>
                <h3 className="font-heading text-xl md:text-2xl font-bold text-[#382A2B] mb-3 leading-snug">
                  {mem.title}
                </h3>
                <p className="font-body text-sm sm:text-base text-[#633B48] leading-relaxed font-normal opacity-90">
                  {mem.content}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-[#D6AD62]/15 flex items-center justify-between text-xs font-body font-medium text-[#D6AD62]">
                <span>A treasured chapter</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

