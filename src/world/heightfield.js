import * as THREE from 'three'
import { RIVER, WORLD_SIZE } from '../data/mapData.js'
import { clamp, lerp, smoothstep } from '../utils.js'

export const SEA_LEVEL = -2.4

function hash2(x, z) {
  const n = Math.sin(x * 127.1 + z * 311.7 + 13.7) * 43758.5453123
  return n - Math.floor(n)
}
function noise2(x, z) {
  const xi = Math.floor(x), zi = Math.floor(z)
  const xf = x - xi, zf = z - zi
  const u = xf * xf * (3 - 2 * xf)
  const v = zf * zf * (3 - 2 * zf)
  const a = hash2(xi, zi), b = hash2(xi + 1, zi), c = hash2(xi, zi + 1), d = hash2(xi + 1, zi + 1)
  return lerp(lerp(a, b, u), lerp(c, d, u), v)
}
function fbm(x, z) {
  return noise2(x, z) * 0.58 + noise2(x * 2.13 + 5, z * 2.13 + 7) * 0.28 + noise2(x * 4.7, z * 4.7) * 0.14
}
function gauss(x, z, cx, cz, s) {
  const dx = x - cx, dz = z - cz
  return Math.exp(-(dx * dx + dz * dz) / (2 * s * s))
}

// Polyline of the Nervión / estuary; used for carving and water scenery.
const RIVER_LINE = RIVER.map(([x, z]) => new THREE.Vector2(x, z))
export function distToRiver(x, z) {
  const p = new THREE.Vector2(x, z)
  let best = 1e9
  for (let i = 0; i < RIVER_LINE.length - 1; i++) {
    const a = RIVER_LINE[i], b = RIVER_LINE[i + 1]
    const ab = b.clone().sub(a)
    const t = clamp(p.clone().sub(a).dot(ab) / ab.lengthSq(), 0, 1)
    const d = p.distanceTo(a.clone().addScaledVector(ab, t))
    if (d < best) best = d
  }
  return best
}

const COAST = [
  [-1750, -1750], [-1750, -330], [-1450, -500], [-1240, -870], [-1050, -1130],
  [-800, -1330], [-400, -1450], [0, -1560], [420, -1700], [900, -1750]
]
function pointInPoly(x, z, poly) {
  let inside = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, zi] = poly[i], [xj, zj] = poly[j]
    if ((zi > z) !== (zj > z) && x < (xj - xi) * (z - zi) / (zj - zi) + xi) inside = !inside
  }
  return inside
}

export class HeightField {
  constructor() {
    this.size = WORLD_SIZE
    this.half = WORLD_SIZE / 2
    this.N = 400
    this.cell = WORLD_SIZE / this.N
    this.base = new Float32Array((this.N + 1) * (this.N + 1))
    this.RN = 760
    this.rcell = WORLD_SIZE / this.RN
    this.roadDist = new Float32Array((this.RN + 1) * (this.RN + 1)).fill(999)
    this.roadY = new Float32Array((this.RN + 1) * (this.RN + 1))
    this.roadHalf = new Float32Array((this.RN + 1) * (this.RN + 1)).fill(6)
    this.roadBridge = new Uint8Array((this.RN + 1) * (this.RN + 1))
    this.buildBase()
  }

  riverDist(x, z) { return distToRiver(x, z) }

  baseHeight(x, z) {
    let h = 1.2
    h += 128 * gauss(x, z, 960, 1120, 470)
    h += 74 * gauss(x, z, 300, 1330, 520)
    h += 92 * gauss(x, z, -950, 760, 470)
    h += 58 * gauss(x, z, -1330, 220, 340)
    h += 42 * gauss(x, z, -600, -980, 330)
    h += 52 * gauss(x, z, 830, 560, 390)
    h += 60 * gauss(x, z, 440, -240, 240)
    h -= 12 * gauss(x, z, 200, 120, 900)
    const urban = gauss(x, z, 260, 170, 760) * 0.92 + gauss(x, z, -520, -220, 520) * 0.6 + gauss(x, z, -1050, -620, 400) * 0.55
    h *= (1 - clamp(urban, 0, 0.9))
    // river valley
    const rd = distToRiver(x, z)
    h -= 26 * smoothstep(170, 15, rd)
    // gentle coastal slope
    if (pointInPoly(x, z, COAST)) h -= 15
    // small scale relief
    h += (fbm(x * 0.012, z * 0.012) - 0.5) * 9 + (fbm(x * 0.05 + 11, z * 0.05 + 3) - 0.5) * 1.6
    // flatten the city plain
    h = lerp(h, 1.8 + (fbm(x * 0.02, z * 0.02) - 0.5) * 0.6, clamp(urban, 0, 0.9))
    h = Math.max(h, SEA_LEVEL - 6)
    return h
  }

