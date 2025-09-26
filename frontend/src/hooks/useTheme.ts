// frontend/src/hooks/useTheme.ts
/**
 * Theme store (Zustand)
 * - Manages 'light'/'dark' theme
 * - Persists selection in localStorage
 * - Applies 'dark' class to document.documentElement when needed
 *
 * Usage:
 *  import { useThemeStore } from '../hooks/useTheme'
 *  useThemeStore.getState().setTheme('dark')
 *  or inside components: const theme = useThemeStore(state => state.theme)
 */
import { create } from 'zustand'

type Theme = 'light' | 'dark'

interface ThemeState {
  theme: Theme
  setTheme: (t: Theme) => void
  toggleTheme: () => void
}

/** Helper: read initial theme from localStorage or OS preference */
const getInitialTheme = (): Theme => {
  try {
    const stored = localStorage.getItem('theme')
    if (stored === 'light' || stored === 'dark') return stored
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }
  } catch {
    // ignore (e.g. SSR or restricted env)
  }
  return 'light'
}

/** Apply theme to document root */
const applyThemeToDocument = (theme: Theme) => {
  try {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  } catch {
    // ignore if document not available
  }
}

export const useThemeStore = create<ThemeState>((set) => {
  const initial = typeof window !== 'undefined' ? getInitialTheme() : 'light'
  // apply immediately (helps when used in top-level)
  if (typeof document !== 'undefined') applyThemeToDocument(initial)

  return {
    theme: initial,
    setTheme: (t: Theme) => {
      set({ theme: t })
      try {
        localStorage.setItem('theme', t)
      } catch {}
      applyThemeToDocument(t)
    },
    toggleTheme: () =>
      set((state) => {
        const next = state.theme === 'dark' ? 'light' : 'dark'
        try {
          localStorage.setItem('theme', next)
        } catch {}
        applyThemeToDocument(next)
        return { theme: next }
      }),
  }
})