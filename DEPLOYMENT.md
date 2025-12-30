# Deployment Guide - QuestInvest Pro

## Render Deployment Setup

### Prerequisites
- Render account (https://render.com)
- PostgreSQL database (Neon recommended)
- GitHub repository

### Step-by-Step Deployment

#### 1. **Create PostgreSQL Database on Render**
   - Go to https://render.com/dashboard
   - Click "New +" → "PostgreSQL"
   - Database name: `questinvest-db`
   - Keep defaults, click "Create Database"
   - Copy the **External Database URL** (you'll need this)

#### 2. **Create Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Service name: `questinvest-pro`
   - Environment: `Node`
   - Build Command:
     ```bash
     npm install && npm run build && npm run db:push -- --force
     ```
   - Start Command:
     ```bash
     NODE_ENV=production node dist/index.cjs
     ```

#### 3. **Set Environment Variables**
   Add these in the Render dashboard (Environment):
   ```
   DATABASE_URL=<your-postgres-url-from-step-1>
   NODE_ENV=production
   VITE_API_URL=https://<your-service-name>.onrender.com
   ```

#### 4. **Deploy**
   - Click "Create Web Service"
   - Render will automatically deploy and sync your database schema
   - Wait for the build to complete (usually 3-5 minutes)
   - Your app will be available at `https://<service-name>.onrender.com`

### Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host/db` |
| `NODE_ENV` | Environment mode | `production` |
| `VITE_API_URL` | Frontend API endpoint | `https://app.onrender.com` |

### Database Migrations

Migrations are automatically applied during build via the build command:
```bash
npm run db:push -- --force
```

### SSL/HTTPS

Render provides free SSL certificates automatically.

### Monitoring & Logs

1. Go to your service dashboard
2. Click "Logs" tab to view real-time logs
3. Check "Events" tab for deployment history

### Troubleshooting

**Build fails with "DATABASE_URL not found":**
- Ensure DATABASE_URL is set in Environment variables
- Restart the deployment

**Port 5000 not responding:**
- Check logs for errors
- Verify the start command is correct

**Database connection errors:**
- Test DATABASE_URL locally with: `psql <DATABASE_URL>`
- Ensure network access is allowed

### Production Checklist

- [ ] DATABASE_URL configured correctly
- [ ] VITE_API_URL set to production domain
- [ ] NODE_ENV set to `production`
- [ ] SSL/TLS enabled (automatic on Render)
- [ ] Admin user created or accessible via `/api/admin/grant-access`
- [ ] Deposit system ready (USDT TRC20 address configured)
