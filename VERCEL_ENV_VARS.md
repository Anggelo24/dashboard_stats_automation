# Vercel Deployment Guide - Environment Variables

## Overview

This application uses **Vercel Serverless Functions** for backend API calls. The backend runs directly on Vercel without needing a separate server. All API routes are handled by serverless functions in the `/api` folder.

---

## Environment Variables Configuration

When deploying to Vercel, add these environment variables in:
**Vercel Dashboard → Your Project → Settings → Environment Variables**

### Required Variables for All Clients

```env
# =============================================================================
# FRONTEND VARIABLES (VITE_*)
# These are embedded in the client-side bundle
# =============================================================================

# Supabase Configuration (for Metrics page)
VITE_SUPABASE_URL=https://cdgolvcyibkdcpoqbifv.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkZ29sdmN5aWJrZGNwb3FiaWZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3MjY0OTIsImV4cCI6MjA3ODMwMjQ5Mn0.7rxnYNKDakBuvG_11KIsalGlgSJI4fyqjbbq79k-FbY

# Client Branding (unique per client)
VITE_CLIENT_ID=2e75e60c-2362-42d1-8300-225944efb8db
VITE_CLIENT_NAME=TuinityAI Dashboard
VITE_LOGO_URL=https://res.cloudinary.com/db3espoei/image/upload/v1761193211/imagen_2025-10-22_230620072-removebg-preview_mo1hss.png

# Google Sheets (for Mi Negocio form - unique per client)
VITE_GOOGLE_SHEETS_URL=https://script.google.com/macros/s/AKfycbwNO6erzZsW-hmiM4lJJIS02L0XvW5YPlZoJnR5nd4gwvks16ou-BSkEl_9CJR5fgEL/exec

# =============================================================================
# BACKEND VARIABLES (Server-side only - SECURE)
# These are ONLY accessible by Vercel Serverless Functions
# NEVER use VITE_* prefix for API keys or secrets
# =============================================================================

# N8N Backend Configuration (unique per client)
N8N_BASE_URL=https://n8n.tuinity.lat/api/v1
N8N_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjNzUyYzZmNi02NzFlLTQ2OGQtOGNjMS0wZTZiNmJhZjliZWEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzYyMjI0ODM1fQ.UHhmARLByCEtXgbxNUcrb-PhQOk8zwlQeTrY_wasOmQ

# Email Configuration for Support Tickets (unique per client)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=soporte@tuinity.lat
EMAIL_PASSWORD=your_gmail_app_password_here
```

---

## How to Get Email App Password (Gmail)

For the `EMAIL_PASSWORD` variable, you need a Gmail App Password:

1. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
2. Sign in with your Gmail account
3. Create a new app password for "Mail"
4. Copy the 16-character password
5. Use this password in `EMAIL_PASSWORD` variable (not your regular Gmail password)

---

## Architecture: Vercel Serverless Functions

### What Changed?

**Before:** Express backend running on `localhost:3001`
**Now:** Vercel Serverless Functions in `/api` folder

### Benefits:

- No separate backend server to host
- Automatic scaling
- Built-in HTTPS and CDN
- Environment variables are secure (server-side only)
- Works for all clients with different configurations

### API Routes:

All API calls are made to relative paths (`/api/*`) which are handled by Vercel:

- `/api/workflows/summary` → N8N workflows list
- `/api/workflows/[id]` → Workflow details
- `/api/workflows/[id]/activate` → Activate workflow
- `/api/workflows/[id]/deactivate` → Deactivate workflow
- `/api/executions` → Get executions
- `/api/executions/[id]` → Execution details
- `/api/metrics/dashboard` → Dashboard metrics
- `/api/metrics/workflow/[id]` → Workflow-specific metrics
- `/api/support/ticket` → Send support email
- `/api/health` → Health check

---

## Deployment Steps

### 1. Local Testing

```bash
# Install dependencies
npm install

# Copy .env.example to .env and fill in your values
cp .env.example .env

# Run dev server
npm run dev
```

### 2. Deploy to Vercel

```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

### 3. Configure Environment Variables

1. Go to Vercel Dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add all variables from the list above
5. Redeploy if already deployed

---

## Per-Client Configuration

Each client needs their own:

1. **N8N Instance**
   - `N8N_BASE_URL` - Client's N8N API URL
   - `N8N_API_KEY` - Client's N8N API key

2. **Branding**
   - `VITE_CLIENT_ID` - Unique client identifier
   - `VITE_CLIENT_NAME` - Client's display name
   - `VITE_LOGO_URL` - Client's logo URL

3. **Email**
   - `EMAIL_USER` - Support email address
   - `EMAIL_PASSWORD` - Gmail app password

4. **Google Sheets**
   - `VITE_GOOGLE_SHEETS_URL` - Client's Google Sheets script URL

---

## Testing After Deployment

1. Visit your Vercel URL
2. Test each page:
   - ✅ Home → Dashboard metrics
   - ✅ Automatizaciones → N8N workflows
   - ✅ Mi Negocio → Google Sheets form
   - ✅ Métricas → Supabase analytics
   - ✅ Soporte → Email ticket submission

3. Check for errors in browser console
4. Verify API calls are going to `/api/*` (not `localhost:3001`)

---

## Troubleshooting

### Fetch Errors in Production

**Problem:** "Failed to fetch" errors
**Solution:** Check that environment variables are set in Vercel dashboard

### N8N API Errors

**Problem:** "N8N API Error: 401"
**Solution:** Verify `N8N_API_KEY` and `N8N_BASE_URL` are correct

### Email Not Sending

**Problem:** "Error sending support ticket"
**Solution:**
- Use Gmail App Password (not regular password)
- Verify `EMAIL_USER` and `EMAIL_PASSWORD` are set
- Check that Gmail account has "Less secure app access" enabled or use App Password

### API Routes Not Working

**Problem:** 404 errors on `/api/*` routes
**Solution:** Ensure `vercel.json` exists and is configured correctly

---

## Support

For issues or questions, contact: Soporte@tuinity.lat
