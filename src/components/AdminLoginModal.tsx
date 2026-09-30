import React, { useState } from 'react';
import { Lock, X } from 'lucide-react';
import { adminSignIn } from '../services/storage';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const AdminLoginModal: React.FC<Props> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await adminSignIn(email.trim(), password);
      setEmail('');
      setPassword('');
      onLoginSuccess();
      onClose();
    } catch (e: any) {
      setError('Login failed. Check your email and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-6 text-white shadow-2xl">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold">Administrator Access</h2>
          </div>
          <button onClick={onClose} aria-label="Close">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {error && (
          <div className="mb-3 rounded-lg bg-rose-950 border border-rose-800 px-3 py-2 text-xs text-rose-300">
            {error}
          </div>
        )}

        <label className="block text-xs font-semibold text-slate-300 mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-3 rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm outline-none focus:border-amber-500"
        />

        <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          className="w-full mb-4 rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm outline-none focus:border-amber-500"
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-60 py-2.5 text-sm font-semibold"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </div>
    </div>
  );
};
