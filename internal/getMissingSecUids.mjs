import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { resolveUsernameToSecUid } from '../api/resolveUsernameToSecUid.js'; // Corrected path
import { upsertInfluencer } from '../api/upsertInfluencer.js'; // Corrected path
import fs from 'fs';

dotenv.config();

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
    const { data: influencers, error } = await supabase
      .from('influencer_data')
      .select('tt_username, followers, following, account_likes, tt_url, secuid')
      .is('secuid', null)
      .not('tt_username', 'is', null);

    if (error) {
      console.error('❌ Error fetching influencers with missing secUid:', error);
      return;
    }

    const totalMissing = influencers.length;
    console.log(`Found ${totalMissing} influencers with missing secUid`);

    let processedCount = 0;

    for (const influencer of influencers) {
      let username = influencer.tt_username;

      if (!username) {
        console.warn(`⚠️ Skipping influencer with missing username`);
        continue;
      }

      username = username.trim().toLowerCase();

      // ✅ Skip if they already have all metrics (no need for API call)
      if (
        influencer.followers &&
        influencer.following &&
        influencer.account_likes &&
        influencer.tt_url
      ) {
        console.log(`⏭️ Skipping ${username} – all key metrics already present`);
        continue;
      }

      console.log(`🔍 Resolving secUid for ${username}`);

      const resolved = await resolveUsernameToSecUid(username);

      if (resolved.secUid) {
        await upsertInfluencer({
          tt_username: username,
          secuid: resolved.secUid,
          email: resolved.email,
          ...resolved.metrics,
        });

        console.log(`✅ Successfully updated ${username} with secUid`);
      } else {
        console.log(`❌ Failed to resolve secUid for ${username}. Deleting record...`);

        await supabase.from('influencer_data').delete().eq('tt_username', username);

        logFailed(username, 'Failed to resolve secUid');
        console.log(`✅ Deleted record for ${username}`);
      }

      processedCount++;
      const remaining = totalMissing - processedCount;
      console.log(`🔄 ${remaining} influencers left to process`);
    }

    console.log(`✅ Finished processing ${totalMissing} influencers.`);
  } catch (err) {
    console.error('❌ Error in getMissingSecUids:', err.message || err);
  }
}

if (process.argv[1].includes('getMissingSecUids.mjs')) {
  getMissingSecUids();
}