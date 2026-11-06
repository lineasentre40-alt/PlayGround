import * as THREE from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { clamp, lerp, TAU, asphaltTexture, concreteTexture } from '../utils.js'
import { ROADS, WORLD_SIZE } from '../data/mapData.js'

const paintMat = new THREE.MeshStandardMaterial({ color: 0xf0efe6, roughness: 0.55, metalness: 0.02, emissive: 0xffffff, emissiveIntensity: 0.04 })
const guardMat = new THREE.MeshStandardMaterial({ color: 0xb8bdc1, roughness: 0.42, metalness: 0.82 })
const poleMat = new THREE.MeshStandardMaterial({ color: 0x5d6165, roughness: 0.55, metalness: 0.55 })
const lampMat = new THREE.MeshStandardMaterial({ color: 0xd9dde0, emissive: 0xffd9a0, emissiveIntensity: 0.0, roughness: 0.3 })
const tunnelMat = new THREE.MeshStandardMaterial({ color: 0x605e59, roughness: 0.94, metalness: 0.02, side: THREE.DoubleSide })
const tunnelLightMat = new THREE.MeshBasicMaterial({ color: 0xffd9a0 })
const sidewalkMat = new THREE.MeshStandardMaterial({ map: concreteTexture('#918e86'), color: 0xbfbcb3, roughness: 0.92, metalness: 0.02 })
const curbMat = new THREE.MeshStandardMaterial({ color: 0xaaa79e, roughness: 0.9 })

function ribbon(samples, fromOff, toOff, yOff = 0, closed = false, n = null) {
  const pts = []
  const uvs = []
  const idx = []
  const src = n ? n : samples.length
  let acc = 0
  for (let i = 0; i < src; i++) {
    const s = samples[i]
    if (i > 0) acc += Math.hypot(s.x - samples[i - 1].x, s.z - samples[i - 1].z)
    const rx = s.tz, rz = -s.tx
    pts.push(s.x + rx * fromOff, s.y + yOff, s.z + rz * fromOff)
    pts.push(s.x + rx * toOff, s.y + yOff, s.z + rz * toOff)
    uvs.push(0, acc / 6, 1, acc / 6)
    if (i > 0) {
      const b = (i - 1) * 2
      idx.push(b, b + 1, b + 2, b + 1, b + 3, b + 2)
    }
  }
  if (closed && src > 2) {
    const b = (src - 1) * 2
    idx.push(b, b + 1, 0, b + 1, 1, 0)
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3))
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  g.setIndex(idx)
  g.computeVertexNormals()
  return g
}

function markings(samples, offset, width, dash = 0, gap = 0, closed = true) {
  const geo = []
  const total = samples[samples.length - 1].d
  if (dash > 0) {
    for (let d = 0; d < total; d += dash + gap) {
      const a = sampleAt(samples, d, closed)
      const b = sampleAt(samples, Math.min(total - 0.02, d + dash), closed)
      if (!a || !b) continue
      const aw = width / 2
      const vertices = [
        [a.x + a.tz * (offset - aw), a.y + 0.075, a.z - a.tx * (offset - aw)],
        [a.x + a.tz * (offset + aw), a.y + 0.075, a.z - a.tx * (offset + aw)],
        [b.x + b.tz * (offset - aw), b.y + 0.075, b.z - b.tx * (offset - aw)],
        [b.x + b.tz * (offset + aw), b.y + 0.075, b.z - b.tx * (offset + aw)]
      ]
      geo.push(vertices)
    }
  } else {
    const g = ribbon(samples, offset - width / 2, offset + width / 2, 0.075, closed)
    return g.toNonIndexed()
  }
  const positions = []
  for (const q of geo) positions.push(...q[0], ...q[1], ...q[2], ...q[1], ...q[3], ...q[2])
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  g.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array((positions.length / 3) * 2), 2))
  g.computeVertexNormals()
  return g
}

