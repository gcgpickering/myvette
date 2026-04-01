import { useState } from 'react'
import { getGeneration } from '../../data/corvette-generations'
import { getColorsForGeneration } from '../../data/corvette-colors'
import { useColorStore } from '../../stores/colorStore'

interface GenerationInfoProps {
  generationCode: string
  onClose: () => void
}

const QUALITY_CONFIG: Record<string, { color: string; bg: string; note: string }> = {
  excellent: {
    color: 'text-green-400',
    bg: 'bg-green-400/15',
    note: 'Full mesh-level interaction \u2014 click individual parts',
  },
  good: {
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/15',
    note: 'Named mesh groups \u2014 click major components',
  },
  generic: {
    color: 'text-white/50',
    bg: 'bg-white/10',
    note: 'Material-based detection \u2014 basic X-ray and color',
  },
}

const SPEC_FIELDS: { key: string; label: string }[] = [
  { key: 'engine', label: 'Engine' },
  { key: 'horsepower', label: 'Power' },
  { key: 'torque', label: 'Torque' },
  { key: 'zeroToSixty', label: '0-60 mph' },
  { key: 'transmission', label: 'Transmission' },
  { key: 'layout', label: 'Layout' },
]

export function GenerationInfo({ generationCode, onClose }: GenerationInfoProps) {
  const gen = getGeneration(generationCode)
  const colors = getColorsForGeneration(generationCode)
  const setBodyColor = useColorStore((s) => s.setBodyColor)
  const [hoveredColor, setHoveredColor] = useState<string | null>(null)

  if (!gen) {
    return (
      <div className="h-full flex flex-col p-5">
        <p className="text-white/50 text-sm">Unknown generation: {generationCode}</p>
      </div>
    )
  }

  const quality = QUALITY_CONFIG[gen.meshQuality] ?? QUALITY_CONFIG.generic

  return (
    <div className="h-full flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="shrink-0 px-5 pt-5 pb-4 border-b border-border-subtle flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="inline-block px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider text-white"
              style={{ backgroundColor: '#c41e2a' }}
            >
              {gen.code.toUpperCase()}
            </span>
            <h2 className="text-base font-semibold text-white/90 truncate">{gen.name}</h2>
          </div>
          <p className="mt-1 text-xs text-white/50">{gen.yearRange}</p>
        </div>
        <button
          onClick={onClose}
          className="shrink-0 w-7 h-7 rounded-md flex items-center justify-center text-white/40 hover:text-white/80 hover:bg-white/5 transition-colors duration-150"
          aria-label="Close panel"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-0">
        {/* Heritage */}
        <section>
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-white/40 mb-2">Heritage</h3>
          <p className="text-sm leading-relaxed text-white/60">{gen.heritage}</p>
        </section>

        <hr className="border-border-subtle my-4" />

        {/* Specifications */}
        <section>
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-white/40 mb-3">Specifications</h3>
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            {SPEC_FIELDS.map(({ key, label }) => (
              <div key={key}>
                <span className="block text-[10px] uppercase tracking-wider text-white/40">{label}</span>
                <span className="block text-sm text-white/80 mt-0.5">
                  {gen.specs[key as keyof typeof gen.specs]}
                </span>
              </div>
            ))}
          </div>
        </section>

        <hr className="border-border-subtle my-4" />

        {/* Factory Colors */}
        <section>
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-white/40 mb-3">Factory Colors</h3>
          <div className="flex flex-wrap gap-2">
            {colors.map((c) => (
              <div key={c.hex} className="relative">
                <button
                  onClick={() => setBodyColor(c.hex)}
                  onMouseEnter={() => setHoveredColor(c.name)}
                  onMouseLeave={() => setHoveredColor(null)}
                  className="w-6 h-6 rounded-full border border-white/10 hover:border-white/40 transition-colors duration-150 hover:scale-110 transform"
                  style={{ backgroundColor: c.hex }}
                  aria-label={`Apply ${c.name}`}
                />
                {hoveredColor === c.name && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 rounded bg-black/90 text-[10px] text-white whitespace-nowrap pointer-events-none z-10">
                    {c.name}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <hr className="border-border-subtle my-4" />

        {/* 3D Model */}
        <section>
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-white/40 mb-2">3D Model</h3>
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${quality.color} ${quality.bg}`}>
              {gen.meshQuality}
            </span>
            <span className="text-xs text-white/50">{gen.meshCount} meshes</span>
          </div>
          <p className="text-xs text-white/40 leading-relaxed">{quality.note}</p>
        </section>

        <hr className="border-border-subtle my-4" />

        {/* Model Credit */}
        <section>
          <h3 className="text-[10px] font-semibold uppercase tracking-wider text-white/40 mb-1">Model Credit</h3>
          <p className="text-xs text-white/50">
            3D model sourced from curated registry for the {gen.representativeYear} {gen.name}.
          </p>
        </section>
      </div>
    </div>
  )
}
