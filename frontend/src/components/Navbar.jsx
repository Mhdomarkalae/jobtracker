import { NavLink, useNavigate } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'

function linkClassName({ isActive }) {
  return [
    'rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200',
    isActive
      ? 'border border-brand-500/30 bg-brand-600 text-white shadow-lg shadow-brand-500/20'
      : 'border border-transparent text-slate-600 hover:border-white/60 hover:bg-white/70 hover:text-slate-900 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-900/70 dark:hover:text-slate-50',
  ].join(' ')
}

function Navbar({ user, onLogout, isDemoMode = false }) {
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-30 border-b border-white/50 bg-[rgba(255,251,247,0.64)] backdrop-blur-2xl dark:border-slate-800/70 dark:bg-[rgba(9,17,31,0.72)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex min-w-0 items-center gap-3 rounded-[1.4rem] border border-white/70 bg-white/70 px-3 py-2 text-left shadow-[0_18px_44px_-28px_rgba(15,23,42,0.22)] transition hover:-translate-y-0.5 hover:border-white dark:border-slate-800/70 dark:bg-slate-950/70 dark:hover:border-slate-700"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#2563eb,#60a5fa)] text-sm font-bold text-white shadow-lg shadow-brand-500/30">
              JT
            </span>
            <span className="min-w-0">
              <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">
                Job Tracker
              </span>
              <span className="block truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                Application Pipeline
              </span>
            </span>
          </button>
          <nav className="hidden items-center gap-2 rounded-full border border-white/60 bg-white/60 p-1.5 shadow-[0_18px_44px_-30px_rgba(15,23,42,0.18)] md:flex dark:border-slate-800/70 dark:bg-slate-950/60">
            <NavLink to="/" className={linkClassName} end>
              Dashboard
            </NavLink>
            <NavLink to="/applications" className={linkClassName}>
              Applications
            </NavLink>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {isDemoMode ? (
            <div className="hidden rounded-full border border-amber-300/60 bg-amber-50/85 px-4 py-2 text-sm font-semibold text-amber-800 shadow-sm dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-100 lg:block">
              Guest Demo
            </div>
          ) : null}
          <div className="hidden rounded-full border border-white/70 bg-white/65 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm dark:border-slate-800/70 dark:bg-slate-950/65 dark:text-slate-300 lg:block">
            {user?.email}
          </div>
          <ThemeToggle />
          <nav className="flex items-center gap-2 rounded-full border border-white/60 bg-white/60 p-1.5 shadow-sm md:hidden dark:border-slate-800/70 dark:bg-slate-950/60">
            <NavLink to="/" className={linkClassName} end>
              Dashboard
            </NavLink>
            <NavLink to="/applications" className={linkClassName}>
              Apps
            </NavLink>
          </nav>
          <button
            type="button"
            className="button-primary hidden sm:inline-flex"
            onClick={() => navigate('/applications/new')}
          >
            Add Application
          </button>
          <button type="button" className="button-secondary" onClick={onLogout}>
            {isDemoMode ? 'Exit Guest Demo' : 'Log out'}
          </button>
        </div>
      </div>
    </header>
  )
}

export default Navbar