export function sampleAt(samples, d, closed) {
  const n = samples.length
  if (!n) return null
  const total = samples[n - 1].d
  if (closed) d = ((d % total) + total) % total
  else d = clamp(d, 0, total - 0.001)
  let lo = 0, hi = n - 1
  while (lo < hi - 1) {
    const mid = (lo + hi) >> 1
    if (samples[mid].d <= d) lo = mid; else hi = mid
  }
  const a = samples[lo], b = samples[Math.min(n - 1, lo + 1)]
  const t = (d - a.d) / Math.max(0.0001, b.d - a.d)
  return {
    x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), z: lerp(a.z, b.z, t),
    tx: lerp(a.tx, b.tx, t), tz: lerp(a.tz, b.tz, t),
    d
  }
}

export class Road {
  constructor(data, heightField) {
    this.data = data
    this.hf = heightField
    this.id = data.id
    this.name = data.name
    this.kind = data.kind
    this.width = data.width
    this.half = data.width / 2
    this.closed = !!data.closed
    this.lanes = data.lanes || 2
    const pts = data.points.map(([x, z]) => new THREE.Vector3(x, 0, z))
    this.curve = new THREE.CatmullRomCurve3(pts, this.closed, 'centripetal', 0.4)
    this.curveLength = this.curve.getLength()
    const n = Math.max(24, Math.ceil(this.curveLength / 3))
    const raw = this.curve.getSpacedPoints(n)
    if (this.closed) raw.pop()
    const count = raw.length
    const ys = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      const p = raw[i]
      let y = Math.max(heightField.baseHeight(p.x, p.z), 1.9)
      if (data.bridge) {
        const rd = heightField.riverDist(p.x, p.z)
        const lift = 1 - (rd < 55 ? 0 : Math.min(1, (rd - 55) / 100))
        y += lift * 4.4
      }
      ys[i] = y
    }
    // smooth longitudinal profile
    for (let pass = 0; pass < (data.bridge ? 2 : 5); pass++) {
      const copy = ys.slice()
      for (let i = 0; i < count; i++) {
        const prev = this.closed ? (i - 1 + count) % count : Math.max(0, i - 1)
        const next = this.closed ? (i + 1) % count : Math.min(count - 1, i + 1)
        ys[i] = (copy[prev] + copy[i] * 2 + copy[next]) / 4
      }
    }
    // max grade limiting
    const step = this.curveLength / count
    for (let pass = 0; pass < 3; pass++) {
      for (let i = 1; i < count; i++) {
        const maxD = 0.145 * step
        if (ys[i] > ys[i - 1] + maxD) ys[i] = ys[i - 1] + maxD
        if (ys[i] < ys[i - 1] - maxD) ys[i] = ys[i - 1] - maxD
      }
    }
    const samples = []
    let acc = 0
    for (let i = 0; i < count; i++) {
      const p = raw[i]
      const prev = raw[this.closed ? (i - 1 + count) % count : Math.max(0, i - 1)]
      const next = raw[this.closed ? (i + 1) % count : Math.min(count - 1, i + 1)]
      let tx = next.x - prev.x, tz = next.z - prev.z
      const len = Math.hypot(tx, tz) || 1
      tx /= len; tz /= len
      if (i > 0) acc += Math.hypot(p.x - samples[i - 1].x, p.z - samples[i - 1].z)
      samples.push({ x: p.x, y: ys[i], z: p.z, tx, tz, d: acc, half: this.half })
    }
    this.samples = samples
    this.total = acc
    this.step = step
    const lw = this.width / this.lanes
    this.laneCenters = []
    for (let i = 0; i < this.lanes / 2; i++) this.laneCenters.push(this.half - lw * (i + 0.5))
    this.colliders = []
    this.lampPositions = []
    this.trafficLights = []
  }

  at(d) { return sampleAt(this.samples, d, this.closed) }
  atT(t) { return this.at(t * this.total) }
  nearestPoint(x, z) {
    let best = null, bd = 1e9
    for (let i = 0; i < this.samples.length; i += 2) {
      const s = this.samples[i]
      const d = (s.x - x) ** 2 + (s.z - z) ** 2
      if (d < bd) { bd = d; best = s }
    }
    return best
  }
}

