import type { ScrapeResult } from '../../types'

interface ProductCardProps {
  result: ScrapeResult
}

const RETAILER_COLORS: Record<string, string> = {
  Amazon: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  eBay: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'Google Shopping': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
}

function FitmentBadge({ confidence }: { confidence?: number }) {
  if (!confidence || confidence <= 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/10 text-white/40 border border-white/10">
        <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
        Unknown Fitment
      </span>
    )
  }
  if (confidence > 0.8) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-500/15 text-green-400 border border-green-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
        Verified Fit
      </span>
    )
  }
  if (confidence >= 0.5) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/15 text-amber-400 border border-amber-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
        Likely Fits
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-500/15 text-red-400 border border-red-500/20">
      <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
      Check Fitment
    </span>
  )
}

function StarRating({ rating, count }: { rating?: number; count?: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-3.5 h-3.5 ${star <= Math.round(rating ?? 0) ? 'text-amber-400' : 'text-white/15'}`}
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </div>
      <span className="text-xs text-white/40">({(count ?? 0).toLocaleString()})</span>
    </div>
  )
}

export function ProductCard({ result }: ProductCardProps) {
  const retailer = result.retailer ?? result.source ?? 'Unknown'
  const retailerClass = RETAILER_COLORS[retailer] ?? 'bg-white/10 text-white/60 border-white/10'

  return (
    <div
      className="bg-bg-surface border border-border-subtle rounded-xl overflow-hidden
                 hover:border-accent-red/30 hover:scale-[1.02] transition-all duration-200 flex flex-col"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] bg-white/5 flex items-center justify-center overflow-hidden">
        {(result.imageUrl ?? result.image_url) ? (
          <img
            src={result.imageUrl ?? result.image_url}
            alt={result.productName ?? result.title}
            className="w-full h-full object-contain p-2"
            loading="lazy"
          />
        ) : (
          <svg className="w-12 h-12 text-white/10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
        )}
        {/* Retailer badge */}
        <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-medium border ${retailerClass}`}>
          {retailer}
        </span>
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col flex-1 gap-2">
        {/* Product name */}
        <h4 className="text-sm font-medium text-white/85 leading-snug line-clamp-2 min-h-[2.5rem]">
          {result.productName}
        </h4>

        {/* Price */}
        <div className="text-xl font-bold text-white">
          {result.currency === 'USD' ? '$' : result.currency}
          {(result.price ?? 0).toFixed(2)}
        </div>

        {/* Rating */}
        <StarRating rating={result.rating} count={result.reviewCount} />

        {/* Fitment */}
        <FitmentBadge confidence={result.fitmentConfidence} />

        {/* Shipping */}
        {result.shippingEstimate && (
          <p className="text-xs text-white/40">{result.shippingEstimate}</p>
        )}

        {/* Seller */}
        {result.sellerName && (
          <p className="text-[10px] text-white/30">Sold by {result.sellerName}</p>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Buy button */}
        <a
          href={result.productUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 w-full py-2 px-3 rounded-lg bg-accent-red/15 text-accent-red text-sm font-medium text-center
                     hover:bg-accent-red/25 transition-colors duration-200 border border-accent-red/20"
        >
          Buy Now
        </a>
      </div>
    </div>
  )
}
