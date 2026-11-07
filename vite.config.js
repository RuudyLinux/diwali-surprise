import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.dirname(fileURLToPath(import.meta.url))

/**
 * Dev-only authoring endpoint for the sky portrait.
 * "Use This Photo" in the uploader POSTs the prepared JPEG here and it is
 * written to public/her-portrait.jpg, so the next `npm run build` ships it.
 * Runs only under `vite` (serve) — never part of the production site.
 */
function portraitAuthoring() {
  const dir = path.join(ROOT, 'public')
  const target = path.join(dir, 'her-portrait.jpg')
  return {
    name: 'diwali-portrait-authoring',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/__diwali/portrait', (req, res) => {
        const send = (code, body) => {
          res.statusCode = code
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(body))
        }
        // Same-origin only: block other websites from writing into the project
        const origin = req.headers.origin
        if (origin) {
          try {
            if (new URL(origin).host !== req.headers.host) return send(403, { ok: false, error: 'cross-origin' })
          } catch {
            return send(403, { ok: false, error: 'bad origin' })
          }
        }
        if (req.method === 'DELETE') {
          fs.rmSync(target, { force: true })
          return send(200, { ok: true, removed: true })
        }
        if (req.method !== 'POST') return send(405, { ok: false })

        const chunks = []
        let size = 0
        let aborted = false
        req.on('data', (c) => {
          size += c.length
          if (size > 8 * 1024 * 1024) {
            aborted = true
            send(413, { ok: false, error: 'too large' })
            req.destroy()
          } else chunks.push(c)
        })
        req.on('end', () => {
          if (aborted) return
          const buf = Buffer.concat(chunks)
          if (buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8 || buf[2] !== 0xff) {
            return send(400, { ok: false, error: 'expected JPEG' })
          }
          fs.mkdirSync(dir, { recursive: true })
          fs.writeFileSync(target, buf)
          send(200, { ok: true, path: 'public/her-portrait.jpg', bytes: buf.length })
        })
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), portraitAuthoring()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{js,jsx}'],
      exclude: ['src/main.jsx', 'src/setupTests.js'],
    },
  },
})
