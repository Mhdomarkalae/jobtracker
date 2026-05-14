import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ApplicationForm from '../components/ApplicationForm'
import InterviewForm from '../components/InterviewForm'
import Modal from '../components/Modal'
import StatusBadge from '../components/StatusBadge'
import {
  createInterview,
  deleteApplication,
  deleteInterview,
  getApplication,
  getApiErrorMessage,
  getInterviews,
  updateApplication,
  updateApplicationStatus,
  updateInterview,
} from '../services/api'
import {
  formatDate,
  formatDateTime,
  formatInterviewTypeLabel,
  formatSalary,
  toDateInputValue,
} from '../utils/formatters'
import { APPLICATION_STATUS_OPTIONS } from '../utils/options'

function ApplicationDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [application, setApplication] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusForm, setStatusForm] = useState({ status: 'APPLIED', notes: '' })
  const [statusError, setStatusError] = useState('')
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showInterviewModal, setShowInterviewModal] = useState(false)
  const [activeInterview, setActiveInterview] = useState(null)
  const [feedback, setFeedback] = useState({ tone: '', message: '' })
  const [deletingInterviewId, setDeletingInterviewId] = useState(null)

  async function loadApplication(showRefreshError = true) {
    setLoading(true)
    setError('')

    try {
      const [detail, interviews] = await Promise.all([getApplication(id), getInterviews(id)])
      setApplication({
        ...detail,
        interviews,
      })
      setStatusForm((current) => ({
        ...current,
        status: detail.currentStatus,
      }))
    } catch (loadError) {
      const message = getApiErrorMessage(loadError, 'Unable to load application details.')
      if (showRefreshError) {
        setError(message)
      } else {
        setFeedback({ tone: 'error', message })
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadApplication()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function handleStatusUpdate(event) {
    event.preventDefault()

    setUpdatingStatus(true)
    setStatusError('')
    setFeedback({ tone: '', message: '' })

    try {
      const updated = await updateApplicationStatus(id, statusForm.status, statusForm.notes)
      const interviews = await getInterviews(id)
      setApplication({
        ...updated,
        interviews,
      })
      setStatusForm((current) => ({
        ...current,
        notes: '',
      }))
      setFeedback({ tone: 'success', message: 'Status updated successfully.' })
    } catch (updateError) {
      setStatusError(getApiErrorMessage(updateError, 'Unable to update the application status.'))
    } finally {
      setUpdatingStatus(false)
    }
  }

  async function handleApplicationSave(formValues) {
    try {
      const updated = await updateApplication(id, formValues)
      const interviews = await getInterviews(id)
      setApplication({
        ...updated,
        interviews,
      })
      setShowEditModal(false)
      setFeedback({ tone: 'success', message: 'Application updated successfully.' })
    } catch (saveError) {
      throw new Error(getApiErrorMessage(saveError, 'Unable to update the application.'))
    }
  }

  async function handleInterviewSave(formValues) {
    try {
      if (activeInterview) {
        await updateInterview(activeInterview.id, formValues)
      } else {
        await createInterview(id, formValues)
      }

      await loadApplication(false)
      setShowInterviewModal(false)
      setActiveInterview(null)
      setFeedback({
        tone: 'success',
        message: activeInterview ? 'Interview updated successfully.' : 'Interview added successfully.',
      })
    } catch (saveError) {
      throw new Error(getApiErrorMessage(saveError, 'Unable to save the interview.'))
    }
  }

  async function handleDeleteInterview(interviewId) {
    if (!window.confirm('Delete this interview?')) {
      return
    }

    setDeletingInterviewId(interviewId)
    setFeedback({ tone: '', message: '' })

    try {
      await deleteInterview(interviewId)
      await loadApplication(false)
      setFeedback({ tone: 'success', message: 'Interview deleted successfully.' })
    } catch (deleteError) {
      setFeedback({
        tone: 'error',
        message: getApiErrorMessage(deleteError, 'Unable to delete the interview.'),
      })
    } finally {
      setDeletingInterviewId(null)
    }
  }

  async function handleDeleteApplication() {
    if (!window.confirm('Delete this application and all related interviews/history?')) {
      return
    }

    try {
      await deleteApplication(id)
      navigate('/applications')
    } catch (deleteError) {
      setFeedback({
        tone: 'error',
        message: getApiErrorMessage(deleteError, 'Unable to delete the application.'),
      })
    }
  }

  if (loading) {
    return (
      <div className="panel flex min-h-[280px] items-center justify-center p-8">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-600 dark:border-slate-700 dark:border-t-slate-300" />
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Loading application…</p>
        </div>
      </div>
    )
  }

  if (!application) {
    return (
      <div className="panel px-6 py-12 text-center">
        <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">Application not found</p>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{error || 'The requested application could not be loaded.'}</p>
        <Link to="/applications" className="button-primary mt-6">
          Back to Applications
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <section className="panel overflow-hidden">
        <div className="border-b border-[#e2e4e9] px-6 py-6 dark:border-[#1e2029]">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Application</p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">{application.companyName}</h1>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{application.positionTitle}</p>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                <StatusBadge status={application.currentStatus} />
                <span>Applied {formatDate(application.dateApplied)}</span>
                {application.location ? <span>{application.location}</span> : null}
                {application.salary != null ? <span>{formatSalary(application.salary)}</span> : null}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button type="button" className="button-secondary" onClick={() => setShowEditModal(true)}>
                Edit Application
              </button>
              <button type="button" className="button-danger" onClick={handleDeleteApplication}>
                Delete Application
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-6 p-6 xl:grid-cols-[1.1fr,0.9fr]">
          <div className="space-y-6">
            {error ? (
              <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-500/30 dark:bg-rose-950/40 dark:text-rose-200">{error}</div>
            ) : null}
            {feedback.message ? (
              <div
                className={`rounded-md px-3 py-2 text-sm ${
                  feedback.tone === 'error'
                    ? 'border border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-500/30 dark:bg-rose-950/40 dark:text-rose-200'
                    : 'border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-200'
                }`}
              >
                {feedback.message}
              </div>
            ) : null}

            <div className="panel-muted p-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Overview</h2>
              <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-semibold text-slate-500 dark:text-slate-400">Created</dt>
                  <dd className="mt-1 text-base text-slate-900 dark:text-slate-100">{formatDateTime(application.createdAt)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-semibold text-slate-500 dark:text-slate-400">Updated</dt>
                  <dd className="mt-1 text-base text-slate-900 dark:text-slate-100">{formatDateTime(application.updatedAt)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-semibold text-slate-500 dark:text-slate-400">Job URL</dt>
                  <dd className="mt-1 text-base text-slate-900 dark:text-slate-100">
                    {application.jobUrl ? (
                      <a href={application.jobUrl} target="_blank" rel="noreferrer" className="font-medium text-slate-900 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-500 dark:text-slate-100">
                        Open listing
                      </a>
                    ) : (
                      'N/A'
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-semibold text-slate-500 dark:text-slate-400">Current stage</dt>
                  <dd className="mt-1">
                    <StatusBadge status={application.currentStatus} />
                  </dd>
                </div>
              </dl>
              <div className="mt-6">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Notes</p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600 dark:text-slate-400">
                  {application.notes || 'No notes added for this application yet.'}
                </p>
              </div>
            </div>

            <div className="panel-muted p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Interviews</h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Scheduled conversations and outcomes.</p>
                </div>
                <button
                  type="button"
                  className="button-primary"
                  onClick={() => {
                    setActiveInterview(null)
                    setShowInterviewModal(true)
                  }}
                >
                  Add Interview
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {application.interviews?.length ? (
                  application.interviews.map((interview) => (
                    <div
                      key={interview.id}
                      className="rounded-lg border border-[#e2e4e9] bg-white px-4 py-4 dark:border-[#1e2029] dark:bg-[#111318]"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            {formatInterviewTypeLabel(interview.interviewType)}
                          </p>
                          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{formatDateTime(interview.scheduledDate)}</p>
                          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                            Interviewer: {interview.interviewerName || 'Not specified'}
                          </p>
                          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                            Duration: {interview.durationMinutes ? `${interview.durationMinutes} minutes` : 'Not set'}
                          </p>
                          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                            Status: {interview.completed ? 'Completed' : 'Upcoming'}
                          </p>
                          {interview.notes ? <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{interview.notes}</p> : null}
                        </div>
                        <div className="flex flex-wrap gap-3">
                          <button
                            type="button"
                            className="button-secondary"
                            onClick={() => {
                              setActiveInterview(interview)
                              setShowInterviewModal(true)
                            }}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="button-danger"
                            onClick={() => handleDeleteInterview(interview.id)}
                            disabled={deletingInterviewId === interview.id}
                          >
                            {deletingInterviewId === interview.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-lg border border-dashed border-[#e2e4e9] bg-slate-50 px-4 py-8 text-center dark:border-[#1e2029] dark:bg-[#16181f]">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">No interviews scheduled</p>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Add the next conversation so prep notes and outcomes stay attached to this role.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="panel-muted p-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Update status</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Record each change and preserve the history.</p>

              <form className="mt-6 space-y-4" onSubmit={handleStatusUpdate}>
                <div>
                  <label className="field-label" htmlFor="status">
                    New Status
                  </label>
                  <select
                    id="status"
                    className="field-input"
                    value={statusForm.status}
                    onChange={(event) =>
                      setStatusForm((current) => ({
                        ...current,
                        status: event.target.value,
                      }))
                    }
                  >
                    {APPLICATION_STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="field-label" htmlFor="statusNotes">
                    Notes
                  </label>
                  <textarea
                    id="statusNotes"
                    rows="4"
                    className="field-input resize-y"
                    value={statusForm.notes}
                    onChange={(event) =>
                      setStatusForm((current) => ({
                        ...current,
                        notes: event.target.value,
                      }))
                    }
                    placeholder="Capture context for the status change."
                  />
                </div>
                {statusError ? <p className="text-sm text-rose-600 dark:text-rose-300">{statusError}</p> : null}
                <button type="submit" className="button-primary w-full" disabled={updatingStatus}>
                  {updatingStatus ? 'Updating...' : 'Update Status'}
                </button>
              </form>
            </div>

            <div className="panel-muted p-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Status history</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Newest updates appear first.</p>

              <div className="mt-4 space-y-3">
                {application.statusHistory?.length ? (
                  application.statusHistory.map((entry) => (
                    <div key={entry.id} className="relative rounded-lg border border-[#e2e4e9] bg-white px-4 py-4 pl-5 dark:border-[#1e2029] dark:bg-[#111318]">
                      <div className="absolute left-0 top-4 h-6 w-0.5 rounded-full bg-slate-400 dark:bg-slate-500" />
                      <div className="pl-3">
                        <div className="flex flex-wrap items-center gap-3">
                          <StatusBadge status={entry.status} />
                          <span className="text-sm text-slate-500 dark:text-slate-400">{formatDateTime(entry.changedAt)}</span>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{entry.notes || 'No notes added.'}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-lg border border-dashed border-[#e2e4e9] bg-slate-50 px-4 py-8 text-center dark:border-[#1e2029] dark:bg-[#16181f]">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">No status changes yet</p>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                      The first update you make will automatically appear here.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Application">
        <ApplicationForm
          initialValues={{
            companyName: application.companyName,
            positionTitle: application.positionTitle,
            jobUrl: application.jobUrl || '',
            dateApplied: toDateInputValue(application.dateApplied),
            currentStatus: application.currentStatus,
            salary: application.salary != null ? String(application.salary) : '',
            location: application.location || '',
            notes: application.notes || '',
          }}
          onSubmit={handleApplicationSave}
          onCancel={() => setShowEditModal(false)}
          submitLabel="Save Changes"
        />
      </Modal>

      <Modal
        isOpen={showInterviewModal}
        onClose={() => {
          setShowInterviewModal(false)
          setActiveInterview(null)
        }}
        title={activeInterview ? 'Edit Interview' : 'Add Interview'}
      >
        <InterviewForm
          initialValues={activeInterview || undefined}
          onSubmit={handleInterviewSave}
          onCancel={() => {
            setShowInterviewModal(false)
            setActiveInterview(null)
          }}
          submitLabel={activeInterview ? 'Save Interview' : 'Add Interview'}
        />
      </Modal>
    </div>
  )
}

export default ApplicationDetail
