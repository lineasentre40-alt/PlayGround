// Stylised Bizkaia road network, inspired by the real geography.
// Coordinates are in metres: +x east, +z south. Sea level is y = -2.

export const WORLD_SIZE = 3400
export const BOUNDS = 1520

export const RIVER = [
  [-1650, -1250], [-1420, -1050], [-1250, -880], [-1070, -700], [-900, -540],
  [-690, -390], [-470, -260], [-250, -130], [-60, -10], [140, 150],
  [340, 340], [570, 570], [820, 830], [1080, 1120], [1350, 1430]
]

export const ROADS = [
  {
    id: 'a8', name: 'A-8', kind: 'highway', width: 20, lanes: 4, closed: false, density: 0,
    speed: 110, guardrail: true, lamps: 52, lifts: [],
    points: [
      [1380, 790], [1180, 660], [980, 520], [800, 410], [600, 280], [400, 150],
      [210, 10], [10, -120], [-200, -250], [-410, -360], [-620, -470],
      [-840, -570], [-1060, -690], [-1260, -820], [-1450, -960]
    ]
  },
  {
    id: 'city', name: 'Bilbao Centro', kind: 'city', width: 12, lanes: 2, closed: true, density: 1.0,
    speed: 50, guardrail: false, lamps: 26, sidewalks: 3.4,
    points: [
      [240, -70], [420, -40], [560, 50], [620, 190], [560, 330], [420, 400],
      [270, 370], [160, 270], [130, 130], [160, 20]
    ]
  },
  {
    id: 'gran-via', name: 'Gran Vía', kind: 'city', width: 14, lanes: 2, closed: false, density: 1.0,
    speed: 50, guardrail: false, lamps: 24, sidewalks: 3.6,
    points: [[180, 110], [300, 90], [430, 120], [540, 190], [620, 270]]
  },
  {
    id: 'industria', name: 'Polígono Barakaldo', kind: 'industrial', width: 15, lanes: 2, closed: true, density: 0.75,
    speed: 60, guardrail: false, lamps: 34, sidewalks: 2.2,
    points: [
      [-350, -310], [-580, -380], [-800, -330], [-820, -150], [-680, -30],
      [-470, -20], [-300, -110], [-280, -230]
    ]
  },
  {
    id: 'poligono', name: 'Recta Industrial', kind: 'industrial', width: 18, lanes: 2, closed: true, density: 0.85,
    speed: 70, guardrail: false, lamps: 40, sidewalks: 2,
    points: [[-420, -250], [-260, -250], [-260, 120], [-420, 120]]
  },
  {
    id: 'portugalete', name: 'Ría de Portugalete', kind: 'town', width: 11, lanes: 2, closed: true, density: 0.6,
    speed: 50, guardrail: false, lamps: 30, sidewalks: 2.4,
    points: [
      [-940, -500], [-1080, -620], [-1240, -760], [-1180, -960], [-980, -1040],
      [-820, -920], [-830, -720], [-860, -580]
    ]
  },
  {
    id: 'getxo', name: 'Getxo · Costa', kind: 'coast', width: 11, lanes: 2, closed: true, density: 0.55,
    speed: 60, guardrail: true, lamps: 34, sidewalks: 2.2,
    points: [
      [-330, -620], [-160, -760], [-220, -960], [-420, -1080], [-660, -1040],
      [-790, -880], [-690, -700], [-520, -590]
    ]
  },
  {
    id: 'muskiz', name: 'BI-634 Muskiz–Gallarta', kind: 'rural', width: 9.5, lanes: 2, closed: true, density: 0.3,
    speed: 70, guardrail: true, lamps: 0, sidewalks: 0,
    points: [
      [-1030, -180], [-1220, -30], [-1330, 210], [-1190, 430], [-960, 590],
      [-760, 690], [-600, 560], [-660, 350], [-790, 120], [-900, -80]
    ]
  },
  {
    id: 'txorierri', name: 'Corredor del Txorierri', kind: 'suburb', width: 14, lanes: 2, closed: true, density: 0.55,
    speed: 80, guardrail: true, lamps: 36, sidewalks: 1.8,
    tunnels: [[0.34, 0.45], [0.72, 0.79]],
    points: [
      [430, 250], [640, 290], [820, 430], [860, 610], [740, 760], [560, 830],
      [390, 760], [320, 610], [340, 430]
    ]
  },
  {
    id: 'mountain', name: 'BI-2701 Gallarta', kind: 'mountain', width: 8.5, lanes: 2, closed: true, density: 0.12,
    speed: 60, guardrail: true, lamps: 0, sidewalks: 0,
    points: [
      [560, 760], [700, 780], [820, 900], [760, 1000], [900, 1050], [1030, 1150],
      [980, 1280], [820, 1340], [700, 1240], [560, 1290], [480, 1160],
      [560, 1010], [470, 890]
    ]
  },
  {
    id: 'artxanda', name: 'Artxanda', kind: 'mountain', width: 8, lanes: 2, closed: false, density: 0.2,
    speed: 50, guardrail: true, lamps: 18, sidewalks: 0,
    points: [[330, 30], [380, -60], [340, -150], [410, -210], [480, -170], [540, -250]]
  },
  {
    id: 'cruces', name: 'BI-2302 Cruces', kind: 'suburb', width: 11, lanes: 2, closed: false, density: 0.45,
    speed: 60, guardrail: false, lamps: 30, sidewalks: 2,
    points: [[430, 330], [370, 470], [350, 610], [430, 740], [540, 800]]
  },
  {
    id: 'muskiz-link', name: 'Enlace Muskiz', kind: 'rural', width: 10, lanes: 2, closed: false, density: 0.15,
    speed: 60, guardrail: true, lamps: 0, sidewalks: 0,
    points: [[-820, -300], [-920, -290], [-990, -230]]
  },
  {
    id: 'puente', name: 'Puente Colgante', kind: 'bridge', width: 9, lanes: 2, closed: false, density: 0,
    speed: 30, guardrail: true, lamps: 20, sidewalks: 1.5, bridge: true,
    points: [[-1030, -610], [-960, -680], [-880, -740], [-810, -790]]
  },
  {
    id: 'getxo-link', name: 'Enlace Getxo', kind: 'coast', width: 10, lanes: 2, closed: false, density: 0.2,
    speed: 50, guardrail: false, lamps: 24, sidewalks: 1.5,
    points: [[-810, -790], [-690, -760], [-600, -690]]
  }
]

