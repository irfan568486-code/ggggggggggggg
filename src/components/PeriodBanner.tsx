import React, { useState } from 'react';
import { HelpCircle, Copy, Check, Lock } from 'lucide-react';
import { PeriodType, PERIOD_CONFIGS, RoundResult } from '../types.ts';
import { Ball } from './Ball.tsx';
import { sound } from '../utils/audio.ts';

interface PeriodBannerProps {
  period: PeriodType;
  roundId: string;
  timeRemaining: number;
  recentResults: RoundResult[];
  onOpenRules: () => void;
  onOpenPeriodSheet?: () => void;
}

export const PeriodBanner: React.FC<PeriodBannerProps> = ({
  period,
  roundId,
  timeRemaining,
  recentResults,
  onOpenRules,
  onOpenPeriodSheet,
}) => {
  const config = PERIOD_CONFIGS[period];
  const [copied, setCopied] = useState(false);

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  const minTens = Math.floor(minutes / 10);
  const minOnes = minutes % 10;
  const secTens = Math.floor(seconds / 10);
  const secOnes = seconds % 10;

  const isLast5Seconds = timeRemaining <= 5;

  const handleCopyRoundId = () => {
    sound.playClick();
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(roundId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1c1f2e] via-[#171926] to-[#12141f] border border-slate-800 p-3.5 shadow-lg">
      <div className="flex items-start justify-between gap-2">
        {/* Left Side: Period Name, Round ID, How to play & Sheet */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-sm font-bold text-white tracking-wide font-rajdhani">
              {config.name}
            </span>
            <button
              onClick={() => {
                sound.playClick();
                onOpenRules();
              }}
              className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 font-medium transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Rules</span>
            </button>
            {onOpenPeriodSheet && period === '30s' && (
              <button
                onClick={() => {
                  sound.playClick();
                  onOpenPeriodSheet();
                }}
                title="1000 Period Sequence Sheet (Password Protected: 112233)"
                className="flex items-center gap-1 text-[11px] bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded font-bold transition-all shadow-sm active:scale-95"
              >
                <Lock className="w-3 h-3 text-amber-400" />
                <span>1000 Sheet</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="text-[11px] text-slate-500 font-medium">Period</span>
            <span className="font-mono text-xs font-semibold text-slate-200">{roundId}</span>
            <button
              onClick={handleCopyRoundId}
              title="Copy Round ID"
              className="p-1 hover:text-amber-400 transition-colors"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
            </button>
          </div>

          {/* Recent 5 outcomes */}
          <div className="mt-3">
            <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Recent Draws</div>
            <div className="flex items-center gap-1.5">
              {recentResults.slice(0, 5).map((res, idx) => (
                <Ball key={res.roundId || idx} number={res.number} size="sm" />
              ))}
              {recentResults.length === 0 && (
                <span className="text-xs text-slate-400">Loading draws...</span>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Time Remaining countdown boxes */}
        <div className="flex flex-col items-end">
          <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-1">
            Time Remaining
          </span>

          <div className="flex items-center gap-1 font-rajdhani font-black select-none">
            {/* Minutes */}
            <div className="flex items-center gap-0.5">
              <span
                className={`w-5 h-7 rounded bg-[#252839] border ${
                  isLast5Seconds ? 'border-red-500 text-red-400' : 'border-slate-700 text-slate-100'
                } flex items-center justify-center text-sm shadow-inner`}
              >
                {minTens}
              </span>
              <span
                className={`w-5 h-7 rounded bg-[#252839] border ${
                  isLast5Seconds ? 'border-red-500 text-red-400' : 'border-slate-700 text-slate-100'
                } flex items-center justify-center text-sm shadow-inner`}
              >
                {minOnes}
              </span>
            </div>

            <span className="text-amber-400 font-bold px-0.5 animate-pulse">:</span>

            {/* Seconds */}
            <div className="flex items-center gap-0.5">
              <span
                className={`w-5 h-7 rounded ${
                  isLast5Seconds ? 'bg-red-950/80 border-red-500 text-red-400 animate-pulse' : 'bg-[#252839] border-slate-700 text-slate-100'
                } border flex items-center justify-center text-sm shadow-inner font-extrabold`}
              >
                {secTens}
              </span>
              <span
                className={`w-5 h-7 rounded ${
                  isLast5Seconds ? 'bg-red-950/80 border-red-500 text-red-400 animate-pulse' : 'bg-[#252839] border-slate-700 text-slate-100'
                } border flex items-center justify-center text-sm shadow-inner font-extrabold`}
              >
                {secOnes}
              </span>
            </div>
          </div>

          {isLast5Seconds && (
            <span className="mt-1 text-[10px] font-black text-red-400 tracking-wider uppercase animate-pulse">
              Betting Locked
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
