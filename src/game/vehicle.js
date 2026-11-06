import * as THREE from 'three'
import { clamp, lerp, damp } from '../utils.js'
import { TUNE_ITEMS } from '../data/cars.js'

const G = 9.81

function torqueCurve(rpm, spec) {
  const limit = spec.limit
  const idle = spec.idle
  const p = [
    [idle, 0.42], [limit * 0.22, 0.72], [Math.min(spec.torqueRpm, limit * 0.55), 1.0],
    [limit * 0.78, 0.94], [limit * 0.92, 0.82], [limit, 0.58]
  ]
  if (rpm <= p[0][0]) return p[0][1]
  for (let i = 1; i < p.length; i++) {
    if (rpm <= p[i][0]) {
      const t = (rpm - p[i - 1][0]) / (p[i][0] - p[i - 1][0])
      return lerp(p[i - 1][1], p[i][1], clamp(t, 0, 1))
    }
  }
  return p[p.length - 1][1]
}

export class Vehicle {
  constructor(spec, tuning = {}) {
    this.spec = spec
    this.tuning = tuning
    this.position = new THREE.Vector3()
    this.yaw = 0
    this.u = 0
    this.v = 0
    this.yawRate = 0
    this.steer = 0
    this.steerAngle = 0
    this.rpm = 0
    this.gear = 1
    this.gearbox = 'auto'
    this.engineOn = false
    this.starter = 0
    this.shiftTimer = 0
    this.autoShift = 0
    this.reverseHold = 0
    this.clutch = 1
    this.handbrake = false
    this.throttle = 0
    this.brake = 0
    this.speed = 0
    this.wheelSpin = 0
    this.damage = 0
    this.onRoad = true
    this.surfaceGrip = 1
    this.pitch = 0
    this.roll = 0
    this.bodyY = 0
    this.accelG = 0
    this.latG = 0
    this.lateralSlip = 0
    this.drift = 0
    this.lightsOn = false
    this.indicator = 0
    this.impactFlash = 0
    this.lastImpact = 0
    this.airborne = false
    this.suspension = [0, 0, 0, 0]
    this.wheelGround = [0, 0, 0, 0]
    this.revLimiter = 0
    this.engineHealth = 1
    this.fuel = 1
    this.odo = 0
    this.absActive = false
    this.tcsActive = false
    this.lastCrashSpeed = 0
    this.shiftRequest = 0
    this.engineStall = false
    this.startCooldown = 0
    this.applyTuning(tuning)
  }

  applyTuning(tuning = {}) {
    this.tuning = tuning
    const T = TUNE_ITEMS
    const lv = (k) => clamp(tuning[k] || 0, 0, 3)
    this.powerMul = T.engine.power[lv('engine')] * T.turbo.power[lv('turbo')]
    this.gripMul = T.tires.grip[lv('tires')] * T.susp.grip[lv('susp')]
    this.brakeMul = T.brakes.brake[lv('brakes')]
    this.weightMul = T.weight.weight[lv('weight')]
    this.rideHeight = T.susp.height[lv('susp')]
    this.mass = this.spec.weight * this.weightMul
    this.invMass = 1 / this.mass
    this.L = this.spec.wheelbase
    this.a = this.L * (1 - this.spec.dist)
    this.b = this.L * this.spec.dist
    this.Iz = this.mass * (this.L * this.L) / 12 + this.mass * 0.45
    const topMs = this.spec.topSpeed / 3.6
    this.dragC = 2 * (this.spec.power * 735 * 0.85) / (1.225 * topMs * topMs * topMs)
    this.dragC = clamp(this.dragC, 0.35, 1.25)
  }

  get kmh() { return Math.abs(this.u) * 3.6 }
  get gearLabel() {
    if (!this.engineOn) return '—'
    if (this.gear === -1) return 'R'
    if (this.gear === 0) return 'N'
    return String(this.gear)
  }
  get gearRatio() {
    if (this.gear === -1) return this.spec.gears[0] * 0.9
    if (this.gear === 0) return 0
    return this.spec.gears[clamp(this.gear - 1, 0, this.spec.gears.length - 1)]
  }
  get driveSpeed() { return Math.abs(this.u) }

