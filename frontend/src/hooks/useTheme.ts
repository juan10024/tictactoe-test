/*
 * file: useTheme.ts
 * hook: useThemeStore
 * description:
 *     Zustand store for theme management.
 *     - Manages "light" / "dark" themes
 *     - Persists selection in localStorage
 *     - Applies "dark" class to <html> element when needed
 *
 * usage:
 *     import { useThemeStore } from '../hooks/useTheme'
 *     const { theme, toggleTheme } = useThemeStore()
 */

import { create } from 'zustand'

type Theme = 'light' | 'dark'

interface ThemeState {
  theme: Theme
  setTheme: (t: Theme) => void
  toggleTheme: () => void
}

/**
 * Helper: read initial theme from localStorage or OS preference
 */
const getInitialTheme = (): Theme => {
  try {
    const stored = localStorage.getItem('theme')
    if (stored === 'light' || stored === 'dark') return stored

    if (
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    ) {
      return 'dark'
    }
  } catch {
    // ignore (e.g., SSR or restricted env)
  }
  return 'light'
}

/**
 * Helper: apply theme class to <html> element
 */
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

/**
 * Zustand theme store
 */
export const useThemeStore = create<ThemeState>((set) => {
  const initial = typeof window !== 'undefined' ? getInitialTheme() : 'light'

  // Apply immediately (important for top-level rendering)
  if (typeof document !== 'undefined') applyThemeToDocument(initial)

  return {
    theme: initial,
    setTheme: (t: Theme) => {
      set({ theme: t })
      try {
        localStorage.setItem('theme', t)
      } catch {
        // ignore storage errors
      }
      applyThemeToDocument(t)
    },
    toggleTheme: () =>
      set((state) => {
        const next = state.theme === 'dark' ? 'light' : 'dark'
        try {
          localStorage.setItem('theme', next)
        } catch {
          // ignore storage errors
        }
        applyThemeToDocument(next)
        return { theme: next }
      }),
  }
})
