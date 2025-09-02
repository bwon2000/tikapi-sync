import express from 'express';
import cors from 'cors';
import { exec } from 'child_process';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { proxyProfileImage } from './api/proxyProfileImage.js';
import { downloadAndStoreInSupabase, initializeStorageBucket } from './api/supabaseImageStorage.js';

dotenv.config();

// Environment variable validation
const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'TIKAPI_KEY'];

function checkMissingEnvVars() {
  return requiredEnvVars.filter(envVar => !process.env[envVar] || process.env[envVar].includes('your_'));
}

const missingEnvVars = checkMissingEnvVars();

if (missingEnvVars.length > 0) {
  console.warn('⚠️ Running in development mode with placeholder environment variables:');
  missingEnvVars.forEach(envVar => {
    console.warn(`   - ${envVar}: ${process.env[envVar] || 'undefined'}`);
  });
  console.warn('\n📋 For full functionality:');
  console.warn('1. Copy .env.example to .env');
  console.warn('2. Replace placeholder values with real credentials');
  console.warn('3. Restart the server\n');
}

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Initialize Supabase client for health checks
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Check if we're in development mode with placeholder values
    const currentMissingVars = checkMissingEnvVars();
    const hasValidConfig = !currentMissingVars.length;
    
    if (!hasValidConfig) {
      return res.status(503).json({
        status: 'configuration-required',
        timestamp: new Date().toISOString(),
        database: 'not-configured',
        version: '1.0.0',
        error: 'Environment variables need to be configured',
        missingVars: currentMissingVars
      });
    }

    // Test database connectivity
    const { data, error } = await supabase
      .from('influencer_data')
      .select('count')
      .limit(1);

    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: error ? 'disconnected' : 'connected',
      version: '1.0.0'
    };

    if (error) {
      console.warn('⚠️ Health check database warning:', error.message);
      return res.status(503).json({
        ...healthStatus,
        status: 'degraded',
        error: error.message
      });
    }

    console.log('✅ Health check passed');
    res.status(200).json(healthStatus);
  } catch (err) {
    console.error('❌ Health check failed:', err.message);
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'error',
      error: err.message,
      version: '1.0.0'
    });
  }
});

app.post('/sync-influencer', (req, res) => {
  const { username } = req.body;

  if (!username) {
    console.error('❌ No username provided in request body');
    return res.status(400).json({ message: 'Username is required' });
  }

  console.log(`✅ Received sync request for username: ${username}`);

  const command = `node internal/syncFromUsername.js ${username}`;
  const child = exec(command);

  child.stdout.on('data', (data) => console.log(`[stdout]: ${data}`));
  child.stderr.on('data', (data) => console.error(`[stderr]: ${data}`));

  child.on('exit', (code) => {
    if (code === 0) {
      console.log('✅ Influencer sync completed successfully');
      res.json({ message: 'Influencer synced successfully!' });
    } else {
      console.error(`❌ Influencer sync failed with exit code ${code}`);
      res.status(500).json({ message: `Sync failed with exit code ${code}` });
    }
  });
});

// Profile image proxy endpoint
app.get('/api/proxy-image', proxyProfileImage);

// Upload profile image to Supabase Storage endpoint
app.post('/api/upload-profile-image', async (req, res) => {
  const { tikTokImageUrl, username } = req.body;

  if (!tikTokImageUrl || !username) {
    return res.status(400).json({ 
      success: false, 
      error: 'tikTokImageUrl and username are required' 
    });
  }

  try {
    console.log(`🖼️ Uploading profile image for ${username}...`);
    
    const supabaseUrl = await downloadAndStoreInSupabase(tikTokImageUrl, username);
    
    if (supabaseUrl) {
      console.log(`✅ Profile image uploaded successfully: ${supabaseUrl}`);
      res.json({ 
        success: true, 
        imageUrl: supabaseUrl,
        message: 'Profile image uploaded to Supabase Storage'
      });
    } else {
      console.error(`❌ Failed to upload profile image for ${username}`);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to upload image to Supabase Storage' 
      });
    }
  } catch (error) {
    console.error(`❌ Error uploading profile image:`, error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Initialize Supabase Storage on server startup
async function initializeServer() {
  console.log('🔧 Initializing Supabase Storage...');
  const storageInitialized = await initializeStorageBucket();
  
  if (storageInitialized) {
    console.log('✅ Supabase Storage initialized successfully');
  } else {
    console.warn('⚠️ Supabase Storage initialization failed - uploads may not work');
  }
}

app.listen(PORT, async () => {
  const serverUrl = process.env.NODE_ENV === 'production' 
    ? `Production server on port ${PORT}` 
    : `http://localhost:${PORT}`;
  console.log(`🚀 Backend running at ${serverUrl}`);
  
  // Initialize Supabase Storage
  await initializeServer();
});