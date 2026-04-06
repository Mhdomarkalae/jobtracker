# JobTracker - Local Development Guide

## Prerequisites
- Node.js 20+ installed
- Supabase account with project created
- Your `.env.local` file with Supabase credentials

## Quick Start (3 Steps)

### Step 1: Setup Environment

```bash
cd jobtracker
cp .env.local.example .env.local
```

Edit `.env.local` with your Supabase connection details:
```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
```

### Step 2: Start Backend (Terminal 1)

```bash
npm install  # First time only
npm run dev
```

Wait for:
```
✅ Server running at http://localhost:3000
```

### Step 3: Start Frontend (Terminal 2)

```bash
cd frontend
npm install  # First time only
npm run dev
```

Wait for:
```
VITE v8.0.3 building for production...
  ➜  Local:   http://localhost:5173/
```

## Access the App

Open **http://localhost:5173** in your browser

## Architecture

```
Browser (http://localhost:5173)
    ↓ (HTTP requests)
React Frontend (Vite)
    ↓ (Axios)
Node.js/Express API (http://localhost:3000)
    ↓ (Prisma ORM)
Supabase PostgreSQL
```

## API Endpoints

**Authentication:**
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Current user (requires token)

**Jobs (all require auth token):**
- `GET /api/jobs` - List your jobs
- `POST /api/jobs` - Create job
- `PATCH /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job

**Stats:**
- `GET /api/stats` - Your job statistics

## Testing the API with curl

```bash
# Signup
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  | jq -r '.token')

# Create a job
curl -X POST http://localhost:3000/api/jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "company":"Google",
    "position":"Engineer",
    "location":"Mountain View, CA"
  }'

# Get your jobs
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/jobs | jq .
```

## Troubleshooting

**Frontend says "Cannot reach API"**
- Make sure backend is running on port 3000
- Check `.env.local` has correct Supabase credentials
- Try: `npm run test:db` to verify database connection

**API won't start**
- Check `.env.local` exists and has DATABASE_URL
- Run: `npm install` to ensure dependencies installed
- Check port 3000 isn't in use: `lsof -i :3000`

**Database migration error**
- Run: `npm run prisma:migrate:dev`
- This creates necessary tables in Supabase

## Available npm Scripts

```bash
# Backend
npm run dev                    # Start dev server
npm start                      # Production start
npm run test:db                # Test Supabase connection

# Database
npm run prisma:migrate:dev     # Create/run migrations
npm run prisma:studio          # Open GUI database browser
npm run prisma:validate        # Validate schema

# Frontend
cd frontend && npm run dev     # Start Vite dev server
cd frontend && npm run build   # Build for production
```

## Security Features

✅ Password hashing with bcrypt (10 rounds)
✅ JWT tokens with 24-hour expiration
✅ User data isolation (can't access other users' jobs)
✅ Protected API endpoints require Bearer token
✅ CORS enabled for localhost development
✅ Input validation on all endpoints

## Next Steps

1. **Test locally** - Run both servers and create some jobs
2. **Deploy** - Push to Render (backend) + Vercel (frontend)
3. **Add features** - Interviews, companies, analytics, etc.

## Help

See detailed docs:
- [`README.md`](./README.md) - Project overview
- [`API.md`](./API.md) - Full API documentation
- [`prisma/schema.prisma`](./prisma/schema.prisma) - Database schema
