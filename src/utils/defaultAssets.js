/**
 * Default high-fidelity SVG assets for Diwali Photos and Scrapbook.
 * 100% self-contained and offline-ready.
 */

// Diya & Sparkler Photo SVG
export const PHOTO_DIYAS = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="100%" height="100%">
  <defs>
    <radialGradient id="skyGlow" cx="50%" cy="65%" r="70%">
      <stop offset="0%" stop-color="#3d1502"/>
      <stop offset="45%" stop-color="#190602"/>
      <stop offset="100%" stop-color="#070104"/>
    </radialGradient>
    <radialGradient id="flameGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="25%" stop-color="#ffe600"/>
      <stop offset="65%" stop-color="#ff6600"/>
      <stop offset="100%" stop-color="#ff3300" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="clayGrad" cx="30%" cy="30%" r="80%">
      <stop offset="0%" stop-color="#c86d3b"/>
      <stop offset="60%" stop-color="#8a3c14"/>
      <stop offset="100%" stop-color="#4e1d05"/>
    </radialGradient>
  </defs>
  <rect width="600" height="450" fill="url(#skyGlow)"/>
  <!-- Sparkles -->
  <g fill="#fffae0">
    <circle cx="80" cy="70" r="1.5" opacity="0.6"/>
    <circle cx="210" cy="90" r="2" opacity="0.8"/>
    <circle cx="490" cy="60" r="1.5" opacity="0.7"/>
    <circle cx="520" cy="140" r="2.5" opacity="0.5"/>
    <circle cx="340" cy="40" r="1.8" opacity="0.9"/>
  </g>
  <!-- Background Diya Glow -->
  <ellipse cx="300" cy="270" rx="160" ry="110" fill="url(#flameGlow)" opacity="0.45"/>
  <!-- Diya Body -->
  <path d="M180,310 C200,380 400,380 420,310 C420,310 390,345 300,345 C210,345 180,310 180,310 Z" fill="url(#clayGrad)"/>
  <ellipse cx="300" cy="310" rx="120" ry="22" fill="#5c2005" stroke="#d4af37" stroke-width="3"/>
  <ellipse cx="300" cy="310" rx="100" ry="14" fill="#ffb300" opacity="0.85"/>
  <!-- Diya Flame -->
  <circle cx="300" cy="255" r="45" fill="url(#flameGlow)"/>
  <path d="M300,180 Q325,240 300,270 Q275,240 300,180 Z" fill="#fffa99"/>
  <path d="M300,205 Q314,245 300,265 Q286,245 300,205 Z" fill="#ffffff"/>
  <!-- Sparkler bursts around -->
  <path d="M440,170 L470,140 M460,190 L500,200 M430,210 L465,235 M450,150 L490,130" stroke="#ffd700" stroke-width="2" stroke-linecap="round"/>
  <circle cx="455" cy="180" r="3" fill="#ffffff"/>
  <path d="M160,180 L130,150 M140,200 L100,210 M170,220 L135,245 M150,160 L110,140" stroke="#ffd700" stroke-width="2" stroke-linecap="round"/>
  <circle cx="145" cy="190" r="3" fill="#ffffff"/>
  <text x="300" y="415" font-family="'Georgia', serif" font-size="20" font-weight="bold" fill="#ffdf7a" text-anchor="middle" letter-spacing="3">WARMTH &amp; DEVOTION</text>
</svg>
`)}`

// Rangoli Art Photo SVG
export const PHOTO_RANGOLI = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="100%" height="100%">
  <defs>
    <radialGradient id="rangoliBg" cx="50%" cy="50%" r="60%">
      <stop offset="0%" stop-color="#2a001a"/>
      <stop offset="100%" stop-color="#0a0005"/>
    </radialGradient>
  </defs>
  <rect width="600" height="450" fill="url(#rangoliBg)"/>
  <!-- Mandala Rangoli -->
  <g transform="translate(300,215)">
    <!-- Outer Petals -->
    <g fill="#e91e63" opacity="0.85">
      ${Array.from({ length: 12 }).map((_, i) => `<path d="M0,0 C25,-70 55,-110 0,-150 C-55,-110 -25,-70 0,0" transform="rotate(${i * 30})"/>`).join('')}
    </g>
    <!-- Middle Petals -->
    <g fill="#ff9800" opacity="0.9">
      ${Array.from({ length: 12 }).map((_, i) => `<path d="M0,0 C20,-50 40,-80 0,-110 C-40,-80 -20,-50 0,0" transform="rotate(${i * 30 + 15})"/>`).join('')}
    </g>
    <!-- Inner Petals -->
    <g fill="#ffd700">
      ${Array.from({ length: 12 }).map((_, i) => `<circle cx="0" cy="-65" r="9" transform="rotate(${i * 30})"/>`).join('')}
    </g>
    <!-- Center Core -->
    <circle cx="0" cy="0" r="42" fill="#00bcd4" stroke="#ffffff" stroke-width="3"/>
    <circle cx="0" cy="0" r="26" fill="#9c27b0"/>
    <circle cx="0" cy="0" r="12" fill="#ffeb3b"/>
  </g>
  <text x="300" y="415" font-family="'Georgia', serif" font-size="20" font-weight="bold" fill="#ffb74d" text-anchor="middle" letter-spacing="3">COLORS OF CELEBRATION</text>
