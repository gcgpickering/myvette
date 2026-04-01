import { create } from 'zustand'

interface GenerationState {
  selectedGeneration: string | null // 'c3' through 'c8'
  setGeneration: (gen: string) => void
  clearGeneration: () => void
}

export const useGenerationStore = create<GenerationState>((set) => ({
  selectedGeneration: null,
  setGeneration: (gen) => set({ selectedGeneration: gen }),
  clearGeneration: () => set({ selectedGeneration: null }),
}))
