import { createClient } from '@supabase/supabase-js';
import TikAPI from 'tikapi';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

// === INIT ===
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const api = TikAPI(process.env.TIKAPI_KEY);

// === LOGGING ===
const logFailed = (username, reason = '') => {
  fs.appendFileSync('failed-usernames.txt', `${username} - ${reason}\n`);
};

// === GET USERS MISSING SECUID ===
const getUsernamesMissingSecUid = async () => {
  const { data, error } = await supabase
    .from('influencer_data')
    .select('tt_username')
    .is('secuid', null);

  if (error) {
    console.error('❌ Supabase fetch error:', error);
    return [];
  }

  return data.map((row) => row.tt_username?.trim().toLowerCase()).filter(Boolean);
};

// === GET SECUID + METRICS FROM TIKAPI ===
const fetchSecUidAndMetrics = async (username) => {
  try {
    const response = await api.public.check({ username });

    const user = response?.json?.userInfo?.user;
    const secUid = user?.secUid;

    if (!secUid) {
      console.warn(`⚠️ No secUid for ${username}`);
      console.log(`🔎 Full response for ${username}:`, JSON.stringify(response?.json, null, 2));
      logFailed(username, 'No secUid in userInfo');
      return { secUid: null, metrics: null };
    }

    const metrics = {
      followers: response?.json?.userInfo?.stats?.followerCount || null,
      following: response?.json?.userInfo?.stats?.followingCount || null,
      account_likes: response?.json?.userInfo?.stats?.heartCount || null,
      ttseller: user?.ttSeller || false,
      tt_url: `https://www.tiktok.com/@${user?.uniqueId}`
    };

    return { secUid, metrics };
  } catch (err) {
    const message = err?.json?.message || err?.message || 'Unknown error';
    console.error(`❌ TikAPI error for ${username}:`, message);
    logFailed(username, message);

    if (message.includes('ECONNRESET')) {
      console.log(`🔁 Retrying ${username} after ECONNRESET...`);
      await new Promise((res) => setTimeout(res, 1000));
      return await fetchSecUidAndMetrics(username);
    }

    return { secUid: null, metrics: null };
  }
};

// === UPDATE SUPABASE ===
const updateSupabase = async (username, secuid, metrics = {}) => {
  const { data: existingData, error: fetchError } = await supabase
    .from('influencer_data')
    .select('full_name')
    .eq('tt_username', username.trim().toLowerCase())
    .single();

  if (fetchError) {
    console.error(`❌ Fetch error for ${username}:`, fetchError);
    logFailed(username, 'Fetch error');
    return;
  }

  const updatePayload = { secuid, ...metrics };

  // Preserve existing full_name if already set
  if (existingData?.full_name) {
    delete updatePayload.full_name;
  }

  const { error } = await supabase
    .from('influencer_data')
    .update(updatePayload)
    .eq('tt_username', username.trim().toLowerCase());

  if (error) {
    console.error(`❌ Supabase update failed for ${username}:`, error);
    logFailed(username, 'Supabase update failed');
  } else {
    console.log(`✅ Updated ${username} with secUid + metrics`);
  }
};

// === MAIN ===
(async () => {
  const usernames = await getUsernamesMissingSecUid();
  console.log(`🔍 Found ${usernames.length} usernames missing secUid`);

  const SAMPLE_SIZE = usernames.length;
  const batch = usernames.slice(0, SAMPLE_SIZE);

  for (const username of batch) {
    console.log(`⏳ Processing "${username}"`);
    const { secUid, metrics } = await fetchSecUidAndMetrics(username);
    if (secUid) {
      await updateSupabase(username, secUid, metrics);
    }
    await new Promise((r) => setTimeout(r, 300));
  }

  console.log('🎯 Done syncing secUids.');
})();
