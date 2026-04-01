import type { GenerationCode } from './corvette-generations'

export interface StockColor {
  name: string
  hex: string
  isDefault: boolean
}

export const GENERATION_COLORS: Record<GenerationCode, StockColor[]> = {
  c3: [
    { name: 'Monza Red', hex: '#c41e2a', isDefault: true },
    { name: 'Riverside Gold', hex: '#c8a84e', isDefault: false },
    { name: 'LeMans Blue', hex: '#1a3a6b', isDefault: false },
    { name: 'Tuxedo Black', hex: '#111111', isDefault: false },
    { name: 'Can-Am White', hex: '#e8e4dc', isDefault: false },
  ],
  c4: [
    { name: 'Bright Red', hex: '#cc2222', isDefault: true },
    { name: 'Black', hex: '#111111', isDefault: false },
    { name: 'White', hex: '#f0f0f0', isDefault: false },
    { name: 'Dark Red Metallic', hex: '#6b1a1a', isDefault: false },
    { name: 'Medium Blue Metallic', hex: '#2a4a7a', isDefault: false },
  ],
  c5: [
    { name: 'Torch Red', hex: '#c41e2a', isDefault: true },
    { name: 'Nassau Blue', hex: '#1a3a8b', isDefault: false },
    { name: 'Millennium Yellow', hex: '#e6c619', isDefault: false },
    { name: 'Quicksilver', hex: '#8a8a8a', isDefault: false },
    { name: 'Black', hex: '#111111', isDefault: false },
  ],
  c6: [
    { name: 'Victory Red', hex: '#b91c1c', isDefault: true },
    { name: 'Jetstream Blue', hex: '#2563a8', isDefault: false },
    { name: 'Velocity Yellow', hex: '#ddb816', isDefault: false },
    { name: 'Cyber Gray', hex: '#5a5a5a', isDefault: false },
    { name: 'Black', hex: '#111111', isDefault: false },
  ],
  c7: [
    { name: 'Torch Red', hex: '#c41e2a', isDefault: true },
    { name: 'Laguna Blue', hex: '#2975b0', isDefault: false },
    { name: 'Corvette Racing Yellow', hex: '#e6c619', isDefault: false },
    { name: 'Shark Gray', hex: '#5e6269', isDefault: false },
    { name: 'Black', hex: '#111111', isDefault: false },
  ],
  c8: [
    { name: 'Torch Red', hex: '#c41e2a', isDefault: true },
    { name: 'Rapid Blue', hex: '#2b6cb0', isDefault: false },
    { name: 'Accelerate Yellow', hex: '#e6c619', isDefault: false },
    { name: 'Shadow Gray', hex: '#4a4e54', isDefault: false },
    { name: 'Arctic White', hex: '#f5f5f0', isDefault: false },
  ],
}

/** Get the stock paint colors for a given generation. Returns empty array if code is invalid. */
export function getColorsForGeneration(code: string): StockColor[] {
  return GENERATION_COLORS[code as GenerationCode] ?? []
}
