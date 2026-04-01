import { useMarketplaceStore } from '../../stores/marketplaceStore'

const SORT_OPTIONS: { value: 'price' | 'rating' | 'best_value'; label: string }[] = [
  { value: 'best_value', label: 'Best Value' },
  { value: 'price', label: 'Price (Low to High)' },
  { value: 'rating', label: 'Rating (High to Low)' },
]

const RETAILER_OPTIONS = ['All', 'Amazon', 'eBay', 'Google Shopping']

export function FilterBar() {
  const { sortBy, setSortBy, minRating, setMinRating, maxPrice, setMaxPrice, retailerFilter, setRetailerFilter } =
    useMarketplaceStore()

  return (
    <div className="flex flex-wrap items-center gap-4 px-4 py-3 border-b border-border-subtle bg-bg-primary/30">
      {/* Sort */}
      <div className="flex items-center gap-2">
        <label className="text-xs text-white/40 uppercase tracking-wider">Sort</label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'price' | 'rating' | 'best_value')}
          className="bg-white/5 border border-border-subtle rounded-lg px-2.5 py-1.5 text-sm text-white/80
                     focus:outline-none focus:border-accent-red/40 cursor-pointer"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-bg-primarytext-white">
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Min Rating */}
      <div className="flex items-center gap-2">
        <label className="text-xs text-white/40 uppercase tracking-wider">Rating</label>
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setMinRating(minRating === star ? 0 : star)}
              className="p-0.5 transition-colors duration-150"
              aria-label={`Minimum ${star} stars`}
            >
              <svg
                className={`w-4 h-4 ${star <= minRating ? 'text-amber-400' : 'text-white/20'}`}
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </button>
          ))}
        </div>
      </div>

      {/* Max Price */}
      <div className="flex items-center gap-2">
        <label className="text-xs text-white/40 uppercase tracking-wider">Max Price</label>
        <div className="relative">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/40 text-sm">$</span>
          <input
            type="number"
            placeholder="Any"
            value={maxPrice ?? ''}
            onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : null)}
            className="w-24 bg-white/5 border border-border-subtle rounded-lg pl-6 pr-2.5 py-1.5 text-sm text-white/80
                       placeholder:text-white/30 focus:outline-none focus:border-accent-red/40"
          />
        </div>
      </div>

      {/* Retailer */}
      <div className="flex items-center gap-2">
        <label className="text-xs text-white/40 uppercase tracking-wider">Retailer</label>
        <select
          value={retailerFilter ?? 'All'}
          onChange={(e) => setRetailerFilter(e.target.value === 'All' ? null : e.target.value)}
          className="bg-white/5 border border-border-subtle rounded-lg px-2.5 py-1.5 text-sm text-white/80
                     focus:outline-none focus:border-accent-red/40 cursor-pointer"
        >
          {RETAILER_OPTIONS.map((r) => (
            <option key={r} value={r} className="bg-bg-primarytext-white">
              {r}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
