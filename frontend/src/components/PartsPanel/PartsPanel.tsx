import { useState, useMemo, useEffect } from 'react'
import { getPartImpacts, type PartImpact } from '../../data/corvette-part-impacts'
import { getGeneration, type GenerationCode } from '../../data/corvette-generations'
import { getSubComponents, type SubComponent, type SubComponentGroup } from '../../data/corvette-sub-components'
import type { PartSlug } from '../../types'
import { MarketplaceSearch } from './MarketplaceSearch'

/* ─── Types ─── */

interface PartTab {
  slug: PartSlug
  label: string
  icon: string
}

interface PartsPanelProps {
  generation: string
  onTabChange?: (slug: PartSlug) => void
}

/* ─── Constants ─── */

const STOCK_WEIGHTS: Record<string, number> = {
  c3: 3300,
  c4: 3200,
  c5: 3245,
  c6: 3175,
  c7: 3298,
  c8: 3366,
}

const HP_BAR_MAX = 800
const WEIGHT_BAR_MAX = 4000
const ZERO_TO_SIXTY_BAR_MAX = 8 // seconds

/* ─── Tab Definitions ─── */

const PART_TABS: PartTab[] = [
  { slug: 'engine', label: 'Engine', icon: '⚙️' },
  { slug: 'transmission', label: 'Transmission', icon: '🔧' },
  { slug: 'exhaust', label: 'Exhaust', icon: '💨' },
  { slug: 'suspension', label: 'Suspension', icon: '🔩' },
  { slug: 'brakes', label: 'Brakes', icon: '🛑' },
  { slug: 'tires-wheels', label: 'Tires & Wheels', icon: '🛞' },
  { slug: 'air-intake', label: 'Air Intake', icon: '🌬️' },
  { slug: 'turbo-supercharger', label: 'Turbo / Supercharger', icon: '🌀' },
  { slug: 'fuel-system', label: 'Fuel System', icon: '⛽' },
  { slug: 'cooling-system', label: 'Cooling System', icon: '❄️' },
  { slug: 'steering', label: 'Steering', icon: '🎯' },
  { slug: 'ecu-electronics', label: 'ECU / Electronics', icon: '📡' },
]

/* ─── Helpers ─── */

function parseNumber(s: string): number {
  const m = s.match(/([\d.]+)/)
  return m ? parseFloat(m[1]) : 0
}

/* ─── RPG Stat Bar ─── */

