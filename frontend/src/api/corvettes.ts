import api from './client'
import { getGeneration } from '../data/corvette-generations'
import type { Generation } from '../data/corvette-generations'
import type { StockColor } from '../data/corvette-colors'

/** Fetch all generations from the backend. */
export async function getGenerations(): Promise<Generation[]> {
  const response = await api.get<Generation[]>('/corvettes/generations')
  return response.data
}

/** Build the static model URL for a generation (no network call). */
export function getModelUrl(generation: string): string {
  const gen = getGeneration(generation)
  if (gen) return gen.modelUrl
  return `/static/models/corvette/${generation}.glb`
}

/** Fetch available colors for a generation from the backend. */
export async function getGenerationColors(
  generation: string
): Promise<StockColor[]> {
  const response = await api.get<StockColor[]>(
    `/corvettes/${generation}/colors`
  )
  return response.data
}
