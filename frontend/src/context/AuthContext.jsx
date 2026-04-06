import { useEffect, useState } from 'react'
import {
  checkBackendAvailability,
  clearStoredAuthToken,
  disableDemoSession,
  enableDemoSession,
  getApiErrorMessage,
  getCurrentUser,
  getStoredAuthToken,
  isDemoFallbackEnabled,
  isDemoSessionEnabled,
  login as loginRequest,
  setStoredAuthToken,
  signup as signupRequest,
} from '../services/api'
import { AuthContext } from './auth-context'
import { getDemoUser } from '../demo/demoStore'

// Owns frontend session state for both real authenticated mode and the
// recruiter-friendly demo fallback mode.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isInitializing, setIsInitializing] = useState(true)
  const [isDemoMode, setIsDemoMode] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function bootstrapSession() {
      // If the app already switched into demo mode on a previous visit,
      // restore that immediately without waiting on the backend.
      if (isDemoSessionEnabled()) {
        if (isMounted) {
          setUser(getDemoUser())
          setIsDemoMode(true)
          setIsInitializing(false)
        }
        return
      }

      if (!getStoredAuthToken()) {
        if (isDemoFallbackEnabled()) {
          // On free hosting the backend may sleep. When that happens, the
          // frontend can still present a working demo using local sample data.
          const backendAvailable = await checkBackendAvailability()
          if (!backendAvailable && isMounted) {
            enableDemoSession()
            setUser(getDemoUser())
            setIsDemoMode(true)
          }
        }

        setIsInitializing(false)
        return
      }

      try {
        const currentUser = await getCurrentUser()
        if (isMounted) {
          setUser(currentUser)
          setIsDemoMode(false)
        }
      } catch (error) {
        clearStoredAuthToken()
        if (isDemoFallbackEnabled()) {
          // Only fall back to demo mode when the backend is unavailable.
          // Real auth failures should still behave like normal sign-out.
          const backendAvailable = await checkBackendAvailability()
          if (!backendAvailable && isMounted) {
            enableDemoSession()
            setUser(getDemoUser())
            setIsDemoMode(true)
          } else if (isMounted) {
            setUser(null)
            setIsDemoMode(false)
          }
        } else if (isMounted) {
          setUser(null)
          setIsDemoMode(false)
        }
        console.error(error)
      } finally {
        if (isMounted) {
          setIsInitializing(false)
        }
      }
    }

    bootstrapSession()

    return () => {
      isMounted = false
    }
  }, [])

  async function signup(credentials) {
    // Real auth should always clear demo mode first.
    disableDemoSession()
    const response = await signupRequest(credentials)
    setStoredAuthToken(response.token)
    setUser(response.user)
    setIsDemoMode(false)
    return response.user
  }

  async function login(credentials) {
    disableDemoSession()
    const response = await loginRequest(credentials)
    setStoredAuthToken(response.token)
    setUser(response.user)
    setIsDemoMode(false)
    return response.user
  }

  function logout() {
    clearStoredAuthToken()
    disableDemoSession()
    setUser(null)
    setIsDemoMode(false)
  }

  function continueWithDemo() {
    // Explicit "show me the portfolio demo" action from the auth screens.
    enableDemoSession()
    clearStoredAuthToken()
    setUser(getDemoUser())
    setIsDemoMode(true)
  }

  const value = {
    user,
    isAuthenticated: Boolean(user),
    isInitializing,
    isDemoMode,
    canUseDemoFallback: isDemoFallbackEnabled(),
    login,
    logout,
    signup,
    continueWithDemo,
    getAuthErrorMessage(error, fallback) {
      return getApiErrorMessage(error, fallback)
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
