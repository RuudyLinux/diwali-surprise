# Diwali Surprise 🪔

An interactive, cinematic Diwali greeting website — a night sky of floating lanterns,
a scroll-driven walk into the light, heartfelt words, little couple games, and a final
"Light a Diya for Us" celebration with mega fireworks, a golden fireworks heart and her
portrait drawn in thousands of golden lights.

Built with React 18, Vite 5 and Tailwind CSS. All fireworks and particles are drawn on
HTML Canvas; all sound effects are synthesised live with the Web Audio API (no audio files).

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # unit tests (Vitest)
npm run build    # production build in dist/
```

## Personalise

- **Names & messages:** `src/config/diwaliConfig.js`, or the **Personalize** button in the site header.
- **Sky portrait:** Personalize → **Photo setup** (or "Upload Her Photo" in the final section).
  Drag/drop a JPG, PNG or WebP, crop and zoom, preview the golden-dot version, then **Use This Photo**.
  - While running `npm run dev`, the prepared photo is saved to `public/her-portrait.jpg`, so it ships with the next build.
  - Otherwise, download the prepared file and put it at `public/her-portrait.jpg` yourself.
  - If no portrait exists, the finale writes her name in stars instead. It never invents a face.

Photos are processed only in the browser and are never sent to any external or AI service.

## The final celebration

Click **Light a Diya for Us ✨** → the flame ignites → once it is fully lit, the full-screen sky
show starts 5 seconds later: distant fireworks → rising comets → mega show → grand burst →
fireworks heart → her face assembling from golden dots → the closing message.
It includes sound on/off, volume, replay and close controls, plus a reduced-motion version.
