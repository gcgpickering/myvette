import { useEffect, useCallback, useMemo, useRef } from 'react'
import { useMarketplaceStore } from '../../stores/marketplaceStore'
import { getUpgradeCategories, startScrape, getScrapeResults, createScrapeWebSocket } from '../../api/marketplace'
import { FilterBar } from './FilterBar'
import { ProductCard } from './ProductCard'
import { PriceComparisonBar } from './PriceComparisonBar'
import type { PartSlug, ScrapeResult } from '../../types'

interface MarketplaceProps {
  vehicleId: number
  partSlug: PartSlug
  onClose: () => void
}

function SkeletonCard() {
  return (
    <div className="bg-bg-surface border border-border-subtle rounded-xl overflow-hidden animate-pulse">
      <div className="aspect-[4/3] bg-white/5" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-white/5 rounded w-full" />
        <div className="h-4 bg-white/5 rounded w-2/3" />
        <div className="h-6 bg-white/5 rounded w-1/3" />
        <div className="h-3 bg-white/5 rounded w-1/2" />
        <div className="h-8 bg-white/5 rounded w-full mt-4" />
      </div>
    </div>
  )
}

function ScrapeProgress({ status, retailersSearched }: { status: string; retailersSearched: string[] }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-accent-red/5 border-b border-accent-red/10">
      <div className="w-4 h-4 border-2 border-accent-red border-t-transparent rounded-full animate-spin" />
      <div className="flex-1">
        <p className="text-sm text-accent-red font-medium">
          {status === 'pending' ? 'Starting scrape...' : 'Searching retailers...'}
        </p>
        {retailersSearched.length > 0 && (
          <p className="text-xs text-white/40 mt-0.5">
            Found results from: {retailersSearched.join(', ')}
          </p>
        )}
      </div>
    </div>
  )
}

export function Marketplace({ vehicleId, partSlug, onClose }: MarketplaceProps) {
  const store = useMarketplaceStore()
  const wsRef = useRef<WebSocket | null>(null)
  const retailersFound = useRef<Set<string>>(new Set())

  // Load categories on mount
  useEffect(() => {
    store.setLoading(true)
    getUpgradeCategories(partSlug)
      .then((cats) => {
        store.setCategories(cats)
        if (cats.length > 0) {
          store.setSelectedCategory(cats[0])
        }
      })
      .catch(() => {
        // Categories fetch failed
      })
      .finally(() => store.setLoading(false))

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partSlug])

  // Start scrape when category selected
  const handleStartScrape = useCallback(async () => {
    if (!store.selectedCategory) return

    store.setLoading(true)
    store.setResults([])
    retailersFound.current.clear()

    try {
      const job = await startScrape(vehicleId, Number(store.selectedCategory.id))
      store.setCurrentJob(job)

      // Connect WebSocket for live results
      if (wsRef.current) wsRef.current.close()
      const ws = createScrapeWebSocket(Number(job.id))
      wsRef.current = ws

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.type === 'results') {
            const results = data.results as ScrapeResult[]
            store.addResults(results)
            results.forEach((r: ScrapeResult) => retailersFound.current.add(r.retailer ?? r.source))
          } else if (data.type === 'complete') {
            store.setCurrentJob({ ...job, status: 'completed' })
            store.setLoading(false)
            ws.close()
          } else if (data.type === 'error') {
            store.setCurrentJob({ ...job, status: 'failed', errorMessage: data.message })
            store.setLoading(false)
            ws.close()
          }
        } catch {
          // Parse error, ignore
        }
      }

      ws.onerror = () => {
        // WebSocket failed, fall back to polling
        ws.close()
        fetchResultsFallback(vehicleId, Number(store.selectedCategory!.id))
      }

      ws.onclose = () => {
        wsRef.current = null
      }
    } catch {
      // startScrape failed, try fetching cached results
      if (store.selectedCategory) {
        fetchResultsFallback(vehicleId, Number(store.selectedCategory.id))
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicleId, store.selectedCategory])

  const fetchResultsFallback = async (vId: number, catId: number) => {
    try {
      const results = await getScrapeResults(vId, catId)
      store.setResults(results)
    } catch {
      // No results available
    } finally {
      store.setLoading(false)
    }
  }

  // Trigger scrape when category changes
  useEffect(() => {
    if (store.selectedCategory) {
      handleStartScrape()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.selectedCategory?.id])

  // Apply client-side filters
  const filteredResults = useMemo(() => {
    let filtered = [...store.results]

    if (store.minRating > 0) {
      filtered = filtered.filter((r) => (r.rating ?? 0) >= store.minRating)
    }
    if (store.maxPrice !== null) {
      filtered = filtered.filter((r) => (r.price ?? 0) <= store.maxPrice!)
    }
    if (store.retailerFilter) {
      filtered = filtered.filter((r) => (r.retailer ?? r.source) === store.retailerFilter)
    }

    // Sort
    switch (store.sortBy) {
      case 'price':
        filtered.sort((a, b) => (a.price ?? 0) - (b.price ?? 0))
        break
      case 'rating':
        filtered.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
        break
      case 'best_value':
        filtered.sort((a, b) => {
          const scoreA = (a.rating ?? 0) / Math.max(a.price ?? 1, 1)
          const scoreB = (b.rating ?? 0) / Math.max(b.price ?? 1, 1)
          return scoreB - scoreA
        })
        break
    }

    return filtered
  }, [store.results, store.sortBy, store.minRating, store.maxPrice, store.retailerFilter])

  const isJobRunning = store.currentJob?.status === 'pending' || store.currentJob?.status === 'running'

  return (
    <div className="h-full flex flex-col bg-bg-primary/50" style={{ position: 'relative', zIndex: 20 }}>
      {/* Header */}
      <div className="shrink-0 px-4 py-3 border-b border-border-subtle flex items-center gap-3" style={{ position: 'relative', zIndex: 30 }}>
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-semibold text-white/90">Upgrade Marketplace</h2>
          <p className="text-xs text-white/40 mt-0.5">
            {partSlug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
          </p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); e.preventDefault(); onClose() }}
          className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-150 cursor-pointer"
          style={{
            color: 'rgba(255,255,255,0.5)',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.9)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)' }}
          aria-label="Close marketplace"
        >
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Category pills */}
      {store.categories.length > 0 && (
        <div className="shrink-0 px-4 py-2.5 border-b border-border-subtle overflow-x-auto">
          <div className="flex gap-2">
            {store.categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => store.setSelectedCategory(cat)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors duration-150 border ${
                  store.selectedCategory?.id === cat.id
                    ? 'bg-accent-red/15 text-accent-red border-accent-red/30'
                    : 'bg-white/5 text-white/50 border-border-subtle hover:text-white/70 hover:bg-white/10'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <FilterBar />

      {/* Scraping progress */}
      {isJobRunning && (
        <ScrapeProgress
          status={store.currentJob!.status}
          retailersSearched={Array.from(retailersFound.current)}
        />
      )}

      {/* Results */}
      <div className="flex-1 overflow-y-auto p-4">
        {store.loading && filteredResults.length === 0 ? (
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filteredResults.length > 0 ? (
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
            {filteredResults.map((result) => (
              <ProductCard key={result.id} result={result} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <svg
              className="w-12 h-12 text-white/10 mb-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <p className="text-white/40 text-sm">
              {store.categories.length === 0
                ? 'No upgrade categories available for this part'
                : 'No results found. Try adjusting your filters.'}
            </p>
          </div>
        )}
      </div>

      {/* Price Comparison */}
      {filteredResults.length > 0 && <PriceComparisonBar results={filteredResults} />}
    </div>
  )
}
