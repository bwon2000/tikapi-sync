// ✅ Updated to use shared logic
import { createClient } from '@supabase/supabase-js';
import { pullAndSaveInfluencer } from './internal/pullAndSaveInfluencer.js';
import { calcAndUpdateInfluencerAverages } from './internal/calcRollups.js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runBatch() {
  const { data: influencers, error } = await supabase
    .from('influencer_data')
    .select('tt_username, secuid')
    .not('secuid', 'is', null)
    .limit(5); // adjust for rate limits

  if (error) {
    console.error('❌ Failed to fetch influencers:', error);
    return;
  }

  for (const influencer of influencers) {
    const { secuid, tt_username } = influencer;
    console.log(`🔄 Processing ${tt_username} (${secuid})`);

    await pullAndSaveInfluencer(secuid);
    await calcAndUpdateInfluencerAverages(tt_username);

    await new Promise((r) => setTimeout(r, 500)); // TikAPI rate limit delay
  }

  console.log('✅ Batch pull complete.');
}

runBatch();
