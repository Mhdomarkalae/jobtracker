# Job Tracker

**Live demo:** [https://jobtracker-mu-liart.vercel.app](https://jobtracker-mu-liart.vercel.app)

*Note: The first load may take ~30–50s while the free‑tier backend wakes from idle.*

A full-stack web application for tracking job applications, interviews, and search analytics. Built with a Spring Boot REST API, a React single-page frontend, and a PostgreSQL database, with JWT-based authentication and per-user data isolation.

## Features

- Email/password authentication with JWT (24-hour expiry) and BCrypt password hashing
- Full CRUD for job applications with status tracking (applied, interviewing, offer, rejected, etc.)
- Interview scheduling and notes linked to each application
- Analytics: application summary stats and a timeline view
- Per-user data isolation — every record is scoped to the authenticated user
- Input validation on all write endpoints

Demo mode

- Guest/demo mode: the frontend includes an in-browser demo store with sample data that users can opt into via "Continue as Guest" buttons in the UI. Demo data is stored only in the browser (localStorage) and is not sent to any backend.
- Automatic fallback: the client will automatically switch to the browser-local demo store when the backend is unreachable. This fallback is enabled by default in the frontend; to disable it set VITE_ENABLE_DEMO_MODE=false at build time.


## Tech Stack

**Backend**
- Java 17, Spring Boot 3
- Spring Web (REST), Spring Data JPA / Hibernate
- Spring Security + JWT (jjwt) for auth, BCrypt for password hashing
- PostgreSQL (Supabase) in production, H2 in tests
- Maven

**Frontend**
- React 18, Vite
- Tailwind CSS
- React Router, Axios

**Infrastructure**
- Backend deployed on Render (Docker)
- Frontend deployed on Vercel
- Database hosted on Supabase (managed PostgreSQL with connection pooling)
- CI: GitHub Actions runs backend tests (./mvnw test) on pull requests; the frontend currently has no automated unit tests.
- Dependabot enabled for dependency and security updates

## Architecture

The backend follows a standard layered architecture:

```
Request → JWT filter → Controller → Service → Repository → PostgreSQL
```

- A JWT authentication filter validates the Bearer token on every protected request and populates the security context.
- Controllers handle HTTP concerns and delegate to services.
- Services hold the business logic and enforce that users only access their own records.
- Spring Data JPA repositories handle persistence.

**Data model:** a `User` owns many `Job`s; each `Job` has many `Interview`s. The analytics endpoints aggregate a user's jobs into summary and timeline views.

## API

Base URL: `/api`

### Auth
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/signup` | Create an account |
| `POST` | `/auth/login` | Log in, returns a JWT |
| `GET` | `/auth/me` | Current user (protected) |

### Jobs (require Bearer token)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/jobs` | List the user's jobs |
| `POST` | `/jobs` | Create a job |
| `PUT` | `/jobs/{id}` | Update a job |
| `PATCH` | `/jobs/{id}/status` | Update status |
| `DELETE` | `/jobs/{id}` | Delete a job |

### Interviews (require Bearer token)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/jobs/{id}/interviews` | List interviews for a job |
| `POST` | `/jobs/{id}/interviews` | Add an interview |
| `PUT` | `/interviews/{id}` | Update an interview |
| `DELETE` | `/interviews/{id}` | Delete an interview |

### Analytics (require Bearer token)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/analytics/summary` | Summary statistics |
| `GET` | `/analytics/timeline` | Timeline data |

## Getting Started

### Prerequisites
- Java 17+
- Maven (or use the included `./mvnw` wrapper)
- Node.js 20+
- A PostgreSQL database (a free Supabase project works)

### 1. Configure environment

Set the following as environment variables (or in a local `.env` that is **not** committed):

```
DATABASE_URL=jdbc:postgresql://<host>:5432/postgres?sslmode=require
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=<your-db-password>
JWT_SECRET=<base64-encoded 256-bit secret>
JWT_EXPIRATION_MS=86400000
APP_ALLOWED_ORIGIN_PATTERNS=http://localhost:5173,https://jobtracker-mu-liart.vercel.app
```

Generate a JWT secret with:

```
openssl rand -base64 32
```

### 2. Run the backend

```
./mvnw spring-boot:run
```

The API starts at `http://localhost:8080/api` in development. In production the API runs on Render; see the Deployment section and DEPLOY.md. Wait for the log line `Started JobTrackerApplication`.

### 3. Run the frontend

```
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | JDBC Postgres connection string | `jdbc:postgresql://...` |
| `DATABASE_USERNAME` | Database user | `postgres` |
| `DATABASE_PASSWORD` | Database password | _(secret)_ |
| `JWT_SECRET` | Base64-encoded 256-bit signing key | output of `openssl rand -base64 32` |
| `JWT_EXPIRATION_MS` | Token lifetime in milliseconds | `86400000` (24h) |
| `APP_ALLOWED_ORIGIN_PATTERNS` | Allowed CORS origins | `https://your-app.vercel.app` |
| `APP_COOKIE_SECURE` | Send cookies over HTTPS only | `true` in production |
| `APP_TRUST_X_FORWARDED_FOR` | Honor `X-Forwarded-For` header (only behind a trusted proxy) | `true` on Render |

## Testing

```
./mvnw test                    # backend unit/integration tests (H2)
cd frontend && npm run build   # verify the frontend builds
```

## Deployment

This project is deployed in production:

- **Backend (Render):** Spring Boot API built with the included `Dockerfile` and deployed to Render. Configuration (environment variables, service settings) is managed in the Render dashboard. Pushes to `main` trigger redeploys. See DEPLOY.md for detailed steps.
- **Frontend (Vercel):** the React/Vite frontend is deployed on Vercel; the project Root Directory is `frontend/`. Vercel rewrites proxy `/api/*` to the Render backend (see `frontend/vercel.json`). See DEPLOY.md for Vercel setup.
- **Database (Supabase):** managed PostgreSQL with connection pooling in production.


## Security

- JWT authentication with 24-hour expiry
- BCrypt password hashing
- Per-user data isolation enforced in the service layer
- Input validation on all write endpoints
- CORS restricted to configured origins
- Secrets injected via environment variables, never committed to the repo
- Dependabot alerts plus a CI job that runs the test suite on every pull request
