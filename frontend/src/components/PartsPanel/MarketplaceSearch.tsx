import { useState, useEffect, useRef, useCallback } from 'react'
import { searchParts, analyzeUpgrade, type PartSearchResult, type UpgradeAnalysis } from '../../api/marketplace'

interface MarketplaceSearchProps {
  partName: string
  partSlug: string
  generation: string
}

/* ─── Animated stat bar for upgrade impact ─── */
function ImpactBar({
  label,
  range,
  unit,
  color,
  isNegativeGood = false,
}: {
  label: string
  range: [number, number]
  unit: string
  color: string
  isNegativeGood?: boolean
}) {
  const avg = (range[0] + range[1]) / 2
  const isPositive = isNegativeGood ? avg < 0 : avg > 0
  const absMax = Math.max(Math.abs(range[0]), Math.abs(range[1]))
  const barWidth = Math.min(absMax * 3, 100) // scale

  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 2 }}>
        <span style={{ color: 'rgba(255,255,255,0.6)', fontFamily: "'DM Mono', monospace" }}>{label}</span>
        <span
          style={{
            color: isPositive ? 'rgba(34,197,94,0.9)' : 'rgba(239,68,68,0.9)',
            fontFamily: "'DM Mono', monospace",
            fontWeight: 700,
          }}
        >
          {range[0] >= 0 ? '+' : ''}{range[0]} to {range[1] >= 0 ? '+' : ''}{range[1]} {unit}
        </span>
      </div>
      <div
        style={{
          height: 4,
          borderRadius: 2,
          background: 'rgba(255,255,255,0.06)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${barWidth}%`,
            borderRadius: 2,
            background: `linear-gradient(90deg, ${color}, ${isPositive ? 'rgba(34,197,94,0.7)' : 'rgba(239,68,68,0.7)'})`,
            animation: 'barGrow 0.6s ease-out forwards',
            transformOrigin: 'left',
          }}
        />
      </div>
    </div>
  )
}

/* ─── Analysis panel ─── */
function AnalysisPanel({ analysis }: { analysis: UpgradeAnalysis }) {
  const confidenceColors = {
    high: 'rgba(34,197,94,0.9)',
    medium: 'rgba(245,197,24,0.9)',
    low: 'rgba(239,68,68,0.9)',
  }
  const difficultyColors = {
    'bolt-on': 'rgba(34,197,94,0.9)',
    moderate: 'rgba(245,197,24,0.9)',
    advanced: 'rgba(255,140,50,0.9)',
    professional: 'rgba(239,68,68,0.9)',
  }

  return (
    <div
      style={{
        padding: '12px 14px',
        background: 'rgba(0,0,0,0.3)',
        borderTop: '1px solid rgba(196,30,42,0.2)',
        animation: 'slideDown 0.3s ease-out',
      }}
    >
      {/* Summary */}
      <p
        style={{
          margin: '0 0 10px 0',
          fontSize: 11,
          color: 'rgba(255,255,255,0.8)',
          lineHeight: 1.5,
          fontFamily: "'DM Mono', monospace",
        }}
      >
        {analysis.summary}
      </p>

      {/* Impact bars */}
      <ImpactBar label="HP Gain" range={analysis.estimatedHpGain} unit="HP" color="rgba(196,30,42,0.7)" />
      <ImpactBar label="Torque" range={analysis.estimatedTorqueGain} unit="lb-ft" color="rgba(255,140,50,0.7)" />
      <ImpactBar
        label="Weight"
        range={analysis.estimatedWeightChange}
        unit="lbs"
        color="rgba(100,150,255,0.7)"
        isNegativeGood
      />
      <ImpactBar
        label="0-60"
        range={analysis.estimatedZeroToSixtyChange}
        unit="s"
        color="rgba(245,197,24,0.7)"
        isNegativeGood
      />

      {/* Badges */}
      <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
        <span
          style={{
            fontSize: 9,
            fontFamily: "'DM Mono', monospace",
            padding: '3px 8px',
            borderRadius: 10,
            background: 'rgba(255,255,255,0.06)',
            border: `1px solid ${confidenceColors[analysis.confidence]}`,
            color: confidenceColors[analysis.confidence],
            fontWeight: 600,
          }}
        >
          {analysis.confidence.toUpperCase()} CONFIDENCE
        </span>
        <span
          style={{
            fontSize: 9,
            fontFamily: "'DM Mono', monospace",
            padding: '3px 8px',
            borderRadius: 10,
            background: 'rgba(255,255,255,0.06)',
            border: `1px solid ${difficultyColors[analysis.difficulty]}`,
            color: difficultyColors[analysis.difficulty],
            fontWeight: 600,
          }}
        >
          {analysis.difficulty.toUpperCase()}
        </span>
        <span
          style={{
            fontSize: 9,
            fontFamily: "'DM Mono', monospace",
            padding: '3px 8px',
            borderRadius: 10,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: 'rgba(255,255,255,0.6)',
          }}
        >
          {analysis.installTime}
        </span>
      </div>

      {/* Pros / Cons */}
      <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
        {analysis.pros.length > 0 && (
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 9, color: 'rgba(34,197,94,0.8)', fontWeight: 700, marginBottom: 4, fontFamily: "'DM Mono', monospace" }}>
              PROS
            </div>
            {analysis.pros.map((p, i) => (
              <div key={i} style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, fontFamily: "'DM Mono', monospace" }}>
                + {p}
              </div>
            ))}
          </div>
        )}
        {analysis.cons.length > 0 && (
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 9, color: 'rgba(239,68,68,0.8)', fontWeight: 700, marginBottom: 4, fontFamily: "'DM Mono', monospace" }}>
              CONS
            </div>
            {analysis.cons.map((c, i) => (
              <div key={i} style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, fontFamily: "'DM Mono', monospace" }}>
                - {c}
              </div>
            ))}
          </div>
        )}
      </div>

      {analysis.compatibilityNotes && (
        <div
          style={{
            marginTop: 8,
            fontSize: 9,
            color: 'rgba(245,197,24,0.7)',
            fontFamily: "'DM Mono', monospace",
            lineHeight: 1.5,
          }}
        >
          Note: {analysis.compatibilityNotes}
        </div>
      )}
    </div>
  )
}

