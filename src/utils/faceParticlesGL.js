/**
 * ─────────────────────────────────────────────────────────────────────────────
 * FACE PARTICLES (WebGL)
 * Renders every portrait dot as a GPU point in ONE draw call. Each dot's flight
 * (start → curved path → target) is computed in the vertex shader from a single
 * time uniform, so the CPU does almost nothing per frame → silky 60 fps even with
 * 30 000+ dots on phones.
 *
 * Look: dots travel as tiny warm sparks and "merge" on arrival — growing to
 * their full size and melting into the photo's own colour.
 * Falls back (returns null from create) when WebGL is unavailable.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const VS = `
attribute vec2 aStart;
attribute vec2 aTarget;
attribute vec4 aColor;   // rgb + settled alpha
attribute vec4 aAnim;    // delay, duration, curve, settled diameter (in cells)
attribute float aPhase;
uniform float uTime;
uniform float uAlpha;
uniform float uWait;
uniform float uCell;
uniform float uDpr;
uniform float uSmall;
uniform float uSizeMul;
uniform float uMaxSize;
uniform mediump float uGlowPass; // shared with the fragment shader → precision must match
uniform float uSettledGlow;
uniform float uTwinkle;
uniform vec2 uView;
uniform vec4 uRect;
varying vec4 vColor;
varying float vSoft;

float smoother(float t) { return t * t * t * (t * (t * 6.0 - 15.0) + 10.0); }

void main() {
  float local = clamp((uTime - aAnim.x) / aAnim.y, 0.0, 1.0);
  float e = smoother(local);
  vec2 s = aStart * uView;
  vec2 t = uRect.xy + aTarget * uRect.zw;
  vec2 d = t - s;
  vec2 p = s + d * e + vec2(-d.y, d.x) * aAnim.z * sin(3.14159265 * e);

  float arrive = smoothstep(0.55, 1.0, local);
  float waiting = 1.0 - step(0.00001, local);
  float size = mix(uSmall, uCell * aAnim.w, arrive);

  vec3 warm = mix(aColor.rgb, vec3(1.0, 0.86, 0.6), 0.6);
  vec3 col = mix(warm, aColor.rgb, arrive);
  float a = mix(0.9, aColor.a, arrive);
  a = mix(a, 0.38 * uWait, waiting);
  float tw = 1.0 - uTwinkle * 0.12 * (0.5 + 0.5 * sin(uTime * (0.8 + fract(aPhase * 7.13)) + aPhase));
  a *= tw * uAlpha;
  if (uGlowPass > 0.0) a *= uGlowPass * mix(1.0, uSettledGlow, arrive);

  vColor = vec4(col, a);
  vSoft = mix(0.95, 0.4, arrive);
  gl_PointSize = min(size * uSizeMul * uDpr, uMaxSize);
  gl_Position = vec4(p.x / uView.x * 2.0 - 1.0, 1.0 - p.y / uView.y * 2.0, 0.0, 1.0);
}
`

const FS = `
precision mediump float;
varying vec4 vColor;
varying float vSoft;
uniform float uGlowPass;
void main() {
  float d = length(gl_PointCoord - vec2(0.5)) * 2.0;
  float a = uGlowPass > 0.0 ? pow(max(0.0, 1.0 - d), 2.2) : 1.0 - smoothstep(1.0 - vSoft, 1.0, d);
  a *= vColor.a;
  if (a < 0.002) discard;
  gl_FragColor = vec4(vColor.rgb * a, a);
}
`

const FLOATS = 13 // start2 target2 color4 anim4 phase1

function compile(gl, type, src) {
  const sh = gl.createShader(type)
  gl.shaderSource(sh, src)
  gl.compileShader(sh)
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(sh)
    gl.deleteShader(sh)
    throw new Error(log || 'shader compile failed')
  }
  return sh
}

export class FaceParticlesGL {
  static create(canvas) {
    try {
      const gl = canvas?.getContext?.('webgl', {
        alpha: true,
        premultipliedAlpha: true,
        antialias: false,
        depth: false,
        stencil: false,
        powerPreference: 'high-performance',
      })
      if (!gl || typeof gl.createShader !== 'function') return null
      if (gl.isContextLost?.()) return null
      return new FaceParticlesGL(canvas, gl)
    } catch {
      return null
    }
  }

  constructor(canvas, gl) {
    this.canvas = canvas
    this.gl = gl
    this.count = 0
    this.ok = true
    const prog = gl.createProgram()
    gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VS))
    gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FS))
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) || 'link failed')
    this.prog = prog
    this.attr = {}
    for (const n of ['aStart', 'aTarget', 'aColor', 'aAnim', 'aPhase']) this.attr[n] = gl.getAttribLocation(prog, n)
    this.uni = {}
    for (const n of ['uTime', 'uAlpha', 'uWait', 'uCell', 'uDpr', 'uSmall', 'uSizeMul', 'uMaxSize', 'uGlowPass', 'uSettledGlow', 'uTwinkle', 'uView', 'uRect']) {
      this.uni[n] = gl.getUniformLocation(prog, n)
    }
    this.buffer = gl.createBuffer()
    const range = gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE)
    this.maxPoint = range ? range[1] : 64
    this._onLost = (e) => {
      e.preventDefault()
      this.ok = false
    }
    canvas.addEventListener('webglcontextlost', this._onLost)
  }

  resize(w, h, dpr) {
    this.canvas.width = Math.round(w * dpr)
    this.canvas.height = Math.round(h * dpr)
  }

  /**
   * particles: [{ sx, sy (0–1 of screen), nx, ny (0–1 of portrait), rgb[0–255] | null,
   *   tint[0–1 rgb] (gold mode), alpha, delay, dur, curve, size (cells), ph }]
   */
  upload(particles) {
    const gl = this.gl
    const data = new Float32Array(particles.length * FLOATS)
    let o = 0
    for (const p of particles) {
      data[o++] = p.sx
      data[o++] = p.sy
      data[o++] = p.nx
      data[o++] = p.ny
      data[o++] = p.cr
      data[o++] = p.cg
      data[o++] = p.cb
      data[o++] = p.alpha
      data[o++] = p.delay
      data[o++] = p.dur
      data[o++] = p.curve
      data[o++] = p.size
      data[o++] = p.ph
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer)
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
    this.count = particles.length
  }

  clear() {
    const gl = this.gl
    gl.viewport(0, 0, this.canvas.width, this.canvas.height)
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
  }

  reset() {
    this.count = 0
    if (this.ok) this.clear()
  }

  draw(u) {
    if (!this.ok) return
    const gl = this.gl
    this.clear()
    if (!this.count) return
    gl.useProgram(this.prog)
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer)
    const stride = FLOATS * 4
    const bind = (name, size, offset) => {
      const loc = this.attr[name]
      if (loc < 0) return
      gl.enableVertexAttribArray(loc)
      gl.vertexAttribPointer(loc, size, gl.FLOAT, false, stride, offset * 4)
    }
    bind('aStart', 2, 0)
    bind('aTarget', 2, 2)
    bind('aColor', 4, 4)
    bind('aAnim', 4, 8)
    bind('aPhase', 1, 12)

    const U = this.uni
    gl.uniform1f(U.uTime, u.time)
    gl.uniform1f(U.uAlpha, u.alpha)
    gl.uniform1f(U.uWait, u.wait)
    gl.uniform1f(U.uCell, u.cell)
    gl.uniform1f(U.uDpr, u.dpr)
    gl.uniform1f(U.uSmall, u.small)
    gl.uniform1f(U.uMaxSize, this.maxPoint)
    gl.uniform1f(U.uSettledGlow, u.settledGlow)
    gl.uniform1f(U.uTwinkle, u.twinkle)
    gl.uniform2f(U.uView, u.view[0], u.view[1])
    gl.uniform4f(U.uRect, u.rect[0], u.rect[1], u.rect[2], u.rect[3])

    gl.enable(gl.BLEND)
    // pass 1 · the dots themselves
    gl.uniform1f(U.uGlowPass, 0)
    gl.uniform1f(U.uSizeMul, 1)
    if (u.additive) gl.blendFunc(gl.ONE, gl.ONE)
    else gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
    gl.drawArrays(gl.POINTS, 0, this.count)
    // pass 2 · soft light bloom (strong on travelling sparks, faint once settled)
    if (u.glow > 0) {
      gl.uniform1f(U.uGlowPass, u.glow)
      gl.uniform1f(U.uSizeMul, 3)
      gl.blendFunc(gl.ONE, gl.ONE)
      gl.drawArrays(gl.POINTS, 0, this.count)
    }
  }

  dispose() {
    try {
      this.canvas.removeEventListener('webglcontextlost', this._onLost)
      const gl = this.gl
      gl.deleteBuffer(this.buffer)
      gl.deleteProgram(this.prog)
      // Note: no loseContext() — the same <canvas> may be re-used (React StrictMode
      // remounts, replays) and a lost context can never be recovered.
    } catch {
      /* already gone */
    }
    this.ok = false
  }
}
