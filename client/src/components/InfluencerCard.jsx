// src/components/InfluencerCard.jsx

import { useState, useEffect } from 'react';

function formatNumber(num) {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
  return num?.toString() || '0';
}

function getNicheColor(niche) {
  const colors = {
    'Beauty': 'bg-pink-100 text-pink-700',
    'Fashion': 'bg-purple-100 text-purple-700',
    'Lifestyle': 'bg-blue-100 text-blue-700',
    'Fitness': 'bg-green-100 text-green-700',
    'Tech': 'bg-gray-100 text-gray-700',
    'Food': 'bg-orange-100 text-orange-700',
    'Gaming': 'bg-indigo-100 text-indigo-700',
  };
  return colors[niche] || 'bg-gray-100 text-gray-700';
}

function getFollowerTier(followers) {
  if (followers >= 1_000_000) return { tier: 'Mega', color: 'text-purple-600 bg-purple-50' };
  if (followers >= 100_000) return { tier: 'Macro', color: 'text-blue-600 bg-blue-50' };
  if (followers >= 10_000) return { tier: 'Mid', color: 'text-green-600 bg-green-50' };
  return { tier: 'Micro', color: 'text-gray-600 bg-gray-50' };
}

function InfluencerCard({ influencer }) {
  const followerTier = getFollowerTier(influencer.followers || 0);
  const [imageError, setImageError] = useState(false);
  
  // Reset image error when influencer changes
  useEffect(() => {
    setImageError(false);
  }, [influencer.profilepicture]);
  
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
    <div className="card-hover group cursor-pointer overflow-hidden">
      {/* Header Section */}
      <div className="relative">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-400/10 to-secondary-400/10" />
        
        <div className="relative p-6 pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                {influencer.profilepicture && !imageError ? (
                  <img
                    src={getProfileImageUrl(influencer.profilepicture)}
                    alt={influencer.full_name || influencer.tt_username || 'Unknown user'}
                    onError={handleImageError}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                    {getInitials()}
                  </div>
                )}
                {/* Online indicator */}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-success-500 border-2 border-white rounded-full" />
              </div>
              
              <div className="min-w-0">
                <h3 className="text-base font-semibold text-gray-900 truncate group-hover:text-primary-600 transition-colors">
                  {influencer.full_name || 'Unknown Name'}
                </h3>
                <p className="text-sm text-gray-500 truncate">
                  @{influencer.tt_username || 'Unknown'}
                </p>
                {influencer.niche && (
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${getNicheColor(influencer.niche)}`}>
                    {influencer.niche}
                  </span>
                )}
              </div>
            </div>
            
            {/* Follower tier badge - positioned absolutely to avoid layout conflicts */}
            <div className={`absolute top-4 right-4 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${followerTier.color}`}>
              {followerTier.tier}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="px-6 pb-6">
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
          <div className="text-center min-w-0">
            <div className="text-sm sm:text-base font-bold text-gray-900 truncate">
              {formatNumber(influencer.followers)}
            </div>
            <div className="text-xs text-gray-500 uppercase tracking-wide truncate">
              Followers
            </div>
          </div>
          <div className="text-center min-w-0">
            <div className="text-sm sm:text-base font-bold text-gray-900 truncate">
              {formatNumber(influencer.following)}
            </div>
            <div className="text-xs text-gray-500 uppercase tracking-wide truncate">
              Following
            </div>
          </div>
          <div className="text-center min-w-0">
            <div className="text-sm sm:text-base font-bold text-gray-900 truncate">
              {formatNumber(influencer.account_likes)}
            </div>
            <div className="text-xs text-gray-500 uppercase tracking-wide truncate">
              Likes
            </div>
          </div>
        </div>

        {/* Engagement metrics */}
        {influencer.avg_views && (
          <div className="flex items-center justify-between text-sm mb-3">
            <span className="text-gray-600">Avg. Views</span>
            <span className="font-medium text-gray-900">{formatNumber(influencer.avg_views)}</span>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-3">
            {influencer.tt_url && (
              <a
                href={influencer.tt_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm text-gray-600 hover:text-primary-600 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-.88-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43V7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.43z"/>
                </svg>
                TikTok
              </a>
            )}
            
            {influencer.email && (
              <button
                className="inline-flex items-center text-sm text-gray-600 hover:text-primary-600 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email
              </button>
            )}
          </div>

          <div className="text-xs text-gray-400">
            {influencer.updated_at ? (
              <>Updated {new Date(influencer.updated_at).toLocaleDateString()}</>
            ) : (
              'No sync data'
            )}
          </div>
        </div>
      </div>

      {/* Hover overlay effect */}
      <div className="absolute inset-0 bg-primary-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none" />
    </div>
  );
}

export default InfluencerCard;