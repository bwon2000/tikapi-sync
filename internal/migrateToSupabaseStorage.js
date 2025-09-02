// internal/migrateToSupabaseStorage.js

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { downloadAndStoreInSupabase } from '../api/supabaseImageStorage.js';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Migrate existing TikTok CDN URLs to Supabase Storage
 * This replaces the local storage migration
 */
async function migrateToSupabaseStorage() {
  console.log('🚀 Starting migration of TikTok URLs to Supabase Storage...');

  try {
    // Get all influencers with TikTok CDN URLs (not already migrated)
    const { data: influencers, error } = await supabase
      .from('influencer_data')
      .select('influencer_uuid, tt_username, profilepicture')
      .not('profilepicture', 'is', null)
      .like('profilepicture', '%tiktokcdn%')
      .order('tt_username', { ascending: true });

    if (error) {
      console.error('❌ Failed to fetch influencers:', error);
      return;
    }

    console.log(`📊 Found ${influencers.length} influencers with TikTok CDN URLs`);

    let successCount = 0;
    let failCount = 0;
    let skippedCount = 0;

    for (const [index, influencer] of influencers.entries()) {
      const progress = `[${index + 1}/${influencers.length}]`;
      
      if (!influencer.tt_username) {
        console.warn(`${progress} ⚠️ Missing username for UUID ${influencer.influencer_uuid}, skipping.`);
        skippedCount++;
        continue;
      }

      console.log(`${progress} 🔄 Processing: ${influencer.tt_username}`);

      try {
        // Download and store the image in Supabase Storage
        const supabaseUrl = await downloadAndStoreInSupabase(
          influencer.profilepicture, 
          influencer.tt_username
        );

        if (supabaseUrl) {
          // Update the database with the Supabase Storage URL
          const { error: updateError } = await supabase
            .from('influencer_data')
            .update({ profilepicture: supabaseUrl })
            .eq('influencer_uuid', influencer.influencer_uuid);

          if (updateError) {
            console.error(`${progress} ❌ Failed to update ${influencer.tt_username}:`, updateError);
            failCount++;
          } else {
            console.log(`${progress} ✅ Migrated ${influencer.tt_username}: ${supabaseUrl}`);
            successCount++;
          }
        } else {
          console.warn(`${progress} ⚠️ Failed to upload image for ${influencer.tt_username}`);
          failCount++;
        }

        // Add small delay to avoid overwhelming the system
        if (index % 10 === 0 && index > 0) {
          console.log(`⏸️ Processed ${index} items, taking a short break...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }

      } catch (err) {
        console.error(`${progress} ❌ Error processing ${influencer.tt_username}:`, err.message);
        failCount++;
      }
    }

    console.log('\n🎉 Migration to Supabase Storage completed!');
    console.log(`✅ Successfully migrated: ${successCount}`);
    console.log(`❌ Failed: ${failCount}`);
    console.log(`⏭️ Skipped: ${skippedCount}`);
    console.log(`📊 Total processed: ${successCount + failCount + skippedCount}`);

    if (successCount > 0) {
      console.log('\n💡 Benefits of Supabase Storage:');
      console.log('  • Images stored in the cloud (not on your computer)');
      console.log('  • Automatic CDN distribution for fast loading');
      console.log('  • Built-in image optimization and caching');
      console.log('  • Scalable storage with backup and redundancy');
      console.log('  • Public URLs that work from anywhere');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

// Run the migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateToSupabaseStorage();
}

export { migrateToSupabaseStorage };
