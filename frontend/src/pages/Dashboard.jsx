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
import { formatDate, sortApplicationsByDateApplied } from '../utils/formatters'
import { APPLICATION_STATUS_OPTIONS, STATUS_META } from '../utils/options'

function Dashboard() {
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
          Object.entries(timelineData.applicationsByPeriod ?? {}).map(([period, count]) => ({
            period,
            count,
          })),
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

  const isDarkTheme =
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark')

  if (loading) {
    return (
      <div className="panel flex min-h-[320px] items-center justify-center p-10">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-brand-100 border-t-brand-600" />
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-6 xl:grid-cols-[1.35fr,0.95fr]">
        <div className="panel overflow-hidden p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-600">
                Command Center
              </p>
              <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">
                Keep the pipeline visible, measurable, and moving.
              </h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-slate-600 dark:text-slate-300">
                Track momentum across every application, see where responses are landing, and stay on top of
                follow-ups before opportunities cool off.
              </p>
            </div>
            <div className="panel-muted min-w-[240px] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Response rate</p>
              <p className="mt-3 text-4xl font-semibold text-slate-950 dark:text-slate-50">{summary?.responseRate ?? 0}%</p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Percentage of applications that moved beyond the initial applied state.
              </p>
            </div>
          </div>
        </div>

        <div className="panel bg-slate-950 p-8 text-white dark:border-slate-700 dark:bg-slate-900">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">Snapshot</p>
          <h2 className="mt-3 text-3xl font-semibold text-white">Total applications</h2>
          <p className="mt-5 text-6xl font-semibold">{summary?.totalApplications ?? 0}</p>
          <p className="mt-4 max-w-sm text-sm leading-7 text-slate-300">
            A clean view of your active search across companies, roles, and stages.
          </p>
          <Link to="/applications" className="mt-8 inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-100">
            Review applications
          </Link>
        </div>
      </section>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">{error}</div>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {APPLICATION_STATUS_OPTIONS.map((status) => (
          <div key={status} className="panel-muted p-5">
            <p className="text-sm text-slate-500 dark:text-slate-400">{STATUS_META[status].label}</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950 dark:text-slate-50">
              {summary?.applicationsByStatus?.[status] ?? 0}
            </p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
        <div className="panel p-6 md:p-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Status breakdown</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">See where your current pipeline is concentrated.</p>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusChartData}>
                <CartesianGrid vertical={false} strokeDasharray="4 4" stroke="#334155" />
                <XAxis
                  dataKey="status"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: isDarkTheme ? '#94a3b8' : '#475569' }}
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: isDarkTheme ? '#94a3b8' : '#475569' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDarkTheme ? '#0f172a' : '#ffffff',
                    borderColor: isDarkTheme ? '#334155' : '#e2e8f0',
                    color: isDarkTheme ? '#e2e8f0' : '#0f172a',
                    borderRadius: '16px',
                  }}
                />
                <Bar dataKey="count" radius={[14, 14, 0, 0]}>
                  {statusChartData.map((entry) => (
                    <Cell key={entry.status} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel p-6 md:p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold">Recent applications</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">The latest opportunities entering your tracker.</p>
          </div>

          {recentApplications.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center dark:border-slate-700 dark:bg-slate-950/70">
              <p className="text-lg font-semibold text-slate-900 dark:text-slate-50">No applications yet</p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Start building your pipeline with the first role.</p>
              <Link to="/applications/new" className="button-primary mt-6">
                Add Application
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentApplications.map((application) => (
                <Link
                  key={application.id}
                  to={`/applications/${application.id}`}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-4 transition hover:-translate-y-0.5 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950/70 dark:hover:border-slate-700"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-950 dark:text-slate-50">{application.companyName}</p>
                    <p className="truncate text-sm text-slate-500 dark:text-slate-400">{application.positionTitle}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <StatusBadge status={application.currentStatus} />
                    <span className="text-sm text-slate-500 dark:text-slate-400">{formatDate(application.dateApplied)}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="panel p-6 md:p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold">Application timeline</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Weekly application volume across the current dataset.</p>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timeline}>
              <CartesianGrid vertical={false} strokeDasharray="4 4" stroke="#334155" />
              <XAxis
                dataKey="period"
                tickLine={false}
                axisLine={false}
                tick={{ fill: isDarkTheme ? '#94a3b8' : '#475569' }}
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tick={{ fill: isDarkTheme ? '#94a3b8' : '#475569' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDarkTheme ? '#0f172a' : '#ffffff',
                  borderColor: isDarkTheme ? '#334155' : '#e2e8f0',
                  color: isDarkTheme ? '#e2e8f0' : '#0f172a',
                  borderRadius: '16px',
                }}
              />
              <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  )
}

export default Dashboard
