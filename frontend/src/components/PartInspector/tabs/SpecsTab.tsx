import type { PartType, VehiclePart } from '../../../types'

interface SpecsTabProps {
  partType: PartType
  vehiclePart: VehiclePart | null
}

export function SpecsTab({ partType, vehiclePart }: SpecsTabProps) {
  const specs = vehiclePart?.specs
  const oemNumbers = vehiclePart?.oemPartNumbers

  return (
    <div className="space-y-6">
      {/* Specs grid */}
      {specs && Object.keys(specs).length > 0 ? (
        <section>
          <h3 className="text-sm font-semibold text-white/90 uppercase tracking-wider mb-3">
            Vehicle Specifications
          </h3>
          <div className="rounded-lg border border-border-subtle overflow-hidden">
            {Object.entries(specs).map(([key, value], i) => (
              <div
                key={key}
                className={`flex items-center justify-between px-3 py-2.5 ${
                  i % 2 === 0 ? 'bg-white/[0.02]' : ''
                }`}
              >
                <span className="text-white/60 text-sm capitalize">
                  {key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}
                </span>
                <span className="text-white font-mono text-sm">{String(value)}</span>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section>
          <div className="rounded-lg border border-border-subtle p-4 bg-white/[0.02]">
            <p className="text-white/40 text-sm text-center">
              No vehicle-specific specs available for this {partType.name.toLowerCase()}.
            </p>
            <p className="text-white/30 text-xs text-center mt-1">
              Generic part type information is shown in the Overview tab.
            </p>
          </div>
        </section>
      )}

      {/* OEM Part Numbers */}
      {oemNumbers && oemNumbers.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-white/90 uppercase tracking-wider mb-3">
            OEM Part Numbers
          </h3>
          <div className="space-y-1.5">
            {oemNumbers.map((pn, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-3 py-2 rounded bg-white/[0.03] border border-border-subtle"
              >
                <svg
                  className="w-3.5 h-3.5 text-accent-red shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <line x1="7" y1="7" x2="7.01" y2="7" />
                  <line x1="7" y1="12" x2="17" y2="12" />
                  <line x1="7" y1="17" x2="17" y2="17" />
                </svg>
                <span className="text-white font-mono text-sm">{pn}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Part type reference */}
      <section>
        <h3 className="text-sm font-semibold text-white/90 uppercase tracking-wider mb-2">
          Part Category
        </h3>
        <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-accent-red/10 text-accent-red">
          {partType.category}
        </span>
      </section>
    </div>
  )
}
