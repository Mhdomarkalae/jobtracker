# Job Tracker

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Java](https://img.shields.io/badge/Java-17%2B-blue)](https://www.java.com/)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)

> [Live Demo](https://jobtracker.vercel.app) &mdash; Explore the app with built-in demo mode (no login required).

A full-stack web application for tracking job applications throughout the hiring process. Built with Spring Boot and React, featuring real-time analytics, interview scheduling, and an animated dark/light theme.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Spring Boot 3, Spring Security, JPA/Hibernate |
| Database | PostgreSQL (Supabase) |
| Authentication | JWT, BCrypt |
| Deployment | Render (API), Vercel (frontend) |

## Features

- **Application Management** &mdash; Track job applications with company, position, salary, and status
- **Interview Scheduling** &mdash; Schedule and manage interview rounds for each application
- **Status Tracking** &mdash; Visual timeline of application status changes
- **Analytics Dashboard** &mdash; Real-time pipeline metrics and submission trends
- **Dark/Light Mode** &mdash; Animated theme switching for comfortable viewing
- **User Authentication** &mdash; Secure account system with JWT tokens
- **Demo Mode** &mdash; Explore all features instantly with preloaded sample data

## Getting Started

### Prerequisites

- Java 17+
- Node.js 20+
- PostgreSQL database (local or Supabase)

### Backend Setup

```bash
# Configure environment
cp .env.example .env
# Edit .env with your database credentials

# Start backend
./mvnw spring-boot:run
```

API runs at `http://localhost:8080/api`

### Frontend Setup

```bash
cd frontend
cp .env.example .env
# Edit .env if you need a custom API URL

npm install
npm run dev
```

App runs at `http://localhost:5173`

> **Note:** When the backend is unreachable, the frontend automatically falls back to a fully functional demo mode using browser-local data. No database required to explore the UI.

## Environment Variables

Configure the following in your `.env` file (root directory):

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL JDBC connection URL |
| `DATABASE_USERNAME` | Database username |
| `DATABASE_PASSWORD` | Database password |
| `JWT_SECRET` | Secret key for signing JWT tokens |
| `JWT_EXPIRATION_MS` | JWT token lifetime in milliseconds |
| `APP_ALLOWED_ORIGIN_PATTERNS` | Allowed CORS origin patterns |

## Project Structure

```
jobtracker/
├── src/main/java/         # Spring Boot backend
├── src/main/resources/    # Backend configuration
├── src/test/              # Backend tests
├── frontend/              # React frontend
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable UI components
│   │   ├── services/      # API client and demo store
│   │   ├── context/       # React context providers
│   │   └── demo/          # Demo mode data store
│   └── ...
├── .env.example           # Environment variable template
├── Dockerfile             # Container build
├── render.yaml            # Render deployment config
└── start-backend.sh       # Convenience script to run backend
```

## Security

- JWT-based authentication with configurable expiration (app.jwt.expiration-ms)
- BCrypt password hashing
- User data isolation (each user sees only their own data)
- Input validation on all endpoints (Bean Validation + SafeHttpUrl + server-side sanitization)
- CORS restricted to configured origin patterns (app.cors.allowed-origin-patterns)
- CSRF protection for cookie-based endpoints; XSRF token endpoint provided for SPAs
- Cookies: session cookie is HttpOnly, Secure when app.security.cookie-secure=true, SameSite=Strict
- HikariCP connection pooling with timeout limits
- Rate limiting: an in-memory rate limiter is included for convenience (RateLimitService). This is suitable for single-instance deployments only — for production use a distributed rate limiter (Redis, API Gateway, or similar).
- X-Forwarded-For: only trusted when explicitly enabled (app.security.trust-x-forwarded-for=true). Do not enable unless running behind a trusted reverse proxy.
- Dependency vulnerability scanning: run OWASP Dependency-Check locally or enable Dependabot/Snyk in CI to catch vulnerabilities automatically.

## License

MIT
