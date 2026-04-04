import axios from 'axios'

const AUTH_TOKEN_STORAGE_KEY = 'job-tracker-auth-token'

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
    if (error?.response?.status === 401) {
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

export async function signup(payload) {
  const { data } = await api.post('/auth/signup', payload)
  return data
}

export async function login(payload) {
  const { data } = await api.post('/auth/login', payload)
  return data
}

export async function getCurrentUser() {
  const { data } = await api.get('/auth/me')
  return data
}

export async function getApplications(status) {
  const { data } = await api.get('/jobs', {
    params: status ? { status } : {},
  })
  return data
}

export async function getApplication(id) {
  const { data } = await api.get(`/jobs/${id}`)
  return data
}

export async function createApplication(payload) {
  const { data } = await api.post('/jobs', payload)
  return data
}

export async function updateApplication(id, payload) {
  const { data } = await api.put(`/jobs/${id}`, payload)
  return data
}

export async function deleteApplication(id) {
  await api.delete(`/jobs/${id}`)
}

export async function updateApplicationStatus(id, status, notes) {
  const payload = {
    status,
    ...(notes ? { notes } : {}),
  }

  const { data } = await api.patch(`/jobs/${id}/status`, payload)
  return data
}

export async function getInterviews(applicationId) {
  const { data } = await api.get(`/jobs/${applicationId}/interviews`)
  return data
}

export async function createInterview(applicationId, payload) {
  const { data } = await api.post(`/jobs/${applicationId}/interviews`, payload)
  return data
}

export async function updateInterview(id, payload) {
  const { data } = await api.put(`/interviews/${id}`, payload)
  return data
}

export async function deleteInterview(id) {
  await api.delete(`/interviews/${id}`)
}

export async function getAnalyticsSummary() {
  const { data } = await api.get('/analytics/summary')
  return data
}

export async function getAnalyticsTimeline(groupBy = 'week') {
  const { data } = await api.get('/analytics/timeline', {
    params: groupBy ? { groupBy } : {},
  })
  return data
}

export default api
