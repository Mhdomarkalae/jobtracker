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
// Connects to Spring Boot backend on port 8080.
// In demo mode it swaps to a localStorage-backed in-browser store.
const DEMO_MODE_STORAGE_KEY = 'job-tracker-demo-mode'
const CSRF_COOKIE_NAME = 'XSRF-TOKEN'
const CSRF_HEADER_NAME = 'X-XSRF-TOKEN'
const demoFallbackEnabled = import.meta.env.VITE_ENABLE_DEMO_MODE === 'true'
let csrfRequestPromise = null

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

function getCookie(name) {
  if (typeof window === 'undefined') {
    return ''
  }

  const match = window.document.cookie
    .split('; ')
    .find((cookie) => cookie.startsWith(`${name}=`))

  return match ? decodeURIComponent(match.split('=').slice(1).join('=')) : ''
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

async function ensureCsrfToken() {
  if (isDemoSessionEnabled()) {
    return ''
  }

  const existingToken = getCookie(CSRF_COOKIE_NAME)
  if (existingToken) {
    return existingToken
  }

  if (!csrfRequestPromise) {
    csrfRequestPromise = api
      .get('/auth/csrf')
      .then(({ data }) => data?.token ?? '')
      .finally(() => {
        csrfRequestPromise = null
      })
  }

  return csrfRequestPromise
}

api.interceptors.request.use(async (config) => {
  const method = (config.method ?? 'get').toLowerCase()
  if (!['post', 'put', 'patch', 'delete'].includes(method)) {
    return config
  }

  const csrfToken = getCookie(CSRF_COOKIE_NAME) || (await ensureCsrfToken())
  if (csrfToken) {
    config.headers[CSRF_HEADER_NAME] = csrfToken
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // A real 401 should return the user to the login page, but demo mode must
    // not redirect away from the recruiter demo.
    if (error?.response?.status === 401 && !isDemoSessionEnabled()) {
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
  await ensureCsrfToken()
  const { data } = await api.post('/auth/signup', payload)
  return data
}

export async function login(payload) {
  await ensureCsrfToken()
  const { data } = await api.post('/auth/login', payload)
  return data
}

export async function logout() {
  if (isDemoSessionEnabled()) {
    disableDemoSession()
    return
  }

  await ensureCsrfToken()
  await api.post('/auth/logout')
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
    const { data } = await api.patch(`/jobs/${id}/status`, payload)
    return data
  } catch (error) {
    if (shouldUseDemoFallback(error)) {
      enableDemoSession()
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
      return getDemoAnalyticsTimeline(groupBy)
    }
    throw error
  }
}

export default api
