export interface Vehicle {
  id: number
  year: number
  make: string
  model: string
  trim: string
  bodyType: BodyType
  engineType: string | null
  displacement: number | null
  horsepower: number | null
  torque: number | null
  drivetrain: string | null
  transmissionType: string | null
  curbWeight: number | null
}

export type BodyType = 'sedan' | 'coupe' | 'suv' | 'truck' | 'hatchback' | 'convertible' | 'wagon' | 'van'

export type PartSlug =
  | 'engine'
  | 'transmission'
  | 'suspension'
  | 'brakes'
  | 'exhaust'
  | 'tires-wheels'
  | 'air-intake'
  | 'ecu-electronics'
  | 'turbo-supercharger'
  | 'fuel-system'
  | 'cooling-system'
  | 'steering'
  | 'body-shell'

export interface PartType {
  id: number
  name: string
  slug: PartSlug
  category: string
  icon: string
  description: string
  howItWorks: string
  maintenanceSchedule: string
  commonFailures: string[]
  svgDiagramKey: string
}

export interface VehiclePart {
  id: number
  vehicleId: number
  partTypeId: number
  partType: PartType
  specs: Record<string, string | number>
  oemPartNumbers: string[]
}

export interface UpgradeCategory {
  id: number
  partTypeId: number
  name: string
  slug: string
  description: string
  difficultyRating: number
  estimatedInstallTime: string
  toolsNeeded: string[]
}

export interface ScrapeResult {
  id: number
  retailer: string
  productName: string
  price: number
  currency: string
  rating: number
  reviewCount: number
  imageUrl: string
  productUrl: string
  sellerName: string
  shippingEstimate: string
  fitmentConfidence: number
  scrapedAt: string
}

export interface ScrapeJob {
  id: number
  vehicleId: number
  upgradeCategoryId: number
  status: 'pending' | 'running' | 'completed' | 'failed'
  startedAt: string | null
  completedAt: string | null
  errorMessage: string | null
}

export interface GarageVehicle extends Vehicle {
  nickname?: string
  mileage?: number
  addedAt: string
}
