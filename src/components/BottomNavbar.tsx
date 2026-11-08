import React from 'react';
import { Home, User, Gamepad2 } from 'lucide-react';
import { sound } from '../utils/audio.ts';

export type AppView = 'home' | 'wingo' | 'profile';

interface BottomNavbarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
}

export const BottomNavbar: React.FC<BottomNavbarProps> = ({ currentView, onNavigate }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 max-w-md mx-auto bg-[#10121a]/95 backdrop-blur-md border-t border-amber-500/20 px-6 py-2 shadow-2xl">
      <div className="flex items-center justify-around">
        {/* Home Option */}
        <button
          onClick={() => {
            sound.playClick();
            onNavigate('home');
          }}
          className={`flex flex-col items-center justify-center py-1 px-5 rounded-xl transition-all duration-200 ${
            currentView === 'home'
              ? 'text-amber-400 scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Home
              className={`w-5 h-5 transition-transform ${
                currentView === 'home' ? 'stroke-[2.5] drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]' : ''
              }`}
            />
            {currentView === 'home' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b]" />
            )}
          </div>
          <span
            className={`text-[11px] font-bold mt-1 tracking-wide uppercase font-rajdhani ${
              currentView === 'home' ? 'text-amber-400 font-black' : 'text-slate-400'
            }`}
          >
            Home
          </span>
        </button>

        {/* Center Wingo Shortcut indicator (allows jumping right back into game if in Wingo or quick entry) */}
        <button
          onClick={() => {
            sound.playClick();
            onNavigate('wingo');
          }}
          className={`relative -top-3 flex flex-col items-center justify-center transition-all duration-200 ${
            currentView === 'wingo' ? 'scale-110' : 'hover:scale-105'
          }`}
          title="Play Win Go"
        >
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all ${
              currentView === 'wingo'
                ? 'bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-300 text-slate-950 shadow-amber-500/40 ring-2 ring-amber-300'
                : 'bg-gradient-to-tr from-[#1f2334] to-[#282d44] text-amber-400 border border-amber-500/40 shadow-black/50'
            }`}
          >
            <Gamepad2 className="w-6 h-6" />
          </div>
          <span
            className={`text-[10px] font-black uppercase font-rajdhani mt-0.5 tracking-wider ${
              currentView === 'wingo' ? 'text-amber-400 drop-shadow-sm' : 'text-slate-400'
            }`}
          >
            Win Go
          </span>
        </button>

        {/* Profile Option */}
        <button
          onClick={() => {
            sound.playClick();
            onNavigate('profile');
          }}
          className={`flex flex-col items-center justify-center py-1 px-5 rounded-xl transition-all duration-200 ${
            currentView === 'profile'
              ? 'text-amber-400 scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <User
              className={`w-5 h-5 transition-transform ${
                currentView === 'profile' ? 'stroke-[2.5] drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]' : ''
              }`}
            />
            {currentView === 'profile' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b]" />
            )}
          </div>
          <span
            className={`text-[11px] font-bold mt-1 tracking-wide uppercase font-rajdhani ${
              currentView === 'profile' ? 'text-amber-400 font-black' : 'text-slate-400'
            }`}
          >
            Profile
          </span>
        </button>
      </div>
    </nav>
  );
};
