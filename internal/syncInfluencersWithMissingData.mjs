import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { resolveUsernameToSecUid } from '../api/resolveUsernameToSecUid.js';
import { upsertInfluencer } from '../api/upsertInfluencer.js';
import fs from 'fs';

dotenv.config();

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// === LOGGING ===
const logFailed = (username, reason = '') => {
  fs.appendFileSync('failed-usernames.txt', `${username} - ${reason}\n`);
};

/**
 * Sync influencers with missing data (followers, following, etc.)
 */
export async function syncInfluencersWithMissingData() {
  try {
    // Fetch influencers with missing secUid (important to resolve secUid)
    const { data: influencers, error } = await supabase
      .from('influencer_data')
      .select(
        'tt_username, followers, following, full_name, account_likes, email, secuid'
      )
      .is('secuid', null); // Only those with missing secUid

    if (error) {
      console.error(
        '❌ Error fetching influencers with missing secUid:',
        error
      );
      return;
    }

    const totalMissing = influencers.length; // Get the total count
    console.log(`Found ${totalMissing} influencers with missing secUid`);

    if (totalMissing === 0) {
      console.log('❌ No influencers found with missing secUid.');
      return;
    }

    let processedCount = 0;

    for (const influencer of influencers) {
      let username = influencer.tt_username;

      // Ensure the username exists before performing any operations
      if (!username) {
        console.warn(`⚠️ Skipping influencer with missing username`);
        continue; // Skip this iteration if no username exists
      }

      // Clean the username (trim spaces and convert to lowercase)
      username = username.trim().toLowerCase();

      console.log(`🔍 Resolving secUid for ${username}`);

      // 2. Resolve secUid using the cleaned username
      const resolved = await resolveUsernameToSecUid(username);

      if (resolved.secUid) {
        // Prepare the update payload, but don't update full_name if it already exists
        const updatePayload = {
          tt_username: username,
          secuid: resolved.secUid,
          email: resolved.email,
          followers: resolved.metrics.followers || null,
          following: resolved.metrics.following || null,
          account_likes: resolved.metrics.account_likes || null,
          ttseller: resolved.metrics.ttseller,
          tt_url: resolved.metrics.tt_url,
          updated_at: new Date().toISOString(),
        };

        // Only update full_name if it is missing (null or undefined)
        if (!influencer.full_name) {
          updatePayload.full_name = resolved.metrics.full_name;
        }

        // Ensure all values are valid and not empty strings
        Object.keys(updatePayload).forEach((key) => {
          if (
            updatePayload[key] === null ||
            updatePayload[key] === undefined ||
            updatePayload[key] === ''
          ) {
            delete updatePayload[key]; // Remove invalid fields
          }
        });

        // If the payload has valid fields, proceed with the update
        if (Object.keys(updatePayload).length > 0) {
          await upsertInfluencer(updatePayload);
          console.log(`✅ Successfully updated ${username} with missing data`);
        } else {
          console.log(`❌ No valid data to update for ${username}`);
        }
      } else {
        // Log failed resolution of secUid, but do not delete record
        console.log(
          `❌ Failed to resolve secUid for ${username}. Skipping record.`
        );
        logFailed(username, 'Failed to resolve secUid');
      }

      // Increment processed count and log the remaining influencers
      processedCount++;
      const remainingCount = totalMissing - processedCount;
      console.log(`🔄 ${remainingCount} influencers left to process`);
    }

    console.log(`✅ Finished processing ${totalMissing} influencers.`); // Log total processed
  } catch (err) {
    console.error(
      '❌ Error in syncInfluencersWithMissingData:',
      err.message || err
    );
  }
}

if (process.argv[1].includes('syncInfluencersWithMissingData.mjs')) {
  syncInfluencersWithMissingData();
}
