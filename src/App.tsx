/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/pages/LandingPage';
import { LoginPage } from './components/pages/LoginPage';
import { SignupPage } from './components/pages/SignupPage';
import { DashboardPage } from './components/pages/DashboardPage';
import { StreamSourcePage } from './components/pages/StreamSourcePage';
import { StreamConfigPage } from './components/pages/StreamConfigPage';
import { VideoLibraryPage } from './components/pages/VideoLibraryPage';
import { PlaylistLoopPage } from './components/pages/PlaylistLoopPage';
import { UpcomingStreamsPage } from './components/pages/UpcomingStreamsPage';
import { StreamHistoryPage } from './components/pages/StreamHistoryPage';
import { SettingsPage } from './components/pages/SettingsPage';
import { HelpSupportPage } from './components/pages/HelpSupportPage';
import { Radio, CheckCircle2, AlertCircle, X } from 'lucide-react';

function AppContent() {
  const { user, activeTab, isAuthReady, isLoading, error, successMessage, clearMessages } = useAuth();

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50/40 via-white to-blue-50/30 flex flex-col items-center justify-center p-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-xl shadow-purple-200 mb-4 animate-bounce">
          <Radio className="w-8 h-8 text-white animate-pulse" />
        </div>
        <h2 className="text-lg font-black text-gray-900">CreatorLive<span className="text-purple-600">24/7</span></h2>
        <p className="text-sm text-gray-500 mt-1 animate-pulse">Loading your account & streaming profile...</p>
      </div>
    );
  }

  const renderPage = () => {
    if (!user) {
      switch (activeTab) {
        case 'login':
          return <LoginPage />;
        case 'signup':
          return <SignupPage />;
        default:
          return <LandingPage />;
      }
    }

    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage />;
      case 'stream_source':
        return <StreamSourcePage />;
      case 'stream_config':
        return <StreamConfigPage />;
      case 'video_library':
        return <VideoLibraryPage />;
      case 'playlist_loop':
        return <PlaylistLoopPage />;
      case 'upcoming_streams':
        return <UpcomingStreamsPage />;
      case 'stream_history':
        return <StreamHistoryPage />;
      case 'settings':
        return <SettingsPage />;
      case 'help_support':
        return <HelpSupportPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/40 via-white to-blue-50/30 flex flex-col font-sans text-gray-900">
      <Navbar />

      {/* Global Toast Notification Banner for Authenticated Pages */}
      {user && (error || successMessage) && (
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-4">
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between shadow-sm ${
              error
                ? 'bg-red-50 border-red-200 text-red-700'
                : 'bg-emerald-50 border-emerald-200 text-emerald-700'
            }`}
          >
            <div className="flex items-center space-x-3 text-sm font-semibold">
              {error ? <AlertCircle className="w-5 h-5 flex-shrink-0" /> : <CheckCircle2 className="w-5 h-5 flex-shrink-0" />}
              <span>{error || successMessage}</span>
            </div>
            <button onClick={clearMessages} className="p-1 rounded-lg hover:bg-black/5">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Subtle Loading Bar when refreshing or syncing profile */}
      {isLoading && (
        <div className="w-full h-1 bg-purple-100 overflow-hidden">
          <div className="w-1/2 h-full bg-gradient-to-r from-purple-600 to-indigo-600 animate-pulse"></div>
        </div>
      )}

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {renderPage()}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
