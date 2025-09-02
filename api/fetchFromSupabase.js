import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

/**
 * Fetch an influencer by TikTok username or secUid from Supabase.
 * @param {Object} options - { username?: string, secuid?: string }
 * @returns {Object|null} Influencer data with optional latest video + pull date
 */
export async function fetchInfluencer(options = {}) {
  const { username, secuid } = options;

  if (!username && !secuid) {
    throw new Error('Must provide username or secuid');
  }

  const { data: influencer, error } = await supabase
    .from('influencer_data')
    .select('*')
    .or(`tt_username.eq.${username},secuid.eq.${secuid}`)
    .maybeSingle();

  if (error) {
    console.error('Failed to fetch influencer:', error);
    return null;
  }

  if (!influencer) {
    console.log('Influencer not found in Supabase.');
    return null;
  }

  // Optionally fetch latest video date
  const { data: latestVideo } = await supabase
    .from('tiktok_video_data')
    .select('date')
    .eq('secuid', influencer.secuid)
    .order('date', { ascending: false })
    .limit(1)
    .maybeSingle();

  return {
    ...influencer,
    latest_video_date: latestVideo?.date || null,
  };
}
