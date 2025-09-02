// api/supabaseImageStorage.js

import { createClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Downloads an image from TikTok CDN and stores it in Supabase Storage
 * Returns a public URL that can be accessed directly
 * @param {string} tikTokImageUrl - Original TikTok CDN URL
 * @param {string} username - TikTok username for filename
 * @returns {Promise<string|null>} Supabase Storage public URL or null if failed
 */
export async function downloadAndStoreInSupabase(tikTokImageUrl, username) {
  if (!tikTokImageUrl || !username) {
    console.warn('⚠️ Missing imageUrl or username for image download');
    return null;
  }

  try {
    // Generate filename: username + hash of URL for uniqueness
    const urlHash = createHash('md5').update(tikTokImageUrl).digest('hex').substring(0, 8);
    const filename = `${username.toLowerCase()}_${urlHash}.jpg`;
    const storagePath = `avatars/${filename}`;

    // Check if file already exists in Supabase Storage
    const { data: existingFile } = await supabase.storage
      .from('profile-images')
      .list('avatars', {
        search: filename
      });

    if (existingFile && existingFile.length > 0) {
      const { data: publicUrlData } = supabase.storage
        .from('profile-images')
        .getPublicUrl(storagePath);
      
      console.log(`✅ Image already exists in Supabase: ${publicUrlData.publicUrl}`);
      return publicUrlData.publicUrl;
    }

    console.log(`📥 Downloading image for ${username}...`);

    // Download the image from TikTok CDN
    const response = await fetch(tikTokImageUrl);
    
    if (!response.ok) {
      console.error(`❌ Failed to download image: ${response.status} ${response.statusText}`);
      return null;
    }

    // Get image buffer
    const imageBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(imageBuffer);

    // Validate it's actually an image (basic check)
    if (buffer.length < 100) {
      console.error('❌ Downloaded file too small, likely not an image');
      return null;
    }

    console.log(`☁️ Uploading to Supabase Storage: ${storagePath}`);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('profile-images')
      .upload(storagePath, buffer, {
        contentType: 'image/jpeg',
        cacheControl: '3600', // Cache for 1 hour
        upsert: true // Overwrite if exists
      });

    if (uploadError) {
      console.error(`❌ Failed to upload to Supabase Storage:`, uploadError);
      return null;
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('profile-images')
      .getPublicUrl(storagePath);

    console.log(`✅ Image uploaded to Supabase: ${publicUrlData.publicUrl} (${Math.round(buffer.length / 1024)}KB)`);
    return publicUrlData.publicUrl;

  } catch (error) {
    console.error(`❌ Error uploading image for ${username}:`, error.message);
    return null;
  }
}

/**
 * Initialize Supabase Storage bucket (run once)
 * Creates the 'profile-images' bucket if it doesn't exist
 */
export async function initializeStorageBucket() {
  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Error listing buckets:', listError);
      return false;
    }

    const bucketExists = buckets.some(bucket => bucket.name === 'profile-images');

    if (!bucketExists) {
      console.log('📦 Creating profile-images bucket...');
      
      // Create bucket
      const { data: createData, error: createError } = await supabase.storage.createBucket('profile-images', {
        public: true, // Make bucket public so images can be accessed directly
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        fileSizeLimit: 1048576 // 1MB limit (recommended for profile pictures)
      });

      if (createError) {
        console.error('❌ Error creating bucket:', createError);
        return false;
      }

      console.log('✅ Profile-images bucket created successfully');
    } else {
      console.log('✅ Profile-images bucket already exists');
    }

    return true;
  } catch (error) {
    console.error('❌ Error initializing storage bucket:', error.message);
    return false;
  }
}

/**
 * Clean up old images from Supabase Storage (optional maintenance function)
 * @param {number} maxAgeHours - Delete files older than this many hours
 */
export async function cleanupOldImagesFromSupabase(maxAgeHours = 24 * 7) { // Default: 1 week
  try {
    const { data: files, error } = await supabase.storage
      .from('profile-images')
      .list('avatars');

    if (error) {
      console.error('❌ Error listing files for cleanup:', error);
      return;
    }

    const cutoffTime = new Date(Date.now() - (maxAgeHours * 60 * 60 * 1000));
    const filesToDelete = [];

    files.forEach(file => {
      const fileDate = new Date(file.updated_at);
      if (fileDate < cutoffTime) {
        filesToDelete.push(`avatars/${file.name}`);
      }
    });

    if (filesToDelete.length > 0) {
      const { error: deleteError } = await supabase.storage
        .from('profile-images')
        .remove(filesToDelete);

      if (deleteError) {
        console.error('❌ Error deleting old files:', deleteError);
      } else {
        console.log(`🧹 Cleaned up ${filesToDelete.length} old avatar images from Supabase`);
      }
    }
  } catch (error) {
    console.error('❌ Error cleaning up old images:', error.message);
  }
}
