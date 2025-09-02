// scripts/test-supabase-storage.js

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Test Supabase Storage setup and permissions
 */
async function testSupabaseStorage() {
  console.log('🧪 Testing Supabase Storage setup...\n');

  try {
    // Test 1: List buckets
    console.log('1️⃣ Testing bucket access...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Cannot list buckets:', bucketsError.message);
      return;
    }

    const profileBucket = buckets.find(b => b.name === 'profile-images');
    if (profileBucket) {
      console.log('✅ profile-images bucket found');
      console.log(`   Public: ${profileBucket.public}`);
      console.log(`   Created: ${profileBucket.created_at}`);
    } else {
      console.error('❌ profile-images bucket not found');
      return;
    }

    // Test 2: Try to upload a test file
    console.log('\n2️⃣ Testing file upload...');
    const testContent = Buffer.from('test image content');
    const testPath = 'avatars/test-upload.txt';

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('profile-images')
      .upload(testPath, testContent, {
        contentType: 'text/plain',
        upsert: true
      });

    if (uploadError) {
      console.error('❌ Upload failed:', uploadError.message);
      console.log('\n🔧 To fix this:');
      console.log('1. Go to Supabase Dashboard → Storage → Policies');
      console.log('2. Disable RLS for profile-images bucket');
      console.log('3. Or add policies for service_role access');
      return;
    } else {
      console.log('✅ Upload successful:', uploadData.path);
    }

    // Test 3: Get public URL
    console.log('\n3️⃣ Testing public URL access...');
    const { data: urlData } = supabase.storage
      .from('profile-images')
      .getPublicUrl(testPath);

    console.log('✅ Public URL generated:', urlData.publicUrl);

    // Test 4: Clean up test file
    console.log('\n4️⃣ Cleaning up test file...');
    const { error: deleteError } = await supabase.storage
      .from('profile-images')
      .remove([testPath]);

    if (deleteError) {
      console.warn('⚠️ Could not delete test file:', deleteError.message);
    } else {
      console.log('✅ Test file cleaned up');
    }

    console.log('\n🎉 Supabase Storage is ready!');
    console.log('\n📋 Next steps:');
    console.log('1. Test with: node internal/syncFromUsername.js username');
    console.log('2. Migrate existing: node internal/migrateToSupabaseStorage.js');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testSupabaseStorage();
}

export { testSupabaseStorage };
