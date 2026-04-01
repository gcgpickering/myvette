interface CuratedModel {
  slug: string
  filePath: string // relative to public/
}

// Models stored in public/models/ - expand this list as models are added
const CURATED_MODELS: CuratedModel[] = [
  // Add entries here as curated models are downloaded
  // { slug: 'toyota-camry', filePath: '/models/toyota-camry.glb' },
]

export function getCuratedModelPath(slug: string): string | null {
  const entry = CURATED_MODELS.find((m) => slug.includes(m.slug))
  return entry?.filePath ?? null
}
