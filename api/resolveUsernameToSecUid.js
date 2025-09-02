import TikAPI from 'tikapi';
import dotenv from 'dotenv';
import { extractEmailFromText } from '../utils/extractEmailFromText.js';
import { downloadAndStoreInSupabase } from './supabaseImageStorage.js';
dotenv.config();

const api = TikAPI(process.env.TIKAPI_KEY);

/**
 * Resolve a username → secUid + optional metadata (email, metrics)
 * @param {string} username
 * @returns {Object|null}
 */
export async function resolveUsernameToSecUid(username) {
  try {
    const res = await api.public.check({ username });

    const user = res?.json?.userInfo?.user;
    const stats = res?.json?.userInfo?.stats;

    const secUid = user?.secUid || null;
    const bio = user?.signature || '';
    const email = extractEmailFromText(bio);

    // Download and store profile picture in Supabase Storage
    let supabaseProfilePicture = null;
    if (user?.avatarLarger) {
      console.log(`📥 Downloading profile picture for ${username}...`);
      supabaseProfilePicture = await downloadAndStoreInSupabase(user.avatarLarger, username);
      if (supabaseProfilePicture) {
        console.log(`✅ Profile picture stored in Supabase: ${supabaseProfilePicture}`);
      } else {
        console.warn(`⚠️ Failed to download profile picture for ${username}, will use default`);
      }
    }

    const metrics = {
      followers: stats?.followerCount || null,
      following: stats?.followingCount || null,
      account_likes: stats?.heartCount || null,
      ttseller: user?.ttSeller || false,
      tt_url: `https://www.tiktok.com/@${user?.uniqueId}`,
      full_name: user?.nickname || null,
      profilepicture: supabaseProfilePicture, // Now stores Supabase Storage URL instead of TikTok URL
      updated_at: new Date().toISOString(),
    };

    console.log(
      '🧪 Final influencerData before upsert:\n',
      JSON.stringify(metrics, null, 2)
    );

    return { secUid, email, metrics };
  } catch (err) {
    console.error(
      `❌ Failed to resolve ${username}:`,
      err?.json || err?.message || err
    );
    return { secUid: null, email: null, metrics: {} };
  }
}
