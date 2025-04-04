import { createClient } from '@supabase/supabase-js';
import { resolveUsernameToSecUid } from './resolveUsernameToSecUid.js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Update influencer profile if key metrics are missing (followers, following, etc.)
 * @param {Object} existingData - Existing influencer data
 * @param {string} username - TikTok username
 */
export async function updateInfluencerData(existingData, username) {
  const resolved = await resolveUsernameToSecUid(username);

  const updatePayload = {};

  if (!existingData?.followers && resolved?.metrics?.followers) {
    updatePayload.followers = resolved?.metrics?.followers;
  }

  if (!existingData?.following && resolved?.metrics?.following) {
    updatePayload.following = resolved?.metrics?.following;
  }

  if (!existingData?.account_likes && resolved?.metrics?.account_likes) {
    updatePayload.account_likes = resolved?.metrics?.account_likes;
  }

  if (!existingData?.ttseller && resolved?.metrics?.ttseller) {
    updatePayload.ttseller = resolved?.metrics?.ttseller;
  }

  if (!existingData?.email && resolved?.email) {
    updatePayload.email = resolved?.email;
  }

  // Perform the update if there is any data to update
  if (Object.keys(updatePayload).length > 0) {
    const { error } = await supabase
      .from('influencer_data')
      .update(updatePayload)
      .eq('tt_username', username);

    if (error) {
      console.error('❌ Failed to update influencer data:', error);
    } else {
      console.log(`✅ Updated influencer ${username} with missing data.`);
    }
  }
}
