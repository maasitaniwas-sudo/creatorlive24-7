import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Radio, User as UserIcon, LogOut, Settings, HelpCircle, Video, Calendar, History, PlaySquare, Menu, X } from 'lucide-react';

export const Navbar: React.FC<{ onToggleSidebar?: () => void }> = () => {
  const { user, activeTab, setActiveTab, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-purple-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <div 
          className="flex items-center space-x-3 cursor-pointer group"
          onClick={() => setActiveTab(user ? 'dashboard' : 'landing')}
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-md shadow-purple-200 group-hover:scale-105 transition-transform">
            <Radio className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-gray-900">
                CreatorLive<span className="text-purple-600">24/7</span>
              </span>
              <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-600 border border-red-200 items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping mr-1"></span>
                LIVE
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium hidden sm:block">Your Content. Always On.</p>
          </div>
        </div>

        {/* Desktop Nav for Unauthenticated */}
        {!user ? (
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={() => setActiveTab('landing')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                activeTab === 'landing' ? 'text-purple-600 bg-purple-50' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('login')}
              className="px-4 py-2 rounded-lg font-medium text-sm text-gray-700 hover:text-purple-600 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => setActiveTab('signup')}
              className="px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-200 transition-all hover:scale-105"
            >
              Get Started Free
            </button>
          </div>
        ) : (
          /* User Nav */
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={() => setActiveTab('stream_source')}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 shadow-md shadow-red-200 transition-all"
            >
              <Radio className="w-4 h-4" />
              <span>Go Live Now</span>
            </button>

            <div className="h-6 w-px bg-gray-200 mx-1"></div>

            <div className="flex items-center space-x-3">
              <img
                src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                alt={user.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-purple-500 shadow-sm"
              />
              <div className="hidden lg:block text-left">
                <div className="text-sm font-bold text-gray-800">{user.name}</div>
                <div className="text-xs text-gray-500 truncate max-w-[120px]">{user.email}</div>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('settings')}
              className="p-2 rounded-xl text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-colors"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>

            <button
              onClick={logout}
              className="p-2 rounded-xl text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-gray-700 hover:bg-gray-100"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 px-4 pt-2 pb-6 space-y-2 shadow-xl">
          {!user ? (
            <>
              <button
                onClick={() => { setActiveTab('landing'); setMobileMenuOpen(false); }}
                className="block w-full text-left px-4 py-2.5 rounded-lg text-gray-700 hover:bg-purple-50 font-medium"
              >
                Overview
              </button>
              <button
                onClick={() => { setActiveTab('login'); setMobileMenuOpen(false); }}
                className="block w-full text-left px-4 py-2.5 rounded-lg text-gray-700 hover:bg-purple-50 font-medium"
              >
                Sign In
              </button>
              <button
                onClick={() => { setActiveTab('signup'); setMobileMenuOpen(false); }}
                className="block w-full text-center px-4 py-3 rounded-xl text-white bg-gradient-to-r from-purple-600 to-indigo-600 font-semibold shadow-md"
              >
                Get Started Free
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center space-x-3 px-4 py-3 bg-purple-50 rounded-xl mb-2">
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-purple-500"
                />
                <div>
                  <div className="text-sm font-bold text-gray-900">{user.name}</div>
                  <div className="text-xs text-gray-500">{user.email}</div>
                </div>
              </div>

              <button
                onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}
                className="flex items-center space-x-3 w-full px-4 py-2.5 rounded-lg text-gray-700 hover:bg-purple-50 font-medium"
              >
                <Radio className="w-5 h-5 text-purple-600" />
                <span>Dashboard</span>
              </button>
              <button
                onClick={() => { setActiveTab('stream_source'); setMobileMenuOpen(false); }}
                className="flex items-center space-x-3 w-full px-4 py-2.5 rounded-lg text-gray-700 hover:bg-purple-50 font-medium"
              >
                <Video className="w-5 h-5 text-purple-600" />
                <span>Stream Source & Live</span>
              </button>
              <button
                onClick={() => { setActiveTab('video_library'); setMobileMenuOpen(false); }}
                className="flex items-center space-x-3 w-full px-4 py-2.5 rounded-lg text-gray-700 hover:bg-purple-50 font-medium"
              >
                <PlaySquare className="w-5 h-5 text-purple-600" />
                <span>Video Library & Loop</span>
              </button>
              <button
                onClick={() => { setActiveTab('upcoming_streams'); setMobileMenuOpen(false); }}
                className="flex items-center space-x-3 w-full px-4 py-2.5 rounded-lg text-gray-700 hover:bg-purple-50 font-medium"
              >
                <Calendar className="w-5 h-5 text-purple-600" />
                <span>Upcoming Streams</span>
              </button>
              <button
                onClick={() => { setActiveTab('stream_history'); setMobileMenuOpen(false); }}
                className="flex items-center space-x-3 w-full px-4 py-2.5 rounded-lg text-gray-700 hover:bg-purple-50 font-medium"
              >
                <History className="w-5 h-5 text-purple-600" />
                <span>Stream History</span>
              </button>
              <button
                onClick={() => { setActiveTab('settings'); setMobileMenuOpen(false); }}
                className="flex items-center space-x-3 w-full px-4 py-2.5 rounded-lg text-gray-700 hover:bg-purple-50 font-medium"
              >
                <Settings className="w-5 h-5 text-purple-600" />
                <span>Settings</span>
              </button>
              <button
                onClick={() => { setActiveTab('help_support'); setMobileMenuOpen(false); }}
                className="flex items-center space-x-3 w-full px-4 py-2.5 rounded-lg text-gray-700 hover:bg-purple-50 font-medium"
              >
                <HelpCircle className="w-5 h-5 text-purple-600" />
                <span>Help & Support</span>
              </button>

              <button
                onClick={() => { logout(); setMobileMenuOpen(false); }}
                className="flex items-center space-x-3 w-full px-4 py-2.5 rounded-lg text-red-600 hover:bg-red-50 font-medium mt-2 border-t border-gray-100"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
};
