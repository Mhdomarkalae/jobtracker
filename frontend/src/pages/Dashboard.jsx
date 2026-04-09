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
              <p className="mt-4 max-w-xl text-base leading-7 text-slate-600 dark:text-slate-400">
                Track momentum across every application, see where responses are landing, and stay on top of
                follow-ups before opportunities cool off.
              </p>
            </div>
            <div className="panel-muted min-w-[240px] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Response rate</p>
              <p className="mt-3 text-4xl font-semibold text-slate-900 dark:text-white">{summary?.responseRate ?? 0}%</p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Percentage of applications that moved beyond the initial applied state.
              </p>
            </div>
          </div>
        </div>

        <div className="panel flex flex-col justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 dark:border dark:border-slate-700">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-400">Snapshot</p>
          <h2 className="mt-3 text-3xl font-semibold text-white">Total applications</h2>
          <p className="mt-5 text-6xl font-bold text-white">{summary?.totalApplications ?? 0}</p>
          <p className="mt-4 max-w-sm text-sm leading-7 text-slate-400">
            A clean view of your active search across companies, roles, and stages.
          </p>
          <Link to="/applications" className="mt-8 inline-flex w-fit rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-500 hover:shadow-lg hover:shadow-brand-500/25">
            Review applications
          </Link>
        </div>
      </section>

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">{error}</div>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {APPLICATION_STATUS_OPTIONS.map((status) => (
          <div key={status} className="panel-muted group p-5 transition-all duration-300 hover:scale-[1.02]">
            <div className="flex items-center gap-3">
              <div 
                className="h-2 w-2 rounded-full" 
                style={{ backgroundColor: STATUS_META[status].chartColor }}
              />
              <p className="text-sm text-slate-500 dark:text-slate-400">{STATUS_META[status].label}</p>
            </div>
            <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">
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
                <CartesianGrid vertical={false} strokeDasharray="4 4" stroke={isDarkTheme ? '#334155' : '#e2e8f0'} />
                <XAxis
                  dataKey="status"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: isDarkTheme ? '#94a3b8' : '#475569', fontSize: 12 }}
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: isDarkTheme ? '#94a3b8' : '#475569', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDarkTheme ? '#18181b' : '#ffffff',
                    borderColor: isDarkTheme ? '#3f3f46' : '#e2e8f0',
                    color: isDarkTheme ? '#fafafa' : '#18181b',
                    borderRadius: '12px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                  }}
                  cursor={{ fill: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
                />
                <Bar dataKey="count" radius={[10, 10, 0, 0]} maxBarSize={60}>
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
            <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 px-6 py-10 text-center transition-colors dark:border-slate-700 dark:bg-slate-900/50">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                <svg className="h-7 w-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <p className="text-lg font-semibold text-slate-900 dark:text-slate-50">No applications yet</p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Start building your pipeline with the first role.</p>
              <Link to="/applications/new" className="button-primary mt-6">
                Add Application
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentApplications.map((application) => (
                <Link
                  key={application.id}
                  to={`/applications/${application.id}`}
                  className="group flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-4 py-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/70 dark:hover:border-brand-500/50 dark:hover:bg-slate-900"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-slate-900 dark:text-slate-50 group-hover:text-brand-600 dark:group-hover:text-brand-400">{application.companyName}</p>
                    <p className="truncate text-sm text-slate-500 dark:text-slate-400">{application.positionTitle}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <StatusBadge status={application.currentStatus} />
                    <span className="text-sm text-slate-400 dark:text-slate-500">{formatDate(application.dateApplied)}</span>
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
              <CartesianGrid vertical={false} strokeDasharray="4 4" stroke={isDarkTheme ? '#334155' : '#e2e8f0'} />
              <XAxis
                dataKey="period"
                tickLine={false}
                axisLine={false}
                tick={{ fill: isDarkTheme ? '#94a3b8' : '#475569', fontSize: 12 }}
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tick={{ fill: isDarkTheme ? '#94a3b8' : '#475569', fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDarkTheme ? '#18181b' : '#ffffff',
                  borderColor: isDarkTheme ? '#3f3f46' : '#e2e8f0',
                  color: isDarkTheme ? '#fafafa' : '#18181b',
                  borderRadius: '12px',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                }}
              />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#2563eb" 
                strokeWidth={3} 
                dot={{ r: 5, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 7, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  )
}

export default Dashboard
