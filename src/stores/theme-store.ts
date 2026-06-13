import { create } from 'zustand'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'wallet_theme'

/** Read persisted theme; light-first default (spec: Minh is light-first). */
function readStored(): Theme {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

/** Toggle the `.dark` class on <html>; CSS vars cascade from there. */
function applyTheme(theme: Theme): void {
  const root = document.documentElement
  if (theme === 'dark') root.classList.add('dark')
  else root.classList.remove('dark')
}

interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  /** Sync store + DOM with persisted value once on boot. */
  init: () => void
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: readStored(),
  setTheme: (theme) => {
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      /* storage unavailable — keep in-memory state only */
    }
    applyTheme(theme)
    set({ theme })
  },
  toggleTheme: () => get().setTheme(get().theme === 'dark' ? 'light' : 'dark'),
  init: () => {
    const theme = readStored()
    applyTheme(theme)
    set({ theme })
  },
}))
