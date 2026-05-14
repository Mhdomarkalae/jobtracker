import { useEffect, useId, useRef, useState } from 'react'
import { useTheme } from '../context/ThemeContext'

function SunGlyph({ className }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="16" cy="16" r="5.5" stroke="currentColor" strokeWidth="2.1" />
      <path d="M16 2.75V6.25" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
      <path d="M16 25.75V29.25" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
      <path d="M2.75 16H6.25" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
      <path d="M25.75 16H29.25" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
      <path d="M6.62 6.62L9.1 9.1" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
      <path d="M22.9 22.9L25.38 25.38" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
      <path d="M6.62 25.38L9.1 22.9" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
      <path d="M22.9 9.1L25.38 6.62" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
    </svg>
  )
}

function MoonGlyph({ className, maskId }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <mask id={maskId}>
          <rect width="32" height="32" fill="white" />
          <circle cx="21.5" cy="12.5" r="8.5" fill="black" />
        </mask>
      </defs>
      <circle cx="16" cy="16" r="9" stroke="currentColor" strokeWidth="2.1" mask={`url(#${maskId})`} />
      <circle cx="11.6" cy="12.4" r="1.1" fill="currentColor" opacity="0.55" />
      <circle cx="14.8" cy="18.8" r="1.35" fill="currentColor" opacity="0.4" />
      <circle cx="18.4" cy="15.2" r="0.9" fill="currentColor" opacity="0.45" />
    </svg>
  )
}

export default function ThemeToggle() {
  const { theme, isDark, toggleTheme } = useTheme()
  const [isAnimating, setIsAnimating] = useState(false)
  const timeoutRef = useRef(null)
  const maskId = useId().replace(/:/g, '')

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
        <MoonGlyph
          maskId={`theme-toggle-moon-${maskId}`}
          className={`theme-toggle__icon theme-toggle__icon--moon ${isDark ? 'is-active' : ''}`}
        />
        <SunGlyph
          className={`theme-toggle__icon theme-toggle__icon--sun ${isDark ? '' : 'is-active'}`}
        />
      </span>
    </button>
  )
}
