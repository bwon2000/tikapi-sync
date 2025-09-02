# Architecture Overview

## High-Level System Design

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Client  │    │  Express Server │    │    Supabase     │
│   (Port 3000)   │◄──►│   (Port 3001)   │◄──►│   PostgreSQL    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │     TikAPI      │
                        │  External API   │
                        └─────────────────┘
```

## Module Responsibilities

### `/api` - Data Integration Layer
- **fetchFromSupabase.js**: Query influencer data from database
- **upsertInfluencer.js**: Insert/update influencer profiles with conflict resolution
- **resolveUsernameToSecUid.js**: Convert TikTok usernames to secure UIDs via TikAPI
- **triggerReload.js**: Force refresh of influencer data from TikAPI
- **updateInfluencerData.js**: Wrapper for data update operations

### `/client` - React Frontend
- **components/**: Reusable UI components (cards, modals, forms)
- **pages/**: Route-based page components (Dashboard, Campaigns)
- **supabaseClient.js**: Frontend Supabase client configuration

#### UI/UX Development Rules
**⚠️ MANDATORY**: All UI changes must follow `UI_STYLING_GUIDE.md` process:

1. **Pre-Change Checklist** - Verify existing functionality before changes
2. **Content Testing** - Test with various username/name lengths  
3. **Responsive Verification** - Ensure mobile/tablet/desktop compatibility
4. **Component Regression Testing** - Check related components aren't affected
5. **Documentation** - Record changes using provided template

**Key Principle**: Never sacrifice existing functionality to fix isolated issues. Use targeted solutions (like absolute positioning) rather than restructuring entire layouts.

### `/internal` - Background Processing
- **resolveAndSyncInfluencer.js**: Core sync logic for individual influencers
- **syncFromUsername.js**: CLI script for manual influencer sync
- **fillProfilePictures.js**: Batch job to populate missing profile images
- **getMissingSecUids.mjs**: Identify and resolve missing secure UIDs
- **pullTikApiToSupabase.mjs**: Bulk video data synchronization
- **scheduler.js**: Cron job configuration for automated tasks
- **syncInfluencersWithMissingData.mjs**: Batch sync for incomplete profiles

### `/utils` - Shared Utilities
- **fetchFromTikApi.js**: TikAPI client wrapper functions
- **formatTikApiResponse.js**: Data transformation from TikAPI format
- **extractEmailFromText.js**: Email extraction from bio text
- **calcRollups.js**: Aggregate metrics calculation

### `/scripts` - Development Tools
- **db-inspect.js**: Database inspection tool for development (`npm run db:inspect`)
- **db-query.js**: Custom SQL query execution tool (`npm run db:query`)
- **check-docs-drift.sh**: Documentation alignment verification
- **safe-env-setup.sh**: Protected environment file creation

## Data Flow

### 1. Influencer Sync Request
```
Client Form → Express /sync-influencer → internal/syncFromUsername.js
                                       ↓
                            resolveAndSyncInfluencer.js
                                       ↓
                            TikAPI (username → secUid + metrics)
                                       ↓
                            Supabase upsert (influencer_data table)
```

### 2. Video Data Pull
```
Scheduler/Manual Trigger → pullTikApiToSupabase.mjs
                        ↓
            TikAPI public.posts(secUid, count: 30)
                        ↓
            Process video metadata & metrics
                        ↓
            Supabase insert (tiktok_video_data table)
```

### 3. Dashboard Data Display
```
React Component → supabaseClient.js → Supabase query
                                   ↓
                            Format & display in UI
