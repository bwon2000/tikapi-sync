# TikAPI Sync

A full-stack application for syncing TikTok influencer data using TikAPI and Supabase. Features an Express backend for data processing and a React dashboard for campaign management and influencer analytics.

> ### 🔐 Source‑of‑Truth Contract (Cursor must follow)
> This README is the product contract. Cursor must:
> 1) Treat “Planned Changes” as the only allowed scope.  
> 2) Ask before expanding scope or creating new files not listed there.  
> 3) Generate code in thin, testable slices that map to an item in “Planned Changes”.  
> 4) Keep docs and code in sync—if they drift, update README first, then code.  
> 5) Include tests, minimal rollout/rollback notes, and update checklists in this doc.
>
> **Protected invariants (do not silently change):**
> - Supabase tables: `influencer_data`, `tiktok_video_data`, `campaigns`, `campaigns_influencers`
> - Storage bucket: `profile-images` (public read; service‑role insert/update)
> - Ports: backend 3001, frontend 3000
> - Tech stack as listed in **Tech Stack**


## Quick Start

### Prerequisites
- Node.js 18+
- Supabase account and project
- TikAPI subscription key

### Installation
```bash
# Install backend dependencies
npm install

# Install frontend dependencies  
cd client && npm install
```

### Environment Setup
```bash
# Safe environment setup (with backup protection)
npm run env:setup

# Edit .env with your credentials
# See .env.example for required variables
```

### Development
```bash
# Start backend server (port 3001)
node index.mjs

# Start React frontend (port 3000) - in new terminal
cd client && npm start
```

### Build & Test
```bash
# Lint code
npm run lint

# Format code
npm run prettier

# Build React app
cd client && npm run build

# Run React tests
cd client && npm test
```

## Scripts Reference

| Script | Description |
|--------|-------------|
| `npm run lint` | ESLint check for code quality |
| `npm run lint:fix` | Auto-fix ESLint issues |
| `npm run prettier` | Format code with Prettier |
| `npm run prettier:check` | Check code formatting |
| `npm test` | Run tests (currently placeholder) |
| `npm run docs:drift` | Check documentation alignment with code |
| `npm run docs:check` | Alias for docs:drift |
| `npm run env:setup` | Safely create .env file with backup protection |
| `npm run db:inspect` | View database contents and stats (protected by guardian) |
| `npm run db:query` | Execute custom SQL queries (protected by guardian) |
| `npm run db:validate` | Validate database safety integrity |
| `npm run db:safe` | Execute commands through safe wrapper |
| `cd client && npm start` | Start React dev server |
| `cd client && npm run build` | Build React for production |
| `cd client && npm test` | Run React test suite |

## Tech Stack

