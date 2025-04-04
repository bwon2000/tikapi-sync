import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Calculate rollups (average views, likes, comments, etc.) for an influencer
 * @param {string} secUid
 */
export async function calcRollups(secUid) {
  try {
    const { data: videos, error } = await supabase
      .from('tiktok_video_data')
      .select('views, likes, comments, shares')
      .eq('secuid', secUid);

    if (error) {
      console.error(
        `❌ Error fetching video data for secUid ${secUid}:`,
        error
      );
      return;
    }

    if (!videos.length) {
      console.log(`❌ No videos found for secUid ${secUid}`);
      return;
    }

    // Calculate averages
    const totalViews = videos.reduce((acc, video) => acc + video.views, 0);
    const totalLikes = videos.reduce((acc, video) => acc + video.likes, 0);
    const totalComments = videos.reduce(
      (acc, video) => acc + video.comments,
      0
    );
    const totalShares = videos.reduce((acc, video) => acc + video.shares, 0);

    const avgViews = totalViews / videos.length;
    const avgLikes = totalLikes / videos.length;
    const avgComments = totalComments / videos.length;
    const avgShares = totalShares / videos.length;

    const rollups = {
      avg_views: avgViews,
      avg_likes: avgLikes,
      avg_comments: avgComments,
      avg_shares: avgShares,
    };

    // Update influencer data with rollups
    const { error: updateError } = await supabase
      .from('influencer_data')
      .update(rollups)
      .eq('secuid', secUid);

    if (updateError) {
      console.error('❌ Error updating rollups:', updateError);
    } else {
      console.log(`✅ Successfully updated rollups for secUid ${secUid}`);
    }
  } catch (err) {
    console.error('❌ Error in calcRollups:', err.message || err);
  }
}

if (process.argv[1].includes('calcRollups.js')) {
  const secUid = process.argv[2];
  if (!secUid) {
    console.error('❌ Please provide a secUid as an argument.');
    process.exit(1);
  }
  calcRollups(secUid);
}
