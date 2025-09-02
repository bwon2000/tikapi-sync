// api/proxyProfileImage.js

/**
 * Proxy endpoint to serve TikTok profile images
 * Bypasses CORS restrictions by fetching server-side
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export async function proxyProfileImage(req, res) {
  const { imageUrl } = req.query;

  if (!imageUrl) {
    return res.status(400).json({ 
      success: false, 
      error: 'imageUrl parameter is required' 
    });
  }

  try {
    // Validate that the URL is from TikTok CDN
    const url = new URL(imageUrl);
    if (!url.hostname.includes('tiktokcdn')) {
      return res.status(400).json({ 
        success: false, 
        error: 'Only TikTok CDN URLs are allowed' 
      });
    }

    console.log(`🖼️ Proxying image: ${imageUrl}`);

    // Fetch the image from TikTok CDN
    const response = await fetch(imageUrl);
    
    if (!response.ok) {
      console.error(`❌ Failed to fetch image: ${response.status} ${response.statusText}`);
      console.log('🔄 Redirecting to default avatar');
      return res.redirect('/default-avatar.png');
    }

    // Get the image buffer
    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    // Set appropriate headers
    res.set({
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      'Access-Control-Allow-Origin': '*',
    });

    // Send the image
    res.send(Buffer.from(imageBuffer));
    
  } catch (error) {
    console.error('❌ Error proxying image:', error.message);
    
    // Return default avatar on error
    res.redirect('/default-avatar.png');
  }
}
