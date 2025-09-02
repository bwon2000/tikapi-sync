#!/usr/bin/env node
// Database Inspector for Cursor Development
// Quick view of your Supabase data

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('🔍 Database Inspector');
console.log('===================');

async function inspectDatabase() {
  try {
    // 1. Check influencer_data table
    console.log('\n📊 Influencer Data (Latest 5):');
    const { data: influencers, error: influencerError } = await supabase
      .from('influencer_data')
      .select('tt_username, full_name, followers, following, updated_at')
      .order('updated_at', { ascending: false })
      .limit(5);

    if (influencerError) {
      console.error('❌ Error:', influencerError.message);
    } else {
      console.table(influencers);
    }

    // 2. Check video data count
    console.log('\n🎬 Video Data Count:');
    const { count: videoCount, error: videoError } = await supabase
      .from('tiktok_video_data')
      .select('*', { count: 'exact', head: true });

    if (videoError) {
      console.error('❌ Error:', videoError.message);
    } else {
      console.log(`   Total videos: ${videoCount}`);
    }

    // 3. Check campaigns
    console.log('\n📋 Campaigns:');
    const { data: campaigns, error: campaignError } = await supabase
      .from('campaigns')
      .select('campaign_name, created_at')
      .order('created_at', { ascending: false })
      .limit(3);

    if (campaignError) {
      console.error('❌ Error:', campaignError.message);
    } else if (campaigns && campaigns.length > 0) {
      console.table(campaigns);
    } else {
      console.log('   No campaigns found');
    }

    // 4. Database stats
    console.log('\n📈 Quick Stats:');
    const { count: influencerCount } = await supabase
      .from('influencer_data')
      .select('*', { count: 'exact', head: true });

    console.log(`   Total influencers: ${influencerCount || 0}`);
    console.log(`   Total videos: ${videoCount || 0}`);

  } catch (err) {
    console.error('❌ Database inspection failed:', err.message);
  }
}

inspectDatabase();
