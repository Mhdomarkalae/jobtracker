import { format, getISOWeek, getISOWeekYear, parseISO } from 'date-fns'

// This file acts like a tiny mock backend stored in localStorage.
//
// It exists purely for portfolio/demo mode so the deployed frontend can still
// show meaningful data if the free backend is sleeping or unavailable.
const DEMO_STATE_STORAGE_KEY = 'job-tracker-demo-store'

const seedState = {
  user: {
    id: 0,
    email: 'demo@jobtracker.dev',
    createdAt: '2026-04-01T09:00:00',
  },
  applications: [
    {
      id: 1001,
      companyName: 'Vercel',
      positionTitle: 'Frontend Engineer Intern',
      jobUrl: 'https://vercel.com/careers',
      dateApplied: '2026-03-25',
      currentStatus: 'INTERVIEW',
      salaryRange: '$40/hr',
      location: 'Remote',
      notes: 'Resume project that recruiters can open without signing in.',
      createdAt: '2026-03-25T12:30:00',
      updatedAt: '2026-03-31T10:15:00',
      statusHistory: [
        {
          id: 5001,
          status: 'INTERVIEW',
          changedAt: '2026-03-31T10:15:00',
          notes: 'Moved to final onsite.',
        },
        {
          id: 5000,
          status: 'SCREENING',
          changedAt: '2026-03-27T14:00:00',
          notes: 'Recruiter screen completed.',
        },
      ],
      interviews: [
        {
          id: 7001,
          applicationId: 1001,
          interviewType: 'FINAL',
          scheduledDate: '2026-04-10T13:00:00',
          interviewerName: 'Alex Rivera',
          notes: 'Portfolio walkthrough and systems design.',
          durationMinutes: 60,
          completed: false,
        },
      ],
    },
    {
      id: 1002,
      companyName: 'Notion',
      positionTitle: 'Software Engineer Intern',
      jobUrl: 'https://notion.so/careers',
      dateApplied: '2026-03-20',
      currentStatus: 'SCREENING',
      salaryRange: '$42/hr',
      location: 'San Francisco, CA',
      notes: 'Applied with referral from campus event.',
      createdAt: '2026-03-20T16:45:00',
      updatedAt: '2026-03-24T09:00:00',
      statusHistory: [
        {
          id: 5002,
          status: 'SCREENING',
          changedAt: '2026-03-24T09:00:00',
          notes: 'Recruiter asked for availability.',
        },
      ],
      interviews: [],
    },
    {
      id: 1003,
      companyName: 'Figma',
      positionTitle: 'Product Engineer Intern',
      jobUrl: 'https://figma.com/careers',
      dateApplied: '2026-03-12',
      currentStatus: 'OFFER',
      salaryRange: '$45/hr',
      location: 'New York, NY',
      notes: 'Offer received after technical and behavioral rounds.',
      createdAt: '2026-03-12T11:20:00',
      updatedAt: '2026-03-29T17:25:00',
      statusHistory: [
        {
          id: 5004,
          status: 'OFFER',
          changedAt: '2026-03-29T17:25:00',
          notes: 'Offer call completed.',
        },
        {
          id: 5003,
          status: 'INTERVIEW',
          changedAt: '2026-03-18T15:10:00',
          notes: 'Final round scheduled.',
        },
      ],
      interviews: [
        {
          id: 7002,
          applicationId: 1003,
          interviewType: 'TECHNICAL',
          scheduledDate: '2026-03-17T14:00:00',
          interviewerName: 'Morgan Chen',
          notes: 'Frontend systems discussion.',
          durationMinutes: 75,
          completed: true,
        },
      ],
    },
  ],
}

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function readState() {
  if (typeof window === 'undefined') {
    return clone(seedState)
  }

  // The first visit seeds localStorage with demo applications so the UI has
  // a complete, realistic dataset immediately.
  const raw = window.localStorage.getItem(DEMO_STATE_STORAGE_KEY)
  if (!raw) {
    const initial = clone(seedState)
    window.localStorage.setItem(DEMO_STATE_STORAGE_KEY, JSON.stringify(initial))
    return initial
  }

  return JSON.parse(raw)
}

