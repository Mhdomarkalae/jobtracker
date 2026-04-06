import axios from 'axios'
import {
  createDemoApplication,
  createDemoInterview,
  deleteDemoApplication,
  deleteDemoInterview,
  getDemoAnalyticsSummary,
  getDemoAnalyticsTimeline,
  getDemoApplication,
  getDemoUser,
  listDemoApplications,
  listDemoInterviews,
  updateDemoApplication,
  updateDemoApplicationStatus,
  updateDemoInterview,
} from '../demo/demoStore'

// Browser-side API client.
//
// Connects to Spring Boot backend on port 8080
// In demo mode it swaps to a localStorage-backed in-browser store
const AUTH_TOKEN_STORAGE_KEY = 'job-tracker-auth-token'
const DEMO_MODE_STORAGE_KEY = 'job-tracker-demo-mode'
const demoFallbackEnabled = import.meta.env.VITE_API_BASE_URL !== 'false'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

export function getStoredAuthToken() {
  if (typeof window === 'undefined') {
    return ''
  }

  return window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) ?? ''
}

export function setStoredAuthToken(token) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token)
}

export function clearStoredAuthToken() {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
}

export function isDemoFallbackEnabled() {
  return demoFallbackEnabled
}

export function isDemoSessionEnabled() {
  if (typeof window === 'undefined') {
    return false
  }

  return window.localStorage.getItem(DEMO_MODE_STORAGE_KEY) === 'true'
}

export function enableDemoSession() {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(DEMO_MODE_STORAGE_KEY, 'true')
}

export function disableDemoSession() {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(DEMO_MODE_STORAGE_KEY)
}

function shouldUseDemoFallback(error) {
    if (!demoFallbackEnabled) {
      return false
    }

    // Network errors do not have an HTTP response. That is the signal that
    // the backend is unreachable rather than simply returning an application error.
    return !error?.response
}

api.interceptors.request.use((config) => {
  const token = getStoredAuthToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // A real 401 should return the user to the login page, but demo mode must
    // not redirect away from the recruiter demo.
    if (error?.response?.status === 401 && !isDemoSessionEnabled()) {
      clearStoredAuthToken()

      if (
        typeof window !== 'undefined' &&
        window.location.pathname !== '/login' &&
        window.location.pathname !== '/signup'
      ) {
        window.location.assign('/login')
      }
    }

    return Promise.reject(error)
  },
)

export function getApiErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  return error?.response?.data?.message || error?.message || fallback
}

export async function checkBackendAvailability() {
  // Used only as a light probe before switching to demo mode.
  try {
    const response = await api.get('/health')
    return response.status === 200
  } catch {
    return false
  }
}

export async function signup(payload) {
  const { data } = await api.post('/auth/signup', payload)
  return data
}

export async function login(payload) {
  const { data } = await api.post('/auth/login', payload)
  return data
}

export async function getCurrentUser() {
  if (isDemoSessionEnabled()) {
    return getDemoUser()
  }

  const { data } = await api.get('/auth/me')
  return data
}

export async function getApplications(status, { page = 0, size = 50 } = {}) {
  if (isDemoSessionEnabled()) {
    const items = listDemoApplications(status)
    return {
      content: items,
      totalElements: items.length,
      totalPages: 1,
      number: 0,
      size: items.length,
      last: true,
    }
  }

  try {
    const { data } = await api.get('/jobs', {
      params: {
        ...(status ? { status } : {}),
        page,
        size,
      },
    })
    return data
  } catch (error) {
    if (shouldUseDemoFallback(error)) {
      // Once the app decides the backend is unavailable, it stays in demo mode
      // for the rest of the session until the user explicitly logs in again.
      enableDemoSession()
      clearStoredAuthToken()
      const items = listDemoApplications(status)
      return {
        content: items,
        totalElements: items.length,
        totalPages: 1,
        number: 0,
        size: items.length,
        last: true,
      }
    }
    throw error
  }
}

export async function getApplication(id) {
  if (isDemoSessionEnabled()) {
    return getDemoApplication(id)
  }

  try {
    const { data } = await api.get(`/jobs/${id}`)
    return data
  } catch (error) {
    if (shouldUseDemoFallback(error)) {
      enableDemoSession()
      clearStoredAuthToken()
      return getDemoApplication(id)
    }
    throw error
  }
}

