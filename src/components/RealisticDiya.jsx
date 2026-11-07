import React, { useMemo } from 'react'

/**
 * Photorealistic / high-fidelity traditional Indian clay diya with natural flame,
 * realistic clay textures, multi-layer flame envelope, and warm ambient glow.
 */
export default function RealisticDiya({
  size = 280,
  scale = 1,
  brightness = 1,
  isLitUp = false,
  onClick,
  className = '',
  flameScale = 1,
  flameTransitionMs = 700,
}) {
  const dynamicGlowRadius = useMemo(() => {
    return isLitUp ? 140 * brightness : 70 * brightness
  }, [isLitUp, brightness])

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex flex-col items-center select-none cursor-pointer transition-transform duration-700 ease-out ${className}`}
      style={{
        transform: `scale(${scale})`,
        width: `${size}px`,
      }}
      role="button"
      tabIndex={0}
      aria-label="Auspicious Diwali Diya"
    >
      {/* ── Ambient Radial Warmth Bloom ── */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none transition-all duration-1000 ease-out"
        style={{
          width: `${dynamicGlowRadius * 2.8}px`,
          height: `${dynamicGlowRadius * 2.4}px`,
          background: isLitUp
            ? 'radial-gradient(circle, rgba(232,161,58,0.55) 0%, rgba(243,165,47,0.3) 40%, rgba(214,173,98,0.12) 70%, transparent 100%)'
            : 'radial-gradient(circle, rgba(232,161,58,0.38) 0%, rgba(243,165,47,0.18) 45%, rgba(214,173,98,0.06) 75%, transparent 100%)',
          filter: 'blur(24px)',
          opacity: 0.95,
        }}
      />

      {/* ── The Flame Envelope ── */}
      {/* outer wrapper scales the whole flame (ignition: small → full) */}
      <div
        className="relative z-20 mb-[-14px]"
        style={{
          transform: `scale(${flameScale})`,
          transformOrigin: 'bottom center',
          transition: `transform ${flameTransitionMs}ms cubic-bezier(.3,.6,.2,1)`,
        }}
      >
      <div
        className="relative flex flex-col items-center"
        style={{
          transformOrigin: 'bottom center',
          animation: 'flameSway 3.2s ease-in-out infinite alternate',
        }}
      >
        {/* Outer Heat Halo */}
        <div
          className="absolute -top-3 w-16 h-28 rounded-full pointer-events-none transition-all duration-700"
          style={{
            background: 'radial-gradient(ellipse at center bottom, rgba(255, 170, 0, 0.45) 0%, rgba(255, 100, 0, 0.2) 60%, transparent 80%)',
            filter: 'blur(10px)',
            transform: isLitUp ? 'scale(1.4)' : 'scale(1)',
          }}
        />

        {/* Outer Orange Flame */}
        <div
          className="w-8 h-18 rounded-[50%_50%_35%_35%/70%_70%_30%_30%] relative transition-all duration-700"
          style={{
            background: 'linear-gradient(180deg, #FF6F00 0%, #FF9E00 45%, #FFD000 85%, #FFF8E7 100%)',
            boxShadow: isLitUp
              ? '0 0 28px rgba(255, 170, 0, 0.9), 0 -8px 22px rgba(255, 230, 150, 0.8)'
              : '0 0 16px rgba(255, 160, 0, 0.75), 0 -4px 12px rgba(255, 210, 100, 0.6)',
            animation: 'flickerOrganic 2.4s ease-in-out infinite alternate',
          }}
        >
          {/* Middle Golden Core */}
          <div
            className="absolute bottom-1 left-1/2 -translate-x-1/2 w-5 h-12 rounded-[50%_50%_35%_35%/70%_70%_30%_30%]"
            style={{
              background: 'linear-gradient(180deg, #FFD54F 0%, #FFF59D 60%, #FFFFFF 100%)',
              filter: 'blur(0.5px)',
            }}
          />

          {/* Inner Incandescent White/Blue Wick Root */}
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-4 rounded-full"
            style={{
              background: 'radial-gradient(circle at bottom, #80D8FF 0%, #FFFFFF 70%)',
              filter: 'blur(0.4px)',
            }}
          />
        </div>

        {/* Cotton Wick Stick */}
        <div
          className="w-1.5 h-3.5 bg-gradient-to-b from-[#211516] to-[#5D4037] rounded-full mt-[-2px] z-10"
        />
      </div>
      </div>

      {/* ── Terracotta Clay Diya Body ── */}
      <div className="relative z-10 w-full flex flex-col items-center">
        {/* Diya Rim Oil Reservoir */}
        <div
          className="w-[84%] h-7 rounded-[50%] relative z-20 overflow-hidden"
          style={{
            background: 'radial-gradient(ellipse at 50% 30%, #FFB74D 0%, #B25E1B 45%, #6A2C0D 80%, #3E1605 100%)',
            boxShadow: 'inset 0 3px 8px rgba(255,230,150,0.6), inset 0 -3px 6px rgba(0,0,0,0.7)',
            border: '1px solid rgba(184, 94, 27, 0.6)',
          }}
        >
          {/* Liquid Ghee/Oil Golden Shimmer */}
          <div
            className="absolute inset-1 rounded-[50%] opacity-85"
            style={{
              background: 'radial-gradient(ellipse at 50% 40%, rgba(255,224,130,0.9) 0%, rgba(245,124,0,0.6) 50%, rgba(93,33,7,0.85) 100%)',
              boxShadow: 'inset 0 1px 4px rgba(255,255,255,0.7)',
            }}
          />
        </div>

        {/* Diya Clay Bowl (Hand-molded traditional curved shape) */}
        <div
          className="w-[92%] h-14 rounded-b-[100px] mt-[-10px] relative overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, #A04A15 0%, #87360A 35%, #5E2004 70%, #381202 100%)',
            boxShadow: '0 12px 28px rgba(56, 42, 43, 0.28), inset 0 2px 4px rgba(255, 183, 77, 0.45)',
          }}
        >
          {/* Handcrafted clay engravings / traditional ridges */}
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="w-full h-full border-b border-[#FFE082] rounded-b-[100px] transform scale-x-90" />
            <div className="w-full h-full border-b border-[#FFE082] rounded-b-[100px] transform scale-x-75" />
          </div>

          {/* Golden highlight on the left crest */}
          <div
            className="absolute top-0 left-3 w-12 h-8 rounded-full pointer-events-none opacity-40"
            style={{
              background: 'radial-gradient(circle, rgba(255, 236, 179, 0.7) 0%, transparent 70%)',
              filter: 'blur(4px)',
            }}
          />
        </div>

        {/* Diya Base Pedestal */}
        <div
          className="w-[42%] h-2.5 rounded-full mt-[-2px]"
          style={{
            background: '#4E1803',
            boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
          }}
        />

        {/* Realistic Drop Shadow on Floor */}
        <div
          className="w-[90%] h-5 rounded-[50%] mt-[-4px] pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse, rgba(56, 42, 43, 0.35) 0%, rgba(56, 42, 43, 0.15) 50%, transparent 75%)',
            filter: 'blur(5px)',
          }}
        />
      </div>

      <style>{`
        @keyframes flameSway {
          0% { transform: rotate(-1.5deg) scaleY(1); }
          50% { transform: rotate(1.2deg) scaleY(1.04); }
          100% { transform: rotate(-0.8deg) scaleY(0.97); }
        }
        @keyframes flickerOrganic {
          0%, 100% { filter: brightness(1) drop-shadow(0 0 10px rgba(255,160,0,0.7)); }
          25% { filter: brightness(1.08) drop-shadow(0 0 14px rgba(255,180,30,0.9)); }
          50% { filter: brightness(0.96) drop-shadow(0 0 8px rgba(255,140,0,0.6)); }
          75% { filter: brightness(1.05) drop-shadow(0 0 12px rgba(255,170,10,0.8)); }
        }
      `}</style>
    </div>
  )
}