export class RoadNetwork {
  constructor(scene, heightField) {
    this.scene = scene
    this.hf = heightField
    this.roads = []
    this.byId = {}
    this.paintGeos = []
    this.lampPositions = []
    this.guardGeos = []
    this.poleGeos = []
    this.speedSigns = []
    this.asphalt = asphaltTexture()
    this.asphalt.wrapS = this.asphalt.wrapT = THREE.RepeatWrapping
    this.asphalt.repeat.set(2, 1)
    this.asphaltMat = new THREE.MeshStandardMaterial({
      map: this.asphalt, color: 0x9a9a9a, roughness: 0.86, metalness: 0.06
    })
    this.lampMat = lampMat
    this.paintMat = paintMat
    this.build()
  }

  build() {
    for (const data of ROADS) {
      const road = new Road(data, this.hf)
      this.roads.push(road)
      this.byId[road.id] = road
      for (const s of road.samples) {
        this.hf.stampRoad(s.x, s.z, s.y, road.half, !!data.bridge)
      }
    }
    for (const road of this.roads) this.buildMeshes(road)
    this.flushMerged()
  }

  flushMerged() {
    if (this.paintGeos.length) {
      const merged = mergeGeometries(this.paintGeos, false)
      if (merged) {
        const m = new THREE.Mesh(merged, paintMat)
        m.receiveShadow = false
        this.scene.add(m)
      }
      this.paintGeos = []
    }
    if (this.guardGeos.length) {
      const merged = mergeGeometries(this.guardGeos, false)
      if (merged) {
        const m = new THREE.Mesh(merged, guardMat)
        m.castShadow = false; m.receiveShadow = false
        this.scene.add(m)
      }
      this.guardGeos = []
    }
    if (this.poleGeos.length) {
      const merged = mergeGeometries(this.poleGeos, false)
      if (merged) {
        const m = new THREE.Mesh(merged, poleMat)
        m.castShadow = false; m.receiveShadow = true
        this.scene.add(m)
      }
      this.poleGeos = []
    }
  }

