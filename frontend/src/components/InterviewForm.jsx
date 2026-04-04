import { useEffect, useState } from 'react'
import { INTERVIEW_TYPE_LABELS, INTERVIEW_TYPE_OPTIONS } from '../utils/options'
import { toDateTimeInputValue } from '../utils/formatters'

const defaultValues = {
  interviewType: 'PHONE_SCREEN',
  scheduledDate: '',
  interviewerName: '',
  notes: '',
  durationMinutes: '',
  completed: false,
}

function buildFormValues(initialValues) {
  return {
    ...defaultValues,
    ...initialValues,
    scheduledDate: initialValues?.scheduledDate
      ? toDateTimeInputValue(initialValues.scheduledDate)
      : initialValues?.scheduledDate || '',
    durationMinutes:
      initialValues?.durationMinutes === null || initialValues?.durationMinutes === undefined
        ? ''
        : String(initialValues.durationMinutes),
  }
}

function InterviewForm({ initialValues = defaultValues, onSubmit, onCancel, submitLabel = 'Save Interview' }) {
  const [formValues, setFormValues] = useState(buildFormValues(initialValues))
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setFormValues(buildFormValues(initialValues))
    setError('')
    setFieldErrors({})
  }, [initialValues])

  function handleChange(event) {
    const { name, value, type, checked } = event.target
    setFormValues((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
    setFieldErrors((current) => ({
      ...current,
      [name]: '',
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const nextFieldErrors = {}
    if (!formValues.scheduledDate) {
      nextFieldErrors.scheduledDate = 'Scheduled date is required.'
    }

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors)
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      await onSubmit({
        ...formValues,
        interviewerName: formValues.interviewerName.trim(),
        notes: formValues.notes.trim(),
        durationMinutes: formValues.durationMinutes ? Number(formValues.durationMinutes) : null,
      })
    } catch (submitError) {
      setError(submitError?.message || 'Unable to save the interview.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
          {error}
        </div>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="field-label" htmlFor="interviewType">
            Interview Type
          </label>
          <select
            id="interviewType"
            name="interviewType"
            className="field-input"
            value={formValues.interviewType}
            onChange={handleChange}
          >
            {INTERVIEW_TYPE_OPTIONS.map((type) => (
              <option key={type} value={type}>
                {INTERVIEW_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="field-label" htmlFor="scheduledDate">
            Scheduled Date
          </label>
          <input
            id="scheduledDate"
            name="scheduledDate"
            type="datetime-local"
            className="field-input"
            value={formValues.scheduledDate}
            onChange={handleChange}
          />
          {fieldErrors.scheduledDate ? (
            <p className="mt-2 text-sm text-rose-600 dark:text-rose-300">{fieldErrors.scheduledDate}</p>
          ) : null}
        </div>

        <div>
          <label className="field-label" htmlFor="interviewerName">
            Interviewer Name
          </label>
          <input
            id="interviewerName"
            name="interviewerName"
            className="field-input"
            value={formValues.interviewerName}
            onChange={handleChange}
            placeholder="Sarah Chen"
          />
        </div>

        <div>
          <label className="field-label" htmlFor="durationMinutes">
            Duration Minutes
          </label>
          <input
            id="durationMinutes"
            name="durationMinutes"
            type="number"
            min="1"
            className="field-input"
            value={formValues.durationMinutes}
            onChange={handleChange}
            placeholder="60"
          />
        </div>
      </div>

      <div>
        <label className="field-label" htmlFor="notes">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows="4"
          className="field-input resize-y"
          value={formValues.notes}
          onChange={handleChange}
          placeholder="Interview focus, prep items, or follow-up notes."
        />
      </div>

      <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-200">
        <input
          type="checkbox"
          name="completed"
          checked={formValues.completed}
          onChange={handleChange}
          className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-900"
        />
        Mark interview as completed
      </label>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button type="button" className="button-secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </button>
        <button type="submit" className="button-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  )
}

export default InterviewForm
