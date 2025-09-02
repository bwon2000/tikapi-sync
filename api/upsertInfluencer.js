import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Insert or update influencer profile.
 * If record exists, only updates fields that are currently null, missing, or falsy.
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
    secuid: newData.secuid || existing?.secuid || null,
    tt_url: newData.tt_url || existing?.tt_url || null,
    updated_at: new Date().toISOString(),
  };

  const fieldsToCheck = [
    'full_name',
    'followers',
    'following',
    'account_likes',
    'ttseller',
    'email',
  ];

  // Loop through each field and force an update for missing or falsy values
  for (const field of fieldsToCheck) {
    const incoming = newData?.[field];
    const existingValue = existing?.[field];

    // Check if field is falsy (null, undefined, empty string, or 0)
    if (
      isNew ||
      existingValue === null ||
      existingValue === undefined ||
      existingValue === '' ||
      existingValue === 0
    ) {
      if (incoming !== undefined) {
        updatePayload[field] = incoming;
      }
    }
  }

  console.log(
    '📝 Final updatePayload:',
    JSON.stringify(updatePayload, null, 2)
  );

  // Perform the upsert with the updated fields
  const { error: upsertError } = await supabase
    .from('influencer_data')
    .upsert(updatePayload, { onConflict: 'tt_username' });

  if (upsertError) {
    console.error('❌ Failed to upsert influencer:', upsertError);
  } else {
    console.log(
      `✅ Upserted influencer ${username}${isNew ? ' (new)' : ' (updated missing fields)'}`
    );
  }
}
