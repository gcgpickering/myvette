import api from './client'
import type { PartType, VehiclePart, UpgradeCategory } from '../types'

export async function getPartTypes(): Promise<PartType[]> {
  const { data } = await api.get<PartType[]>('/parts/types')
  return data
}

export async function getPartType(slug: string): Promise<PartType> {
  const { data } = await api.get<PartType>(`/parts/types/${slug}`)
  return data
}

export async function getVehicleParts(vehicleId: number): Promise<VehiclePart[]> {
  const { data } = await api.get<VehiclePart[]>(`/parts/vehicle/${vehicleId}`)
  return data
}

export async function getVehiclePart(vehicleId: number, slug: string): Promise<VehiclePart> {
  const { data } = await api.get<VehiclePart>(`/parts/vehicle/${vehicleId}/${slug}`)
  return data
}

export async function getUpgradeCategories(slug: string): Promise<UpgradeCategory[]> {
  const { data } = await api.get<UpgradeCategory[]>(`/parts/upgrades/${slug}`)
  return data
}

export interface PartPositions {
  layoutType: string
  positions: Record<string, [number, number, number] | null>
  hiddenParts: string[]
}

export async function getPartPositions(make: string, model: string, year: number): Promise<PartPositions> {
  const { data } = await api.get<PartPositions>('/parts/positions', {
    params: { make, model, year }
  })
  return data
}

export interface PartArchetypeSelection {
  archetypes: Record<string, string | null>  // partSlug -> archetype_key or null
  layoutType: string
  positions: Record<string, [number, number, number] | null>
  hiddenParts: string[]
}

export async function getPartArchetypes(
  make: string, model: string, year: number,
  engineType?: string, displacement?: number, drivetrain?: string,
  transmissionType?: string, bodyType?: string,
): Promise<PartArchetypeSelection> {
  const { data } = await api.get<PartArchetypeSelection>('/parts/archetypes/select', {
    params: { make, model, year, engineType, displacement, drivetrain, transmissionType, bodyType }
  })
  return data
}

export function getPartModelUrl(archetypeKey: string): string {
  const base = import.meta.env.VITE_API_URL || '/api'
  return `${base}/parts/model/${archetypeKey}`
}
