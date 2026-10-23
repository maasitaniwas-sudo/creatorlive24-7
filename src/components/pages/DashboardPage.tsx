import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Radio, Monitor, Upload, Mail, Loader2 } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user, upcoming, history, setActiveTab } = useAuth();

  return (
    <div className="space-y-8 pb-16">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-white/10 to-transparent pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
              alt={user?.name || 'Creator'}
              className="w-16 h-16 rounded-2xl object-cover border-4 border-white/20 shadow-lg"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/30 text-purple-200 border border-purple-400/30">
                  Pro Creator
                </span>
                {user?.email ? (
                  <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/10 text-purple-100 border border-white/15">
                    <Mail className="w-3.5 h-3.5 text-purple-300" />
                    <span>{user.email}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center space-x-1 text-xs text-purple-200">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Loading email...</span>
                  </span>
                )}
                <span className="text-xs text-purple-300/80">ID: {user?.id}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black mt-1.5">
                Welcome back, {user?.name || user?.email?.split('@')[0] || 'Creator'}!
              </h1>
              <p className="text-purple-200 text-sm">Your 24/7 streaming pipeline is primed and ready.</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setActiveTab('stream_source')}
              className="px-6 py-3 rounded-xl font-bold bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30 flex items-center space-x-2 transition-transform hover:scale-105"
            >
              <Radio className="w-5 h-5" />
              <span>Go Live Now</span>
            </button>
            <button
              onClick={() => setActiveTab('stream_config')}
              className="px-6 py-3 rounded-xl font-bold bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 transition-all"
            >
              Stream Config
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
          <span>Quick Actions</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => setActiveTab('stream_source')}
            className="p-5 rounded-2xl bg-white border border-purple-100 shadow-md hover:shadow-xl hover:border-purple-300 transition-all text-center group flex flex-col items-center"
          >
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Radio className="w-6 h-6" />
            </div>
            <span className="font-bold text-gray-900 text-sm">Stream Camera</span>
            <span className="text-xs text-gray-500 mt-1">Webcam & Mic</span>
          </button>

          <button
            onClick={() => setActiveTab('stream_source')}
            className="p-5 rounded-2xl bg-white border border-purple-100 shadow-md hover:shadow-xl hover:border-purple-300 transition-all text-center group flex flex-col items-center"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Monitor className="w-6 h-6" />
            </div>
            <span className="font-bold text-gray-900 text-sm">Screen Broadcast</span>
            <span className="text-xs text-gray-500 mt-1">Share Screen/Tab</span>
          </button>

          <button
            onClick={() => setActiveTab('video_library')}
            className="p-5 rounded-2xl bg-white border border-purple-100 shadow-md hover:shadow-xl hover:border-purple-300 transition-all text-center group flex flex-col items-center"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Upload className="w-6 h-6" />
            </div>
            <span className="font-bold text-gray-900 text-sm">Upload Video</span>
            <span className="text-xs text-gray-500 mt-1">Loop & Playlist</span>
          </button>
        </div>
      </div>


      {/* Upcoming & History Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Streams */}
        <div className="bg-white rounded-3xl border border-purple-100 shadow-xl shadow-purple-50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Upcoming Streams</h3>
            <button
              onClick={() => setActiveTab('upcoming_streams')}
              className="text-sm font-semibold text-purple-600 hover:underline"
            >
              View All
            </button>
          </div>
          {upcoming.length === 0 ? (
            <p className="text-sm text-gray-500 py-8 text-center">No upcoming streams scheduled.</p>
          ) : (
            <div className="space-y-3">
              {upcoming.slice(0, 3).map((up) => (
                <div key={up.id} className="p-4 rounded-2xl bg-purple-50/30 border border-purple-100 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-gray-900">{up.title}</div>
                    <div className="text-xs text-gray-500 mt-1">{new Date(up.scheduledTime).toLocaleString()} • {up.destination}</div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                    {up.category}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stream History */}
        <div className="bg-white rounded-3xl border border-purple-100 shadow-xl shadow-purple-50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Recent Stream History</h3>
            <button
              onClick={() => setActiveTab('stream_history')}
              className="text-sm font-semibold text-purple-600 hover:underline"
            >
              View All
            </button>
          </div>
          {history.length === 0 ? (
            <p className="text-sm text-gray-500 py-8 text-center">No stream history recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {history.slice(0, 3).map((h) => (
                <div key={h.id} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-gray-900">{h.title}</div>
                    <div className="text-xs text-gray-500 mt-1">{h.startTime} • Duration: {h.duration}</div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                    {h.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
