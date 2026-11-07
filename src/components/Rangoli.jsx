import React from 'react'

/**
 * Hand-drawn style rangoli mandala in gold line-work (SVG).
 * Petal rings rotate in opposite directions for a slow, hypnotic motion.
 */
export default function Rangoli({ size = 560, className = '', style }) {
  const petals = (count, r, len, w) =>
    Array.from({ length: count }, (_, i) => {
      const a = (360 / count) * i
      return (
        <path
          key={i}
          transform={`rotate(${a} 200 200)`}
          d={`M200 ${200 - r} C ${200 + w} ${200 - r - len * 0.35}, ${200 + w * 0.6} ${200 - r - len}, 200 ${
            200 - r - len
          } C ${200 - w * 0.6} ${200 - r - len}, ${200 - w} ${200 - r - len * 0.35}, 200 ${200 - r} Z`}
        />
      )
    })

  const dots = (count, r) =>
    Array.from({ length: count }, (_, i) => {
      const a = ((Math.PI * 2) / count) * i
      return <circle key={i} cx={200 + Math.cos(a) * r} cy={200 + Math.sin(a) * r} r="2.2" />
    })

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 400 400"
      width={size}
      height={size}
      className={className}
      style={style}
    >
      <defs>
        <linearGradient id="rangoliGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFE6A6" />
          <stop offset="50%" stopColor="#F4C56A" />
          <stop offset="100%" stopColor="#FF9F2E" />
        </linearGradient>
      </defs>
      <g fill="none" stroke="url(#rangoliGold)" strokeWidth="0.9" opacity="0.9">
        <g style={{ transformOrigin: '200px 200px', animation: 'spinSlow 120s linear infinite' }}>
          {petals(16, 120, 58, 16)}
          <circle cx="200" cy="200" r="190" strokeDasharray="2 6" />
        </g>
        <g style={{ transformOrigin: '200px 200px', animation: 'spinSlow 90s linear infinite reverse' }}>
          {petals(12, 70, 46, 18)}
          <circle cx="200" cy="200" r="118" />
          <circle cx="200" cy="200" r="112" strokeDasharray="1 4" />
        </g>
        <g style={{ transformOrigin: '200px 200px', animation: 'spinSlow 60s linear infinite' }}>
          {petals(8, 26, 40, 14)}
          <circle cx="200" cy="200" r="66" />
        </g>
      </g>
      <g fill="#F4C56A" opacity="0.75">
        {dots(24, 150)}
        {dots(12, 92)}
      </g>
    </svg>
  )
}
