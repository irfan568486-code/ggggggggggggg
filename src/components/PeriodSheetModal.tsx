import React, { useState, useMemo } from 'react';
import { X, Search, FileText, CheckCircle2, Lock, Eye, EyeOff, ShieldCheck, AlertCircle, KeyRound } from 'lucide-react';
import { getPredefinedSizeForRound } from '../utils/wingoRules.ts';
import { sound } from '../utils/audio.ts';

interface PeriodSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPeriodId: string;
}

const SHEET_ACCESS_PASSWORD = '112233';

export const PeriodSheetModal: React.FC<PeriodSheetModalProps> = ({
  isOpen,
  onClose,
  currentPeriodId,
}) => {
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'big' | 'small'>('all');

  // Pre-generate the 1000 periods
  const allPeriods = useMemo(() => {
    const list = [];
    for (let i = 1; i <= 1000; i++) {
      const periodId = `2026110400${String(i).padStart(4, '0')}`;
      const size = getPredefinedSizeForRound(i);
      list.push({
        index: i,
        periodId,
        size, // 'big' | 'small'
      });
    }
    return list;
  }, []);

  const filteredList = useMemo(() => {
    let result = allPeriods;
    if (filter === 'big') {
      result = result.filter((p) => p.size === 'big');
    } else if (filter === 'small') {
      result = result.filter((p) => p.size === 'small');
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.periodId.includes(q) ||
          String(p.index) === q ||
          p.size.toLowerCase() === q
      );
    }

    return result.slice(0, 100); // Display top 100 matches for performance
  }, [allPeriods, filter, searchQuery]);

  const handleClose = () => {
    sound.playClick();
    setIsUnlocked(false);
    setPassword('');
    setErrorMsg('');
    setSearchQuery('');
    setFilter('all');
    onClose();
  };

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim() === SHEET_ACCESS_PASSWORD) {
      sound.playBetPlaced();
      setIsUnlocked(true);
      setErrorMsg('');
    } else {
      sound.playCountdownTick(1);
      setErrorMsg('Incorrect Password! Please try again.');
    }
  };

  const handleLockAgain = () => {
    sound.playClick();
    setIsUnlocked(false);
    setPassword('');
    setErrorMsg('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-150">
      {!isUnlocked ? (
        /* Password Verification Screen */
        <div className="relative w-full max-w-sm rounded-2xl bg-[#141622] border-2 border-amber-500/50 p-5 shadow-2xl space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-md">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base font-rajdhani text-white uppercase tracking-wider">
                  1000 Sheet Security
                </h3>
                <p className="text-[10px] text-amber-400 font-medium">Password Protected Access</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Please enter the 6-digit access password to view the 1000 Period Sequence Sheet.
          </p>

          <form onSubmit={handleUnlock} className="space-y-3.5 text-xs">
            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">
                Access Password
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  autoFocus
                  autoComplete="off"
                  placeholder="Enter Password"
                  className="w-full pl-9 pr-10 py-2 bg-[#0c0e15] border border-slate-700 rounded-xl text-white font-mono text-sm tracking-widest focus:outline-none focus:border-amber-400 placeholder:text-slate-600 placeholder:tracking-normal placeholder:text-xs"
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
              <div className="p-2.5 rounded-xl bg-red-500/15 border border-red-500/40 text-red-400 text-xs flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleClose}
                className="w-1/3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs font-rajdhani uppercase tracking-wider transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!password.trim()}
                className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs font-rajdhani tracking-widest uppercase shadow-lg shadow-amber-500/30 active:scale-95 transition-all disabled:opacity-40"
              >
                Unlock Sheet
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Unlocked 1000 Period Sequence Sheet */
        <div className="relative w-full max-w-md max-h-[88vh] rounded-2xl bg-[#161822] border border-amber-500/40 shadow-2xl overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-3.5 bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 text-slate-950 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate-950" />
              <div>
                <h3 className="font-black text-sm font-rajdhani tracking-wide uppercase">
                  Wingo 30s Sequence Sheet (1000)
                </h3>
                <p className="text-[10px] font-bold text-slate-900 opacity-90">
                  Starting from 20261104000001 · 30s Dedicated Sheet
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleLockAgain}
                title="Lock Sheet"
                className="px-2 py-1 rounded-lg bg-black/20 hover:bg-black/30 flex items-center gap-1 text-[11px] font-bold text-slate-950 transition-colors"
              >
                <Lock className="w-3 h-3" />
                <span>Lock</span>
              </button>
              <button
                onClick={handleClose}
                className="w-7 h-7 rounded-full bg-black/20 hover:bg-black/30 flex items-center justify-center text-slate-950 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search Bar & Filters */}
          <div className="p-3 bg-[#11131c] border-b border-slate-800 space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search period ID (e.g. 20261104000001 or 14)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-[#181a26] border border-slate-700 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    filter === 'all'
                      ? 'bg-amber-400 text-slate-950 font-black'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  All (1000)
                </button>
                <button
                  onClick={() => setFilter('big')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    filter === 'big'
                      ? 'bg-orange-500 text-white font-black'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  BIG
                </button>
                <button
                  onClick={() => setFilter('small')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    filter === 'small'
                      ? 'bg-blue-500 text-white font-black'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  SMALL
                </button>
              </div>

              <span className="text-[10px] text-slate-500">
                Showing {filteredList.length} items
              </span>
            </div>
          </div>

          {/* Sequence List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1.5 divide-y divide-slate-800/40">
            {filteredList.map((item) => {
              const isCurrent = currentPeriodId === item.periodId;
              return (
                <div
                  key={item.periodId}
                  className={`pt-1.5 flex items-center justify-between p-2 rounded-xl text-xs transition-colors ${
                    isCurrent
                      ? 'bg-amber-500/15 border border-amber-500/40'
                      : 'hover:bg-slate-800/30'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-8 font-mono text-[11px] font-bold text-slate-500 text-right">
                      #{item.index}
                    </span>
                    <div>
                      <div className="font-mono font-semibold text-slate-200 text-xs flex items-center gap-1.5">
                        <span>{item.periodId}</span>
                        {isCurrent && (
                          <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-1 rounded uppercase">
                            Live Now
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-rajdhani font-black text-xs uppercase shadow-sm ${
                        item.size === 'big'
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950'
                          : 'bg-gradient-to-r from-blue-500 to-sky-400 text-white'
                      }`}
                    >
                      {item.size.toUpperCase()}
                    </span>
                  </div>
                </div>
              );
            })}

            {filteredList.length === 0 && (
              <div className="py-10 text-center text-slate-500 text-xs">
                No matching period number found.
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 bg-[#11131c] border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Strictly Programmed to 1000 Outcome Sheet</span>
            </div>
            <button
              onClick={handleClose}
              className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
