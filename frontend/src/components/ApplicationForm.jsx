import { useEffect, useState } from 'react'
import { APPLICATION_STATUS_OPTIONS } from '../utils/options'

const defaultValues = {
  companyName: '',
  positionTitle: '',
  jobUrl: '',
  dateApplied: '',
  currentStatus: 'APPLIED',
  salaryRange: '',
  location: '',
  notes: '',
}

function buildFormValues(initialValues) {
  return {
    ...defaultValues,
    ...initialValues,
  }
}

function validate(values) {
  const nextErrors = {}

  if (!values.companyName.trim()) {
    nextErrors.companyName = 'Company name is required.'
  }

  if (!values.positionTitle.trim()) {
    nextErrors.positionTitle = 'Position title is required.'
  }

  if (!values.dateApplied) {
    nextErrors.dateApplied = 'Date applied is required.'
  }

  return nextErrors
}

function ApplicationForm({
  initialValues = defaultValues,
  onSubmit,
  onCancel,
  submitLabel = 'Save Application',
}) {
  const [formValues, setFormValues] = useState(buildFormValues(initialValues))
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setFormValues(buildFormValues(initialValues))
    setErrors({})
    setSubmitError('')
  }, [initialValues])

  function handleChange(event) {
    const { name, value } = event.target
    setFormValues((current) => ({
      ...current,
      [name]: value,
    }))
    setErrors((current) => ({
      ...current,
      [name]: '',
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const nextErrors = validate(formValues)
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setIsSubmitting(true)
    setSubmitError('')

    try {
      await onSubmit({
        ...formValues,
        companyName: formValues.companyName.trim(),
        positionTitle: formValues.positionTitle.trim(),
        jobUrl: formValues.jobUrl.trim(),
        salaryRange: formValues.salaryRange.trim(),
        location: formValues.location.trim(),
        notes: formValues.notes.trim(),
      })
    } catch (error) {
      setSubmitError(error?.message || 'Unable to save the application.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {submitError ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {submitError}
        </div>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="field-label" htmlFor="companyName">
            Company Name
          </label>
          <input
            id="companyName"
            name="companyName"
            className="field-input"
            value={formValues.companyName}
            onChange={handleChange}
            placeholder="Acme Corp"
          />
          {errors.companyName ? <p className="mt-2 text-sm text-rose-600">{errors.companyName}</p> : null}
        </div>

        <div>
          <label className="field-label" htmlFor="positionTitle">
            Position Title
          </label>
          <input
            id="positionTitle"
            name="positionTitle"
            className="field-input"
            value={formValues.positionTitle}
            onChange={handleChange}
            placeholder="Backend Engineer"
          />
          {errors.positionTitle ? <p className="mt-2 text-sm text-rose-600">{errors.positionTitle}</p> : null}
        </div>

        <div>
          <label className="field-label" htmlFor="jobUrl">
            Job URL
          </label>
          <input
            id="jobUrl"
            name="jobUrl"
            type="url"
            className="field-input"
            value={formValues.jobUrl}
            onChange={handleChange}
            placeholder="https://example.com/job"
          />
        </div>

        <div>
          <label className="field-label" htmlFor="dateApplied">
            Date Applied
          </label>
          <input
            id="dateApplied"
            name="dateApplied"
            type="date"
            className="field-input"
            value={formValues.dateApplied}
            onChange={handleChange}
          />
          {errors.dateApplied ? <p className="mt-2 text-sm text-rose-600">{errors.dateApplied}</p> : null}
        </div>

        <div>
          <label className="field-label" htmlFor="currentStatus">
            Status
          </label>
          <select
            id="currentStatus"
            name="currentStatus"
            className="field-input"
            value={formValues.currentStatus}
            onChange={handleChange}
          >
            {APPLICATION_STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="field-label" htmlFor="salaryRange">
            Salary Range
          </label>
          <input
            id="salaryRange"
            name="salaryRange"
            className="field-input"
            value={formValues.salaryRange}
            onChange={handleChange}
            placeholder="120k-140k"
          />
        </div>

        <div>
          <label className="field-label" htmlFor="location">
            Location
          </label>
          <input
            id="location"
            name="location"
            className="field-input"
            value={formValues.location}
            onChange={handleChange}
            placeholder="New York, NY"
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
          rows="5"
          className="field-input resize-y"
          value={formValues.notes}
          onChange={handleChange}
          placeholder="Capture context, referrals, and follow-up details."
        />
      </div>

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

export default ApplicationForm
