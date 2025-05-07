import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { extractEmailFromText } from '../utils/extractEmailFromText.js';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Insert or update influencer profile.
 * Only updates fields that are currently null, missing, or falsy.
 * Will NOT overwrite email or full_name if already exists.
 * Logs each update clearly.
 * 
 * @param {Object} newData - TikAPI influencer data
 */
export async function upsertInfluencer(newData) {
  const username = newData?.tt_username?.trim().toLowerCase();
  if (!username) {
    console.warn('⚠️ No username provided for upsert.');
    return;
  }

  const { data: existing, error: fetchError } = await supabase
    .from('influencer_data')
    .select('*')
    .eq('tt_username', username)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error('❌ Error fetching existing influencer:', fetchError);
    return;
  }

  const isNew = !existing;
  const updatePayload = {
    tt_username: username,
  };

  // Only update secuid if missing
  if (!existing?.secuid && newData?.secuid) {
    updatePayload.secuid = newData.secuid;
    console.log(`📌 Updating secuid → ${newData.secuid}`);
  }

  // Only update tt_url if missing or invalid
  if (
    isNew ||
    !existing?.tt_url ||
    existing.tt_url.trim() === '' ||
    existing.tt_url === 'null'
  ) {
    if (newData?.tt_url) {
      updatePayload.tt_url = newData.tt_url;
      console.log(`📌 Updating tt_url → ${newData.tt_url}`);
    }
  }

  // Email fallback from bio, only if both source & db are empty
  let extractedEmail = null;
  if (!newData?.email && !existing?.email) {
    const sourceText = newData?.signature || newData?.full_name || '';
    extractedEmail = extractEmailFromText(sourceText);
    if (extractedEmail) {
      console.log(`📬 Extracted email from bio → ${extractedEmail}`);
    }
  }

  const fieldsToCheck = [
    'followers',
    'following',
    'account_likes',
    'ttseller',
    'email',
    'tt_url',
  ];
  
  for (const field of fieldsToCheck) {
    const incoming = newData?.[field];
    const existingValue = existing?.[field];
  
    const isBooleanField = field === 'ttseller';
  
    const isMissing = isNew ||
      existingValue === null ||
      existingValue === undefined ||
      existingValue === '' ||
      (typeof existingValue === 'number' && existingValue === 0) ||
      (isBooleanField && existingValue === null); // ✅ Only treat null booleans as missing
  
    if (!isMissing) continue;
  
    if (field === 'email') {
      if (!existing?.email && (incoming || extractedEmail)) {
        const finalEmail = incoming || extractedEmail;
        updatePayload.email = finalEmail;
        console.log(`📌 Updating 'email': from ${existing?.email ?? 'null'} → ${finalEmail}`);
      }
    } else if (incoming !== undefined) {
      updatePayload[field] = incoming;
      console.log(
        `📌 Updating '${field}': from ${existingValue ?? 'null'} → ${incoming}`
      );
    }
  }  

  // Only add updated_at if we're actually changing anything
  const changedFields = Object.keys(updatePayload).filter(
    key => key !== 'tt_username'
  );

  if (changedFields.length === 0) {
    console.log(`🛑 Skipping ${username} — no meaningful updates detected.`);
    return;
  }

  updatePayload.updated_at = new Date().toISOString();

  console.log(`🧾 Final update for ${username}`);
  console.log('➡️ Before:', JSON.stringify(existing || {}, null, 2));
  console.log('⬅️ After:', JSON.stringify(updatePayload, null, 2));

  const { error: upsertError } = await supabase
    .from('influencer_data')
    .upsert(updatePayload, { onConflict: 'tt_username' });

  if (upsertError) {
    console.error('❌ Failed to upsert influencer:', upsertError);
  } else {
    console.log(`✅ Upserted influencer ${username}${isNew ? ' (new)' : ' (updated)'}`);
  }
}
