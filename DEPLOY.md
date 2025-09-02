# Deployment Guide - Vercel

## Target Platform: Vercel

This application is optimized for Vercel deployment with separate frontend and backend configurations.

> **⚠️ IMPORTANT**: This deployment guide must align with README.md's Source-of-Truth Contract. Any changes to environment variables, ports, or deployment workflow must be updated in README.md first, then reflected here.

## Build & Output Settings

### Frontend (React App)
- **Framework**: Create React App (auto-detected)
- **Build Command**: `cd client && npm run build`
- **Output Directory**: `client/build`
- **Install Command**: `cd client && npm install`
- **Node Version**: 18.x (recommended)

### Backend (Express API)
- **Runtime**: Node.js (not Edge Runtime)
- **Entry Point**: `index.mjs`
- **Build Command**: `npm install`
- **Function Region**: Auto (or specify based on user location)

## Required Environment Variables

> **📋 Source-of-Truth**: These variables must match `.env.example` and README.md. Any additions require updating both files in the same commit.

### Database Configuration (Backend)
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### External API Keys (Backend)
```bash
TIKAPI_KEY=your_tikapi_subscription_key
```

### Server Configuration (Backend)
```bash
PORT=3001
```

### Frontend Configuration (React)
```bash
REACT_APP_API_URL=https://your-app.vercel.app
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_anon_key_here
```

### Usage Locations
- **SUPABASE_URL**: Used in all `/api` and `/internal` modules for database connections
- **SUPABASE_SERVICE_ROLE_KEY**: Backend operations requiring elevated permissions
- **TIKAPI_KEY**: TikAPI integration in `/api/resolveUsernameToSecUid.js` and `/internal` scripts
- **PORT**: Backend server port (auto-set by Vercel, fallback to 3001)
- **REACT_APP_API_URL**: Frontend API endpoint for production builds
- **REACT_APP_SUPABASE_URL**: Frontend database connection (public URL)
- **REACT_APP_SUPABASE_ANON_KEY**: Frontend database access (public anon key)

## Vercel Project Setup

### 1. Create New Project
```bash
# Connect to GitHub repository
vercel --prod
# Or via Vercel Dashboard: Import Git Repository
```

### 2. Configure Build Settings
```json
{
  "buildCommand": "cd client && npm run build",
  "outputDirectory": "client/build",
  "installCommand": "npm install && cd client && npm install",
  "framework": "create-react-app"
}
```

### 3. Add Environment Variables
Navigate to: **Project Settings → Environment Variables**

Add all variables from `.env.example` with production values:
- Production: All environments
- Preview: Development/staging values  
- Development: Local development values

### 4. Configure API Routes
Create `vercel.json` in project root:
```json
{
  "version": 2,
  "functions": {
    "index.mjs": {
      "runtime": "nodejs18.x"
    }
  },
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/index.mjs"
    },
    {
      "src": "/(.*)",
      "dest": "/client/build/$1"
    }
  ]
}
```

## Preview → Production Workflow

> **📋 Docs-as-Spec**: All deployments must follow README.md's Source-of-Truth Contract. Changes must reference "Planned Changes" items.

### 1. Development Cycle (Docs-First)
```bash
# 1. Update README.md "Planned Changes" - move item to "Active Development"
# 2. Update DEPLOY.md if changing deployment requirements
# 3. Commit documentation changes first

# Create feature branch
git checkout -b feature/new-dashboard

# Make changes and test locally
npm run docs:drift  # MANDATORY: Check alignment first
npm run lint
cd client && npm test

# Commit with reference to README item
git commit -m "feat(deploy): add new dashboard deployment config

Implements: README.md#planned-changes - Add dashboard deployment"

# Push to trigger preview deployment
git push origin feature/new-dashboard
```

### 2. Preview Deployment
- **Automatic**: Triggered on PR creation/updates
- **URL**: `https://tikapi-sync-git-feature-username.vercel.app`
- **Environment**: Uses Preview environment variables
- **Testing**: Full functionality with staging data

### 3. Production Deployment
```bash
# Merge to main branch
git checkout main
git merge feature/new-dashboard
git push origin main
```
- **Automatic**: Triggered on main branch push
- **URL**: `https://tikapi-sync.vercel.app` (custom domain)
- **Environment**: Uses Production environment variables

## Rollbacks & Redeployment

### Quick Rollback
1. **Via Dashboard**: Deployments → Previous deployment → Promote to Production
2. **Via CLI**: 
```bash
vercel rollback https://tikapi-sync-abc123.vercel.app
```

### Redeploy Previous Build
```bash
# Get deployment URL from dashboard
vercel promote https://tikapi-sync-git-commit-hash.vercel.app
```

### Emergency Rollback
```bash
# Revert commit and push
git revert HEAD
git push origin main
# Vercel auto-deploys the revert
```

## Post-Deploy Checks

### 1. Health Endpoints
```bash
# Test health check endpoint (should return 200 with database status)
curl https://your-app.vercel.app/api/health

# Test main sync endpoint
curl -X POST https://your-app.vercel.app/sync-influencer \
  -H "Content-Type: application/json" \
  -d '{"username": "test"}'
```

**Expected Health Check Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "database": "connected", 
  "version": "1.0.0"
}
```

### 2. Frontend Validation
- [ ] Dashboard loads without errors
- [ ] Supabase connection works
- [ ] Form submissions succeed
- [ ] Navigation works correctly

### 3. Environment Variable Verification
```bash
# Check Vercel environment variables are loaded
vercel env ls
```

### 4. Log Monitoring
```bash
# Real-time function logs
vercel logs --follow

# Check for deployment errors
vercel logs --since=1h
```

### 5. Database Migration Status
- Verify Supabase tables exist and are accessible
- Check RLS policies are configured
- Test data queries return expected results

## Common Vercel Issues & Fixes

### 1. "Module not found" errors
**Cause**: Dependencies not installed correctly
**Fix**: 
```bash
# Clear node_modules and reinstall
rm -rf node_modules client/node_modules
npm install && cd client && npm install
vercel --prod
```

### 2. Environment variables not loaded
**Cause**: Variables not set in Vercel dashboard
**Fix**: 
- Check Vercel Dashboard → Environment Variables
- Ensure correct environment (Production/Preview/Development)
- Redeploy after adding variables

### 3. API routes return 404
**Cause**: Incorrect `vercel.json` configuration
**Fix**: Verify routing configuration matches file structure
```json
{
  "routes": [
    { "src": "/api/(.*)", "dest": "/index.mjs" },
    { "src": "/(.*)", "dest": "/client/build/$1" }
  ]
}
```

### 4. Build timeout errors
**Cause**: Large dependencies or slow build process
**Fix**:
```bash
# Optimize build process
cd client
npm run build -- --silent
# Or increase timeout in vercel.json
{
  "functions": {
    "index.mjs": {
      "maxDuration": 30
    }
  }
}
```

### 5. CORS errors in production
**Cause**: Hardcoded localhost URLs
**Fix**: Use environment variables for API URLs
```javascript
// ❌ Wrong
const API_URL = 'http://localhost:3001';

// ✅ Correct  
const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-app.vercel.app' 
  : 'http://localhost:3001';
```

## Performance Optimization

### 1. Function Cold Start Reduction
- Keep functions warm with periodic health checks
- Minimize dependencies in API routes
- Use Edge Runtime where possible (for simple operations)

### 2. Static Asset Optimization
- Enable Vercel's automatic image optimization
- Use CDN for large assets
- Implement proper caching headers

### 3. Database Connection Optimization
- Use connection pooling in Supabase
- Implement request caching for frequent queries
- Optimize database queries with indexes
