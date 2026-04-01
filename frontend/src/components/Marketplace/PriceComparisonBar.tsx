import { useMemo } from 'react'
import type { ScrapeResult } from '../../types'

interface PriceComparisonBarProps {
  results: ScrapeResult[]
}

const RETAILER_BAR_COLORS: Record<string, string> = {
  Amazon: 'bg-orange-500',
  eBay: 'bg-blue-500',
  'Google Shopping': 'bg-emerald-500',
}

interface GroupedProduct {
  name: string
  entries: ScrapeResult[]
  bestPrice: number
}

export function PriceComparisonBar({ results }: PriceComparisonBarProps) {
  const grouped = useMemo(() => {
    if (results.length === 0) return []

    // Group by a normalized product name (first 40 chars lowercase, simplified)
    const groups = new Map<string, ScrapeResult[]>()
    for (const r of results) {
      const key = (r.productName ?? r.title ?? '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 40)
      const existing = groups.get(key)
      if (existing) {
        existing.push(r)
      } else {
        groups.set(key, [r])
      }
    }

    // Only keep groups with 2+ retailers
    const multiRetailer: GroupedProduct[] = []
    for (const [, entries] of groups) {
      const retailers = new Set(entries.map((e) => e.retailer ?? e.source))
      if (retailers.size >= 2) {
        const priced = entries.filter((e) => e.price != null)
        multiRetailer.push({
          name: entries[0].productName ?? entries[0].title ?? 'Product',
          entries: priced.sort((a, b) => (a.price ?? 0) - (b.price ?? 0)),
          bestPrice: Math.min(...priced.map((e) => e.price ?? Infinity)),
        })
      }
    }

    return multiRetailer.slice(0, 3) // Show up to 3 comparison groups
  }, [results])

  if (grouped.length === 0) return null

  const maxPrice = Math.max(...grouped.flatMap((g) => g.entries.map((e) => e.price ?? 0)))

  return (
    <div className="px-4 py-3 border-t border-border-subtle bg-bg-primary/30">
      <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">
        Price Comparison
      </h3>
      <div className="space-y-4">
        {grouped.map((group, gi) => (
          <div key={gi}>
            <p className="text-xs text-white/70 mb-1.5 line-clamp-1">{group.name}</p>
            <div className="space-y-1">
              {group.entries.map((entry, ei) => {
                const price = entry.price ?? 0
                const width = maxPrice > 0 ? (price / maxPrice) * 100 : 0
                const retailer = entry.retailer ?? entry.source ?? 'Unknown'
                const barColor = RETAILER_BAR_COLORS[retailer] ?? 'bg-white/30'
                const isBest = price === group.bestPrice

                return (
                  <div key={ei} className="flex items-center gap-2">
                    <span className="text-[10px] text-white/40 w-24 truncate">{retailer}</span>
                    <div className="flex-1 h-5 bg-white/5 rounded-full overflow-hidden relative">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${barColor} ${
                          isBest ? 'opacity-100' : 'opacity-50'
                        }`}
                        style={{ width: `${Math.max(width, 4)}%` }}
                      />
                    </div>
                    <span
                      className={`text-xs font-medium tabular-nums w-16 text-right ${
                        isBest ? 'text-accent-green' : 'text-white/60'
                      }`}
                    >
                      ${price.toFixed(2)}
                    </span>
                    {isBest && (
                      <span className="text-[9px] text-accent-green font-medium uppercase">Best</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
