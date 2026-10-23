import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Save, ShieldCheck, Loader2 } from 'lucide-react';

export const StreamConfigPage: React.FC = () => {
  const { streams, updateStreamConfig, isLoading } = useAuth();
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Record<string, any>>({});

  // Sync formData when streams load asynchronously from Firestore or backend
  useEffect(() => {
    setFormData(prev => {
      const updated: Record<string, any> = { ...prev };
      streams.forEach(s => {
        if (!updated[s.id]) {
          updated[s.id] = { ...s };
        }
      });
      return updated;
    });
  }, [streams]);

  const handleChange = (streamId: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [streamId]: {
        ...(prev[streamId] || streams.find(s => s.id === streamId) || {}),
        [field]: value
      }
    }));
  };

  const handleSave = async (streamId: string) => {
    if (formData[streamId]) {
      setSavingId(streamId);
      try {
        if (formData[streamId].streamKey) {
          localStorage.setItem('cl247_saved_stream_key', String(formData[streamId].streamKey).trim());
        }
        if (formData[streamId].destinationUrl) {
          localStorage.setItem('cl247_saved_rtmp_url', String(formData[streamId].destinationUrl).trim());
        }
        await updateStreamConfig(streamId, formData[streamId]);
      } finally {
        setSavingId(null);
      }
    }
  };

  const toggleShowKey = (streamId: string) => {
    setShowKeys(prev => ({ ...prev, [streamId]: !prev[streamId] }));
  };

  return (
    <div className="space-y-8 pb-16">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Stream Configuration</h1>
        <p className="text-sm text-gray-500 mt-1">Configure independent RTMP servers, stream keys, resolutions, and codecs for dual simultaneous streams.</p>
      </div>

      {isLoading && streams.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-purple-100">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-3" />
          <p className="text-sm text-gray-500 font-medium">Loading stream configurations...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {streams.map((stream, idx) => {
            const current = formData[stream.id] || stream;
            const isKeyVisible = showKeys[stream.id];

            return (
              <div key={stream.id} className="bg-white rounded-3xl border border-purple-100 shadow-xl shadow-purple-50 p-6 sm:p-8 space-y-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-600 to-indigo-600"></div>

                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-600 border border-purple-200">
                    Simultaneous Stream #{idx + 1}
                  </span>
                  <span className="text-xs font-mono text-gray-400">ID: {stream.id}</span>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Stream Title / Name</label>
                    <input
                      type="text"
                      maxLength={120}
                      value={current.streamName}
                      onChange={e => handleChange(stream.id, 'streamName', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-600 text-sm font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">RTMP Destination URL</label>
                    <input
                      type="text"
                      maxLength={512}
                      value={current.destinationUrl}
                      onChange={e => handleChange(stream.id, 'destinationUrl', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-600 text-sm font-mono text-gray-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Stream Key (Securely Encrypted)</label>
                    <div className="relative">
                      <input
                        type={isKeyVisible ? 'text' : 'password'}
                        maxLength={256}
                        value={current.streamKey}
                        onChange={e => handleChange(stream.id, 'streamKey', e.target.value)}
                        className="w-full pl-4 pr-12 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-600 text-sm font-mono text-gray-700"
                      />
                      <button
                        type="button"
                        onClick={() => toggleShowKey(stream.id)}
                        className="absolute right-3 top-3.5 text-gray-400 hover:text-purple-600"
                      >
                        {isKeyVisible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1">Never share your stream key publicly.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Resolution</label>
                      <select
                        value={current.resolution}
                        onChange={e => handleChange(stream.id, 'resolution', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-600 text-sm font-medium bg-white"
                      >
                        <option value="720p">720p HD</option>
                        <option value="1080p">1080p Full HD</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Frame Rate</label>
                      <select
                        value={current.fps}
                        onChange={e => handleChange(stream.id, 'fps', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-600 text-sm font-medium bg-white"
                      >
                        <option value="30">30 FPS</option>
                        <option value="60">60 FPS</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Video Bitrate</label>
                      <input
                        type="text"
                        maxLength={64}
                        value={current.bitrate}
                        onChange={e => handleChange(stream.id, 'bitrate', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-600 text-sm font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Audio Bitrate</label>
                      <input
                        type="text"
                        maxLength={64}
                        value={current.audioBitrate}
                        onChange={e => handleChange(stream.id, 'audioBitrate', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-600 text-sm font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-emerald-600 font-semibold flex items-center space-x-1">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Isolated Cloud Storage</span>
                  </span>
                  <button
                    onClick={() => handleSave(stream.id)}
                    disabled={savingId === stream.id}
                    className="px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 disabled:opacity-60 shadow-lg shadow-purple-200 flex items-center space-x-2 transition-all hover:scale-105"
                  >
                    {savingId === stream.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>{savingId === stream.id ? 'Saving...' : 'Save Configuration'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
