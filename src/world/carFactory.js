import * as THREE from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { plateTexture, radialTexture, canvasTex, TAU, clamp } from '../utils.js'

const MAT = () => ({
  black: new THREE.MeshStandardMaterial({ color: 0x141516, roughness: 0.72, metalness: 0.18 }),
  blackMatte: new THREE.MeshStandardMaterial({ color: 0x0c0d0e, roughness: 0.94, metalness: 0.02 }),
  chrome: new THREE.MeshStandardMaterial({ color: 0xd6d9dc, roughness: 0.18, metalness: 1.0 }),
  glass: new THREE.MeshPhysicalMaterial({
    color: 0x101820, roughness: 0.06, metalness: 0.25, transparent: true, opacity: 0.72,
    envMapIntensity: 1.5, clearcoat: 1, clearcoatRoughness: 0.05, side: THREE.DoubleSide
  }),
  headlight: new THREE.MeshStandardMaterial({ color: 0xdfe7f2, emissive: 0xffe6bb, emissiveIntensity: 0.1, roughness: 0.12, metalness: 0.4 }),
  taillight: new THREE.MeshStandardMaterial({ color: 0x6e0b10, emissive: 0xff1018, emissiveIntensity: 0.35, roughness: 0.22 }),
  indicator: new THREE.MeshStandardMaterial({ color: 0x9a5c04, emissive: 0xff8a00, emissiveIntensity: 0.0, roughness: 0.3 }),
  reverse: new THREE.MeshStandardMaterial({ color: 0xd8dde2, emissive: 0xf4f6ff, emissiveIntensity: 0.0, roughness: 0.22 }),
  rubber: new THREE.MeshStandardMaterial({ color: 0x111112, roughness: 0.96, metalness: 0.0 }),
  rim: new THREE.MeshStandardMaterial({ color: 0xb9bdc2, roughness: 0.26, metalness: 0.95 }),
  rimDark: new THREE.MeshStandardMaterial({ color: 0x3a3c3f, roughness: 0.35, metalness: 0.85 }),
  disc: new THREE.MeshStandardMaterial({ color: 0x4a4b4c, roughness: 0.55, metalness: 0.7 }),
  caliper: new THREE.MeshStandardMaterial({ color: 0xb42020, roughness: 0.35, metalness: 0.3 }),
  interior: new THREE.MeshStandardMaterial({ color: 0x17181a, roughness: 0.85, metalness: 0.05 }),
  interiorLight: new THREE.MeshStandardMaterial({ color: 0x2c2d30, roughness: 0.88 }),
  mirror: new THREE.MeshStandardMaterial({ color: 0x0b0d10, roughness: 0.08, metalness: 0.9 }),
  under: new THREE.MeshStandardMaterial({ color: 0x0a0a0b, roughness: 1 }),
  plate: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 }),
  screen: new THREE.MeshBasicMaterial({ color: 0x1c2a3a })
})

const BRAND_LOGOS = {
  SEAT: { bg: '#8a1c25', fg: '#f2f2f2', letter: 'S' },
  CUPRA: { bg: '#1c1c1c', fg: '#c8a24a', letter: 'C' },
  Renault: { bg: '#222428', fg: '#f0d94a', letter: 'R' },
  Peugeot: { bg: '#1c1c1c', fg: '#dfe2e5', letter: 'P' },
  Citroën: { bg: '#1c1c1c', fg: '#e8e8e8', letter: 'C' },
  Opel: { bg: '#1b1b1b', fg: '#e5e6e8', letter: 'O' },
  Ford: { bg: '#1a3f8f', fg: '#f2f4f7', letter: 'F' },
  BMW: { bg: '#17191c', fg: '#e4e7ea', letter: 'B' }
}

function brandTexture(brand) {
  const b = BRAND_LOGOS[brand] || BRAND_LOGOS.SEAT
  return canvasTex(128, 128, (ctx) => {
    ctx.clearRect(0, 0, 128, 128)
    ctx.fillStyle = b.bg
    ctx.beginPath(); ctx.arc(64, 64, 60, 0, TAU); ctx.fill()
    ctx.strokeStyle = b.fg; ctx.lineWidth = 5
    ctx.beginPath(); ctx.arc(64, 64, 54, 0, TAU); ctx.stroke()
    ctx.fillStyle = b.fg
    ctx.font = '800 70px "Barlow Condensed", Arial'
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText(b.letter, 64, 70)
  })
}

function nameTexture(text) {
  return canvasTex(256, 64, (ctx) => {
    ctx.clearRect(0, 0, 256, 64)
    ctx.fillStyle = '#d9dde0'; ctx.font = '700 28px "Barlow Condensed", Arial'
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText(text.toUpperCase(), 128, 32)
  })
}

