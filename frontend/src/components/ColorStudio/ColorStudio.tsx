import { useMemo } from 'react'
import { useState } from 'react'
import { useColorStore } from '../../stores/colorStore'
import { useGenerationStore } from '../../stores/generationStore'
import { getColorsForGeneration } from '../../data/corvette-colors'
import { getGeneration } from '../../data/corvette-generations'

/* ─── Color Swatch Component ─── */
function ColorSwatch({
  color,
  name,
  isSelected,
  onClick,
}: {
  color: string
  name: string
  isSelected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      title={name}
      style={{
        width: 32,
        height: 32,
        borderRadius: 8,
        border: isSelected ? '2px solid rgba(255,255,255,0.6)' : '1px solid rgba(255,255,255,0.1)',
        background: color,
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        transform: isSelected ? 'scale(1.1)' : 'scale(1)',
        boxShadow: isSelected ? '0 0 0 2px rgba(255,255,255,0.3)' : 'none',
        position: 'relative',
        flexShrink: 0,
      }}
      onMouseEnter={(e) => {
        if (!isSelected) e.currentTarget.style.transform = 'scale(1.1)'
      }}
      onMouseLeave={(e) => {
        if (!isSelected) e.currentTarget.style.transform = 'scale(1)'
      }}
    >
      {isSelected && (
        <svg
          viewBox="0 0 24 24"
          style={{
            position: 'absolute',
            inset: 0,
            margin: 'auto',
            width: 14,
            height: 14,
          }}
          fill="none"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 6L9 17l-5-5" />
        </svg>
      )}
    </button>
  )
}

/* ─── Custom Color Picker ─── */
function CustomColorPicker({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  return (
    <label
      style={{
        width: 32,
        height: 32,
        borderRadius: 8,
        border: '2px dashed rgba(255,255,255,0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0,
        transition: 'border-color 0.15s ease',
      }}
      title="Custom color"
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
      }}
    >
      <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>+</span>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          opacity: 0,
          cursor: 'pointer',
        }}
      />
    </label>
  )
}

/* ─── Collapsible Section ─── */
function Section({
  title,
  defaultOpen = true,
  children,
}: {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 0',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'rgba(255,255,255,0.5)',
        }}
      >
        <span
          style={{
            fontSize: 10,
            fontFamily: "'DM Mono', monospace",
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            fontWeight: 600,
          }}
        >
          {title}
        </span>
        <svg
          viewBox="0 0 24 24"
          style={{
            width: 14,
            height: 14,
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
          }}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      <div
        style={{
          maxHeight: open ? 200 : 0,
          overflow: 'hidden',
          transition: 'max-height 0.25s ease',
        }}
      >
        <div style={{ paddingBottom: 12 }}>{children}</div>
      </div>
    </div>
  )
}

/* ─── Main Color Studio Component ─── */
export function ColorStudio({ onClose }: { onClose: () => void }) {
  const {
    bodyColor,
    setBodyColor,
    resetToStock,
  } = useColorStore()

  const selectedGeneration = useGenerationStore((s) => s.selectedGeneration)
  const generation = selectedGeneration ? getGeneration(selectedGeneration) : null
  const stockColors = useMemo(
    () => selectedGeneration ? getColorsForGeneration(selectedGeneration) : [],
    [selectedGeneration],
  )

  const sectionTitle = generation ? `${generation.name} Factory Colors` : 'OEM Colors'

  return (
    <div className="h-full flex flex-col" style={{ background: 'rgba(8, 8, 13, 0.95)' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <h2
          style={{
            fontSize: 12,
            fontFamily: "'DM Mono', monospace",
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            color: 'rgba(196,30,42,0.8)',
            fontWeight: 700,
            margin: 0,
          }}
        >
          Color Studio
        </h2>
        <button
          onClick={onClose}
          style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'rgba(255,255,255,0.4)',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'rgba(255,255,255,0.8)'
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'rgba(255,255,255,0.4)'
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
          }}
        >
          <svg viewBox="0 0 24 24" style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Scrollable content */}
      <div
        className="flex-1 overflow-y-auto"
        style={{
          padding: '0 20px',
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(255,255,255,0.08) transparent',
        }}
      >
        {/* Body Paint — OEM colors for current generation */}
        <Section title={sectionTitle}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {/* Stock = original GLTF texture (white passthrough) */}
            <ColorSwatch
              color="#ffffff"
              name="Stock"
              isSelected={bodyColor === '#ffffff'}
              onClick={() => setBodyColor('#ffffff')}
            />
            {stockColors.map((c) => (
              <ColorSwatch
                key={c.hex}
                color={c.hex}
                name={c.name}
                isSelected={bodyColor === c.hex}
                onClick={() => setBodyColor(c.hex)}
              />
            ))}
            <CustomColorPicker value={bodyColor} onChange={setBodyColor} />
          </div>
        </Section>

        {/* Wheels — coming soon */}
        <Section title="Wheels" defaultOpen={false}>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', fontFamily: "'DM Mono', monospace", margin: 0 }}>
            Coming soon
          </p>
        </Section>

        {/* Brake Calipers — coming soon */}
        <Section title="Brake Calipers" defaultOpen={false}>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', fontFamily: "'DM Mono', monospace", margin: 0 }}>
            Coming soon
          </p>
        </Section>

        {/* Window Tint — coming soon */}
        <Section title="Window Tint" defaultOpen={false}>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', fontFamily: "'DM Mono', monospace", margin: 0 }}>
            Coming soon
          </p>
        </Section>

        {/* Accents — coming soon */}
        <Section title="Accents" defaultOpen={false}>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', fontFamily: "'DM Mono', monospace", margin: 0 }}>
            Coming soon
          </p>
        </Section>
      </div>

      {/* Footer: Reset */}
      <div
        style={{
          padding: '12px 20px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <button
          onClick={resetToStock}
          style={{
            width: '100%',
            padding: '10px 0',
            borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'transparent',
            cursor: 'pointer',
            color: 'rgba(255,255,255,0.4)',
            fontSize: 11,
            fontFamily: "'DM Mono', monospace",
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255,100,100,0.4)'
            e.currentTarget.style.color = 'rgba(255,100,100,0.7)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
            e.currentTarget.style.color = 'rgba(255,255,255,0.4)'
          }}
        >
          Reset All to Stock
        </button>
      </div>
    </div>
  )
}
