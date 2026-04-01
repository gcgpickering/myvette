import { useNavigate } from 'react-router-dom'
import { GENERATIONS } from '../../data/corvette-generations'

export function GenerationPicker() {
  const navigate = useNavigate()

  return (
    <div
      className="grid gap-6 w-full max-w-6xl mx-auto px-4"
      style={{
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      }}
    >
      {GENERATIONS.map((gen, index) => (
        <div
          key={gen.code}
          onClick={() => navigate(`/generation/${gen.code}`)}
          className="relative cursor-pointer rounded-xl p-5 transition-all duration-300"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            animation: 'fadeUp 0.8s ease both',
            animationDelay: `${0.1 * index}s`,
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget
            el.style.transform = 'translateY(-4px)'
            el.style.border = '1px solid rgba(196,30,42,0.4)'
            el.style.boxShadow = '0 8px 32px rgba(196,30,42,0.15)'
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget
            el.style.transform = 'translateY(0)'
            el.style.border = '1px solid rgba(255,255,255,0.06)'
            el.style.boxShadow = 'none'
          }}
        >
          {/* Generation badge */}
          <span
            className="absolute top-3 left-3 text-xs font-bold uppercase tracking-wider text-white rounded px-2 py-0.5"
            style={{ background: '#c41e2a' }}
          >
            {gen.code.toUpperCase()}
          </span>

          <div className="mt-6 space-y-1">
            {/* Year range */}
            <p className="text-sm text-gray-400">{gen.yearRange}</p>

            {/* Name */}
            <h3 className="text-lg font-semibold text-white">{gen.name}</h3>

            {/* Tagline */}
            <p className="text-sm text-gray-500 italic">{gen.tagline}</p>
          </div>

          {/* Horsepower spec */}
          <div className="mt-4 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <span className="text-xs text-gray-500 uppercase tracking-wide">Power</span>
            <p className="text-base font-medium text-white">{gen.specs.horsepower}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
