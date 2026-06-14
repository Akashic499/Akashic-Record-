# Akashic Record - Deployment Guide

## Overview
This guide walks you through deploying your Akashic Record app:
- **Backend**: Node.js Express server on Render
- **Database**: PostgreSQL on Neon
- **Frontend**: React Native Expo app (deployment varies)

---

## 📦 Step 1: Set Up Neon Database

### 1.1 Create Neon Account
1. Go to [neon.tech](https://neon.tech)
2. Sign up with GitHub or email
3. Create a new project
4. Choose region (recommended: US East)

### 1.2 Get Database URL
1. In Neon dashboard, go to your project
2. Click "Connection string" on the top right
3. Copy the PostgreSQL connection string
4. Format: `postgresql://user:password@ep-xxxx.neon.tech/dbname?sslmode=require`

### 1.3 Run Migrations
```bash
# Install dependencies (if not already done)
pnpm install

# Set DATABASE_URL temporarily (for local setup)
export DATABASE_URL="your_neon_connection_string"

# Run migrations
cd artifacts/server
pnpm run db:migrate

# Verify with Drizzle Studio
pnpm run db:studio
```

---

## 🚀 Step 2: Deploy Backend to Render

### 2.1 Prepare Repository
```bash
# Make sure everything is committed
git add .
git commit -m "Add backend and deployment configuration"
git push origin add-backend-deployment
```

### 2.2 Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Authorize GitHub access

### 2.3 Deploy Backend Service
1. Click **New +** → **Web Service**
2. Select your GitHub repository (`Akashic499/Akashic-Record-`)
3. Configure:
   - **Name**: `akashic-backend`
   - **Runtime**: `Node`
   - **Build Command**: `pnpm install && pnpm run build && cd artifacts/server && pnpm run build`
   - **Start Command**: `node artifacts/server/dist/index.js`
   - **Plan**: Free (or upgrade as needed)

### 2.4 Add Environment Variables
1. Go to **Environment** section
2. Add variables:
   - **DATABASE_URL**: Paste your Neon connection string
   - **NODE_ENV**: `production`
   - **FRONTEND_URL**: (leave for now, update later)

3. Click **Create Web Service**

### 2.5 Verify Deployment
- Wait 3-5 minutes for build to complete
- Check logs for errors
- Visit `https://akashic-backend.render.com/health` to verify
- Should return: `{"status":"ok","message":"Server is running"}`

---

## 📱 Step 3: Deploy Frontend (Expo)

### Option A: Expo EAS (Recommended)

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

1. Get your Render backend URL (e.g., `https://akashic-backend.render.com`)

2. Update your frontend client:
```typescript
// artifacts/akashic/src/api/client.ts (create if doesn't exist)

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
};
```

3. Add environment variable to `.env.local`:
```
EXPO_PUBLIC_API_URL=https://akashic-backend.render.com
```

---

## 🛠️ Step 5: Database Management

### View Database
```bash
cd artifacts/server
pnpm run db:studio
```

### Create New Migration
1. Modify `artifacts/server/src/db/schema.ts`
2. Run: `pnpm run db:migrate`

### Backup Database
```bash
# Using pg_dump
pg_dump "your_neon_connection_string" > backup.sql
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

### Issue: CORS errors
**Solution**: Update `FRONTEND_URL` in backend environment variables
```bash
# In Render dashboard:
FRONTEND_URL=https://your-frontend-domain.com
```

### Issue: Cold start takes too long
**Solution**: Consider upgrading from free tier to paid plan

---

## 📊 Monitoring

### View Logs
1. Go to Render dashboard
2. Click on your service
3. Click **Logs** tab

### Monitor Database
1. Visit Neon dashboard
2. Check query performance
3. Monitor connections

---

## 🔐 Security Checklist

- [ ] DATABASE_URL is in environment variables (not in code)
- [ ] CORS is configured correctly
- [ ] API endpoints have validation
- [ ] No sensitive data in logs
- [ ] HTTPS is enabled (automatic on Render)
- [ ] Environment variables are set for production

---

## 📞 Support

- **Render Docs**: https://render.com/docs
- **Neon Docs**: https://neon.tech/docs
- **Drizzle Docs**: https://orm.drizzle.team
- **Expo Docs**: https://docs.expo.dev

---

## Next Steps

1. ✅ Set up Neon database
2. ✅ Deploy backend to Render
3. ✅ Deploy frontend to Expo EAS or App Store
4. ✅ Connect frontend to backend
5. ✅ Test API endpoints
6. ✅ Monitor and maintain

Congratulations! Your app is now live! 🎉
