# JobTracker API

Express.js REST API for JobTracker using Prisma and Supabase PostgreSQL.

## Setup

```bash
npm install
```

## Environment

Uses `.env.local` for database configuration (see `.env.local.example`).

## Running

```bash
# Development
npm run dev

# Production
npm start
```

Server runs on `http://localhost:3000` by default.

## API Endpoints

### Health

- `GET /api/health` - Health check

### Users

- `GET /api/users` - Get all users with their jobs
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
  ```json
  {
    "email": "user@example.com"
  }
  ```

### Jobs

- `GET /api/jobs` - Get all jobs (sorted by newest first)
- `GET /api/users/:userId/jobs` - Get jobs for specific user
- `GET /api/jobs/:id` - Get job by ID
- `POST /api/jobs` - Create new job
  ```json
  {
    "company": "Tech Corp",
    "position": "Senior Engineer",
    "status": "APPLIED",
    "salary": "$150,000 - $180,000",
    "location": "San Francisco, CA",
    "notes": "Optional notes",
    "userId": 1
  }
  ```
- `PATCH /api/jobs/:id` - Update job
  ```json
  {
    "status": "INTERVIEWING"
  }
  ```
- `DELETE /api/jobs/:id` - Delete job

### Stats

- `GET /api/stats` - Get job statistics

## Job Status Enum

- `APPLIED`
- `INTERVIEWING`
- `OFFER`
- `REJECTED`

## Error Handling

All errors return JSON with error message:
```json
{
  "error": "Error message"
}
```

## Examples

### Create a user
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"email":"bob@example.com"}'
```

### Create a job
```bash
curl -X POST http://localhost:3000/api/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "company":"Meta",
    "position":"Backend Engineer",
    "status":"APPLIED",
    "salary":"$160,000",
    "location":"Menlo Park, CA",
    "userId":1
  }'
```

### Update job status
```bash
curl -X PATCH http://localhost:3000/api/jobs/1 \
  -H "Content-Type: application/json" \
  -d '{"status":"INTERVIEWING"}'
```

### Get all jobs
```bash
curl http://localhost:3000/api/jobs
```

### Get stats
```bash
curl http://localhost:3000/api/stats
```
