import React, { useState } from 'react';
import { HelpCircle, Mail, MessageSquare, BookOpen, Send, CheckCircle2 } from 'lucide-react';

export const HelpSupportPage: React.FC = () => {
  const [ticketSent, setTicketSent] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) return;
    setTicketSent(true);
    setSubject('');
    setMessage('');
    setTimeout(() => setTicketSent(false), 4000);
  };

  return (
    <div className="space-y-8 pb-16">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Help & Support Center</h1>
        <p className="text-sm text-gray-500 mt-1">Get expert assistance, documentation on RTMP server setup, and FAQ guides.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* FAQ & RTMP Guide */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-purple-100 shadow-xl shadow-purple-50 p-6 sm:p-8 space-y-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-purple-600" />
              <span>RTMP Stream Key Guide</span>
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              To broadcast to YouTube, Facebook, or custom RTMP endpoints, obtain your server URL and stream key directly from your platform dashboard. Paste them securely into the Stream Configuration page.
            </p>
            <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 text-xs font-mono text-purple-900">
              Example YouTube RTMP URL: rtmps://a.rtmp.youtube.com/live2
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-purple-100 shadow-xl shadow-purple-50 p-6 sm:p-8 space-y-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
              <HelpCircle className="w-5 h-5 text-purple-600" />
              <span>Frequently Asked Questions</span>
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <div className="font-bold text-gray-900">How do I run dual simultaneous streams?</div>
                <div className="text-xs text-gray-500 mt-0.5">Configure Stream 1 and Stream 2 with separate destination RTMP URLs and stream keys in your Stream Configuration settings.</div>
              </div>
              <div className="pt-2 border-t border-gray-100">
                <div className="font-bold text-gray-900">How does 24/7 video loop work?</div>
                <div className="text-xs text-gray-500 mt-0.5">Upload your video to the Video Library, enable Loop Mode in the Playlist & Loop page, and the server keeps your stream running uninterrupted.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Support Ticket Form */}
        <div className="bg-white rounded-3xl border border-purple-100 shadow-xl shadow-purple-50 p-6 sm:p-8 space-y-6">
          <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-purple-600" />
            <span>Contact Support</span>
          </h3>

          {ticketSent && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center space-x-3 text-emerald-700 text-sm">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span>Support ticket submitted! Our team will respond via email within 2 hours.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Subject</label>
              <input
                type="text"
                required
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="e.g. RTMP Connection Assistance"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-600 text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Message Description</label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Describe your streaming setup or question..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-600 text-sm font-medium resize-none"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-2xl font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 shadow-lg shadow-purple-200 flex items-center justify-center space-x-2 transition-all hover:scale-[1.02]"
            >
              <Send className="w-4 h-4" />
              <span>Submit Support Ticket</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
