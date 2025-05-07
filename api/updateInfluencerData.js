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

  const metrics = resolved?.metrics || {};

  const safeUpdate = (field, value) => {
    if (
      !existingData?.[field] && // original field is missing/falsy
      value !== undefined && value !== null
    ) {
      updatePayload[field] = value;
      console.log(`📌 Updating ${field}: ${value}`);
    }
  };

  safeUpdate('followers', metrics.followers);
  safeUpdate('following', metrics.following);
  safeUpdate('account_likes', metrics.account_likes);
  safeUpdate('ttseller', metrics.ttseller);
  safeUpdate('tt_url', metrics.tt_url);

  // Special case: Only update email if it doesn't already exist
  if (!existingData?.email && resolved?.email) {
    updatePayload.email = resolved.email;
    console.log(`📧 Updating missing email: ${resolved.email}`);
  } else if (existingData?.email) {
    console.log(`✋ Skipping email update — already exists: ${existingData.email}`);
  }

  if (Object.keys(updatePayload).length > 0) {
    const { error } = await supabase
      .from('influencer_data')
      .update(updatePayload)
      .eq('tt_username', username);

    if (error) {
      console.error(`❌ Failed to update ${username}:`, error);
    } else {
      console.log(`✅ Updated influencer ${username} with missing data.`);
    }
  } else {
    console.log(`🔁 No update needed for ${username}.`);
  }
}
