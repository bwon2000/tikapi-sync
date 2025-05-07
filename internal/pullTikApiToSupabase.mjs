// pullTikApiToSupabase.mjs
import { pullAndSaveInfluencer } from './internal/pullAndSaveInfluencer.js';

const secUid = process.argv[2];

if (!secUid) {
  console.error('❌ Please provide a secUid as an argument.');
  process.exit(1);
}

pullAndSaveInfluencer(secUid);
