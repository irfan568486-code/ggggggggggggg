import React from 'react';
import { Crown, Volume2, VolumeX, Headphones, Bell, Sparkles, LogOut } from 'lucide-react';
import { UserProfile } from '../types.ts';
import { sound } from '../utils/audio.ts';

interface HeaderProps {
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenSupport: () => void;
  onOpenNotifications: () => void;
  onOpenLogin?: () => void;
  onLogout?: () => void;
  onBackToHome?: () => void;
  user?: UserProfile;
}

export const Header: React.FC<HeaderProps> = ({
  isMuted,
  onToggleMute,
  onOpenSupport,
  onOpenNotifications,
  onOpenLogin,
  onLogout,
  onBackToHome,
  user,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#161822]/95 backdrop-blur-md border-b border-amber-500/20 px-4 py-3">
      <div className="flex items-center justify-between max-w-md mx-auto">
        {/* Brand & Optional Back button */}
        <div className="flex items-center gap-2">
          {onBackToHome && (
            <button
              onClick={() => {
                sound.playClick();
                onBackToHome();
              }}
              className="w-8 h-8 rounded-full bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-300 hover:text-amber-400 transition-colors mr-0.5"
              title="Back to Home Screen"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Crown className="w-5 h-5 text-slate-950 fill-slate-950" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-rajdhani text-2xl font-black tracking-wider bg-gradient-to-r from-yellow-300 via-amber-400 to-amber-500 bg-clip-text text-transparent drop-shadow-sm">
                13 CLUB
              </span>
              <span className="text-[10px] font-bold tracking-widest text-amber-400 uppercase bg-amber-500/10 border border-amber-500/30 px-1 rounded">
                WINGO
              </span>
            </div>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-2">
          {/* Audio toggle */}
          <button
            onClick={() => {
              onToggleMute();
              sound.playClick();
            }}
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            className="w-8 h-8 rounded-full bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-300 hover:text-amber-400 transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
          </button>

          {/* Customer support */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenSupport();
            }}
            title="Customer Service"
            className="w-8 h-8 rounded-full bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-300 hover:text-amber-400 transition-colors"
          >
            <Headphones className="w-4 h-4" />
          </button>

          {/* Notifications */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenNotifications();
            }}
            title="Game Notifications"
            className="w-8 h-8 rounded-full bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-300 hover:text-amber-400 transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          </button>

          {/* Login / Account button */}
          {onOpenLogin && (
            <button
              onClick={() => {
                sound.playClick();
                onOpenLogin();
              }}
              title="Account / Switch Account"
              className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs font-rajdhani tracking-wider uppercase shadow-md shadow-amber-500/20 active:scale-95 transition-all flex items-center gap-1"
            >
              <span>{user?.isGuest ? 'Sign In' : 'Account'}</span>
            </button>
          )}

          {/* Logout button */}
          {onLogout && (
            <button
              onClick={() => {
                sound.playClick();
                onLogout();
              }}
              title="Logout from 13 CLUB"
              className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-red-500/20 border border-slate-700/60 hover:border-red-500/40 flex items-center justify-center text-slate-300 hover:text-red-400 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
