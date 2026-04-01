import { create } from 'zustand'

export type AccentStyle = 'body-match' | 'gloss-black' | 'matte-black' | 'carbon' | 'chrome'

interface ColorState {
  bodyColor: string
  wheelColor: string
  caliperColor: string
  windowTint: number // 0-100 (0 = clear, 100 = limo)
  accentStyle: AccentStyle
  isStudioOpen: boolean

  setBodyColor: (c: string) => void
  setWheelColor: (c: string) => void
  setCaliperColor: (c: string) => void
  setWindowTint: (t: number) => void
  setAccentStyle: (s: AccentStyle) => void
  openStudio: () => void
  closeStudio: () => void
  resetToStock: () => void
}

const STOCK_DEFAULTS = {
  bodyColor: '#ffffff',
  wheelColor: '#c0c0c0',
  caliperColor: '#aaaaaa',
  windowTint: 20,
  accentStyle: 'body-match' as AccentStyle,
}

function loadPersistedColors(vehicleKey: string | null): typeof STOCK_DEFAULTS {
  if (!vehicleKey) return STOCK_DEFAULTS
  try {
    const raw = localStorage.getItem(`myvette_colors_${vehicleKey}`)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<typeof STOCK_DEFAULTS>
      return { ...STOCK_DEFAULTS, ...parsed }
    }
  } catch { /* ignore */ }
  return STOCK_DEFAULTS
}

function persistColors(vehicleKey: string | null, state: Partial<typeof STOCK_DEFAULTS>) {
  if (!vehicleKey) return
  try {
    localStorage.setItem(`myvette_colors_${vehicleKey}`, JSON.stringify(state))
  } catch { /* ignore */ }
}

// Current vehicle key for persistence — set externally
let currentVehicleKey: string | null = null

export function setColorVehicleKey(key: string | null) {
  currentVehicleKey = key
  if (key) {
    const saved = loadPersistedColors(key)
    useColorStore.setState(saved)
  }
}

function saveAndSet(partial: Partial<ColorState>) {
  const current = useColorStore.getState()
  const toSave = {
    bodyColor: partial.bodyColor ?? current.bodyColor,
    wheelColor: partial.wheelColor ?? current.wheelColor,
    caliperColor: partial.caliperColor ?? current.caliperColor,
    windowTint: partial.windowTint ?? current.windowTint,
    accentStyle: (partial.accentStyle ?? current.accentStyle) as AccentStyle,
  }
  persistColors(currentVehicleKey, toSave)
  return partial
}

export const useColorStore = create<ColorState>((set) => ({
  ...STOCK_DEFAULTS,
  isStudioOpen: false,

  setBodyColor: (c) => set(() => saveAndSet({ bodyColor: c })),
  setWheelColor: (c) => set(() => saveAndSet({ wheelColor: c })),
  setCaliperColor: (c) => set(() => saveAndSet({ caliperColor: c })),
  setWindowTint: (t) => set(() => saveAndSet({ windowTint: t })),
  setAccentStyle: (s) => set(() => saveAndSet({ accentStyle: s })),
  openStudio: () => set({ isStudioOpen: true }),
  closeStudio: () => set({ isStudioOpen: false }),
  resetToStock: () =>
    set(() => {
      persistColors(currentVehicleKey, STOCK_DEFAULTS)
      return { ...STOCK_DEFAULTS }
    }),
}))
