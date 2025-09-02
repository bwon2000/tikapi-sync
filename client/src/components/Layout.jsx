// src/components/Layout.jsx

import { Link, Outlet, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

function Layout() {
  const location = useLocation();
  // Simple sidebar state: mobile menu + hover mode toggle
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile menu
  const [isHoverMode, setIsHoverMode] = useState(false); // Default: always open
  const [isHovered, setIsHovered] = useState(false);

  // Load hover mode from localStorage
  useEffect(() => {
    const savedHoverMode = localStorage.getItem('sidebarHoverMode') === 'true';
    setIsHoverMode(savedHoverMode);
  }, []);

  // Toggle between always-open and hover-only modes
  const toggleHoverMode = () => {
    const newHoverMode = !isHoverMode;
    setIsHoverMode(newHoverMode);
    localStorage.setItem('sidebarHoverMode', newHoverMode.toString());
    setIsHovered(false); // Reset hover state
  };

  const navigation = [
    {
      name: 'Dashboard',
      href: '/',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v4H8V5z" />
        </svg>
      ),
    },
    {
      name: 'Campaigns',
      href: '/campaigns',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col bg-white shadow-xl transition-all duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isHoverMode && !isHovered ? 'w-16' : 'w-72'}
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-primary flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            {(!isHoverMode || isHovered) && (
              <h1 className="text-lg font-heading font-semibold text-gray-900 truncate">
                Influence<span className="text-gradient">Hub</span>
              </h1>
            )}
          </div>
          
          {/* Desktop sidebar controls */}
          <div className="hidden lg:flex items-center space-x-1">
            {/* Show controls when not in hover mode, or when in hover mode and hovered */}
            {(!isHoverMode || isHovered) && (
              <button
                onClick={toggleHoverMode}
                className={`p-1.5 rounded-lg transition-colors ${
                  isHoverMode 
                    ? 'text-primary-600 bg-primary-50 hover:bg-primary-100' 
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
                title={isHoverMode ? 'Switch to always open' : 'Switch to hover mode'}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isHoverMode ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  )}
                </svg>
              </button>
            )}
          </div>
          
          {/* Mobile close button */}
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6">
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    flex items-center transition-all duration-200 rounded-xl
                    ${isActive 
                      ? 'text-primary-600 bg-primary-50' 
                      : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
                    }
                    ${isHoverMode && !isHovered 
                      ? 'px-3 py-3 justify-center' 
                      : 'px-3 py-2.5'
                    }
                  `}
                  onClick={() => setIsSidebarOpen(false)}
                  title={isHoverMode && !isHovered ? item.name : ''}
                >
                  <div className="flex-shrink-0">
                    {item.icon}
                  </div>
                  {(!isHoverMode || isHovered) && (
                    <>
                      <span className="ml-3 text-sm font-medium truncate">{item.name}</span>
                      {isActive && (
                        <div className="ml-auto w-1.5 h-1.5 bg-primary-600 rounded-full flex-shrink-0" />
                      )}
                    </>
                  )}
                </Link>
              );
            })}
          </div>

          {/* User section */}
          <div className="mt-auto pt-6 border-t border-gray-200">
            <div className={`
              flex items-center rounded-xl bg-gray-50 transition-all duration-200
              ${isHoverMode && !isHovered 
                ? 'p-2 justify-center' 
                : 'p-3 space-x-3'
              }
            `}>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 flex-shrink-0">
                <span className="text-sm font-medium text-primary-600">U</span>
              </div>
              {(!isHoverMode || isHovered) && (
                <>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">User</p>
                    <p className="text-xs text-gray-500">Admin</p>
                  </div>
                  <button className="p-1 rounded-lg text-gray-400 hover:text-gray-600 flex-shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                </>
              )}
            </div>
          </div>
        </nav>
      </aside>

      {/* Main content */}
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${
        isHoverMode && !isHovered ? 'lg:ml-16' : 'lg:ml-72'
      }`}>
        {/* Top header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Mobile menu button */}
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              {/* Search bar */}
              <div className="hidden md:block">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search influencers..."
                    className="block w-80 pl-10 pr-4 py-2 text-sm text-gray-900 placeholder-gray-500 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            </div>

            {/* Right side actions */}
            <div className="flex items-center space-x-3">
              <button className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM3 3h18v12H3V3z" />
                </svg>
              </button>
              <button className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 relative">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
                </svg>
                <div className="absolute -top-1 -right-1 h-3 w-3 bg-error-500 rounded-full" />
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6 lg:p-8">
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default Layout;
