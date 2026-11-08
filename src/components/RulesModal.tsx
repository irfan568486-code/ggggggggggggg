import React from 'react';
import { X, BookOpen, ShieldCheck, Award } from 'lucide-react';
import { sound } from '../utils/audio.ts';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-md max-h-[85vh] rounded-2xl bg-[#161822] border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-red-600 to-amber-600 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-yellow-300" />
            <h3 className="font-bold text-base font-rajdhani tracking-wide">
              13 CLUB Wingo Rules & Payouts
            </h3>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-7 h-7 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 overflow-y-auto text-xs text-slate-300 leading-relaxed">
          {/* Section 1: Overview */}
          <div className="bg-[#11131c] p-3 rounded-xl border border-slate-800">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Standard Wingo Periods</span>
            </div>
            <p className="text-slate-400">
              Win Go operates across 4 independent synchronized intervals: <strong className="text-slate-200">30 Seconds</strong>, <strong className="text-slate-200">1 Minute</strong>, <strong className="text-slate-200">3 Minutes</strong>, and <strong className="text-slate-200">5 Minutes</strong>.
              Betting closes in the last 5 seconds of every round.
            </p>
          </div>

          {/* Section 2: Colors */}
          <div className="space-y-2">
            <div className="font-bold text-slate-100 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-400" />
              <span>Color Rules & Multipliers</span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30">
                <span className="font-bold text-emerald-400 block mb-0.5">Green (1, 3, 7, 9)</span>
                <span className="text-[11px] text-slate-300">
                  If 1, 3, 7, 9 appears: <strong>2X</strong> payout. If 5 appears: <strong>1.5X</strong> payout.
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-500/30">
                <span className="font-bold text-red-400 block mb-0.5">Red (2, 4, 6, 8)</span>
                <span className="text-[11px] text-slate-300">
                  If 2, 4, 6, 8 appears: <strong>2X</strong> payout. If 0 appears: <strong>1.5X</strong> payout.
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-purple-950/40 border border-purple-500/30">
                <span className="font-bold text-purple-400 block mb-0.5">Violet (0, 5)</span>
                <span className="text-[11px] text-slate-300">
                  If 0 or 5 appears: <strong>4.5X</strong> payout.
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Numbers */}
          <div className="bg-[#11131c] p-3 rounded-xl border border-slate-800 space-y-1.5">
            <div className="font-bold text-amber-400">Direct Number (0 - 9)</div>
            <p className="text-slate-400">
              Select any exact number from 0 to 9. If the draw matches your selection, the payout is <strong className="text-amber-300 font-bold">9X</strong> your net contract money.
            </p>
          </div>

          {/* Section 4: Big & Small */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 rounded-xl bg-orange-950/40 border border-orange-500/30">
              <span className="font-bold text-orange-400 block">Big (5, 6, 7, 8, 9)</span>
              <span className="text-[11px] text-slate-300">Payout: 2X</span>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-950/40 border border-blue-500/30">
              <span className="font-bold text-blue-400 block">Small (0, 1, 2, 3, 4)</span>
              <span className="text-[11px] text-slate-300">Payout: 2X</span>
            </div>
          </div>

          {/* Section 5: Contract Fee */}
          <div className="text-[11px] text-slate-400 p-2.5 bg-slate-900 rounded-lg border border-slate-800">
            <strong>2% Service Fee:</strong> 100 points bet → 2 points platform service charge → 98 points net contract amount.
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-[#12141e]">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