function writeState(state) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(DEMO_STATE_STORAGE_KEY, JSON.stringify(state))
  }
}

function nextId(items) {
  return items.reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1
}

function sortStatusHistory(items) {
  return [...items].sort((left, right) => parseISO(right.changedAt).getTime() - parseISO(left.changedAt).getTime())
}

function sortInterviews(items) {
  return [...items].sort((left, right) => parseISO(left.scheduledDate).getTime() - parseISO(right.scheduledDate).getTime())
}

function normalizeApplication(application) {
  // Keep the demo store aligned with the API shape expected by the pages.
  return {
    ...application,
    statusHistory: sortStatusHistory(application.statusHistory ?? []),
    interviews: sortInterviews(application.interviews ?? []),
  }
}

function buildApplicationSummary(application) {
  const normalized = normalizeApplication(application)
  return {
    id: normalized.id,
    companyName: normalized.companyName,
    positionTitle: normalized.positionTitle,
    jobUrl: normalized.jobUrl,
    dateApplied: normalized.dateApplied,
    currentStatus: normalized.currentStatus,
    salaryRange: normalized.salaryRange,
    location: normalized.location,
    notes: normalized.notes,
    createdAt: normalized.createdAt,
    updatedAt: normalized.updatedAt,
  }
}

function buildApplicationResponse(application) {
  return normalizeApplication(application)
}

function getAllApplications() {
  return readState().applications.map(normalizeApplication)
}

export function getDemoUser() {
  return clone(readState().user)
}

export function listDemoApplications(status) {
  return getAllApplications()
    .filter((application) => !status || application.currentStatus === status)
    .map(buildApplicationSummary)
}

export function getDemoApplication(id) {
  const application = getAllApplications().find((item) => item.id === Number(id))
  if (!application) {
    throw new Error(`Application not found with id ${id}`)
  }

  return buildApplicationResponse(application)
}

export function createDemoApplication(payload) {
  const state = readState()
  const now = new Date().toISOString()
  const application = {
    id: nextId(state.applications),
    companyName: payload.companyName,
    positionTitle: payload.positionTitle,
    jobUrl: payload.jobUrl || null,
    dateApplied: payload.dateApplied,
    currentStatus: payload.currentStatus,
    salaryRange: payload.salaryRange || null,
    location: payload.location || null,
    notes: payload.notes || null,
    createdAt: now,
    updatedAt: now,
    statusHistory: [],
    interviews: [],
  }

  state.applications.push(application)
  writeState(state)
  return buildApplicationResponse(application)
}

export function updateDemoApplication(id, payload) {
  const state = readState()
  const application = state.applications.find((item) => item.id === Number(id))
  if (!application) {
    throw new Error(`Application not found with id ${id}`)
  }

  const previousStatus = application.currentStatus
  application.companyName = payload.companyName
  application.positionTitle = payload.positionTitle
  application.jobUrl = payload.jobUrl || null
  application.dateApplied = payload.dateApplied
  application.currentStatus = payload.currentStatus
  application.salaryRange = payload.salaryRange || null
  application.location = payload.location || null
  application.notes = payload.notes || null
  application.updatedAt = new Date().toISOString()

  if (previousStatus !== payload.currentStatus) {
    // Mirror the real backend rule: when the status changes, add a history entry.
    const historyIds = state.applications.flatMap((item) => item.statusHistory ?? [])
    application.statusHistory.unshift({
      id: nextId(historyIds),
      status: payload.currentStatus,
      changedAt: application.updatedAt,
      notes: null,
    })
  }

  writeState(state)
  return buildApplicationResponse(application)
}

export function deleteDemoApplication(id) {
  const state = readState()
  state.applications = state.applications.filter((item) => item.id !== Number(id))
  writeState(state)
}

