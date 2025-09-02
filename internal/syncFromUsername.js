import { resolveUsernameToSecUid } from '../api/resolveUsernameToSecUid.js'; // or correct path
import { pullAndSaveInfluencer } from './pullTikApiToSupabase.mjs'; // or correct path

const username = process.argv[2];

if (!username) {
  console.error('❌ Username argument missing');
  process.exit(1);
}

console.log(`🔍 Syncing TikTok user: ${username}`);

(async () => {
  try {
    const secUidResult = await resolveUsernameToSecUid(username);
    console.log(`✅ Resolved secUid: ${secUidResult.secUid}`); // <-- Fix

    await pullAndSaveInfluencer(secUidResult.secUid); // <-- Fix
    console.log(`🎉 Sync complete for ${username}`);
  } catch (err) {
    console.error('❌ Sync failed:', err);
    process.exit(1);
  }
})();