  reset(x, z, yaw, groundY = 0) {
    this.position.set(x, groundY, z)
    this.yaw = yaw
    this.u = 0; this.v = 0; this.yawRate = 0
    this.gear = 1; this.rpm = 0; this.engineOn = false; this.starter = 0
    this.damage = 0; this.shiftTimer = 0; this.wheelSpin = 0
    this.throttle = 0; this.brake = 0; this.steer = 0; this.steerAngle = 0
    this.pitch = 0; this.roll = 0; this.bodyY = 0
    this.drift = 0; this.lateralSlip = 0; this.absActive = false; this.tcsActive = false
    this.airborne = false
    this.engineOn = false
    this.lastCrashSpeed = 0
  }

  startEngine() {
    if (this.engineOn || this.starter > 0) return
    this.starter = 1.15
    this.startCooldown = 1.6
  }
  stopEngine() {
    this.engineOn = false
    this.starter = 0
  }
  toggleEngine() {
    if (this.engineOn) this.stopEngine()
    else this.startEngine()
  }

  shiftUp() {
    if (this.gearbox === 'auto') return
    if (this.shiftTimer > 0) return
    if (this.gear < this.spec.gears.length) { this.gear++; this.shiftTimer = 0.22 }
  }
  shiftDown() {
    if (this.gearbox === 'auto') return
    if (this.shiftTimer > 0) return
    if (this.gear > 0) { this.gear--; this.shiftTimer = 0.18 }
    else if (this.gear === 0 && Math.abs(this.u) < 1.2) { this.gear = -1; this.shiftTimer = 0.2 }
  }

  crash(impactSpeed, nx = 0, nz = 0, severity = 1) {
    if (impactSpeed < 1.2) return 0
    const dam = clamp(impactSpeed * 0.95 * severity, 0, 55)
    this.damage = clamp(this.damage + dam * (1 - this.damage / 145), 0, 100)
    this.lastCrashSpeed = impactSpeed
    this.impactFlash = Math.min(1, impactSpeed / 18)
    // velocity loss and bounce (normal in world xz)
    const fx = Math.sin(this.yaw), fz = Math.cos(this.yaw)
    const rx = Math.cos(this.yaw), rz = -Math.sin(this.yaw)
    let u = this.u, v = this.v
    const vwx = fx * u + rx * v, vwz = fz * u + rz * v
    const dot = vwx * nx + vwz * nz
    const bounce = clamp(impactSpeed * 0.22, 0, 3)
    const nvwx = vwx - (1.2) * dot * nx - bounce * nx
    const nvwz = vwz - (1.2) * dot * nz - bounce * nz
    this.u = nvwx * fx + nvwz * fz
    this.v = nvwx * rx + nvwz * rz
    this.yawRate *= 0.7
    if (this.damage > 82) this.engineOn = false
    if (this.damage > 45) this.engineHealth = 1 - (this.damage - 45) * 0.006
    return dam
  }

  repair() {
    this.damage = 0
    this.engineHealth = 1
    this.impactFlash = 0
  }

