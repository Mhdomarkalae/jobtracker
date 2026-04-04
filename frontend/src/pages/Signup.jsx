import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

function Signup() {
  const navigate = useNavigate()
  const { signup, getAuthErrorMessage } = useAuth()
  const [formValues, setFormValues] = useState({ email: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  function validate() {
    const nextErrors = {}

    if (!formValues.email.trim()) {
      nextErrors.email = 'Email is required.'
    }

    if (!formValues.password) {
      nextErrors.password = 'Password is required.'
    } else if (formValues.password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters.'
    }

    if (formValues.confirmPassword !== formValues.password) {
      nextErrors.confirmPassword = 'Passwords must match.'
    }

    return nextErrors
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const nextErrors = validate()
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setIsSubmitting(true)
    setSubmitError('')

    try {
      await signup({
        email: formValues.email.trim(),
        password: formValues.password,
      })
      navigate('/', { replace: true })
    } catch (error) {
      console.error(error)
      setSubmitError(getAuthErrorMessage(error, 'Unable to create the account.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-7xl items-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid w-full gap-8 lg:grid-cols-[0.95fr,1.05fr]">
        <section className="panel p-8 md:p-10">
          <h1 className="text-4xl font-semibold sm:text-5xl">Create your account</h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-600 dark:text-slate-300">
            Your jobs, interviews, analytics, and status history stay tied to your own login and database records.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {submitError ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
                {submitError}
              </div>
            ) : null}

            <div>
              <label className="field-label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className="field-input"
                value={formValues.email}
                onChange={handleChange}
                placeholder="you@example.com"
              />
              {errors.email ? <p className="mt-2 text-sm text-rose-600 dark:text-rose-300">{errors.email}</p> : null}
            </div>

            <div>
              <label className="field-label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                className="field-input"
                value={formValues.password}
                onChange={handleChange}
                placeholder="At least 8 characters"
              />
              {errors.password ? <p className="mt-2 text-sm text-rose-600 dark:text-rose-300">{errors.password}</p> : null}
            </div>

            <div>
              <label className="field-label" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                className="field-input"
                value={formValues.confirmPassword}
                onChange={handleChange}
                placeholder="Repeat your password"
              />
              {errors.confirmPassword ? (
                <p className="mt-2 text-sm text-rose-600 dark:text-rose-300">{errors.confirmPassword}</p>
              ) : null}
            </div>

            <button type="submit" className="button-primary w-full justify-center" disabled={isSubmitting}>
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </button>
          </form>
        </section>

        <section className="panel overflow-hidden p-8 md:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-600">Private workspace</p>
          <h2 className="mt-4 text-4xl font-semibold">Move from local demo data to a real deployable app.</h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-600 dark:text-slate-300">
            This build uses JWT authentication and a persistent Postgres database so your tracker survives refreshes, restarts, and deployment.
          </p>
          <div className="mt-8 rounded-3xl bg-slate-950 px-6 py-6 text-white dark:bg-slate-900">
            <p className="text-sm uppercase tracking-[0.18em] text-cyan-300">Already registered?</p>
            <p className="mt-3 text-lg text-slate-200">Log in and continue where you left off.</p>
            <Link to="/login" className="mt-6 inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-100">
              Back to login
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Signup
