import * as THREE from 'three'

export const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
export const lerp = (a, b, t) => a + (b - a) * t
export const smoothstep = (a, b, x) => {
  const t = clamp((x - a) / (b - a), 0, 1)
  return t * t * (3 - 2 * t)
}
export const invLerp = (a, b, v) => clamp((v - a) / (b - a), 0, 1)
export const damp = (a, b, lambda, dt) => lerp(a, b, 1 - Math.exp(-lambda * dt))
export const rand = (a, b) => a + Math.random() * (b - a)
export const pick = arr => arr[Math.floor(Math.random() * arr.length)]
export const TAU = Math.PI * 2

export function mulberry32(seed) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed)
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }
}

export function canvasTex(w, h, draw, opts = {}) {
  const c = document.createElement('canvas')
  c.width = w; c.height = h
  const ctx = c.getContext('2d')
  draw(ctx, w, h)
  const t = new THREE.CanvasTexture(c)
  t.wrapS = t.wrapT = opts.wrap ?? THREE.ClampToEdgeWrapping
  t.colorSpace = opts.colorSpace ?? THREE.SRGBColorSpace
  t.anisotropy = 4
  if (opts.repeat) t.repeat.set(opts.repeat[0], opts.repeat[1])
  t.needsUpdate = true
  return t
}

let noiseCanvas = null
function noisePattern(size, base, variance, alpha = 1) {
  const c = document.createElement('canvas')
  c.width = c.height = size
  const ctx = c.getContext('2d')
  ctx.fillStyle = base
  ctx.fillRect(0, 0, size, size)
  const img = ctx.getImageData(0, 0, size, size)
  const d = img.data
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - 0.5) * variance
    d[i] = clamp(d[i] + n, 0, 255)
    d[i + 1] = clamp(d[i + 1] + n, 0, 255)
    d[i + 2] = clamp(d[i + 2] + n, 0, 255)
    d[i + 3] = 255 * alpha
  }
  ctx.putImageData(img, 0, 0)
  return c
}

export function asphaltTexture() {
  const c = noisePattern(256, '#4a4b4d', 38)
  const ctx = c.getContext('2d')
  ctx.globalAlpha = 0.35
  for (let i = 0; i < 500; i++) {
    ctx.fillStyle = Math.random() > 0.5 ? '#6b6c6e' : '#303133'
    const r = Math.random() * 1.8
    ctx.beginPath(); ctx.arc(Math.random() * 256, Math.random() * 256, r, 0, TAU); ctx.fill()
  }
  ctx.globalAlpha = 0.15
  ctx.strokeStyle = '#222'
  for (let i = 0; i < 8; i++) {
    ctx.beginPath()
    ctx.moveTo(Math.random() * 256, 0)
    ctx.bezierCurveTo(Math.random() * 256, 80, Math.random() * 256, 180, Math.random() * 256, 256)
    ctx.stroke()
  }
  return canvasTex(256, 256, (ctx2) => ctx2.drawImage(c, 0, 0), { wrap: THREE.RepeatWrapping, repeat: [1, 1] })
}

export function concreteTexture(tint = '#9a978f') {
  const c = noisePattern(128, tint, 28)
  const ctx = c.getContext('2d')
  ctx.strokeStyle = 'rgba(60,58,54,0.35)'; ctx.lineWidth = 2
  for (let i = 0; i <= 128; i += 32) {
    ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(128, i); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 128); ctx.stroke()
  }
  return canvasTex(128, 128, (ctx2) => ctx2.drawImage(c, 0, 0), { wrap: THREE.RepeatWrapping })
}

export function buildingTexture(variant = 0, lit = false) {
  const W = 256, H = 512
  const fills = [['#b9ae9c', '#a99d89'], ['#8e9295', '#7c8184'], ['#c7bfae', '#b4ab99'], ['#6d7478', '#5f666a'], ['#a5765f', '#94674f']]
  const [base, shade] = fills[variant % fills.length]
  return canvasTex(W, H, (ctx) => {
    ctx.fillStyle = base; ctx.fillRect(0, 0, W, H)
    const g = ctx.createLinearGradient(0, 0, 0, H)
    g.addColorStop(0, 'rgba(255,255,255,0.08)')
    g.addColorStop(1, 'rgba(0,0,0,0.18)')
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H)
    const cols = 4, rows = 10
    const mx = 20, my = 16
    const cw = (W - mx * 2) / cols, ch = (H - my * 2) / rows
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = mx + c * cw, y = my + r * ch
        const litWin = Math.random() > 0.38
        ctx.fillStyle = lit ? (litWin ? '#ffd9a0' : '#131a22') : (Math.random() > 0.3 ? '#26333f' : '#1a252f')
        if (lit && litWin) {
          ctx.fillStyle = Math.random() > 0.5 ? '#ffcf8a' : '#ffe3b0'
        }
        ctx.fillRect(x + 7, y + 8, cw - 14, ch - 20)
        ctx.fillStyle = lit ? (litWin ? 'rgba(255,240,210,0.23)' : 'rgba(255,255,255,0.03)') : 'rgba(200,220,240,0.22)'
        ctx.fillRect(x + 7, y + 8, cw - 14, (ch - 20) * 0.45)
        ctx.strokeStyle = lit ? 'rgba(255,220,170,0.14)' : 'rgba(230,235,240,0.12)'
        ctx.lineWidth = 1
        ctx.strokeRect(x + 7, y + 8, cw - 14, ch - 20)
      }
      ctx.fillStyle = 'rgba(0,0,0,0.12)'
      ctx.fillRect(0, my + r * ch + ch - 7, W, 3)
    }
    ctx.fillStyle = 'rgba(0,0,0,0.18)'
    for (let i = 0; i < 700; i++) ctx.fillRect(Math.random() * W, Math.random() * H, 1.4, 1.4)
    ctx.fillStyle = shade; ctx.globalAlpha = 0.2
    ctx.fillRect(0, 0, 6, H)
  }, { wrap: THREE.RepeatWrapping })
}

