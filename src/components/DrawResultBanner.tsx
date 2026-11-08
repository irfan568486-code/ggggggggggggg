import React, { useEffect } from 'react';
import { RoundResult } from '../types.ts';
import { Ball } from './Ball.tsx';
import { Sparkles, X } from 'lucide-react';
import { sound } from '../utils/audio.ts';

interface DrawResultBannerProps {
  result: RoundResult | null;
  onDismiss: () => void;
}

export const DrawResultBanner: React.FC<DrawResultBannerProps> = ({
  result,
  onDismiss,
}) => {
  useEffect(() => {
    if (result) {
      sound.playBetPlaced();
      const timer = setTimeout(() => {
        onDismiss();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [result]);

  if (!result) return null;

  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-3 animate-in slide-in-from-top-4 duration-300 pointer-events-auto">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1e1b2e] via-[#161826] to-[#12141f] border-2 border-amber-400/70 p-3 shadow-2xl shadow-amber-500/20">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/20 rounded-full blur-xl pointer-events-none" />

        <div className="flex items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-2.5">
            <Ball number={result.number} size="md" />

            <div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-amber-400">
                <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-spin" />
                <span>LOTTERY RESULT REVEALED</span>
              </div>
              <div className="text-xs font-mono font-bold text-slate-200">
                Period {result.roundId}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right">
              <span
                className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-black font-rajdhani uppercase tracking-wider ${
                  result.size === 'big'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950'
                    : 'bg-gradient-to-r from-blue-500 to-sky-400 text-white'
                }`}
              >
                {result.size.toUpperCase()}
              </span>
              <div className="text-[10px] text-slate-400 capitalize mt-0.5">
                {result.colors.join(' + ')}
              </div>
            </div>

            <button
              onClick={onDismiss}
              className="w-6 h-6 rounded-full bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
