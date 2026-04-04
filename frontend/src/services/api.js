import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

export function getApiErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  return error?.response?.data?.message || error?.message || fallback
}

export async function getApplications(status) {
  const { data } = await api.get('/applications', {
    params: status ? { status } : {},
  })
  return data
}

export async function getApplication(id) {
  const { data } = await api.get(`/applications/${id}`)
  return data
}

export async function createApplication(payload) {
  const { data } = await api.post('/applications', payload)
  return data
}

export async function updateApplication(id, payload) {
  const { data } = await api.put(`/applications/${id}`, payload)
  return data
}

export async function deleteApplication(id) {
  await api.delete(`/applications/${id}`)
}

export async function updateApplicationStatus(id, status, notes) {
  const payload = {
    status,
    ...(notes ? { notes } : {}),
  }

  const { data } = await api.patch(`/applications/${id}/status`, payload)
  return data
}

export async function getInterviews(applicationId) {
  const { data } = await api.get(`/applications/${applicationId}/interviews`)
  return data
}

export async function createInterview(applicationId, payload) {
  const { data } = await api.post(`/applications/${applicationId}/interviews`, payload)
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