function RPGStatBar({
  label,
  stockValue,
  stockDisplay,
  deltaMin,
  deltaMax,
  deltaUnit,
  barMax,
  invertFill,
}: {
  label: string
  stockValue: number
  stockDisplay: string
  deltaMin: number
  deltaMax: number
  deltaUnit: string
  barMax: number
  /** If true, the filled portion goes from right edge leftward (lower = better) */
  invertFill?: boolean
}) {
  // Determine accent color based on delta signs:
  // Both negative → red, both positive → green, mixed → white
  const bothNeg = deltaMin <= 0 && deltaMax <= 0 && (deltaMin !== 0 || deltaMax !== 0)
  const bothPos = deltaMin >= 0 && deltaMax >= 0 && (deltaMin !== 0 || deltaMax !== 0)
  const accentColor = bothNeg ? '#ef4444' : bothPos ? '#22c55e' : 'rgba(255,255,255,0.7)'

  // Clamp stock to bar range
  const stockFraction = Math.min(Math.max(stockValue / barMax, 0), 1)

  // For the upgrade extension, figure out the fraction of change
  const absDeltaMin = Math.abs(deltaMin)
  const absDeltaMax = Math.abs(deltaMax)
  const upgradeFractionMin = absDeltaMin / barMax
  const upgradeFractionMax = absDeltaMax / barMax

  // Format the delta label
  const sign = deltaMin <= 0 && deltaMax <= 0 ? '' : '+'
  const deltaLabel =
    deltaMin === deltaMax
      ? `${sign}${deltaMin}${deltaUnit}`
      : `${sign}${deltaMin} to ${sign}${deltaMax}${deltaUnit}`

  // For inverted bars (weight, 0-60), fill from right
  // Stock fill = how much of the bar is filled
  // Upgrade extension = reduction shown as lighter region on the left edge of stock fill
  const stockPct = stockFraction * 100
  const upgradeMinPct = upgradeFractionMin * 100
  const upgradeMaxPct = upgradeFractionMax * 100

  return (
    <div style={{ marginBottom: 10 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: 4,
          fontFamily: "'DM Mono', monospace",
          fontSize: 11,
        }}
      >
        <span style={{ color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}
        </span>
        <span>
          <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>{stockDisplay}</span>
          <span style={{ color: accentColor, fontWeight: 600, marginLeft: 6, fontSize: 10 }}>
            {deltaLabel}
          </span>
        </span>
      </div>

      {/* Bar track */}
      <div
        style={{
          position: 'relative',
          height: 8,
          background: 'rgba(255,255,255,0.06)',
          borderRadius: 4,
          overflow: 'hidden',
        }}
      >
        {invertFill ? (
          <>
            {/* Stock fill: from right edge leftward */}
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: 0,
                height: '100%',
                width: `${stockPct}%`,
                background: 'rgba(255,255,255,0.18)',
                borderRadius: 4,
                transition: 'width 0.5s ease',
              }}
            />
            {/* Upgrade extension: the reduction zone (pulsing glow) */}
            {upgradeMaxPct > 0 && (
              <div
                style={{
                  position: 'absolute',
                  right: `${stockPct - upgradeMaxPct}%`,
                  top: 0,
                  height: '100%',
                  width: `${upgradeMaxPct}%`,
                  background: `linear-gradient(90deg, ${accentColor}00, ${accentColor}88)`,
                  borderRadius: 4,
                  animation: 'rpgPulse 2s ease-in-out infinite',
                  transition: 'all 0.5s ease',
                }}
              />
            )}
          </>
        ) : (
          <>
            {/* Stock fill: from left edge rightward */}
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                height: '100%',
                width: `${stockPct}%`,
                background: 'rgba(255,255,255,0.18)',
                borderRadius: 4,
                transition: 'width 0.5s ease',
              }}
            />
            {/* Upgrade extension: the gain zone (pulsing glow) */}
            {upgradeMaxPct > 0 && (
              <div
                style={{
                  position: 'absolute',
                  left: `${stockPct}%`,
                  top: 0,
                  height: '100%',
                  width: `${upgradeMaxPct}%`,
                  background: `linear-gradient(90deg, ${accentColor}88, ${accentColor}00)`,
                  borderRadius: 4,
                  animation: 'rpgPulse 2s ease-in-out infinite',
                  transition: 'all 0.5s ease',
                }}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}

/* ─── Part Detail View ─── */

function PartDetail({ part, generation }: { part: PartImpact; generation: string }) {
  const gen = getGeneration(generation)
  const stockHP = gen ? parseNumber(gen.specs.horsepower) : 400
  const stockZeroToSixty = gen ? parseNumber(gen.specs.zeroToSixty) : 4.0
  const stockWeight = STOCK_WEIGHTS[generation] ?? 3300

  // Sub-component state
  const subGroups = useMemo(
    () => getSubComponents(generation as GenerationCode, part.slug),
    [generation, part.slug],
  )
  const [selectedSub, setSelectedSub] = useState<SubComponent | null>(null)

  // Auto-select first sub-component when part changes
  useEffect(() => {
    const first = subGroups[0]?.subComponents[0] ?? null
    setSelectedSub(first)
  }, [subGroups])

  // Build search query from selected sub-component keywords
  const searchQuery = selectedSub
    ? `${generation.toUpperCase()} Corvette ${selectedSub.keywords[0]}`
    : part.name

  const hpGain = part.upgradeImpact.hpGain
  const weightChange = part.upgradeImpact.weightChange
  const zeroToSixtyChange = part.upgradeImpact.zeroToSixtyChange

  return (
    <div
      style={{
        display: 'flex',
        gap: 16,
        padding: '8px 0',
        height: '100%',
        boxSizing: 'border-box',
        overflow: 'hidden',
        minHeight: 0,
      }}
    >
      {/* Left side: Part info + RPG stat bars */}
      <div style={{ flex: '1 1 55%', minWidth: 280, overflowY: 'auto', minHeight: 0 }}>
        {/* Part name + category badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <h3
            style={{
              margin: 0,
              fontSize: 18,
              fontWeight: 700,
              color: '#fff',
              fontFamily: "'DM Mono', monospace",
            }}
          >
            {part.name}
          </h3>
          <span
            style={{
              fontSize: 10,
              fontFamily: "'DM Mono', monospace",
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              padding: '2px 8px',
              borderRadius: 4,
              background: 'rgba(196,30,42,0.15)',
              color: 'rgba(196,30,42,0.9)',
              border: '1px solid rgba(196,30,42,0.25)',
            }}
          >
            {part.category}
          </span>
        </div>

        {/* Stock Configuration line */}
        {part.stock.name && (
          <div
            style={{
              fontSize: 12,
              fontFamily: "'DM Mono', monospace",
              color: 'rgba(255,255,255,0.5)',
              marginBottom: 16,
            }}
          >
            <span style={{ color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 10 }}>
              Stock{' '}
            </span>
            {part.stock.name}
            {part.stock.weight != null && (
              <span style={{ color: 'rgba(255,255,255,0.3)' }}> — {part.stock.weight} lbs</span>
            )}
          </div>
        )}

        {/* RPG Stat Bars */}
        <div style={{ marginBottom: 14 }}>
          <div
            style={{
              fontSize: 9,
              fontFamily: "'DM Mono', monospace",
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'rgba(255,255,255,0.25)',
              marginBottom: 8,
            }}
          >
            Upgrade potential with aftermarket parts
          </div>
          <RPGStatBar
            label="HP"
            stockValue={stockHP}
            stockDisplay={`${stockHP}`}
            deltaMin={hpGain[0]}
            deltaMax={hpGain[1]}
            deltaUnit=" HP"
            barMax={HP_BAR_MAX}
          />
          <RPGStatBar
            label="Weight"
            stockValue={stockWeight}
            stockDisplay={`${stockWeight.toLocaleString()} lbs`}
            deltaMin={weightChange[0]}
            deltaMax={weightChange[1]}
            deltaUnit=" lbs"
            barMax={WEIGHT_BAR_MAX}
            invertFill
          />
          <RPGStatBar
            label="0-60"
            stockValue={stockZeroToSixty}
            stockDisplay={`${stockZeroToSixty}s`}
            deltaMin={zeroToSixtyChange[0]}
            deltaMax={zeroToSixtyChange[1]}
            deltaUnit="s"
            barMax={ZERO_TO_SIXTY_BAR_MAX}
            invertFill
          />
        </div>

        {/* Upgrade description */}
        <p
          style={{
            fontSize: 12,
            lineHeight: 1.6,
            color: 'rgba(255,255,255,0.45)',
            margin: 0,
          }}
        >
          {part.upgradeDescription}
        </p>
      </div>

      {/* Right side: Sub-component picker + Marketplace — single scrollable column */}
      <div style={{ flex: '1 1 40%', minWidth: 240, minHeight: 0, overflowY: 'auto', paddingRight: 4 }}>
        {/* Sub-component picker — compact horizontal pills */}
        {subGroups.length > 0 && (
          <div
            style={{
              marginBottom: 10,
              borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.06)',
              background: 'rgba(255,255,255,0.015)',
              padding: '8px 10px',
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: 'rgba(255,255,255,0.4)',
                fontFamily: "'DM Mono', monospace",
                letterSpacing: '1px',
                marginBottom: 6,
              }}
            >
              SUB-COMPONENTS
            </div>
            {subGroups.map((group) => (
              <div key={group.name} style={{ marginBottom: 6 }}>
                <div
                  style={{
                    fontSize: 9,
                    fontWeight: 600,
                    color: 'rgba(196,30,42,0.7)',
                    fontFamily: "'DM Mono', monospace",
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: 3,
                    paddingLeft: 4,
                  }}
                >
                  {group.name}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {group.subComponents.map((sub) => {
                    const isActive = selectedSub?.id === sub.id
                    return (
                      <button
                        key={sub.id}
                        onClick={() => setSelectedSub(sub)}
                        title={sub.notes || sub.keywords.slice(0, 3).join(', ')}
                        style={{
                          padding: '3px 8px',
                          borderRadius: 6,
                          border: `1px solid ${isActive ? 'rgba(196,30,42,0.6)' : 'rgba(255,255,255,0.08)'}`,
                          background: isActive ? 'rgba(196,30,42,0.15)' : 'rgba(255,255,255,0.03)',
                          color: isActive ? '#fff' : 'rgba(255,255,255,0.55)',
                          fontSize: 10,
                          fontFamily: "'DM Mono', monospace",
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {sub.name}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Marketplace cards — full height, no container constraint */}
        <MarketplaceSearch
          partName={searchQuery}
          partSlug={part.slug}
          generation={generation}
        />
      </div>

      {/* Inline keyframe animation for the pulsing glow */}
      <style>{`
        @keyframes rpgPulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}

/* ─── Main Component ─── */

export function PartsPanel({ generation, onTabChange }: PartsPanelProps) {
  const [activeTab, setActiveTab] = useState<PartSlug>('engine')
  const [hoveredTab, setHoveredTab] = useState<PartSlug | null>(null)

  // Notify parent on initial mount
  useEffect(() => { onTabChange?.('engine') }, [])

  const handleTabChange = (slug: PartSlug) => {
    setActiveTab(slug)
    onTabChange?.(slug)
  }

  const parts = useMemo(() => getPartImpacts(generation), [generation])

  const activePart = useMemo(
    () => parts.find((p) => p.slug === activeTab) ?? parts[0],
    [parts, activeTab],
  )

  return (
    <div
      style={{
        background: '#0a0a0f',
        padding: '0 16px 16px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* ── Tab Bar ── */}
      <div
        style={{
          display: 'flex',
          overflowX: 'auto',
          gap: 2,
          padding: '8px 0 0',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
        className="hide-scrollbar"
      >
        {PART_TABS.map((tab) => {
          const isActive = tab.slug === activeTab
          const isHovered = tab.slug === hoveredTab

          return (
            <button
              key={tab.slug}
              onClick={() => handleTabChange(tab.slug)}
              onMouseEnter={() => setHoveredTab(tab.slug)}
              onMouseLeave={() => setHoveredTab(null)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                border: 'none',
                borderBottom: isActive
                  ? '2px solid rgba(196,30,42,0.9)'
                  : '2px solid transparent',
                background: isActive
                  ? 'rgba(196,30,42,0.08)'
                  : isHovered
                    ? 'rgba(255,255,255,0.04)'
                    : 'transparent',
                color: isActive ? '#fff' : 'rgba(255,255,255,0.5)',
                cursor: 'pointer',
                fontFamily: "'DM Mono', monospace",
                fontSize: 12,
                fontWeight: isActive ? 600 : 400,
                whiteSpace: 'nowrap',
                borderRadius: '6px 6px 0 0',
                transition: 'all 0.2s ease',
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: 14 }}>{tab.icon}</span>
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* ── Divider ── */}
      <div
        style={{
          height: 1,
          background: 'rgba(255,255,255,0.06)',
          marginBottom: 4,
        }}
      />

      {/* ── Part Detail ── */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {activePart && <PartDetail part={activePart} generation={generation} />}
      </div>
    </div>
  )
}
