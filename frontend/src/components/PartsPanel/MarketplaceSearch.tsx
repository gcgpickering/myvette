import { useState, useEffect, useRef, useCallback } from 'react'
import { searchParts, analyzeUpgrade, type PartSearchResult, type UpgradeAnalysis } from '../../api/marketplace'

interface MarketplaceSearchProps {
  partName: string
  partSlug: string
  generation: string
}

/* ─── Animated stat bar for upgrade impact (RPG gauge aesthetic) ─── */
function ImpactBar({
  label,
  range,
  unit,
  color,
  accentGlow,
  isNegativeGood = false,
}: {
  label: string
  range: [number, number]
  unit: string
  color: string
  accentGlow: string
  isNegativeGood?: boolean
}) {
  const avg = (range[0] + range[1]) / 2
  const isPositive = isNegativeGood ? avg < 0 : avg > 0
  const absMax = Math.max(Math.abs(range[0]), Math.abs(range[1]))
  const barWidth = Math.min(absMax * 3, 100)

  const positiveColor = 'rgba(34,197,94,0.95)'
  const negativeColor = 'rgba(239,68,68,0.95)'
  const fillColor = isPositive ? positiveColor : negativeColor

  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 3 }}>
        <span style={{
          color: 'rgba(255,255,255,0.55)',
          fontFamily: "'DM Mono', monospace",
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          fontSize: 9,
        }}>{label}</span>
        <span
          style={{
            color: fillColor,
            fontFamily: "'DM Mono', monospace",
            fontWeight: 700,
            fontSize: 10,
            textShadow: `0 0 8px ${fillColor}`,
          }}
        >
          {range[0] >= 0 ? '+' : ''}{range[0]} to {range[1] >= 0 ? '+' : ''}{range[1]} {unit}
        </span>
      </div>
      <div
        style={{
          height: 5,
          borderRadius: 3,
          background: 'rgba(255,255,255,0.04)',
          overflow: 'hidden',
          position: 'relative',
          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.3)',
        }}
      >
        {/* Track glow */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 3,
            background: `linear-gradient(90deg, transparent, ${accentGlow}08)`,
          }}
        />
        {/* Fill bar */}
        <div
          style={{
            height: '100%',
            width: `${barWidth}%`,
            borderRadius: 3,
            background: `linear-gradient(90deg, ${color}, ${fillColor})`,
            boxShadow: `0 0 12px ${fillColor}, 0 0 4px ${fillColor}`,
            animation: 'hudBarGrow 0.8s cubic-bezier(0.16,1,0.3,1) forwards',
            transformOrigin: 'left',
          }}
        />
      </div>
    </div>
  )
}

