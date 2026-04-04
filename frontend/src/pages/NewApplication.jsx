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
    <div className="space-y-6">
      <section className="panel p-6 md:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-600">New record</p>
        <h1 className="mt-3 text-4xl font-semibold">Add an application</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
          Capture the essentials now so follow-ups, interviews, and status updates stay anchored to one clear record.
        </p>
      </section>

      <section className="panel p-6 md:p-8">
        <ApplicationForm
          onSubmit={handleCreate}
          onCancel={() => navigate('/applications')}
          submitLabel="Create Application"
        />
      </section>
    </div>
  )
}

export default NewApplication
