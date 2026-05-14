import { useNavigate } from 'react-router-dom'
import ApplicationForm from '../components/ApplicationForm'
import { createApplication, getApiErrorMessage } from '../services/api'

function NewApplication() {
  const navigate = useNavigate()

  async function handleCreate(formValues) {
    try {
      const created = await createApplication(formValues)
      navigate(`/applications/${created.id}`)
    } catch (createError) {
      throw new Error(getApiErrorMessage(createError, 'Unable to create the application.'))
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="grid gap-6 xl:grid-cols-[0.95fr,1.25fr]">
        <div className="panel p-6">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">New record</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">Add an application</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-400">
            Capture the essentials so follow-ups, interviews, and status updates stay tied to one record.
          </p>
          <div className="mt-6 space-y-4">
            <div className="panel-muted p-4">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">What to capture</p>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                Company, role, date applied, stage, compensation, and context you will need later.
              </p>
            </div>
            <div className="panel-muted p-4">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Why it matters</p>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                This record powers analytics, the application list, interviews, and status history.
              </p>
            </div>
          </div>
        </div>

        <section className="panel p-6">
          <ApplicationForm
            onSubmit={handleCreate}
            onCancel={() => navigate('/applications')}
            submitLabel="Create Application"
          />
        </section>
      </section>
    </div>
  )
}

export default NewApplication
