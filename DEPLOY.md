# Render Deployment Guide

## Prerequisites
- [Render Account](https://render.com)
- [GitHub Repository](https://github.com) with your code pushed

## Deploy Backend to Render

### Step 1: Create a New Web Service

1. Go to [dashboard.render.com](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your **GitHub** repository
4. Configure the service:

| Setting | Value |
|---------|-------|
| **Name** | `job-tracker-api` |
| **Region** | Choose closest to you |
| **Branch** | `main` |
| **Root Directory** | Leave empty |
| **Runtime** | `Node` or `Docker` |

### Step 2: Configure Build & Deploy

**Option A: Using a Render Spec File (Recommended)**

Create `render.yaml` in your project root:

```yaml
services:
  - type: web
    name: job-tracker-api
    env: docker
    dockerfilePath: ./Dockerfile
    healthCheckPath: /api/health
    envVars:
      - key: DATABASE_URL
        sync: false
      - key: DATABASE_USERNAME
        sync: false
      - key: DATABASE_PASSWORD
        sync: false
      - key: JWT_SECRET
        generateValue: true
      - key: JWT_EXPIRATION_MS
        value: "86400000"
      - key: APP_ALLOWED_ORIGIN_PATTERNS
        value: "https://your-frontend.vercel.app"
```

**Option B: Manual Configuration**

If not using render.yaml:

| Setting | Value |
|---------|-------|
| **Build Command** | `./mvnw clean package -DskipTests` |
| **Start Command** | `java -jar target/job-tracker-0.0.1-SNAPSHOT.jar` |

### Step 3: Set Environment Variables

In Render dashboard, add these (use your Supabase values):

| Key | Value |
|-----|-------|
| `DATABASE_URL` | `jdbc:postgresql://db.xxx.supabase.co:5432/postgres?sslmode=require` |
| `DATABASE_USERNAME` | `postgres` |
| `DATABASE_PASSWORD` | Your Supabase password |
| `JWT_SECRET` | Generate a secure random string |
| `JWT_EXPIRATION_MS` | `86400000` |
| `APP_ALLOWED_ORIGIN_PATTERNS` | `https://*.vercel.app` |

### Step 4: Deploy

Click **"Create Web Service"** and wait for deployment.

Your API will be live at: `https://job-tracker-api.onrender.com`

---

## Deploy Frontend to Vercel

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Prepare for deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/jobtracker.git
git push -u origin main
```

### Step 2: Create Vercel Project

1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Configure:

| Setting | Value |
|---------|-------|
| **Framework Preset** | `Vite` |
| **Root Directory** | `frontend` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |

### Step 3: Set Environment Variables

Click **"Environment Variables"** and add:

| Name | Value |
|------|-------|
| `VITE_API_BASE_URL` | `https://job-tracker-api.onrender.com/api` |

### Step 4: Deploy

Click **"Deploy"** and your site will be live at: `https://your-project.vercel.app`

---

## Update CORS for Production

After deploying, update your Render environment variable:

```
APP_ALLOWED_ORIGIN_PATTERNS = https://*.vercel.app,https://job-tracker.vercel.app
```

---

## Troubleshooting

### Backend Won't Start?
- Check Render logs for errors
- Verify environment variables are set
- Ensure Supabase is not paused

### Frontend Can't Connect to API?
- Verify `VITE_API_BASE_URL` points to your Render URL
- Check CORS settings on Render
- Add `https://jobtracker.vercel.app` to allowed origins

### Database Connection Issues?
- Verify Supabase project is not paused
- Check SSL settings in DATABASE_URL
- Ensure IP allowlist includes Render's IPs (usually not needed for Supabase)

---

## Free Tier Notes

| Platform | Free Tier | Limitation |
|----------|-----------|------------|
| **Vercel** | ✅ Yes | None for hobby |
| **Render** | ⚠️ Limited | Sleeps after 15 min inactivity |
| **Supabase** | ✅ Yes | Pauses after 7 days inactivity |

For a resume project, Vercel is great. For the backend, consider upgrading to Render's $7/month hobby plan to avoid cold starts.
