import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Video, Upload, Trash2, Play, Plus, CheckCircle2, Clock, HardDrive } from 'lucide-react';

export const VideoLibraryPage: React.FC = () => {
  const { videos, uploadVideo, deleteVideo } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleSimulatedUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    setIsUploading(true);
    setUploadProgress(20);

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(async () => {
            await uploadVideo({
              title,
              filename: title.toLowerCase().replace(/\s+/g, '_') + '.mp4',
              thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400',
              duration: '01:30:00',
              size: '1.2 GB'
            });
            setTitle('');
            setIsUploading(false);
            setUploadProgress(0);
          }, 500);
          return 100;
        }
        return prev + 25;
      });
    }, 400);
  };

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Video Library & Upload</h1>
          <p className="text-sm text-gray-500 mt-1">Upload and manage video files for continuous 24/7 loop streaming playlists.</p>
        </div>
      </div>

      {/* Upload Card */}
      <div className="bg-white rounded-3xl border border-purple-100 shadow-xl shadow-purple-50 p-6 sm:p-8">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
          <Upload className="w-5 h-5 text-purple-600" />
          <span>Upload New Video File</span>
        </h3>

        <form onSubmit={handleSimulatedUpload} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Video Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. 4K Nature Ambient Stream"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-600 text-sm font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Select File (.mp4, .mov)</label>
              <input
                type="file"
                accept="video/*"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
              />
            </div>
          </div>

          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                <span>Uploading to private cloud storage...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isUploading}
            className="px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 shadow-lg shadow-purple-200 flex items-center space-x-2 transition-all hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            <span>{isUploading ? 'Uploading...' : 'Upload Video'}</span>
          </button>
        </form>
      </div>

      {/* Video Grid */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Your Video Assets ({videos.length})</h3>
        {videos.length === 0 ? (
          <div className="bg-white rounded-3xl border border-purple-100 p-12 text-center">
            <Video className="w-12 h-12 text-purple-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No videos uploaded yet. Upload your first video above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map(vid => (
              <div key={vid.id} className="bg-white rounded-3xl border border-purple-100 shadow-xl shadow-purple-50 overflow-hidden flex flex-col justify-between group">
                <div className="relative aspect-video bg-gray-900 overflow-hidden">
                  <img
                    src={vid.thumbnail}
                    alt={vid.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="w-12 h-12 rounded-full bg-white/90 text-purple-600 flex items-center justify-center shadow-lg">
                      <Play className="w-6 h-6 ml-0.5" />
                    </button>
                  </div>
                  <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-white text-xs font-bold flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{vid.duration}</span>
                  </div>
                </div>

                <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-gray-900 text-base line-clamp-1">{vid.title}</h4>
                    <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
                      <span className="flex items-center space-x-1">
                        <HardDrive className="w-3.5 h-3.5" />
                        <span>{vid.size}</span>
                      </span>
                      <span>Uploaded: {vid.uploadedAt}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700">
                      Ready for Loop
                    </span>
                    <button
                      onClick={() => deleteVideo(vid.id)}
                      className="p-2 rounded-xl text-red-500 hover:bg-red-50 transition-colors"
                      title="Delete Video"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
