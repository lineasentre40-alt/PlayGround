// Car catalogue. All figures are approximations inspired by the real models.
export const CARS = [
  {
    id: 'leon-mk1', brand: 'SEAT', model: 'León MK1', trim: '1.8T 20V', year: 2003, price: 6200,
    body: 'hatch', power: 180, torque: 235, torqueRpm: 1950, idle: 820, limit: 6800,
    weight: 1325, drivetrain: 'FWD', gears: [3.36, 2.09, 1.47, 1.10, 0.89, 0.72], final: 3.94,
    topSpeed: 229, length: 4.18, width: 1.74, height: 1.44, wheelbase: 2.51, track: 1.51, wheelR: 0.315,
    dist: 0.62, colors: ['#B61A1A', '#E8B21C', '#1B2B4A', '#B8BCC0', '#141414'],
    defaultColor: '#B61A1A', grille: 'seat', lights: 'round', wheelStyle: 0,
    sound: { cyl: 4, tone: 1.0, rough: 0.45, diesel: false }, era: '2000s', spoiler: 0.35
  },
  {
    id: 'ibiza-mk2', brand: 'SEAT', model: 'Ibiza MK2', trim: '2.0 16V GTi', year: 1999, price: 3800,
    body: 'hatch', power: 150, torque: 180, torqueRpm: 4500, idle: 850, limit: 7000,
    weight: 1050, drivetrain: 'FWD', gears: [3.3, 2.1, 1.45, 1.1, 0.9], final: 4.0,
    topSpeed: 210, length: 3.85, width: 1.64, height: 1.41, wheelbase: 2.44, track: 1.42, wheelR: 0.3,
    dist: 0.65, colors: ['#D8232A', '#F2C300', '#2D5C3A', '#D7D9DB'],
    defaultColor: '#D8232A', grille: 'seat', lights: 'square', wheelStyle: 1,
    sound: { cyl: 4, tone: 1.12, rough: 0.4, diesel: false }, era: '90s', spoiler: 0.5
  },
  {
    id: 'ibiza-mk3', brand: 'SEAT', model: 'Ibiza MK3', trim: '1.9 TDI Sport', year: 2004, price: 4600,
    body: 'hatch', power: 130, torque: 310, torqueRpm: 1900, idle: 800, limit: 4800,
    weight: 1215, drivetrain: 'FWD', gears: [3.5, 2.05, 1.35, 0.98, 0.78], final: 3.4,
    topSpeed: 208, length: 3.95, width: 1.70, height: 1.44, wheelbase: 2.46, track: 1.43, wheelR: 0.31,
    dist: 0.64, colors: ['#1E63B0', '#C9CDD0', '#171717', '#8F1E24'],
    defaultColor: '#1E63B0', grille: 'seat', lights: 'round', wheelStyle: 2,
    sound: { cyl: 4, tone: 0.86, rough: 0.65, diesel: true }, era: '2000s', spoiler: 0.3
  },
  {
    id: 'cordoba', brand: 'SEAT', model: 'Córdoba', trim: '1.6 16V', year: 2001, price: 2900,
    body: 'sedan', power: 100, torque: 145, torqueRpm: 3800, idle: 820, limit: 6200,
    weight: 1100, drivetrain: 'FWD', gears: [3.4, 2.0, 1.4, 1.05, 0.85], final: 3.8,
    topSpeed: 190, length: 4.24, width: 1.70, height: 1.42, wheelbase: 2.44, track: 1.43, wheelR: 0.3,
    dist: 0.63, colors: ['#9A1B22', '#37628F', '#C4C8CB', '#3C3C3C'],
    defaultColor: '#9A1B22', grille: 'seat', lights: 'round', wheelStyle: 1,
    sound: { cyl: 4, tone: 0.95, rough: 0.3, diesel: false }, era: '2000s', spoiler: 0.15
  },
  {
    id: 'toledo', brand: 'SEAT', model: 'Toledo', trim: '1.8 20VT', year: 2002, price: 4200,
    body: 'sedan', power: 180, torque: 235, torqueRpm: 1950, idle: 820, limit: 6800,
    weight: 1360, drivetrain: 'FWD', gears: [3.36, 2.09, 1.47, 1.10, 0.89, 0.72], final: 3.7,
    topSpeed: 220, length: 4.44, width: 1.74, height: 1.44, wheelbase: 2.51, track: 1.51, wheelR: 0.315,
    dist: 0.62, colors: ['#3C4650', '#B9BEC1', '#6D1A1A', '#1B2B4A'],
    defaultColor: '#3C4650', grille: 'seat', lights: 'round', wheelStyle: 2,
    sound: { cyl: 4, tone: 0.98, rough: 0.42, diesel: false }, era: '2000s', spoiler: 0.2
  },
  {
    id: 'altea', brand: 'SEAT', model: 'Altea', trim: '2.0 TDI', year: 2006, price: 5400,
    body: 'mpv', power: 140, torque: 320, torqueRpm: 1750, idle: 800, limit: 4700,
    weight: 1420, drivetrain: 'FWD', gears: [3.5, 2.05, 1.35, 0.98, 0.78], final: 3.4,
    topSpeed: 201, length: 4.32, width: 1.77, height: 1.57, wheelbase: 2.58, track: 1.54, wheelR: 0.31,
    dist: 0.62, colors: ['#B8B3A9', '#1F4E6B', '#9C1D24', '#2E2E2E'],
    defaultColor: '#B8B3A9', grille: 'seat', lights: 'round', wheelStyle: 3,
    sound: { cyl: 4, tone: 0.84, rough: 0.6, diesel: true }, era: '2000s', spoiler: 0.25
  },
  {
    id: 'leon-mk2', brand: 'SEAT', model: 'León MK2', trim: '2.0 TFSI FR', year: 2008, price: 8200,
    body: 'hatch', power: 200, torque: 280, torqueRpm: 1800, idle: 800, limit: 6800,
    weight: 1370, drivetrain: 'FWD', gears: [3.36, 2.09, 1.47, 1.10, 0.89, 0.72], final: 3.7,
    topSpeed: 236, length: 4.31, width: 1.77, height: 1.46, wheelbase: 2.58, track: 1.53, wheelR: 0.32,
    dist: 0.62, colors: ['#C8A21B', '#B9BEC1', '#1A1A1A', '#74201D'],
    defaultColor: '#C8A21B', grille: 'seat', lights: 'led', wheelStyle: 3,
    sound: { cyl: 4, tone: 1.04, rough: 0.48, diesel: false }, era: '2000s', spoiler: 0.45
  },
  {
    id: 'cupra-leon', brand: 'CUPRA', model: 'León', trim: '2.0 TSI 300', year: 2021, price: 34000,
    body: 'hatch', power: 300, torque: 380, torqueRpm: 1800, idle: 800, limit: 6800,
    weight: 1450, drivetrain: 'AWD', gears: [3.3, 2.1, 1.45, 1.05, 0.85, 0.7], final: 3.7,
    topSpeed: 250, length: 4.39, width: 1.80, height: 1.46, wheelbase: 2.64, track: 1.57, wheelR: 0.33,
    dist: 0.55, colors: ['#7A7D82', '#D8C400', '#0F1A2C', '#9C1E28'],
    defaultColor: '#7A7D82', grille: 'cupra', lights: 'led', wheelStyle: 4,
    sound: { cyl: 4, tone: 1.1, rough: 0.55, diesel: false }, era: 'modern', spoiler: 0.6
  },
  {
    id: 'formentor', brand: 'CUPRA', model: 'Formentor', trim: '2.0 TSI 310 4Drive', year: 2022, price: 41000,
    body: 'suv', power: 310, torque: 400, torqueRpm: 2000, idle: 820, limit: 6600,
    weight: 1600, drivetrain: 'AWD', gears: [3.4, 2.1, 1.45, 1.05, 0.82, 0.68], final: 3.6,
    topSpeed: 250, length: 4.45, width: 1.84, height: 1.51, wheelbase: 2.68, track: 1.58, wheelR: 0.34,
    dist: 0.56, colors: ['#2C3A45', '#B8B9B4', '#6E1B1C', '#D2A91D'],
    defaultColor: '#2C3A45', grille: 'cupra', lights: 'led', wheelStyle: 5,
    sound: { cyl: 4, tone: 1.02, rough: 0.58, diesel: false }, era: 'modern', spoiler: 0.7
  },
  {
    id: 'clio', brand: 'Renault', model: 'Clio', trim: '2.0 16V Sport', year: 2002, price: 4800,
    body: 'hatch', power: 182, torque: 200, torqueRpm: 5250, idle: 850, limit: 7200,
    weight: 1050, drivetrain: 'FWD', gears: [3.3, 2.1, 1.45, 1.1, 0.9], final: 4.1,
    topSpeed: 220, length: 3.81, width: 1.65, height: 1.42, wheelbase: 2.47, track: 1.43, wheelR: 0.305,
    dist: 0.65, colors: ['#E2B100', '#1C56A0', '#B92028', '#D5D8DA'],
    defaultColor: '#E2B100', grille: 'renault', lights: 'round', wheelStyle: 2,
    sound: { cyl: 4, tone: 1.16, rough: 0.42, diesel: false }, era: '2000s', spoiler: 0.55
  },
  {
    id: 'megane', brand: 'Renault', model: 'Mégane', trim: '2.0 16V Coupé', year: 2003, price: 3600,
    body: 'coupe', power: 165, torque: 200, torqueRpm: 4200, idle: 830, limit: 6800,
    weight: 1190, drivetrain: 'FWD', gears: [3.4, 2.1, 1.45, 1.08, 0.87], final: 3.9,
    topSpeed: 220, length: 4.15, width: 1.70, height: 1.37, wheelbase: 2.50, track: 1.45, wheelR: 0.31,
    dist: 0.63, colors: ['#D0AE1B', '#2A5C84', '#2B2B2B', '#B3B7BA'],
    defaultColor: '#D0AE1B', grille: 'renault', lights: 'round', wheelStyle: 1,
    sound: { cyl: 4, tone: 1.04, rough: 0.35, diesel: false }, era: '2000s', spoiler: 0.35
  },
  {
    id: 'peugeot-206', brand: 'Peugeot', model: '206', trim: '2.0 16V RC', year: 2004, price: 5200,
    body: 'hatch', power: 180, torque: 205, torqueRpm: 4750, idle: 840, limit: 7000,
    weight: 1050, drivetrain: 'FWD', gears: [3.3, 2.05, 1.4, 1.05, 0.86], final: 4.0,
    topSpeed: 220, length: 3.82, width: 1.65, height: 1.43, wheelbase: 2.45, track: 1.44, wheelR: 0.305,
    dist: 0.65, colors: ['#B61616', '#DFC200', '#2D2D2D', '#C7CBCE'],
    defaultColor: '#B61616', grille: 'peugeot', lights: 'round', wheelStyle: 1,
    sound: { cyl: 4, tone: 1.14, rough: 0.38, diesel: false }, era: '2000s', spoiler: 0.6
  },
  {
    id: 'peugeot-306', brand: 'Peugeot', model: '306', trim: '2.0 16V GTi-6', year: 1998, price: 3400,
    body: 'hatch', power: 167, torque: 193, torqueRpm: 5500, idle: 850, limit: 7200,
    weight: 1150, drivetrain: 'FWD', gears: [3.3, 2.1, 1.5, 1.15, 0.92], final: 4.0,
    topSpeed: 218, length: 4.03, width: 1.69, height: 1.39, wheelbase: 2.54, track: 1.45, wheelR: 0.3,
    dist: 0.64, colors: ['#C51E24', '#1D3F63', '#D9D9D6', '#1A1A1A'],
    defaultColor: '#C51E24', grille: 'peugeot', lights: 'square', wheelStyle: 0,
    sound: { cyl: 4, tone: 1.08, rough: 0.4, diesel: false }, era: '90s', spoiler: 0.45
  },
  {
    id: 'peugeot-307', brand: 'Peugeot', model: '307', trim: '2.0 16V RC', year: 2006, price: 4300,
    body: 'hatch', power: 177, torque: 202, torqueRpm: 5000, idle: 840, limit: 6900,
    weight: 1280, drivetrain: 'FWD', gears: [3.4, 2.1, 1.45, 1.08, 0.87], final: 3.9,
    topSpeed: 220, length: 4.21, width: 1.70, height: 1.51, wheelbase: 2.61, track: 1.50, wheelR: 0.315,
    dist: 0.63, colors: ['#B31B22', '#DDC400', '#494F54', '#C4C8CB'],
    defaultColor: '#B31B22', grille: 'peugeot', lights: 'led', wheelStyle: 2,
    sound: { cyl: 4, tone: 1.02, rough: 0.36, diesel: false }, era: '2000s', spoiler: 0.4
  },
  {
    id: 'xsara', brand: 'Citroën', model: 'Xsara', trim: '2.0 16V VTS', year: 2001, price: 3200,
    body: 'coupe', power: 167, torque: 200, torqueRpm: 5000, idle: 840, limit: 7000,
    weight: 1130, drivetrain: 'FWD', gears: [3.4, 2.1, 1.45, 1.1, 0.9], final: 4.0,
    topSpeed: 218, length: 4.09, width: 1.69, height: 1.38, wheelbase: 2.54, track: 1.44, wheelR: 0.3,
    dist: 0.64, colors: ['#C7A100', '#2E4D72', '#A51C24', '#C8CBCE'],
    defaultColor: '#C7A100', grille: 'citroen', lights: 'square', wheelStyle: 1,
    sound: { cyl: 4, tone: 1.03, rough: 0.35, diesel: false }, era: '2000s', spoiler: 0.4
  },
  {
    id: 'citroen-c4', brand: 'Citroën', model: 'C4', trim: '2.0 16V VTS', year: 2007, price: 5100,
    body: 'coupe', power: 177, torque: 202, torqueRpm: 5000, idle: 830, limit: 7000,
    weight: 1250, drivetrain: 'FWD', gears: [3.4, 2.1, 1.45, 1.08, 0.88], final: 4.0,
    topSpeed: 220, length: 4.28, width: 1.77, height: 1.47, wheelbase: 2.61, track: 1.50, wheelR: 0.32,
    dist: 0.63, colors: ['#B91F26', '#DCD7C9', '#2C2E30', '#456B8C'],
    defaultColor: '#B91F26', grille: 'citroen', lights: 'led', wheelStyle: 3,
    sound: { cyl: 4, tone: 1.0, rough: 0.34, diesel: false }, era: '2000s', spoiler: 0.35
  },
  {
    id: 'astra', brand: 'Opel', model: 'Astra', trim: '2.0 16V GSi', year: 2000, price: 3000,
    body: 'hatch', power: 160, torque: 195, torqueRpm: 4600, idle: 830, limit: 6800,
    weight: 1190, drivetrain: 'FWD', gears: [3.4, 2.1, 1.45, 1.08, 0.88], final: 3.9,
    topSpeed: 220, length: 4.11, width: 1.71, height: 1.42, wheelbase: 2.61, track: 1.47, wheelR: 0.305,
    dist: 0.63, colors: ['#C7B400', '#3D5A7D', '#B21C23', '#C9CCCF'],
    defaultColor: '#C7B400', grille: 'opel', lights: 'round', wheelStyle: 0,
    sound: { cyl: 4, tone: 1.05, rough: 0.4, diesel: false }, era: '2000s', spoiler: 0.45
  },
  {
    id: 'corsa', brand: 'Opel', model: 'Corsa', trim: '1.8 16V', year: 2003, price: 2600,
    body: 'hatch', power: 125, torque: 165, torqueRpm: 4200, idle: 830, limit: 6500,
    weight: 1000, drivetrain: 'FWD', gears: [3.5, 2.1, 1.45, 1.1, 0.9], final: 3.9,
    topSpeed: 200, length: 3.83, width: 1.64, height: 1.44, wheelbase: 2.49, track: 1.43, wheelR: 0.3,
    dist: 0.64, colors: ['#B8BCC0', '#D5AE1B', '#A81D24', '#2C3C50'],
    defaultColor: '#B8BCC0', grille: 'opel', lights: 'round', wheelStyle: 1,
    sound: { cyl: 4, tone: 1.08, rough: 0.36, diesel: false }, era: '2000s', spoiler: 0.3
  },
  {
    id: 'focus', brand: 'Ford', model: 'Focus', trim: '2.0 16V ST', year: 2003, price: 4100,
    body: 'hatch', power: 145, torque: 190, torqueRpm: 4500, idle: 830, limit: 6800,
    weight: 1180, drivetrain: 'FWD', gears: [3.4, 2.05, 1.4, 1.05, 0.85], final: 3.9,
    topSpeed: 210, length: 4.12, width: 1.70, height: 1.43, wheelbase: 2.61, track: 1.49, wheelR: 0.31,
    dist: 0.63, colors: ['#C7CB2D', '#2B4E78', '#B31E27', '#B8BCC0'],
    defaultColor: '#2B4E78', grille: 'ford', lights: 'round', wheelStyle: 2,
    sound: { cyl: 4, tone: 1.0, rough: 0.38, diesel: false }, era: '2000s', spoiler: 0.4
  },
  {
    id: 'focus-cmax', brand: 'Ford', model: 'Focus C-Max', trim: '1.6 TDCi 109 CV', year: 2005, price: 3900,
    body: 'mpv', power: 109, torque: 240, torqueRpm: 1750, idle: 810, limit: 4700,
    weight: 1450, drivetrain: 'FWD', gears: [3.6, 2.1, 1.36, 0.97, 0.76], final: 3.4,
    topSpeed: 185, length: 4.34, width: 1.82, height: 1.59, wheelbase: 2.64, track: 1.53, wheelR: 0.32,
    dist: 0.61, colors: ['#6C7A8A', '#C8CBC9', '#1E4C6B', '#8F2424'],
    defaultColor: '#6C7A8A', grille: 'ford', lights: 'round', wheelStyle: 3,
    sound: { cyl: 4, tone: 0.82, rough: 0.68, diesel: true }, era: '2000s', spoiler: 0.1
  },
  {
    id: 'bmw-e36', brand: 'BMW', model: 'Serie 3 E36', trim: '320i', year: 1995, price: 3500,
    body: 'sedan', power: 150, torque: 190, torqueRpm: 4200, idle: 780, limit: 6500,
    weight: 1300, drivetrain: 'RWD', gears: [3.4, 2.15, 1.55, 1.2, 1.0, 0.85], final: 3.15,
    topSpeed: 215, length: 4.43, width: 1.71, height: 1.39, wheelbase: 2.70, track: 1.46, wheelR: 0.315,
    dist: 0.5, colors: ['#1B2A38', '#B9BDC0', '#7A1C21', '#161616'],
    defaultColor: '#1B2A38', grille: 'bmw', lights: 'square', wheelStyle: 6,
    sound: { cyl: 6, tone: 0.82, rough: 0.35, diesel: false }, era: '90s', spoiler: 0.15
  },
  {
    id: 'bmw-e46', brand: 'BMW', model: 'Serie 3 E46', trim: '320i', year: 2003, price: 6800,
    body: 'sedan', power: 170, torque: 210, torqueRpm: 3500, idle: 780, limit: 6500,
    weight: 1420, drivetrain: 'RWD', gears: [3.4, 2.15, 1.55, 1.2, 1.0, 0.85], final: 3.15,
    topSpeed: 226, length: 4.47, width: 1.74, height: 1.42, wheelbase: 2.73, track: 1.48, wheelR: 0.32,
    dist: 0.5, colors: ['#1C2B3A', '#B8BCBF', '#73202A', '#232323'],
    defaultColor: '#1C2B3A', grille: 'bmw', lights: 'round', wheelStyle: 6,
    sound: { cyl: 6, tone: 0.86, rough: 0.32, diesel: false }, era: '2000s', spoiler: 0.2
  },
  {
    id: 'bmw-serie1', brand: 'BMW', model: 'Serie 1', trim: '118i', year: 2006, price: 7200,
    body: 'hatch', power: 143, torque: 190, torqueRpm: 4250, idle: 780, limit: 6500,
    weight: 1280, drivetrain: 'RWD', gears: [3.4, 2.15, 1.55, 1.2, 1.0], final: 3.4,
    topSpeed: 213, length: 4.24, width: 1.75, height: 1.42, wheelbase: 2.66, track: 1.49, wheelR: 0.315,
    dist: 0.51, colors: ['#C5C9CC', '#1C2B3A', '#8C1E26', '#333'],
    defaultColor: '#C5C9CC', grille: 'bmw', lights: 'round', wheelStyle: 6,
    sound: { cyl: 4, tone: 0.94, rough: 0.3, diesel: false }, era: '2000s', spoiler: 0.25
  },
  {
    id: 'bmw-m3', brand: 'BMW', model: 'M3', trim: 'E46 M3', year: 2003, price: 29000,
    body: 'coupe', power: 343, torque: 365, torqueRpm: 4900, idle: 800, limit: 8000,
    weight: 1495, drivetrain: 'RWD', gears: [3.4, 2.2, 1.6, 1.22, 1.0, 0.85], final: 3.6,
    topSpeed: 250, length: 4.49, width: 1.78, height: 1.37, wheelbase: 2.73, track: 1.51, wheelR: 0.33,
    dist: 0.51, colors: ['#B7BCC0', '#C0A400', '#1A1A1A', '#3A1B4A'],
    defaultColor: '#B7BCC0', grille: 'bmw', lights: 'round', wheelStyle: 7,
    sound: { cyl: 6, tone: 1.05, rough: 0.5, diesel: false }, era: '2000s', spoiler: 0.55
  },
  {
    id: 'bmw-m5', brand: 'BMW', model: 'M5', trim: 'E39', year: 2001, price: 24000,
    body: 'sedan', power: 400, torque: 500, torqueRpm: 3800, idle: 780, limit: 7000,
    weight: 1795, drivetrain: 'RWD', gears: [3.5, 2.2, 1.6, 1.25, 1.0, 0.82], final: 3.15,
    topSpeed: 250, length: 4.78, width: 1.80, height: 1.44, wheelbase: 2.83, track: 1.55, wheelR: 0.33,
    dist: 0.52, colors: ['#1B2A3A', '#A7ABAE', '#1C1C1C', '#4B2A1C'],
    defaultColor: '#1B2A3A', grille: 'bmw', lights: 'round', wheelStyle: 6,
    sound: { cyl: 8, tone: 0.72, rough: 0.55, diesel: false }, era: '2000s', spoiler: 0.1
  }
]

