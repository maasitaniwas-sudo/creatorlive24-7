import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { RefreshCw, CheckCircle2, Save, Loader2 } from 'lucide-react';

export const PlaylistLoopPage: React.FC = () => {
  const { playlist, videos, updatePlaylist } = useAuth();
  const [loopEnabled, setLoopEnabled] = useState(playlist?.loopEnabled ?? true);
  const [selectedIds, setSelectedIds] = useState<string[]>(playlist?.selectedVideoIds || []);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (playlist) {
      setLoopEnabled(playlist.loopEnabled);
      setSelectedIds(playlist.selectedVideoIds || []);
    }
  }, [playlist]);

  const handleToggleVideo = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else if (selectedIds.length < 50) {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updatePlaylist(loopEnabled, selectedIds);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Playlist & 24/7 Loop Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Configure continuous server-side video repetition and custom playlists for uninterrupted 24/7 broadcasting.</p>
      </div>

      <div className="bg-white rounded-3xl border border-purple-100 shadow-xl shadow-purple-50 p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between p-4 rounded-2xl bg-purple-50/50 border border-purple-100">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center">
              <RefreshCw className="w-6 h-6 animate-spin" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">Continuous Loop Mode</h3>
              <p className="text-xs text-gray-500">Automatically repeat playlist videos seamlessly 24/7.</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={loopEnabled}
              onChange={e => setLoopEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>

        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4">Select Videos for 24/7 Playlist</h3>
          {videos.length === 0 ? (
            <p className="text-sm text-gray-500 py-6 text-center">No videos in library. Please upload videos first.</p>
          ) : (
            <div className="space-y-3">
              {videos.map(vid => {
                const isSelected = selectedIds.includes(vid.id);
                return (
                  <div
                    key={vid.id}
                    onClick={() => handleToggleVideo(vid.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected ? 'bg-purple-50/60 border-purple-300 shadow-sm' : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <img src={vid.thumbnail} alt={vid.title} className="w-16 h-10 rounded-lg object-cover" />
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">{vid.title}</h4>
                        <span className="text-xs text-gray-500">Duration: {vid.duration}</span>
                      </div>
                    </div>

                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center border ${
                      isSelected ? 'bg-purple-600 border-purple-600 text-white' : 'border-gray-300'
                    }`}>
                      {isSelected && <CheckCircle2 className="w-4 h-4" />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-3.5 rounded-2xl font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 disabled:opacity-60 shadow-xl shadow-purple-200 flex items-center space-x-2 transition-all hover:scale-105"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            <span>{saving ? 'Saving...' : 'Save Playlist & Loop Settings'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
