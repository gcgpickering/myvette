import type { PartType, PartSlug } from '../../../types'

interface OverviewTabProps {
  partType: PartType
  onFindUpgrades: (partSlug: PartSlug) => void
}

export function OverviewTab({ partType, onFindUpgrades }: OverviewTabProps) {
  return (
    <div className="space-y-6">
      {/* Description */}
      <section>
        <p className="text-white/70 text-sm leading-relaxed">{partType.description}</p>
      </section>

      {/* How It Works */}
      <section>
        <h3 className="text-sm font-semibold text-white/90 uppercase tracking-wider mb-2">
          How It Works
        </h3>
        <p className="text-white/60 text-sm leading-relaxed">{partType.howItWorks}</p>
      </section>

      {/* Common Failures */}
      {partType.commonFailures && partType.commonFailures.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-white/90 uppercase tracking-wider mb-2">
            Common Failures
          </h3>
          <ul className="space-y-2">
            {partType.commonFailures!.map((failure: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <svg
                  className="w-4 h-4 text-amber-400 mt-0.5 shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <span className="text-white/60">{failure}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Maintenance Schedule */}
      {partType.maintenanceSchedule && (
        <section>
          <h3 className="text-sm font-semibold text-white/90 uppercase tracking-wider mb-2">
            Maintenance Schedule
          </h3>
          <p className="text-white/60 text-sm leading-relaxed">{partType.maintenanceSchedule}</p>
        </section>
      )}

      {/* Find Upgrades CTA */}
      <button
        onClick={() => onFindUpgrades(partType.slug)}
        className="w-full py-2.5 px-4 rounded-lg bg-accent-green/15 text-accent-green font-medium text-sm
                   hover:bg-accent-green/25 transition-colors duration-200 border border-accent-green/20"
      >
        Find Upgrades for {partType.name}
      </button>
    </div>
  )
}
