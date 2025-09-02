// api/downloadAndStoreImage.js

import fs from 'fs';
import path from 'path';
import { createHash } from 'crypto';

/**
 * Downloads an image from TikTok CDN and stores it locally
 * Returns a local URL that can be served by our static file server
 * @param {string} tikTokImageUrl - Original TikTok CDN URL
 * @param {string} username - TikTok username for filename
 * @returns {Promise<string|null>} Local image URL or null if failed
 */
export async function downloadAndStoreImage(tikTokImageUrl, username) {
  if (!tikTokImageUrl || !username) {
    console.warn('⚠️ Missing imageUrl or username for image download');
    return null;
  }

  try {
    // Create avatars directory if it doesn't exist
    const avatarsDir = path.join(process.cwd(), 'client', 'public', 'avatars');
    if (!fs.existsSync(avatarsDir)) {
      fs.mkdirSync(avatarsDir, { recursive: true });
      console.log('📁 Created avatars directory');
    }

    // Generate filename: username + hash of URL for uniqueness
    const urlHash = createHash('md5').update(tikTokImageUrl).digest('hex').substring(0, 8);
    const filename = `${username.toLowerCase()}_${urlHash}.jpg`;
    const localPath = path.join(avatarsDir, filename);
    const publicUrl = `/avatars/${filename}`;

    // Check if file already exists
    if (fs.existsSync(localPath)) {
      console.log(`✅ Image already cached: ${publicUrl}`);
      return publicUrl;
    }

    console.log(`📥 Downloading image for ${username}...`);

    // Download the image
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

    // Save to local file
    fs.writeFileSync(localPath, buffer);
    
    console.log(`✅ Image saved: ${publicUrl} (${Math.round(buffer.length / 1024)}KB)`);
    return publicUrl;

  } catch (error) {
    console.error(`❌ Error downloading image for ${username}:`, error.message);
    return null;
  }
}

/**
 * Clean up old cached images (optional maintenance function)
 * @param {number} maxAgeHours - Delete files older than this many hours
 */
export function cleanupOldImages(maxAgeHours = 24 * 7) { // Default: 1 week
  try {
    const avatarsDir = path.join(process.cwd(), 'client', 'public', 'avatars');
    if (!fs.existsSync(avatarsDir)) return;

    const files = fs.readdirSync(avatarsDir);
    const cutoffTime = Date.now() - (maxAgeHours * 60 * 60 * 1000);
    let deletedCount = 0;

    files.forEach(file => {
      const filePath = path.join(avatarsDir, file);
      const stats = fs.statSync(filePath);
      
      if (stats.mtime.getTime() < cutoffTime) {
        fs.unlinkSync(filePath);
        deletedCount++;
      }
    });

    if (deletedCount > 0) {
      console.log(`🧹 Cleaned up ${deletedCount} old avatar images`);
    }
  } catch (error) {
    console.error('❌ Error cleaning up old images:', error.message);
  }
}
