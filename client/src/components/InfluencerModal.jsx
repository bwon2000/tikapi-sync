import React, { useState, useEffect } from 'react';

function formatNumber(num) {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
  return num?.toString() || '0';
}

function InfluencerModal({ influencer, onClose }) {
  const [imageError, setImageError] = useState(false);
  
  // Reset image error when influencer changes
  useEffect(() => {
    setImageError(false);
  }, [influencer?.profilepicture]);
  
  if (!influencer) return null;

  const handleImageError = () => {
    setImageError(true);
  };
  
  const getInitials = () => {
    const name = influencer.full_name || influencer.tt_username || '?';
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  // Get profile image URL (supports Supabase Storage, local, and TikTok URLs)
  const getProfileImageUrl = (profilePicture) => {
    if (!profilePicture) return '/default-avatar.png';
    
    // If it's a Supabase Storage URL, use it directly
    if (profilePicture.includes('supabase.co/storage/')) {
      return profilePicture;
    }
    
    // If it's a local URL (starts with /avatars/), use it directly
    if (profilePicture.startsWith('/avatars/')) {
      return profilePicture;
    }
    
    // If it's a TikTok URL, use the proxy (fallback for old data)
    if (profilePicture.includes('tiktokcdn')) {
      const apiUrl = process.env.NODE_ENV === 'production' 
        ? process.env.REACT_APP_API_URL || '' 
        : 'http://localhost:3001';
      return `${apiUrl}/api/proxy-image?imageUrl=${encodeURIComponent(profilePicture)}`;
    }
    
    // Default fallback
    return '/default-avatar.png';
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="card max-w-2xl w-full relative animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors z-10"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header Section */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-400/10 to-secondary-400/10 rounded-t-2xl" />
          <div className="relative p-8 pb-6">
            <div className="flex items-start space-x-6">
              <div className="relative">
                {influencer.profilepicture && !imageError ? (
                  <img
                    src={getProfileImageUrl(influencer.profilepicture)}
                    alt="Profile"
                    onError={handleImageError}
                    className="w-24 h-24 rounded-2xl object-cover border-2 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    {getInitials()}
                  </div>
                )}
                <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-success-500 border-2 border-white rounded-full" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  {influencer.full_name || 'Unknown Name'}
                </h2>
                <p className="text-lg text-gray-600 mb-3">@{influencer.tt_username}</p>
                
                {influencer.tt_url && (
                  <a 
                    href={influencer.tt_url} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-.88-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43V7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.43z"/>
                    </svg>
                    View TikTok Profile
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="px-8 pb-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {formatNumber(influencer.followers)}
              </div>
              <div className="text-sm text-gray-500 uppercase tracking-wide">Followers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {formatNumber(influencer.following)}
              </div>
              <div className="text-sm text-gray-500 uppercase tracking-wide">Following</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {formatNumber(influencer.account_likes)}
              </div>
              <div className="text-sm text-gray-500 uppercase tracking-wide">Likes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {influencer.engagement_rate ? `${(influencer.engagement_rate * 100).toFixed(1)}%` : 'N/A'}
              </div>
              <div className="text-sm text-gray-500 uppercase tracking-wide">Engagement</div>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-6 border-t border-gray-200 text-sm text-gray-500">
            <span>
              Last synced: {influencer.updated_at ? new Date(influencer.updated_at).toLocaleDateString() : 'N/A'}
            </span>
            <span className="badge-success">Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InfluencerModal;