  buildBase() {
    const N = this.N
    for (let iz = 0; iz <= N; iz++) {
      for (let ix = 0; ix <= N; ix++) {
        const x = -this.half + ix * this.cell
        const z = -this.half + iz * this.cell
        this.base[iz * (N + 1) + ix] = this.baseHeight(x, z)
      }
    }
  }

  baseAt(x, z) {
    const fx = clamp((x + this.half) / this.cell, 0, this.N - 0.001)
    const fz = clamp((z + this.half) / this.cell, 0, this.N - 0.001)
    const ix = Math.floor(fx), iz = Math.floor(fz)
    const tx = fx - ix, tz = fz - iz
    const i0 = iz * (this.N + 1) + ix
    const a = this.base[i0], b = this.base[i0 + 1]
    const c = this.base[i0 + this.N + 1], d = this.base[i0 + this.N + 2]
    return lerp(lerp(a, b, tx), lerp(c, d, tx), tz)
  }

  stampRoad(x, z, y, halfWidth, bridge = false) {
    const pad = halfWidth + 9
    const i0 = clamp(Math.floor((x - pad + this.half) / this.rcell), 0, this.RN)
    const i1 = clamp(Math.ceil((x + pad + this.half) / this.rcell), 0, this.RN)
    const j0 = clamp(Math.floor((z - pad + this.half) / this.rcell), 0, this.RN)
    const j1 = clamp(Math.ceil((z + pad + this.half) / this.rcell), 0, this.RN)
    for (let j = j0; j <= j1; j++) {
      for (let i = i0; i <= i1; i++) {
        const px = -this.half + i * this.rcell
        const pz = -this.half + j * this.rcell
        const d = Math.hypot(px - x, pz - z)
        const idx = j * (this.RN + 1) + i
        if (d < this.roadDist[idx]) {
          this.roadDist[idx] = d
          this.roadY[idx] = y
          this.roadHalf[idx] = halfWidth
          this.roadBridge[idx] = bridge ? 1 : 0
        }
      }
    }
  }

  roadInfoAt(x, z) {
    const ix = clamp(Math.round((x + this.half) / this.rcell), 0, this.RN)
    const iz = clamp(Math.round((z + this.half) / this.rcell), 0, this.RN)
    const idx = iz * (this.RN + 1) + ix
    return { dist: this.roadDist[idx], y: this.roadY[idx], half: this.roadHalf[idx], bridge: this.roadBridge[idx] === 1 }
  }

  heightAt(x, z) {
    const base = this.baseAt(x, z)
    const info = this.roadInfoAt(x, z)
    if (info.dist < info.half + 0.4) {
      if (info.bridge) return info.dist < info.half ? info.y : base
      return info.y
    }
    if (info.dist < info.half + 8) {
      const w = 1 - smoothstep(info.half, info.half + 8, info.dist)
      if (info.bridge) return base
      return lerp(base, info.y, w)
    }
    return base
  }

  surfaceAt(x, z) {
    const info = this.roadInfoAt(x, z)
    const onRoad = info.dist < info.half + 0.35
    return { onRoad, road: onRoad, roadType: onRoad ? 1 : 0, grip: onRoad ? 1 : 0.72 }
  }

  slopeAt(x, z, yaw) {
    const fx = Math.sin(yaw), fz = Math.cos(yaw)
    const d = 1.6
    const hf = this.heightAt(x + fx * d, z + fz * d)
    const hb = this.heightAt(x - fx * d, z - fz * d)
    return Math.atan2(hf - hb, d * 2)
  }

  isInSea(x, z) {
    return pointInPoly(x, z, COAST)
  }

  // grid of colors sampled for the terrain mesh
  terrainColor(x, z, h, slope, urban) {
    const c = new THREE.Color()
    const rd = distToRiver(x, z)
    if (h < SEA_LEVEL + 0.8) {
      c.set('#6c6652')
    } else if (rd < 55) {
      c.set('#6f6a54')
    } else if (h > 82) {
      c.set('#6e6c66').lerp(new THREE.Color('#4e5a44'), clamp(1 - (h - 82) / 60, 0, 1))
    } else {
      const green = new THREE.Color('#547a3c').lerp(new THREE.Color('#6f8f4a'), fbm(x * 0.03, z * 0.03))
      const dry = new THREE.Color('#87804f')
      c.copy(green).lerp(dry, clamp((fbm(x * 0.008 + 4, z * 0.008) - 0.42) * 1.4, 0, 0.5))
      if (urban > 0.3) c.lerp(new THREE.Color('#7e7b72'), clamp(urban * 0.78, 0, 0.72))
      if (slope > 0.5) c.lerp(new THREE.Color('#77736b'), clamp((slope - 0.5) * 0.8, 0, 0.5))
    }
    return c
  }
}
