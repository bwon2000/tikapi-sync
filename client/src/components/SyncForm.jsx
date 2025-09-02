// src/components/SyncForm.jsx

import { useState } from 'react';

function SyncForm({ onSuccess, variant = 'inline' }) {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Use environment-based API URL for production compatibility
      const API_URL = process.env.NODE_ENV === 'production' 
        ? process.env.REACT_APP_API_URL || window.location.origin
        : 'http://localhost:3001';
      
      const response = await fetch(`${API_URL}/sync-influencer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('✅ Sync success:', data);
        onSuccess({ username: username.trim() });
        setUsername('');
      } else {
        console.error('❌ Sync failed:', data.message);
        setError(data.message || 'Failed to sync influencer');
      }
    } catch (error) {
      console.error('❌ Error syncing influencer:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (variant === 'card') {
    return (
      <div className="card p-6 max-w-md mx-auto">
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Add Influencer</h3>
          <p className="text-sm text-gray-600">Sync a new TikTok influencer to your portfolio</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              TikTok Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 text-sm">@</span>
              </div>
              <input
                id="username"
                type="text"
                className={`input-field pl-8 ${error ? 'border-error-300 ring-error-500' : ''}`}
                placeholder="username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError('');
                }}
                disabled={loading}
              />
            </div>
            {error && (
              <p className="mt-2 text-sm text-error-600 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={loading || !username.trim()}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="loading-spinner mr-2" />
                Syncing...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Sync Influencer
              </div>
            )}
          </button>
        </form>
      </div>
    );
  }

  // Inline variant (default)
  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 items-start">
      <div className="flex-1 min-w-0">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400 text-sm">@</span>
          </div>
          <input
            type="text"
            className={`input-field pl-8 min-w-[200px] ${error ? 'border-error-300 ring-error-500' : ''}`}
            placeholder="TikTok username"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setError('');
            }}
            disabled={loading}
          />
        </div>
        {error && (
          <p className="mt-1 text-xs text-error-600">{error}</p>
        )}
      </div>
      
      <button
        type="submit"
        className="btn-primary shrink-0"
        disabled={loading || !username.trim()}
      >
        {loading ? (
          <div className="flex items-center">
            <div className="loading-spinner mr-2" />
            Syncing...
          </div>
        ) : (
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Influencer
          </div>
        )}
      </button>
    </form>
  );
}

export default SyncForm;