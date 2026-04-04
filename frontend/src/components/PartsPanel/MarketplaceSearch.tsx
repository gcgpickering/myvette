import { useState, useEffect, useRef, useCallback } from 'react'
import { searchParts, analyzeUpgrade, type PartSearchResult, type UpgradeAnalysis } from '../../api/marketplace'

interface MarketplaceSearchProps {
  partName: string
  partSlug: string
  generation: string
}

/* ─── Compact impact bar for card-back analysis ─── */
function ImpactBar({
  label,
  range,
  unit,
  color,
  accentGlow,
  isNegativeGood = false,
  compact = false,
}: {
  label: string
  range: [number, number]
  unit: string
  color: string
  accentGlow: string
  isNegativeGood?: boolean
  compact?: boolean
}) {
  const avg = (range[0] + range[1]) / 2
  const isPositive = isNegativeGood ? avg < 0 : avg > 0
  const absMax = Math.max(Math.abs(range[0]), Math.abs(range[1]))
  const barWidth = Math.min(absMax * 3, 100)

  const positiveColor = 'rgba(34,197,94,0.95)'
  const negativeColor = 'rgba(239,68,68,0.95)'
  const fillColor = isPositive ? positiveColor : negativeColor

  return (
    <div style={{ marginBottom: compact ? 3 : 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: compact ? 1 : 3 }}>
        <span style={{
          color: 'rgba(255,255,255,0.55)',
          fontFamily: "'DM Mono', monospace",
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          fontSize: compact ? 7 : 9,
        }}>{label}</span>
        <span style={{
          color: fillColor,
          fontFamily: "'DM Mono', monospace",
          fontWeight: 700,
          fontSize: compact ? 7 : 10,
          textShadow: `0 0 8px ${fillColor}`,
        }}>
          {range[0] >= 0 ? '+' : ''}{range[0]} to {range[1] >= 0 ? '+' : ''}{range[1]} {unit}
        </span>
      </div>
      <div style={{
        height: compact ? 3 : 5,
        borderRadius: 3,
        background: 'rgba(255,255,255,0.04)',
        overflow: 'hidden',
        position: 'relative',
        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.3)',
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 3,
          background: `linear-gradient(90deg, transparent, ${accentGlow}08)`,
        }} />
        <div style={{
          height: '100%',
          width: `${barWidth}%`,
          borderRadius: 3,
          background: `linear-gradient(90deg, ${color}, ${fillColor})`,
          boxShadow: `0 0 12px ${fillColor}, 0 0 4px ${fillColor}`,
          animation: 'hudBarGrow 0.8s cubic-bezier(0.16,1,0.3,1) forwards',
          transformOrigin: 'left',
        }} />
      </div>
    </div>
  )
}

