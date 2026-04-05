# Code Walkthrough

This document is a guided map of the project for learning and review.

## High-level architecture

The app has three layers:

1. React frontend in [`frontend/`](/Users/mhdomarkalae/IdeaProjects/jobtracker/frontend)
2. Spring Boot API in [`src/main/java/com/omar/jobtracker/`](/Users/mhdomarkalae/IdeaProjects/jobtracker/src/main/java/com/omar/jobtracker)
3. PostgreSQL database, locally through Docker and in production through Supabase

The frontend never talks directly to the database. It only talks to the Spring Boot API.

## Backend structure

### `model/`

These are the JPA entities that Hibernate stores in PostgreSQL.

- [`Application.java`](/Users/mhdomarkalae/IdeaProjects/jobtracker/src/main/java/com/omar/jobtracker/model/Application.java)
  Main job-tracking record.
- [`User.java`](/Users/mhdomarkalae/IdeaProjects/jobtracker/src/main/java/com/omar/jobtracker/model/User.java)
  Stores the owner of each application and the password hash.
- [`Interview.java`](/Users/mhdomarkalae/IdeaProjects/jobtracker/src/main/java/com/omar/jobtracker/model/Interview.java)
  Stores interview rounds for an application.
- [`StatusHistory.java`](/Users/mhdomarkalae/IdeaProjects/jobtracker/src/main/java/com/omar/jobtracker/model/StatusHistory.java)
  Stores the status timeline for an application.

### `repository/`

These are Spring Data interfaces. They generate SQL queries from method names.

- [`ApplicationRepository.java`](/Users/mhdomarkalae/IdeaProjects/jobtracker/src/main/java/com/omar/jobtracker/repository/ApplicationRepository.java)
  Includes user-scoped lookup methods so one user cannot read another user's jobs.
- [`InterviewRepository.java`](/Users/mhdomarkalae/IdeaProjects/jobtracker/src/main/java/com/omar/jobtracker/repository/InterviewRepository.java)
  Includes user-scoped interview lookups.
- [`UserRepository.java`](/Users/mhdomarkalae/IdeaProjects/jobtracker/src/main/java/com/omar/jobtracker/repository/UserRepository.java)
  Used during signup and login.

### `service/`

This is where business logic lives.

- [`AuthService.java`](/Users/mhdomarkalae/IdeaProjects/jobtracker/src/main/java/com/omar/jobtracker/service/AuthService.java)
  Handles signup, login, and the current-user response.
- [`ApplicationService.java`](/Users/mhdomarkalae/IdeaProjects/jobtracker/src/main/java/com/omar/jobtracker/service/ApplicationService.java)
  Handles application CRUD, status-history creation, and analytics.
- [`InterviewService.java`](/Users/mhdomarkalae/IdeaProjects/jobtracker/src/main/java/com/omar/jobtracker/service/InterviewService.java)
  Handles interview CRUD.
- [`CurrentUserService.java`](/Users/mhdomarkalae/IdeaProjects/jobtracker/src/main/java/com/omar/jobtracker/service/CurrentUserService.java)
  Reads the authenticated user from Spring Security.

### `security/`

This package wires JWT authentication into Spring Security.

- [`JwtAuthenticationFilter.java`](/Users/mhdomarkalae/IdeaProjects/jobtracker/src/main/java/com/omar/jobtracker/security/JwtAuthenticationFilter.java)
  Reads the bearer token from the request and authenticates the user.
- [`JwtService.java`](/Users/mhdomarkalae/IdeaProjects/jobtracker/src/main/java/com/omar/jobtracker/security/JwtService.java)
  Creates and validates JWTs.
- [`CustomUserDetailsService.java`](/Users/mhdomarkalae/IdeaProjects/jobtracker/src/main/java/com/omar/jobtracker/security/CustomUserDetailsService.java)
  Loads a user by email for login and token validation.

### `controller/`

Controllers define the REST API.

- [`AuthController.java`](/Users/mhdomarkalae/IdeaProjects/jobtracker/src/main/java/com/omar/jobtracker/controller/AuthController.java)
- [`ApplicationController.java`](/Users/mhdomarkalae/IdeaProjects/jobtracker/src/main/java/com/omar/jobtracker/controller/ApplicationController.java)
- [`InterviewController.java`](/Users/mhdomarkalae/IdeaProjects/jobtracker/src/main/java/com/omar/jobtracker/controller/InterviewController.java)
- [`AnalyticsController.java`](/Users/mhdomarkalae/IdeaProjects/jobtracker/src/main/java/com/omar/jobtracker/controller/AnalyticsController.java)
- [`HealthController.java`](/Users/mhdomarkalae/IdeaProjects/jobtracker/src/main/java/com/omar/jobtracker/controller/HealthController.java)

## Backend request flow

Example: `GET /api/jobs`

