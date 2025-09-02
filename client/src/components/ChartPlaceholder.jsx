// src/components/ChartPlaceholder.jsx

function ChartPlaceholder() {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Performance Analytics</h3>
        <button className="btn-ghost text-sm">
          View Details
        </button>
      </div>
      
      <div className="relative h-64 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">Analytics Coming Soon</h4>
          <p className="text-sm text-gray-600 max-w-sm">
            Comprehensive engagement metrics, follower growth trends, and performance insights will be available here.
          </p>
        </div>
        
        {/* Decorative chart elements */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 400 200">
            <path
              d="M0,160 Q100,120 200,140 T400,100"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
              className="text-primary-500"
            />
            <path
              d="M0,180 Q100,160 200,170 T400,140"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              className="text-secondary-400"
            />
          </svg>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100">
        <div className="text-center">
          <div className="text-lg font-bold text-gray-900">4.2%</div>
          <div className="text-xs text-gray-500">Avg Engagement</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-gray-900">2.1M</div>
          <div className="text-xs text-gray-500">Total Reach</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-gray-900">12.5K</div>
          <div className="text-xs text-gray-500">Avg Views</div>
        </div>
      </div>
    </div>
  );
}

export default ChartPlaceholder;