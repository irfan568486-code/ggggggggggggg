import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, BarChart3, History, UserCheck, Eye } from 'lucide-react';
import { PeriodType, RoundResult, UserBet } from '../types.ts';
import { Ball, ColorDot } from './Ball.tsx';
import { sound } from '../utils/audio.ts';

interface HistoryTabsProps {
  period: PeriodType;
  history: RoundResult[];
  userBets: UserBet[];
  totalHistoryRounds: number;
  currentPage: number;
  onPageChange: (p: number) => void;
  stats?: {
    greenCount: number;
    redCount: number;
    violetCount: number;
    bigCount: number;
    smallCount: number;
    numberCounts: number[];
  };
}

export const HistoryTabs: React.FC<HistoryTabsProps> = ({
  period,
  history,
  userBets,
  totalHistoryRounds,
  currentPage,
  onPageChange,
  stats,
}) => {
  const [activeTab, setActiveTab] = useState<'game' | 'chart' | 'my'>('game');
  const [selectedBetDetail, setSelectedBetDetail] = useState<UserBet | null>(null);

  const totalPages = Math.max(1, Math.ceil(totalHistoryRounds / 10));

  return (
    <div className="rounded-2xl bg-[#171924] border border-slate-800 shadow-xl overflow-hidden">
      {/* Tab Switcher */}
      <div className="grid grid-cols-3 p-1.5 bg-[#12141f] border-b border-slate-800">
        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('game');
          }}
          className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'game'
              ? 'bg-[#202334] text-amber-400 shadow-sm border border-amber-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Game History</span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('chart');
          }}
          className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'chart'
              ? 'bg-[#202334] text-amber-400 shadow-sm border border-amber-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Chart</span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('my');
          }}
          className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'my'
              ? 'bg-[#202334] text-amber-400 shadow-sm border border-amber-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>My History</span>
        </button>
      </div>

      {/* 1. Game History Tab */}
      {activeTab === 'game' && (
        <div className="p-3">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-500 uppercase border-b border-slate-800 pb-2">
                  <th className="py-2 px-1 font-semibold">Period</th>
                  <th className="py-2 px-1 font-semibold text-center">Number</th>
                  <th className="py-2 px-1 font-semibold text-center">Big/Small</th>
                  <th className="py-2 px-1 font-semibold text-center">Color</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {history.map((row) => (
                  <tr key={row.roundId} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2 px-1 text-slate-300 font-medium">
                      {row.roundId.slice(-6)}
                    </td>
                    <td className="py-2 px-1 text-center">
                      <Ball number={row.number} size="sm" />
                    </td>
                    <td className="py-2 px-1 text-center font-rajdhani font-bold text-xs">
                      <span
                        className={
                          row.size === 'big'
                            ? 'text-orange-400'
                            : 'text-blue-400'
                        }
                      >
                        {row.size === 'big' ? 'Big' : 'Small'}
                      </span>
                    </td>
                    <td className="py-2 px-1 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {row.colors.map((c, i) => (
                          <ColorDot key={i} color={c} />
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
                {history.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-500">
                      No game history available yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
            <span className="text-slate-500">
              Page {currentPage} of {totalPages}
            </span>

            <div className="flex items-center gap-1">
              <button
                disabled={currentPage <= 1}
                onClick={() => {
                  sound.playClick();
                  onPageChange(currentPage - 1);
                }}
                className="w-7 h-7 rounded-lg bg-[#202334] border border-slate-700/60 flex items-center justify-center text-slate-300 disabled:opacity-30 disabled:pointer-events-none hover:bg-slate-700"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => {
                  sound.playClick();
                  onPageChange(currentPage + 1);
                }}
                className="w-7 h-7 rounded-lg bg-[#202334] border border-slate-700/60 flex items-center justify-center text-slate-300 disabled:opacity-30 disabled:pointer-events-none hover:bg-slate-700"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Chart (Trend Chart) Tab */}
      {activeTab === 'chart' && (
        <div className="p-3 space-y-3">
          {/* Quick Stats Banner */}
          {stats && (
            <div className="grid grid-cols-5 gap-1.5 text-[11px] bg-[#11131c] p-2 rounded-xl border border-slate-800">
              <div className="text-center">
                <span className="text-emerald-400 font-bold block">{stats.greenCount}</span>
                <span className="text-slate-500 text-[10px]">Green</span>
              </div>
              <div className="text-center">
                <span className="text-purple-400 font-bold block">{stats.violetCount}</span>
                <span className="text-slate-500 text-[10px]">Violet</span>
              </div>
              <div className="text-center">
                <span className="text-red-400 font-bold block">{stats.redCount}</span>
                <span className="text-slate-500 text-[10px]">Red</span>
              </div>
              <div className="text-center">
                <span className="text-orange-400 font-bold block">{stats.bigCount}</span>
                <span className="text-slate-500 text-[10px]">Big</span>
              </div>
              <div className="text-center">
                <span className="text-blue-400 font-bold block">{stats.smallCount}</span>
                <span className="text-slate-500 text-[10px]">Small</span>
              </div>
            </div>
          )}

          {/* Big / Small Bead Road */}
          <div className="bg-[#11131c] p-2.5 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-[11px] mb-2">
              <span className="font-bold text-slate-300">Big / Small Trend Road</span>
              <span className="text-[10px] text-amber-400 font-mono">Seq: 20261104000001+</span>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1">
              {history.slice(0, 30).map((row) => (
                <div
                  key={row.roundId}
                  title={`Round ${row.roundId} -> ${row.size.toUpperCase()} (${row.number})`}
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black font-rajdhani shadow-sm ${
                    row.size === 'big'
                      ? 'bg-gradient-to-tr from-amber-500 to-orange-400 text-slate-950'
                      : 'bg-gradient-to-tr from-blue-500 to-sky-400 text-white'
                  }`}
                >
                  {row.size === 'big' ? 'B' : 'S'}
                </div>
              ))}
            </div>
          </div>

          {/* Trend Matrix Table */}
          <div className="overflow-x-auto relative bg-[#11131c] p-2 rounded-xl border border-slate-800">
            <div className="text-[11px] font-bold text-slate-300 mb-1.5">Number Matrix (0 - 9)</div>
            <table className="w-full text-center text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] text-slate-400">
                  <th className="py-1 px-1 text-left w-14">Period</th>
                  <th className="py-1 px-1 w-8">Num</th>
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                    <th key={n} className="py-1 px-0.5 w-6 text-slate-500 font-mono">
                      {n}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {history.slice(0, 15).map((row) => (
                  <tr key={row.roundId} className="h-7 hover:bg-slate-800/20">
                    <td className="text-left font-mono text-[10px] text-slate-400">
                      {row.roundId.slice(-4)}
                    </td>
                    <td className="font-bold font-rajdhani text-xs text-white">
                      {row.number}
                    </td>
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => {
                      const isMatch = row.number === n;
                      return (
                        <td key={n} className="p-0.5">
                          {isMatch ? (
                            <div className="w-5 h-5 mx-auto rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 font-black text-[11px] flex items-center justify-center shadow-md">
                              {n}
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-600">·</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. My History Tab */}
      {activeTab === 'my' && (
        <div className="p-3">
          {userBets.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              No bets placed for this period yet.
            </div>
          ) : (
            <div className="space-y-2">
              {userBets.map((bet) => (
                <div
                  key={bet.id}
                  onClick={() => {
                    sound.playClick();
                    setSelectedBetDetail(bet);
                  }}
                  className="p-2.5 rounded-xl bg-[#11131c] hover:bg-[#181b29] border border-slate-800/80 cursor-pointer transition-all flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="font-mono text-xs font-semibold text-slate-300">
                        {bet.roundId.slice(-6)}
                      </span>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        {bet.selection}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      ₹{bet.totalAmount} ({bet.baseAmount} × {bet.quantity})
                    </div>
                  </div>

                  <div className="text-right flex items-center gap-2">
                    <div>
                      {bet.status === 'pending' && (
                        <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                          Pending
                        </span>
                      )}
                      {bet.status === 'won' && (
                        <div className="text-xs font-black font-rajdhani text-emerald-400">
                          +₹{bet.payout.toFixed(2)}
                        </div>
                      )}
                      {bet.status === 'lost' && (
                        <div className="text-xs font-bold font-rajdhani text-slate-500">
                          -₹{bet.totalAmount.toFixed(2)}
                        </div>
                      )}
                    </div>
                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Bet Detail Modal */}
      {selectedBetDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-[#161822] border border-slate-700 p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-sm text-white">Bet Order Details</span>
              <button
                onClick={() => setSelectedBetDetail(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Order ID:</span>
                <span className="font-mono text-slate-300 text-[10px]">{selectedBetDetail.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Period:</span>
                <span className="font-mono text-slate-200">{selectedBetDetail.roundId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Contract Money:</span>
                <span className="font-mono text-slate-200">₹{selectedBetDetail.baseAmount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Quantity:</span>
                <span className="font-mono text-slate-200">{selectedBetDetail.quantity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Bet Amount:</span>
                <span className="font-mono text-slate-200 font-bold">₹{selectedBetDetail.totalAmount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Delivery Fee (2%):</span>
                <span className="font-mono text-slate-400">₹{selectedBetDetail.deliveryFee}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Net Contract:</span>
                <span className="font-mono text-slate-300">₹{selectedBetDetail.contractAmount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Your Selection:</span>
                <span className="font-bold text-amber-400 uppercase">{selectedBetDetail.selection}</span>
              </div>
              {selectedBetDetail.status !== 'pending' && (
                <>
                  <div className="flex justify-between border-t border-slate-800 pt-1.5">
                    <span className="text-slate-500">Lottery Result:</span>
                    <span className="font-bold text-white">
                      Number {selectedBetDetail.resultNumber} ({selectedBetDetail.resultSize?.toUpperCase()})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Status:</span>
                    <span
                      className={`font-black uppercase ${
                        selectedBetDetail.status === 'won' ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {selectedBetDetail.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Payout / Profit:</span>
                    <span
                      className={`font-mono font-bold ${
                        selectedBetDetail.status === 'won' ? 'text-emerald-400' : 'text-slate-400'
                      }`}
                    >
                      {selectedBetDetail.status === 'won'
                        ? `+₹${selectedBetDetail.payout.toFixed(2)} (+₹${selectedBetDetail.profit.toFixed(2)})`
                        : `-₹${selectedBetDetail.totalAmount.toFixed(2)}`}
                    </span>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={() => setSelectedBetDetail(null)}
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
