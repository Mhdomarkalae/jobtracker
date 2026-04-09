import { useState } from 'react'

function SunIcon({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  )
}

function MoonIcon({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

export default function ThemeToggle({ theme, onToggle }) {
  const [isAnimating, setIsAnimating] = useState(false)

  function handleClick() {
    setIsAnimating(true)
    onToggle()
    setTimeout(() => setIsAnimating(false), 400)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`
        theme-toggle group relative overflow-hidden
        ${isAnimating ? 'scale-110' : 'scale-100'}
      `}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <div className="relative h-5 w-5">
        <div
          className={`
            absolute inset-0 flex items-center justify-center
            transition-all duration-300
            ${theme === 'dark' ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'}
          `}
        >
          <SunIcon className="h-5 w-5 text-amber-500" />
        </div>
        <div
          className={`
            absolute inset-0 flex items-center justify-center
            transition-all duration-300
            ${theme === 'dark' ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'}
          `}
        >
          <MoonIcon className="h-5 w-5 text-blue-400" />
        </div>
      </div>
      
      <div
        className={`
          absolute inset-0 rounded-xl bg-gradient-to-br from-amber-400/20 to-blue-500/20
          opacity-0 transition-opacity duration-300
          group-hover:opacity-100
        `}
      />
    </button>
  )
}
