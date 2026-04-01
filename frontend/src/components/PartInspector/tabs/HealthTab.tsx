import type { PartType } from '../../../types'

interface HealthTabProps {
  partType: PartType
}

export function HealthTab({ partType }: HealthTabProps) {
  return (
    <div className="space-y-6">
      {/* Condition estimate placeholder */}
      <section>
        <h3 className="text-sm font-semibold text-white/90 uppercase tracking-wider mb-3">
          Estimated Condition
        </h3>
        <div className="rounded-lg border border-border-subtle p-4 bg-white/[0.02]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full w-0 bg-accent-green rounded-full" />
            </div>
          </div>
          <p className="text-white/40 text-sm text-center">
            Enter vehicle mileage for a health estimate
          </p>
        </div>
      </section>

      {/* Maintenance intervals */}
      {partType.maintenanceSchedule && (
        <section>
          <h3 className="text-sm font-semibold text-white/90 uppercase tracking-wider mb-3">
            Maintenance Intervals
          </h3>
          <div className="rounded-lg border border-border-subtle p-3 bg-white/[0.02]">
            <div className="flex items-start gap-2">
              <svg
                className="w-4 h-4 text-accent-red mt-0.5 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <p className="text-white/60 text-sm leading-relaxed">
                {partType.maintenanceSchedule}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Common failure symptoms */}
      {partType.commonFailures && partType.commonFailures.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-white/90 uppercase tracking-wider mb-3">
            Failure Symptoms
          </h3>
          <div className="space-y-2">
            {partType.commonFailures!.map((failure: string, i: number) => {
              const severity = i === 0 ? 'High' : i === 1 ? 'Medium' : 'Low'
              const severityColor =
                severity === 'High'
                  ? 'text-red-400 bg-red-400/10'
                  : severity === 'Medium'
                    ? 'text-amber-400 bg-amber-400/10'
                    : 'text-green-400 bg-green-400/10'

              return (
                <div
                  key={i}
                  className="flex items-start gap-3 px-3 py-2.5 rounded-lg bg-white/[0.02] border border-border-subtle"
                >
                  <span
                    className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${severityColor}`}
                  >
                    {severity}
                  </span>
                  <span className="text-white/60 text-sm">{failure}</span>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Recall status */}
      <section>
        <h3 className="text-sm font-semibold text-white/90 uppercase tracking-wider mb-3">
          Recall Status
        </h3>
        <div className="rounded-lg border border-border-subtle p-4 bg-white/[0.02] flex items-center gap-3">
          <svg
            className="w-5 h-5 text-green-400 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <div>
            <p className="text-white/70 text-sm">No recalls found</p>
            <p className="text-white/30 text-xs mt-0.5">
              Check NHTSA for latest recalls
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
