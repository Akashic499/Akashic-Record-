# Akashic Record - Deployment Guide

## Overview
This guide walks you through deploying your Akashic Record app:
- **Backend**: Node.js Express server on Render
- **Database**: PostgreSQL on Neon
- **Frontend**: React Native Expo app (deployment varies)

---

## 🚀 QUICK START (5 Steps)

### 1️⃣ Create Neon Database
- Go to [neon.tech](https://neon.tech) → Sign up
- Create a project
- Copy connection string

### 2️⃣ Deploy Backend to Render
- Go to [render.com](https://render.com) → Sign up with GitHub
- Click **New +** → **Web Service**
- Select `Akashic499/Akashic-Record-`
- Build Command: `cd artifacts/server && pnpm install && pnpm run build`
- Start Command: `node dist/index.js`

### 3️⃣ Add Environment Variables
In Render dashboard under **Environment**:
```
DATABASE_URL = postgresql://user:pass@ep-xxxx.neon.tech/db?sslmode=require
GEMINI_API_KEY = AIzaSyD...
NODE_ENV = production
```

### 4️⃣ Test Backend
Visit: `https://akashic-backend.render.com/health`
Should return: `{"status":"ok","message":"Server is running"}`

### 5️⃣ Connect Frontend
Update your app's API URL to: `https://akashic-backend.render.com`

---

## 📦 Step 1: Set Up Neon Database

### 1.1 Create Neon Account
1. Go to [neon.tech](https://neon.tech)
2. Sign up with GitHub or email
3. Create a new project
4. Choose region (recommended: US East)

### 1.2 Get Database URL
1. In Neon dashboard, go to your project
2. Click **Connection string** on the top right
3. Copy the PostgreSQL connection string
4. Format: `postgresql://user:password@ep-xxxx.neon.tech/dbname?sslmode=require`

### 1.3 Run Migrations (Optional)
```bash
# Set DATABASE_URL temporarily
export DATABASE_URL="your_neon_connection_string"

# Run migrations
cd artifacts/server
pnpm install
pnpm run db:migrate

# View database
pnpm run db:studio
```

---

## 🚀 Step 2: Deploy Backend to Render

### 2.1 Prepare Repository
```bash
# Make sure branch is up to date
git fetch origin
git checkout add-backend-deployment
git pull origin add-backend-deployment
```

### 2.2 Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Authorize GitHub access

### 2.3 Deploy Backend Service
1. Click **New +** → **Web Service**
2. Select your repo: `Akashic499/Akashic-Record-`
3. Configure:
   - **Name**: `akashic-backend`
   - **Runtime**: `Node`
   - **Branch**: `add-backend-deployment` (or `main` after merge)
   - **Build Command**: 
     ```
     cd artifacts/server && pnpm install && pnpm run build
     ```
   - **Start Command**: 
     ```
     node dist/index.js
     ```
   - **Plan**: Free (or upgrade as needed)

4. Click **Create Web Service**

### 2.4 Add Environment Variables
1. Go to **Environment** tab
2. Click **Add Environment Variable** for each:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | `postgresql://user:pass@ep-xxxx.neon.tech/db?sslmode=require` |
| `GEMINI_API_KEY` | `AIzaSyD...` |
| `NODE_ENV` | `production` |
| `FRONTEND_URL` | (Leave for now, update later) |
| `PORT` | `3000` |

3. Click **Save**

### 2.5 Verify Deployment
- Wait 3-5 minutes for build to complete
- Check **Logs** tab for errors
- Visit `https://akashic-backend.render.com/health`
- Should see: `{"status":"ok","message":"Server is running"}`

---

## 📱 Step 3: Deploy Frontend (Expo)

### Option A: Expo EAS (Recommended for Mobile)

#### 3.1 Install EAS CLI
```bash
pnpm add -g eas-cli
```

#### 3.2 Login to EAS
```bash
eas login
```

#### 3.3 Create EAS Build
```bash
cd artifacts/akashic
eas build --platform ios  # or android
```

#### 3.4 Submit to App Store
```bash
eas submit --platform ios
```

### Option B: Manual Build
```bash
cd artifacts/akashic
pnpm run build

# For Android
eas build --platform android --local

# For iOS
eas build --platform ios --local
```

---

## 🔗 Step 4: Connect Frontend to Backend

### 4.1 Update API Base URL

Your backend URL: `https://akashic-backend.render.com`

Create or update your API client in your frontend:

```typescript
// artifacts/akashic/src/api/client.ts

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 
  'http://localhost:3000';

export const apiClient = {
  users: {
    getAll: () => fetch(`${API_BASE_URL}/api/users`),
    getById: (id: string) => fetch(`${API_BASE_URL}/api/users/${id}`),
    create: (data: any) => 
      fetch(`${API_BASE_URL}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
  },
  records: {
    getAll: () => fetch(`${API_BASE_URL}/api/records`),
    getById: (id: string) => fetch(`${API_BASE_URL}/api/records/${id}`),
    create: (data: any) => 
      fetch(`${API_BASE_URL}/api/records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
  },
  gemini: {
    chat: (message: string) =>
      fetch(`${API_BASE_URL}/api/gemini/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      }),
  },
};
```

### 4.2 Add Environment Variable
Create `.env.local` in `artifacts/akashic/`:
```
EXPO_PUBLIC_API_URL=https://akashic-backend.render.com
```

---

## 📊 Step 5: Database Management

### View Database in Drizzle Studio
```bash
cd artifacts/server
pnpm run db:studio
```

### Create New Migration
1. Modify `artifacts/server/src/db/schema.ts`
2. Run: `pnpm run db:migrate`

### Backup Database
```bash
pg_dump "your_neon_connection_string" > backup.sql
```

---

## 🔌 Available API Endpoints

### Users
```
GET    /api/users              - Get all users
GET    /api/users/:id          - Get user by ID
POST   /api/users              - Create user
PUT    /api/users/:id          - Update user
DELETE /api/users/:id          - Delete user
```

### Records
```
GET    /api/records            - Get all records
GET    /api/records/:id        - Get record by ID
POST   /api/records            - Create record
PUT    /api/records/:id        - Update record
DELETE /api/records/:id        - Delete record
```

### Health Check
```
GET    /health                 - Server status
```

---

## ⚠️ Common Issues & Fixes

### Issue: Build fails with "pnpm not found"
**Solution**: Ensure `pnpm-lock.yaml` is committed
```bash
git add pnpm-lock.yaml
git commit -m "Add pnpm lock file"
git push
```

### Issue: Database connection timeout
**Solution**: Verify DATABASE_URL in Render environment variables
- Check Neon connection string format
- Ensure `?sslmode=require` is included
- Test locally first

### Issue: CORS errors in frontend
**Solution**: Update `FRONTEND_URL` in Render environment variables
```
FRONTEND_URL=https://your-frontend-domain.com
```

### Issue: TypeScript errors during build
**Solution**: Build command now only builds backend, not frontend
- Build command: `cd artifacts/server && pnpm install && pnpm run build`
- This skips frontend typecheck

### Issue: Cold start takes too long
**Solution**: 
- Upgrade from free tier to paid plan
- Or keep it on free tier (cold starts are normal)

---

## 📊 Monitoring

### View Backend Logs
1. Go to Render dashboard
2. Click your service: `akashic-backend`
3. Click **Logs** tab
4. Check for errors or connection issues

### Monitor Database
1. Visit Neon dashboard
2. Check query performance
3. Monitor active connections

---

## 🔐 Security Checklist

- [ ] DATABASE_URL is in environment variables (not in code)
- [ ] GEMINI_API_KEY is in environment variables (not in code)
- [ ] CORS is configured correctly
- [ ] API endpoints have validation
- [ ] No sensitive data in logs
- [ ] HTTPS is enabled (automatic on Render)
- [ ] Environment variables are set for production
- [ ] `.env` file is in `.gitignore`

---

## 📱 Environment Variables Summary

### Render Backend
```
DATABASE_URL = postgresql://user:pass@ep-xxxx.neon.tech/db?sslmode=require
GEMINI_API_KEY = AIzaSyD...
NODE_ENV = production
FRONTEND_URL = (Optional, for CORS)
PORT = 3000
```

### Frontend (Expo)
```
EXPO_PUBLIC_API_URL = https://akashic-backend.render.com
```

---

## 📚 Documentation

- **Render Docs**: https://render.com/docs
- **Neon Docs**: https://neon.tech/docs
- **Drizzle Docs**: https://orm.drizzle.team
- **Expo Docs**: https://docs.expo.dev
- **Express Docs**: https://expressjs.com

---

## ✅ Deployment Checklist

- [ ] Neon database created
- [ ] Database migrations run
- [ ] Backend deployed to Render
- [ ] Environment variables set in Render
- [ ] Backend health check passes
- [ ] Frontend API client updated
- [ ] Frontend deployed (Expo EAS or App Store)
- [ ] Frontend connects to backend
- [ ] Test API endpoints
- [ ] Monitor logs for errors
- [ ] Security checklist passed

---

## 🎉 Next Steps

1. Create a Pull Request to merge `add-backend-deployment` → `main`
2. Deploy to Render from `main` branch
3. Monitor logs for issues
4. Deploy frontend
5. Test end-to-end

**Congratulations! Your app is now live!** 🚀

---

## 💬 Need Help?

If you encounter issues:
1. Check **Logs** in Render dashboard
2. Verify all environment variables are set
3. Check Neon connection string
4. Test API endpoints with curl or Postman
5. Review error messages carefully

Good luck! 🍀
