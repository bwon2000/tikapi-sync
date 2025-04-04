import { resolveAndSync } from './resolveAndSyncInfluencer.js';

(async () => {
  const username = 'by.fannys'; // 🔁 Replace with any real TikTok username

  const result = await resolveAndSync(username);

  console.log('🧪 Final synced influencer:', result);
})();
