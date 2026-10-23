import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Radio, Settings, Video, Calendar, History, PlaySquare, HelpCircle, Sliders, ShieldCheck } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, user } = useAuth();

  if (!user) return null;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'stream_source', label: 'Stream Source & Live', icon: Radio },
    { id: 'stream_config', label: 'Stream Configuration', icon: Sliders },
    { id: 'video_library', label: 'Video Library', icon: Video },
    { id: 'playlist_loop', label: 'Playlist & 24/7 Loop', icon: PlaySquare },
    { id: 'upcoming_streams', label: 'Upcoming Streams', icon: Calendar },
    { id: 'stream_history', label: 'Stream History', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'help_support', label: 'Help & Support', icon: HelpCircle },
  ];

  return (
    <aside className="w-64 bg-white border-r border-purple-100 hidden md:flex flex-col min-h-[calc(100vh-80px)] p-4 space-y-2 sticky top-20">
      <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-purple-600">
        Creator Menu
      </div>
      
      <nav className="space-y-1 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-200'
                  : 'text-gray-600 hover:bg-purple-50 hover:text-purple-600'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-900 to-indigo-900 text-white mt-auto shadow-lg relative overflow-hidden">
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-purple-500/20 rounded-full blur-xl"></div>
        <div className="flex items-center space-x-2 mb-2">
          <ShieldCheck className="w-5 h-5 text-purple-300" />
          <span className="font-bold text-xs uppercase tracking-wider">Cloud RTMP Engine</span>
        </div>
        <p className="text-xs text-purple-200 mb-3">24/7 Dual Stream Server Ready & Optimized.</p>
        <button
          onClick={() => setActiveTab('stream_config')}
          className="w-full py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-sm transition-colors border border-white/20"
        >
          Configure Servers
        </button>
      </div>
    </aside>
  );
};
