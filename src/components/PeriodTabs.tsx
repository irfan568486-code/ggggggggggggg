import React from 'react';
import { Timer, Zap, Clock } from 'lucide-react';
import { PeriodType, PERIOD_CONFIGS, PeriodState } from '../types.ts';
import { sound } from '../utils/audio.ts';

interface PeriodTabsProps {
  activePeriod: PeriodType;
  periodsState: Record<PeriodType, PeriodState>;
  onSelectPeriod: (p: PeriodType) => void;
}

export const PeriodTabs: React.FC<PeriodTabsProps> = ({
  activePeriod,
  periodsState,
  onSelectPeriod,
}) => {
  const periods: PeriodType[] = ['30s', '1m', '3m', '5m'];

  return (
    <div className="grid grid-cols-4 gap-2">
      {periods.map((p) => {
        const config = PERIOD_CONFIGS[p];
        const state = periodsState[p];
        const isActive = activePeriod === p;
        const timeRemaining = state?.timeRemaining ?? config.durationSeconds;
        const isLocked = state?.isBettingLocked ?? false;

        return (
          <button
            key={p}
            onClick={() => {
              if (!isActive) {
                sound.playClick();
                onSelectPeriod(p);
              }
            }}
            className={`relative flex flex-col items-center justify-center py-2.5 px-1 rounded-xl transition-all duration-200 select-none ${
              isActive
                ? 'bg-gradient-to-b from-[#e53935] to-[#c62828] text-white shadow-lg shadow-red-600/30 border border-red-400/40'
                : 'bg-[#181a26] hover:bg-[#202334] text-slate-300 border border-slate-800'
            }`}
          >
            {/* Top icon and title */}
            <div className="flex items-center gap-1 mb-1">
              {p === '30s' ? (
                <Zap className={`w-3.5 h-3.5 ${isActive ? 'text-yellow-300' : 'text-slate-400'}`} />
              ) : (
                <Clock className={`w-3.5 h-3.5 ${isActive ? 'text-yellow-300' : 'text-slate-400'}`} />
              )}
              <span className="text-xs font-bold font-rajdhani">{config.shortName}</span>
            </div>

            {/* Time badge */}
            <span
              className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                isActive
                  ? isLocked
                    ? 'bg-yellow-400 text-slate-950 font-black animate-pulse'
                    : 'bg-black/30 text-amber-200 font-bold'
                  : 'bg-black/20 text-slate-400'
              }`}
            >
              {Math.floor(timeRemaining / 60)}:
              {String(timeRemaining % 60).padStart(2, '0')}
            </span>

            {/* Active pointer indicator */}
            {isActive && (
              <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-1.5 bg-red-600 rotate-45 border-r border-b border-red-400/40" />
            )}
          </button>
        );
      })}
    </div>
  );
};
