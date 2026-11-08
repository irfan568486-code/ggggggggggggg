import React from 'react';
import { Shuffle } from 'lucide-react';
import { BetSelection, BetCategory } from '../types.ts';
import { Ball } from './Ball.tsx';
import { sound } from '../utils/audio.ts';

interface BettingBoardProps {
  isLocked: boolean;
  onSelectBet: (selection: BetSelection) => void;
  quickMultiplier: number;
  onSelectQuickMultiplier: (multiplier: number) => void;
}

export const BettingBoard: React.FC<BettingBoardProps> = ({
  isLocked,
  onSelectBet,
  quickMultiplier,
  onSelectQuickMultiplier,
}) => {
  const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  const multipliers = [1, 5, 10, 20, 50, 100];

  const handleSelect = (category: BetCategory, value: string, label: string) => {
    if (isLocked) return;
    sound.playClick();
    onSelectBet({ category, value, label });
  };

  const handleRandom = () => {
    if (isLocked) return;
    sound.playClick();
    const randomNum = Math.floor(Math.random() * 10);
    onSelectBet({
      category: 'number',
      value: String(randomNum),
      label: `Number ${randomNum}`,
    });
  };

  return (
    <div className="relative rounded-2xl bg-[#171924] border border-slate-800 p-3.5 shadow-xl">
      {/* Top 3 Color Options */}
      <div className="grid grid-cols-3 gap-2.5 mb-3">
        {/* Green */}
        <button
          disabled={isLocked}
          onClick={() => handleSelect('color', 'green', 'Green')}
          className="group relative flex flex-col items-center justify-center py-2.5 px-2 rounded-xl bg-gradient-to-b from-[#1dd1a1] to-[#10ac84] hover:from-[#2ed573] hover:to-[#1dd1a1] text-white shadow-lg shadow-emerald-600/30 active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none"
        >
          <span className="text-sm font-black font-rajdhani tracking-wide drop-shadow-md">
            Green
          </span>
          <span className="text-[10px] font-semibold text-emerald-100 opacity-90">2X Payout</span>
        </button>

        {/* Violet */}
        <button
          disabled={isLocked}
          onClick={() => handleSelect('color', 'violet', 'Violet')}
          className="group relative flex flex-col items-center justify-center py-2.5 px-2 rounded-xl bg-gradient-to-b from-[#b33939] via-[#9c27b0] to-[#673ab7] hover:from-[#ba68c8] hover:to-[#9c27b0] text-white shadow-lg shadow-purple-600/30 active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none"
        >
          <span className="text-sm font-black font-rajdhani tracking-wide drop-shadow-md">
            Violet
          </span>
          <span className="text-[10px] font-semibold text-purple-100 opacity-90">4.5X Payout</span>
        </button>

        {/* Red */}
        <button
          disabled={isLocked}
          onClick={() => handleSelect('color', 'red', 'Red')}
          className="group relative flex flex-col items-center justify-center py-2.5 px-2 rounded-xl bg-gradient-to-b from-[#ff5252] to-[#d63031] hover:from-[#ff7675] hover:to-[#ff5252] text-white shadow-lg shadow-red-600/30 active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none"
        >
          <span className="text-sm font-black font-rajdhani tracking-wide drop-shadow-md">
            Red
          </span>
          <span className="text-[10px] font-semibold text-red-100 opacity-90">2X Payout</span>
        </button>
      </div>

      {/* 0-9 Numbers Grid (2 rows of 5) */}
      <div className="grid grid-cols-5 gap-2.5 mb-3">
        {numbers.map((num) => (
          <button
            key={num}
            disabled={isLocked}
            onClick={() => handleSelect('number', String(num), `Number ${num}`)}
            className="flex flex-col items-center justify-center p-1 rounded-xl bg-[#202334] hover:bg-[#282c40] border border-slate-700/60 active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none group"
          >
            <Ball number={num} size="md" />
            <span className="text-[10px] font-bold text-slate-400 group-hover:text-amber-300 mt-1">
              9X
            </span>
          </button>
        ))}
      </div>

      {/* Quick multiplier & Random button row */}
      <div className="flex items-center justify-between gap-1 mb-3 bg-[#11131c] p-1.5 rounded-xl border border-slate-800">
        <button
          disabled={isLocked}
          onClick={handleRandom}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold border border-amber-500/40 active:scale-95 transition-all disabled:opacity-40"
        >
          <Shuffle className="w-3.5 h-3.5" />
          <span>Random</span>
        </button>

        <div className="flex items-center gap-1 overflow-x-auto">
          {multipliers.map((m) => (
            <button
              key={m}
              onClick={() => {
                sound.playClick();
                onSelectQuickMultiplier(m);
              }}
              className={`px-2 py-1 rounded text-xs font-bold font-rajdhani transition-all ${
                quickMultiplier === m
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
              }`}
            >
              X{m}
            </button>
          ))}
        </div>
      </div>

      {/* Big & Small Selection Buttons */}
      <div className="grid grid-cols-2 gap-3">
        {/* Big (5-9) */}
        <button
          disabled={isLocked}
          onClick={() => handleSelect('size', 'big', 'Big')}
          className="flex items-center justify-between py-3 px-4 rounded-xl bg-gradient-to-r from-[#feaa57] to-[#ff8e3c] hover:from-[#ffb976] hover:to-[#feaa57] text-slate-950 font-black shadow-lg shadow-orange-500/20 active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none"
        >
          <div className="flex flex-col text-left">
            <span className="text-base font-rajdhani tracking-wide">Big</span>
            <span className="text-[10px] font-semibold opacity-90">5, 6, 7, 8, 9</span>
          </div>
          <span className="text-xs bg-black/20 px-2 py-0.5 rounded-full font-bold text-slate-950">
            2X
          </span>
        </button>

        {/* Small (0-4) */}
        <button
          disabled={isLocked}
          onClick={() => handleSelect('size', 'small', 'Small')}
          className="flex items-center justify-between py-3 px-4 rounded-xl bg-gradient-to-r from-[#4ca2ff] to-[#6c5ce7] hover:from-[#62afff] hover:to-[#4ca2ff] text-white font-black shadow-lg shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none"
        >
          <div className="flex flex-col text-left">
            <span className="text-base font-rajdhani tracking-wide">Small</span>
            <span className="text-[10px] font-semibold opacity-90">0, 1, 2, 3, 4</span>
          </div>
          <span className="text-xs bg-black/20 px-2 py-0.5 rounded-full font-bold text-white">
            2X
          </span>
        </button>
      </div>
    </div>
  );
};