</svg>
`)}`

// Sweets & Mithai Photo SVG
export const PHOTO_SWEETS = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="100%" height="100%">
  <defs>
    <radialGradient id="thaliBg" cx="50%" cy="50%" r="55%">
      <stop offset="0%" stop-color="#3b1d07"/>
      <stop offset="100%" stop-color="#0a0501"/>
    </radialGradient>
    <radialGradient id="silverPlate" cx="40%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#fff5cc"/>
      <stop offset="50%" stop-color="#d4af37"/>
      <stop offset="100%" stop-color="#7a5a0f"/>
    </radialGradient>
  </defs>
  <rect width="600" height="450" fill="url(#thaliBg)"/>
  <!-- Golden Brass Thali -->
  <circle cx="300" cy="210" r="170" fill="url(#silverPlate)" stroke="#fef08a" stroke-width="4"/>
  <circle cx="300" cy="210" r="150" fill="#422006" stroke="#92400e" stroke-width="2"/>
  <!-- Kaju Katli (Diamond Sweets with Silver Foil) -->
  <g transform="translate(300,165)">
    <polygon points="0,-35 45,0 0,35 -45,0" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>
    <polygon points="0,-35 45,0 0,35 -45,0" fill="#e2e8f0" opacity="0.6"/>
    <!-- Silver foil texture -->
    <path d="M-15,-10 L15,10 M-10,15 L20,-5" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="2,3"/>
  </g>
  <!-- Laddoos -->
  <circle cx="230" cy="245" r="28" fill="#f59e0b" stroke="#b45309" stroke-width="2"/>
  <circle cx="233" cy="243" r="24" fill="#fbbf24" opacity="0.9"/>
  <!-- Pistachio garnish -->
  <ellipse cx="232" cy="235" rx="4" ry="2" fill="#15803d"/>
  <circle cx="370" cy="245" r="28" fill="#f59e0b" stroke="#b45309" stroke-width="2"/>
  <circle cx="373" cy="243" r="24" fill="#fbbf24" opacity="0.9"/>
  <ellipse cx="372" cy="235" rx="4" ry="2" fill="#15803d"/>
  <!-- Gulab Jamun -->
  <circle cx="300" cy="265" r="26" fill="#451a03" stroke="#78350f" stroke-width="2"/>
  <circle cx="295" cy="258" r="7" fill="#fbbf24" opacity="0.35"/>
  <text x="300" y="415" font-family="'Georgia', serif" font-size="20" font-weight="bold" fill="#fde68a" text-anchor="middle" letter-spacing="3">SWEETEST MOMENTS</text>
</svg>
`)}`

// Sky Lanterns & Fireworks Photo SVG
export const PHOTO_LANTERNS = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="100%" height="100%">
  <defs>
    <linearGradient id="nightSky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#02000a"/>
      <stop offset="60%" stop-color="#0f0c29"/>
      <stop offset="100%" stop-color="#24243e"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#fff"/>
      <stop offset="30%" stop-color="#ffb703"/>
      <stop offset="70%" stop-color="#fb8500"/>
      <stop offset="100%" stop-color="transparent"/>
    </radialGradient>
  </defs>
  <rect width="600" height="450" fill="url(#nightSky)"/>
  <!-- Firework burst in distance -->
  <g transform="translate(140, 110)">
    ${Array.from({ length: 16 }).map((_, i) => `<line x1="0" y1="0" x2="${Math.cos(i * Math.PI / 8) * 55}" y2="${Math.sin(i * Math.PI / 8) * 55}" stroke="#ff007f" stroke-width="1.8" opacity="0.85"/>`).join('')}
  </g>
  <!-- Floating Sky Lanterns -->
  <!-- Lantern 1 (Main) -->
  <g transform="translate(320, 150)">
    <circle cx="0" cy="0" r="60" fill="url(#glow)" opacity="0.7"/>
    <path d="M-22,-35 C-30,0 -20,35 -5,40 L5,40 C20,35 30,0 22,-35 Z" fill="#ffb703" stroke="#d97706" stroke-width="1.5"/>
    <ellipse cx="0" cy="38" rx="8" ry="3" fill="#ffffff"/>
  </g>
  <!-- Lantern 2 -->
  <g transform="translate(470, 90) scale(0.65)">
    <circle cx="0" cy="0" r="50" fill="url(#glow)" opacity="0.8"/>
    <path d="M-22,-35 C-30,0 -20,35 -5,40 L5,40 C20,35 30,0 22,-35 Z" fill="#ff9e00"/>
  </g>
  <!-- Lantern 3 -->
  <g transform="translate(190, 230) scale(0.5)">
    <circle cx="0" cy="0" r="45" fill="url(#glow)" opacity="0.8"/>
    <path d="M-22,-35 C-30,0 -20,35 -5,40 L5,40 C20,35 30,0 22,-35 Z" fill="#ffb703"/>
  </g>
  <text x="300" y="415" font-family="'Georgia', serif" font-size="20" font-weight="bold" fill="#ffea79" text-anchor="middle" letter-spacing="3">ENDLESS DREAMS &amp; LIGHT</text>
</svg>
`)}`