/* ─── Product card ─── */
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

  return (
    <div
      style={{
        borderRadius: 10,
        overflow: 'hidden',
        background: hovered
          ? 'rgba(255,255,255,0.05)'
          : 'rgba(255,255,255,0.025)',
        border: `1px solid ${hovered ? 'rgba(196,30,42,0.5)' : 'rgba(255,255,255,0.06)'}`,
        transition: 'all 0.25s ease',
        transform: hovered ? 'translateY(-1px)' : 'translateY(0)',
        boxShadow: hovered
          ? '0 4px 20px rgba(196,30,42,0.15), 0 0 0 1px rgba(196,30,42,0.1)'
          : '0 1px 3px rgba(0,0,0,0.2)',
        animation: `cardFadeIn 0.3s ease-out ${index * 0.06}s both`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <a
        href={result.url}
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: 'none', display: 'block', color: 'inherit' }}
      >
        <div style={{ display: 'flex', padding: 12, gap: 12 }}>
          {/* Thumbnail */}
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 8,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.06)',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            {result.imageUrl ? (
              <img
                src={result.imageUrl}
                alt=""
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: 7,
                }}
                onError={(e) => {
                  const target = e.currentTarget
                  target.style.display = 'none'
                  if (target.nextElementSibling) {
                    ;(target.nextElementSibling as HTMLElement).style.display = 'flex'
                  }
                }}
              />
            ) : null}
            <div
              style={{
                display: result.imageUrl ? 'none' : 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100%',
                flexDirection: 'column',
                gap: 4,
              }}
            >
              {faviconUrl && (
                <img
                  src={faviconUrl}
                  alt=""
                  style={{ width: 20, height: 20, borderRadius: 4, opacity: 0.6 }}
                  onError={(e) => { e.currentTarget.style.display = 'none' }}
                />
              )}
              <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.25)', fontFamily: "'DM Mono', monospace" }}>
                {result.source || 'Product'}
              </span>
            </div>
          </div>

          {/* Details */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Title */}
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: '#fff',
                lineHeight: 1.4,
                marginBottom: 4,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {result.name || 'Untitled Product'}
            </div>

            {/* Description */}
            {result.description && (
              <div
                style={{
                  fontSize: 10,
                  color: 'rgba(255,255,255,0.45)',
                  lineHeight: 1.4,
                  marginBottom: 6,
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

            {/* Price + Source + Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              {result.price != null && (
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 800,
                    color: 'rgba(34,197,94,1)',
                    fontFamily: "'DM Mono', monospace",
                    textShadow: '0 0 12px rgba(34,197,94,0.3)',
                  }}
                >
                  ${typeof result.price === 'number' ? result.price.toFixed(2) : result.price}
                </span>
              )}
              {result.source && (
                <span
                  style={{
                    fontSize: 9,
                    fontFamily: "'DM Mono', monospace",
                    padding: '2px 6px',
                    borderRadius: 6,
                    background: 'rgba(255,255,255,0.05)',
                    color: 'rgba(255,255,255,0.4)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  {result.source}
                </span>
              )}
              <span style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
                &#8599;
              </span>
            </div>
          </div>
        </div>
      </a>

      {/* Analyze button */}
      <div style={{ padding: '0 12px 10px 12px' }}>
        <button
          onClick={handleAnalyze}
          disabled={analyzing}
          style={{
            width: '100%',
            padding: '6px 0',
            borderRadius: 6,
            border: `1px solid ${analyzing ? 'rgba(196,30,42,0.3)' : 'rgba(196,30,42,0.4)'}`,
            background: analyzing
              ? 'rgba(196,30,42,0.08)'
              : analysis
                ? 'rgba(196,30,42,0.12)'
                : 'rgba(196,30,42,0.06)',
            color: analyzing ? 'rgba(196,30,42,0.6)' : 'rgba(196,30,42,0.9)',
            fontSize: 10,
            fontWeight: 700,
            fontFamily: "'DM Mono', monospace",
            cursor: analyzing ? 'wait' : 'pointer',
            transition: 'all 0.2s ease',
            letterSpacing: '0.5px',
          }}
          onMouseEnter={(e) => {
            if (!analyzing) {
              e.currentTarget.style.background = 'rgba(196,30,42,0.15)'
              e.currentTarget.style.borderColor = 'rgba(196,30,42,0.6)'
            }
          }}
          onMouseLeave={(e) => {
            if (!analyzing) {
              e.currentTarget.style.background = analysis ? 'rgba(196,30,42,0.12)' : 'rgba(196,30,42,0.06)'
              e.currentTarget.style.borderColor = 'rgba(196,30,42,0.4)'
            }
          }}
        >
          {analyzing ? (
            <span style={{ animation: 'rpgPulse 1.5s ease-in-out infinite' }}>
              ANALYZING...
            </span>
          ) : analysis ? (
            expanded ? 'HIDE ANALYSIS' : 'SHOW ANALYSIS'
          ) : (
            'ANALYZE UPGRADE'
          )}
        </button>
      </div>

      {/* Analysis panel */}
      {expanded && analysis && <AnalysisPanel analysis={analysis} />}

      {/* Analyzing skeleton */}
      {expanded && analyzing && !analysis && (
        <div style={{ padding: '16px 14px', borderTop: '1px solid rgba(196,30,42,0.2)' }}>
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              style={{
                height: 20,
                borderRadius: 4,
                background: 'rgba(255,255,255,0.04)',
                marginBottom: 8,
                animation: 'shimmer 1.5s ease-in-out infinite',
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
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 12,
        padding: 14,
        background: 'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(0,0,0,0.1) 100%)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: loading ? 'rgba(245,197,24,0.8)' : 'rgba(34,197,94,0.6)',
            boxShadow: loading ? '0 0 8px rgba(245,197,24,0.4)' : '0 0 8px rgba(34,197,94,0.2)',
            animation: loading ? 'rpgPulse 1.5s ease-in-out infinite' : undefined,
          }}
        />
        <h4
          style={{
            margin: 0,
            fontSize: 12,
            fontWeight: 700,
            color: '#fff',
            fontFamily: "'DM Mono', monospace",
            letterSpacing: '1px',
          }}
        >
          FIND UPGRADES
        </h4>
        {hasSearched && !loading && (
          <span
            style={{
              marginLeft: 'auto',
              fontSize: 9,
              fontFamily: "'DM Mono', monospace",
              color: 'rgba(255,255,255,0.3)',
            }}
          >
            {results.length} result{results.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Search bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '7px 12px',
          borderRadius: 8,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.1)',
          marginBottom: 12,
          transition: 'border-color 0.2s',
        }}
      >
        <button
          onClick={() => doSearch(query)}
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.4)',
            fontSize: 13,
            cursor: 'pointer',
            padding: 0,
            lineHeight: 1,
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
          placeholder="Search aftermarket parts..."
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#fff',
            fontSize: 11,
            fontFamily: "'DM Mono', monospace",
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
        {loading && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div
              style={{
                width: 24,
                height: 24,
                border: '2px solid rgba(196,30,42,0.2)',
                borderTop: '2px solid rgba(196,30,42,0.8)',
                borderRadius: '50%',
                margin: '0 auto 8px',
                animation: 'spin 0.8s linear infinite',
              }}
            />
            <p
              style={{
                margin: 0,
                fontSize: 10,
                fontFamily: "'DM Mono', monospace",
                color: 'rgba(196,30,42,0.7)',
              }}
            >
              Searching marketplace...
            </p>
          </div>
        )}

        {error && !loading && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
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
                style={{ cursor: 'pointer', textDecoration: 'underline' }}
              >
                Retry
              </span>
            </p>
          </div>
        )}

        {!loading && !error && hasSearched && results.length === 0 && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <p
              style={{
                margin: 0,
                fontSize: 11,
                fontFamily: "'DM Mono', monospace",
                color: 'rgba(255,255,255,0.3)',
                lineHeight: 1.5,
              }}
            >
              No aftermarket parts found.
              <br />
              Try a different search.
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
        @keyframes cardFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDown {
          from { opacity: 0; max-height: 0; }
          to { opacity: 1; max-height: 500px; }
        }
        @keyframes barGrow {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
        @keyframes shimmer {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
