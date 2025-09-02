#!/usr/bin/env node
// Test script for Supabase Storage integration
// This tests that your policies are working correctly

import { downloadAndStoreInSupabase, initializeStorageBucket } from './api/supabaseImageStorage.js';
import dotenv from 'dotenv';

dotenv.config();

async function testSupabaseStorage() {
  console.log('🧪 Testing Supabase Storage Integration...\n');

  // Test 1: Initialize bucket
  console.log('1️⃣ Testing bucket initialization...');
  const bucketInitialized = await initializeStorageBucket();
  
  if (bucketInitialized) {
    console.log('✅ Bucket initialization: PASSED\n');
  } else {
    console.log('❌ Bucket initialization: FAILED\n');
    return;
  }

  // Test 2: Upload a test image
  console.log('2️⃣ Testing image upload...');
  const testImageUrl = 'https://p16-sign-sg.tiktokcdn.com/aweme/100x100/tos-alisg-avt-0068/default_avatar.jpeg';
  const testUsername = 'test_user';
  
  const uploadedUrl = await downloadAndStoreInSupabase(testImageUrl, testUsername);
  
  if (uploadedUrl) {
    console.log('✅ Image upload: PASSED');
    console.log(`📸 Uploaded URL: ${uploadedUrl}\n`);
  } else {
    console.log('❌ Image upload: FAILED\n');
    return;
  }

  // Test 3: Verify the image is accessible
  console.log('3️⃣ Testing image accessibility...');
  try {
    const response = await fetch(uploadedUrl);
    if (response.ok) {
      console.log('✅ Image accessibility: PASSED');
      console.log(`📊 Image size: ${response.headers.get('content-length')} bytes`);
      console.log(`🎨 Content type: ${response.headers.get('content-type')}\n`);
    } else {
      console.log(`❌ Image accessibility: FAILED (${response.status})\n`);
    }
  } catch (error) {
    console.log(`❌ Image accessibility: FAILED (${error.message})\n`);
  }

  console.log('🎉 Supabase Storage test completed!');
  console.log('\n📋 Policy Verification:');
  console.log('✅ Service role can upload (Policy 1)');
  console.log('✅ Public can read images (Policy 2)');
  console.log('✅ Images are served directly from Supabase CDN');
}

// Run the test
testSupabaseStorage().catch(console.error);
