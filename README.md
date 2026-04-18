# Job Tracker

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Java](https://img.shields.io/badge/Java-17%2B-blue)](https://www.java.com/)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)

A full-stack web application for tracking job applications throughout the hiring process.

## Overview

Job Tracker helps you manage your job search by organizing applications, tracking interview progress, and visualizing your pipeline. Built with modern technologies and designed for a seamless user experience.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Spring Boot 3, Spring Security |
| Database | PostgreSQL (Supabase) |
| Authentication | JWT, BCrypt |

## Features

- **Application Management** - Track job applications with company, position, salary, and status
- **Interview Scheduling** - Schedule and manage interview rounds for each application
- **Status Tracking** - Visual timeline of application status changes
- **Analytics Dashboard** - Real-time pipeline metrics and submission trends
- **Dark/Light Mode** - Animated theme switching for comfortable viewing
- **User Authentication** - Secure account system with JWT tokens

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
npm install
npm run dev
```

App runs at `http://localhost:5173`

## Project Structure

```
jobtracker/
├── src/main/java/     # Spring Boot backend
├── frontend/          # React frontend
│   ├── src/
│   │   ├── pages/     # Page components
│   │   ├── components/ # Reusable UI components
│   │   ├── services/  # API client
│   │   └── context/   # React context providers
│   └── ...
└── ...
```

## Environment Variables

Configure the following in your `.env` file:

| Variable | Description |
|----------|-------------|
| `DB_URL` | PostgreSQL connection URL |
| `DB_USER` | Database username |
| `DB_PASSWORD` | Database password |
| `JWT_SECRET` | Secret key for JWT tokens |

## Security

- JWT-based authentication with configurable expiration
- BCrypt password hashing
- User data isolation (each user sees only their own data)
- Input validation on all endpoints

## License

MIT