export const CAR_BY_ID = Object.fromEntries(CARS.map(c => [c.id, c]))

export const OWNED_BY_DEFAULT = ['leon-mk1', 'focus-cmax', 'bmw-e46']

export const TUNE_ITEMS = {
  engine:  { name: 'Motor',        levels: ['De serie', 'Admisión + escape', 'Árboles de levas', 'Motor forjado'], costs: [0, 1200, 3200, 7800], power: [1, 1.06, 1.14, 1.25] },
  turbo:   { name: 'Turbo',        levels: ['De serie', 'Turbo híbrido', 'Turbo grande', 'Turbo de competición'], costs: [0, 1800, 4200, 8900], power: [1, 1.10, 1.22, 1.38] },
  tires:   { name: 'Neumáticos',   levels: ['Carretera', 'Deportivo', 'Semi-slick', 'Slick'], costs: [0, 650, 1600, 3400], grip: [1, 1.10, 1.22, 1.32] },
  brakes:  { name: 'Frenos',       levels: ['De serie', 'Discos rayados', 'Big brake kit', 'Carrera'], costs: [0, 780, 2100, 4200], brake: [1, 1.12, 1.28, 1.4] },
  susp:    { name: 'Suspensión',   levels: ['De serie', 'Muelles deportivos', 'Coilovers', 'Competición'], costs: [0, 900, 2400, 5200], grip: [1, 1.05, 1.12, 1.18], height: [0, -0.04, -0.08, -0.12] },
  weight:  { name: 'Peso',         levels: ['De serie', 'Asientos deportivos', 'Desmontaje interior', 'Chasis aligerado'], costs: [0, 500, 1500, 3600], weight: [1, 0.97, 0.92, 0.86] }
}

export const PAINTS = [
  '#B61A1A', '#E23B1C', '#F2A900', '#F5D90A', '#1C7A3A', '#1899A8', '#1E63B0',
  '#1B2B4A', '#7A7D82', '#C5C9CC', '#F2F2F0', '#141414', '#5A2A6E', '#D7C7B0', '#8B5A2B'
]

export const WHEEL_STYLES = [
  { name: 'Aluminio 5 radios', cost: 0 },
  { name: 'Deportiva 10 radios', cost: 900 },
  { name: 'Cupra multirradio', cost: 1600 },
  { name: 'BBS clásica', cost: 2200 },
  { name: 'Forgiata', cost: 3200 }
]
