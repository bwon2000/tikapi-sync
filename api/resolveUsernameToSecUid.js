import TikAPI from 'tikapi';
import dotenv from 'dotenv';
import { extractEmailFromText } from '../utils/extractEmailFromText.js';
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

    const metrics = {
      followers: stats?.followerCount || null,
      following: stats?.followingCount || null,
      account_likes: stats?.heartCount || null,
      ttseller: user?.ttSeller || false,
      tt_url: `https://www.tiktok.com/@${user?.uniqueId}`,
      full_name: user?.nickname || null,
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
