import api from './client'
import type { ScrapeResult, ScrapeJob, UpgradeCategory } from '../types'

export async function getUpgradeCategories(partSlug: string): Promise<UpgradeCategory[]> {
  const { data } = await api.get<UpgradeCategory[]>(`/parts/upgrades/${partSlug}`)
  return data
}

export async function startScrape(vehicleId: number, upgradeCategoryId: number): Promise<ScrapeJob> {
  const { data } = await api.post<ScrapeJob>('/marketplace/scrape', {
    vehicle_id: vehicleId,
    upgrade_category_id: upgradeCategoryId,
  })
  return data
}

export async function getScrapeResults(
  vehicleId: number,
  upgradeCategoryId: number,
  sortBy: string = 'best_value',
  minRating: number = 0,
  maxPrice?: number,
  retailer?: string,
): Promise<ScrapeResult[]> {
  const { data } = await api.get<ScrapeResult[]>('/marketplace/results', {
    params: {
      vehicle_id: vehicleId,
      upgrade_category_id: upgradeCategoryId,
      sort_by: sortBy,
      min_rating: minRating,
      max_price: maxPrice,
      retailer,
    },
  })
  return data
}

export async function getJobStatus(jobId: number): Promise<ScrapeJob> {
  const { data } = await api.get<ScrapeJob>(`/marketplace/jobs/${jobId}`)
  return data
}

export interface PartSearchResult {
  name: string
  price: number | null
  url: string
  source: string
  description: string
  imageUrl: string | null
}

export async function searchParts(
  query: string,
  generation?: string,
  category?: string,
  limit: number = 10,
  competitive: boolean = true,
): Promise<PartSearchResult[]> {
  const { data } = await api.get<PartSearchResult[]>('/marketplace/search', {
    params: { q: query, generation, category, limit, competitive },
  })
  return data
}

export interface UpgradeAnalysis {
  estimatedHpGain: [number, number]
  estimatedTorqueGain: [number, number]
  estimatedWeightChange: [number, number]
  estimatedZeroToSixtyChange: [number, number]
  confidence: 'high' | 'medium' | 'low'
  summary: string
  pros: string[]
  cons: string[]
  difficulty: 'bolt-on' | 'moderate' | 'advanced' | 'professional'
  installTime: string
  compatibilityNotes: string
}

export async function analyzeUpgrade(
  generation: string,
  partCategory: string,
  productName: string,
  productDescription: string = '',
  productPrice?: string,
): Promise<UpgradeAnalysis> {
  const { data } = await api.post<UpgradeAnalysis>('/marketplace/analyze', {
    generation,
    part_category: partCategory,
    product_name: productName,
    product_description: productDescription,
    product_price: productPrice,
  })
  return data
}

export function createScrapeWebSocket(jobId: number): WebSocket {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  return new WebSocket(`${protocol}//${window.location.host}/api/ws/scrape/${jobId}`)
}

/** Convert snake_case keys to camelCase (matches Axios interceptor behavior). */
export function snakeToCamel(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const key of Object.keys(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase())
    result[camelKey] = obj[key]
  }
  return result
}
