// internal/fillProfilePictures.js

import { createClient } from '@supabase/supabase-js';
import TikAPI from 'tikapi';
import dotenv from 'dotenv';
import fs from 'fs';
import { downloadAndStoreInSupabase } from '../api/supabaseImageStorage.js';
dotenv.config();

// === INIT ===
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
const api = TikAPI(process.env.TIKAPI_KEY);

// === LOGGING ===
const logFailed = (username, reason = '') => {
  fs.appendFileSync('failed-usernames.txt', `${username} - ${reason}\n`);
};

// === MAIN FUNCTION ===
async function fillMissingProfilePictures() {
  console.log('🚀 Starting batch profile picture update with Supabase Storage...');

  // Get influencers that need profile pictures (missing or old TikTok URLs)
  const { data: influencers, error } = await supabase
    .from('influencer_data')
    .select('influencer_uuid, tt_username, secuid, profilepicture')
    .not('secuid', 'is', null) // Only process users with secUIDs
    .or('profilepicture.is.null,profilepicture.like.%tiktokcdn%') // Missing or old TikTok URLs
    .order('tt_username', { ascending: true });

  if (error) {
    console.error('❌ Failed to fetch influencers:', error);
    return;
  }

  console.log(`📊 Found ${influencers.length} influencers to process`);

  let successCount = 0;
  let failCount = 0;
  let skippedCount = 0;

  for (const [index, influencer] of influencers.entries()) {
    const progress = `[${index + 1}/${influencers.length}]`;
    
    if (!influencer.tt_username || !influencer.secuid) {
      console.warn(`${progress} ⚠️ Missing username or secUID for UUID ${influencer.influencer_uuid}, skipping.`);
      skippedCount++;
      continue;
    }

    // Skip if already has Supabase Storage URL
    if (influencer.profilepicture && influencer.profilepicture.includes('supabase.co/storage/')) {
      console.log(`${progress} ⏭️ Already has Supabase profile picture for ${influencer.tt_username}, skipping.`);
      skippedCount++;
      continue;
    }

    console.log(`${progress} 🔄 Fetching fresh profile for: ${influencer.tt_username} (using username)`);

    try {
      // Use username directly (TikAPI public.check seems to only support username parameter)
      const response = await api.public.check({
        username: influencer.tt_username,
      });
      const avatarUrl = response?.json?.userInfo?.user?.avatarLarger;

      if (avatarUrl) {
        console.log(`${progress} 📥 Found profile picture, uploading to Supabase Storage...`);

        // Download and store in Supabase Storage
        const supabaseUrl = await downloadAndStoreInSupabase(avatarUrl, influencer.tt_username);

        if (supabaseUrl) {
          // Update database with Supabase Storage URL
          const { error: updateError } = await supabase
            .from('influencer_data')
            .update({ profilepicture: supabaseUrl })
            .eq('influencer_uuid', influencer.influencer_uuid);

          if (updateError) {
            console.error(`${progress} ❌ Failed to update ${influencer.tt_username}:`, updateError);
            logFailed(influencer.tt_username, 'Supabase update error');
            failCount++;
          } else {
            console.log(`${progress} ✅ Updated ${influencer.tt_username}: ${supabaseUrl}`);
            successCount++;
          }
        } else {
          console.warn(`${progress} ⚠️ Failed to upload to Supabase for ${influencer.tt_username}`);
          logFailed(influencer.tt_username, 'Supabase upload failed');
          failCount++;
        }
      } else {
        console.warn(`${progress} ⚠️ No avatar found for ${influencer.tt_username}`);
        logFailed(influencer.tt_username, 'No avatar found');
        failCount++;
      }

      // Add delay every 10 requests to avoid rate limits
      if (index % 10 === 0 && index > 0) {
        console.log(`⏸️ Processed ${index} items, taking a short break...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

    } catch (err) {
      console.error(`${progress} ❌ TikAPI error for ${influencer.tt_username}:`, err.message);
      logFailed(influencer.tt_username, err.message || 'Unknown TikAPI error');
      failCount++;
    }
  }

  console.log('\n🎉 Batch profile picture update completed!');
  console.log(`✅ Successfully updated: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`⏭️ Skipped: ${skippedCount}`);
  console.log(`📊 Total processed: ${successCount + failCount + skippedCount}`);

  if (successCount > 0) {
    console.log('\n💡 Benefits achieved:');
    console.log('  • Fresh profile pictures from TikTok');
    console.log('  • Stored in Supabase Storage (cloud CDN)');
    console.log('  • Used existing usernames (no secUID→username lookups)');
    console.log('  • Reliable URLs that never expire');
  }
}

fillMissingProfilePictures();
