import { NavLink, useNavigate } from 'react-router-dom'

function linkClassName({ isActive }) {
  return [
    'rounded-full px-4 py-2 text-sm font-semibold transition',
    isActive
      ? 'bg-brand-600 text-white shadow-sm'
      : 'text-slate-600 hover:bg-white hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-slate-50',
  ].join(' ')
}

function Navbar({ theme, onToggleTheme, user, onLogout, isDemoMode = false }) {
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-2 text-left shadow-sm transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
              JT
            </span>
            <span>
              <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">
                Job Tracker
              </span>
              <span className="block text-sm font-semibold text-slate-900 dark:text-slate-100">
                Application Pipeline
              </span>
            </span>
          </button>
          <nav className="hidden items-center gap-2 md:flex">
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
            <div className="hidden rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800 shadow-sm dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-100 lg:block">
              Guest Demo
            </div>
          ) : null}
          <div className="hidden rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 lg:block">
            {user?.email}
          </div>
          <button type="button" className="button-secondary" onClick={onToggleTheme}>
            Theme: {theme === 'dark' ? 'Dark' : 'Light'}
          </button>
          <nav className="flex items-center gap-2 md:hidden">
            <NavLink to="/" className={linkClassName} end>
              Dashboard
            </NavLink>
            <NavLink to="/applications" className={linkClassName}>
              Apps
            </NavLink>
          </nav>
          <button
            type="button"
            className="button-primary"
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
