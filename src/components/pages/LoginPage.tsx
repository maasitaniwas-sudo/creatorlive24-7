import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, ArrowRight, AlertCircle, Radio, Loader2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, googleLogin, setActiveTab, error, successMessage, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    try {
      await login(email.trim(), password);
    } catch {
      // error handled in context
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setSubmitting(true);
    try {
      await googleLogin();
    } catch {
      // error handled in context
    } finally {
      setSubmitting(false);
    }
  };

  const busy = submitting || isLoading;

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-purple-50/50 via-white to-blue-50/40 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-purple-100 p-8 sm:p-10 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>

        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-purple-600 text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-200">
            <Radio className="w-7 h-7 animate-pulse" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Welcome Back</h2>
          <p className="text-sm text-gray-500 mt-1">Sign in to manage your 24/7 live streams</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-center space-x-3 text-red-700 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium">
            {successMessage}
          </div>
        )}

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={busy}
          className="w-full mb-6 py-3.5 px-4 rounded-2xl font-bold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-60 shadow-lg shadow-purple-200 flex items-center justify-center space-x-3 transition-all hover:scale-[1.02]"
        >
          {busy ? (
            <Loader2 className="w-5 h-5 animate-spin text-white" />
          ) : (
            <svg className="w-5 h-5 fill-current text-white" viewBox="0 0 24 24">
              <path d="M12.24 10.28V14h5.51C17 15.85 15 18 12.24 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.49 0 2.85.55 3.89 1.46l2.83-2.83C17.34 2.88 14.97 2 12.24 2 7.03 2 2.81 6.22 2.81 11.43s4.22 9.43 9.43 9.43c5.44 0 9.03-3.83 9.03-9.19 0-.63-.07-1.24-.19-1.81h-8.84z" />
            </svg>
          )}
          <span>{busy ? 'Authenticating...' : 'Sign in with Google'}</span>
        </button>

        <div className="relative flex py-2 items-center mb-6">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="flex-shrink mx-4 text-xs font-semibold uppercase tracking-wider text-gray-400">OR SIGN IN WITH EMAIL</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-5 h-5 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-600 text-sm font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-5 h-5 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-600 text-sm font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full py-3.5 px-4 rounded-2xl font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 disabled:opacity-60 shadow-xl shadow-purple-200 flex items-center justify-center space-x-2 transition-all hover:scale-[1.02] mt-2"
          >
            {busy ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Signing in & loading profile...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <button
            onClick={() => setActiveTab('signup')}
            className="font-bold text-purple-600 hover:underline"
          >
            Create free account
          </button>
        </div>
      </div>
    </div>
  );
};
