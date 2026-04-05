import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { canUseDemoFallback, continueWithDemo, login, getAuthErrorMessage } = useAuth()
  const [formValues, setFormValues] = useState({ email: '', password: '' })
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
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-600">Job Tracker</p>
          <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">Track every application with a private account.</h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-600 dark:text-slate-300">
            Sign in to manage your own pipeline, interviews, status history, and analytics across devices.
          </p>
          {canUseDemoFallback ? (
            <div className="mt-6 rounded-3xl border border-amber-200 bg-amber-50/80 p-5 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
              Prefer to look around first? Use guest demo mode to explore the full UI with sample applications before signing up.
            </div>
          ) : null}
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="panel-muted p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Private jobs</p>
              <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">Each account only sees its own records.</p>
            </div>
            <div className="panel-muted p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Realtime progress</p>
              <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">Keep statuses, notes, and interviews in one place.</p>
            </div>
            <div className="panel-muted p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Deploy-ready</p>
              <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">Works locally and with hosted Postgres like Supabase.</p>
            </div>
          </div>
        </section>

        <section className="panel p-8 md:p-10">
          <h2 className="text-3xl font-semibold">Log in</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="font-semibold text-brand-600 hover:text-brand-700">
              Create one
            </Link>
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
                placeholder="••••••••"
              />
              {errors.password ? <p className="mt-2 text-sm text-rose-600 dark:text-rose-300">{errors.password}</p> : null}
            </div>

            <button type="submit" className="button-primary w-full justify-center" disabled={isSubmitting}>
              {isSubmitting ? 'Logging in...' : 'Log in'}
            </button>

            {canUseDemoFallback ? (
              <button
                type="button"
                className="button-secondary w-full justify-center"
                onClick={() => {
                  continueWithDemo()
                  navigate('/', { replace: true })
                }}
              >
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
