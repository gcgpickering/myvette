import { useRef, useState, useCallback, type ReactNode } from 'react'

export interface Hotspot {
  id: string
  subComponentId: string
  label: string
}

interface InteractiveSVGProps {
  partSlug: string
  hotspots: Hotspot[]
  onSubComponentSelect?: (subComponentId: string) => void
  selectedSubId?: string | null
  children: (ctx: LayerContext) => ReactNode
}

export interface LayerContext {
  /** Current parallax offset per depth layer */
  offsetX: number
  offsetY: number
  /** Currently hovered hotspot id */
  hoveredId: string | null
  /** Currently selected hotspot id */
  selectedId: string | null
  /** Get transform string for a depth layer (0=bg, 1=mid, 2=fg) */
  layerTransform: (depth: number) => string
  /** Get style props for a hotspot group */
  hotspotProps: (hotspotId: string) => {
    onMouseEnter: () => void
    onMouseLeave: () => void
    onClick: (e: React.MouseEvent) => void
    style: React.CSSProperties
    className: string
  }
}

const PARALLAX_STRENGTH = 12 // max px offset at edges

export function InteractiveSVG({
  hotspots,
  onSubComponentSelect,
  selectedSubId,
  children,
}: InteractiveSVGProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 })
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })

  // Find the currently selected hotspot from external selection
  const selectedId = selectedSubId
    ? hotspots.find(h => h.subComponentId === selectedSubId)?.id ?? null
    : null

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    setMousePos({ x, y })
    setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }, [])

  const handleMouseLeave = useCallback(() => {
    setMousePos({ x: 0.5, y: 0.5 })
    setHoveredId(null)
  }, [])

  // Parallax offset from center (0.5, 0.5)
  const offsetX = (mousePos.x - 0.5) * PARALLAX_STRENGTH
  const offsetY = (mousePos.y - 0.5) * PARALLAX_STRENGTH

  const layerTransform = useCallback((depth: number) => {
    const multipliers = [0.3, 0.7, 1.2] // bg, mid, fg
    const m = multipliers[Math.min(depth, 2)]
    return `translate(${offsetX * m}px, ${offsetY * m}px)`
  }, [offsetX, offsetY])

  const hotspotProps = useCallback((hotspotId: string) => {
    const isHovered = hoveredId === hotspotId
    const isSelected = selectedId === hotspotId
    const isOtherSelected = selectedId !== null && selectedId !== hotspotId

    return {
      onMouseEnter: () => setHoveredId(hotspotId),
      onMouseLeave: () => setHoveredId(null),
      onClick: (e: React.MouseEvent) => {
        e.stopPropagation()
        const hotspot = hotspots.find(h => h.id === hotspotId)
        if (hotspot && onSubComponentSelect) {
          onSubComponentSelect(hotspot.subComponentId)
        }
      },
      style: {
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
        filter: isHovered
          ? 'drop-shadow(0 0 8px rgba(196,30,42,0.6))'
          : isSelected
            ? 'drop-shadow(0 0 6px rgba(196,30,42,0.4))'
            : 'none',
        opacity: isOtherSelected ? 0.35 : 1,
      } as React.CSSProperties,
      className: `hotspot ${isHovered ? 'hovered' : ''} ${isSelected ? 'selected' : ''}`,
    }
  }, [hoveredId, selectedId, hotspots, onSubComponentSelect])

  const ctx: LayerContext = {
    offsetX,
    offsetY,
    hoveredId,
    selectedId,
    layerTransform,
    hotspotProps,
  }

  const hoveredHotspot = hotspots.find(h => h.id === hoveredId)

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        background: 'radial-gradient(ellipse at 50% 40%, rgba(196,30,42,0.03) 0%, #0a0a0f 70%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* SVG glow filter definitions */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <filter id="hotspot-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feColorMatrix in="blur" type="matrix" values="0 0 0 0 0.77  0 0 0 0 0.12  0 0 0 0 0.16  0 0 0 0.6 0" result="redGlow" />
            <feMerge>
              <feMergeNode in="redGlow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="hotspot-glow-selected" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feColorMatrix in="blur" type="matrix" values="0 0 0 0 0.77  0 0 0 0 0.12  0 0 0 0 0.16  0 0 0 0.8 0" result="redGlow" />
            <feMerge>
              <feMergeNode in="redGlow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      {/* Part label */}
      <div style={{
        position: 'absolute',
        top: 12,
        left: 14,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        zIndex: 10,
      }}>
        <div style={{
          width: 4,
          height: 4,
          borderRadius: '50%',
          background: 'rgba(196,30,42,0.8)',
          boxShadow: '0 0 6px rgba(196,30,42,0.4)',
        }} />
        <span style={{
          fontSize: 8,
          fontFamily: "'DM Mono', monospace",
          fontWeight: 700,
          color: 'rgba(255,255,255,0.25)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}>
          CROSS-SECTION
        </span>
      </div>

      {/* Interaction hint */}
      <div style={{
        position: 'absolute',
        bottom: 10,
        right: 14,
        fontSize: 7,
        fontFamily: "'DM Mono', monospace",
        color: 'rgba(255,255,255,0.15)',
        letterSpacing: '0.06em',
      }}>
        CLICK REGION TO SEARCH PARTS
      </div>

      {/* SVG content from children */}
      <div style={{
        width: '85%',
        maxWidth: 400,
        aspectRatio: '4/3',
        position: 'relative',
      }}>
        {children(ctx)}
      </div>

      {/* Hover tooltip */}
      {hoveredHotspot && (
        <div
          style={{
            position: 'absolute',
            left: tooltipPos.x,
            top: tooltipPos.y - 36,
            transform: 'translateX(-50%)',
            padding: '4px 10px',
            borderRadius: 6,
            background: 'rgba(10,10,15,0.85)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(196,30,42,0.3)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.5), 0 0 0 0.5px rgba(196,30,42,0.15)',
            pointerEvents: 'none',
            zIndex: 20,
            whiteSpace: 'nowrap',
          }}
        >
          <span style={{
            fontSize: 9,
            fontFamily: "'DM Mono', monospace",
            fontWeight: 600,
            color: 'rgba(255,255,255,0.85)',
            letterSpacing: '0.04em',
          }}>
            {hoveredHotspot.label}
          </span>
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes pistonStroke {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(12px); }
        }
        @keyframes crankRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes gearSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes gearSpinReverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes flowPulse {
          0%, 100% { opacity: 0.15; stroke-dashoffset: 0; }
          50% { opacity: 0.5; stroke-dashoffset: -20; }
        }
        @keyframes hotspotPulse {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.25; }
        }
        @keyframes fanSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
