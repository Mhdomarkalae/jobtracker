# Job Tracker

Full-stack job application tracker with a **Node.js/Express API, Prisma ORM, Supabase PostgreSQL**, and a **React/Vite frontend**.

For a guided code map, see [`CODE_WALKTHROUGH.md`](/Users/mhdomarkalae/IdeaProjects/jobtracker/CODE_WALKTHROUGH.md).

## Stack

- **Backend**: Node.js, Express.js, Prisma ORM, Supabase PostgreSQL
- **Frontend**: React 18, Vite, Tailwind CSS, React Router, Axios
- **Database**: Supabase (managed PostgreSQL with connection pooling)
- **Infrastructure**: Environment-based configuration with `.env.local`

## Quick Start

### Prerequisites
- Node.js 20+
- Supabase account and project (see [Supabase Setup](#supabase-setup))

### 1. Install Dependencies

```bash
npm install
cd frontend && npm install && cd ..
```

### 2. Set Up Environment

Copy `.env.local.example` to `.env.local` and add your Supabase credentials:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
```

### 3. Run Database Migrations

```bash
npm run prisma:migrate:dev -- --name init
```

### 4. Start the API Server

```bash
npm run dev
```

API runs at `http://localhost:3000/api`

### 5. Start the Frontend (in another terminal)

```bash
cd frontend
npm run dev
```

Frontend runs at `http://localhost:5173`

## API Documentation

See [`API.md`](./API.md) for full endpoint documentation.

### Key Endpoints

**Health**
- `GET /api/health` - Health check

**Users**
- `GET /api/users` - Get all users
- `POST /api/users` - Create user
- `GET /api/users/:id` - Get user by ID

**Jobs**
- `GET /api/jobs` - Get all jobs
- `POST /api/jobs` - Create job
- `GET /api/jobs/:id` - Get job by ID
- `PATCH /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job
- `GET /api/users/:userId/jobs` - Get jobs for user

**Stats**
- `GET /api/stats` - Get job statistics

## Supabase Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Get your Direct Connection string:
   - Go to Settings → Database → Connection String
   - Choose "URI" format
   - Copy the connection string

3. Add to `.env.local`:
```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
```

4. Run migrations:
```bash
npm run prisma:migrate:dev
```

## NPM Scripts

```bash
# API
npm run dev                 # Start Express server on :3000
npm start                   # Production start

# Database
npm run prisma:validate     # Validate schema
npm run prisma:pull         # Introspect from database
npm run prisma:generate     # Generate Prisma Client
npm run prisma:migrate:dev  # Create and run migrations
npm run prisma:studio       # Open Prisma Studio GUI
npm run test:db             # Test database connectivity
```

## Project Structure

```
jobtracker/
├── server.js                    # Express.js main server
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── migrations/             # Database migrations
├── test-db.js                   # Database connectivity test
├── package.json                 # Node.js dependencies
├── .env.local                   # Local environment (git-ignored)
├── .env.local.example           # Template for .env.local
├── API.md                       # API documentation
├── frontend/                    # React/Vite application
│   ├── src/
│   │   └── services/api.js     # Axios API client
│   ├── package.json
│   └── .env.example
└── src/                         # Spring Boot backend (legacy)
```

## Testing

Test the database connection:
```bash
npm run test:db
```

This creates a test user and job, verifies CRUD operations, and confirms Supabase connectivity.

## Notes

- The Node.js/Express backend replaces the Spring Boot backend for Supabase integration
- Spring Boot backend is still available but has connection issues with Supabase (see `src/` directory)
- Frontend works with demo fallback if backend is unavailable
- All API responses are JSON
- Status enum values: `APPLIED`, `INTERVIEWING`, `OFFER`, `REJECTED`
