import React, { useState } from 'react';
import { ShieldAlert, X, Lock, User, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { sound } from '../utils/audio.ts';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (token: string) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [adminId, setAdminId] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!adminId.trim() || !password.trim()) {
      setErrorMsg('Please enter both Admin ID and Password');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId: adminId.trim(),
          password: password.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      sound.playBetPlaced();
      sessionStorage.setItem('13club_admin_token', data.token);
      onSuccess(data.token);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Invalid Admin ID or Password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
      <div className="relative w-full max-w-sm rounded-2xl bg-[#141622] border-2 border-amber-500/50 p-5 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-md">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base font-rajdhani text-white uppercase tracking-wider">
                Admin Console Login
              </h3>
              <p className="text-[10px] text-amber-400 font-medium">Authorized Staff Only</p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} autoComplete="off" className="space-y-3.5 text-xs">
          {/* Admin ID */}
          <div>
            <label className="text-[11px] font-bold text-slate-300 block mb-1">Admin ID</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                placeholder="Enter Admin ID"
                autoComplete="off"
                className="w-full pl-9 pr-3 py-2 bg-[#0c0e15] border border-slate-700 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-amber-400 placeholder:text-slate-600"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-[11px] font-bold text-slate-300 block mb-1">Admin Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Password"
                autoComplete="new-password"
                className="w-full pl-9 pr-10 py-2 bg-[#0c0e15] border border-slate-700 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-amber-400 placeholder:text-slate-600"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-[11px] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !adminId.trim() || !password.trim()}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs font-rajdhani tracking-widest uppercase shadow-lg shadow-amber-500/30 active:scale-95 transition-all disabled:opacity-40"
          >
            {loading ? 'Authenticating...' : 'Enter Admin Dashboard'}
          </button>

          <p className="text-[10px] text-center text-slate-500">
            System logs all administrative approval and rejection actions.
          </p>
        </form>
      </div>
    </div>
  );
};