export async function createApplication(payload) {
  if (isDemoSessionEnabled()) {
    return createDemoApplication(payload)
  }

  try {
    const { data } = await api.post('/jobs', payload)
    return data
  } catch (error) {
    if (shouldUseDemoFallback(error)) {
      enableDemoSession()
      clearStoredAuthToken()
      return createDemoApplication(payload)
    }
    throw error
  }
}

export async function updateApplication(id, payload) {
  if (isDemoSessionEnabled()) {
    return updateDemoApplication(id, payload)
  }

  try {
    const { data } = await api.put(`/jobs/${id}`, payload)
    return data
  } catch (error) {
    if (shouldUseDemoFallback(error)) {
      enableDemoSession()
      clearStoredAuthToken()
      return updateDemoApplication(id, payload)
    }
    throw error
  }
}

export async function deleteApplication(id) {
  if (isDemoSessionEnabled()) {
    deleteDemoApplication(id)
    return
  }

  try {
    await api.delete(`/jobs/${id}`)
  } catch (error) {
    if (shouldUseDemoFallback(error)) {
      enableDemoSession()
      clearStoredAuthToken()
      deleteDemoApplication(id)
      return
    }
    throw error
  }
}

export async function updateApplicationStatus(id, status, notes) {
  const payload = {
    status,
    ...(notes ? { notes } : {}),
  }

  if (isDemoSessionEnabled()) {
    return updateDemoApplicationStatus(id, status, notes)
  }

  try {
    const { data } = await api.patch(`/jobs/${id}`, payload)
    return data
  } catch (error) {
    if (shouldUseDemoFallback(error)) {
      enableDemoSession()
      clearStoredAuthToken()
      return updateDemoApplicationStatus(id, status, notes)
    }
    throw error
  }
}

export async function getInterviews(applicationId) {
  if (isDemoSessionEnabled()) {
    return listDemoInterviews(applicationId)
  }

  try {
    const { data } = await api.get(`/jobs/${applicationId}/interviews`)
    return data
  } catch (error) {
    if (shouldUseDemoFallback(error)) {
      enableDemoSession()
      clearStoredAuthToken()
      return listDemoInterviews(applicationId)
    }
    throw error
  }
}

export async function createInterview(applicationId, payload) {
  if (isDemoSessionEnabled()) {
    return createDemoInterview(applicationId, payload)
  }

  try {
    const { data } = await api.post(`/jobs/${applicationId}/interviews`, payload)
    return data
  } catch (error) {
    if (shouldUseDemoFallback(error)) {
      enableDemoSession()
      clearStoredAuthToken()
      return createDemoInterview(applicationId, payload)
    }
    throw error
  }
}

export async function updateInterview(id, payload) {
  if (isDemoSessionEnabled()) {
    return updateDemoInterview(id, payload)
  }

  try {
    const { data } = await api.put(`/interviews/${id}`, payload)
    return data
  } catch (error) {
    if (shouldUseDemoFallback(error)) {
      enableDemoSession()
      clearStoredAuthToken()
      return updateDemoInterview(id, payload)
    }
    throw error
  }
}

export async function deleteInterview(id) {
  if (isDemoSessionEnabled()) {
    deleteDemoInterview(id)
    return
  }

  try {
    await api.delete(`/interviews/${id}`)
  } catch (error) {
    if (shouldUseDemoFallback(error)) {
      enableDemoSession()
      clearStoredAuthToken()
      deleteDemoInterview(id)
      return
    }
    throw error
  }
}

export async function getAnalyticsSummary() {
  if (isDemoSessionEnabled()) {
    return getDemoAnalyticsSummary()
  }

  try {
    const { data } = await api.get('/analytics/summary')
    return data
  } catch (error) {
    if (shouldUseDemoFallback(error)) {
      enableDemoSession()
      clearStoredAuthToken()
      return getDemoAnalyticsSummary()
    }
    throw error
  }
}

export async function getAnalyticsTimeline(groupBy = 'week') {
  if (isDemoSessionEnabled()) {
    return getDemoAnalyticsTimeline(groupBy)
  }

  try {
    const { data } = await api.get('/analytics/timeline', {
      params: groupBy ? { groupBy } : {},
    })
    return data
  } catch (error) {
    if (shouldUseDemoFallback(error)) {
      enableDemoSession()
      clearStoredAuthToken()
      return getDemoAnalyticsTimeline(groupBy)
    }
    throw error
  }
}

export default api