const BODY_GEOM = {
  hatch:   { belt: 0.645, points: [[-0.5, 0.29], [-0.505, 0.575], [-0.47, 0.625], [-0.36, 0.65], [0.02, 0.655], [0.18, 0.625], [0.33, 0.595], [0.45, 0.545], [0.5, 0.43], [0.5, 0.27], [0.46, 0.175], [-0.43, 0.175], [-0.49, 0.22]] },
  sedan:   { belt: 0.655, points: [[-0.5, 0.30], [-0.5, 0.60], [-0.44, 0.645], [-0.31, 0.66], [-0.18, 0.665], [0.10, 0.66], [0.23, 0.625], [0.35, 0.60], [0.46, 0.55], [0.5, 0.44], [0.5, 0.26], [0.45, 0.175], [-0.44, 0.175], [-0.49, 0.23]] },
  coupe:   { belt: 0.63, points: [[-0.5, 0.315], [-0.5, 0.55], [-0.44, 0.61], [-0.26, 0.64], [0.05, 0.645], [0.18, 0.615], [0.34, 0.575], [0.47, 0.51], [0.5, 0.42], [0.5, 0.255], [0.44, 0.165], [-0.44, 0.165], [-0.49, 0.235]] },
  wagon:   { belt: 0.655, points: [[-0.5, 0.30], [-0.5, 0.62], [-0.46, 0.655], [-0.30, 0.665], [0.10, 0.66], [0.23, 0.625], [0.35, 0.60], [0.46, 0.55], [0.5, 0.44], [0.5, 0.26], [0.45, 0.175], [-0.44, 0.175], [-0.49, 0.23]] },
  mpv:     { belt: 0.64, points: [[-0.5, 0.32], [-0.5, 0.59], [-0.46, 0.63], [-0.30, 0.645], [0.12, 0.645], [0.25, 0.62], [0.385, 0.585], [0.47, 0.52], [0.5, 0.40], [0.5, 0.24], [0.45, 0.17], [-0.44, 0.17], [-0.49, 0.235]] },
  suv:     { belt: 0.66, points: [[-0.5, 0.34], [-0.5, 0.625], [-0.46, 0.665], [-0.26, 0.68], [0.12, 0.685], [0.25, 0.665], [0.40, 0.62], [0.48, 0.555], [0.5, 0.44], [0.5, 0.27], [0.45, 0.195], [-0.44, 0.195], [-0.49, 0.25]] }
}

const CABIN = {
  hatch:  { baseRear: -0.35, baseFront: 0.20, roofRear: -0.27, roofFront: -0.075, roofY: 0.985 },
  sedan:  { baseRear: -0.23, baseFront: 0.19, roofRear: -0.165, roofFront: -0.025, roofY: 0.975 },
  coupe:  { baseRear: -0.31, baseFront: 0.16, roofRear: -0.225, roofFront: -0.05, roofY: 0.955 },
  wagon:  { baseRear: -0.42, baseFront: 0.18, roofRear: -0.405, roofFront: -0.045, roofY: 0.995 },
  mpv:    { baseRear: -0.43, baseFront: 0.22, roofRear: -0.405, roofFront: -0.025, roofY: 0.995 },
  suv:    { baseRear: -0.43, baseFront: 0.20, roofRear: -0.415, roofFront: -0.035, roofY: 1.0 }
}

function prep(g) {
  const geo = g.index ? g.toNonIndexed() : g
  for (const k of Object.keys(geo.attributes)) {
    if (!['position', 'normal', 'uv'].includes(k)) geo.deleteAttribute(k)
  }
  if (!geo.attributes.uv) {
    const n = geo.attributes.position.count
    geo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(n * 2), 2))
  }
  return geo
}

function transform(g, x, y, z, rx = 0, ry = 0, rz = 0) {
  const m = new THREE.Matrix4()
  const e = new THREE.Euler(rx, ry, rz, 'XYZ')
  m.compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(e), new THREE.Vector3(1, 1, 1))
  g.applyMatrix4(m)
  return g
}

function beamGeo(a, b, thick) {
  const dir = new THREE.Vector3().subVectors(b, a)
  const len = dir.length()
  const g = new THREE.BoxGeometry(len, thick, thick)
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 0, 0), dir.clone().normalize())
  const m = new THREE.Matrix4().compose(a.clone().addScaledVector(dir, 0.5), q, new THREE.Vector3(1, 1, 1))
  g.applyMatrix4(m)
  return g
}

function cabinGlassGeometry(spec, cab) {
  const L = spec.length, W = spec.width, H = spec.height
  const yB = H * (BODY_GEOM[spec.body].belt) - 0.015
  const yT = H * cab.roofY
  const xB = W * 0.442, xT = W * 0.352
  const rearB = L * cab.baseRear, frontB = L * cab.baseFront
  const rearT = L * cab.roofRear, frontT = L * cab.roofFront
  const quads = [
    // left side
    [[-xB, yB, rearB], [-xB, yB, frontB], [-xT, yT, frontT], [-xT, yT, rearT]],
    // right side
    [[xB, yB, frontB], [xB, yB, rearB], [xT, yT, rearT], [xT, yT, frontT]],
    // windshield
    [[-xB, yB, frontB], [xB, yB, frontB], [xT, yT, frontT], [-xT, yT, frontT]],
    // rear glass
    [[xB, yB, rearB], [-xB, yB, rearB], [-xT, yT, rearT], [xT, yT, rearT]]
  ]
  const pos = []
  for (const q of quads) {
    pos.push(...q[0], ...q[1], ...q[2], ...q[0], ...q[2], ...q[3])
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  const uv = []
  for (let i = 0; i < pos.length / 3; i++) uv.push((i % 2), (i % 3) / 2)
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2))
  g.computeVertexNormals()
  return g
}

