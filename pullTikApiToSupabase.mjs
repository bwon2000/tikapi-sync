import { createClient } from '@supabase/supabase-js';
import TikAPI from 'tikapi';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const api = TikAPI(process.env.TIKAPI_KEY);

// Get all secUids
const getSecUids = async () => {
  const { data, error } = await supabase
    .from('influencer_data')
    .select('secuid, tt_username, full_name')
    .not('secuid', 'is', null);

  if (error) {
    console.error('Error fetching secUids:', error);
    return [];
  }
  return data.slice(0, 5); // Limit to 5 users for testing
};

// Fetch videos from TikAPI public endpoint
const fetchVideos = async (secuid) => {
  try {
    let response = await api.public.posts({ secUid: secuid, count: 30 });
    const allVideos = [];

    while (response) {
      allVideos.push(...response?.json?.itemList || []);

      if (!response?.hasMore || !response?.nextItems) break;

      response = await Promise.resolve(response.nextItems());
    }

    return allVideos;
  } catch (err) {
    console.error(`Failed to fetch videos for ${secuid}:`, err?.json || err.message);
    return [];
  }
};

// Print video data for preview
const printVideo = (videoItem, user) => {
  const {
    id: video_id,
    desc: caption,
    createTime: create_time,
    duration,
    stats,
    vq_score
  } = videoItem;

  const video_url = `https://www.tiktok.com/@${user.tt_username}/video/${video_id}`;

  console.log({
    video_id,
    secuid: user.secuid,
    username: user.tt_username,
    full_name: user.full_name,
    video_url,
    caption,
    views: stats?.playCount,
    likes: stats?.diggCount,
    comments: stats?.commentCount,
    shares: stats?.shareCount,
    saves: stats?.saveCount,
    length: duration,
    vq_score: vq_score || null,
    date: new Date(create_time * 1000)
  });
};

// Main runner
(async () => {
  const users = await getSecUids();

  for (const user of users) {
    console.log(`📥 Fetching videos for ${user.tt_username}`);
    const videoItems = await fetchVideos(user.secuid);

    for (const videoItem of videoItems) {
      printVideo(videoItem, user); // Just print for testing
    }

    await new Promise((r) => setTimeout(r, 500)); // throttle to prevent hitting limits
  }

  console.log('✅ Test preview complete (no inserts).');
})();
