import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { History, Clock, ExternalLink, CheckCircle2 } from 'lucide-react';

export const StreamHistoryPage: React.FC = () => {
  const { history } = useAuth();

  return (
    <div className="space-y-8 pb-16">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Stream History & Recordings</h1>
        <p className="text-sm text-gray-500 mt-1">Review past broadcast logs, durations, destinations, and replay recordings.</p>
      </div>

      <div className="bg-white rounded-3xl border border-purple-100 shadow-xl shadow-purple-50 p-6 sm:p-8">
        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center space-x-2">
          <History className="w-5 h-5 text-purple-600" />
          <span>Past Broadcast Records ({history.length})</span>
        </h3>

        {history.length === 0 ? (
          <p className="text-sm text-gray-500 py-12 text-center">No stream history recorded yet.</p>
        ) : (
          <div className="space-y-4">
            {history.map(h => (
              <div key={h.id} className="p-5 rounded-2xl border border-purple-100 bg-purple-50/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="font-bold text-gray-900 text-base">{h.title}</h4>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                    <span>Started: {h.startTime}</span>
                    <span>•</span>
                    <span>Ended: {h.endTime}</span>
                    <span>•</span>
                    <span className="font-semibold text-purple-600">Duration: {h.duration}</span>
                  </div>
                  <div className="text-xs font-mono text-gray-400 mt-1">Destination: {h.destination}</div>
                </div>

                <div className="flex items-center space-x-4">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{h.status}</span>
                  </span>

                  {h.recordingUrl && (
                    <a
                      href={h.recordingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white flex items-center space-x-1.5 shadow-md shadow-purple-200 transition-all"
                    >
                      <span>Replay</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
