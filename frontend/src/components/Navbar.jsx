import { NavLink, useNavigate } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'

function linkClassName({ isActive }) {
  return [
    'rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150',
    isActive
      ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100',
  ].join(' ')
}

function Navbar({ user, onLogout, isDemoMode = false }) {
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-30 border-b border-[#e2e4e9] bg-[#f5f6f8] dark:border-[#1e2029] dark:bg-[#0a0b0e]">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-6">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex min-w-0 items-center gap-2 rounded-md border border-transparent py-1 text-left transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[#e2e4e9] bg-white text-xs font-semibold text-slate-800 dark:border-[#1e2029] dark:bg-[#111318] dark:text-slate-200">
              JT
            </span>
            <span className="min-w-0">
              <span className="block text-xs font-medium text-slate-500 dark:text-slate-400">Job Tracker</span>
              <span className="block truncate text-sm font-medium text-slate-900 dark:text-slate-100">Pipeline</span>
            </span>
          </button>
          <nav className="hidden items-center gap-1 md:flex">
            <NavLink to="/" className={linkClassName} end>
              Dashboard
            </NavLink>
            <NavLink to="/applications" className={linkClassName}>
              Applications
            </NavLink>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {isDemoMode ? (
            <div className="hidden rounded-md border border-amber-200/80 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-900 dark:border-amber-500/25 dark:bg-amber-950/40 dark:text-amber-100 lg:block">
              Guest demo
            </div>
          ) : null}
          <div className="hidden max-w-[200px] truncate rounded-md border border-[#e2e4e9] bg-white px-2 py-1 text-xs text-slate-600 dark:border-[#1e2029] dark:bg-[#111318] dark:text-slate-400 lg:block">
            {user?.email}
          </div>
          <ThemeToggle />
          <nav className="flex items-center gap-1 md:hidden">
            <NavLink to="/" className={linkClassName} end>
              Home
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
            Add application
          </button>
          <button type="button" className="button-secondary" onClick={onLogout}>
            {isDemoMode ? 'Exit demo' : 'Log out'}
          </button>
        </div>
      </div>
    </header>
  )
}

export default Navbar
