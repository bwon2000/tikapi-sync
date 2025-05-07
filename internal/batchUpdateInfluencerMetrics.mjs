import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { upsertInfluencer } from '../api/upsertInfluencer.js';
import { resolveUsernameToSecUid } from '../api/resolveUsernameToSecUid.js';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runBatchUpdate() {
  const { data: influencers, error } = await supabase
    .from('influencer_data')
    .select('tt_username')
    .or('followers.is.null,following.is.null,account_likes.is.null,tt_url.is.null')
    .not('tt_username', 'is', null);

  if (error) {
    console.error('❌ Error fetching influencers:', error);
    return;
  }

  console.log(`🔍 Found ${influencers.length} influencers to update`);

  let count = 0;
  for (const record of influencers) {
    const username = record.tt_username?.trim().toLowerCase();
    if (!username) continue;

    console.log(`🔍 Resolving TikAPI data for ${username}`);

    const resolved = await resolveUsernameToSecUid(username);

    if (!resolved || !resolved.secUid) {
      console.warn(`⚠️ Skipping ${username} - could not resolve via TikAPI`);
      continue;
    }

    await upsertInfluencer({
      tt_username: username,
      secuid: resolved.secUid,
      email: resolved.email,
      ...resolved.metrics,
    });

    count++;
    console.log(`🔄 Processed ${count}/${influencers.length}: ${username}`);
    await new Promise((r) => setTimeout(r, 300)); // Respect TikAPI rate limits
  }

  console.log(`✅ Finished updating ${count} influencers.`);
}

if (process.argv[1].includes('batchUpdateInfluencerMetrics.mjs')) {
  runBatchUpdate();
}