function createWheel(spec, mats, style, simple) {
  const r = spec.wheelR
  const width = simple ? 0.22 : 0.235
  const pivot = new THREE.Group()
  const spin = new THREE.Group()
  pivot.add(spin)
  const tire = new THREE.Mesh(new THREE.CylinderGeometry(r, r, width, simple ? 14 : 22), mats.rubber)
  tire.rotation.z = Math.PI / 2
  tire.castShadow = false
  spin.add(tire)
  const rimRadius = r * (0.63 + (style % 3) * 0.02)
  const rim = new THREE.Mesh(new THREE.CylinderGeometry(rimRadius, rimRadius, width + 0.008, 22), mats.rim)
  rim.rotation.z = Math.PI / 2
  spin.add(rim)
  const spokes = []
  const count = [5, 10, 8, 5, 7][style % 5]
  for (let i = 0; i < count; i++) {
    const a = i / count * TAU
    const geo = new THREE.BoxGeometry(width + 0.02, 0.036, rimRadius * 0.88)
    transform(geo, 0, Math.cos(a) * rimRadius * 0.46, Math.sin(a) * rimRadius * 0.46, a, 0, 0)
    spokes.push(geo)
  }
  const mergedSpokes = mergeGeometries(spokes.map(prep))
  if (mergedSpokes) {
    const sm = new THREE.Mesh(mergedSpokes, style % 2 ? mats.rim : mats.rimDark)
    spin.add(sm)
  }
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(rimRadius * 0.25, rimRadius * 0.25, width + 0.035, 12), mats.chrome)
  hub.rotation.z = Math.PI / 2
  spin.add(hub)
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(rimRadius * 0.72, rimRadius * 0.72, 0.03, 18), mats.disc)
  disc.rotation.z = Math.PI / 2
  disc.position.x = 0.02
  pivot.add(disc)
  const cal = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.11, 0.16), mats.caliper)
  cal.position.set(0.03, 0.03, -rimRadius * 0.66)
  pivot.add(cal)
  return { pivot, spin, radius: r, width }
}

