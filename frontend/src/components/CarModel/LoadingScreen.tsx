import { useState, useEffect, useCallback } from 'react'

const ASSEMBLY_STEPS = [
  { label: 'Initializing digital twin engine' },
  { label: 'Constructing chassis wireframe' },
  { label: 'Generating body surface mesh' },
  { label: 'Mounting powertrain assembly' },
  { label: 'Installing suspension geometry' },
  { label: 'Routing electrical harness' },
  { label: 'Fitting wheel assemblies' },
  { label: 'Calibrating sensor array' },
  { label: 'Materializing surface render' },
  { label: 'Digital twin online' },
]

/* ─── Exploded-view holographic car ─── */
function HoloCar({ step }: { step: number }) {
  // Each component has: start offset (exploded), opacity trigger step
  // Components fly from exploded positions into assembled position
  const t = (trigger: number) => ({
    opacity: step >= trigger ? 1 : 0.04,
    transform: step >= trigger ? 'translate(0,0)' : undefined,
    transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
  })

  const explode = (trigger: number, x: number, y: number) => ({
    opacity: step >= trigger ? 1 : 0.04,
    transform: step >= trigger ? 'translate(0,0)' : `translate(${x}px,${y}px)`,
    transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
  })

  const glow = 'rgba(56,120,200,0.8)'
  const glowDim = 'rgba(56,120,200,0.4)'
  const green = 'rgba(68,255,136,0.8)'
  const gridC = 'rgba(56,120,200,0.03)'

  return (
    <svg viewBox="0 0 800 420" className="w-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* Glow filter */}
        <filter id="hglow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="hglow-strong" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {/* Perspective grid pattern */}
        <pattern id="hgrid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke={gridC} strokeWidth="0.5" />
        </pattern>
        <linearGradient id="scanGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3878c800" />
          <stop offset="50%" stopColor="#3878c818" />
          <stop offset="100%" stopColor="#3878c800" />
        </linearGradient>
      </defs>

      {/* Background grid */}
      <rect width="800" height="420" fill="url(#hgrid)" />

      {/* Ground plane - perspective lines */}
      <g style={t(0)}>
        <line x1="0" y1="340" x2="800" y2="340" stroke="#3878c812" strokeWidth="1" />
        {[100, 200, 300, 400, 500, 600, 700].map((x) => (
          <line key={x} x1={x} y1="340" x2={400 + (x - 400) * 0.3} y2="420" stroke="#3878c806" strokeWidth="0.5" />
        ))}
      </g>

      {/* ═══ CHASSIS FRAME - Step 1 ═══ */}
      <g style={explode(1, 0, 40)} filter="url(#hglow)">
        {/* Main frame rails */}
        <path d="M 180 295 L 180 290 L 620 290 L 620 295" fill="none" stroke={glow} strokeWidth="1.5" />
        <path d="M 180 305 L 180 310 L 620 310 L 620 305" fill="none" stroke={glow} strokeWidth="1.5" />
        {/* Cross members */}
        {[220, 300, 400, 500, 580].map((x) => (
          <line key={x} x1={x} y1="290" x2={x} y2="310" stroke={glowDim} strokeWidth="0.8" />
        ))}
        {/* Subframe front */}
        <path d="M 160 290 L 140 280 L 140 310 L 160 310" fill="none" stroke={glowDim} strokeWidth="1" />
        {/* Subframe rear */}
        <path d="M 640 290 L 660 280 L 660 310 L 640 310" fill="none" stroke={glowDim} strokeWidth="1" />
      </g>

      {/* ═══ BODY SHELL WIREFRAME - Step 2 ═══ */}
      <g style={explode(2, 0, -60)} filter="url(#hglow)">
        {/* Lower body profile */}
        <path
          d="M 130 280 L 120 270 L 110 220 L 115 200 L 680 200 L 690 220 L 685 270 L 670 280"
          fill="none" stroke={glow} strokeWidth="1.2"
        />
        {/* Roof profile */}
        <path
          d="M 270 200 L 290 120 L 310 100 L 530 95 L 560 110 L 570 200"
          fill="none" stroke={glow} strokeWidth="1.2"
        />
        {/* Windshield */}
        <path d="M 270 200 L 310 100" fill="none" stroke="#3878c890" strokeWidth="0.8" />
        <path d="M 290 200 L 330 100" fill="none" stroke="#3878c850" strokeWidth="0.5" />
        {/* Rear window */}
        <path d="M 570 200 L 530 100" fill="none" stroke="#3878c890" strokeWidth="0.8" />
        <path d="M 555 200 L 515 100" fill="none" stroke="#3878c850" strokeWidth="0.5" />
        {/* A-pillar */}
        <line x1="290" y1="120" x2="275" y2="200" stroke={glow} strokeWidth="0.8" />
        {/* B-pillar */}
        <line x1="410" y1="96" x2="410" y2="200" stroke={glow} strokeWidth="0.8" />
        {/* C-pillar */}
        <line x1="530" y1="100" x2="565" y2="200" stroke={glow} strokeWidth="0.8" />
        {/* Body wireframe grid lines - horizontal */}
        {[220, 240, 260].map((y) => (
          <path key={y} d={`M 118 ${y} L 683 ${y}`} fill="none" stroke="#3878c815" strokeWidth="0.5" />
        ))}
        {/* Body wireframe grid lines - vertical */}
        {[180, 250, 330, 420, 510, 600].map((x) => (
          <line key={x} x1={x} y1="200" x2={x - 5} y2="278" stroke="#3878c812" strokeWidth="0.5" />
        ))}
        {/* Roof wireframe */}
        {[120, 140, 160, 180].map((y) => (
          <path
            key={`r${y}`}
            d={`M ${290 + (y - 100) * 0.2} ${y} L ${530 - (y - 100) * 0.4} ${y - 3}`}
            fill="none" stroke="#3878c810" strokeWidth="0.4"
          />
        ))}
        {/* Wheel arches */}
        <path d="M 170 280 Q 200 230 240 280" fill="none" stroke={glow} strokeWidth="1.2" />
        <path d="M 560 280 Q 590 230 630 280" fill="none" stroke={glow} strokeWidth="1.2" />
        {/* Hood surface lines */}
        <path d="M 120 210 Q 200 195 270 200" fill="none" stroke="#3878c820" strokeWidth="0.5" />
        <path d="M 125 225 Q 200 210 275 200" fill="none" stroke="#3878c815" strokeWidth="0.4" />
        {/* Trunk surface */}
        <path d="M 570 200 Q 620 195 680 210" fill="none" stroke="#3878c820" strokeWidth="0.5" />
      </g>

      {/* ═══ ENGINE BLOCK - Step 3 ═══ */}
      <g style={explode(3, -80, -30)} filter="url(#hglow)">
        {/* Engine block */}
        <rect x="145" y="225" width="90" height="55" rx="4" fill="#44ff8808" stroke={green} strokeWidth="1" />
        {/* Cylinder head */}
        <rect x="150" y="215" width="80" height="15" rx="2" fill="none" stroke={green} strokeWidth="0.8" />
        {/* Cylinders */}
        {[165, 183, 201, 219].map((x) => (
          <g key={x}>
            <rect x={x} y="228" width="12" height="20" rx="1" fill="none" stroke="#44ff8850" strokeWidth="0.5" />
            <circle cx={x + 6} cy="238" r="4" fill="none" stroke="#44ff8830" strokeWidth="0.4" />
          </g>
        ))}
        {/* Intake manifold */}
        <path d="M 150 215 Q 170 200 190 205 Q 210 200 230 215" fill="none" stroke="#44ff8850" strokeWidth="0.6" />
        {/* Exhaust manifold */}
        <path d="M 155 280 L 140 290 L 130 305 Q 200 315 300 310" fill="none" stroke="#ff664430" strokeWidth="0.8" />
        <text x="190" y="260" textAnchor="middle" fill="#44ff8840" fontSize="7" fontFamily="monospace">V4 BLOCK</text>
      </g>

      {/* ═══ TRANSMISSION - Step 3 ═══ */}
      <g style={explode(3, -50, 20)} filter="url(#hglow)">
        <rect x="245" y="250" width="60" height="35" rx="4" fill="#44ff8806" stroke="#44ff8860" strokeWidth="0.8" />
        <circle cx="275" cy="267" r="10" fill="none" stroke="#44ff8840" strokeWidth="0.5" />
        <circle cx="275" cy="267" r="5" fill="none" stroke="#44ff8830" strokeWidth="0.5" />
        {/* Driveshaft */}
        <line x1="305" y1="267" x2="540" y2="267" stroke="#44ff8825" strokeWidth="1" strokeDasharray="4 3" />
        <text x="275" y="278" textAnchor="middle" fill="#44ff8830" fontSize="6" fontFamily="monospace">TRANS</text>
      </g>

      {/* ═══ SUSPENSION - Step 4 ═══ */}
      <g style={explode(4, 0, 30)} filter="url(#hglow)">
        {/* Front left */}
        <g>
          <line x1="200" y1="290" x2="200" y2="255" stroke="#3878c870" strokeWidth="1" />
          {/* Spring coils */}
          <path d="M 195 270 L 205 265 L 195 260 L 205 255" fill="none" stroke={glow} strokeWidth="0.8" />
          {/* Control arm */}
          <line x1="180" y1="300" x2="220" y2="295" stroke="#3878c850" strokeWidth="0.8" />
        </g>
        {/* Rear left */}
        <g>
          <line x1="595" y1="290" x2="595" y2="255" stroke="#3878c870" strokeWidth="1" />
          <path d="M 590 270 L 600 265 L 590 260 L 600 255" fill="none" stroke={glow} strokeWidth="0.8" />
          <line x1="575" y1="300" x2="615" y2="295" stroke="#3878c850" strokeWidth="0.8" />
        </g>
      </g>

      {/* ═══ ELECTRICAL / ECU - Step 5 ═══ */}
      <g style={explode(5, 30, -40)} filter="url(#hglow)">
        {/* Wiring harness */}
        <path
          d="M 175 240 C 250 220 350 225 420 228 C 480 230 540 235 600 250"
          fill="none" stroke="#ffaa2230" strokeWidth="1" strokeDasharray="3 4"
        />
        {/* ECU box */}
        <rect x="380" y="155" width="50" height="30" rx="3" fill="#ffaa2208" stroke="#ffaa2260" strokeWidth="0.8" />
        <text x="405" y="174" textAnchor="middle" fill="#ffaa2250" fontSize="7" fontFamily="monospace">ECU</text>
        {/* Sensor nodes */}
        {[{x: 175, y: 240}, {x: 320, y: 225}, {x: 480, y: 230}, {x: 600, y: 250}].map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill="#ffaa2220" stroke="#ffaa2260" strokeWidth="0.5" />
        ))}
        {/* Connection lines to ECU */}
        <line x1="380" y1="170" x2="320" y2="225" stroke="#ffaa2215" strokeWidth="0.4" />
        <line x1="430" y1="170" x2="480" y2="230" stroke="#ffaa2215" strokeWidth="0.4" />
      </g>

      {/* ═══ WHEELS - Step 6 ═══ */}
      <g style={explode(6, -40, 20)} filter="url(#hglow)">
        {/* Front wheel */}
        <g>
          <circle cx="205" cy="310" r="38" fill="#08080d" stroke={glow} strokeWidth="1.5" />
          <circle cx="205" cy="310" r="28" fill="none" stroke="#3878c840" strokeWidth="0.8" />
          <circle cx="205" cy="310" r="10" fill="none" stroke="#888899" strokeWidth="1.5" />
          <circle cx="205" cy="310" r="4" fill="none" stroke="#666677" strokeWidth="1" />
          {/* Spokes */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
            <line
              key={`fw${a}`}
              x1={205 + Math.cos((a * Math.PI) / 180) * 12}
              y1={310 + Math.sin((a * Math.PI) / 180) * 12}
              x2={205 + Math.cos((a * Math.PI) / 180) * 27}
              y2={310 + Math.sin((a * Math.PI) / 180) * 27}
              stroke="#888899" strokeWidth="0.6"
            />
          ))}
          {/* Tire tread marks */}
          {[0, 20, 40, 60, 80, 100, 120, 140, 160, 180, 200, 220, 240, 260, 280, 300, 320, 340].map((a) => (
            <line
              key={`ft${a}`}
              x1={205 + Math.cos((a * Math.PI) / 180) * 34}
              y1={310 + Math.sin((a * Math.PI) / 180) * 34}
              x2={205 + Math.cos((a * Math.PI) / 180) * 38}
              y2={310 + Math.sin((a * Math.PI) / 180) * 38}
              stroke="#3878c830" strokeWidth="0.5"
            />
          ))}
        </g>
      </g>
      <g style={explode(6, 40, 20)} filter="url(#hglow)">
        {/* Rear wheel */}
        <g>
          <circle cx="595" cy="310" r="38" fill="#08080d" stroke={glow} strokeWidth="1.5" />
          <circle cx="595" cy="310" r="28" fill="none" stroke="#3878c840" strokeWidth="0.8" />
          <circle cx="595" cy="310" r="10" fill="none" stroke="#888899" strokeWidth="1.5" />
          <circle cx="595" cy="310" r="4" fill="none" stroke="#666677" strokeWidth="1" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
            <line
              key={`rw${a}`}
              x1={595 + Math.cos((a * Math.PI) / 180) * 12}
              y1={310 + Math.sin((a * Math.PI) / 180) * 12}
              x2={595 + Math.cos((a * Math.PI) / 180) * 27}
              y2={310 + Math.sin((a * Math.PI) / 180) * 27}
              stroke="#888899" strokeWidth="0.6"
            />
          ))}
          {[0, 20, 40, 60, 80, 100, 120, 140, 160, 180, 200, 220, 240, 260, 280, 300, 320, 340].map((a) => (
            <line
              key={`rt${a}`}
              x1={595 + Math.cos((a * Math.PI) / 180) * 34}
              y1={310 + Math.sin((a * Math.PI) / 180) * 34}
              x2={595 + Math.cos((a * Math.PI) / 180) * 38}
              y2={310 + Math.sin((a * Math.PI) / 180) * 38}
              stroke="#3878c830" strokeWidth="0.5"
            />
          ))}
        </g>
      </g>

      {/* ═══ HEADLIGHTS + TAILLIGHTS - Step 7 ═══ */}
      <g style={explode(7, -20, 0)} filter="url(#hglow-strong)">
        {/* Headlights */}
        <ellipse cx="115" cy="235" rx="12" ry="8" fill="#aaccff10" stroke="#aaccff" strokeWidth="1" />
        <ellipse cx="115" cy="250" rx="10" ry="6" fill="#aaccff08" stroke="#aaccff80" strokeWidth="0.7" />
        {/* DRL strip */}
        <path d="M 112 225 Q 120 222 128 225" fill="none" stroke="#aaccff" strokeWidth="1.2" />
        {/* Headlight beam cone (subtle) */}
        <path d="M 105 240 L 40 220 L 40 260 Z" fill="#aaccff04" stroke="none" />
      </g>
      <g style={explode(7, 20, 0)} filter="url(#hglow-strong)">
        {/* Taillights */}
        <ellipse cx="685" cy="235" rx="10" ry="12" fill="#ff222210" stroke="#ff4444" strokeWidth="1" />
        <ellipse cx="685" cy="255" rx="8" ry="6" fill="#ff222208" stroke="#ff444480" strokeWidth="0.7" />
        {/* LED strip */}
        <path d="M 680 222 Q 688 220 695 225" fill="none" stroke="#ff4444" strokeWidth="1" />
      </g>

      {/* ═══ SURFACE / MATERIAL RENDER - Step 8 ═══ */}
      <g style={t(8)}>
        {/* Surface reflection lines */}
        <path d="M 200 200 Q 400 185 600 200" fill="none" stroke="#3878c810" strokeWidth="2" />
        <path d="M 250 240 Q 400 228 550 240" fill="none" stroke="#3878c808" strokeWidth="3" />
        {/* Door line */}
        <line x1="370" y1="200" x2="365" y2="278" stroke="#3878c818" strokeWidth="0.8" />
        {/* Door handle */}
        <line x1="385" y1="245" x2="405" y2="245" stroke="#3878c825" strokeWidth="1.5" strokeLinecap="round" />
        {/* Side mirror */}
        <path d="M 275 185 L 265 180 L 260 190 L 270 192 Z" fill="none" stroke="#3878c830" strokeWidth="0.7" />
        {/* Character line */}
        <path d="M 135 255 L 665 255" fill="none" stroke="#3878c808" strokeWidth="0.6" />
      </g>

      {/* ═══ FINAL - DIAGNOSTIC OVERLAY - Step 9 ═══ */}
      <g style={t(9)}>
        {/* Corner brackets */}
        <path d="M 80 85 L 80 70 L 100 70" fill="none" stroke="#3878c840" strokeWidth="1" />
        <path d="M 720 85 L 720 70 L 700 70" fill="none" stroke="#3878c840" strokeWidth="1" />
        <path d="M 80 355 L 80 370 L 100 370" fill="none" stroke="#3878c840" strokeWidth="1" />
        <path d="M 720 355 L 720 370 L 700 370" fill="none" stroke="#3878c840" strokeWidth="1" />

        {/* Data readouts - top right */}
        <g>
          <text x="710" y="100" textAnchor="end" fill="#3878c850" fontSize="8" fontFamily="monospace">SYS: ONLINE</text>
          <text x="710" y="112" textAnchor="end" fill="#44ff8850" fontSize="8" fontFamily="monospace">MESH: 12,847 TRI</text>
          <text x="710" y="124" textAnchor="end" fill="#3878c830" fontSize="8" fontFamily="monospace">MAT: PBR METALLIC</text>
          <text x="710" y="136" textAnchor="end" fill="#3878c830" fontSize="8" fontFamily="monospace">ENV: HDR STUDIO</text>
        </g>

        {/* Dimension lines */}
        <g>
          {/* Wheelbase */}
          <line x1="205" y1="365" x2="595" y2="365" stroke="#3878c820" strokeWidth="0.5" />
          <line x1="205" y1="360" x2="205" y2="370" stroke="#3878c830" strokeWidth="0.5" />
          <line x1="595" y1="360" x2="595" y2="370" stroke="#3878c830" strokeWidth="0.5" />
          <text x="400" y="375" textAnchor="middle" fill="#3878c825" fontSize="7" fontFamily="monospace">2,750mm WHEELBASE</text>
          {/* Height */}
          <line x1="730" y1="95" x2="730" y2="340" stroke="#3878c815" strokeWidth="0.5" />
          <text x="740" y="220" fill="#3878c820" fontSize="7" fontFamily="monospace" transform="rotate(90,740,220)">1,450mm</text>
        </g>
      </g>

      {/* Scanning line effect - always visible */}
      <rect x="80" width="640" height="6" fill="url(#scanGrad)" rx="1">
        <animate attributeName="y" from="60" to="380" dur="2.5s" repeatCount="indefinite" />
      </rect>
    </svg>
  )
}