```

## Error Handling & Logging

### Strategy
- **Console logging**: Structured with emoji prefixes (✅ ❌ ⚠️ 🔍)
- **Failed operations**: Logged to `failed-usernames.txt`
- **API errors**: Wrapped with try/catch, meaningful error messages
- **Retry logic**: Implemented for network errors (ECONNRESET)

### Common Error Patterns
```javascript
try {
  const result = await apiCall();
  console.log('✅ Success:', result);
} catch (err) {
  console.error('❌ Failed:', err?.message || err);
  logFailed(username, err?.message || 'Unknown error');
}
```

## Performance Considerations

### Rate Limiting
- **TikAPI**: Respects API rate limits with retry logic
- **Batch processing**: Processes in chunks to avoid overwhelming APIs
- **24-hour checks**: Prevents unnecessary API calls for recent data

### Caching Strategy
- **Supabase queries**: Checked before API calls to avoid duplicates
- **Upsert logic**: Only updates null/empty fields to preserve existing data
- **Failed usernames**: Logged to avoid repeated failed attempts

### Database Optimization
- **Indexed columns**: `tt_username`, `secuid` for fast lookups
- **Conflict resolution**: Uses `onConflict: 'tt_username'` for upserts
- **Selective updates**: Only updates missing/null fields

## Security Considerations

### Authentication & Authorization
- **Supabase RLS**: Row Level Security policies (assumed configured)
- **Service role**: Backend uses elevated permissions for data operations
- **Anon key**: Frontend uses limited permissions for read operations

### Secrets Management
- **Environment variables**: All sensitive data in `.env`
- **Frontend safety**: Only public Supabase URL/anon key exposed
- **TikAPI key**: Server-side only, never exposed to client

### Input Validation
- **Username sanitization**: Trimmed and lowercased
- **Request validation**: Express middleware validates request bodies
- **SQL injection**: Prevented by Supabase client parameterized queries

### CORS Configuration
```javascript
app.use(cors()); // Configured for development
// Production: Configure specific origins
```

## Extension Points

## Current API Routes

### GET /api/health
- **Purpose**: Health check endpoint for monitoring and deployment verification
- **Input**: None
- **Process**: Tests database connectivity and server status
- **Output**: `{ "status": "healthy", "timestamp": "ISO_DATE", "database": "connected" }`

### POST /sync-influencer
- **Purpose**: Trigger sync of TikTok influencer data
- **Input**: `{ "username": "tiktoker123" }`
- **Process**: Executes `internal/syncFromUsername.js` via child process

## Database Development Tools

### Database Inspector (`npm run db:inspect`)
- **Purpose**: Safe, read-only database exploration for development
- **Output**: Latest influencers, video counts, campaign data, quick stats
- **Safety**: Uses SELECT queries only, no data modification possible

### Custom Query Tool (`npm run db:query`)
- **Purpose**: Execute custom SQL queries for debugging and analysis
- **Usage**: `npm run db:query "SELECT COUNT(*) FROM influencer_data"`
- **Safety Features**:
  - Requires explicit SQL query as parameter
  - Shows helpful examples if no query provided
  - Fallback to direct table access for simple queries
  - Error handling with available table listing

### Multi-Layer Safety Architecture

#### Layer 1: Code-Level Protections
- **Destructive pattern detection**: Regex-based blocking of dangerous SQL
- **Force flag requirement**: Explicit confirmation needed for destructive operations
- **Input validation**: Query parameter sanitization and validation

#### Layer 2: Guardian Monitoring (`npm run db:validate`)
- **File integrity monitoring**: SHA256 checksums of safety-critical files
- **Pattern validation**: Ensures required safety patterns exist in code
- **Tamper detection**: Identifies suspicious modifications or bypass attempts
- **Evidence logging**: Creates timestamped audit trail in `.db-guardian-log.json`

#### Layer 3: Safe Command Wrapper (`npm run db:safe`)
- **Whitelist enforcement**: Only allows pre-approved database commands
- **Command pattern blocking**: Prevents dangerous Node.js eval/exec usage
- **Environment protection**: Blocks runtime environment variable manipulation

#### Layer 4: Automated Validation
- **Pre-execution checks**: Guardian validation runs before every database operation
- **Integration protection**: All database scripts require guardian approval
- **Bypass prevention**: Multiple detection methods for circumvention attempts

### Protection Against Bypass Attempts
- **Code modification detection**: Guardian validates safety script integrity
- **Direct Supabase bypass**: Monitors for unauthorized client usage patterns
- **Environment manipulation**: Blocks runtime credential modification
- **Process execution**: Prevents dangerous Node.js command injection
- **Output**: Success/error status with sync results

### Adding New API Routes
1. Create handler in `/api` directory
2. Add route in `index.mjs` 
3. Document route in this section
4. Update CORS if needed for new origins

### Adding New Pages
1. Create component in `client/src/pages/`
2. Add route in `client/src/App.jsx`
3. Update navigation in `Layout.jsx`

### Adding Background Jobs
1. Create script in `/internal` directory
2. Add to scheduler if recurring
3. Document in README common tasks section

### Adding External APIs
1. Create wrapper utility in `/utils`
2. Add environment variables for credentials
3. Update error handling patterns
4. Add to architecture documentation

### Database Schema Changes
1. Update Supabase schema via dashboard
2. Modify affected functions in `/api`
3. Update type definitions if using TypeScript
4. Test migration with existing data
