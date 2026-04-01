import { create } from 'zustand'
import type { PartSlug, VehiclePart } from '../types'

export type ViewMode = 'normal' | 'exploded' | 'xray'

interface PartState {
  selectedPart: PartSlug | null
  hoveredPart: PartSlug | null
  vehicleParts: VehiclePart[]
  inspectorOpen: boolean
  viewMode: ViewMode
  explodedPart: PartSlug | null

  // Mesh group tracking (for named mesh interaction)
  selectedMeshGroup: string | null
  hoveredMeshGroup: string | null

  setSelectedPart: (part: PartSlug | null) => void
  setHoveredPart: (part: PartSlug | null) => void
  setVehicleParts: (parts: VehiclePart[]) => void
  openInspector: () => void
  closeInspector: () => void
  setViewMode: (mode: ViewMode) => void
  setExplodedPart: (part: PartSlug | null) => void
  setSelectedMeshGroup: (name: string | null) => void
  setHoveredMeshGroup: (name: string | null) => void
}

export const usePartStore = create<PartState>((set) => ({
  selectedPart: null,
  hoveredPart: null,
  vehicleParts: [],
  inspectorOpen: false,
  viewMode: 'normal',
  explodedPart: null,
  selectedMeshGroup: null,
  hoveredMeshGroup: null,

  setSelectedPart: (part) => set({ selectedPart: part, inspectorOpen: part !== null }),
  setHoveredPart: (part) => set({ hoveredPart: part }),
  setVehicleParts: (parts) => set({ vehicleParts: parts }),
  openInspector: () => set({ inspectorOpen: true }),
  closeInspector: () => set({ inspectorOpen: false, selectedPart: null }),
  setViewMode: (mode) => set({ viewMode: mode, explodedPart: null }),
  setExplodedPart: (part) => set((state) => ({
    explodedPart: state.explodedPart === part ? null : part,
  })),
  setSelectedMeshGroup: (name) => set({ selectedMeshGroup: name }),
  setHoveredMeshGroup: (name) => set({ hoveredMeshGroup: name }),
}))
