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
      <section className="grid gap-6 xl:grid-cols-[1.45fr,0.95fr]">
        <div className="panel overflow-hidden p-8 md:p-10">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-600">
                  Command Center
                </p>
                <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">
                  Keep the search legible while the market stays noisy.
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-400">
                  See which roles are progressing, where conversations are slowing down, and which applications still deserve follow-up energy this week.
                </p>
              </div>
              <div className="rounded-[1.75rem] border border-white/65 bg-white/55 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-950/45">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Response rate</p>
                <p className="mt-3 text-4xl font-semibold text-slate-900 dark:text-white">{responseRate}%</p>
                <p className="mt-2 max-w-[15rem] text-sm text-slate-500 dark:text-slate-400">
                  A quick read on whether your outreach is converting into actual conversations.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {overviewMetrics.map((metric) => (
                <div key={metric.label} className="panel-muted p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{metric.label}</p>
                  <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">{metric.value}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{metric.note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="panel flex flex-col justify-between overflow-hidden p-8 md:p-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-600 dark:text-brand-400">Snapshot</p>
            <h2 className="mt-3 text-3xl font-semibold">Today&apos;s search posture</h2>
            <p className="mt-3 max-w-sm text-sm leading-7 text-slate-500 dark:text-slate-400">
              A single panel for volume, momentum, and whether the pipeline still has forward pressure.
            </p>
          </div>
          <div className="mt-8 grid gap-4">
            <div className="rounded-[1.75rem] border border-white/70 bg-[linear-gradient(135deg,rgba(37,99,235,0.16),rgba(125,211,252,0.12))] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.38)] dark:border-slate-800/60 dark:bg-[linear-gradient(135deg,rgba(37,99,235,0.16),rgba(99,102,241,0.12))]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 dark:text-slate-300">Total applications</p>
              <p className="mt-3 text-6xl font-bold text-slate-950 dark:text-white">{totalApplications}</p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Everything currently tracked in the system.</p>
            </div>
            <Link to="/applications" className="button-primary w-full justify-center">
              Review applications
            </Link>
          </div>
        </div>
      </section>

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">{error}</div>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {APPLICATION_STATUS_OPTIONS.map((status) => (
          <div key={status} className="panel-muted group p-5 transition-all duration-300 hover:scale-[1.01]">
            <div className="flex items-center gap-3">
              <div 
                className="h-2.5 w-2.5 rounded-full shadow-[0_0_0_6px_rgba(255,255,255,0.24)]" 
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
                <CartesianGrid vertical={false} strokeDasharray="4 4" stroke={isDark ? '#334155' : '#d9e1ef'} />
                <XAxis
                  dataKey="status"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: isDark ? '#94a3b8' : '#5e6b84', fontSize: 12 }}
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: isDark ? '#94a3b8' : '#5e6b84', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#162033' : 'rgba(255,251,247,0.96)',
                    borderColor: isDark ? '#334155' : '#d9e1ef',
                    color: isDark ? '#fafafa' : '#18181b',
                    borderRadius: '18px',
                    boxShadow: '0 22px 70px rgba(15,23,42,0.22)',
                  }}
                  cursor={{ fill: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(37,99,235,0.06)' }}
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
            <div className="rounded-[1.75rem] border border-dashed border-white/70 bg-white/45 px-6 py-10 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] backdrop-blur-sm transition-colors dark:border-slate-700 dark:bg-slate-950/45">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[1.4rem] bg-white/75 shadow-[0_20px_44px_-28px_rgba(15,23,42,0.2)] dark:bg-slate-900/70">
                <svg className="h-7 w-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <p className="text-lg font-semibold text-slate-900 dark:text-slate-50">No applications yet</p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">The first saved role will start your pipeline, trend charts, and follow-up history.</p>
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
                  className="group flex items-center justify-between gap-4 rounded-[1.35rem] border border-white/70 bg-white/60 px-4 py-4 shadow-[0_18px_44px_-30px_rgba(15,23,42,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-[0_24px_54px_-30px_rgba(37,99,235,0.2)] dark:border-slate-800/70 dark:bg-slate-950/55 dark:hover:border-brand-500/50 dark:hover:bg-slate-900"
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
              <CartesianGrid vertical={false} strokeDasharray="4 4" stroke={isDark ? '#334155' : '#d9e1ef'} />
              <XAxis
                dataKey="period"
                tickLine={false}
                axisLine={false}
                tick={{ fill: isDark ? '#94a3b8' : '#5e6b84', fontSize: 12 }}
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tick={{ fill: isDark ? '#94a3b8' : '#5e6b84', fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#162033' : 'rgba(255,251,247,0.96)',
                  borderColor: isDark ? '#334155' : '#d9e1ef',
                  color: isDark ? '#fafafa' : '#18181b',
                  borderRadius: '18px',
                  boxShadow: '0 22px 70px rgba(15,23,42,0.22)',
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
