import { createClient } from '@supabase/supabase-js';
import { resolveUsernameToSecUid } from './resolveUsernameToSecUid.js';
import { pullAndSaveInfluencer } from './pullTikApiToSupabase.mjs';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Force a reload of influencer data from TikAPI
 * @param {string} username - TikTok username of the influencer
 */
export async function triggerReload(username) {
  const normalizedUsername = username.trim().toLowerCase();

  // Step 1: Get the influencer's secUid
  const resolved = await resolveUsernameToSecUid(normalizedUsername);
  if (!resolved.secUid) {
    console.log(`❌ Could not resolve secUid for ${normalizedUsername}`);
    return;
  }

  // Step 2: Pull new video data for the influencer
  await pullAndSaveInfluencer(resolved.secUid);

  console.log(`✅ Reloaded TikTok data for ${normalizedUsername}`);
}
