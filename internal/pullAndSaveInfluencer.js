import { createClient } from '@supabase/supabase-js';
import TikAPI from 'tikapi';
import dotenv from 'dotenv';

dotenv.config();

const api = TikAPI(process.env.TIKAPI_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Pulls recent TikTok videos by secUid and inserts into Supabase
 * Only if the most recent video is older than 24 hours
 * @param {string} secUid
 */
export async function pullAndSaveInfluencer(secUid) {
  try {
    const { data: latestVideo, error: fetchError } = await supabase
      .from('tiktok_video_data')
      .select('date')
      .eq('secuid', secUid)
      .order('date', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fetchError) {
      console.error('❌ Failed to fetch most recent video date:', fetchError);
      return;
    }

    if (!latestVideo) {
      console.log(`🔄 No videos found for secUid ${secUid}, pulling all data.`);
    } else {
      const lastVideoDate = new Date(latestVideo.date);
      const currentDate = new Date();
      const hoursElapsed = (currentDate - lastVideoDate) / (1000 * 60 * 60);

      if (hoursElapsed < 24) {
        console.log(`⚠️ Last video for secUid ${secUid} is < 24h old. Skipping.`);
        return;
      }
      console.log(`🔄 Last video > 24h old. Proceeding with pull.`);
    }

    let response = await api.public.posts({ secUid, count: 30 });
    const allVideos = [];

    while (response) {
      allVideos.push(...(response?.json?.itemList || []));
      if (!response?.hasMore || !response?.nextItems) break;
      response = await Promise.resolve(response.nextItems());
    }

    if (!allVideos.length) {
      console.warn(`⚠️ No videos returned for secUid: ${secUid}`);
      return;
    }

    const videoRows = allVideos.map((item) => {
      const stats = item.stats || {};
      const video = item.video || {};

      return {
        video_id: item.id,
        secuid: secUid,
        username: item?.author?.uniqueId || null,
        full_name: item?.author?.nickname || null,
        account_url: `https://www.tiktok.com/@${item?.author?.uniqueId}`,
        video_url: `https://www.tiktok.com/@${item?.author?.uniqueId}/video/${item.id}`,
        caption: item.desc,
        views: stats.playCount,
        likes: stats.diggCount,
        comments: stats.commentCount,
        shares: stats.shareCount,
        saves: stats.saveCount,
        length: video.duration || null,
        video_quality: video.videoQuality || null,
        vqscore: video.vqscore || null, // ✅ TikAPI-specific quality score
        date: new Date(item.createTime * 1000),
      };
    });

    const { error: insertError } = await supabase
      .from('tiktok_video_data')
      .insert(videoRows);

    if (insertError) {
      console.error('❌ Failed to insert videos:', insertError);
    } else {
      console.log(`✅ Inserted ${videoRows.length} videos for ${secUid}`);
    }
  } catch (err) {
    const msg = err?.json?.message || err?.message || 'Unknown TikAPI error';
    console.error(`❌ TikAPI fetch failed for secUid ${secUid}:`, msg);
  }
}
