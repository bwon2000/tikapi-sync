// src/pages/Dashboard.jsx

import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import SyncForm from '../components/SyncForm';
import InfluencerCard from '../components/InfluencerCard';
import ChartPlaceholder from '../components/ChartPlaceholder';
import InfluencerModal from '../components/InfluencerModal';

function Dashboard() {
  const [influencers, setInfluencers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInfluencer, setSelectedInfluencer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, mega, macro, mid, micro
  const [sortBy, setSortBy] = useState('recent'); // recent, followers, engagement

  useEffect(() => {
    fetchInfluencers();
  }, []);

  async function fetchInfluencers() {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('influencer_data')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching influencers:', error);
    } else {
      setInfluencers(data);
    }
    setIsLoading(false);
  }

  const handleSyncSuccess = (newInfluencer) => {
    setInfluencers((prev) => [newInfluencer, ...prev]);
  };

  // Calculate stats
  const totalFollowers = influencers.reduce((sum, inf) => sum + (inf.followers || 0), 0);
  const avgEngagement = influencers.length > 0 
    ? influencers.reduce((sum, inf) => sum + (inf.engagement_rate || 0), 0) / influencers.length 
    : 0;

  // Filter and sort influencers
  let filtered = influencers.filter((inf) =>
    inf.tt_username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inf.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Apply tier filter
  if (filter !== 'all') {
    filtered = filtered.filter((inf) => {
      const followers = inf.followers || 0;
      switch (filter) {
        case 'mega': return followers >= 1_000_000;
        case 'macro': return followers >= 100_000 && followers < 1_000_000;
        case 'mid': return followers >= 10_000 && followers < 100_000;
        case 'micro': return followers < 10_000;
        default: return true;
      }
    });
  }

  // Apply sorting
  filtered.sort((a, b) => {
    switch (sortBy) {
      case 'followers':
        return (b.followers || 0) - (a.followers || 0);
      case 'engagement':
        return (b.engagement_rate || 0) - (a.engagement_rate || 0);
      case 'recent':
      default:
        return new Date(b.updated_at || 0) - new Date(a.updated_at || 0);
    }
  });

  const formatNumber = (num) => {
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
    if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
    return num?.toString() || '0';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-heading font-bold text-gray-900 mb-2">
          Dashboard
        </h1>
        <p className="text-lg text-gray-600">
          Manage your influencer portfolio and track performance
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Influencers</p>
              <p className="text-3xl font-bold text-gray-900">{influencers.length}</p>
            </div>
            <div className="h-12 w-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <svg className="h-6 w-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-success-600 font-medium">+12%</span>
            <span className="text-gray-600 ml-1">vs last month</span>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Reach</p>
              <p className="text-3xl font-bold text-gray-900">{formatNumber(totalFollowers)}</p>
            </div>
            <div className="h-12 w-12 bg-secondary-100 rounded-xl flex items-center justify-center">
              <svg className="h-6 w-6 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-success-600 font-medium">+8.2%</span>
            <span className="text-gray-600 ml-1">vs last month</span>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Avg Engagement</p>
              <p className="text-3xl font-bold text-gray-900">{(avgEngagement * 100).toFixed(1)}%</p>
            </div>
            <div className="h-12 w-12 bg-success-100 rounded-xl flex items-center justify-center">
              <svg className="h-6 w-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-success-600 font-medium">+2.4%</span>
            <span className="text-gray-600 ml-1">vs last month</span>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Active Campaigns</p>
              <p className="text-3xl font-bold text-gray-900">7</p>
            </div>
            <div className="h-12 w-12 bg-warning-100 rounded-xl flex items-center justify-center">
              <svg className="h-6 w-6 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-warning-600 font-medium">3 ending soon</span>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="card p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search influencers..."
                className="input-field pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filters */}
            <div className="flex gap-3">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="input-field min-w-[120px]"
              >
                <option value="all">All Tiers</option>
                <option value="mega">Mega (1M+)</option>
                <option value="macro">Macro (100K+)</option>
                <option value="mid">Mid (10K+)</option>
                <option value="micro">Micro (&lt;10K)</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input-field min-w-[120px]"
              >
                <option value="recent">Recent</option>
                <option value="followers">Followers</option>
                <option value="engagement">Engagement</option>
              </select>
            </div>
          </div>

          <SyncForm onSuccess={handleSyncSuccess} />
        </div>
      </div>

      {/* Influencers Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            Influencers {filtered.length > 0 && `(${filtered.length})`}
          </h2>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card p-6 animate-pulse">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-2xl" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-2/3" />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-3 bg-gray-200 rounded" />
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No influencers found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery ? 'Try adjusting your search or filters.' : 'Get started by syncing your first influencer.'}
            </p>
            {!searchQuery && <SyncForm onSuccess={handleSyncSuccess} />}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filtered.map((inf) => (
              <div
                key={inf.influencer_uuid}
                onClick={() => setSelectedInfluencer(inf)}
                className="animate-fade-in"
              >
                <InfluencerCard influencer={inf} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartPlaceholder />
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {influencers.slice(0, 5).map((inf) => (
              <div key={inf.influencer_uuid} className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {inf.profilepicture ? (
                    <img
                      src={inf.profilepicture.includes('supabase.co/storage/') ? inf.profilepicture : inf.profilepicture}
                      alt={inf.full_name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = (inf.full_name?.[0] || inf.tt_username?.[0] || '?').toUpperCase();
                      }}
                    />
                  ) : (
                    (inf.full_name?.[0] || inf.tt_username?.[0] || '?').toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {inf.full_name || inf.tt_username}
                  </p>
                  <p className="text-xs text-gray-500">
                    Synced {inf.updated_at ? new Date(inf.updated_at).toLocaleDateString() : 'recently'}
                  </p>
                </div>
                <span className="badge-success">Active</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Influencer Modal */}
      <InfluencerModal
        influencer={selectedInfluencer}
        onClose={() => setSelectedInfluencer(null)}
      />
    </div>
  );
}

export default Dashboard;
