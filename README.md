# Job Tracker

Full-stack job application tracker with a **Spring Boot API, Prisma/Supabase PostgreSQL**, and a **React/Vite frontend**.

For a guided code map, see [`CODE_WALKTHROUGH.md`](/Users/mhdomarkalae/IdeaProjects/jobtracker/CODE_WALKTHROUGH.md).

## Stack

- **Backend**: Spring Boot 3, Spring Data JPA, Spring Security, PostgreSQL, JWT, Maven
- **Frontend**: React 18, Vite, Tailwind CSS, React Router, Axios
- **Database**: Supabase (managed PostgreSQL with connection pooling)

## Quick Start

### Prerequisites
- Java 17+ and Maven
- Node.js 20+
- Supabase account

### 1. Environment Setup

Set your `.env` file with Supabase credentials:
```env
DATABASE_URL=jdbc:postgresql://db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require&connectTimeout=30
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=[YOUR-PASSWORD]
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRATION_MS=86400000
APP_ALLOWED_ORIGIN_PATTERNS=http://localhost:*,http://127.0.0.1:*
```

### 2. Start Backend (Terminal 1)

```bash
./mvnw spring-boot:run
```

Waits for: `Started JobTrackerApplication`
API runs at: `http://localhost:8080/api`

### 3. Start Frontend (Terminal 2)

```bash
cd frontend
npm install  # First time only
npm run dev
```

Then open: **http://localhost:5173**

## API Endpoints

**Authentication:**
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login  
- `GET /api/auth/me` - Current user (protected)

**Jobs (all require Bearer token):**
- `GET /api/jobs` - List jobs
- `POST /api/jobs` - Create job
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job
- `PATCH /api/jobs/:id/status` - Update status

**Interviews:**
- `GET /api/jobs/:id/interviews` - List interviews
- `POST /api/jobs/:id/interviews` - Create interview
- `PUT /api/interviews/:id` - Update interview
- `DELETE /api/interviews/:id` - Delete interview

**Analytics:**
- `GET /api/analytics/summary` - Get summary stats
- `GET /api/analytics/timeline` - Get timeline data

## Security Features

✅ JWT authentication with 24-hour expiration
✅ Password hashing with BCrypt
✅ User data isolation (users only see their own jobs)
✅ Protected endpoints require Bearer token
✅ CORS configured for localhost
✅ Input validation on all endpoints

## Testing

```bash
# Test database connection
npm run test:db

# Build frontend
cd frontend && npm run build
```
