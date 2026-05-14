import { useTheme } from '../context/ThemeContext'

function SunGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="12" cy="12" r="4" fill="currentColor" />
      <g stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
        <path d="M12 2v2" />
        <path d="M12 20v2" />
        <path d="M2 12h2" />
        <path d="M20 12h2" />
        <path d="M4.9 4.9l1.4 1.4" />
        <path d="M17.7 17.7l1.4 1.4" />
        <path d="M4.9 19.1l1.4-1.4" />
        <path d="M17.7 6.3l1.4-1.4" />
      </g>
    </svg>
  )
}

function MoonGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M21 12.8A8.5 8.5 0 0111.2 3 7 7 0 0021 12.8z" fill="currentColor" />
    </svg>
  )
}

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme()

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="theme-toggle"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={isDark}
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
      {isDark ? <MoonGlyph /> : <SunGlyph />}
    </button>
  )
}
