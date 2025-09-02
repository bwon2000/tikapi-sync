#!/usr/bin/env node
// Database Query Tool for Cursor Development
// Usage: node scripts/db-query.js "SELECT * FROM influencer_data LIMIT 5"

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const query = process.argv[2];

if (!query) {
  console.log('🔍 Database Query Tool');
  console.log('Usage: node scripts/db-query.js "YOUR_SQL_QUERY"');
  console.log('');
  console.log('✅ Safe Examples (SELECT queries):');
  console.log('  node scripts/db-query.js "SELECT * FROM influencer_data LIMIT 5"');
  console.log('  node scripts/db-query.js "SELECT tt_username, followers FROM influencer_data ORDER BY followers DESC"');
  console.log('  node scripts/db-query.js "SELECT COUNT(*) FROM tiktok_video_data"');
  console.log('');
  console.log('⚠️  SAFETY WARNING:');
  console.log('  - This tool can execute ANY SQL query');
  console.log('  - Be careful with DELETE, UPDATE, DROP, TRUNCATE');
  console.log('  - Always test with SELECT queries first');
  console.log('  - For data inspection only, use: npm run db:inspect');
  process.exit(1);
}

// Safety check for potentially destructive queries
const destructivePatterns = [
  /DELETE\s+FROM/i,
  /DROP\s+(TABLE|DATABASE|SCHEMA)/i,
  /TRUNCATE\s+TABLE/i,
  /UPDATE\s+\w+\s+SET.*(?!WHERE)/i, // UPDATE without WHERE
  /ALTER\s+TABLE/i,
  /CREATE\s+OR\s+REPLACE/i
];

const isDangerous = destructivePatterns.some(pattern => pattern.test(query));

if (isDangerous) {
  console.log('⚠️  DESTRUCTIVE QUERY DETECTED');
  console.log('Query:', query);
  console.log('');
  console.log('This appears to be a potentially destructive operation.');
  console.log('Please confirm you understand the risks:');
  console.log('');
  console.log('For safety, consider:');
  console.log('1. Testing on development data first');
  console.log('2. Creating a backup if this is production');
  console.log('3. Using SELECT to verify data before modification');
  console.log('');
  console.log('To proceed, add --force flag: node scripts/db-query.js "QUERY" --force');
  
  const hasForceFlag = process.argv.includes('--force');
  if (!hasForceFlag) {
    process.exit(1);
  } else {
    console.log('🚨 PROCEEDING WITH DESTRUCTIVE QUERY (--force flag detected)');
  }
}

console.log(`🔍 Executing: ${query}`);
console.log('');

try {
  // Use rpc for custom SQL queries
  const { data, error } = await supabase.rpc('execute_sql', { query_text: query });
  
  if (error) {
    console.error('❌ Query failed:', error.message);
    // Try direct table access for simple queries
    if (query.toLowerCase().includes('select') && query.toLowerCase().includes('influencer_data')) {
      console.log('🔄 Trying direct table access...');
      const { data: directData, error: directError } = await supabase
        .from('influencer_data')
        .select('*')
        .limit(10);
      
      if (directError) {
        console.error('❌ Direct query also failed:', directError.message);
      } else {
        console.log('✅ Results:');
        console.table(directData);
      }
    }
  } else {
    console.log('✅ Results:');
    console.table(data);
  }
} catch (err) {
  console.error('❌ Error:', err.message);
  
  // Fallback: Show available tables
  console.log('\n🔍 Available tables:');
  try {
    const { data: tables } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    if (tables) {
      tables.forEach(table => console.log(`  - ${table.table_name}`));
    }
  } catch (tableError) {
    console.log('  - influencer_data');
    console.log('  - tiktok_video_data');
    console.log('  - campaigns');
    console.log('  - campaign_influencers');
  }
}