/* ─── Analysis panel (cockpit readout style) ─── */
function AnalysisPanel({ analysis }: { analysis: UpgradeAnalysis }) {
  const confidenceColors: Record<string, string> = {
    high: 'rgba(34,197,94,0.95)',
    medium: 'rgba(245,197,24,0.95)',
    low: 'rgba(239,68,68,0.95)',
  }
  const difficultyColors: Record<string, string> = {
    'bolt-on': 'rgba(34,197,94,0.95)',
    moderate: 'rgba(245,197,24,0.95)',
    advanced: 'rgba(255,140,50,0.95)',
    professional: 'rgba(239,68,68,0.95)',
  }

  return (
    <div
      style={{
        padding: '14px 16px',
        background: 'linear-gradient(180deg, rgba(196,30,42,0.04) 0%, rgba(0,0,0,0.4) 100%)',
        borderTop: '1px solid rgba(196,30,42,0.15)',
        backdropFilter: 'blur(8px)',
        animation: 'hudSlideDown 0.4s cubic-bezier(0.16,1,0.3,1)',
      }}
    >
      {/* Summary */}
      <p
        style={{
          margin: '0 0 12px 0',
          fontSize: 11,
          color: 'rgba(255,255,255,0.85)',
          lineHeight: 1.6,
          fontFamily: "'DM Mono', monospace",
          borderLeft: '2px solid rgba(196,30,42,0.5)',
          paddingLeft: 10,
        }}
      >
        {analysis.summary}
      </p>

      {/* Impact bars */}
      <ImpactBar label="Horsepower" range={analysis.estimatedHpGain} unit="HP" color="rgba(196,30,42,0.6)" accentGlow="rgba(196,30,42,1)" />
      <ImpactBar label="Torque" range={analysis.estimatedTorqueGain} unit="lb-ft" color="rgba(255,140,50,0.5)" accentGlow="rgba(255,140,50,1)" />
      <ImpactBar
        label="Weight"
        range={analysis.estimatedWeightChange}
        unit="lbs"
        color="rgba(100,150,255,0.5)"
        accentGlow="rgba(100,150,255,1)"
        isNegativeGood
      />
      <ImpactBar
        label="0-60 Time"
        range={analysis.estimatedZeroToSixtyChange}
        unit="s"
        color="rgba(245,197,24,0.5)"
        accentGlow="rgba(245,197,24,1)"
        isNegativeGood
      />

      {/* Badges row */}
      <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
        {[
          { label: `${analysis.confidence.toUpperCase()} CONFIDENCE`, color: confidenceColors[analysis.confidence] },
          { label: analysis.difficulty.toUpperCase(), color: difficultyColors[analysis.difficulty] },
          { label: analysis.installTime, color: 'rgba(255,255,255,0.5)' },
        ].map((badge) => (
          <span
            key={badge.label}
            style={{
              fontSize: 8,
              fontFamily: "'DM Mono', monospace",
              fontWeight: 700,
              letterSpacing: '0.06em',
              padding: '3px 8px',
              borderRadius: 8,
              background: 'rgba(255,255,255,0.03)',
              border: `1px solid ${badge.color}40`,
              color: badge.color,
              textShadow: `0 0 6px ${badge.color}40`,
            }}
          >
            {badge.label}
          </span>
        ))}
      </div>

      {/* Pros / Cons */}
      <div style={{ display: 'flex', gap: 14, marginTop: 12 }}>
        {analysis.pros.length > 0 && (
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: 8,
              color: 'rgba(34,197,94,0.7)',
              fontWeight: 700,
              marginBottom: 4,
              fontFamily: "'DM Mono', monospace",
              letterSpacing: '0.08em',
            }}>
              ADVANTAGES
            </div>
            {analysis.pros.map((p, i) => (
              <div key={i} style={{
                fontSize: 10,
                color: 'rgba(255,255,255,0.6)',
                lineHeight: 1.7,
                fontFamily: "'DM Mono', monospace",
                paddingLeft: 8,
                borderLeft: '1px solid rgba(34,197,94,0.2)',
                marginBottom: 2,
              }}>
                {p}
              </div>
            ))}
          </div>
        )}
        {analysis.cons.length > 0 && (
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: 8,
              color: 'rgba(239,68,68,0.7)',
              fontWeight: 700,
              marginBottom: 4,
              fontFamily: "'DM Mono', monospace",
              letterSpacing: '0.08em',
            }}>
              TRADE-OFFS
            </div>
            {analysis.cons.map((c, i) => (
              <div key={i} style={{
                fontSize: 10,
                color: 'rgba(255,255,255,0.6)',
                lineHeight: 1.7,
                fontFamily: "'DM Mono', monospace",
                paddingLeft: 8,
                borderLeft: '1px solid rgba(239,68,68,0.2)',
                marginBottom: 2,
              }}>
                {c}
              </div>
            ))}
          </div>
        )}
      </div>

      {analysis.compatibilityNotes && (
        <div
          style={{
            marginTop: 10,
            fontSize: 9,
            color: 'rgba(245,197,24,0.7)',
            fontFamily: "'DM Mono', monospace",
            lineHeight: 1.5,
            padding: '6px 8px',
            background: 'rgba(245,197,24,0.04)',
            borderRadius: 6,
            border: '1px solid rgba(245,197,24,0.1)',
          }}
        >
          ⚠ {analysis.compatibilityNotes}
        </div>
      )}
    </div>
  )
}

