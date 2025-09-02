// scripts/setup-supabase-storage.js

import { initializeStorageBucket } from '../api/supabaseImageStorage.js';

/**
 * One-time setup script to initialize Supabase Storage for profile images
 */
async function setupSupabaseStorage() {
  console.log('🚀 Setting up Supabase Storage for profile images...');
  
  const success = await initializeStorageBucket();
  
  if (success) {
    console.log('✅ Supabase Storage setup completed successfully!');
    console.log('');
    console.log('📋 Next steps:');
    console.log('1. Test with: node internal/syncFromUsername.js username');
    console.log('2. Migrate existing images: node internal/migrateToSupabaseStorage.js');
    console.log('3. Images will be stored at: https://your-project.supabase.co/storage/v1/object/public/profile-images/avatars/');
  } else {
    console.log('❌ Failed to setup Supabase Storage');
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('1. Check your SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env');
    console.log('2. Ensure your Supabase project has Storage enabled');
    console.log('3. Verify your service role key has storage permissions');
  }
}

// Run setup if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupSupabaseStorage();
}

export { setupSupabaseStorage };