  buildMeshes(road) {
    const d = road.data
    const closed = road.closed
    // main asphalt
    const asphaltGeo = ribbon(road.samples, -road.half, road.half, 0.045, closed)
    const roadMesh = new THREE.Mesh(asphaltGeo, this.asphaltMat)
    roadMesh.receiveShadow = true
    roadMesh.castShadow = false
    this.scene.add(roadMesh)

    // curbs / sidewalk
    const sw = d.sidewalks || 0
    if (sw > 0.4) {
      for (const side of [-1, 1]) {
        const from = Math.min(side * (road.half + 0.02), side * (road.half + sw))
        const to = Math.max(side * (road.half + 0.02), side * (road.half + sw))
        const g = ribbon(road.samples, from, to, 0.135, closed)
        const m = new THREE.Mesh(g, sidewalkMat)
        m.receiveShadow = true
        this.scene.add(m)
        const curb = ribbon(road.samples, side * (road.half - 0.01), side * (road.half + 0.16), 0.16, closed)
        const cm = new THREE.Mesh(curb, curbMat)
        cm.receiveShadow = true
        this.scene.add(cm)
      }
    }
    // markings
    if (this.paintGeos.length > 1200) this.flushMerged()
    const edge = road.half - 0.42
    if (d.kind !== 'bridge' || true) {
      this.paintGeos.push(markings(road.samples, -edge, 0.10, 0, 0, closed))
      this.paintGeos.push(markings(road.samples, edge, 0.10, 0, 0, closed))
    }
    if (d.lanes >= 4) {
      this.paintGeos.push(markings(road.samples, 0, 0.10, 0, 0, closed))
      this.paintGeos.push(markings(road.samples, -road.half * 0.5, 0.11, 3.5, 7, closed))
      this.paintGeos.push(markings(road.samples, road.half * 0.5, 0.11, 3.5, 7, closed))
    } else {
      this.paintGeos.push(markings(road.samples, 0, 0.11, 3.5, 7, closed))
    }

    // guardrails
    if (d.guardrail) {
      for (let dist = 0; dist < road.total; dist += 6) {
        for (const side of [-1, 1]) {
          const a = road.at(dist)
          if (!a) continue
          const off = side * (road.half + 0.5)
          const x = a.x + a.tz * off
          const z = a.z - a.tx * off
          const y = a.y
          const post = new THREE.BoxGeometry(0.08, 0.72, 0.08)
          post.translate(x, y + 0.36, z)
          this.guardGeos.push(post)
          if (dist % 12 === 0) {
            const rail = new THREE.BoxGeometry(0.12, 0.3, 6.1)
            const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.atan2(a.tx, a.tz))
            rail.applyQuaternion(q)
            rail.translate(x, y + 0.62, z)
            this.guardGeos.push(rail)
          }
          if (dist % 12 === 0) {
            road.colliders.push({ x, z, hw: 0.22, hd: 3.0, angle: Math.atan2(a.tx, a.tz), h: 0.8 })
          }
        }
      }
    }
    // lamps
    if (d.lamps > 0) {
      const lampStep = d.lamps
      for (let dist = 4; dist < road.total; dist += lampStep) {
        const a = road.at(dist)
        if (!a) continue
        const sides = d.kind === 'highway' ? [1] : [1, -1]
        for (const side of sides) {
          const off = side * (road.half + (sw > 0.4 ? 0.7 : 0.9))
          const bx = a.x + a.tz * off, bz = a.z - a.tx * off
          const baseY = this.hf.heightAt(bx, bz)
          const y = Math.max(a.y, baseY)
          // pole
          const pole = new THREE.CylinderGeometry(0.07, 0.10, 7.2, 6)
          pole.translate(bx, y + 3.6, bz)
          this.poleGeos.push(pole)
          // arm towards road
          const arm = new THREE.BoxGeometry(0.09, 0.09, 2.1)
          const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.atan2(a.tz, -a.tx))
          arm.applyQuaternion(q)
          arm.translate(bx - a.tz * side * 1.0, y + 7.1, bz + a.tx * side * 1.0)
          this.poleGeos.push(arm)
          const hx = bx - a.tz * side * 2.0, hz = bz + a.tx * side * 2.0
          const head = new THREE.BoxGeometry(0.55, 0.14, 0.28)
          head.translate(hx, y + 7.05, hz)
          // merge heads separately because they share a different material
          if (!this.lampGeo) this.lampGeo = []
          this.lampGeo.push(head)
          road.lampPositions.push({ x: hx, y: y + 6.9, z: hz })
          this.lampPositions.push({ x: hx, y: y + 6.9, z: hz })
        }
      }
    }
    // tunnel geometry
    if (d.tunnels) {
      for (const [t0, t1] of d.tunnels) this.buildTunnel(road, t0, t1)
    }
    // bus stop / benches for city
    if (d.kind === 'city' && d.density > 0.8) {
      for (let i = 0; i < 3; i++) {
        const a = road.atT(0.18 + i * 0.27)
        const off = road.half + sw + 0.9
        const bx = a.x + a.tz * off, bz = a.z - a.tx * off
        const y = this.hf.heightAt(bx, bz)
        const mat = new THREE.MeshStandardMaterial({ color: 0x2d343b, roughness: 0.6, metalness: 0.4 })
        const glass = new THREE.MeshStandardMaterial({ color: 0x88a6b5, roughness: 0.2, metalness: 0.5, transparent: true, opacity: 0.5 })
        const shelter = new THREE.Group()
        shelter.position.set(bx, y, bz)
        const roof = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.12, 1.2), mat)
        roof.position.set(0, 2.5, 0)
        const back = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2.1, 0.08), glass)
        back.position.set(0, 1.35, 0.55)
        const bench = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.1, 0.4), new THREE.MeshStandardMaterial({ color: 0x7a6a52, roughness: 0.7 }))
        bench.position.set(0, 0.5, 0)
        shelter.add(roof, back, bench)
        shelter.rotation.y = Math.atan2(a.tx, a.tz)
        this.scene.add(shelter)
      }
    }
    // road-specific scenery props handled by world
  }

  buildTunnel(road, t0, t1) {
    const d0 = t0 * road.total, d1 = t1 * road.total
    const positions = []
    const indices = []
    const lightGeo = []
    const steps = Math.max(8, Math.ceil((d1 - d0) / 5))
    const ringPts = 9
    for (let i = 0; i <= steps; i++) {
      const d = lerp(d0, d1, i / steps)
      const a = road.at(d)
      const rx = a.tz, rz = -a.tx
      for (let j = 0; j <= ringPts; j++) {
        const ang = Math.PI * (j / ringPts)
        const w = road.half + 1.8
        const x = a.x + rx * Math.cos(Math.PI - ang) * w
        const z = a.z + rz * Math.cos(Math.PI - ang) * w
        const y = a.y + Math.sin(ang) * (road.half + 2.5)
        positions.push(x, y, z)
      }
      if (i > 0) {
        const b = (i - 1) * (ringPts + 1)
        const c = i * (ringPts + 1)
        for (let j = 0; j < ringPts; j++) {
          indices.push(b + j, b + j + 1, c + j, b + j + 1, c + j + 1, c + j)
        }
      }
      if (i % 2 === 0) {
        const lx = a.x + a.tz * 0.0, lz = a.z - a.tx * 0.0
        lightGeo.push(lx, a.y + road.half + 1.0, lz)
      }
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    g.setIndex(indices)
    g.computeVertexNormals()
    const mesh = new THREE.Mesh(g, tunnelMat)
    mesh.receiveShadow = true
    this.scene.add(mesh)
    // interior light bars
    const barGeo = []
    for (const [x, y, z] of []) {}
    // portals
    for (const d of [d0, d1]) {
      const a = road.at(d)
      const portal = new THREE.Mesh(new THREE.BoxGeometry(road.half * 2 + 6, 0.8, 2.2), new THREE.MeshStandardMaterial({ color: 0x77736b, roughness: 0.9 }))
      portal.position.set(a.x, a.y + road.half + 2.9, a.z)
      portal.rotation.y = Math.atan2(a.tx, a.tz)
      this.scene.add(portal)
    }
    // emissive ceiling lights
    const lightsMesh = []
    for (let i = 0; i <= steps; i += 3) {
      const a = road.at(lerp(d0, d1, i / steps))
      const lg = new THREE.BoxGeometry(0.25, 0.08, 1.2)
      lg.translate(a.x, a.y + road.half + 1.7, a.z)
      lightsMesh.push(lg)
    }
    if (lightsMesh.length) {
      const lm = new THREE.Mesh(mergeGeometries(lightsMesh, false), tunnelLightMat)
      this.scene.add(lm)
    }
    // side collisions
    for (let d = d0; d < d1; d += 8) {
      const a = road.at(d)
      for (const side of [-1, 1]) {
        road.colliders.push({
          x: a.x + a.tz * side * (road.half + 1.3), z: a.z - a.tx * side * (road.half + 1.3),
          hw: 0.4, hd: 4.2, angle: Math.atan2(a.tx, a.tz), h: 6
        })
      }
    }
  }

  finalize() {
    this.flushMerged()
    if (this.lampGeo && this.lampGeo.length) {
      const lm = new THREE.Mesh(mergeGeometries(this.lampGeo, false), lampMat)
      this.scene.add(lm)
      this.lampGeo = []
    }
  }

  setWet(wetness) {
    this.asphaltMat.roughness = lerp(0.86, 0.28, wetness)
    this.asphaltMat.metalness = lerp(0.06, 0.5, wetness)
    this.asphaltMat.color.setHex(wetness > 0.4 ? 0x7c7d80 : 0x9a9a9a)
    sidewalkMat.roughness = lerp(0.92, 0.5, wetness)
  }

  findNearestRoad(x, z) {
    let best = null, bd = 1e9
    for (const r of this.roads) {
      const p = r.nearestPoint(x, z)
      if (!p) continue
      const d = Math.hypot(p.x - x, p.z - z)
      if (d < bd) { bd = d; best = r }
    }
    return best
  }

  spawnPoint(roadId, t, lane = 0, dir = 1) {
    const road = this.byId[roadId] || this.roads[0]
    const a = road.atT(t)
    const off = lane * dir
    const x = a.x + a.tz * off, z = a.z - a.tx * off
    const yaw = Math.atan2(dir * a.tx, dir * a.tz)
    return { x, y: road ? this.hf.heightAt(x, z) : 0, z, yaw, road, d: t * road.total }
  }
}
