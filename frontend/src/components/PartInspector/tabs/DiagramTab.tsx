import { partDiagrams } from '../../../data/diagrams'
import type { PartType } from '../../../types'

interface DiagramTabProps {
  partType: PartType
}

export function DiagramTab({ partType }: DiagramTabProps) {
  const DiagramComponent = (partType.svgDiagramKey ? partDiagrams[partType.svgDiagramKey] : undefined) ?? partDiagrams[partType.slug]

  return (
    <div className="space-y-4">
      {DiagramComponent ? (
        <>
          <div className="rounded-lg border border-border-subtle p-4 bg-white/[0.02]">
            <DiagramComponent />
          </div>
          <p className="text-white/40 text-xs text-center leading-relaxed">
            Simplified cross-section diagram of the {partType.name.toLowerCase()}.
            Key internal components are labeled for reference.
          </p>
        </>
      ) : (
        <div className="rounded-lg border border-border-subtle p-8 bg-white/[0.02] text-center">
          <svg
            className="w-10 h-10 mx-auto mb-3 text-white/20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          <p className="text-white/40 text-sm">
            Diagram not available for this part type
          </p>
        </div>
      )}
    </div>
  )
}
