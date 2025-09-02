import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { resolveUsernameToSecUid } from '../api/resolveUsernameToSecUid.js'; // Corrected path
import { upsertInfluencer } from '../api/upsertInfluencer.js'; // Corrected path
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
 * Find influencers missing their secUid and resolve it via TikAPI
 */
export async function getMissingSecUids() {
  try {
    // Fetch influencers with missing secUid
    const { data: influencers, error } = await supabase
      .from('influencer_data')
      .select('tt_username')
      .is('secuid', null); // Only those missing secUid

    if (error) {
      console.error(
        '❌ Error fetching influencers with missing secUid:',
        error
      );
      return;
    }

    const totalMissing = influencers.length; // Get the total count
    console.log(`Found ${totalMissing} influencers with missing secUid`);

    let processedCount = 0;

    for (const influencer of influencers) {
      let username = influencer.tt_username;

      // Ensure the username exists before performing any operations
      if (!username) {
        console.warn(`⚠️ Skipping influencer with missing username`);
        continue; // Skip this iteration if no username exists
      }

      // 1. Clean up the username: trim spaces and convert to lowercase
      username = username.trim().toLowerCase();

      // Log the cleaned username for debugging
      console.log(`🔍 Resolving secUid for ${username}`);

      // 2. Resolve secUid using the cleaned username
      const resolved = await resolveUsernameToSecUid(username);

      if (resolved.secUid) {
        // If secUid is resolved, upsert the influencer's data
        await upsertInfluencer({
          tt_username: username,
          secuid: resolved.secUid,
          email: resolved.email,
          ...resolved.metrics,
        });

        console.log(`✅ Successfully updated ${username} with secUid`);
      } else {
        // If secUid cannot be resolved, remove the influencer record from the database
        console.log(
          `❌ Failed to resolve secUid for ${username}. Deleting record...`
        );
        await supabase
          .from('influencer_data')
          .delete()
          .eq('tt_username', username);

        logFailed(username, 'Failed to resolve secUid');
        console.log(`✅ Deleted record for ${username}`);
      }

      // Increment processed count and log the remaining influencers
      processedCount++;
      const remainingCount = totalMissing - processedCount;
      console.log(`🔄 ${remainingCount} influencers left to process`);
    }

    console.log(`✅ Finished processing ${totalMissing} influencers.`); // Log total processed
  } catch (err) {
    console.error('❌ Error in getMissingSecUids:', err.message || err);
  }
}

if (process.argv[1].includes('getMissingSecUids.mjs')) {
  getMissingSecUids();
}
