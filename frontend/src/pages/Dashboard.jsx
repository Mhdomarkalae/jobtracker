import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { getAnalyticsSummary, getAnalyticsTimeline, getApplications, getApiErrorMessage } from '../services/api'
import StatusBadge from '../components/StatusBadge'
import { useTheme } from '../context/ThemeContext'
import { formatDate, sortApplicationsByDateApplied } from '../utils/formatters'
import { APPLICATION_STATUS_OPTIONS, STATUS_META } from '../utils/options'

const tooltipStyle = {
  backgroundColor: '#ffffff',
  border: '1px solid #e2e4e9',
  borderRadius: '6px',
  color: '#0f172a',
  fontSize: '12px',
  boxShadow: '0 1px 2px rgba(15, 23, 42, 0.06)',
}

const tooltipStyleDark = {
  backgroundColor: '#111318',
  border: '1px solid #1e2029',
  borderRadius: '6px',
  color: '#eceef2',
  fontSize: '12px',
  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.35)',
}

function Dashboard() {
  const { isDark } = useTheme()
  const [summary, setSummary] = useState(null)
  const [timeline, setTimeline] = useState([])
  const [recentApplications, setRecentApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadDashboard() {
      setLoading(true)
      setError('')

      try {
        const [summaryData, timelineData, applicationsPage] = await Promise.all([
          getAnalyticsSummary(),
          getAnalyticsTimeline('week'),
          getApplications(undefined, { page: 0, size: 100 }),
        ])

        if (!isMounted) {
          return
        }

        setSummary(summaryData)
        setTimeline(
          Object.entries(timelineData.applicationsByPeriod ?? {}).map(([period, count]) => {
            const match = period.match(/(\d{4}) W(\d+)/)
            if (match) {
              const year = parseInt(match[1])
              const week = parseInt(match[2])
              const jan1 = new Date(year, 0, 1)
              const daysOffset = (week - 1) * 7
              const weekDate = new Date(jan1)
              weekDate.setDate(jan1.getDate() + daysOffset)
              const month = weekDate.toLocaleDateString('en-US', { month: 'short' })
              const day = weekDate.getDate()
              return { period: `${month} ${day}`, count, originalPeriod: period }
            }
            return { period, count, originalPeriod: period }
          }),
        )
        setRecentApplications(
          sortApplicationsByDateApplied(applicationsPage.content ?? []).slice(0, 5),
        )
      } catch (loadError) {
        if (isMounted) {
          setError(getApiErrorMessage(loadError, 'Unable to load dashboard metrics.'))
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadDashboard()

    return () => {
      isMounted = false
    }
  }, [])

  const statusChartData = useMemo(() => {
    if (!summary) {
      return []
    }

    return APPLICATION_STATUS_OPTIONS.map((status) => ({
      status: STATUS_META[status].label,
      count: summary.applicationsByStatus?.[status] ?? 0,
      fill: STATUS_META[status].chartColor,
    }))
  }, [summary])

  const totalApplications = summary?.totalApplications ?? 0
  const responseRate = summary?.responseRate ?? 0
  const interviewCount = summary?.applicationsByStatus?.INTERVIEW ?? 0
  const offerCount = summary?.applicationsByStatus?.OFFER ?? 0
  const activePipeline = APPLICATION_STATUS_OPTIONS.filter((status) => status !== 'REJECTED' && status !== 'GHOSTED')
    .reduce((count, status) => count + (summary?.applicationsByStatus?.[status] ?? 0), 0)

  const overviewMetrics = [
    {
      label: 'Applications tracked',
      value: totalApplications,
      note: 'Roles currently stored in your pipeline.',
    },
    {
      label: 'Response rate',
      value: `${responseRate}%`,
      note: 'Applications that moved beyond Applied.',
    },
    {
      label: 'Active pipeline',
      value: activePipeline,
      note: 'Roles still moving through screening or interview loops.',
    },
    {
      label: 'Offers',
      value: offerCount,
      note: interviewCount > 0 ? `${interviewCount} roles are in interview stage.` : 'No interviews are active yet.',
    },
  ]

  const ttStyle = isDark ? tooltipStyleDark : tooltipStyle
  const gridStroke = isDark ? '#1e2029' : '#e2e4e9'
  const tickFill = isDark ? '#8b909d' : '#64748b'

  if (loading) {
    return (
      <div className="panel flex min-h-[280px] items-center justify-center p-8">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-600 dark:border-slate-700 dark:border-t-slate-300" />
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Loading dashboard…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-shell space-y-6">
      <section className="grid gap-6 lg:grid-cols-[1.35fr,1fr]">
        <div className="dashboard-card overflow-hidden p-6">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Overview</p>
                <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                  Pipeline overview
                </h1>
                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-400">
                  Track progress, response rate, and where follow-ups matter this week.
                </p>
              </div>
              <div className="dashboard-widget w-full shrink-0 p-4 lg:max-w-[200px]">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Response rate</p>
                <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-900 dark:text-slate-100">{responseRate}%</p>
                <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
                  Share of applications that moved past Applied.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {overviewMetrics.map((metric) => (
                <div key={metric.label} className="dashboard-subcard p-4">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{metric.label}</p>
                  <p className="mt-2 text-xl font-semibold tabular-nums text-slate-900 dark:text-slate-100">{metric.value}</p>
                  <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">{metric.note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="dashboard-card flex flex-col justify-between overflow-hidden p-6">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Snapshot</p>
            <h2 className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">Volume</h2>
            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-600 dark:text-slate-400">
              Total applications currently stored.
            </p>
          </div>
          <div className="mt-6 grid gap-4">
            <div className="dashboard-widget dashboard-widget--highlight p-4">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total applications</p>
              <p className="mt-2 text-3xl font-semibold tabular-nums text-slate-900 dark:text-slate-100">{totalApplications}</p>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">All roles in your workspace.</p>
            </div>
            <Link to="/applications" className="button-primary w-full justify-center">
              View applications
            </Link>
          </div>
        </div>
      </section>

      {error ? (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-500/30 dark:bg-rose-950/40 dark:text-rose-200">
          {error}
        </div>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {APPLICATION_STATUS_OPTIONS.map((status) => (
          <div key={status} className="dashboard-subcard p-4">
            <div className="flex items-center gap-2">
              <div
                className="h-2 w-2 shrink-0 rounded-full ring-2 ring-slate-200 dark:ring-slate-700"
                style={{ backgroundColor: STATUS_META[status].chartColor }}
              />
              <p className="text-sm text-slate-600 dark:text-slate-400">{STATUS_META[status].label}</p>
            </div>
            <p className="mt-3 text-xl font-semibold tabular-nums text-slate-900 dark:text-slate-100">
              {summary?.applicationsByStatus?.[status] ?? 0}
            </p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
        <div className="dashboard-card p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Status breakdown</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Applications by current stage.</p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusChartData}>
                <CartesianGrid vertical={false} strokeDasharray="4 4" stroke={gridStroke} />
                <XAxis
                  dataKey="status"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: tickFill, fontSize: 12 }}
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: tickFill, fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={ttStyle}
                  cursor={{ fill: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.04)' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={48}>
                  {statusChartData.map((entry) => (
                    <Cell key={entry.status} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="dashboard-card p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Recent applications</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Latest updates in your tracker.</p>
          </div>

          {recentApplications.length === 0 ? (
            <div className="dashboard-subcard border-dashed px-4 py-8 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-md border border-[#e2e4e9] bg-slate-50 dark:border-[#1e2029] dark:bg-[#16181f]">
                <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <p className="text-base font-medium text-slate-900 dark:text-slate-100">No applications yet</p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Add a role to populate charts and history.</p>
              <Link to="/applications/new" className="button-primary mt-4 inline-flex">
                Add application
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {recentApplications.map((application) => (
                <Link
                  key={application.id}
                  to={`/applications/${application.id}`}
                  className="dashboard-list-item group flex items-center justify-between gap-4 px-3 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900 group-hover:underline dark:text-slate-100">
                      {application.companyName}
                    </p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">{application.positionTitle}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <StatusBadge status={application.currentStatus} />
                    <span className="text-xs text-slate-500 dark:text-slate-400">{formatDate(application.dateApplied)}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="dashboard-card p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Application timeline</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Weekly volume across your dataset.</p>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timeline}>
              <CartesianGrid vertical={false} strokeDasharray="4 4" stroke={gridStroke} />
              <XAxis
                dataKey="period"
                tickLine={false}
                axisLine={false}
                tick={{ fill: tickFill, fontSize: 12 }}
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tick={{ fill: tickFill, fontSize: 12 }}
              />
              <Tooltip contentStyle={ttStyle} />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#475569"
                strokeWidth={2}
                dot={{ r: 3, fill: '#475569', strokeWidth: 0 }}
                activeDot={{ r: 4, fill: '#334155', strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  )
}

export default Dashboard
