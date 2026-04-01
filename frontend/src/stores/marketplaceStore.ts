import { create } from 'zustand'
import type { ScrapeResult, ScrapeJob, UpgradeCategory } from '../types'

interface MarketplaceState {
  isOpen: boolean
  results: ScrapeResult[]
  currentJob: ScrapeJob | null
  selectedCategory: UpgradeCategory | null
  categories: UpgradeCategory[]
  sortBy: 'price' | 'rating' | 'best_value'
  minRating: number
  maxPrice: number | null
  retailerFilter: string | null
  loading: boolean

  open: () => void
  close: () => void
  setResults: (results: ScrapeResult[]) => void
  addResults: (results: ScrapeResult[]) => void
  setCurrentJob: (job: ScrapeJob | null) => void
  setSelectedCategory: (cat: UpgradeCategory | null) => void
  setCategories: (cats: UpgradeCategory[]) => void
  setSortBy: (sort: 'price' | 'rating' | 'best_value') => void
  setMinRating: (rating: number) => void
  setMaxPrice: (price: number | null) => void
  setRetailerFilter: (retailer: string | null) => void
  setLoading: (loading: boolean) => void
  reset: () => void
}

const initialState = {
  isOpen: false,
  results: [],
  currentJob: null,
  selectedCategory: null,
  categories: [],
  sortBy: 'best_value' as const,
  minRating: 0,
  maxPrice: null,
  retailerFilter: null,
  loading: false,
}

export const useMarketplaceStore = create<MarketplaceState>((set) => ({
  ...initialState,

  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  setResults: (results) => set({ results }),
  addResults: (results) =>
    set((state) => ({ results: [...state.results, ...results] })),
  setCurrentJob: (job) => set({ currentJob: job }),
  setSelectedCategory: (cat) => set({ selectedCategory: cat }),
  setCategories: (cats) => set({ categories: cats }),
  setSortBy: (sort) => set({ sortBy: sort }),
  setMinRating: (rating) => set({ minRating: rating }),
  setMaxPrice: (price) => set({ maxPrice: price }),
  setRetailerFilter: (retailer) => set({ retailerFilter: retailer }),
  setLoading: (loading) => set({ loading }),
  reset: () => set(initialState),
}))