1. The frontend sends the request with `Authorization: Bearer <token>`.
2. [`JwtAuthenticationFilter.java`](/Users/mhdomarkalae/IdeaProjects/jobtracker/src/main/java/com/omar/jobtracker/security/JwtAuthenticationFilter.java) validates the token.
3. Spring Security stores the authenticated user in the security context.
4. [`ApplicationController.java`](/Users/mhdomarkalae/IdeaProjects/jobtracker/src/main/java/com/omar/jobtracker/controller/ApplicationController.java) calls [`ApplicationService.java`](/Users/mhdomarkalae/IdeaProjects/jobtracker/src/main/java/com/omar/jobtracker/service/ApplicationService.java).
5. [`CurrentUserService.java`](/Users/mhdomarkalae/IdeaProjects/jobtracker/src/main/java/com/omar/jobtracker/service/CurrentUserService.java) provides the logged-in user ID.
6. [`ApplicationRepository.java`](/Users/mhdomarkalae/IdeaProjects/jobtracker/src/main/java/com/omar/jobtracker/repository/ApplicationRepository.java) runs a query filtered by `user_id`.
7. The service maps entities into DTOs and returns JSON.

## Frontend structure

### `src/services/api.js`

This file is the browser-side API client.

- Creates the shared Axios instance
- Adds the auth token to requests
- Handles `401` responses
- Falls back to demo data if the backend is unreachable and `VITE_ENABLE_DEMO_FALLBACK=true`

### `src/context/AuthContext.jsx`

This file owns session state for the frontend.

- Restores the saved token on startup
- Loads the current user
- Enables demo mode automatically when the backend is down
- Exposes `login`, `signup`, `logout`, and `continueWithDemo`

### `src/demo/demoStore.js`

This is a local in-browser mock database for recruiter demos.

- Seeded with realistic sample jobs
- Stored in `localStorage`
- Used only when demo mode is active
- Mirrors the same operations as the real backend so the UI still works

### `src/pages/`

- [`Dashboard.jsx`](/Users/mhdomarkalae/IdeaProjects/jobtracker/frontend/src/pages/Dashboard.jsx)
  Analytics landing page
- [`ApplicationsList.jsx`](/Users/mhdomarkalae/IdeaProjects/jobtracker/frontend/src/pages/ApplicationsList.jsx)
  Table/list of jobs
- [`ApplicationDetail.jsx`](/Users/mhdomarkalae/IdeaProjects/jobtracker/frontend/src/pages/ApplicationDetail.jsx)
  Single job view, status history, interviews
- [`Login.jsx`](/Users/mhdomarkalae/IdeaProjects/jobtracker/frontend/src/pages/Login.jsx)
- [`Signup.jsx`](/Users/mhdomarkalae/IdeaProjects/jobtracker/frontend/src/pages/Signup.jsx)

## Demo fallback behavior

The project is designed so recruiters can still see a working app even if the free backend is asleep.

1. The frontend checks whether the backend is reachable.
2. If the backend is unreachable and demo fallback is enabled, the app switches to local demo mode.
3. In demo mode, all reads and writes go to `localStorage` through [`demoStore.js`](/Users/mhdomarkalae/IdeaProjects/jobtracker/frontend/src/demo/demoStore.js).
4. The navbar and layout display a visible demo banner so the behavior is explicit.

## Deployment files

- [`frontend/vercel.json`](/Users/mhdomarkalae/IdeaProjects/jobtracker/frontend/vercel.json)
  Single-page-app routing for Vercel
- [`render.yaml`](/Users/mhdomarkalae/IdeaProjects/jobtracker/render.yaml)
  Backend deploy settings for Render
- [`.env.example`](/Users/mhdomarkalae/IdeaProjects/jobtracker/.env.example)
  Backend environment variable template
- [`frontend/.env.example`](/Users/mhdomarkalae/IdeaProjects/jobtracker/frontend/.env.example)
  Frontend environment variable template
- [`DEPLOY_FREE.md`](/Users/mhdomarkalae/IdeaProjects/jobtracker/DEPLOY_FREE.md)
  Step-by-step safe free deployment instructions

## Best order to read the code

1. [`CODE_WALKTHROUGH.md`](/Users/mhdomarkalae/IdeaProjects/jobtracker/CODE_WALKTHROUGH.md)
2. [`src/main/java/com/omar/jobtracker/config/SecurityConfig.java`](/Users/mhdomarkalae/IdeaProjects/jobtracker/src/main/java/com/omar/jobtracker/config/SecurityConfig.java)
3. [`src/main/java/com/omar/jobtracker/service/AuthService.java`](/Users/mhdomarkalae/IdeaProjects/jobtracker/src/main/java/com/omar/jobtracker/service/AuthService.java)
4. [`src/main/java/com/omar/jobtracker/service/ApplicationService.java`](/Users/mhdomarkalae/IdeaProjects/jobtracker/src/main/java/com/omar/jobtracker/service/ApplicationService.java)
5. [`frontend/src/context/AuthContext.jsx`](/Users/mhdomarkalae/IdeaProjects/jobtracker/frontend/src/context/AuthContext.jsx)
6. [`frontend/src/services/api.js`](/Users/mhdomarkalae/IdeaProjects/jobtracker/frontend/src/services/api.js)
7. [`frontend/src/demo/demoStore.js`](/Users/mhdomarkalae/IdeaProjects/jobtracker/frontend/src/demo/demoStore.js)
