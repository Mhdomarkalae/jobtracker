import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { deleteApplication, getApplications, getApiErrorMessage } from '../services/api'
import StatusBadge from '../components/StatusBadge'
import { formatDate, sortApplicationsByDateApplied } from '../utils/formatters'
import { APPLICATION_STATUS_OPTIONS } from '../utils/options'

function ApplicationsList() {
  const navigate = useNavigate()
  const [applications, setApplications] = useState([])
  const [selectedStatus, setSelectedStatus] = useState('ALL')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function loadApplications() {
      setLoading(true)
      setError('')

      try {
        const page = await getApplications(selectedStatus === 'ALL' ? undefined : selectedStatus, {
          page: 0,
          size: 100,
        })
        if (isMounted) {
          setApplications(sortApplicationsByDateApplied(page.content ?? []))
        }
      } catch (loadError) {
        if (isMounted) {
          setError(getApiErrorMessage(loadError, 'Unable to load applications.'))
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadApplications()

    return () => {
      isMounted = false
    }
  }, [selectedStatus])

  async function handleDelete(event, applicationId) {
    event.stopPropagation()

    if (!window.confirm('Delete this application? This will also remove its status history and interviews.')) {
      return
    }

    setDeletingId(applicationId)
    setError('')

    try {
      await deleteApplication(applicationId)
      setApplications((current) => current.filter((application) => application.id !== applicationId))
    } catch (deleteError) {
      setError(getApiErrorMessage(deleteError, 'Unable to delete the application.'))
    } finally {
      setDeletingId(null)
    }
  }

  const emptyMessage = useMemo(() => {
    if (selectedStatus === 'ALL') {
      return 'No applications yet.'
    }

    return `No applications with status "${selectedStatus}".`
  }, [selectedStatus])

  return (
    <div className="flex flex-col gap-6">
      <section className="panel p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Applications</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">Pipeline</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
              Filter by stage and open any role for details, interviews, and history.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <select
              value={selectedStatus}
              onChange={(event) => setSelectedStatus(event.target.value)}
              className="field-input min-w-[200px]"
            >
              <option value="ALL">All statuses</option>
              {APPLICATION_STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <Link to="/applications/new" className="button-primary">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add application
            </Link>
          </div>
        </div>
      </section>

      {error ? (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-500/30 dark:bg-rose-950/40 dark:text-rose-200">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="panel flex min-h-[240px] items-center justify-center p-8">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-600 dark:border-slate-700 dark:border-t-slate-300" />
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Loading applications…</p>
          </div>
        </div>
      ) : applications.length === 0 ? (
        <div className="panel px-6 py-12 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-md border border-[#e2e4e9] bg-slate-50 dark:border-[#1e2029] dark:bg-[#16181f]">
            <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <p className="text-base font-medium text-slate-900 dark:text-slate-100">{emptyMessage}</p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Save a role to populate this list.</p>
          <Link to="/applications/new" className="button-primary mt-4 inline-flex">
            Add application
          </Link>
        </div>
      ) : (
        <>
          <div className="panel-muted px-4 py-2 text-sm text-slate-600 dark:text-slate-400">
            Showing {applications.length} application{applications.length !== 1 ? 's' : ''}
            {selectedStatus !== 'ALL' && ` · ${selectedStatus}`}
          </div>

          <div className="flex flex-col gap-2 md:hidden">
            {applications.map((application) => (
              <div
                key={application.id}
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/applications/${application.id}`)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    navigate(`/applications/${application.id}`)
                  }
                }}
                className="panel w-full cursor-pointer p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{application.companyName}</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{application.positionTitle}</p>
                    {application.location ? (
                      <p className="mt-2 text-xs text-slate-500 dark:text-slate-500">{application.location}</p>
                    ) : null}
                  </div>
                  <StatusBadge status={application.currentStatus} />
                </div>
                <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Applied {formatDate(application.dateApplied)}</p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Link
                    to={`/applications/${application.id}`}
                    onClick={(event) => event.stopPropagation()}
                    className="button-secondary"
                  >
                    Open
                  </Link>
                  <button
                    type="button"
                    onClick={(event) => handleDelete(event, application.id)}
                    className="button-danger"
                    disabled={deletingId === application.id}
                  >
                    {deletingId === application.id ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="panel hidden overflow-hidden md:block">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#e2e4e9] dark:divide-[#1e2029]">
                <thead className="bg-slate-50 dark:bg-[#16181f]">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400">Company</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400">Position</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400">Applied</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400">Location</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e4e9] dark:divide-[#1e2029]">
                  {applications.map((application) => (
                    <tr
                      key={application.id}
                      className="cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-[#16181f]"
                      onClick={() => navigate(`/applications/${application.id}`)}
                    >
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{application.companyName}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{application.positionTitle}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={application.currentStatus} />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                        {formatDate(application.dateApplied)}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">{application.location || '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Link
                            to={`/applications/${application.id}`}
                            onClick={(event) => event.stopPropagation()}
                            className="button-ghost text-xs"
                          >
                            View
                          </Link>
                          <button
                            type="button"
                            onClick={(event) => handleDelete(event, application.id)}
                            className="button-ghost text-xs text-rose-700 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950/50"
                            disabled={deletingId === application.id}
                          >
                            {deletingId === application.id ? 'Deleting…' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default ApplicationsList
