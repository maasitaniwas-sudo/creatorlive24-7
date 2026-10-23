import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Radio, Video, RefreshCw, DollarSign, ArrowRight, ShieldCheck, Zap, Users, CheckCircle2, Youtube, Facebook, Instagram, Tv } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { setActiveTab } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/50 via-white to-blue-50/30 text-gray-900">
      {/* Hero Banner Section */}
      <div className="relative overflow-hidden pt-12 pb-20">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-gradient-to-tr from-purple-400/10 via-blue-400/15 to-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-red-100 text-red-600 border border-red-200 text-xs font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
                <span>24/7 Live Streaming & Simulcast Platform</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-gray-900 leading-[1.1]">
                CreatorLive<span className="text-purple-600">24/7</span>
              </h1>
              <p className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
                Your Content. Always On. Turn Your Passion Into Income!
              </p>
              <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto lg:mx-0">
                Professional 24/7 cloud streaming, dual simultaneous RTMP destinations, automated video loops, camera and screen broadcasting, and YouTube integration in one simple dashboard.
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4">
                <button
                  onClick={() => setActiveTab('signup')}
                  className="px-8 py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 shadow-xl shadow-purple-200 transition-all hover:scale-105 flex items-center space-x-3 text-base"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setActiveTab('login')}
                  className="px-8 py-4 rounded-2xl font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 shadow-md transition-all text-base"
                >
                  Sign In to Dashboard
                </button>
              </div>

              {/* Supported Platforms */}
              <div className="pt-8 border-t border-gray-100 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-gray-500 text-sm font-semibold">
                <span className="text-gray-400">Stream to:</span>
                <div className="flex items-center space-x-2"><Youtube className="w-5 h-5 text-red-600" /><span>YouTube Live</span></div>
                <div className="flex items-center space-x-2"><Facebook className="w-5 h-5 text-blue-600" /><span>Facebook</span></div>
                <div className="flex items-center space-x-2"><Instagram className="w-5 h-5 text-pink-600" /><span>Instagram</span></div>
                <div className="flex items-center space-x-2"><Tv className="w-5 h-5 text-purple-600" /><span>RTMP Custom</span></div>
              </div>
            </div>

            {/* Visual Hero Mockup */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-white">
                <img
                  src="/public/assets/aistudio/CreatorLive24_7_Streaming_Platform_Banner_6c24880d.png"
                  alt="CreatorLive24/7 Platform Banner"
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="py-20 bg-white/60 border-y border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
              Everything You Need to Broadcast Like a Pro
            </h2>
            <p className="text-gray-600 mt-4 text-lg">
              Built for creators, educators, and brands who want uninterrupted 24/7 streaming presence across multiple channels.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-8 rounded-3xl bg-white border border-purple-100 shadow-xl shadow-purple-50 hover:shadow-2xl hover:border-purple-300 transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Radio className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Live Streaming</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Go live in minutes with device camera, screen sharing, or RTMP stream keys. Dual simultaneous streams supported.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white border border-purple-100 shadow-xl shadow-purple-50 hover:shadow-2xl hover:border-purple-300 transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Video className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Video Library</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Upload and manage videos, thumbnails, durations, and formats securely with fast cloud storage.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white border border-purple-100 shadow-xl shadow-purple-50 hover:shadow-2xl hover:border-purple-300 transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <RefreshCw className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">24/7 Loop Streaming</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Keep your content running continuously with automatic video repetition, playlists, and zero downtime.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white border border-purple-100 shadow-xl shadow-purple-50 hover:shadow-2xl hover:border-purple-300 transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <DollarSign className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Monetization Guide</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Grow your audience, boost engagement, and turn views into sustainable income across top platforms.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Stats & Banner */}
      <div className="py-16 bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl sm:text-5xl font-black text-purple-300 mb-2">99.9%</div>
              <div className="text-sm text-purple-200">Uptime Reliability</div>
            </div>
            <div>
              <div className="text-4xl sm:text-5xl font-black text-blue-300 mb-2">2x</div>
              <div className="text-sm text-purple-200">Simultaneous Streams</div>
            </div>
            <div>
              <div className="text-4xl sm:text-5xl font-black text-emerald-300 mb-2">24/7</div>
              <div className="text-sm text-purple-200">Automated Loop</div>
            </div>
            <div>
              <div className="text-4xl sm:text-5xl font-black text-pink-300 mb-2">100k+</div>
              <div className="text-sm text-purple-200">Active Creators</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-purple-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
            <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white font-bold">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <span className="text-xl font-black text-gray-900">
              CreatorLive<span className="text-purple-600">24/7</span>
            </span>
          </div>
          <div className="text-sm text-gray-500 text-center md:text-right">
            &copy; 2026 CreatorLive24/7 Platform. All rights reserved. Business Address: Tripoliya, Patna, Bihar.
          </div>
        </div>
      </footer>
    </div>
  );
};
