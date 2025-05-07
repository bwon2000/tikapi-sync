import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } from '../env.js';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export async function calcAndUpdateInfluencerAverages(tt_username) {
  // 1. Get last 30 videos for the influencer
  const { data: videos, error } = await supabase
    .from('tiktok_video_data')
    .select('views, likes, comments, saves, shares')
    .eq('username', tt_username)
    .order('created_at', { ascending: false })
    .limit(30);

  if (error || !videos?.length) {
    console.warn(`No videos found or error: ${error?.message}`);
    return;
  }

  // 2. Calculate averages
  const sum = { views: 0, likes: 0, comments: 0, saves: 0, shares: 0 };
  videos.forEach(v => {
    sum.views += v.views || 0;
    sum.likes += v.likes || 0;
    sum.comments += v.comments || 0;
    sum.saves += v.saves || 0;
    sum.shares += v.shares || 0;
  });

  const count = videos.length;
  const avg_views = Math.round(sum.views / count);
  const avg_likes = Math.round(sum.likes / count);
  const avg_comments = Math.round(sum.comments / count);
  const avg_saves = Math.round(sum.saves / count);
  const avg_shares = Math.round(sum.shares / count);
  const avg_engagement = avg_likes + avg_comments + avg_saves + avg_shares;
  const avg_er = avg_views > 0 ? avg_engagement / avg_views : null;

  // 3. Update influencer_data
  const { error: updateError } = await supabase
    .from('influencer_data')
    .update({
      avg_views,
      avg_likes,
      avg_comment: avg_comments,
      avg_saves,
      avg_shares,
      avg_er,
      updated_at: new Date().toISOString()
    })
    .eq('tt_username', tt_username);

  if (updateError) {
    console.error(`Failed to update influencer_data for ${tt_username}`, updateError);
  } else {
    console.log(`Updated influencer_data for ${tt_username}`);
  }
}