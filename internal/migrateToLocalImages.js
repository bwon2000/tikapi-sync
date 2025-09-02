// internal/migrateToLocalImages.js

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { downloadAndStoreImage } from '../api/downloadAndStoreImage.js';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Migrate existing TikTok CDN URLs to local stored images
 * This is a one-time migration script
 */
async function migrateToLocalImages() {
  console.log('🚀 Starting migration of TikTok URLs to local images...');

  try {
    // Get all influencers with TikTok CDN URLs
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
        // Download and store the image locally
        const localUrl = await downloadAndStoreImage(
          influencer.profilepicture, 
          influencer.tt_username
        );

        if (localUrl) {
          // Update the database with the local URL
          const { error: updateError } = await supabase
            .from('influencer_data')
            .update({ profilepicture: localUrl })
            .eq('influencer_uuid', influencer.influencer_uuid);

          if (updateError) {
            console.error(`${progress} ❌ Failed to update ${influencer.tt_username}:`, updateError);
            failCount++;
          } else {
            console.log(`${progress} ✅ Migrated ${influencer.tt_username}: ${localUrl}`);
            successCount++;
          }
        } else {
          console.warn(`${progress} ⚠️ Failed to download image for ${influencer.tt_username}`);
          failCount++;
        }

        // Add small delay to avoid overwhelming the system
        if (index % 10 === 0 && index > 0) {
          console.log(`⏸️ Processed ${index} items, taking a short break...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

      } catch (err) {
        console.error(`${progress} ❌ Error processing ${influencer.tt_username}:`, err.message);
        failCount++;
      }
    }

    console.log('\n🎉 Migration completed!');
    console.log(`✅ Successfully migrated: ${successCount}`);
    console.log(`❌ Failed: ${failCount}`);
    console.log(`⏭️ Skipped: ${skippedCount}`);
    console.log(`📊 Total processed: ${successCount + failCount + skippedCount}`);

    if (successCount > 0) {
      console.log('\n💡 Benefits of this migration:');
      console.log('  • No more TikAPI calls for existing profile pictures');
      console.log('  • Images load faster (served locally)');
      console.log('  • No more expired URL issues');
      console.log('  • Reduced bandwidth costs');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

// Run the migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateToLocalImages();
}

export { migrateToLocalImages };
