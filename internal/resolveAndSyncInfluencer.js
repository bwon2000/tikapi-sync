import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { resolveUsernameToSecUid } from '../api/resolveUsernameToSecUid.js';
import { upsertInfluencer } from '../api/upsertInfluencer.js';
import { updateInfluencerData } from '../api/updateInfluencerData.js'; // NEW
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Given a TikTok username, resolve their secUid, upsert their profile, and sync videos.
 * @param {string} username
 * @returns {object|null} influencer_data row after sync
 */
export default async function resolveAndSync(username) {
  const normalizedUsername = username.trim().toLowerCase();

  // 1. Check if influencer already exists
  const { data: existing, error } = await supabase
    .from('influencer_data')
    .select('*')
    .eq('tt_username', normalizedUsername)
    .maybeSingle();

  console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
  console.log(
    'SUPABASE_SERVICE_ROLE_KEY is loaded:',
    !!process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  if (error) {
    console.error('❌ Supabase lookup failed:', error);
    return null;
  }

  let secuid = existing?.secuid || null;
  let email = existing?.email || null;

  // 2. If secuid or email missing, resolve from TikAPI
  if (!secuid || !email) {
    console.log(`🔍 Resolving TikAPI info for ${normalizedUsername}...`);
    const resolved = await resolveUsernameToSecUid(normalizedUsername);

    if (!resolved?.secUid) {
      console.error('❌ Could not resolve secUid from TikAPI');
      return null;
    }

    secuid = secuid || resolved.secUid;
    email = email || resolved.email;

    console.log('🧪 Upserting with payload:', {
      tt_username: normalizedUsername,
      secuid,
      email,
      ...resolved.metrics,
    });

    // 3. Perform upsert
    await upsertInfluencer({
      tt_username: normalizedUsername,
      secuid,
      email,
      ...resolved.metrics, // Include all additional fields
    });
  }

  // 4. Check if any critical fields are missing or need updating (like followers, following, etc.)
  const influencerData = await supabase
    .from('influencer_data')
    .select('*')
    .eq('tt_username', normalizedUsername)
    .maybeSingle();

  const {
    followers,
    following,
    account_likes,
    full_name,
    email: existingEmail,
  } = influencerData;

  // If any critical fields are missing, force a re-pull and update
  if (
    !followers ||
    !following ||
    !account_likes ||
    !full_name ||
    !existingEmail
  ) {
    console.log(`🔄 Pulling latest data for ${normalizedUsername}...`);
    await updateInfluencerData(
      { followers, following, account_likes, full_name },
      normalizedUsername
    );
    console.log(
      `✅ Fetched and updated missing data for ${normalizedUsername}.`
    );
  }

  // 5. Pull TikAPI videos using secuid
  const { pullAndSaveInfluencer } = await import('./pullTikApiToSupabase.mjs');
  await pullAndSaveInfluencer(secuid);

  // 6. Return final synced influencer record
  const { data: updated } = await supabase
    .from('influencer_data')
    .select('*')
    .eq('tt_username', normalizedUsername)
    .maybeSingle();

  return updated || null;
}