export function updateDemoApplicationStatus(id, status, notes) {
  const state = readState()
  const application = state.applications.find((item) => item.id === Number(id))
  if (!application) {
    throw new Error(`Application not found with id ${id}`)
  }

  if (application.currentStatus !== status) {
    const historyIds = state.applications.flatMap((item) => item.statusHistory ?? [])
    application.currentStatus = status
    application.updatedAt = new Date().toISOString()
    application.statusHistory.unshift({
      id: nextId(historyIds),
      status,
      changedAt: application.updatedAt,
      notes: notes || null,
    })
  }

  writeState(state)
  return buildApplicationResponse(application)
}

export function listDemoInterviews(applicationId) {
  return getDemoApplication(applicationId).interviews
}

export function createDemoInterview(applicationId, payload) {
  const state = readState()
  const application = state.applications.find((item) => item.id === Number(applicationId))
  if (!application) {
    throw new Error(`Application not found with id ${applicationId}`)
  }

  const interviewIds = state.applications.flatMap((item) => item.interviews ?? [])
  const interview = {
    id: nextId(interviewIds),
    applicationId: application.id,
    interviewType: payload.interviewType,
    scheduledDate: payload.scheduledDate,
    interviewerName: payload.interviewerName || null,
    notes: payload.notes || null,
    durationMinutes: payload.durationMinutes ?? null,
    completed: Boolean(payload.completed),
  }

  application.interviews.push(interview)
  application.updatedAt = new Date().toISOString()
  writeState(state)
  return interview
}

export function updateDemoInterview(id, payload) {
  const state = readState()
  const application = state.applications.find((item) => (item.interviews ?? []).some((interview) => interview.id === Number(id)))
  if (!application) {
    throw new Error(`Interview not found with id ${id}`)
  }

  const interview = application.interviews.find((item) => item.id === Number(id))
  interview.interviewType = payload.interviewType
  interview.scheduledDate = payload.scheduledDate
  interview.interviewerName = payload.interviewerName || null
  interview.notes = payload.notes || null
  interview.durationMinutes = payload.durationMinutes ?? null
  interview.completed = Boolean(payload.completed)
  application.updatedAt = new Date().toISOString()
  writeState(state)
  return interview
}

export function deleteDemoInterview(id) {
  const state = readState()
  const application = state.applications.find((item) => (item.interviews ?? []).some((interview) => interview.id === Number(id)))
  if (!application) {
    throw new Error(`Interview not found with id ${id}`)
  }

  application.interviews = application.interviews.filter((item) => item.id !== Number(id))
  application.updatedAt = new Date().toISOString()
  writeState(state)
}

export function getDemoAnalyticsSummary() {
  const applications = getAllApplications()
  const statuses = ['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'REJECTED', 'GHOSTED']
  const applicationsByStatus = Object.fromEntries(statuses.map((status) => [status, 0]))

  applications.forEach((application) => {
    applicationsByStatus[application.currentStatus] += 1
  })

  const totalApplications = applications.length
  const movedPastApplied = applications.filter((application) => application.currentStatus !== 'APPLIED').length

  return {
    totalApplications,
    applicationsByStatus,
    responseRate: totalApplications === 0 ? 0 : Number(((movedPastApplied / totalApplications) * 100).toFixed(2)),
  }
}

export function getDemoAnalyticsTimeline(groupBy = 'week') {
  // Match the backend timeline response format so chart components do not
  // need a separate code path for demo mode.
  const normalizedGroupBy = groupBy === 'month' ? 'month' : 'week'
  const periods = {}

  getAllApplications().forEach((application) => {
    const date = parseISO(application.dateApplied)
    const period =
      normalizedGroupBy === 'month'
        ? format(date, 'yyyy-MM')
        : `${getISOWeekYear(date)}-W${String(getISOWeek(date)).padStart(2, '0')}`
    periods[period] = (periods[period] ?? 0) + 1
  })

  return {
    groupBy: normalizedGroupBy,
    applicationsByPeriod: Object.fromEntries(
      Object.entries(periods).sort(([left], [right]) => left.localeCompare(right)),
    ),
  }
}

export function resetDemoStore() {
  writeState(clone(seedState))
}
