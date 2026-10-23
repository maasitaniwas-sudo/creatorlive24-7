import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Bell, Save, ShieldCheck, Loader2 } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, updateProfile, isLoading } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [emailNotif, setEmailNotif] = useState(user?.emailNotif ?? true);
  const [streamAlerts, setStreamAlerts] = useState(user?.streamAlerts ?? true);
  const [saving, setSaving] = useState(false);

  // Sync local form state whenever user profile loads or updates asynchronously from Firestore/Auth
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setAvatar(user.avatar || '');
      setEmailNotif(user.emailNotif ?? true);
      setStreamAlerts(user.streamAlerts ?? true);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(name, avatar, emailNotif, streamAlerts);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Account & Streaming Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your profile details, notifications, and platform preferences.</p>
      </div>

      <div className="bg-white rounded-3xl border border-purple-100 shadow-xl shadow-purple-50 p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
            <User className="w-5 h-5 text-purple-600" />
            <span>Profile Details</span>
          </h3>
          {isLoading && (
            <span className="inline-flex items-center space-x-1.5 text-xs font-semibold text-purple-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Syncing profile...</span>
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                maxLength={100}
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-600 text-sm font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Email Address (Verified Account)</label>
              <input
                type="email"
                disabled
                value={user?.email || (isLoading ? 'Loading email...' : '')}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium text-gray-600 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Avatar Image URL</label>
            <input
              type="text"
              maxLength={1024}
              value={avatar}
              onChange={e => setAvatar(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-600 text-sm font-mono text-gray-600"
            />
          </div>

          {/* Notification Preferences Inside Form */}
          <div className="pt-4 border-t border-gray-100 space-y-4">
            <h4 className="text-sm font-bold text-gray-900 flex items-center space-x-2">
              <Bell className="w-4 h-4 text-purple-600" />
              <span>Notification Preferences</span>
            </h4>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-purple-50/30 border border-purple-100">
              <div>
                <div className="font-bold text-gray-900 text-sm">Email Notifications</div>
                <div className="text-xs text-gray-500">Receive alerts at {user?.email || 'your email'} when streams start, stop, or encounter errors.</div>
              </div>
              <input
                type="checkbox"
                checked={emailNotif}
                onChange={e => setEmailNotif(e.target.checked)}
                className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500 border-gray-300"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-purple-50/30 border border-purple-100">
              <div>
                <div className="font-bold text-gray-900 text-sm">Stream Health Alerts</div>
                <div className="text-xs text-gray-500">Instant notification if bitrate drops or latency spikes.</div>
              </div>
              <input
                type="checkbox"
                checked={streamAlerts}
                onChange={e => setStreamAlerts(e.target.checked)}
                className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500 border-gray-300"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-emerald-600 font-semibold flex items-center space-x-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Secure Firebase Authentication & Firestore Sync Active</span>
            </span>
            <button
              type="submit"
              disabled={saving || isLoading}
              className="px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 disabled:opacity-60 shadow-lg shadow-purple-200 flex items-center space-x-2 transition-all hover:scale-105"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