/* ─── Shimmer skeleton for loading states ─── */
function ShimmerCard({ index }: { index: number }) {
  return (
    <div
      style={{
        borderRadius: 12,
        overflow: 'hidden',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.04)',
        padding: 14,
        display: 'flex',
        gap: 12,
        animation: `hudCardFadeIn 0.3s ease-out ${index * 0.08}s both`,
      }}
    >
      {/* Thumbnail shimmer */}
      <div
        style={{
          width: 88,
          height: 88,
          borderRadius: 10,
          background: 'linear-gradient(110deg, rgba(255,255,255,0.02) 30%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.02) 70%)',
          backgroundSize: '200% 100%',
          animation: 'hudShimmer 1.8s ease-in-out infinite',
          flexShrink: 0,
        }}
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{
          height: 14,
          borderRadius: 4,
          width: '80%',
          background: 'linear-gradient(110deg, rgba(255,255,255,0.03) 30%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.03) 70%)',
          backgroundSize: '200% 100%',
          animation: 'hudShimmer 1.8s ease-in-out infinite',
          animationDelay: '0.1s',
        }} />
        <div style={{
          height: 10,
          borderRadius: 3,
          width: '60%',
          background: 'linear-gradient(110deg, rgba(255,255,255,0.02) 30%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.02) 70%)',
          backgroundSize: '200% 100%',
          animation: 'hudShimmer 1.8s ease-in-out infinite',
          animationDelay: '0.2s',
        }} />
        <div style={{
          height: 18,
          borderRadius: 4,
          width: '35%',
          marginTop: 'auto',
          background: 'linear-gradient(110deg, rgba(34,197,94,0.04) 30%, rgba(34,197,94,0.08) 50%, rgba(34,197,94,0.04) 70%)',
          backgroundSize: '200% 100%',
          animation: 'hudShimmer 1.8s ease-in-out infinite',
          animationDelay: '0.3s',
        }} />
      </div>
    </div>
  )
}

