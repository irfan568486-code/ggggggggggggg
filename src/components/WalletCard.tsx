import React, { useState } from 'react';
import { Eye, EyeOff, RefreshCw, Wallet, ArrowUpRight, PlusCircle, ShieldCheck } from 'lucide-react';
import { UserProfile } from '../types.ts';
import { sound } from '../utils/audio.ts';

interface WalletCardProps {
  user: UserProfile;
  onDeposit: () => void;
  onWithdraw: () => void;
  onRefresh: () => void;
  onOpenLogin?: () => void;
  isRefreshing?: boolean;
}

export const WalletCard: React.FC<WalletCardProps> = ({
  user,
  onDeposit,
  onWithdraw,
  onRefresh,
  onOpenLogin,
  isRefreshing = false,
}) => {
  const [showBalance, setShowBalance] = useState(true);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1e2235] via-[#171a29] to-[#0f111c] border border-amber-500/25 p-4 shadow-xl">
      {/* Subtle luxury glow effect */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-red-600/10 rounded-full blur-xl pointer-events-none" />

      {/* Top row: User Info & VIP badge */}
      <div className="flex items-center justify-between mb-3 relative z-10">
        <div
          onClick={() => {
            if (onOpenLogin) {
              sound.playClick();
              onOpenLogin();
            }
          }}
          className="flex items-center gap-2 cursor-pointer group"
          title="Click to view Account / Switch User"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center font-bold text-slate-950 text-xs shadow-md group-hover:scale-105 transition-transform">
            13
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-200 group-hover:text-amber-300 transition-colors">
                {user.username}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black tracking-wider uppercase">
                VIP {user.vipLevel}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>{user.isGuest ? 'Guest Player' : 'Verified Member'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {onOpenLogin && (
            <button
              onClick={() => {
                sound.playClick();
                onOpenLogin();
              }}
              className="text-[11px] font-bold text-slate-300 hover:text-amber-300 bg-slate-800/80 hover:bg-slate-700/80 px-2 py-1 rounded-lg border border-slate-700/60 transition-colors"
            >
              {user.isGuest ? 'Login' : 'Switch'}
            </button>
          )}

          <button
            onClick={() => {
              sound.playClick();
              onRefresh();
            }}
            disabled={isRefreshing}
            className="flex items-center gap-1 text-xs text-amber-400/90 hover:text-amber-300 transition-colors bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="text-[11px] font-medium">Sync</span>
          </button>
        </div>
      </div>

      {/* Balance display */}
      <div className="mb-4 relative z-10">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-0.5">
          <Wallet className="w-3.5 h-3.5 text-amber-400" />
          <span>Wallet Balance</span>
          <button
            onClick={() => {
              sound.playClick();
              setShowBalance(!showBalance);
            }}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            {showBalance ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>
        </div>
        <div className="text-2xl font-black font-rajdhani tracking-wide text-white flex items-baseline gap-1">
          <span className="text-amber-400 text-xl font-bold">₹</span>
          <span>{showBalance ? user.balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '••••••••'}</span>
        </div>
      </div>

      {/* Deposit and Withdraw action buttons */}
      <div className="grid grid-cols-2 gap-3 relative z-10">
        <button
          onClick={() => {
            sound.playClick();
            onWithdraw();
          }}
          className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-bold transition-all active:scale-[0.98]"
        >
          <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
          <span>Withdraw</span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            onDeposit();
          }}
          className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20 transition-all active:scale-[0.98]"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Deposit</span>
        </button>
      </div>
    </div>
  );
};
