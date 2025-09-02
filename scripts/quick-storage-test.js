// scripts/quick-storage-test.js

import { downloadAndStoreInSupabase } from '../api/supabaseImageStorage.js';

/**
 * Quick test of Supabase Storage with a real TikTok image
 */
async function quickStorageTest() {
  console.log('🧪 Quick Supabase Storage test...\n');

  // Use a working TikTok image URL (from our earlier successful download)
  const testImageUrl = 'https://p16-pu-sign-useast8.tiktokcdn-us.com/tos-useast5-avt-0068-tx/7310052907548688430~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=9640&refresh_token=bb698766&x-expires=1756274400&x-signature=GKu9%2BbqbGkBuKzQ0Xn%2BwV5yl%2BVo%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=useast5';
  
  const testUsername = 'test-storage-user';

  try {
    console.log('📥 Testing image download and upload to Supabase...');
    const supabaseUrl = await downloadAndStoreInSupabase(testImageUrl, testUsername);

    if (supabaseUrl) {
      console.log('✅ SUCCESS! Image uploaded to Supabase Storage');
      console.log('🔗 Public URL:', supabaseUrl);
      console.log('\n🎉 Supabase Storage is working correctly!');
      console.log('\n📋 Next steps:');
      console.log('1. Test with real user: node internal/syncFromUsername.js username');
      console.log('2. Migrate existing images: node internal/migrateToSupabaseStorage.js');
    } else {
      console.log('❌ FAILED: Could not upload to Supabase Storage');
      console.log('\n🔧 Troubleshooting:');
      console.log('1. Check that profile-images bucket exists');
      console.log('2. Disable RLS or add proper policies');
      console.log('3. Verify service role key has storage permissions');
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  quickStorageTest();
}

export { quickStorageTest };

