import { createClient } from '@supabase/supabase-js';
import TikAPI from 'tikapi';
import dotenv from 'dotenv';
import { format } from 'date-fns'; // For date comparison

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
    // 1. Fetch the most recent video date from Supabase for the given secUid
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

    // 2. If no videos exist, allow the pull (first time pull)
    if (!latestVideo) {
      console.log(`🔄 No videos found for secUid ${secUid}, pulling all data.`);
    } else {
      // 3. Compare the most recent video's date to the current date
      const lastVideoDate = new Date(latestVideo.date);
      const currentDate = new Date();
      const timeDifference = currentDate - lastVideoDate;
      const timeDifferenceInHours = timeDifference / (1000 * 60 * 60); // Convert to hours

      if (timeDifferenceInHours < 24) {
        console.log(
          `⚠️ Most recent video for secUid ${secUid} is less than 24 hours old. Skipping pull.`
        );
        return; // Exit the function if videos are too recent
      }
      console.log(
        `🔄 Most recent video is more than 24 hours old. Proceeding with pull.`
      );
    }

    // 4. Proceed with pulling TikTok videos if the condition is met
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
        saves: stats.collectCount,
        length: video.duration || null,
        video_quality: video.videoQuality || null,
        date: new Date(item.createTime * 1000),
      };
    });

    const { error } = await supabase
      .from('tiktok_video_data')
      .insert(videoRows);

    if (error) {
      console.error('❌ Failed to insert videos:', error);
    } else {
      console.log(`✅ Inserted ${videoRows.length} videos.`);
    }
  } catch (err) {
    const msg = err?.json?.message || err?.message || 'Unknown TikAPI error';
    console.error(`❌ TikAPI fetch failed for secUid ${secUid}:`, msg);
  }
}

// Optional: CLI test
if (process.argv[1].includes('pullTikApiToSupabase.mjs')) {
  const secUid = process.argv[2];
  if (!secUid) {
    console.error('❌ Please provide a secUid as an argument.');
    process.exit(1);
  }
  pullAndSaveInfluencer(secUid);
}
