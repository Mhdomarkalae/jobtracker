import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { checkBackendAvailability } from '../services/api'

function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { canUseDemoFallback, continueWithDemo, login, getAuthErrorMessage } = useAuth()
  const [formValues, setFormValues] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [backendUnavailable, setBackendUnavailable] = useState(false)

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
    setBackendUnavailable(false)

    try {
      const isAvailable = await checkBackendAvailability()
      if (!isAvailable) {
        setBackendUnavailable(true)
        setIsSubmitting(false)
        return
      }

      await login({
        email: formValues.email.trim(),
        password: formValues.password,
      })

      navigate(location.state?.from?.pathname ?? '/', { replace: true })
    } catch (error) {
      console.error(error)
      setSubmitError(getAuthErrorMessage(error, 'Unable to log in.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-7xl items-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid w-full gap-8 lg:grid-cols-[1.05fr,0.95fr]">
        <section className="panel overflow-hidden p-8 md:p-10">
          <div className="mb-8">
            <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-lg font-bold text-white shadow-lg shadow-brand-500/25">
              JT
            </div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-600">Job Tracker</p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">Track every application with a private account.</h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-600 dark:text-slate-400">
              Sign in to manage your own pipeline, interviews, status history, and analytics across devices.
            </p>
          </div>
          
          {canUseDemoFallback ? (
            <div className="mb-6 rounded-2xl border border-amber-200/50 bg-amber-50/80 p-5 backdrop-blur-sm dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
              <div className="flex items-start gap-3">
                <svg className="mt-0.5 h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm">Prefer to look around first? Use guest demo mode to explore the full UI with sample applications before signing up.</p>
              </div>
            </div>
          ) : null}

          {backendUnavailable ? (
            <div className="mb-6 rounded-2xl border border-rose-200/50 bg-rose-50/80 p-5 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
              <div className="flex items-start gap-3">
                <svg className="mt-0.5 h-5 w-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-semibold">Backend unavailable</p>
                  <p className="mt-1 text-sm">Login requires a backend connection. Try the demo mode instead.</p>
                  <button
                    type="button"
                    className="mt-3 text-sm font-semibold text-brand-600 hover:text-brand-700"
                    onClick={() => {
                      continueWithDemo()
                      navigate('/', { replace: true })
                    }}
                  >
                    Continue to demo →
                  </button>
                </div>
              </div>
            </div>
          ) : null}
          
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="panel-muted p-4">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10">
                <svg className="h-5 w-5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Private jobs</p>
              <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">Each account only sees its own records.</p>
            </div>
            <div className="panel-muted p-4">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Realtime progress</p>
              <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">Keep statuses, notes, and interviews in one place.</p>
            </div>
            <div className="panel-muted p-4">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10">
                <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Deploy-ready</p>
              <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">Works locally and with hosted Postgres.</p>
            </div>
          </div>
        </section>

        <section className="panel p-8 md:p-10">
          <h2 className="text-3xl font-semibold">Log in</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="font-semibold text-brand-600 transition hover:text-brand-700">
              Create one
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {submitError ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
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
              {errors.email ? <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">{errors.email}</p> : null}
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
                placeholder="Enter your password"
              />
              {errors.password ? <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">{errors.password}</p> : null}
            </div>

            <button type="submit" className="button-primary w-full justify-center" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Logging in...
                </span>
              ) : (
                'Log in'
              )}
            </button>

            {canUseDemoFallback ? (
              <button
                type="button"
                className="button-ghost w-full justify-center"
                onClick={() => {
                  continueWithDemo()
                  navigate('/', { replace: true })
                }}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Continue as Guest
              </button>
            ) : null}
          </form>
        </section>
      </div>
    </div>
  )
}

export default Login