export const DISTRICTS = [
  { name: 'BILBAO', x: 330, z: 170, kind: 'city' },
  { name: 'BARAKALDO', x: -520, z: -210, kind: 'city' },
  { name: 'SESTAO', x: -780, z: -400, kind: 'city' },
  { name: 'PORTUGALETE', x: -1050, z: -610, kind: 'town' },
  { name: 'SANTURTZI', x: -1240, z: -870, kind: 'town' },
  { name: 'GETXO', x: -470, z: -900, kind: 'town' },
  { name: 'MUSKIZ', x: -1240, z: 20, kind: 'town' },
  { name: 'GALLARTA', x: -980, z: 470, kind: 'town' },
  { name: 'ORTUELLA', x: -720, z: 650, kind: 'town' },
  { name: 'CRUCES', x: 370, z: 610, kind: 'town' },
  { name: 'TXORIERRI', x: 700, z: 590, kind: 'town' },
  { name: 'ARTXANDA', x: 440, z: -210, kind: 'hill' }
]

export const LANDMARKS = [
  { type: 'guggenheim', x: -80, z: 60, angle: 0.5 },
  { type: 'tower', x: 330, z: 70, angle: 0 },
  { type: 'stadium', x: 560, z: 360, angle: 0.2 },
  { type: 'bridge', x: -70, z: 150, angle: 0.5 },
  { type: 'transporter', x: -925, z: -700, angle: 0.72 },
  { type: 'port', x: -1270, z: -1010, angle: 0.1 },
  { type: 'gas', x: 620, z: 40, angle: 0 },
  { type: 'gas', x: -330, z: -150, angle: 0.2 },
  { type: 'viewpoint', x: 520, z: -230, angle: -1.0 },
  { type: 'beach', x: -460, z: -1050, angle: 0 },
  { type: 'chimneys', x: -620, z: -240, angle: 0 },
  { type: 'stadiumSmall', x: -720, z: 430, angle: 0.4 }
]

export const SPAWNS = {
  free: { road: 'city', t: 0.03, name: 'Bilbao · Abando' },
  menu: { road: 'a8', t: 0.1 },
  drag: { x: -420, z: -225, heading: Math.PI, name: 'Recta Industrial' }
}

export const RACES = {
  street: {
    name: 'Carrera Callejera', subtitle: 'Bilbao · 2 vueltas', road: 'city', laps: 2,
    checkpoints: 10, rivals: 3, reward: 2400, entry: 0, time: 190,
    description: 'Domina el centro de Bilbao. Tráfico abierto y curvas ciegas.'
  },
  mountain: {
    name: 'Subida a Gallarta', subtitle: 'Montaña · 1 vuelta', road: 'mountain', laps: 1,
    checkpoints: 14, rivals: 3, reward: 3800, entry: 0, time: 240,
    description: 'Asfalto estrecho, niebla y precipicio. La montaña no perdona.'
  },
  coast: {
    name: 'Costa de Getxo', subtitle: 'Getxo · 2 vueltas', road: 'getxo', laps: 2,
    checkpoints: 10, rivals: 3, reward: 3000, entry: 0, time: 200,
    description: 'Curvas rápidas junto al Cantábrico. Cuidado con la lluvia.'
  }
}

export const MISSIONS = [
  { name: 'Paquete urgente', from: 'Bilbao', to: 'Guggenheim', x: -80, z: 120, reward: 650, time: 100 },
  { name: 'Recado en el puerto', from: 'Bilbao', to: 'Santurtzi', x: -1230, z: -930, reward: 1100, time: 150 },
  { name: 'Mudanza a Muskiz', from: 'Bilbao', to: 'Muskiz', x: -1230, z: 20, reward: 1250, time: 160 },
  { name: 'Visita a la abuela', from: 'Bilbao', to: 'Ortuella', x: -720, z: 650, reward: 980, time: 145 },
  { name: 'Cita en Getxo', from: 'Bilbao', to: 'Getxo', x: -470, z: -900, reward: 1050, time: 145 },
  { name: 'Vuelta por Artxanda', from: 'Bilbao', to: 'Artxanda', x: 520, z: -230, reward: 700, time: 110 }
]

export const MISSION_STARTS = [
  { x: 300, z: 240 }, { x: 190, z: -30 }, { x: 520, z: 300 }
]

export const CITY_LABELS = DISTRICTS.map(d => ({ name: d.name, x: d.x, z: d.z }))

export const FUEL_STATIONS = [
  { x: 660, z: 15, angle: 0, name: 'Bilbao North' },
  { x: -330, z: -175, angle: 0.2, name: 'Barakaldo' }
]

export const POLICE_STATIONS = [
  { x: 500, z: 230 }, { x: -690, z: -300 }, { x: -1090, z: -650 }
]
