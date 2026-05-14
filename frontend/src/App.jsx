import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import { GuestRoute, ProtectedRoute } from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { useAuth } from './hooks/useAuth'
import ApplicationDetail from './pages/ApplicationDetail'
import ApplicationsList from './pages/ApplicationsList'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import NewApplication from './pages/NewApplication'
import Signup from './pages/Signup'

function AppLayout() {
  const { isDemoMode, logout, user } = useAuth()

  return (
    <div className="min-h-screen text-slate-900 dark:text-slate-100">
      <Navbar
        user={user}
        onLogout={logout}
        isDemoMode={isDemoMode}
      />
      {isDemoMode ? (
        <div className="border-b border-amber-200/80 bg-amber-50 px-4 py-2 text-sm text-amber-900 dark:border-amber-500/25 dark:bg-amber-950/40 dark:text-amber-100">
          <div className="mx-auto max-w-7xl">
            Guest demo mode is active. You are exploring local sample data, so anyone can try the app without creating an account.
          </div>
        </div>
      ) : null}
      <main className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<GuestRoute />}>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/applications" element={<ApplicationsList />} />
                <Route path="/applications/new" element={<NewApplication />} />
                <Route path="/applications/:id" element={<ApplicationDetail />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
