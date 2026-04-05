# Job Tracker

Full-stack job application tracker with a Spring Boot API, PostgreSQL persistence, JWT authentication, and a React/Vite frontend.

For a guided code map, see [`CODE_WALKTHROUGH.md`](/Users/mhdomarkalae/IdeaProjects/jobtracker/CODE_WALKTHROUGH.md).

## What changed

- Added persistent user accounts with a `users` table and BCrypt password hashing.
- Added JWT auth endpoints: `POST /api/auth/signup`, `POST /api/auth/login`, `GET /api/auth/me`.
- Protected all job/application, interview, and analytics endpoints so each user only sees their own data.
- Exposed authenticated `/api/jobs` CRUD routes while keeping the richer application-tracking domain already in the project.
- Updated the React frontend with login/signup, protected routes, token-aware Axios calls, loading states, and error handling.
- Added deployment-ready env templates plus frontend Vercel and backend Render config.

## Stack

- Backend: Spring Boot 3, Spring Data JPA, Spring Security, PostgreSQL, JWT, Maven
- Frontend: React 18, Vite, Tailwind CSS, React Router, Axios, date-fns, Recharts
- Local database: Docker Compose PostgreSQL
- Hosted database option: Supabase Postgres via JDBC

## API

### Auth

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Jobs

- `GET /api/jobs`
- `POST /api/jobs`
- `GET /api/jobs/{id}`
- `PUT /api/jobs/{id}`
- `DELETE /api/jobs/{id}`
- `PATCH /api/jobs/{id}/status`

### Interviews and analytics

- `GET /api/jobs/{id}/interviews`
- `POST /api/jobs/{id}/interviews`
- `PUT /api/interviews/{id}`
- `DELETE /api/interviews/{id}`
- `GET /api/analytics/summary`
- `GET /api/analytics/timeline`

## Local setup

### 1. Start PostgreSQL

```bash
docker compose up -d
```

### 2. Run the backend

```bash
./mvnw spring-boot:run
```

The API defaults to `http://localhost:8080/api`.

### 3. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

If you are using the local Node runtime that was set up in this workspace:

```bash
cd frontend
PATH="/Users/mhdomarkalae/IdeaProjects/jobtracker/.tools/node-v20.19.0-darwin-arm64/bin:$PATH" npm run dev
```

The frontend expects `VITE_API_BASE_URL=http://localhost:8080/api` by default.

## Environment variables

Backend values are documented in [`.env.example`](/Users/mhdomarkalae/IdeaProjects/jobtracker/.env.example).

Required backend variables:

- `DATABASE_URL`
- `DATABASE_USERNAME`
- `DATABASE_PASSWORD`
- `JWT_SECRET`
- `JWT_EXPIRATION_MS`
- `APP_ALLOWED_ORIGIN_PATTERNS`

Frontend values are documented in [`frontend/.env.example`](/Users/mhdomarkalae/IdeaProjects/jobtracker/frontend/.env.example).

Required frontend variable:

- `VITE_API_BASE_URL`

## Supabase setup

This project uses Supabase as managed Postgres, not as the auth provider.

1. Create a Supabase project.
2. Copy the Postgres connection details.
3. Set:
   - `DATABASE_URL=jdbc:postgresql://db.<project-ref>.supabase.co:5432/postgres?sslmode=require`
   - `DATABASE_USERNAME=<supabase-user>`
   - `DATABASE_PASSWORD=<supabase-password>`
4. Set a strong `JWT_SECRET`.
5. Set `APP_ALLOWED_ORIGIN_PATTERNS` to include your Vercel domain.

Additional notes are in [`supabase/schema-notes.md`](/Users/mhdomarkalae/IdeaProjects/jobtracker/supabase/schema-notes.md).

## Deployment

### Frontend on Vercel

1. Import the `frontend` directory as the Vercel project root.
2. Set `VITE_API_BASE_URL` to your deployed backend URL, for example `https://your-api.onrender.com/api`.
3. Vercel routing for the SPA is already configured in [`frontend/vercel.json`](/Users/mhdomarkalae/IdeaProjects/jobtracker/frontend/vercel.json).

### Backend on Render

1. Create a new Render web service from this repo.
2. Use [`render.yaml`](/Users/mhdomarkalae/IdeaProjects/jobtracker/render.yaml) or copy its settings manually.
3. Set the database and JWT environment variables.
4. Include your frontend URL in `APP_ALLOWED_ORIGIN_PATTERNS`.

If you prefer Railway or another Java host, the same env vars apply.

For the safest resume-friendly free deployment path, use [`DEPLOY_FREE.md`](/Users/mhdomarkalae/IdeaProjects/jobtracker/DEPLOY_FREE.md).

## Verification

Verified locally with:

- `./mvnw test`
- `npm run build`
- `npm run lint`

Live API verification was also run against the updated backend:

- signup and login succeeded
- authenticated `/api/jobs` create/list/update succeeded
- status changes created history automatically
- interview creation succeeded
- analytics summary returned user-scoped data
- a second user saw an empty job list, confirming isolation

## Notes

- Existing rows created before auth was added may have `user_id = null` in the local database.
- Those legacy rows will not appear for logged-in users until you assign them to a user manually.
