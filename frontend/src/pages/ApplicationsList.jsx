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

    return `No applications with status ${selectedStatus}.`
  }, [selectedStatus])

  return (
    <div className="space-y-6">
      <section className="panel p-6 md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-600">Pipeline view</p>
            <h1 className="mt-3 text-4xl font-semibold">Applications</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
              Filter by stage, scan the full pipeline, and jump directly into the roles that need attention.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <select
              value={selectedStatus}
              onChange={(event) => setSelectedStatus(event.target.value)}
              className="field-input min-w-[210px]"
            >
              <option value="ALL">All statuses</option>
              {APPLICATION_STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <Link to="/applications/new" className="button-primary">
              Add Application
            </Link>
          </div>
        </div>
      </section>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">{error}</div>
      ) : null}

      {loading ? (
        <div className="panel flex min-h-[260px] items-center justify-center p-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-brand-100 border-t-brand-600" />
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Loading applications...</p>
          </div>
        </div>
      ) : applications.length === 0 ? (
        <div className="panel px-6 py-16 text-center">
          <p className="text-2xl font-semibold text-slate-950 dark:text-slate-50">{emptyMessage}</p>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Use the add button to create and track your next opportunity.</p>
          <Link to="/applications/new" className="button-primary mt-6">
            Add Application
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-4 md:hidden">
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
                className="panel w-full p-5 text-left transition hover:-translate-y-0.5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold text-slate-950 dark:text-slate-50">{application.companyName}</p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{application.positionTitle}</p>
                  </div>
                  <StatusBadge status={application.currentStatus} />
                </div>
                <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Applied {formatDate(application.dateApplied)}</p>
                <div className="mt-5 flex items-center gap-3">
                  <Link
                    to={`/applications/${application.id}`}
                    onClick={(event) => event.stopPropagation()}
                    className="button-secondary"
                  >
                    View Details
                  </Link>
                  <button
                    type="button"
                    onClick={(event) => handleDelete(event, application.id)}
                    className="button-danger"
                    disabled={deletingId === application.id}
                  >
                    {deletingId === application.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="panel hidden overflow-hidden md:block">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50/90 dark:bg-slate-950/80">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                      Company
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                      Position
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                      Date Applied
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {applications.map((application) => (
                    <tr
                      key={application.id}
                      className="cursor-pointer bg-white transition hover:bg-brand-50/40 dark:bg-slate-950/40 dark:hover:bg-brand-500/10"
                      onClick={() => navigate(`/applications/${application.id}`)}
                    >
                      <td className="px-6 py-5">
                        <p className="font-semibold text-slate-950 dark:text-slate-50">{application.companyName}</p>
                      </td>
                      <td className="px-6 py-5 text-slate-600 dark:text-slate-300">{application.positionTitle}</td>
                      <td className="px-6 py-5">
                        <StatusBadge status={application.currentStatus} />
                      </td>
                      <td className="px-6 py-5 text-slate-600 dark:text-slate-300">{formatDate(application.dateApplied)}</td>
                      <td className="px-6 py-5">
                        <div className="flex justify-end gap-3">
                          <Link
                            to={`/applications/${application.id}`}
                            onClick={(event) => event.stopPropagation()}
                            className="button-secondary"
                          >
                            View Details
                          </Link>
                          <button
                            type="button"
                            onClick={(event) => handleDelete(event, application.id)}
                            className="button-danger"
                            disabled={deletingId === application.id}
                          >
                            {deletingId === application.id ? 'Deleting...' : 'Delete'}
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