/* ─── Compact analysis for card back ─── */
function CardBackAnalysis({ analysis, onBack }: { analysis: UpgradeAnalysis; onBack: () => void }) {
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
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      padding: '8px 10px',
      background: 'linear-gradient(180deg, rgba(196,30,42,0.06) 0%, rgba(0,0,0,0.5) 100%)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 6,
        paddingBottom: 5,
        borderBottom: '1px solid rgba(196,30,42,0.2)',
      }}>
        <span style={{
          fontSize: 8,
          fontFamily: "'DM Mono', monospace",
          fontWeight: 700,
          letterSpacing: '0.1em',
          color: 'rgba(196,30,42,0.9)',
          textShadow: '0 0 8px rgba(196,30,42,0.3)',
        }}>
          ANALYSIS
        </span>
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onBack() }}
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 4,
            padding: '2px 6px',
            fontSize: 7,
            fontFamily: "'DM Mono', monospace",
            fontWeight: 700,
            color: 'rgba(255,255,255,0.5)',
            cursor: 'pointer',
            letterSpacing: '0.06em',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'rgba(255,255,255,0.9)'
            e.currentTarget.style.borderColor = 'rgba(196,30,42,0.5)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'rgba(255,255,255,0.5)'
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
          }}
        >
          BACK
        </button>
      </div>

      {/* Summary */}
      <p style={{
        margin: '0 0 6px 0',
        fontSize: 8,
        color: 'rgba(255,255,255,0.75)',
        lineHeight: 1.5,
        fontFamily: "'DM Mono', monospace",
        borderLeft: '2px solid rgba(196,30,42,0.4)',
        paddingLeft: 6,
        overflow: 'hidden',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
      }}>
        {analysis.summary}
      </p>

      {/* Impact bars */}
      <div style={{ marginBottom: 4 }}>
        <ImpactBar compact label="HP" range={analysis.estimatedHpGain} unit="HP" color="rgba(196,30,42,0.6)" accentGlow="rgba(196,30,42,1)" />
        <ImpactBar compact label="Torque" range={analysis.estimatedTorqueGain} unit="ft-lb" color="rgba(255,140,50,0.5)" accentGlow="rgba(255,140,50,1)" />
        <ImpactBar compact label="Weight" range={analysis.estimatedWeightChange} unit="lbs" color="rgba(100,150,255,0.5)" accentGlow="rgba(100,150,255,1)" isNegativeGood />
        <ImpactBar compact label="0-60" range={analysis.estimatedZeroToSixtyChange} unit="s" color="rgba(245,197,24,0.5)" accentGlow="rgba(245,197,24,1)" isNegativeGood />
      </div>

      {/* Badges */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 5, flexWrap: 'wrap' }}>
        {[
          { label: analysis.confidence.toUpperCase(), color: confidenceColors[analysis.confidence] },
          { label: analysis.difficulty.toUpperCase(), color: difficultyColors[analysis.difficulty] },
          { label: analysis.installTime, color: 'rgba(255,255,255,0.5)' },
        ].map((badge) => (
          <span key={badge.label} style={{
            fontSize: 6,
            fontFamily: "'DM Mono', monospace",
            fontWeight: 700,
            letterSpacing: '0.06em',
            padding: '2px 5px',
            borderRadius: 4,
            background: 'rgba(255,255,255,0.03)',
            border: `1px solid ${badge.color}40`,
            color: badge.color,
          }}>
            {badge.label}
          </span>
        ))}
      </div>

      {/* Pros / Cons stacked */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {analysis.pros.length > 0 && (
          <div style={{ marginBottom: 3 }}>
            <span style={{
              fontSize: 6,
              color: 'rgba(34,197,94,0.7)',
              fontWeight: 700,
              fontFamily: "'DM Mono', monospace",
              letterSpacing: '0.08em',
            }}>
              PROS
            </span>
            <div style={{
              fontSize: 7,
              color: 'rgba(255,255,255,0.55)',
              lineHeight: 1.5,
              fontFamily: "'DM Mono', monospace",
              paddingLeft: 6,
              borderLeft: '1px solid rgba(34,197,94,0.2)',
              marginTop: 1,
            }}>
              {analysis.pros[0]}
              {analysis.pros.length > 1 && (
                <span style={{ color: 'rgba(255,255,255,0.25)', marginLeft: 4 }}>
                  +{analysis.pros.length - 1} more
                </span>
              )}
            </div>
          </div>
        )}
        {analysis.cons.length > 0 && (
          <div>
            <span style={{
              fontSize: 6,
              color: 'rgba(239,68,68,0.7)',
              fontWeight: 700,
              fontFamily: "'DM Mono', monospace",
              letterSpacing: '0.08em',
            }}>
              CONS
            </span>
            <div style={{
              fontSize: 7,
              color: 'rgba(255,255,255,0.55)',
              lineHeight: 1.5,
              fontFamily: "'DM Mono', monospace",
              paddingLeft: 6,
              borderLeft: '1px solid rgba(239,68,68,0.2)',
              marginTop: 1,
            }}>
              {analysis.cons[0]}
              {analysis.cons.length > 1 && (
                <span style={{ color: 'rgba(255,255,255,0.25)', marginLeft: 4 }}>
                  +{analysis.cons.length - 1} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Compatibility warning */}
      {analysis.compatibilityNotes && (
        <div style={{
          marginTop: 4,
          fontSize: 6,
          color: 'rgba(245,197,24,0.7)',
          fontFamily: "'DM Mono', monospace",
          lineHeight: 1.4,
          padding: '3px 5px',
          background: 'rgba(245,197,24,0.04)',
          borderRadius: 4,
          border: '1px solid rgba(245,197,24,0.1)',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
        }}>
          {analysis.compatibilityNotes}
        </div>
      )}
    </div>
  )
}

/* ─── Portrait shimmer skeleton ─── */
function ShimmerCard({ index }: { index: number }) {
  const row = Math.floor(index / 2)
  const col = index % 2
  const delay = row * 0.08 + col * 0.04

  return (
    <div style={{
      borderRadius: 12,
      overflow: 'hidden',
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.04)',
      height: 280,
      display: 'flex',
      flexDirection: 'column',
      animation: `hudCardFadeIn 0.3s ease-out ${delay}s both`,
    }}>
      {/* Image shimmer */}
      <div style={{
        width: '100%',
        height: '60%',
        background: 'linear-gradient(110deg, rgba(255,255,255,0.02) 30%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.02) 70%)',
        backgroundSize: '200% 100%',
        animation: 'hudShimmer 1.8s ease-in-out infinite',
      }} />
      {/* Details shimmer */}
      <div style={{ padding: 10, flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{
          height: 10,
          borderRadius: 3,
          width: '85%',
          background: 'linear-gradient(110deg, rgba(255,255,255,0.03) 30%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.03) 70%)',
          backgroundSize: '200% 100%',
          animation: 'hudShimmer 1.8s ease-in-out infinite',
          animationDelay: '0.1s',
        }} />
        <div style={{
          height: 8,
          borderRadius: 3,
          width: '60%',
          background: 'linear-gradient(110deg, rgba(255,255,255,0.02) 30%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.02) 70%)',
          backgroundSize: '200% 100%',
          animation: 'hudShimmer 1.8s ease-in-out infinite',
          animationDelay: '0.2s',
        }} />
        <div style={{
          height: 14,
          borderRadius: 3,
          width: '40%',
          marginTop: 'auto',
          background: 'linear-gradient(110deg, rgba(34,197,94,0.04) 30%, rgba(34,197,94,0.08) 50%, rgba(34,197,94,0.04) 70%)',
          backgroundSize: '200% 100%',
          animation: 'hudShimmer 1.8s ease-in-out infinite',
          animationDelay: '0.3s',
        }} />
        <div style={{
          height: 22,
          borderRadius: 6,
          width: '100%',
          background: 'linear-gradient(110deg, rgba(196,30,42,0.03) 30%, rgba(196,30,42,0.06) 50%, rgba(196,30,42,0.03) 70%)',
          backgroundSize: '200% 100%',
          animation: 'hudShimmer 1.8s ease-in-out infinite',
          animationDelay: '0.4s',
        }} />
      </div>
    </div>
  )
}

/* ─── Portrait product card with 3D flip ─── */
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
  const [flipped, setFlipped] = useState(false)

  const row = Math.floor(index / 2)
  const col = index % 2
  const delay = row * 0.08 + col * 0.04

  const handleAnalyze = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (analysis) {
      setFlipped(true)
      return
    }

    setAnalyzing(true)
    setFlipped(true)
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
      setFlipped(false)
    } finally {
      setAnalyzing(false)
    }
  }

  const faviconUrl = result.source
    ? `https://www.google.com/s2/favicons?domain=${result.source}&sz=64`
    : null

  // Part category icons for placeholder
  const categoryIcons: Record<string, string> = {
    engine: '\u2699', exhaust: '\u2B24', 'air-intake': '\u25B2',
    brakes: '\u25C9', suspension: '\u25C6', 'tires-wheels': '\u25CB',
    transmission: '\u2B23', 'turbo-supercharger': '\u27B0',
    'ecu-electronics': '\u26A1', 'fuel-system': '\u2B22',
    'cooling-system': '\u2744', steering: '\u21BA',
    'body-shell': '\u25AD', interior: '\u2B1C', lights: '\u2600', glass: '\u25C7',
  }
  const partIcon = categoryIcons[partSlug] || '\u2699'

  return (
    <div
      style={{
        perspective: '1000px',
        height: 280,
        animation: `hudCardFadeIn 0.4s cubic-bezier(0.16,1,0.3,1) ${delay}s both`,
      }}
    >
      {/* Card inner — rotates on flip */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
        onMouseEnter={() => !flipped && setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* ═══ FRONT FACE ═══ */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: hovered ? 'translateZ(0) translateY(-4px)' : 'translateZ(0)',
            borderRadius: 14,
            overflow: 'hidden',
            background: hovered
              ? 'linear-gradient(165deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 50%, rgba(196,30,42,0.04) 100%)'
              : 'linear-gradient(165deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 50%, rgba(0,0,0,0.1) 100%)',
            border: `1px solid ${hovered ? 'rgba(196,30,42,0.5)' : 'rgba(255,255,255,0.08)'}`,
            transition: 'all 0.35s cubic-bezier(0.16,1,0.3,1)',
            boxShadow: hovered
              ? '0 16px 48px rgba(0,0,0,0.5), 0 8px 24px rgba(196,30,42,0.15), 0 0 0 1px rgba(196,30,42,0.1), inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(0,0,0,0.2)'
              : '0 4px 16px rgba(0,0,0,0.4), 0 1px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05), inset 0 -1px 0 rgba(0,0,0,0.15)',
            backdropFilter: 'blur(20px)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Glass highlight edge (top) */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: '5%',
            right: '5%',
            height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
            zIndex: 3,
            pointerEvents: 'none',
          }} />

          {/* Hover gradient sweep */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: hovered
              ? 'linear-gradient(135deg, rgba(196,30,42,0.08) 0%, transparent 35%, rgba(255,255,255,0.02) 60%, rgba(196,30,42,0.04) 100%)'
              : 'none',
            transition: 'background 0.35s ease',
            pointerEvents: 'none',
            zIndex: 1,
          }} />

          {/* Image area (60%) */}
          <a
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'block',
              width: '100%',
              height: '60%',
              position: 'relative',
              overflow: 'hidden',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
              flexShrink: 0,
              zIndex: 2,
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
                    transition: 'transform 0.4s cubic-bezier(0.16,1,0.3,1)',
                    transform: hovered ? 'scale(1.08)' : 'scale(1)',
                  }}
                  onError={(e) => { e.currentTarget.style.display = 'none' }}
                />
                {/* Bottom gradient overlay */}
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '40%',
                  background: 'linear-gradient(180deg, transparent, rgba(0,0,0,0.6))',
                  pointerEvents: 'none',
                }} />
              </>
            ) : (
              /* Branded placeholder — large retailer logo + part icon */
              <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                background: `radial-gradient(ellipse at 30% 20%, rgba(196,30,42,0.08) 0%, transparent 50%),
                             radial-gradient(ellipse at 70% 80%, rgba(255,255,255,0.03) 0%, transparent 50%),
                             linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0.2) 100%)`,
                position: 'relative',
              }}>
                {/* Large part category icon */}
                <div style={{
                  fontSize: 28,
                  opacity: 0.08,
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  pointerEvents: 'none',
                }}>
                  {partIcon}
                </div>
                {/* Retailer favicon (large) */}
                {faviconUrl && (
                  <img
                    src={faviconUrl}
                    alt=""
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      opacity: 0.6,
                      filter: 'grayscale(0.2)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      background: 'rgba(255,255,255,0.05)',
                      padding: 4,
                    }}
                    onError={(e) => { e.currentTarget.style.display = 'none' }}
                  />
                )}
                <span style={{
                  fontSize: 8,
                  color: 'rgba(255,255,255,0.3)',
                  fontFamily: "'DM Mono', monospace",
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                }}>
                  {result.source || 'Product'}
                </span>
                {/* Subtle scan lines */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.008) 3px, rgba(255,255,255,0.008) 4px)',
                  pointerEvents: 'none',
                }} />
              </div>
            )}

            {/* External link icon overlay */}
            <div style={{
              position: 'absolute',
              top: 6,
              right: 6,
              width: 20,
              height: 20,
              borderRadius: 5,
              background: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'rgba(255,255,255,0.5)',
              fontSize: 10,
              transition: 'color 0.2s ease',
              opacity: hovered ? 1 : 0,
              zIndex: 3,
            }}>
              &#8599;
            </div>
          </a>

          {/* Details area (40%) */}
          <div style={{
            flex: 1,
            padding: '6px 10px 8px',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            zIndex: 2,
            minHeight: 0,
          }}>
            {/* Product name */}
            <div style={{
              fontSize: 10,
              fontWeight: 600,
              color: hovered ? '#fff' : 'rgba(255,255,255,0.9)',
              lineHeight: 1.35,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              transition: 'color 0.2s ease',
              marginBottom: 3,
            }}>
              {result.name || 'Untitled Product'}
            </div>

            {/* Source badge */}
            {result.source && (
              <span style={{
                fontSize: 7,
                fontFamily: "'DM Mono', monospace",
                fontWeight: 600,
                letterSpacing: '0.04em',
                padding: '1px 5px',
                borderRadius: 4,
                background: 'rgba(255,255,255,0.04)',
                color: 'rgba(255,255,255,0.3)',
                border: '1px solid rgba(255,255,255,0.06)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 3,
                alignSelf: 'flex-start',
                marginBottom: 4,
              }}>
                {faviconUrl && (
                  <img
                    src={faviconUrl}
                    alt=""
                    style={{ width: 8, height: 8, borderRadius: 2, opacity: 0.5 }}
                    onError={(e) => { e.currentTarget.style.display = 'none' }}
                  />
                )}
                {result.source}
              </span>
            )}

            {/* Price */}
            <div style={{ marginTop: 'auto' }}>
              {result.price != null ? (
                <span style={{
                  fontSize: 14,
                  fontWeight: 800,
                  color: 'rgba(34,197,94,1)',
                  fontFamily: "'DM Mono', monospace",
                  textShadow: '0 0 16px rgba(34,197,94,0.35), 0 0 4px rgba(34,197,94,0.2)',
                  letterSpacing: '-0.02em',
                }}>
                  ${typeof result.price === 'number' ? result.price.toFixed(2) : result.price}
                </span>
              ) : (
                <span style={{
                  fontSize: 9,
                  color: 'rgba(255,255,255,0.25)',
                  fontFamily: "'DM Mono', monospace",
                }}>
                  Price N/A
                </span>
              )}
            </div>

            {/* Analyze button */}
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              style={{
                width: '100%',
                padding: '5px 0',
                marginTop: 6,
                borderRadius: 6,
                border: '1px solid rgba(196,30,42,0.35)',
                background: analysis
                  ? 'linear-gradient(135deg, rgba(196,30,42,0.1) 0%, rgba(196,30,42,0.06) 100%)'
                  : 'rgba(196,30,42,0.04)',
                color: 'rgba(196,30,42,0.9)',
                fontSize: 8,
                fontWeight: 700,
                fontFamily: "'DM Mono', monospace",
                cursor: analyzing ? 'wait' : 'pointer',
                transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)',
                letterSpacing: '0.08em',
                textShadow: '0 0 8px rgba(196,30,42,0.2)',
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
                <span style={{ animation: 'hudPulse 1.5s ease-in-out infinite' }}>ANALYZING...</span>
              ) : analysis ? (
                'VIEW ANALYSIS'
              ) : (
                'ANALYZE'
              )}
            </button>
          </div>
        </div>

        {/* ═══ BACK FACE ═══ */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg) translateZ(0)',
            borderRadius: 14,
            overflow: 'hidden',
            background: 'linear-gradient(165deg, rgba(196,30,42,0.06) 0%, rgba(255,255,255,0.02) 30%, rgba(0,0,0,0.3) 100%)',
            border: '1px solid rgba(196,30,42,0.35)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.5), 0 4px 16px rgba(196,30,42,0.12), inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -1px 0 rgba(0,0,0,0.2)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {flipped && analyzing && !analysis ? (
            /* Analyzing skeleton */
            <div style={{ padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 6, height: '100%' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingBottom: 5,
                borderBottom: '1px solid rgba(196,30,42,0.15)',
              }}>
                <span style={{
                  fontSize: 8,
                  fontFamily: "'DM Mono', monospace",
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  color: 'rgba(196,30,42,0.9)',
                  animation: 'hudPulse 1.5s ease-in-out infinite',
                }}>
                  ANALYZING...
                </span>
              </div>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} style={{
                  height: 14,
                  borderRadius: 3,
                  background: 'linear-gradient(110deg, rgba(196,30,42,0.03) 30%, rgba(196,30,42,0.06) 50%, rgba(196,30,42,0.03) 70%)',
                  backgroundSize: '200% 100%',
                  animation: 'hudShimmer 1.8s ease-in-out infinite',
                  animationDelay: `${i * 0.15}s`,
                }} />
              ))}
              {[1, 2].map((i) => (
                <div key={`badge-${i}`} style={{
                  height: 10,
                  borderRadius: 4,
                  width: `${40 + i * 15}%`,
                  background: 'linear-gradient(110deg, rgba(255,255,255,0.02) 30%, rgba(255,255,255,0.04) 50%, rgba(255,255,255,0.02) 70%)',
                  backgroundSize: '200% 100%',
                  animation: 'hudShimmer 1.8s ease-in-out infinite',
                  animationDelay: `${(4 + i) * 0.15}s`,
                }} />
              ))}
            </div>
          ) : flipped && analysis ? (
            <CardBackAnalysis analysis={analysis} onBack={() => setFlipped(false)} />
          ) : null}
        </div>
      </div>
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
      const data = await searchParts(searchQuery, generation, partSlug, 10)
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
        <div style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: loading ? 'rgba(245,197,24,0.9)' : 'rgba(34,197,94,0.7)',
          boxShadow: loading
            ? '0 0 10px rgba(245,197,24,0.5), 0 0 3px rgba(245,197,24,0.3)'
            : '0 0 10px rgba(34,197,94,0.3)',
          animation: loading ? 'hudPulse 1.5s ease-in-out infinite' : undefined,
          transition: 'all 0.3s ease',
        }} />
        <h4 style={{
          margin: 0,
          fontSize: 11,
          fontWeight: 700,
          color: 'rgba(255,255,255,0.85)',
          fontFamily: "'DM Mono', monospace",
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
        }}>
          FIND UPGRADES
        </h4>
        {hasSearched && !loading && (() => {
          const displayResults = results.filter(Boolean)
          const sources = new Set(displayResults.map(r => r.source).filter(Boolean))
          return (
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
              {sources.size > 1 && (
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
              )}
              <span style={{
                fontSize: 9,
                fontFamily: "'DM Mono', monospace",
                color: 'rgba(255,255,255,0.25)',
                letterSpacing: '0.04em',
              }}>
                {displayResults.length} result{displayResults.length !== 1 ? 's' : ''}
              </span>
            </div>
          )
        })()}
      </div>

      {/* Search bar */}
      <div style={{
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
      }}>
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

      {/* Results grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 8,
      }}>
        {/* Shimmer loading */}
        {loading && (
          <>
            {Array.from({ length: 10 }).map((_, i) => (
              <ShimmerCard key={i} index={i} />
            ))}
          </>
        )}

        {error && !loading && (
          <div style={{
            gridColumn: '1 / -1',
            textAlign: 'center',
            padding: '24px 0',
            borderRadius: 10,
            background: 'rgba(239,68,68,0.03)',
            border: '1px solid rgba(239,68,68,0.1)',
          }}>
            <p style={{
              margin: 0,
              fontSize: 11,
              fontFamily: "'DM Mono', monospace",
              color: 'rgba(239,68,68,0.7)',
            }}>
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
            gridColumn: '1 / -1',
            textAlign: 'center',
            padding: '28px 0',
            borderRadius: 10,
            background: 'rgba(255,255,255,0.015)',
          }}>
            <div style={{ fontSize: 24, marginBottom: 8, opacity: 0.3 }}>&#128270;</div>
            <p style={{
              margin: 0,
              fontSize: 11,
              fontFamily: "'DM Mono', monospace",
              color: 'rgba(255,255,255,0.3)',
              lineHeight: 1.6,
            }}>
              No aftermarket parts found.
              <br />
              Try a different search term.
            </p>
          </div>
        )}

        {!loading &&
          results
            .filter(Boolean)
            .map((r, i) => (
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
        @keyframes hudCardFlipGlow {
          0% { box-shadow: 0 0 0 rgba(196,30,42,0); }
          50% { box-shadow: 0 0 20px rgba(196,30,42,0.3), 0 0 40px rgba(196,30,42,0.1); }
          100% { box-shadow: 0 0 0 rgba(196,30,42,0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
