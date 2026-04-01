import { useState, useEffect } from 'react'
import type { PartSlug, PartType, VehiclePart } from '../../types'
import { getPartType, getVehiclePart } from '../../api/parts'
import { OverviewTab } from './tabs/OverviewTab'
import { SpecsTab } from './tabs/SpecsTab'
import { HealthTab } from './tabs/HealthTab'
import { DiagramTab } from './tabs/DiagramTab'

interface PartInspectorProps {
  partSlug: PartSlug
  vehicleId: number
  onClose: () => void
  onFindUpgrades: (partSlug: PartSlug) => void
}

type TabId = 'overview' | 'specs' | 'health' | 'diagram'

const TABS: { id: TabId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'specs', label: 'Specs' },
  { id: 'health', label: 'Health' },
  { id: 'diagram', label: 'Diagram' },
]

export function PartInspector({ partSlug, vehicleId, onClose, onFindUpgrades }: PartInspectorProps) {
  const [activeTab, setActiveTab] = useState<TabId>('overview')
  const [partType, setPartType] = useState<PartType | null>(null)
  const [vehiclePart, setVehiclePart] = useState<VehiclePart | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    setActiveTab('overview')

    Promise.all([
      getPartType(partSlug).catch(() => null),
      getVehiclePart(vehicleId, partSlug).catch(() => null),
    ]).then(([pt, vp]) => {
      if (cancelled) return
      if (pt) {
        setPartType(pt)
        setVehiclePart(vp)
      } else {
        setError('Could not load part information')
      }
      setLoading(false)
    })

    return () => { cancelled = true }
  }, [partSlug, vehicleId])

  const displayName = partSlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

  return (
    <div className="h-full flex flex-col" style={{ background: 'rgba(8,8,13,0.5)' }}>
      {/* Header */}
      <div className="shrink-0 px-4 py-3 border-b border-border-subtle flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-semibold text-white/90 truncate">
            {partType?.name ?? displayName}
          </h2>
          {partType && (
            <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider bg-accent-red/10 text-accent-red">
              {partType.category}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="shrink-0 w-7 h-7 rounded-md flex items-center justify-center text-white/40 hover:text-white/80 hover:bg-white/5 transition-colors duration-150"
          aria-label="Close inspector"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Tab bar */}
      <div className="shrink-0 flex border-b border-border-subtle">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2.5 text-xs font-medium transition-colors duration-150 border-b-2 ${
              activeTab === tab.id
                ? 'text-accent-red border-accent-red'
                : 'text-white/50 border-transparent hover:text-white/70'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <LoadingSkeleton />
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-400/70 text-sm">{error}</p>
          </div>
        ) : partType ? (
          <>
            {activeTab === 'overview' && (
              <OverviewTab partType={partType} onFindUpgrades={onFindUpgrades} />
            )}
            {activeTab === 'specs' && (
              <SpecsTab partType={partType} vehiclePart={vehiclePart} />
            )}
            {activeTab === 'health' && <HealthTab partType={partType} />}
            {activeTab === 'diagram' && <DiagramTab partType={partType} />}
          </>
        ) : null}
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-4 bg-white/5 rounded w-3/4" />
      <div className="h-3 bg-white/5 rounded w-full" />
      <div className="h-3 bg-white/5 rounded w-full" />
      <div className="h-3 bg-white/5 rounded w-5/6" />
      <div className="h-8 bg-white/5 rounded w-full mt-6" />
      <div className="h-3 bg-white/5 rounded w-2/3" />
      <div className="h-3 bg-white/5 rounded w-full" />
      <div className="h-3 bg-white/5 rounded w-4/5" />
    </div>
  )
}
