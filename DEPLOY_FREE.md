# Safe Free Deployment Plan

This plan keeps the app publicly viewable for recruiters while minimizing billing risk.

## Safety Rules

1. Use only free plans.
2. Do not add a credit card or payment method.
3. Do not start any Pro or trial plan.
4. Use provider subdomains only.
5. Keep the frontend on Vercel Hobby, the backend on Render Free, and the database on Supabase Free.

## What you already have

- Frontend Vercel config: [`frontend/vercel.json`](/Users/mhdomarkalae/IdeaProjects/jobtracker/frontend/vercel.json)
- Backend Render config: [`render.yaml`](/Users/mhdomarkalae/IdeaProjects/jobtracker/render.yaml)
- Backend env template: [`.env.example`](/Users/mhdomarkalae/IdeaProjects/jobtracker/.env.example)
- Frontend env template: [`frontend/.env.example`](/Users/mhdomarkalae/IdeaProjects/jobtracker/frontend/.env.example)
- Recruiter-safe demo fallback if the backend is down: enabled with `VITE_ENABLE_DEMO_FALLBACK=true`

## Architecture

- Frontend: Vercel Hobby
- Backend: Render Free Web Service
- Database: Supabase Free Postgres

## Step 1: Create Supabase Free Postgres

1. Create a Supabase account.
2. Create one new project on the Free plan.
3. Do not upgrade the org.
4. Copy:
   - host
   - database name
   - port
   - user
   - password

Build your JDBC URL:

```bash
export DATABASE_URL="jdbc:postgresql://db.<project-ref>.supabase.co:5432/postgres?sslmode=require"
export DATABASE_USERNAME="<supabase-user>"
export DATABASE_PASSWORD="<supabase-password>"
```

## Step 2: Generate a JWT secret

Use a long random secret:

```bash
openssl rand -base64 48
```

Then set:

```bash
export JWT_SECRET="<paste-generated-secret>"
export JWT_EXPIRATION_MS="86400000"
```

## Step 3: Prepare frontend and backend URLs

Before deploying, keep placeholders ready:

```bash
export FRONTEND_URL="https://<your-project>.vercel.app"
export BACKEND_URL="https://<your-backend>.onrender.com"
export APP_ALLOWED_ORIGIN_PATTERNS="http://localhost:*,http://127.0.0.1:*,$FRONTEND_URL"
```

## Step 4: Deploy backend to Render Free

1. Push the repo to GitHub.
2. In Render, click `New +` -> `Blueprint`.
3. Select this GitHub repo.
4. Confirm the service from [`render.yaml`](/Users/mhdomarkalae/IdeaProjects/jobtracker/render.yaml).
5. Make sure the plan is `free`.
6. Set these environment variables in Render:

```text
DATABASE_URL=jdbc:postgresql://db.<project-ref>.supabase.co:5432/postgres?sslmode=require
DATABASE_USERNAME=<supabase-user>
DATABASE_PASSWORD=<supabase-password>
JWT_SECRET=<generated-secret>
JWT_EXPIRATION_MS=86400000
APP_ALLOWED_ORIGIN_PATTERNS=https://<your-project>.vercel.app
```

7. Deploy.
8. After deploy, open:

```text
https://<your-backend>.onrender.com/api/health
```

It should return a JSON response with `"status":"ok"`.

## Step 5: Deploy frontend to Vercel Hobby

1. In Vercel, import the GitHub repo.
2. Set the root directory to `frontend`.
3. Keep the project on `Hobby`.
4. Do not enable any paid add-ons or trial.
5. Set these environment variables:

```text
VITE_API_BASE_URL=https://<your-backend>.onrender.com/api
VITE_ENABLE_DEMO_FALLBACK=true
```

6. Deploy.
7. Open your free Vercel subdomain.

## Step 6: Update Render CORS after Vercel gives you the final URL

If you deployed Render before Vercel, update:

```text
APP_ALLOWED_ORIGIN_PATTERNS=https://<your-project>.vercel.app
```

Then redeploy the backend.

## Step 7: Verify the live demo

1. Open the Vercel URL.
2. If Render is awake, you should see the real app and auth flow.
3. If Render is asleep or unreachable, the frontend will automatically switch to local demo data.
4. Confirm:
   - dashboard loads
   - applications list loads
   - application detail loads
   - navbar shows `Resume Demo` if fallback mode is active

## Minimal copy-paste variable template

Use this locally as a checklist before entering values in the dashboards:

```bash
cat <<'EOF'
Render env vars:
DATABASE_URL=jdbc:postgresql://db.<project-ref>.supabase.co:5432/postgres?sslmode=require
DATABASE_USERNAME=<supabase-user>
DATABASE_PASSWORD=<supabase-password>
JWT_SECRET=<long-random-secret>
JWT_EXPIRATION_MS=86400000
APP_ALLOWED_ORIGIN_PATTERNS=https://<your-project>.vercel.app

Vercel env vars:
VITE_API_BASE_URL=https://<your-backend>.onrender.com/api
VITE_ENABLE_DEMO_FALLBACK=true
EOF
```

## Resume-safe behavior

- If Render free spins down, recruiters still see sample data in the frontend.
- No card means no accidental pay-as-you-go charges.
- Using provider subdomains avoids domain costs.

## Important limitation

Render Free may sleep after inactivity, so the first live backend request can be slow. The frontend fallback exists to keep the portfolio experience presentable even then.
