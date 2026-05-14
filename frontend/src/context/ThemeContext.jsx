import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'

const THEME_STORAGE_KEY = 'job-tracker-theme'

const ThemeContext = createContext(null)

function resolveInitialTheme() {
  if (typeof window === 'undefined') {
    return 'light'
  }

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
  if (storedTheme === 'light' || storedTheme === 'dark') {
    return storedTheme
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(theme, shouldAnimate) {
  if (typeof document === 'undefined') {
    return
  }

  const root = document.documentElement

  if (shouldAnimate) {
    root.classList.add('theme-transition')
  }

  root.classList.toggle('dark', theme === 'dark')
  root.dataset.theme = theme
  root.style.colorScheme = theme
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(resolveInitialTheme)
  const hasMountedRef = useRef(false)

  useEffect(() => {
    applyTheme(theme, hasMountedRef.current)
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)

    let timerId
    if (hasMountedRef.current) {
      timerId = window.setTimeout(() => {
        document.documentElement.classList.remove('theme-transition')
      }, 650)
    }

    hasMountedRef.current = true

    return () => {
      if (timerId) {
        window.clearTimeout(timerId)
      }
    }
  }, [theme])

  const value = useMemo(
    () => ({
      theme,
      isDark: theme === 'dark',
      setTheme,
      toggleTheme() {
        setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'))
      },
    }),
    [theme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider.')
  }

  return context
}
