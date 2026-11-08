import React, { useEffect } from 'react';
import { Trophy, Frown, Sparkles, X } from 'lucide-react';
import { UserBet, RoundResult } from '../types.ts';
import { Ball } from './Ball.tsx';
import { sound } from '../utils/audio.ts';

interface WinningModalProps {
  isOpen: boolean;
  onClose: () => void;
  winningBets: UserBet[];
  roundResult: RoundResult | null;
}

export const WinningModal: React.FC<WinningModalProps> = ({
  isOpen,
  onClose,
  winningBets,
  roundResult,
}) => {
  useEffect(() => {
    if (isOpen) {
      sound.playWin();
    }
  }, [isOpen]);

  if (!isOpen || !roundResult || winningBets.length === 0) return null;

  const totalWon = winningBets.reduce((acc, b) => acc + b.payout, 0);
  const totalProfit = winningBets.reduce((acc, b) => acc + b.profit, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#2a1738] via-[#1c182a] to-[#12111d] border-2 border-amber-400/60 p-6 text-center shadow-2xl shadow-amber-500/20 overflow-hidden">
        {/* Confetti particles */}
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-slate-300"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Trophy Header */}
        <div className="relative mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-200 flex items-center justify-center shadow-lg shadow-amber-500/30 mb-3 animate-pulse">
          <Trophy className="w-9 h-9 text-slate-950 fill-slate-950" />
          <Sparkles className="absolute -top-2 -right-2 w-5 h-5 text-amber-300 animate-spin" />
        </div>

        <div className="text-xl font-black font-rajdhani tracking-wider text-amber-300 uppercase mb-0.5">
          Congratulations!
        </div>
        <div className="text-xs text-slate-400 mb-3">
          Period <span className="font-mono text-slate-200">{roundResult.roundId}</span>
        </div>

        {/* Winning result ball */}
        <div className="flex items-center justify-center gap-3 bg-[#11131e] py-2.5 px-4 rounded-2xl border border-slate-800 mb-4">
          <Ball number={roundResult.number} size="lg" />
          <div className="text-left">
            <div className="text-xs font-bold text-slate-300">
              {roundResult.size.toUpperCase()} ·{' '}
              {roundResult.colors.map((c) => c.toUpperCase()).join(' + ')}
            </div>
            <div className="text-[11px] text-slate-500">Lottery Result</div>
          </div>
        </div>

        {/* Bonus Amount */}
        <div className="mb-4">
          <div className="text-xs font-semibold text-slate-400">Total Payout</div>
          <div className="text-3xl font-black font-rajdhani text-emerald-400 drop-shadow-md">
            +₹{totalWon.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Net Profit: <span className="text-emerald-400 font-bold">+₹{totalProfit.toFixed(2)}</span>
          </div>
        </div>

        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/25 active:scale-95 transition-all"
        >
          Confirm & Collect
        </button>
      </div>
    </div>
  );
};

interface LosingModalProps {
  isOpen: boolean;
  onClose: () => void;
  losingBets: UserBet[];
  roundResult: RoundResult | null;
}

export const LosingModal: React.FC<LosingModalProps> = ({
  isOpen,
  onClose,
  losingBets,
  roundResult,
}) => {
  useEffect(() => {
    if (isOpen) {
      sound.playLoss();
    }
  }, [isOpen]);

  if (!isOpen || !roundResult || losingBets.length === 0) return null;

  const totalLost = losingBets.reduce((acc, b) => acc + b.totalAmount, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#241f2a] via-[#1a1722] to-[#121118] border border-slate-700/60 p-6 text-center shadow-2xl overflow-hidden">
        {/* Close Button */}
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-slate-300"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon */}
        <div className="mx-auto w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400 mb-3">
          <Frown className="w-8 h-8 text-slate-400" />
        </div>

        <div className="text-lg font-bold font-rajdhani text-slate-200 mb-0.5">
          Better Luck Next Round!
        </div>
        <div className="text-xs text-slate-400 mb-3">
          Period <span className="font-mono text-slate-300">{roundResult.roundId}</span>
        </div>

        {/* Result summary */}
        <div className="flex items-center justify-center gap-3 bg-[#11131c] py-2.5 px-4 rounded-2xl border border-slate-800 mb-3">
          <Ball number={roundResult.number} size="md" />
          <div className="text-left text-xs">
            <div className="font-bold text-slate-300">
              {roundResult.size.toUpperCase()} ·{' '}
              {roundResult.colors.map((c) => c.toUpperCase()).join(' + ')}
            </div>
            <div className="text-[11px] text-slate-500">Round Outcome</div>
          </div>
        </div>

        <div className="text-xs text-slate-400 mb-4">
          Bet amount: <span className="text-red-400 font-bold font-mono">-₹{totalLost.toFixed(2)}</span>
        </div>

        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};