/* ─── Product card (glass cockpit aesthetic) ─── */
function ProductCard({
  result,
  index,
  generation,
  partSlug,
}: {
  result: PartSearchResult
  index: number
  generation: string
  partSlug: string
}) {
  const [hovered, setHovered] = useState(false)
  const [analysis, setAnalysis] = useState<UpgradeAnalysis | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const handleAnalyze = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (analysis) {
      setExpanded(!expanded)
      return
    }

    setAnalyzing(true)
    setExpanded(true)
    try {
      const data = await analyzeUpgrade(
        generation,
        partSlug,
        result.name || 'Unknown Part',
        result.description || '',
        result.price != null ? String(result.price) : undefined,
      )
      setAnalysis(data)
    } catch {
      setAnalysis(null)
      setExpanded(false)
    } finally {
      setAnalyzing(false)
    }
  }

  const faviconUrl = result.source
    ? `https://www.google.com/s2/favicons?domain=${result.source}&sz=32`
    : null

  const hasImage = !!result.imageUrl

  return (
    <div
      style={{
        borderRadius: 12,
        overflow: 'hidden',
        position: 'relative',
        background: hovered
          ? 'rgba(255,255,255,0.045)'
          : 'rgba(255,255,255,0.02)',
        border: `1px solid ${hovered ? 'rgba(196,30,42,0.45)' : 'rgba(255,255,255,0.05)'}`,
        transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hovered
          ? '0 8px 32px rgba(196,30,42,0.12), 0 0 0 1px rgba(196,30,42,0.08), inset 0 1px 0 rgba(255,255,255,0.04)'
          : '0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.02)',
        backdropFilter: 'blur(12px)',
        animation: `hudCardFadeIn 0.4s cubic-bezier(0.16,1,0.3,1) ${index * 0.07}s both`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Hover gradient sweep overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: hovered
            ? 'linear-gradient(135deg, rgba(196,30,42,0.06) 0%, transparent 40%, rgba(196,30,42,0.03) 100%)'
            : 'none',
          transition: 'background 0.3s ease',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      <a
        href={result.url}
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: 'none', display: 'block', color: 'inherit', position: 'relative', zIndex: 2 }}
      >
        <div style={{ display: 'flex', padding: 14, gap: 14 }}>
          {/* Thumbnail */}
          <div
            style={{
              width: hasImage ? 88 : 64,
              height: hasImage ? 88 : 64,
              borderRadius: 10,
              background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
              border: '1px solid rgba(255,255,255,0.06)',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              position: 'relative',
              transition: 'all 0.3s ease',
            }}
          >
            {result.imageUrl ? (
              <>
                <img
                  src={result.imageUrl}
                  alt=""
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: 9,
                    transition: 'transform 0.4s cubic-bezier(0.16,1,0.3,1)',
                    transform: hovered ? 'scale(1.05)' : 'scale(1)',
                  }}
                  onError={(e) => {
                    const target = e.currentTarget
                    target.style.display = 'none'
                    if (target.nextElementSibling) {
                      ;(target.nextElementSibling as HTMLElement).style.display = 'flex'
                    }
                  }}
                />
                {/* Image gradient overlay */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: 9,
                  background: 'linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.4) 100%)',
                  pointerEvents: 'none',
                }} />
              </>
            ) : null}
            <div
              style={{
                display: result.imageUrl ? 'none' : 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100%',
                flexDirection: 'column',
                gap: 6,
              }}
            >
              {faviconUrl && (
                <img
                  src={faviconUrl}
                  alt=""
                  style={{ width: 22, height: 22, borderRadius: 5, opacity: 0.5, filter: 'grayscale(0.3)' }}
                  onError={(e) => { e.currentTarget.style.display = 'none' }}
                />
              )}
              <span style={{
                fontSize: 7,
                color: 'rgba(255,255,255,0.2)',
                fontFamily: "'DM Mono', monospace",
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}>
                {result.source || 'Product'}
              </span>
            </div>
          </div>

          {/* Details */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            {/* Title */}
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: hovered ? '#fff' : 'rgba(255,255,255,0.9)',
                lineHeight: 1.4,
                marginBottom: 4,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                transition: 'color 0.2s ease',
              }}
            >
              {result.name || 'Untitled Product'}
            </div>

            {/* Description */}
            {result.description && (
              <div
                style={{
                  fontSize: 10,
                  color: 'rgba(255,255,255,0.4)',
                  lineHeight: 1.5,
                  marginBottom: 8,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  fontFamily: "'DM Mono', monospace",
                }}
              >
                {result.description}
              </div>
            )}

            {/* Price + Source row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 'auto', flexWrap: 'wrap' }}>
              {result.price != null && (
                <span
                  style={{
                    fontSize: 15,
                    fontWeight: 800,
                    color: 'rgba(34,197,94,1)',
                    fontFamily: "'DM Mono', monospace",
                    textShadow: '0 0 16px rgba(34,197,94,0.35), 0 0 4px rgba(34,197,94,0.2)',
                    letterSpacing: '-0.02em',
                  }}
                >
                  ${typeof result.price === 'number' ? result.price.toFixed(2) : result.price}
                </span>
              )}
              {result.source && (
                <span
                  style={{
                    fontSize: 8,
                    fontFamily: "'DM Mono', monospace",
                    fontWeight: 600,
                    letterSpacing: '0.04em',
                    padding: '2px 7px',
                    borderRadius: 6,
                    background: 'rgba(255,255,255,0.04)',
                    color: 'rgba(255,255,255,0.35)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  {faviconUrl && (
                    <img
                      src={faviconUrl}
                      alt=""
                      style={{ width: 10, height: 10, borderRadius: 2, opacity: 0.6 }}
                      onError={(e) => { e.currentTarget.style.display = 'none' }}
                    />
                  )}
                  {result.source}
                </span>
              )}
              <span style={{
                marginLeft: 'auto',
                color: hovered ? 'rgba(196,30,42,0.7)' : 'rgba(255,255,255,0.2)',
                fontSize: 14,
                transition: 'color 0.2s ease',
              }}>
                &#8599;
              </span>
            </div>
          </div>
        </div>
      </a>

      {/* Analyze button */}
      <div style={{ padding: '0 14px 12px 14px', position: 'relative', zIndex: 2 }}>
        <button
          onClick={handleAnalyze}
          disabled={analyzing}
          style={{
            width: '100%',
            padding: '7px 0',
            borderRadius: 8,
            border: `1px solid ${analyzing ? 'rgba(196,30,42,0.2)' : 'rgba(196,30,42,0.35)'}`,
            background: analyzing
              ? 'rgba(196,30,42,0.06)'
              : analysis
                ? 'linear-gradient(135deg, rgba(196,30,42,0.1) 0%, rgba(196,30,42,0.06) 100%)'
                : 'rgba(196,30,42,0.04)',
            color: analyzing ? 'rgba(196,30,42,0.5)' : 'rgba(196,30,42,0.9)',
            fontSize: 9,
            fontWeight: 700,
            fontFamily: "'DM Mono', monospace",
            cursor: analyzing ? 'wait' : 'pointer',
            transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)',
            letterSpacing: '0.08em',
            textShadow: analyzing ? 'none' : '0 0 8px rgba(196,30,42,0.2)',
          }}
          onMouseEnter={(e) => {
            if (!analyzing) {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(196,30,42,0.18) 0%, rgba(196,30,42,0.1) 100%)'
              e.currentTarget.style.borderColor = 'rgba(196,30,42,0.6)'
              e.currentTarget.style.boxShadow = '0 0 16px rgba(196,30,42,0.15)'
            }
          }}
          onMouseLeave={(e) => {
            if (!analyzing) {
              e.currentTarget.style.background = analysis
                ? 'linear-gradient(135deg, rgba(196,30,42,0.1) 0%, rgba(196,30,42,0.06) 100%)'
                : 'rgba(196,30,42,0.04)'
              e.currentTarget.style.borderColor = 'rgba(196,30,42,0.35)'
              e.currentTarget.style.boxShadow = 'none'
            }
          }}
        >
          {analyzing ? (
            <span style={{ animation: 'hudPulse 1.5s ease-in-out infinite' }}>
              ANALYZING UPGRADE...
            </span>
          ) : analysis ? (
            expanded ? '▲ HIDE ANALYSIS' : '▼ SHOW ANALYSIS'
          ) : (
            'ANALYZE UPGRADE ›'
          )}
        </button>
      </div>

      {/* Analysis panel */}
      {expanded && analysis && <AnalysisPanel analysis={analysis} />}

      {/* Analyzing skeleton */}
      {expanded && analyzing && !analysis && (
        <div style={{ padding: '16px 16px', borderTop: '1px solid rgba(196,30,42,0.15)' }}>
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              style={{
                height: 18,
                borderRadius: 4,
                background: 'linear-gradient(110deg, rgba(196,30,42,0.03) 30%, rgba(196,30,42,0.06) 50%, rgba(196,30,42,0.03) 70%)',
                backgroundSize: '200% 100%',
                marginBottom: 8,
                animation: 'hudShimmer 1.8s ease-in-out infinite',
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── Main component ─── */
export function MarketplaceSearch({ partName, partSlug, generation }: MarketplaceSearchProps) {
  const [query, setQuery] = useState(partName)
  const [results, setResults] = useState<PartSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const requestIdRef = useRef(0)

  const doSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) return
    const id = ++requestIdRef.current
    setLoading(true)
    setError(null)

    try {
      const data = await searchParts(searchQuery, generation, partSlug, 8)
      if (id !== requestIdRef.current) return
      setResults(data)
      setHasSearched(true)
    } catch {
      if (id !== requestIdRef.current) return
      setError('Search failed')
      setResults([])
    } finally {
      if (id === requestIdRef.current) setLoading(false)
    }
  }, [generation, partSlug])

  useEffect(() => {
    setQuery(partName)
    doSearch(partName)
  }, [partName, generation, doSearch])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') doSearch(query)
  }

  return (
    <div
      style={{
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 14,
        padding: 16,
        background: 'linear-gradient(180deg, rgba(255,255,255,0.018) 0%, rgba(0,0,0,0.15) 100%)',
        backdropFilter: 'blur(16px)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle top accent line */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: '10%',
        right: '10%',
        height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(196,30,42,0.2), transparent)',
      }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: loading ? 'rgba(245,197,24,0.9)' : 'rgba(34,197,94,0.7)',
            boxShadow: loading
              ? '0 0 10px rgba(245,197,24,0.5), 0 0 3px rgba(245,197,24,0.3)'
              : '0 0 10px rgba(34,197,94,0.3)',
            animation: loading ? 'hudPulse 1.5s ease-in-out infinite' : undefined,
            transition: 'all 0.3s ease',
          }}
        />
        <h4
          style={{
            margin: 0,
            fontSize: 11,
            fontWeight: 700,
            color: 'rgba(255,255,255,0.85)',
            fontFamily: "'DM Mono', monospace",
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}
        >
          FIND UPGRADES
        </h4>
        {hasSearched && !loading && (
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            {(() => {
              const sources = new Set(results.map(r => r.source).filter(Boolean))
              if (sources.size > 1) {
                return (
                  <span style={{
                    fontSize: 8,
                    fontFamily: "'DM Mono', monospace",
                    color: 'rgba(196,30,42,0.7)',
                    letterSpacing: '0.06em',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: 4,
                    background: 'rgba(196,30,42,0.06)',
                    border: '1px solid rgba(196,30,42,0.15)',
                  }}>
                    {sources.size} RETAILERS
                  </span>
                )
              }
              return null
            })()}
            <span
              style={{
                fontSize: 9,
                fontFamily: "'DM Mono', monospace",
                color: 'rgba(255,255,255,0.25)',
                letterSpacing: '0.04em',
              }}
            >
              {results.length} result{results.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* Search bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '8px 14px',
          borderRadius: 10,
          background: searchFocused ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.03)',
          border: `1px solid ${searchFocused ? 'rgba(196,30,42,0.4)' : 'rgba(255,255,255,0.08)'}`,
          marginBottom: 14,
          transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)',
          boxShadow: searchFocused ? '0 0 16px rgba(196,30,42,0.08), inset 0 1px 0 rgba(255,255,255,0.03)' : 'none',
        }}
      >
        <button
          onClick={() => doSearch(query)}
          style={{
            background: 'none',
            border: 'none',
            color: searchFocused ? 'rgba(196,30,42,0.7)' : 'rgba(255,255,255,0.3)',
            fontSize: 13,
            cursor: 'pointer',
            padding: 0,
            lineHeight: 1,
            transition: 'color 0.2s ease',
          }}
          aria-label="Search"
        >
          &#128269;
        </button>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          placeholder="Search aftermarket parts..."
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#fff',
            fontSize: 11,
            fontFamily: "'DM Mono', monospace",
            letterSpacing: '0.02em',
          }}
        />
      </div>

      {/* Results area */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        {/* Shimmer loading */}
        {loading && (
          <>
            {[0, 1, 2].map((i) => (
              <ShimmerCard key={i} index={i} />
            ))}
          </>
        )}

        {error && !loading && (
          <div style={{
            textAlign: 'center',
            padding: '24px 0',
            borderRadius: 10,
            background: 'rgba(239,68,68,0.03)',
            border: '1px solid rgba(239,68,68,0.1)',
          }}>
            <p
              style={{
                margin: 0,
                fontSize: 11,
                fontFamily: "'DM Mono', monospace",
                color: 'rgba(239,68,68,0.7)',
              }}
            >
              {error}.{' '}
              <span
                onClick={() => doSearch(query)}
                style={{ cursor: 'pointer', textDecoration: 'underline', color: 'rgba(196,30,42,0.8)' }}
              >
                Retry
              </span>
            </p>
          </div>
        )}

        {!loading && !error && hasSearched && results.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '28px 0',
            borderRadius: 10,
            background: 'rgba(255,255,255,0.015)',
          }}>
            <div style={{
              fontSize: 24,
              marginBottom: 8,
              opacity: 0.3,
            }}>
              &#128270;
            </div>
            <p
              style={{
                margin: 0,
                fontSize: 11,
                fontFamily: "'DM Mono', monospace",
                color: 'rgba(255,255,255,0.3)',
                lineHeight: 1.6,
              }}
            >
              No aftermarket parts found.
              <br />
              Try a different search term.
            </p>
          </div>
        )}

        {!loading &&
          results.map((r, i) => (
            <ProductCard
              key={`${r.url}-${i}`}
              result={r}
              index={i}
              generation={generation}
              partSlug={partSlug}
            />
          ))}
      </div>

      {/* Animations */}
      <style>{`
        @keyframes hudCardFadeIn {
          from { opacity: 0; transform: translateY(10px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes hudSlideDown {
          from { opacity: 0; max-height: 0; transform: translateY(-4px); }
          to { opacity: 1; max-height: 600px; transform: translateY(0); }
        }
        @keyframes hudBarGrow {
          from { transform: scaleX(0); opacity: 0.5; }
          to { transform: scaleX(1); opacity: 1; }
        }
        @keyframes hudShimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes hudPulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