export function buildCar(spec, options = {}) {
  const {
    paint = spec.defaultColor, wheelStyle = spec.wheelStyle, rideHeight = 0, spoiler = null,
    tint = 0, simple = false, lights3d = false, plate = null, quality = 'high'
  } = options
  const mats = MAT()
  const bodyMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(paint), metalness: 0.55, roughness: 0.26,
    clearcoat: 1.0, clearcoatRoughness: 0.055, envMapIntensity: 1.15
  })
  mats.paint = bodyMat
  if (tint > 0) mats.glass.opacity = clamp(0.78 + tint * 0.18, 0.7, 0.97)
  const group = new THREE.Group()
  const bodyGroup = new THREE.Group()
  group.add(bodyGroup)

  const L = spec.length, W = spec.width, H = spec.height
  const wheelbase = spec.wheelbase
  const profile = BODY_GEOM[spec.body] || BODY_GEOM.hatch
  const cab = CABIN[spec.body] || CABIN.hatch
  const groundClear = 0.13 + (spec.body === 'suv' ? 0.09 : 0)
  const beltY = H * profile.belt
  const frontAxle = wheelbase * 0.5
  const rearAxle = -wheelbase * 0.5
  const axleX = spec.track * 0.5 - 0.035

  const parts = {}
  const add = (key, geo) => {
    if (!parts[key]) parts[key] = []
    parts[key].push(prep(geo))
  }
  const addBox = (key, w, h, d, x, y, z, rx = 0, ry = 0, rz = 0) => {
    add(key, transform(new THREE.BoxGeometry(w, h, d), x, y, z, rx, ry, rz))
  }

  // ---- main body: side profile extruded across the width ----
  const shape = new THREE.Shape()
  const pts = profile.points
  // reduce absolute Y values by factoring the height in
  // profile points store Y as a fraction of the car height
  const scaled = pts.map(([zf, yf]) => [zf * L, yf * H])
  shape.moveTo(scaled[0][0], scaled[0][1])
  for (let i = 1; i < scaled.length; i++) shape.lineTo(scaled[i][0], scaled[i][1])
  shape.closePath()
  const depth = W - 0.09
  const extrude = new THREE.ExtrudeGeometry(shape, {
    depth, bevelEnabled: true, bevelThickness: 0.035, bevelSize: 0.035, bevelSegments: 2, steps: 1
  })
  extrude.rotateY(-Math.PI / 2)
  extrude.translate(depth / 2 + 0.02, 0, 0)
  add('paint', extrude)

  // rocker / lower body shadow strip
  addBox('under', W * 0.94, 0.14, L * 0.66, 0, 0.17, 0)

  // ---- cabin greenhouse ----
  add('glass', cabinGlassGeometry(spec, cab))
  const yRoof = H * cab.roofY
  const roofW = W * 0.70
  const roofRear = L * cab.roofRear, roofFront = L * cab.roofFront
  const roof = new RoundedBoxGeometry(roofW, 0.055, Math.abs(roofFront - roofRear) + 0.06, 2, 0.02)
  transform(roof, 0, yRoof + 0.012, (roofFront + roofRear) / 2)
  add('paint', roof)
  // pillars
  const yB = beltY - 0.02
  const xB = W * 0.435, xT = W * 0.345
  const bRear = L * cab.baseRear, bFront = L * cab.baseFront
  const tRear = L * cab.roofRear, tFront = L * cab.roofFront
  for (const sx of [-1, 1]) {
    add('paint', beamGeo(new THREE.Vector3(sx * xB, yB, bFront), new THREE.Vector3(sx * xT, yRoof, tFront), 0.075))
    add('paint', beamGeo(new THREE.Vector3(sx * xB, yB, bRear), new THREE.Vector3(sx * xT, yRoof, tRear), 0.07))
    add('black', beamGeo(new THREE.Vector3(sx * (xB + 0.002), yB - 0.005, (bRear + bFront) * 0.42), new THREE.Vector3(sx * (xT + 0.002), yRoof - 0.03, (tRear + tFront) * 0.44), 0.035))
    // window trim
    add('chrome', beamGeo(new THREE.Vector3(sx * (xB + 0.003), yB, bRear + 0.04), new THREE.Vector3(sx * (xB + 0.003), yB, bFront - 0.04), 0.018))
  }
  add('chrome', beamGeo(new THREE.Vector3(-xB, yB, bRear), new THREE.Vector3(-xB, yB, bFront), 0.018))
  add('chrome', beamGeo(new THREE.Vector3(xB, yB, bRear), new THREE.Vector3(xB, yB, bFront), 0.018))

  // roof rails for tall cars
  if (['wagon', 'suv', 'mpv'].includes(spec.body)) {
    for (const sx of [-1, 1]) {
      addBox('black', 0.045, 0.035, Math.abs(roofFront - roofRear) * 0.88, sx * roofW * 0.37, yRoof + 0.07, (roofFront + roofRear) / 2)
      addBox('black', 0.045, 0.06, 0.06, sx * roofW * 0.37, yRoof + 0.04, roofRear + 0.2)
      addBox('black', 0.045, 0.06, 0.06, sx * roofW * 0.37, yRoof + 0.04, roofFront - 0.2)
    }
  }

  // ---- front fascia ----
  const frontZ = L * 0.5 - 0.02
  const headY = H * 0.505
  const headX = W * 0.315
  for (const sx of [-1, 1]) {
    if (spec.lights === 'round') {
      add('black', transform(new THREE.CylinderGeometry(0.115, 0.125, 0.06, 18), sx * headX, headY, frontZ + 0.015, Math.PI / 2, 0, 0))
      add('headlight', transform(new THREE.CylinderGeometry(0.09, 0.095, 0.055, 18), sx * headX, headY, frontZ + 0.03, Math.PI / 2, 0, 0))
      add('headlight', transform(new THREE.CylinderGeometry(0.105, 0.115, 0.018, 18), sx * headX, headY + 0.005, frontZ + 0.06, Math.PI / 2, 0, 0.35 * sx))
    } else if (spec.lights === 'led') {
      addBox('headlight', W * 0.25, 0.085, 0.05, sx * headX, headY, frontZ + 0.02, 0, 0, sx * 0.09)
      addBox('black', W * 0.28, 0.13, 0.05, sx * headX, headY, frontZ)
      addBox('headlight', W * 0.20, 0.028, 0.02, sx * headX, headY - 0.045, frontZ + 0.05)
    } else {
      addBox('black', W * 0.28, 0.19, 0.06, sx * headX, headY, frontZ)
      addBox('headlight', W * 0.235, 0.13, 0.05, sx * headX, headY, frontZ + 0.025)
      addBox('headlight', W * 0.10, 0.04, 0.02, sx * (headX - 0.06), headY + 0.055, frontZ + 0.06)
    }
    // indicators at bumper corners
    addBox('indicator', 0.10, 0.045, 0.03, sx * (W * 0.41), H * 0.33, frontZ + 0.02)
  }
  // grille with brand details
  const grilleY = H * 0.40
  const grille = new RoundedBoxGeometry(W * 0.36, H * 0.105, 0.05, 2, 0.012)
  transform(grille, 0, grilleY, frontZ + 0.015)
  add('blackMatte', grille)
  if (spec.grille === 'bmw') {
    for (const sx of [-1, 1]) {
      addBox('chrome', W * 0.135, H * 0.13, 0.06, sx * W * 0.085, grilleY, frontZ + 0.025)
      addBox('blackMatte', W * 0.105, H * 0.105, 0.065, sx * W * 0.085, grilleY, frontZ + 0.03)
    }
  } else {
    for (let i = 0; i < 4; i++) {
      addBox('chrome', W * 0.335, 0.014, 0.02, 0, grilleY - H * 0.038 + i * H * 0.028, frontZ + 0.05)
    }
  }
  // headlight trim / bumper
  const frontBumper = new RoundedBoxGeometry(W * 0.955, H * 0.19, 0.26, 3, 0.06)
  transform(frontBumper, 0, H * 0.235, L * 0.5 - 0.12)
  const frontBumperMesh = new THREE.Mesh(frontBumper, mats.paint)
  frontBumperMesh.castShadow = true; frontBumperMesh.receiveShadow = true
  bodyGroup.add(frontBumperMesh)
  addBox('blackMatte', W * 0.58, H * 0.10, 0.08, 0, H * 0.17, frontZ + 0.06)
  addBox('blackMatte', W * 0.88, 0.07, 0.13, 0, H * 0.105, L * 0.5 - 0.09)
  // splitter
  addBox('blackMatte', W * 0.80, 0.025, 0.2, 0, 0.10, L * 0.5 - 0.1)
  // fog lights
  for (const sx of [-1, 1]) addBox('headlight', 0.09, 0.05, 0.03, sx * W * 0.33, H * 0.20, frontZ + 0.08)

  // ---- rear ----
  const rearZ = -L * 0.5 + 0.02
  for (const sx of [-1, 1]) {
    addBox('taillight', W * 0.25, H * 0.115, 0.055, sx * W * 0.31, H * 0.50, rearZ - 0.015, 0, 0, sx * -0.06)
    addBox('reverse', W * 0.075, 0.035, 0.02, sx * W * 0.29, H * 0.455, rearZ - 0.05)
    addBox('indicator', 0.055, 0.045, 0.02, sx * W * 0.405, H * 0.53, rearZ - 0.04)
    addBox('blackMatte', 0.11, 0.075, 0.14, sx * W * 0.26, 0.105, rearZ - 0.08)
    addBox('chrome', 0.075, 0.075, 0.16, sx * W * 0.26, 0.10, rearZ - 0.09)
  }
  const rearBumper = new RoundedBoxGeometry(W * 0.955, H * 0.20, 0.24, 3, 0.06)
  transform(rearBumper, 0, H * 0.24, -L * 0.5 + 0.11)
  const rearBumperMesh = new THREE.Mesh(rearBumper, mats.paint)
  rearBumperMesh.castShadow = true; rearBumperMesh.receiveShadow = true
  bodyGroup.add(rearBumperMesh)
  addBox('blackMatte', W * 0.60, 0.09, 0.05, 0, H * 0.17, rearZ - 0.07)
  // reflectors
  for (const sx of [-1, 1]) addBox('taillight', 0.11, 0.03, 0.02, sx * W * 0.38, H * 0.22, rearZ - 0.025)
  // wiper
  addBox('blackMatte', 0.42, 0.012, 0.02, -0.05, beltY + 0.01, L * 0.17, 0.22, 0, 0.12)

  // ---- mirrors, handles, side details ----
  for (const sx of [-1, 1]) {
    addBox('paint', 0.13, 0.085, 0.17, sx * (W * 0.5 + 0.035), beltY + 0.035, L * 0.075, 0, 0, 0)
    addBox('black', 0.05, 0.04, 0.07, sx * (W * 0.475), beltY - 0.01, L * 0.075)
    addBox('chrome', 0.025, 0.028, 0.11, sx * (W * 0.474), beltY - 0.02, L * 0.13)
    addBox('chrome', 0.025, 0.028, 0.11, sx * (W * 0.474), beltY - 0.02, -L * 0.10)
    // door seams
    addBox('blackMatte', 0.012, beltY * 0.72, 0.018, sx * (W * 0.478), H * 0.36, L * 0.0)
    addBox('blackMatte', 0.012, 0.15, 0.018, sx * (W * 0.478), H * 0.47, -L * 0.235)
    // side skirts
    addBox('blackMatte', 0.07, 0.10, L * 0.52, sx * (W * 0.48), 0.16, 0)
    // wheel arch trim
    for (const az of [frontAxle, rearAxle]) {
      const torus = new THREE.TorusGeometry(spec.wheelR + 0.075, 0.035, 5, 14, Math.PI)
      torus.rotateY(Math.PI / 2); torus.rotateX(0)
      transform(torus, sx * (W * 0.475), spec.wheelR + 0.01, az)
      add('blackMatte', torus)
    }
  }
  // exhaust
  for (const sx of spec.body === 'suv' ? [-1, 1] : [1]) {
    const ex = new THREE.CylinderGeometry(0.038, 0.044, 0.16, 10)
    ex.rotateX(Math.PI / 2)
    transform(ex, sx * W * 0.24, 0.10, rearZ - 0.05)
    add('chrome', ex)
    const inner = new THREE.CylinderGeometry(0.028, 0.028, 0.04, 8)
    inner.rotateX(Math.PI / 2)
    transform(inner, sx * W * 0.24, 0.10, rearZ - 0.13)
    add('blackMatte', inner)
  }
  // antenna
  addBox('blackMatte', 0.018, 0.16, 0.018, 0, yRoof + 0.09, L * cab.roofRear + 0.2, 0.15, 0, 0)

  // ---- spoiler ----
  const hasSpoiler = spoiler != null ? spoiler : spec.spoiler > 0.38
  if (hasSpoiler) {
    const size = spoiler != null ? spoiler : spec.spoiler
    const wingY = yRoof - H * 0.02
    const wingZ = rearZ - 0.05
    addBox('blackMatte', 0.06, 0.16, 0.12, -W * 0.28, wingY - 0.02, wingZ)
    addBox('blackMatte', 0.06, 0.16, 0.12, W * 0.28, wingY - 0.02, wingZ)
    addBox(spec.body === 'suv' ? 'blackMatte' : 'paint', W * 0.72, 0.035, 0.28, 0, wingY + 0.08, wingZ)
  }

  // ---- license plates & badges ----
  const plateMat = new THREE.MeshStandardMaterial({ map: plateTexture(plate || `BI ${1000 + (spec.id.length * 137) % 8999} ${String.fromCharCode(65 + spec.id.length % 26)}${String.fromCharCode(65 + (spec.id.length * 3) % 26)}`), roughness: 0.45 })
  const frontPlate = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.115), plateMat)
  frontPlate.position.set(0, H * 0.22, L * 0.5 + 0.028)
  bodyGroup.add(frontPlate)
  const rearPlate = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.115), plateMat)
  rearPlate.position.set(0, H * 0.245, -L * 0.5 - 0.028)
  rearPlate.rotation.y = Math.PI
  bodyGroup.add(rearPlate)
  const badgeMat = new THREE.MeshBasicMaterial({ map: brandTexture(spec.brand), transparent: true })
  const frontBadge = new THREE.Mesh(new THREE.PlaneGeometry(0.125, 0.125), badgeMat)
  frontBadge.position.set(0, H * 0.43, L * 0.5 + 0.045)
  bodyGroup.add(frontBadge)
  const rearBadge = new THREE.Mesh(new THREE.PlaneGeometry(0.11, 0.11), badgeMat)
  rearBadge.position.set(0, H * 0.42, -L * 0.5 - 0.008)
  rearBadge.rotation.y = Math.PI
  bodyGroup.add(rearBadge)
  const nameMat = new THREE.MeshBasicMaterial({ map: nameTexture(spec.model), transparent: true, opacity: 0.85 })
  const rearName = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.10), nameMat)
  rearName.position.set(W * 0.29, H * 0.40, -L * 0.5 - 0.006)
  rearName.rotation.y = Math.PI
  bodyGroup.add(rearName)

  // ---- interior ----
  if (!simple) {
    addBox('interior', W * 0.82, 0.16, L * 0.54, 0, beltY - 0.06, -L * 0.02)
    // seats
    for (const sx of [-1, 1]) {
      const base = new RoundedBoxGeometry(0.46, 0.13, 0.52, 2, 0.04)
      transform(base, sx * W * 0.20, beltY + 0.03, -L * 0.10)
      add('interiorLight', base)
      const back = new RoundedBoxGeometry(0.46, 0.52, 0.14, 2, 0.05)
      transform(back, sx * W * 0.20, beltY + 0.28, -L * 0.205, -0.18)
      add('interiorLight', back)
      const head = new RoundedBoxGeometry(0.26, 0.15, 0.13, 2, 0.04)
      transform(head, sx * W * 0.20, beltY + 0.58, -L * 0.23, -0.18)
      add('interior', head)
    }
    // dashboard
    const dash = new RoundedBoxGeometry(W * 0.82, 0.16, 0.30, 3, 0.04)
    transform(dash, 0, beltY + 0.04, L * 0.14)
    add('interior', dash)
    addBox('chrome', W * 0.40, 0.012, 0.02, -W * 0.13, beltY + 0.125, L * 0.19)
    // centre console / screen
    addBox('interior', W * 0.20, 0.25, 0.32, W * 0.16, beltY - 0.01, L * 0.12)
    addBox('screen', W * 0.14, 0.075, 0.012, W * 0.16, beltY + 0.15, L * 0.092)
    // rear view mirror
    addBox('black', 0.23, 0.045, 0.035, 0, yRoof - 0.06, L * 0.17)
    addBox('mirror', 0.20, 0.07, 0.015, 0, yRoof - 0.065, L * 0.155)
  }

  // ---- merge static parts ----
  const partMeshes = {}
  for (const [key, geos] of Object.entries(parts)) {
    const merged = mergeGeometries(geos, false)
    if (!merged) continue
    const mat = mats[key] || mats.black
    const mesh = new THREE.Mesh(merged, mat)
    mesh.castShadow = quality !== 'low'
    mesh.receiveShadow = quality !== 'low'
    bodyGroup.add(mesh)
    partMeshes[key] = mesh
  }

  // ---- wheels ----
  const wheels = []
  const wheelPivots = []
  for (const [sx, az, isFront] of [[-1, frontAxle, true], [1, frontAxle, true], [-1, rearAxle, false], [1, rearAxle, false]]) {
    const w = createWheel(spec, mats, wheelStyle, simple)
    w.pivot.position.set(sx * axleX, spec.wheelR, az)
    group.add(w.pivot)
    wheels.push({ ...w, isFront, side: sx })
    wheelPivots.push(w.pivot)
  }

  // ---- lights ----
  const headGlowMat = () => new THREE.SpriteMaterial({
    map: radialTexture('rgba(255,255,255,1)', 'rgba(255,255,255,0)'),
    color: 0xffe6bb, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0
  })
  const headGlows = []
  for (const sx of [-1, 1]) {
    const s = new THREE.Sprite(headGlowMat())
    s.position.set(sx * headX, headY, L * 0.5 + 0.1)
    s.scale.setScalar(1.4)
    bodyGroup.add(s)
    headGlows.push(s)
  }
  const tailGlows = []
  for (const sx of [-1, 1]) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({
      map: radialTexture('rgba(255,80,70,1)', 'rgba(255,0,0,0)'),
      color: 0xff2222, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0
    }))
    s.position.set(sx * W * 0.31, H * 0.50, -L * 0.5 - 0.1)
    s.scale.setScalar(0.9)
    bodyGroup.add(s)
    tailGlows.push(s)
  }

  let spotL = null, spotR = null
  if (lights3d) {
    const target = new THREE.Object3D()
    target.position.set(0, 0.35, 32)
    bodyGroup.add(target)
    const mk = (x) => {
      const sp = new THREE.SpotLight(0xffe9c8, 0, 80, 0.48, 0.55, 1.35)
      sp.position.set(x, headY, L * 0.5 + 0.06)
      sp.target = target
      sp.visible = false
      sp.castShadow = false
      bodyGroup.add(sp)
      return sp
    }
    spotL = mk(-headX); spotR = mk(headX)
  }

  // ---- blob shadow ----
  const shadowTex = radialTexture('rgba(0,0,0,0.65)', 'rgba(0,0,0,0)', 0.5)
  const shadowMat = new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, opacity: 0.62, depthWrite: false, color: 0x000000 })
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(W * 1.45, L * 1.12), shadowMat)
  shadow.rotation.x = -Math.PI / 2
  shadow.position.y = 0.022
  group.add(shadow)
  group.userData.shadow = shadow

  // ---- cockpit / dashboard ----
  let cockpit = null
  if (!simple) {
    const dashCanvas = document.createElement('canvas')
    dashCanvas.width = 512; dashCanvas.height = 256
    const dashTex = new THREE.CanvasTexture(dashCanvas)
    dashTex.colorSpace = THREE.SRGBColorSpace
    const cluster = new THREE.Mesh(new THREE.PlaneGeometry(0.46, 0.23), new THREE.MeshBasicMaterial({ map: dashTex, transparent: true }))
    const clusterX = -W * 0.20
    cluster.position.set(clusterX, beltY + 0.095, L * 0.205)
    cluster.rotation.x = -0.18
    cluster.rotation.y = Math.PI
    bodyGroup.add(cluster)
    const wheelGroup = new THREE.Group()
    const wheelPos = new THREE.Vector3(clusterX, beltY - 0.03, L * 0.10)
    wheelGroup.position.copy(wheelPos)
    wheelGroup.rotation.x = -0.32
    const spinGroup = new THREE.Group()
    wheelGroup.add(spinGroup)
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.018, 8, 26), new THREE.MeshStandardMaterial({ color: 0x161719, roughness: 0.6 }))
    spinGroup.add(rim)
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.03, 16), new THREE.MeshStandardMaterial({ color: 0x222326, roughness: 0.45, metalness: 0.4 }))
    hub.rotation.x = Math.PI / 2
    spinGroup.add(hub)
    const spokeMat = new THREE.MeshStandardMaterial({ color: 0x24262a, roughness: 0.5, metalness: 0.35 })
    for (let i = 0; i < 3; i++) {
      const sp = new THREE.Mesh(new THREE.BoxGeometry(0.026, 0.30, 0.02), spokeMat)
      sp.rotation.z = i * Math.PI * 2 / 3 + Math.PI / 2
      sp.position.z = 0.002
      spinGroup.add(sp)
    }
    bodyGroup.add(wheelGroup)
    cockpit = {
      position: new THREE.Vector3(-W * 0.19, beltY + 0.23, -L * 0.015),
      lookAt: new THREE.Vector3(-W * 0.155, beltY + 0.12, L * 0.35),
      dashCanvas, dashTex, spinGroup, wheelGroup
    }
  }

  // adjust ride height
  bodyGroup.position.y = rideHeight
  for (const w of wheelPivots) w.position.y = spec.wheelR + rideHeight * 0.35

  const state = {
    headlights: false, brake: false, reverse: false, indicator: 0, blink: false
  }

  function updateLights(next = {}) {
    Object.assign(state, next)
    const on = state.headlights
    mats.headlight.emissiveIntensity = on ? 2.4 : 0.06
    mats.indicator.emissiveIntensity = state.indicator !== 0 && state.blink ? 2.2 : 0.0
    mats.reverse.emissiveIntensity = state.reverse ? 1.9 : 0.0
    mats.taillight.emissiveIntensity = state.brake ? 2.6 : (on ? 0.9 : 0.35)
    for (const g of headGlows) g.material.opacity = on ? 0.55 : 0
    for (const g of tailGlows) g.material.opacity = state.brake ? 0.6 : (on ? 0.22 : 0)
    if (spotL) { spotL.visible = on; spotR.visible = on; spotL.intensity = on ? 90 : 0; spotR.intensity = on ? 90 : 0 }
  }

  function updateDashboard(speed, rpm, gear, throttle) {
    if (!cockpit) return
    const ctx = cockpit.dashCanvas.getContext('2d')
    const Wc = 512, Hc = 256
    ctx.clearRect(0, 0, Wc, Hc)
    // panel
    const g = ctx.createLinearGradient(0, 0, 0, Hc)
    g.addColorStop(0, 'rgba(16,18,22,0.92)'); g.addColorStop(1, 'rgba(5,6,8,0.96)')
    ctx.fillStyle = g; ctx.fillRect(0, 0, Wc, Hc)
    ctx.strokeStyle = 'rgba(160,170,180,0.25)'; ctx.lineWidth = 3
    ctx.strokeRect(3, 3, Wc - 6, Hc - 6)

    const drawGauge = (cx, cy, r, value, max, label, redline = null, step = 1) => {
      ctx.save()
      ctx.translate(cx, cy)
      ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU)
      ctx.fillStyle = 'rgba(8,9,11,0.95)'; ctx.fill()
      ctx.strokeStyle = 'rgba(180,190,200,0.45)'; ctx.lineWidth = 2; ctx.stroke()
      const a0 = Math.PI * 0.78, a1 = Math.PI * 2.22
      for (let i = 0; i <= 40; i++) {
        const t = i / 40
        const a = a0 + (a1 - a0) * t
        const major = i % 5 === 0
        const isRed = redline != null && t > redline
        ctx.strokeStyle = isRed ? '#ff3030' : (major ? '#dfe4e8' : 'rgba(200,210,220,0.55)')
        ctx.lineWidth = major ? 3 : 1.5
        const r0 = r * 0.80, r1 = r * (major ? 0.92 : 0.87)
        ctx.beginPath()
        ctx.moveTo(Math.cos(a) * r0, Math.sin(a) * r0)
        ctx.lineTo(Math.cos(a) * r1, Math.sin(a) * r1)
        ctx.stroke()
        if (major) {
          ctx.fillStyle = isRed ? '#ff5a5a' : '#c9d1d8'
          ctx.font = 'bold 17px "Barlow Condensed", Arial'
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
          ctx.fillText(String(Math.round(max * t / step) * step), Math.cos(a) * r * 0.66, Math.sin(a) * r * 0.66)
        }
      }
      const a = a0 + (a1 - a0) * clamp(value / max, 0, 1)
      ctx.strokeStyle = '#ff6a1a'; ctx.lineWidth = 4
      ctx.beginPath(); ctx.moveTo(Math.cos(a) * r * 0.18, Math.sin(a) * r * 0.18); ctx.lineTo(Math.cos(a) * r * 0.78, Math.sin(a) * r * 0.78); ctx.stroke()
      ctx.fillStyle = '#ff6a1a'; ctx.beginPath(); ctx.arc(0, 0, 6, 0, TAU); ctx.fill()
      ctx.fillStyle = '#98a3ac'; ctx.font = '600 15px Inter, Arial'; ctx.textAlign = 'center'
      ctx.fillText(label, 0, r * 0.54)
      ctx.restore()
    }
    drawGauge(128, 128, 96, speed, 260, 'km/h')
    drawGauge(384, 128, 96, rpm, 8000, 'rpm', 0.78, 500)
    // central digital
    ctx.fillStyle = 'rgba(15,17,20,0.9)'
    ctx.fillRect(212, 68, 88, 125)
    ctx.strokeStyle = 'rgba(255,120,30,0.5)'; ctx.lineWidth = 2; ctx.strokeRect(212, 68, 88, 125)
    ctx.fillStyle = '#ffb066'; ctx.font = '800 72px "Barlow Condensed", Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText(gear, 256, 125)
    ctx.font = '600 14px Inter, Arial'; ctx.fillStyle = '#98a3ac'
    ctx.fillText('MARCHA', 256, 168)
    // fuel / temp
    ctx.fillStyle = '#8a949c'; ctx.font = '600 20px "Barlow Condensed", Arial'; ctx.textAlign = 'left'
    ctx.fillText('B S D', 18, 236)
    const blinkOn = Math.floor(performance.now() / 320) % 2 === 0
    if (state.indicator < 0 && blinkOn) { ctx.fillStyle = '#ffb300'; ctx.fillText('◀', 18, 60) }
    if (state.indicator > 0 && blinkOn) { ctx.fillStyle = '#ffb300'; ctx.textAlign = 'right'; ctx.fillText('▶', 494, 60) }
    if (state.headlights) { ctx.fillStyle = '#6fd3ff'; ctx.textAlign = 'left'; ctx.font = '600 18px Inter'; ctx.fillText('LUCES', 18, 32) }
    cockpit.dashTex.needsUpdate = true
    cockpit.spinGroup.rotation.z = -state.steerAngle * 2.4

    // hide via camera? cluster material unmounted when outside - always rendered, cheap
  }

  const visual = {
    spec, group, bodyGroup, wheels, mats, cockpit, panels: { frontBumperMesh, rearBumperMesh },
    updateLights, updateDashboard,
    headGlows, tailGlows, spotL, spotR,
    steerAngle: 0,
    setSteer(a) { state.steerAngle = a; if (cockpit) cockpit.spinGroup.rotation.z = -a * 2.4; for (const w of wheels) if (w.isFront) w.pivot.rotation.y = a },
    setPaint(color) { bodyMat.color.set(color) },
    setWheelSpin(angle) { for (const w of wheels) w.spin.rotation.x = angle },
    dispose() {
      group.traverse(o => {
        if (o.isMesh) { o.geometry?.dispose?.() }
        if (o.isSprite) { o.material?.map?.dispose?.(); o.material?.dispose?.() }
      })
      for (const m of Object.values(mats)) m.dispose?.()
    }
  }
  group.userData.carVisual = visual
  group.userData.bodyGroup = bodyGroup
  return visual
}
