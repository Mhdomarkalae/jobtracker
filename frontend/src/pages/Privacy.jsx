import { Link } from 'react-router-dom'
import SiteFooter from '../components/SiteFooter'
import ThemeToggle from '../components/ThemeToggle'

/** Update with your contact email for privacy and deletion requests. */
const CONTACT_EMAIL = 'privacy@yourdomain.example'

function Privacy() {
  return (
    <div className="flex min-h-screen flex-col text-slate-900 dark:text-slate-100">
      <header className="border-b border-[#e2e4e9] bg-[#f5f6f8] dark:border-[#1e2029] dark:bg-[#0a0b0e]">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link to="/" className="text-sm font-semibold text-slate-900 hover:underline dark:text-slate-100">
            Job Tracker
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            >
              Log in
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <article className="panel mx-auto max-w-3xl p-6 md:p-8">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">Privacy Policy</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Last updated: February 13, 2026</p>

          <div className="mt-8 space-y-8 text-sm leading-6 text-slate-600 dark:text-slate-400">
            <section>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Introduction</h2>
              <p className="mt-2">
                Job Tracker is a personal web application built for portfolio and learning purposes. It is designed to
                help students and job seekers organize their search by tracking job applications, interview stages, and
                related notes in one place. This policy describes how information is handled when you use the service.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Data we collect</h2>
              <p className="mt-2">We collect only what is needed to run the product:</p>
              <ul className="mt-3 list-disc space-y-2 pl-5">
                <li>
                  <strong className="font-medium text-slate-800 dark:text-slate-200">Account data:</strong> your email
                  address and a cryptographic hash of your password (we do not store your password in plain text).
                </li>
                <li>
                  <strong className="font-medium text-slate-800 dark:text-slate-200">Content you enter:</strong> any
                  information you add about your job search, such as company names, role titles, application dates,
                  status updates, recruiter or interview contacts, notes, and salary or compensation details you
                  choose to record.
                </li>
                <li>
                  <strong className="font-medium text-slate-800 dark:text-slate-200">Session data:</strong> when you
                  sign in, the application issues a JSON Web Token (JWT) so your browser can stay authenticated. Tokens
                  and related session hints may be stored in local storage or similar browser storage so you remain
                  logged in until you sign out or the token expires.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">How we use your data</h2>
              <p className="mt-2">
                Data is used solely to provide the Job Tracker features you interact with: authentication, storing and
                displaying your applications and history, and keeping your session secure. We do not sell your personal
                information. We do not use third-party advertising or analytics trackers (for example, we do not use
                Google Analytics on this application).
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Where data is processed</h2>
              <p className="mt-2">
                The service consists of a React frontend hosted on Vercel, a Spring Boot API hosted on Render, and a
                PostgreSQL database used to persist account and application data. Processing occurs on these
                infrastructure providers in accordance with their respective terms and security practices.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Data security</h2>
              <p className="mt-2">
                Passwords are handled using industry-standard one-way hashing so they are not stored in readable form.
                Traffic between your browser and the API should be protected using HTTPS on the deployed environments.
                While we follow reasonable practices for a small portfolio project, no method of transmission or storage
                is completely secure; use the service at your discretion and avoid entering highly sensitive information
                you are not comfortable storing in a cloud database.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Your rights and choices</h2>
              <p className="mt-2">
                You may request deletion of your account and the personal data associated with it (including
                application records tied to your account) by contacting us at the email below. We will confirm receipt
                and delete or anonymize your information within a reasonable period, unless a limited retention is
                required by law.
              </p>
              <p className="mt-2">
                You can also stop using the service at any time; signing out clears the active session from your
                browser, but copies of data you previously saved may remain on the servers until a deletion request is
                processed.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Changes</h2>
              <p className="mt-2">
                This policy may be updated occasionally. The &quot;Last updated&quot; date at the top will change when
                revisions are published. Continued use of Job Tracker after changes constitutes acceptance of the updated
                policy.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Contact</h2>
              <p className="mt-2">
                For privacy questions, account deletion requests, or other inquiries, contact the operator at{' '}
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="font-medium text-slate-900 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-500 dark:text-slate-100"
                >
                  {CONTACT_EMAIL}
                </a>
                .
              </p>
            </section>
          </div>
        </article>
      </main>

      <SiteFooter />
    </div>
  )
}

export default Privacy