  step(dt, input, ground) {
    dt = Math.min(dt, 1 / 40)
    const spec = this.spec
    // ---------- inputs ----------
    const targetThrottle = clamp(input.throttle || 0, 0, 1)
    const targetBrake = clamp(input.brake || 0, 0, 1)
    this.throttle = damp(this.throttle, targetThrottle, 10, dt)
    this.brake = damp(this.brake, targetBrake, 14, dt)
    this.handbrake = !!input.handbrake
    const steerTarget = clamp(input.steer || 0, -1, 1)
    this.steer = damp(this.steer, steerTarget, 9, dt)
    const speed = Math.abs(this.u)
    const maxSteer = 0.58 * (1 - 0.55 * clamp(speed / 55, 0, 1))
    const steerRate = 3.2 + 6 * clamp(1 - speed / 25, 0, 1)
    this.steerAngle = damp(this.steerAngle, this.steer * maxSteer, steerRate, dt)

    // engine start
    if (this.starter > 0) {
      this.starter -= dt
      this.rpm = damp(this.rpm, 260 + Math.random() * 120, 10, dt)
      if (this.starter <= 0) {
        this.engineOn = true
        this.startCooldown = 0.6
        this.rpm = spec.idle + 320
      }
    }
    if (this.startCooldown > 0) this.startCooldown -= dt
    // convenience: throttle while stationary turns the key
    if (!this.engineOn && this.starter <= 0 && this.throttle > 0.35 && speed < 0.5 && this.startCooldown <= 0 && this.damage < 92) {
      this.startEngine()
    }

    // gearbox mode
    if (input.gearbox) this.gearbox = input.gearbox
    const clutchInput = input.clutch != null ? clamp(input.clutch, 0, 1) : 0
    this.manualClutch = input.manualClutch && clutchInput > 0.45
    this.clutch = damp(this.clutch, this.manualClutch ? 0 : 1, 8, dt)

    if (this.shiftTimer > 0) this.shiftTimer -= dt
    if (this.gearbox === 'auto' && this.engineOn) this.autoGear(dt, speed)
    if (input.shiftUp) this.shiftUp()
    if (input.shiftDown) this.shiftDown()

    // auto reverse handling
    if (this.gear > 0 && this.brake > 0.5 && speed < 0.45 && this.throttle < 0.1 && this.engineOn) {
      this.reverseHold += dt
      if (this.reverseHold > 0.55) { this.gear = -1; this.reverseHold = 0 }
    } else if (this.gear === -1 && (this.throttle > 0.2 || speed > 1.5)) {
      this.reverseHold += dt
      if (this.reverseHold > 0.3) { this.gear = 1; this.reverseHold = 0 }
    } else {
      this.reverseHold = Math.max(0, this.reverseHold - dt * 2)
    }

    // ---------- engine / rpm ----------
    const ratio = this.gearRatio
    let wheelRpm = 0
    if (this.gear !== 0) wheelRpm = speed / spec.wheelR * ratio * spec.final * 60 / (2 * Math.PI)
    let targetRpm
    if (!this.engineOn) targetRpm = 0
    else if (this.manualClutch || this.gear === 0 || Math.abs(this.u) < 0.7) {
      targetRpm = spec.idle + (spec.limit - spec.idle) * this.throttle * 0.55
    } else {
      targetRpm = wheelRpm + this.throttle * 220
      if (this.shiftTimer > 0) targetRpm -= 400
    }
    if (this.engineOn && input.rev && speed < 2) targetRpm = spec.limit * 0.65
    targetRpm = clamp(targetRpm, this.engineOn ? spec.idle : 0, spec.limit)
    this.rpm = damp(this.rpm, targetRpm, this.manualClutch ? 7 : 14, dt)
    this.revLimiter = targetRpm >= spec.limit - 40 ? 1 : 0
    if (this.rpm > spec.limit - 50) this.rpm = spec.limit - 50

    // damage & health
    this.engineHealth = clamp(1 - Math.max(0, this.damage - 30) * 0.006, 0.55, 1)
    const health = this.engineHealth
    const tc = torqueCurve(this.rpm, spec) * spec.torque * this.powerMul * health
    const gearEff = this.gear === -1 ? -1 : 1
    const reversePedal = this.gear === -1 && this.brake > 0.05 && this.throttle < 0.1
    const driveInput = reversePedal ? this.brake : this.throttle
    let drive = this.engineOn ? driveInput * tc * ratio * spec.final * 0.9 / spec.wheelR * gearEff * this.clutch : 0
    if (this.revLimiter) drive *= 0.15
    if (this.shiftTimer > 0) drive *= 0.15
    // TCS
    this.tcsActive = false
    if (input.tcs !== false && this.engineOn && Math.abs(drive) > 2000) {
      const driveWheelsShare = spec.drivetrain === 'AWD' ? 1 : (spec.drivetrain === 'RWD' ? (1 - spec.dist) : spec.dist)
      const maxTraction = 1.05 * this.mass * G * driveWheelsShare * this.surfaceGrip * this.gripMul
      if (Math.abs(drive) > maxTraction * 1.15) {
        drive = Math.sign(drive) * maxTraction * 1.15
        this.tcsActive = true
      }
    }

    // surface
    const surf = ground ? ground.surfaceAt(this.position.x, this.position.z) : { grip: 1, drag: 0, onRoad: true }
    this.onRoad = surf.onRoad
    this.surfaceGrip = surf.grip
    const mu = (surf.onRoad ? 1.0 : 0.72) * this.gripMul * (surf.wet ? 0.82 : 1) * (1 - this.damage * 0.0015)

    // ---------- longitudinal ----------
    const signU = Math.sign(this.u)
    let Fx = drive
    if (!this.engineOn) Fx = 0
    // engine braking
    if (this.engineOn && this.throttle < 0.08 && this.clutch > 0.5 && speed > 1) {
      Fx -= signU * torqueCurve(this.rpm, spec) * spec.torque * 0.16 * ratio * spec.final * 0.7 / spec.wheelR
    }
    // rolling resistance
    const rollRes = (surf.onRoad ? 0.014 : 0.045) * this.mass * G * Math.sign(this.u)
    Fx -= rollRes
    // aerodynamic drag
    const air = 0.5 * 1.225 * this.dragC * this.u * Math.abs(this.u)
    Fx -= air
    // maximum brake
    const brakeMax = this.mass * G * mu * this.brakeMul
    this.absActive = false
    let brakeForce = 0
    if (this.brake > 0.01 && !reversePedal) {
      let bf = this.brake * brakeMax * 0.92
      if (input.abs !== false && speed > 2.5 && this.brake > 0.8) {
        // rough ABS modulation when we ask for more than the tyres can take
        const cap = this.mass * G * mu * 0.96
        if (bf > cap) { bf = cap * (0.72 + 0.28 * Math.abs(Math.sin(performance.now() * 0.035))); this.absActive = true }
      }
      brakeForce = Math.min(bf, Math.abs(this.u) * this.mass / Math.max(dt, 0.001))
      Fx -= signU * brakeForce * 0.9
    }
    if (this.handbrake) {
      Fx -= signU * Math.min(this.mass * G * 0.55, Math.abs(this.u) * this.mass / Math.max(dt, 0.001)) * 0.9
    }
    // grade resistance
    if (ground) {
      const slope = ground.slopeAt ? ground.slopeAt(this.position.x, this.position.z, this.yaw) : 0
      Fx -= this.mass * G * Math.sin(slope) * 0.85
    }

    // ---------- lateral / yaw ----------
    const speedSafe = Math.max(Math.abs(this.u), 0.9)
    const alphaF = Math.atan2(this.v + this.yawRate * this.a, speedSafe) - this.steerAngle * Math.sign(this.u || 1)
    const alphaR = Math.atan2(this.v - this.yawRate * this.b, speedSafe)
    // load transfer (approx)
    const axPrev = this.accelG * G
    const h = 0.46
    const Nf = Math.max(120, this.mass * G * spec.dist - this.mass * axPrev * h / this.L)
    const Nr = Math.max(120, this.mass * G * (1 - spec.dist) + this.mass * axPrev * h / this.L)
    const Cf = 62000 * this.gripMul * (surf.onRoad ? 1 : 0.8)
    const Cr = 68000 * this.gripMul * (surf.onRoad ? 1 : 0.75) * (this.handbrake ? 0.42 : 1)
    const gripF = Nf * mu
    const gripR = Nr * mu * (this.handbrake ? 0.48 : 1)
    let Fyf = clamp(-Cf * alphaF, -gripF, gripF)
    let Fyr = clamp(-Cr * alphaR, -gripR, gripR)
    // friction circle: longitudinal use steals lateral capacity
    const rearLongUse = spec.drivetrain === 'RWD' ? Math.abs(drive) * 0.55 : 0
    if (rearLongUse > 0) Fyr *= clamp(1 - rearLongUse / (gripR * 1.3), 0.45, 1)
    if (this.brake > 0.6) { Fyf *= 0.9; Fyr *= 0.86 }
    // low speed blending to a stable kinematic model
    const blend = clamp(Math.abs(this.u) / 4.5, 0, 1)
    const yawKin = (this.u / this.L) * Math.tan(this.steerAngle)
    const yawDyn = (Fyf * Math.cos(this.steerAngle) * this.a - Fyr * this.b) / this.Iz
    let yawAcc = lerp(yawKin * 1.7, yawDyn, blend)
    const latAcc = (Fyf * Math.cos(this.steerAngle) + Fyr) * this.invMass - this.yawRate * this.u
    this.yawRate += yawAcc * dt
    this.yawRate = clamp(this.yawRate, -2.4, 2.4)
    this.yaw += this.yawRate * dt
    this.u += (Fx * this.invMass + this.yawRate * this.v) * dt
    this.v += (latAcc - this.yawRate * this.u) * dt
    // scrub drag from sliding sideways
    const scrub = Math.abs(this.v) * 0.22
    this.u -= Math.sign(this.u) * scrub * dt
    this.v *= Math.exp(-1.1 * dt)
    if (Math.abs(this.u) < 0.06 && this.throttle < 0.05) { this.u *= 0.9; this.v *= 0.9 }
    this.speed = Math.hypot(this.u, this.v)
    this.lateralSlip = Math.abs(this.v)
    this.drift = clamp(Math.abs(this.v) / 9 + Math.abs(this.yawRate) * 0.2, 0, 1)
    this.accelG = damp(this.accelG, (Fx * this.invMass) / G, 4, dt)
    this.latG = damp(this.latG, latAcc / G, 5, dt)
    this.odo += Math.abs(this.u) * dt

    // position
    const fx = Math.sin(this.yaw), fz = Math.cos(this.yaw)
    const rx = Math.cos(this.yaw), rz = -Math.sin(this.yaw)
    this.position.x += (fx * this.u + rx * this.v) * dt
    this.position.z += (fz * this.u + rz * this.v) * dt

    // ground / suspension
    let gy = 0
    if (ground) {
      const halfTrack = spec.track * 0.5
      const halfBase = this.L * 0.5
      const pts = [
        [this.position.x + fx * halfBase - rx * halfTrack, this.position.z + fz * halfBase - rz * halfTrack],
        [this.position.x + fx * halfBase + rx * halfTrack, this.position.z + fz * halfBase + rz * halfTrack],
        [this.position.x - fx * halfBase - rx * halfTrack, this.position.z - fz * halfBase - rz * halfTrack],
        [this.position.x - fx * halfBase + rx * halfTrack, this.position.z - fz * halfBase + rz * halfTrack]
      ]
      let minY = Infinity, maxY = -Infinity, sum = 0
      pts.forEach(([x, z], i) => {
        const y = ground.heightAt(x, z)
        this.wheelGround[i] = y
        minY = Math.min(minY, y); maxY = Math.max(maxY, y); sum += y
      })
      gy = sum / 4
      const pitchGround = -Math.atan2((this.wheelGround[0] + this.wheelGround[1]) / 2 - (this.wheelGround[2] + this.wheelGround[3]) / 2, this.L)
      const rollGround = Math.atan2((this.wheelGround[1] + this.wheelGround[3]) / 2 - (this.wheelGround[0] + this.wheelGround[2]) / 2, spec.track)
      const pitchDyn = clamp(-this.accelG * 0.055, -0.055, 0.055)
      const rollDyn = clamp(this.latG * 0.045, -0.055, 0.055)
      this.pitch = damp(this.pitch, pitchGround + pitchDyn, 7, dt)
      this.roll = damp(this.roll, rollGround + rollDyn, 7, dt)
      const bump = surf.onRoad ? 0 : Math.sin(this.odo * 1.7) * 0.012 * clamp(speed / 10, 0, 1)
      this.bodyY = damp(this.bodyY, gy + this.rideHeight + bump, 14, dt)
      const grounded = Math.abs(gy - this.position.y) < 0.6
      this.airborne = !grounded
    }
    this.position.y = damp(this.position.y, gy, 12, dt)
    if (this.position.y < -8) { this.position.y = 0.5 }

    // wheels
    this.wheelSpin += (this.u / spec.wheelR) * dt
    if (this.impactFlash > 0) this.impactFlash = Math.max(0, this.impactFlash - dt * 1.2)
    this.fuel = Math.max(0, this.fuel - dt * Math.abs(this.u) * 0.00004)
    if (this.fuel <= 0) this.engineOn = false
  }

  autoGear(dt, speed) {
    if (this.shiftTimer > 0) return
    this.autoShift += dt
    const upAt = (this.spec.sound && this.spec.sound.diesel) ? 0.82 : 0.9
    const downAt = 0.36
    if (this.rpm > this.spec.limit * upAt && this.gear < this.spec.gears.length && this.gear > 0) {
      this.gear++; this.shiftTimer = 0.28; this.autoShift = 0
    } else if (this.rpm < this.spec.limit * downAt && this.gear > 1 && this.autoShift > 0.5) {
      this.gear--; this.shiftTimer = 0.2; this.autoShift = 0
    }
  }
}