export function signTexture(lines, opts = {}) {
  const W = opts.width ?? 512, H = opts.height ?? 256
  const bg = opts.bg ?? '#1f6b3a'
  const fg = opts.fg ?? '#ffffff'
  return canvasTex(W, H, (ctx) => {
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H)
    ctx.strokeStyle = fg; ctx.lineWidth = opts.border ?? 10
    ctx.strokeRect(ctx.lineWidth / 2, ctx.lineWidth / 2, W - ctx.lineWidth, H - ctx.lineWidth)
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    const arr = Array.isArray(lines) ? lines : [lines]
    const n = arr.length
    arr.forEach((line, i) => {
      const size = (opts.fontSize ?? 58) * (n > 1 ? 0.82 : 1)
      ctx.fillStyle = opts.accent && i === 0 ? opts.accent : fg
      ctx.font = `${opts.bold === false ? 500 : 700} ${size}px "Barlow Condensed", "Arial Narrow", sans-serif`
      ctx.fillText(line, W / 2, H * (n === 1 ? 0.52 : (i + 0.65) / (n + 0.4)))
    })
  })
}

export function speedSignTexture(limit) {
  return canvasTex(256, 256, (ctx) => {
    ctx.clearRect(0, 0, 256, 256)
    ctx.fillStyle = '#f3f1ec'; ctx.beginPath(); ctx.arc(128, 128, 118, 0, TAU); ctx.fill()
    ctx.lineWidth = 26; ctx.strokeStyle = '#c9242b'; ctx.beginPath(); ctx.arc(128, 128, 100, 0, TAU); ctx.stroke()
    ctx.fillStyle = '#1c1c1c'; ctx.font = '800 118px "Barlow Condensed", Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText(String(limit), 128, 138)
  })
}

export function radialTexture(inner = 'rgba(255,255,255,1)', outer = 'rgba(255,255,255,0)', power = 1) {
  const c = document.createElement('canvas'); c.width = c.height = 128
  const ctx = c.getContext('2d')
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
  g.addColorStop(0, inner); g.addColorStop(power * 0.35, 'rgba(255,255,255,0.35)'); g.addColorStop(1, outer)
  ctx.fillStyle = g; ctx.fillRect(0, 0, 128, 128)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

export function plateTexture(text = 'BI 1234 AB') {
  return canvasTex(256, 64, (ctx) => {
    ctx.fillStyle = '#f2f4f5'; ctx.fillRect(0, 0, 256, 64)
    ctx.fillStyle = '#1a4aa0'; ctx.fillRect(0, 0, 42, 64)
    ctx.fillStyle = '#f0c400'; ctx.beginPath(); ctx.arc(21, 26, 9, 0, TAU); ctx.fill()
    ctx.fillStyle = '#fff'; ctx.font = 'bold 8px Arial'; ctx.textAlign = 'center'; ctx.fillText('E', 21, 46)
    ctx.fillStyle = '#1b1b1b'; ctx.font = '800 38px "Barlow Condensed", Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText(text, 144, 35)
  })
}

export function glowSprite(color = '#ffd9a0', size = 1) {
  const tex = radialTexture('rgba(255,255,255,1)', 'rgba(255,255,255,0)')
  const mat = new THREE.SpriteMaterial({ map: tex, color, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.8 })
  const s = new THREE.Sprite(mat)
  s.scale.setScalar(size)
  return s
}

export function meshBox(w, h, d, mat, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat)
  m.position.set(x, y, z)
  m.castShadow = true; m.receiveShadow = true
  return m
}

export function formatMoney(n) {
  return '€' + Math.round(n).toLocaleString('es-ES')
}

export function formatTime(s) {
  if (s == null) return '--:--'
  const m = Math.floor(s / 60)
  const r = Math.floor(s % 60)
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`
}

export function setObjectShadow(obj, cast = true, receive = true) {
  obj.traverse(o => { if (o.isMesh) { o.castShadow = cast; o.receiveShadow = receive } })
}
