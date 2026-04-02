export type GenerationCode = 'c3' | 'c4' | 'c5' | 'c6' | 'c7' | 'c8'
export type MeshQuality = 'excellent' | 'good' | 'generic'

export interface GenerationSpecs {
  engine: string
  horsepower: string
  torque: string
  zeroToSixty: string
  transmission: string
  layout: string
}

export interface Generation {
  code: GenerationCode
  name: string
  yearRange: string
  representativeYear: number
  tagline: string
  glbFilename: string
  modelUrl: string
  meshQuality: MeshQuality
  meshCount: number
  specs: GenerationSpecs
  heritage: string
}

const MODEL_BASE = import.meta.env.PROD
  ? 'https://pub-6f765b566e324f15bd5134e7598e4824.r2.dev'
  : '/static/models/corvette'

export const GENERATIONS: Generation[] = [
  {
    code: 'c3',
    name: 'C3 Stingray',
    yearRange: '1968-1982',
    representativeYear: 1969,
    tagline: 'The Shark',
    glbFilename: 'c3_stingray_1969.glb',
    modelUrl: `${MODEL_BASE}/c3_stingray_1969.glb`,
    meshQuality: 'good',
    meshCount: 42,
    specs: {
      engine: '350ci V8',
      horsepower: '300hp',
      torque: '380 lb-ft',
      zeroToSixty: '5.7s',
      transmission: '4-speed manual',
      layout: 'Front-engine RWD',
    },
    heritage:
      'The C3 introduced the iconic "Coke bottle" shape inspired by the Mako Shark II concept. Produced for 15 years, it remains the longest-running Corvette generation and a symbol of American muscle.',
  },
  {
    code: 'c4',
    name: 'C4 Corvette',
    yearRange: '1984-1996',
    representativeYear: 1990,
    tagline: 'Digital Revolution',
    glbFilename: 'c4_1990.glb',
    modelUrl: `${MODEL_BASE}/c4_1990.glb`,
    meshQuality: 'good',
    meshCount: 38,
    specs: {
      engine: '350ci L98 V8',
      horsepower: '245hp',
      torque: '340 lb-ft',
      zeroToSixty: '5.8s',
      transmission: '4+3 manual',
      layout: 'Front-engine RWD',
    },
    heritage:
      'The C4 was a clean-sheet redesign that brought the Corvette into the digital age with an electronic dashboard and dramatically improved handling. The ZR-1 variant with its LT5 engine earned the title "King of the Hill."',
  },
  {
    code: 'c5',
    name: 'C5 Corvette',
    yearRange: '1997-2004',
    representativeYear: 1997,
    tagline: 'The Return of Power',
    glbFilename: 'c5_1997.glb',
    modelUrl: `${MODEL_BASE}/c5_1997.glb`,
    meshQuality: 'good',
    meshCount: 45,
    specs: {
      engine: '5.7L LS1 V8',
      horsepower: '345hp',
      torque: '350 lb-ft',
      zeroToSixty: '4.7s',
      transmission: '6-speed manual',
      layout: 'Front-engine RWD',
    },
    heritage:
      'The C5 introduced the legendary LS1 engine and a hydroformed box frame, delivering a quantum leap in refinement and performance. Its racing success at Le Mans cemented the modern Corvette legacy.',
  },
  {
    code: 'c6',
    name: 'C6 Corvette',
    yearRange: '2005-2013',
    representativeYear: 2009,
    tagline: 'The Supercar Slayer',
    glbFilename: 'c6_zr1_2009.glb',
    modelUrl: `${MODEL_BASE}/c6_zr1_2009.glb`,
    meshQuality: 'excellent',
    meshCount: 56,
    specs: {
      engine: '6.2L LS9 V8',
      horsepower: '638hp',
      torque: '604 lb-ft',
      zeroToSixty: '3.4s',
      transmission: '6-speed manual',
      layout: 'Front-engine RWD',
    },
    heritage:
      'The C6 shed the pop-up headlights for a sleeker profile and introduced the supercharged ZR1 — a 638hp monster that could trade blows with European exotics at a fraction of the price.',
  },
  {
    code: 'c7',
    name: 'C7 Stingray',
    yearRange: '2014-2019',
    representativeYear: 2014,
    tagline: 'The Grand Tourer',
    glbFilename: 'c7_stingray_2014.glb',
    modelUrl: `${MODEL_BASE}/c7_stingray_2014.glb`,
    meshQuality: 'excellent',
    meshCount: 62,
    specs: {
      engine: '6.2L LT1 V8',
      horsepower: '455hp',
      torque: '460 lb-ft',
      zeroToSixty: '3.8s',
      transmission: '7-speed manual',
      layout: 'Front-engine RWD',
    },
    heritage:
      'The C7 revived the Stingray name with aggressive angular styling and the direct-injected LT1 engine. It represented the pinnacle of front-engine Corvette engineering before the mid-engine era.',
  },
  {
    code: 'c8',
    name: 'C8 Stingray',
    yearRange: '2020-present',
    representativeYear: 2020,
    tagline: 'Mid-Engine Revolution',
    glbFilename: 'c8_stingray_2020.glb',
    modelUrl: `${MODEL_BASE}/c8_stingray_2020.glb`,
    meshQuality: 'excellent',
    meshCount: 74,
    specs: {
      engine: '6.2L LT2 V8',
      horsepower: '495hp',
      torque: '470 lb-ft',
      zeroToSixty: '2.9s',
      transmission: '8-speed DCT',
      layout: 'Mid-engine RWD',
    },
    heritage:
      'The C8 fulfilled a decades-long dream by moving the engine behind the driver. With supercar looks, sub-3-second acceleration, and a starting price under $60k, it redefined what an American sports car could be.',
  },
]

/** Look up a generation by its code. Returns undefined if not found. */
export function getGeneration(code: string): Generation | undefined {
  return GENERATIONS.find((g) => g.code === code)
}

/** Alias for getGeneration — look up by code string. */
export function getGenerationByCode(code: string): Generation | undefined {
  return GENERATIONS.find((g) => g.code === code)
}
