/** MyVette type definitions */

export type BodyType = 'sedan' | 'coupe' | 'suv' | 'truck' | 'hatchback' | 'convertible' | 'wagon' | 'van'

export type PartSlug =
  | 'engine'
  | 'transmission'
  | 'exhaust'
  | 'suspension'
  | 'brakes'
  | 'steering'
  | 'cooling-system'
  | 'fuel-system'
  | 'air-intake'
  | 'ecu-electronics'
  | 'tires-wheels'
  | 'body-shell'
  | 'interior'
  | 'lights'
  | 'glass'
  | 'turbo-supercharger'

export type PartType = {
  slug: PartSlug
  name: string
  category: string
  description: string
  avgLifespan?: string
  avgCost?: string
  howItWorks?: string
  svgDiagramKey?: string
  commonFailures?: string[]
  maintenanceSchedule?: string
}

export type VehiclePart = {
  slug: PartSlug
  name: string
  type: PartType
  condition?: number
  notes?: string
  specs?: Record<string, string>
  oemPartNumbers?: string[]
}

export interface UpgradeCategory {
  id: string
  name: string
}

export interface ScrapeResult {
  id: string
  title: string
  price: number | null
  url: string
  source: string
  image_url?: string
  imageUrl?: string
  condition?: string
  rating?: number
  review_count?: number
  reviewCount?: number
  sellerName?: string
  productUrl?: string
  productName?: string
  currency?: string
  fitmentConfidence?: number
  shippingEstimate?: string
  retailer?: string
}

export interface ScrapeJob {
  id: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  results: ScrapeResult[]
  progress?: number
  errorMessage?: string
}

/**
 * Legacy Vehicle type — kept for backward compatibility with CarModel components.
 * MyVette uses generation codes instead, but some components still reference this.
 */
export interface Vehicle {
  id: number
  year: number
  make: string
  model: string
  trim?: string
  bodyType: BodyType
}
