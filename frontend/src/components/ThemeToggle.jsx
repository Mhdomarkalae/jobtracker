import { useEffect, useId, useRef, useState } from 'react'
import { useTheme } from '../context/ThemeContext'

function SunGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="12" cy="12" r="4" fill="currentColor" />
      <g stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
        <path d="M12 1.5v2" />
        <path d="M12 20.5v2" />
        <path d="M1.5 12h2" />
        <path d="M20.5 12h2" />
        <path d="M4.2 4.2l1.4 1.4" />
        <path d="M18.4 18.4l1.4 1.4" />
        <path d="M4.2 19.8l1.4-1.4" />
        <path d="M18.4 5.6l1.4-1.4" />
      </g>
    </svg>
  )
}

function MoonGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M21 12.8A8.5 8.5 0 0111.2 3 7 7 0 0021 12.8z" fill="currentColor" />
    </svg>
  )
}

export default function ThemeToggle() {
  const { theme, isDark, toggleTheme } = useTheme()
  const [isAnimating, setIsAnimating] = useState(false)
  const timeoutRef = useRef(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  function handleToggle() {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current)
    }

    setIsAnimating(true)
    toggleTheme()

    timeoutRef.current = window.setTimeout(() => {
      setIsAnimating(false)
      timeoutRef.current = null
    }, 720)
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`theme-toggle ${isAnimating ? 'is-animating' : ''}`}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      aria-pressed={isDark}
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className="theme-toggle__backdrop" />
      <span className="theme-toggle__burst" />
      <span className="theme-toggle__orbit" />

      <span className="theme-toggle__icon-wrap">
        <span className={`theme-toggle__icon theme-toggle__icon--moon ${isDark ? 'is-active' : ''}`}>
          <MoonGlyph />
        </span>
        <span className={`theme-toggle__icon theme-toggle__icon--sun ${isDark ? '' : 'is-active'}`}>
          <SunGlyph />
        </span>
      </span>
    </button>
  )
}