- **Backend**: [Express.js](https://expressjs.com) + [Node.js](https://nodejs.org)
- **Frontend**: [React](https://reactjs.org) + [Tailwind CSS](https://tailwindcss.com)
- **Database**: [Supabase](https://supabase.com) (PostgreSQL)
- **External API**: [TikAPI](https://tikapi.io)
- **Scheduling**: [node-cron](https://www.npmjs.com/package/node-cron)
- **HTTP Client**: [Axios](https://axios-http.com)

## 🎨 UI/UX Development Guidelines

**⚠️ CRITICAL**: Before making ANY styling or UI changes, always reference `UI_STYLING_GUIDE.md`.

### Required Process for UI Changes:
1. **Read `UI_STYLING_GUIDE.md`** - Contains comprehensive checklist and best practices
2. **Run Pre-Change Checklist** - Verify text display, layout, responsive behavior
3. **Test Content Variations** - Short/long usernames, names, extreme content
4. **Verify Responsive Design** - Mobile (320px), tablet (768px), desktop (1024px+)
5. **Document Changes** - Use provided template in styling guide

### Key Files:
- `UI_STYLING_GUIDE.md` - Complete styling reference and troubleshooting
- `test-layout.html` - Visual testing for layout changes
- `.cursorrules` - Contains MANDATORY Review Checklist for UI changes
- `ARCHITECTURE.md` - Documents UI components and data flow

**Why This Matters**: UI changes often have unintended side effects. The styling guide prevents regressions and ensures consistent user experience across all components and screen sizes.

**Integration**: All UI changes must reference "Planned Changes" items, pass drift checks (`npm run docs:drift`), and follow commit message format in `.cursorrules`.

## Folder Structure

```
tikapi-sync-main/
├── api/                    # Supabase & TikAPI integration
│   ├── fetchFromSupabase.js
│   ├── resolveUsernameToSecUid.js
│   ├── upsertInfluencer.js
│   └── triggerReload.js
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/          # Route pages
│   │   └── supabaseClient.js
│   └── public/
├── internal/               # Background jobs & scripts
│   ├── resolveAndSyncInfluencer.js
│   ├── fillProfilePictures.js
│   ├── scheduler.js
│   └── syncFromUsername.js
├── utils/                  # Shared utilities
│   ├── fetchFromTikApi.js
│   ├── formatTikApiResponse.js
│   └── extractEmailFromText.js
├── index.mjs              # Express server entry point
└── package.json           # Backend dependencies
```

## 🧭 Cursor Session Playbook

> Pin these blocks in every new Cursor session so it aligns with the contract.

### A) Kickoff (first message in a fresh session)
You are my code pair for this repo. Read README and .cursorrules end‑to‑end.

Output only:

Scope Summary (8–12 bullets)

Gaps & Decisions (mismatches README ↔ code, by file/path)

2‑Week Ticket Plan (5–8 small tickets): goal, files to touch, acceptance criteria, risks, tests

Risk Radar (top 5)

Rules:

Do NOT change scope. If a change is implied, ASK first with options.

Every ticket must map to README → Planned Changes.

shell
Copy
Edit

### B) Implement a single ticket (repeatable)
Ticket: <paste one item from “Planned Changes/Active Development”>

Deliver in one PR:

Plan: steps + files/dirs to touch.

Code: minimal vertical slice (API ↔ DB ↔ UI).

Tests: unit for logic; integration if touching API/DB (mock Supabase ok).

DB: migrations or SQL (idempotent) + rollback notes.

Acceptance Checklist: map each criterion to a concrete verification step.

Risks & mitigations.

PR description (summary + how to test).

Respect Scope‑of‑Truth Contract. If ambiguity → ask before coding.

shell
Copy
Edit

### C) Pre‑merge contract check (gate)
Run a contract check against README/.cursorrules:

Deviation list (exact lines/files).

Missing tests? generate them now.

Lint/format/typecheck must pass.

“Done = Deployed” check: env vars referenced, scripts, feature flags, migrations run.

Output: Merge Gate Checklist with boxes. Do not change scope.

## Development Workflow (Docs-as-Spec)

## ⚙️ Cursor‑Driven Development Workflow (Docs → Code → Tests)

**Ground rules**
- ✅ Any multi‑file edit must start by moving an item into **Active Development**.
- ✅ Every commit message references the corresponding Planned Changes item.
- ✅ If code and docs disagree, update README first, then code, then run drift checks.
- ❌ No new folders/files outside **Folder Structure** unless added to Planned Changes and approved in the PR description.

### Step 1: Plan in Documentation (required)
# (unchanged commands — keep your existing block)

#### **Active Development**
- [ ] None currently planned

#### **Backlog**
- [ ] Implement bulk influencer sync API endpoint
- [ ] Add Redis caching layer for TikAPI responses
- [ ] Implement webhook endpoints for Supabase real-time updates
- [ ] Add TypeScript migration plan
- [ ] Implement rate limiting middleware
- [ ] Add comprehensive error boundaries in React components

---

**Note**: The sections below contain merge requirements and rules, not planned changes.

#### **Completed**
- [x] Basic Express API with influencer sync endpoint
- [x] React dashboard with campaign management
- [x] Supabase integration with upsert logic
- [x] TikAPI integration with retry logic
- [x] Background job scripts for batch processing
- [x] Fix hardcoded localhost URLs for production compatibility
- [x] Add health check endpoint (`GET /api/health`)
- [x] Fix Supabase connection errors (missing proper environment variables)
- [x] Fix TikAPI key configuration for proper API calls
- [x] Fix React useEffect dependency warnings
- [x] Add startup validation for required environment variables
- [x] Fix frontend to use environment variables instead of hardcoded Supabase credentials

### **🔄 Enforcement Rules**

1. **Before Multi-File Edits**: Update README "Planned Changes" section first
2. **Every Code Change**: Must reference a checklist item from "Planned Changes"
3. **Documentation Drift**: When code diverges from docs, update README first, then generate drift report
4. **Migration Plans**: Required for breaking changes or major architectural shifts

### **📊 Drift Detection**
Run these commands to detect when code diverges from documentation:

```bash
# Check if API routes match ARCHITECTURE.md
grep -r "app\." index.mjs | grep -E "(get|post|put|delete)" > current_routes.txt
grep -r "API.*route" ARCHITECTURE.md > documented_routes.txt
diff current_routes.txt documented_routes.txt

# Verify environment variables match .env.example
grep -r "process\.env\." . --include="*.js" --include="*.mjs" | \
  grep -o "process\.env\.[A-Z_]*" | sort -u > used_env_vars.txt
grep "^[A-Z_]*=" .env.example | cut -d'=' -f1 > documented_env_vars.txt
diff used_env_vars.txt documented_env_vars.txt

# Check if scripts match package.json
jq -r '.scripts | keys[]' package.json > current_scripts.txt
grep -A 20 "Scripts Reference" README.md | grep "|" | \
  grep -v "Script\|---" | cut -d'|' -f2 | tr -d ' `' > documented_scripts.txt
diff current_scripts.txt documented_scripts.txt
```

## Common Tasks

### Making Code Changes (Docs-First Workflow)

#### **Step 1: Plan in Documentation**
```bash
# 1. Update README "Planned Changes" - move item to "Active Development"
# 2. Update ARCHITECTURE.md if adding new modules/routes
# 3. Update DEPLOY.md if changing deployment requirements
# 4. Commit documentation changes first
git add README.md ARCHITECTURE.md DEPLOY.md
git commit -m "docs: plan implementation of [feature name]

Refs: README.md#planned-changes item [X]"
```

#### **Step 2: Implement Changes**
```bash
# Reference the checklist item in all commits
git commit -m "feat(api): add health check endpoint

Implements: README.md#planned-changes - Add health check endpoint
- GET /api/health returns server status
- Includes database connectivity check
- Updates ARCHITECTURE.md data flow section"
```

#### **Step 3: Update Documentation** 
```bash
# Mark item complete in README
# Update any changed implementation details
# Run drift detection to verify alignment
npm run docs:drift
```

#### **Step 4: GitHub PR Protection**
The repository includes automated drift detection:
- **On PR**: GitHub Action runs `npm run docs:drift`
- **If drift detected**: PR is blocked with detailed comment
- **Auto-comments**: Provide specific fix instructions
- **Status check**: Required to pass before merge

## 📚 Complementary Documentation Files

This README is the **Source-of-Truth**, but these files provide specialized guidance:

| File | Purpose | When to Use |
|------|---------|-------------|
| `.cursorrules` | Coding standards, workflow rules, merge gate checklist | Every development session |
| `DEPLOY.md` | Vercel deployment configuration and environment variables | Deployment and production setup |
| `ARCHITECTURE.md` | System design, API routes, data flow, component structure | Understanding system design |
| `UI_STYLING_GUIDE.md` | UI/UX best practices, responsive design, troubleshooting | Before any styling changes |
| `.cursorrules-protection.md` | Database safety mechanisms and security architecture | Database operations |
| `SUPABASE_STORAGE_SETUP.md` | Storage bucket configuration and RLS policies | Storage setup |

**Integration Rules:**
- All files must align with this README's Source-of-Truth Contract
- Changes affecting multiple files require updating README first
- Run `npm run docs:drift` to detect cross-file inconsistencies

## ✅ Definition of Done (Merge Gate)
**Note**: These are merge requirements, not planned changes.

- [ ] PR references one item in **Active Development**
- [ ] README updated (if behavior, routes, env, or structure changed)
- [ ] Drift checks pass: routes/env/scripts (see **📊 Drift Detection**)
- [ ] Tests added/updated and passing (unit + any needed integration)
- [ ] Migrations shipped with rollback notes (if DB touched)
- [ ] RLS/storage policies unchanged or explicitly diffed in PR description
- [ ] Observability: basic logs or metrics for new code paths
- [ ] Security: input validation on new endpoints; rate limit if public

## 🛡️ RLS & Storage Guardrails (do not relax without approval)
- `influencer_data`, `tiktok_video_data`, `campaigns*`: RLS enabled; backend uses SERVICE_ROLE for server operations.
- Storage bucket `profile-images`:
  - Insert/Update: service_role only
  - Select: public
- Any changes to RLS or storage require:
  1) SQL diff in PR
  2) Test queries that demonstrate allow/deny
  3) Update to this section

### Adding Environment Variables
1. **Update README**: Add to "Planned Changes" with checklist item
2. Add to `.env.example` with description  
3. Reference in code via `process.env.VAR_NAME`
4. Update DEPLOY.md with Vercel configuration
5. **Mark Complete**: Check off item in "Planned Changes"
6. Restart local server

### Syncing New Influencer
```bash
# Via API endpoint
curl -X POST http://localhost:3001/sync-influencer \
  -H "Content-Type: application/json" \
  -d '{"username": "tiktoker123"}'

# Via internal script
node internal/syncFromUsername.js tiktoker123
```

### Database Operations
```bash
# Inspect database safely (read-only)
npm run db:inspect

# Run custom SQL queries (read-only recommended)
npm run db:query "SELECT COUNT(*) FROM influencer_data"

# Check missing SecUIDs
node internal/getMissingSecUids.mjs

# Fill missing profile pictures
node internal/fillProfilePictures.js

# Sync influencers with missing data
node internal/syncInfluencersWithMissingData.mjs
```

### Database Safety Guidelines
⚠️ **CRITICAL**: Follow these rules to prevent data loss:

1. **Read-Only First**: Always test with `SELECT` queries before any modifications
2. **Backup Production**: Document backup strategy before any production changes
3. **Use SERVICE_ROLE_KEY Carefully**: Only for legitimate data operations
4. **Validate User Queries**: Check all user-provided SQL before execution
5. **Test on Development**: Never run untested queries on production data

**Multi-Layer Protection**: See `.cursorrules-protection.md` for complete security architecture including guardian validation, safe wrappers, and bypass prevention.

**Recommended Query Pattern**:
```bash
# ✅ Safe: Inspect data first
npm run db:query "SELECT * FROM influencer_data WHERE tt_username = 'test' LIMIT 1"

# ✅ Safe: Count operations
npm run db:query "SELECT COUNT(*) FROM tiktok_video_data WHERE created_at > '2024-01-01'"

# ❌ Dangerous: Never run destructive queries without explicit confirmation
# DELETE, DROP, TRUNCATE, UPDATE without WHERE clause
```

### Clearing Cache
- Failed usernames: `rm failed-usernames.txt`
- React build: `rm -rf client/build`
- Node modules: `rm -rf node_modules client/node_modules && npm install && cd client && npm install`

## Troubleshooting

### 1. "SUPABASE_URL is undefined" / Environment Variable Issues
**Symptoms**: Backend crashes on startup, "Cannot read properties of undefined"
**Root Cause**: Missing or incorrect environment variables
```bash
# Check if .env file exists
ls -la .env

# Copy and configure environment template
cp .env.example .env
# Edit .env with your actual credentials:
# - SUPABASE_URL from Supabase project settings
# - SUPABASE_SERVICE_ROLE_KEY from Supabase API settings  
# - TIKAPI_KEY from TikAPI dashboard

# Restart server after env changes
node index.mjs
```

### 2. TikAPI Rate Limiting / API Errors
**Symptoms**: "❌ TikAPI error", "rate limit exceeded", "ECONNRESET"
**Root Cause**: TikAPI subscription limits or network issues
```bash
# Check failed operations log
cat failed-usernames.txt

# Clear failed usernames to retry
rm failed-usernames.txt

# Check your TikAPI subscription status at tikapi.io
# Upgrade plan if hitting rate limits

# For ECONNRESET errors, the code auto-retries
# Wait 1-2 minutes between batch operations
```

### 3. Supabase Database Errors
**Symptoms**: "❌ Error fetching existing influencer", "PGRST116", "Failed to upsert"
**Root Cause**: Database permissions, RLS policies, or missing tables
```bash
# Verify Supabase connection
node -e "
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const { data, error } = await supabase.from('influencer_data').select('count');
console.log('Test result:', data, error);
"

# Check Supabase dashboard:
# 1. Tables exist: influencer_data, tiktok_video_data, campaigns
# 2. RLS policies allow service role access
# 3. API keys are correct (service role, not anon key for backend)
```

### 4. React Frontend Connection Issues  
**Symptoms**: "CORS policy: No 'Access-Control-Allow-Origin'", "Network Error"
**Root Cause**: Backend not running, wrong ports, or hardcoded URLs
```bash
# Ensure backend is running on port 3001
lsof -i :3001
# If nothing running:
node index.mjs

# Check for hardcoded localhost URLs in production
grep -r "localhost:3001" client/src/
# Replace with environment-based URLs:
# const API_URL = process.env.NODE_ENV === 'production' 
#   ? 'https://your-app.vercel.app' 
#   : 'http://localhost:3001'

# Start React dev server on port 3000
cd client && npm start
```

### 5. React Build Failures
**Symptoms**: "npm run build" fails with memory errors, dependency issues
**Root Cause**: Node.js memory limits, missing dependencies, TypeScript errors
```bash
# Memory errors - increase Node.js memory
cd client
NODE_OPTIONS="--max-old-space-size=4096" npm run build

# Dependency errors - clean install
rm -rf node_modules package-lock.json
npm install

# Check for unused imports (common cause)
npm run build 2>&1 | grep "not defined\|unused"

# Build without source maps if memory issues persist
cd client
GENERATE_SOURCEMAP=false npm run build
```

### 6. Module Resolution Errors
**Symptoms**: "Cannot resolve module '@supabase/supabase-js'", "Module not found"
**Root Cause**: Dependencies not installed in correct directory
```bash
# Install all dependencies
npm install && cd client && npm install

# Clear node_modules if corrupted
rm -rf node_modules client/node_modules
npm install && cd client && npm install

# Check Node.js version (requires 18+)
node --version

# Verify package.json exists in both root and client/
ls package.json client/package.json
```

### 7. TikAPI secUid Resolution Failures
**Symptoms**: "❌ Could not resolve secUid", "No secUid in userInfo", usernames in failed-usernames.txt
**Root Cause**: Invalid TikTok usernames, private accounts, or API changes
```bash
# Check failed usernames log for patterns
cat failed-usernames.txt | sort | uniq -c

# Manually test TikAPI with a known good username
node -e "
import TikAPI from 'tikapi';
import dotenv from 'dotenv';
dotenv.config();
const api = TikAPI(process.env.TIKAPI_KEY);
const result = await api.public.check({ username: 'charlidamelio' });
console.log('secUid:', result?.json?.userInfo?.user?.secUid);
"

# Clean up failed usernames for known private/deleted accounts
# Edit failed-usernames.txt to remove invalid entries
```

### 8. Database Upsert Conflicts
**Symptoms**: "❌ Failed to upsert influencer", unique constraint violations
**Root Cause**: Database schema conflicts or concurrent operations
```bash
# Check database constraints in Supabase dashboard
# Verify tt_username is unique constraint field

# Check for duplicate usernames with different cases
node -e "
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const { data } = await supabase.from('influencer_data').select('tt_username');
const usernames = data?.map(r => r.tt_username.toLowerCase()) || [];
const duplicates = usernames.filter((item, index) => usernames.indexOf(item) !== index);
console.log('Duplicate usernames:', [...new Set(duplicates)]);
"
```

### 9. Background Job / Scheduler Issues
**Symptoms**: Scheduled tasks not running, "❌ Error in getMissingSecUids"
**Root Cause**: Process not running, unhandled errors in background jobs
```bash
# Check if background processes are running
ps aux | grep node

# Test individual background jobs manually
node internal/getMissingSecUids.mjs
node internal/fillProfilePictures.js
node internal/syncInfluencersWithMissingData.mjs

# Check system resources (jobs are memory/CPU intensive)
top -p $(pgrep node)

# Run jobs with timeout to prevent hanging
timeout 300 node internal/fillProfilePictures.js
```

### 10. Vercel Deployment Issues
**Symptoms**: 500 errors in production, functions timing out, environment variables not working
**Root Cause**: Vercel configuration, cold starts, missing environment variables
```bash
# Check Vercel deployment logs
vercel logs --follow

# Verify environment variables are set
vercel env ls

# Test function locally with production env
vercel dev

# Check vercel.json configuration exists and is valid
cat vercel.json

# Increase function timeout if needed (in vercel.json):
# "functions": { "index.mjs": { "maxDuration": 30 } }
```
