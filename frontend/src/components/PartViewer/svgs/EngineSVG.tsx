import { InteractiveSVG, type Hotspot, type LayerContext } from '../InteractiveSVG'

const HOTSPOTS: Hotspot[] = [
  { id: 'valve-covers', subComponentId: 'dual-valve-springs', label: 'Valve Covers & Valvetrain' },
  { id: 'intake-manifold', subComponentId: 'performance-intake-manifolds', label: 'Intake Manifold' },
  { id: 'headers', subComponentId: 'long-tube-headers', label: 'Headers / Exhaust Manifold' },
  { id: 'oil-pan', subComponentId: 'oil-pumps', label: 'Oil Pan & Oil Pump' },
  { id: 'block', subComponentId: 'harmonic-balancers', label: 'Engine Block & Internals' },
  { id: 'accessories', subComponentId: 'underdrive-pulleys', label: 'Accessory Drive & Pulleys' },
]

// Stroke/fill palette
const S = {
  outline: 'rgba(255,255,255,0.18)',
  detail: 'rgba(255,255,255,0.07)',
  hotFill: 'rgba(196,30,42,0.12)',
  hotStroke: 'rgba(196,30,42,0.5)',
  selectedFill: 'rgba(196,30,42,0.2)',
  selectedStroke: 'rgba(196,30,42,0.7)',
  pistonFill: 'rgba(255,255,255,0.06)',
  accent: 'rgba(196,30,42,0.3)',
}

function getRegionStyle(id: string, ctx: LayerContext) {
  const isHovered = ctx.hoveredId === id
  const isSelected = ctx.selectedId === id
  return {
    fill: isSelected ? S.selectedFill : isHovered ? S.hotFill : 'transparent',
    stroke: isSelected ? S.selectedStroke : isHovered ? S.hotStroke : 'transparent',
    strokeWidth: isSelected ? 1.5 : isHovered ? 1 : 0,
    filter: isSelected ? 'url(#hotspot-glow-selected)' : isHovered ? 'url(#hotspot-glow)' : 'none',
  }
}

interface Props {
  onSubComponentSelect?: (subComponentId: string) => void
  selectedSubId?: string | null
}

