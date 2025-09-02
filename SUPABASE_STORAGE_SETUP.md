# 🗄️ Supabase Storage Setup for Profile Images

## 🎯 Benefits of Supabase Storage

✅ **Cloud Storage** - Images stored in Supabase, not on your computer  
✅ **Global CDN** - Fast loading worldwide  
✅ **Automatic Backup** - Built-in redundancy and reliability  
✅ **Scalable** - Handles unlimited images  
✅ **Public URLs** - Direct access without proxy  
✅ **Image Optimization** - Automatic resizing and compression  

## 📋 Manual Setup Steps

### 1. Create Storage Bucket in Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **"Create a new bucket"**
4. Set these values:
   - **Name**: `profile-images`
   - **Public bucket**: ✅ **Enable** (so images can be accessed directly)
   - **File size limit**: `1 MB` (recommended) or `2 MB` (generous)
   - **Allowed MIME types**: `image/jpeg, image/png, image/webp`

### 2. Configure Storage Policies

You have two options for configuring access to your bucket:

#### Option A: Disable RLS (Recommended for simplicity)
1. In your bucket settings, toggle **"Enable RLS"** to **OFF**
2. This allows your service role to upload freely while keeping public read access

#### Option B: Create Custom Policies (Keep RLS enabled)
If you prefer to keep RLS enabled, create these policies:

1. **Go to Storage** → **Policies** in your Supabase Dashboard
2. **Click "New Policy"**
3. **Create these three policies:**

**Policy 1: Allow service role uploads**
```sql
CREATE POLICY "Allow service role uploads"
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'profile-images'
  AND auth.role() = 'service_role'
);
```

**Policy 2: Allow public read access**
```sql
CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT 
USING (
  bucket_id = 'profile-images'
);
```

**Policy 3: Allow service role updates (optional)**
```sql
CREATE POLICY "Allow service role updates"
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'profile-images'
  AND auth.role() = 'service_role'
)
WITH CHECK (
  bucket_id = 'profile-images'
  AND auth.role() = 'service_role'
);
```

### 3. Test the Setup

```bash
# Test with a new user sync
node internal/syncFromUsername.js someusername

# Migrate existing TikTok URLs to Supabase Storage
node internal/migrateToSupabaseStorage.js
```

## 🏗️ How It Works

### New Architecture
```
TikAPI Response → Download Image → Upload to Supabase Storage → Store Public URL
     ↓               ↓                      ↓                        ↓
user.avatarLarger → fetch() → supabase.storage.upload() → https://project.supabase.co/storage/...
```

### URL Format
```
https://yxeksrbkwqvnmbhrlakg.supabase.co/storage/v1/object/public/profile-images/avatars/username_hash.jpg
```

## 📊 Storage Comparison

| Storage Type | Location | Cost | Speed | Reliability | Scalability |
|-------------|----------|------|-------|-------------|-------------|
| **❌ Local Files** | Your computer | Free | Fast locally | Single point of failure | Limited by disk space |
| **✅ Supabase Storage** | Cloud CDN | ~$0.021/GB | Fast globally | High availability | Unlimited |
| **❌ TikTok URLs** | External CDN | Free | Fast but unreliable | Expires frequently | N/A |

## 🚀 Usage Examples

### Sync New User (Auto-uploads to Supabase)
```bash
node internal/syncFromUsername.js charlidamelio
# Output: ✅ Profile picture stored in Supabase: https://project.supabase.co/storage/...
```

### Migrate Existing Users
```bash
node internal/migrateToSupabaseStorage.js
# Converts all TikTok URLs to Supabase Storage URLs
```

### Frontend Usage (Automatic)
```javascript
// Component automatically detects Supabase URLs
<img src={getProfileImageUrl(influencer.profilepicture)} />

// Supports all URL types:
// ✅ https://project.supabase.co/storage/v1/object/public/profile-images/avatars/user.jpg
// ✅ /avatars/user.jpg (local fallback)
// ✅ https://tiktokcdn.com/... (proxy fallback)
```

## 🔧 Troubleshooting

### "Bucket not found" Error
- **Solution**: Create the `profile-images` bucket manually in Supabase Dashboard

### "Row-level security policy" Error
- **Solution**: Make sure the bucket is set to **Public** in the dashboard

### Images Not Loading
- **Check**: Bucket is public and URLs are accessible
- **Test**: Try opening a Supabase Storage URL directly in browser

### Storage Quota Exceeded
- **Monitor**: Check Storage usage in Supabase Dashboard
- **Solution**: Upgrade plan or clean up old images with `cleanupOldImagesFromSupabase()`

## 📈 Production Considerations

### Image Optimization
```javascript
// Future enhancement: Add image resizing
const optimizedUrl = `${supabaseUrl}/storage/v1/render/image/public/profile-images/avatars/user.jpg?width=200&height=200&quality=80`;
```

### Caching
- Supabase Storage includes automatic CDN caching
- Images are cached globally for fast loading
- Cache headers are automatically set

### Backup Strategy
- Supabase automatically backs up storage
- Consider periodic exports for critical data
- Monitor storage usage and costs

## 🎉 Expected Results

After setup, you'll see:
```bash
# New syncs
✅ Profile picture stored in Supabase: https://project.supabase.co/storage/v1/object/public/profile-images/avatars/username_hash.jpg

# Database will contain Supabase URLs instead of TikTok URLs
profilepicture: "https://yxeksrbkwqvnmbhrlakg.supabase.co/storage/v1/object/public/profile-images/avatars/charlidamelio_a1b2c3d4.jpg"

# Frontend loads images directly from Supabase CDN
<img src="https://project.supabase.co/storage/..." /> // Fast, reliable, never expires
```
