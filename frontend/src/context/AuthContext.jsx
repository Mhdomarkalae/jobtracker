import { useEffect, useState } from 'react'
import {
  clearStoredAuthToken,
  getApiErrorMessage,
  getCurrentUser,
  getStoredAuthToken,
  login as loginRequest,
  setStoredAuthToken,
  signup as signupRequest,
} from '../services/api'
import { AuthContext } from './auth-context'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function bootstrapSession() {
      if (!getStoredAuthToken()) {
        setIsInitializing(false)
        return
      }

      try {
        const currentUser = await getCurrentUser()
        if (isMounted) {
          setUser(currentUser)
        }
      } catch (error) {
        clearStoredAuthToken()
        if (isMounted) {
          setUser(null)
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
    const response = await signupRequest(credentials)
    setStoredAuthToken(response.token)
    setUser(response.user)
    return response.user
  }

  async function login(credentials) {
    const response = await loginRequest(credentials)
    setStoredAuthToken(response.token)
    setUser(response.user)
    return response.user
  }

  function logout() {
    clearStoredAuthToken()
    setUser(null)
  }

  const value = {
    user,
    isAuthenticated: Boolean(user),
    isInitializing,
    login,
    logout,
    signup,
    getAuthErrorMessage(error, fallback) {
      return getApiErrorMessage(error, fallback)
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