/* ─── Main Loading Screen ─── */
export function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= ASSEMBLY_STEPS.length) {
          clearInterval(interval)
          return prev
        }
        return prev + 1
      })
    }, 350)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (currentStep >= ASSEMBLY_STEPS.length) {
      const timeout = setTimeout(() => setFadeOut(true), 500)
      return () => clearTimeout(timeout)
    }
  }, [currentStep])

  const handleFadeEnd = useCallback(() => {
    if (fadeOut) onComplete()
  }, [fadeOut, onComplete])

  const progress = Math.min((currentStep / ASSEMBLY_STEPS.length) * 100, 100)

  return (
    <div
      className={`absolute inset-0 z-50 flex flex-col items-center justify-center transition-opacity duration-700 ${
        fadeOut ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
      }`}
      style={{
        background: '#08080d',
        transitionProperty: 'opacity, transform',
      }}
      onTransitionEnd={handleFadeEnd}
    >
      {/* Title */}
      <div className="mb-4 text-center">
        <h2 className="text-2xl font-semibold tracking-wide">
          <span className="text-white/80">Building </span>
          <span className="text-accent-blue">Digital Twin</span>
        </h2>
      </div>

      {/* Holographic car */}
      <div className="w-full max-w-3xl px-4 mb-4">
        <HoloCar step={currentStep} />
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-md px-8 mb-5">
        <div className="flex justify-between text-xs font-mono text-white/25 mb-1.5">
          <span>ASSEMBLY</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300 ease-out"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, rgba(255,255,255,0.5), rgba(255,255,255,0.8))',
            }}
          />
        </div>
      </div>

      {/* Step log */}
      <div className="w-full max-w-md px-8">
        <div className="space-y-1">
          {ASSEMBLY_STEPS.map((step, i) => {
            const isDone = i < currentStep
            const isActive = i === currentStep - 1 && currentStep <= ASSEMBLY_STEPS.length
            const isUpcoming = i >= currentStep

            return (
              <div
                key={step.label}
                className="flex items-center gap-3 text-xs font-mono transition-all duration-300"
                style={{
                  opacity: isUpcoming ? 0.15 : isActive ? 1 : 0.35,
                  transform: isUpcoming ? 'translateX(8px)' : 'translateX(0)',
                }}
              >
                <div className="w-4 flex-shrink-0 flex justify-center">
                  {isDone ? (
                    <svg className="w-3 h-3 text-accent-green" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
                    </svg>
                  ) : isActive ? (
                    <div className="w-2 h-2 rounded-full bg-accent-blue animate-pulse" style={{ boxShadow: '0 0 8px rgba(56,120,200,0.5)' }} />
                  ) : (
                    <div className="w-1 h-1 rounded-full bg-white/20" />
                  )}
                </div>
                <span className={isActive ? 'text-accent-blue' : isDone ? 'text-white/40' : 'text-white/15'}>
                  {step.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
