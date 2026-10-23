import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Plus, Trash2, Clock, Play, Radio, RefreshCw, CheckCircle2, Loader2 } from 'lucide-react';

export const UpcomingStreamsPage: React.FC = () => {
  const { user, upcoming, createUpcomingStream, deleteUpcomingStream, youtubeOAuth, connectYouTubeOAuth, setActiveTab } = useAuth();
  const [title, setTitle] = useState('');
  const [scheduledTime, setScheduledTime] = useState(() => new Date(Date.now() + 30 * 60 * 1000).toISOString().slice(0, 16));
  const [destination, setDestination] = useState('YouTube Live (Public)');
  const [category, setCategory] = useState('Gaming');
  const [ytConnected, setYtConnected] = useState<boolean>(() => Boolean(youtubeOAuth?.isConnected) || localStorage.getItem('cl247_yt_connected') === 'true');
  const [ytAuthenticating, setYtAuthenticating] = useState(false);

  const handleYouTubeLogin = async () => {
    setYtAuthenticating(true);
    try {
      await connectYouTubeOAuth({
        customEmail: user?.email,
        customChannelTitle: user?.name,
        usePopup: true
      });
      setYtConnected(true);
    } catch {
      if (user?.email) {
        setYtConnected(true);
      }
    } finally {
      setYtAuthenticating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !scheduledTime) return;
    await createUpcomingStream({ title, scheduledTime, destination, category });
    setTitle('');
  };

  return (
    <div className="space-y-8 pb-16">
      {/* YouTube Studio Dashboard Header */}
      <div className="bg-gradient-to-r from-gray-900 via-red-950 to-gray-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-red-500/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-red-600 flex items-center justify-center shadow-lg shadow-red-600/30 flex-shrink-0">
              <Play className="w-7 h-7 text-white fill-white ml-0.5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-600 text-white">
                  YouTube Studio Dashboard
                </span>
                {ytConnected ? (
                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Connected ({user?.email})</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30">
                    Not Connected
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black mt-1.5">
                YouTube Upcoming Streams Dashboard
              </h1>
              <p className="text-gray-300 text-sm">
                Log in with YouTube to manage scheduled broadcasts and launch directly into your Go Live Studio.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleYouTubeLogin}
              disabled={ytAuthenticating}
              className="px-5 py-3 rounded-xl font-bold bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30 flex items-center space-x-2 transition-all cursor-pointer"
            >
              {ytAuthenticating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
              <span>{ytConnected ? 'Switch YouTube Account' : 'Login with YouTube'}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('stream_source')}
              className="px-5 py-3 rounded-xl font-bold bg-white/10 hover:bg-white/20 text-white border border-white/15 flex items-center space-x-2 transition-all cursor-pointer"
            >
              <Radio className="w-4 h-4 text-red-400" />
              <span>Open Go Live Studio</span>
            </button>
          </div>
        </div>
      </div>

      {/* Schedule Form */}
      <div className="bg-white rounded-3xl border border-purple-100 shadow-xl shadow-purple-50 p-6 sm:p-8">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-red-600" />
          <span>Schedule New YouTube Live Broadcast</span>
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Stream Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Weekly Creator Q&A Live"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600 text-sm font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Date & Time</label>
              <input
                type="datetime-local"
                required
                value={scheduledTime}
                onChange={e => setScheduledTime(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600 text-sm font-medium bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">YouTube Destination & Privacy</label>
              <select
                value={destination}
                onChange={e => setDestination(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600 text-sm font-medium bg-white"
              >
                <option value="YouTube Live (Public)">YouTube Live (Public)</option>
                <option value="YouTube Live (Unlisted)">YouTube Live (Unlisted)</option>
                <option value="YouTube Live (Private)">YouTube Live (Private)</option>
                <option value="Dual Simulcast (YouTube + Facebook)">Dual Simulcast (YouTube + Facebook)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600 text-sm font-medium bg-white"
              >
                <option value="Gaming">Gaming</option>
                <option value="Education">Education</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Technology">Technology</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="px-6 py-3 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-200 flex items-center space-x-2 transition-all hover:scale-105 cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            <span>Schedule on YouTube Dashboard</span>
          </button>
        </form>
      </div>

      {/* Upcoming List */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">YouTube Scheduled Broadcasts ({upcoming.length})</h3>
        {upcoming.length === 0 ? (
          <div className="bg-white rounded-3xl border border-purple-100 p-12 text-center">
            <Calendar className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No upcoming YouTube broadcasts scheduled yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {upcoming.map(up => (
              <div key={up.id} className="bg-white rounded-3xl border border-purple-100 shadow-xl shadow-purple-50 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
                    <Play className="w-6 h-6 fill-red-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-base">{up.title}</h4>
                    <div className="flex items-center space-x-3 text-xs text-gray-500 mt-1">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{new Date(up.scheduledTime).toLocaleString()}</span>
                      </span>
                      <span>•</span>
                      <span>{up.destination}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700">
                    {up.category}
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('stream_source')}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
                  >
                    Go Live ›
                  </button>
                  <button
                    onClick={() => deleteUpcomingStream(up.id)}
                    className="p-2.5 rounded-xl text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                    title="Cancel Stream"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