export function EngineSVG({ onSubComponentSelect, selectedSubId }: Props) {
  return (
    <InteractiveSVG
      partSlug="engine"
      hotspots={HOTSPOTS}
      onSubComponentSelect={onSubComponentSelect}
      selectedSubId={selectedSubId}
    >
      {(ctx) => (
        <svg
          viewBox="0 0 400 300"
          width="100%"
          height="100%"
          style={{ overflow: 'visible' }}
        >
          {/* ═══ BACKGROUND LAYER (depth 0) ═══ */}
          <g style={{ transform: ctx.layerTransform(0), transition: 'transform 0.15s ease-out' }}>
            {/* Engine block outline */}
            <rect x="100" y="60" width="200" height="160" rx="8"
              fill="none" stroke={S.outline} strokeWidth="1.5" />
            {/* Crankcase bottom */}
            <path d="M 110 220 L 110 250 Q 110 260 120 260 L 280 260 Q 290 260 290 250 L 290 220"
              fill="none" stroke={S.outline} strokeWidth="1" />
            {/* Cylinder bore outlines (V8 — 2 banks of 4) */}
            {/* Left bank */}
            {[0, 1, 2, 3].map(i => (
              <ellipse key={`lb-${i}`} cx={135 + i * 40} cy={100} rx="14" ry="18"
                fill="none" stroke={S.detail} strokeWidth="0.8" />
            ))}
            {/* Right bank (offset, angled) */}
            {[0, 1, 2, 3].map(i => (
              <ellipse key={`rb-${i}`} cx={140 + i * 40} cy={140} rx="14" ry="18"
                fill="none" stroke={S.detail} strokeWidth="0.8"
                style={{ opacity: 0.5 }} />
            ))}
            {/* Center V valley line */}
            <line x1="130" y1="120" x2="290" y2="120"
              stroke={S.detail} strokeWidth="0.5" strokeDasharray="4 3" />
          </g>

          {/* ═══ MID LAYER (depth 1) — animated internals ═══ */}
          <g style={{ transform: ctx.layerTransform(1), transition: 'transform 0.15s ease-out' }}>
            {/* Pistons (animated) */}
            {[0, 1, 2, 3].map(i => (
              <g key={`piston-${i}`}>
                <rect
                  x={125 + i * 40} y={85} width="20" height="12" rx="2"
                  fill={S.pistonFill} stroke={S.detail} strokeWidth="0.6"
                  style={{
                    animation: `pistonStroke 1.5s ease-in-out ${i * 0.2}s infinite`,
                    transformOrigin: `${135 + i * 40}px 91px`,
                  }}
                />
                {/* Connecting rod */}
                <line
                  x1={135 + i * 40} y1={97} x2={135 + i * 40} y2={155}
                  stroke={S.detail} strokeWidth="0.5"
                  style={{
                    animation: `pistonStroke 1.5s ease-in-out ${i * 0.2}s infinite`,
                    transformOrigin: `${135 + i * 40}px 120px`,
                  }}
                />
              </g>
            ))}
            {/* Crankshaft (rotating) */}
            <g style={{
              animation: 'crankRotate 3s linear infinite',
              transformOrigin: '200px 170px',
            }}>
              <circle cx="200" cy="170" r="18" fill="none" stroke={S.detail} strokeWidth="1" />
              {/* Crank throws */}
              {[0, 90, 180, 270].map(angle => (
                <line
                  key={`ct-${angle}`}
                  x1="200" y1="170"
                  x2={200 + 16 * Math.cos(angle * Math.PI / 180)}
                  y2={170 + 16 * Math.sin(angle * Math.PI / 180)}
                  stroke={S.outline} strokeWidth="1.5" strokeLinecap="round"
                />
              ))}
              <circle cx="200" cy="170" r="4" fill={S.detail} stroke={S.outline} strokeWidth="0.5" />
            </g>
            {/* Camshaft (smaller, in the V) */}
            <g style={{
              animation: 'crankRotate 6s linear infinite',
              transformOrigin: '200px 118px',
            }}>
              <circle cx="200" cy="118" r="6" fill="none" stroke={S.detail} strokeWidth="0.6" />
              {[0, 45, 90, 135, 180, 225, 270, 315].map(angle => (
                <circle
                  key={`cam-${angle}`}
                  cx={200 + 8 * Math.cos(angle * Math.PI / 180)}
                  cy={118 + 8 * Math.sin(angle * Math.PI / 180)}
                  r="2" fill={S.detail}
                />
              ))}
            </g>
          </g>

          {/* ═══ FOREGROUND LAYER (depth 2) — clickable hotspot regions ═══ */}
          <g style={{ transform: ctx.layerTransform(2), transition: 'transform 0.15s ease-out' }}>

            {/* Valve Covers — two rounded rects on top of banks */}
            <g {...ctx.hotspotProps('valve-covers')}>
              <rect x="115" y="55" width="170" height="20" rx="6"
                {...getRegionStyle('valve-covers', ctx)} />
              {/* Bolt details */}
              {[0, 1, 2, 3, 4].map(i => (
                <circle key={`vb-${i}`} cx={130 + i * 35} cy={65} r="2"
                  fill="none" stroke={S.detail} strokeWidth="0.5" />
              ))}
              {/* Fill tab on top */}
              <rect x="185" y="49" width="30" height="8" rx="3"
                fill="none" stroke={ctx.hoveredId === 'valve-covers' ? S.hotStroke : S.detail} strokeWidth="0.5" />
            </g>

            {/* Intake Manifold — curved shape on top center */}
            <g {...ctx.hotspotProps('intake-manifold')}>
              <path
                d="M 155 42 Q 155 28 200 28 Q 245 28 245 42 L 245 55 L 155 55 Z"
                {...getRegionStyle('intake-manifold', ctx)}
                strokeWidth={ctx.hoveredId === 'intake-manifold' || ctx.selectedId === 'intake-manifold' ? 1.5 : 0.8}
              />
              {/* Intake runners */}
              {[0, 1, 2, 3].map(i => (
                <line key={`ir-${i}`}
                  x1={170 + i * 20} y1={35} x2={170 + i * 20} y2={55}
                  stroke={ctx.hoveredId === 'intake-manifold' ? S.hotStroke : S.detail}
                  strokeWidth="0.6" />
              ))}
              {/* Throttle body */}
              <circle cx="200" cy="28" r="8"
                fill="none"
                stroke={ctx.hoveredId === 'intake-manifold' ? S.hotStroke : S.outline}
                strokeWidth="0.8" />
              <line x1="194" y1="28" x2="206" y2="28"
                stroke={ctx.hoveredId === 'intake-manifold' ? S.hotStroke : S.detail}
                strokeWidth="0.6" />
            </g>

            {/* Headers — tubes curving down from block sides */}
            <g {...ctx.hotspotProps('headers')}>
              {/* Left side headers */}
              <path
                d="M 100 90 Q 80 90 75 110 Q 70 130 70 160 L 70 200 Q 70 210 80 210 L 90 210"
                fill="none"
                stroke={ctx.hoveredId === 'headers' || ctx.selectedId === 'headers' ? S.hotStroke : S.outline}
                strokeWidth="1.2" />
              {/* Right side headers */}
              <path
                d="M 300 90 Q 320 90 325 110 Q 330 130 330 160 L 330 200 Q 330 210 320 210 L 310 210"
                fill="none"
                stroke={ctx.hoveredId === 'headers' || ctx.selectedId === 'headers' ? S.hotStroke : S.outline}
                strokeWidth="1.2" />
              {/* Individual tubes merging (left) */}
              {[0, 1, 2, 3].map(i => (
                <path key={`hl-${i}`}
                  d={`M ${105 + i * 5} ${80 + i * 8} Q ${90 - i * 2} ${85 + i * 8} ${80} ${110 + i * 15}`}
                  fill="none"
                  stroke={ctx.hoveredId === 'headers' ? S.hotStroke : S.detail}
                  strokeWidth="0.5" />
              ))}
              {/* Clickable overlay */}
              <rect x="60" y="80" width="45" height="140" rx="4"
                {...getRegionStyle('headers', ctx)} />
              <rect x="295" y="80" width="45" height="140" rx="4"
                {...getRegionStyle('headers', ctx)} />
            </g>

            {/* Oil Pan — bottom of engine */}
            <g {...ctx.hotspotProps('oil-pan')}>
              <path
                d="M 120 260 L 120 275 Q 120 285 130 285 L 270 285 Q 280 285 280 275 L 280 260"
                {...getRegionStyle('oil-pan', ctx)}
              />
              {/* Drain plug */}
              <circle cx="200" cy="282" r="4"
                fill="none"
                stroke={ctx.hoveredId === 'oil-pan' ? S.hotStroke : S.detail}
                strokeWidth="0.6" />
              {/* Oil level line */}
              <line x1="140" y1="270" x2="260" y2="270"
                stroke={ctx.hoveredId === 'oil-pan' ? 'rgba(245,197,24,0.3)' : S.detail}
                strokeWidth="0.4" strokeDasharray="3 2" />
            </g>

            {/* Engine Block (center, behind other regions) */}
            <g {...ctx.hotspotProps('block')}>
              <rect x="140" y="130" width="120" height="90" rx="4"
                {...getRegionStyle('block', ctx)} />
              {/* Cylinder wall cross-hatch */}
              {[0, 1, 2].map(i => (
                <line key={`xh-${i}`}
                  x1={160 + i * 30} y1={140} x2={160 + i * 30} y2={210}
                  stroke={ctx.hoveredId === 'block' ? S.hotStroke : S.detail}
                  strokeWidth="0.3" strokeDasharray="2 4" />
              ))}
            </g>

            {/* Accessories — front face (pulleys, belt, alternator) */}
            <g {...ctx.hotspotProps('accessories')}>
              {/* Main pulley (crank) */}
              <circle cx="55" cy="170" r="14"
                fill="none"
                stroke={ctx.hoveredId === 'accessories' || ctx.selectedId === 'accessories' ? S.hotStroke : S.outline}
                strokeWidth="1" />
              {/* Alternator pulley */}
              <circle cx="45" cy="120" r="8"
                fill="none"
                stroke={ctx.hoveredId === 'accessories' ? S.hotStroke : S.detail}
                strokeWidth="0.7" />
              {/* AC compressor pulley */}
              <circle cx="50" cy="220" r="10"
                fill="none"
                stroke={ctx.hoveredId === 'accessories' ? S.hotStroke : S.detail}
                strokeWidth="0.7" />
              {/* Belt path */}
              <path
                d="M 55 156 Q 40 140 45 128 M 45 112 Q 35 100 35 120 Q 35 150 55 156 M 55 184 Q 40 200 50 210 M 50 230 Q 65 245 55 184"
                fill="none"
                stroke={ctx.hoveredId === 'accessories' ? S.hotStroke : S.detail}
                strokeWidth="0.6" strokeDasharray="4 2"
                style={{ animation: 'flowPulse 3s ease-in-out infinite' }} />
              {/* Clickable overlay */}
              <rect x="28" y="105" width="45" height="140" rx="4"
                {...getRegionStyle('accessories', ctx)} />
            </g>

            {/* Scan lines overlay for HUD feel */}
            <rect x="0" y="0" width="400" height="300" fill="url(#scanlines)" opacity="0.3" pointerEvents="none" />
          </g>

          {/* Pattern defs */}
          <defs>
            <pattern id="scanlines" width="4" height="4" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="4" y2="0" stroke="rgba(255,255,255,0.01)" strokeWidth="1" />
            </pattern>
          </defs>
        </svg>
      )}
    </InteractiveSVG>
  )
}
