import React, { useState } from 'react';
import {
  Crown,
  User,
  Phone,
  Wallet,
  ArrowDownCircle,
  ArrowUpRight,
  History,
  ShieldCheck,
  Headphones,
  FileText,
  LogOut,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Award,
  RefreshCw,
  CheckCircle2,
  Clock,
  ArrowLeft,
} from 'lucide-react';
import { UserProfile, UserBet, TransactionRequest } from '../types.ts';
import { sound } from '../utils/audio.ts';

interface ProfileScreenProps {
  user: UserProfile;
  userBets: UserBet[];
  onOpenDeposit: () => void;
  onOpenWithdraw: () => void;
  onOpenRules: () => void;
  onOpenSupport: () => void;
  onLogout: () => void;
  onBackToHome: () => void;
  onRefreshBalance: () => void;
  onOpenAdminLogin?: () => void;
  isAdminLoggedIn?: boolean;
  onEnterAdminDashboard?: () => void;
  onAdminLoginSuccess?: (token: string) => void;
  onAdminLogout?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  user,
  userBets,
  onOpenDeposit,
  onOpenWithdraw,
  onOpenRules,
  onOpenSupport,
  onLogout,
  onBackToHome,
  onRefreshBalance,
  onOpenAdminLogin,
  isAdminLoggedIn = false,
  onEnterAdminDashboard,
  onAdminLoginSuccess,
  onAdminLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'bets' | 'transactions'>('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [transactions, setTransactions] = useState<TransactionRequest[]>([]);

  const fetchTransactions = async () => {
    try {
      const res = await fetch(`/api/transactions/my?userId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions || []);
      }
    } catch {
      // Ignore
    }
  };

  React.useEffect(() => {
    fetchTransactions();
  }, [user.id]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    sound.playClick();
    onRefreshBalance();
    fetchTransactions();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const wonBets = userBets.filter((b) => b.status === 'won');
  const totalWinnings = wonBets.reduce((acc, b) => acc + (b.payout || 0), 0);

  return (
    <div className="min-h-screen bg-[#0e1017] text-slate-100 pb-24 select-none">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#161822]/95 backdrop-blur-md border-b border-amber-500/20 px-4 py-3">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sound.playClick();
                onBackToHome();
              }}
              className="w-8 h-8 rounded-full bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-300 hover:text-amber-400 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h1 className="font-rajdhani text-xl font-black tracking-wider text-white">
              MY PROFILE & WALLET
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className={`w-8 h-8 rounded-full bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-300 hover:text-amber-400 transition-colors ${
                isRefreshing ? 'animate-spin text-amber-400' : ''
              }`}
              title="Refresh Balance"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                sound.playClick();
                onOpenSupport();
              }}
              className="w-8 h-8 rounded-full bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-300 hover:text-amber-400 transition-colors"
              title="Customer Support"
            >
              <Headphones className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-md mx-auto p-3 space-y-4">
        {/* User Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1d2030] via-[#161824] to-[#10121c] border border-amber-500/30 p-4 shadow-xl">
          <div className="flex items-center gap-3">
            {/* Avatar with crown */}
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 p-0.5 shadow-lg shadow-amber-500/20">
                <div className="w-full h-full rounded-2xl bg-[#161822] flex items-center justify-center">
                  <User className="w-7 h-7 text-amber-400" />
                </div>
              </div>
              <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center shadow-md">
                <Crown className="w-3.5 h-3.5 text-slate-950 fill-slate-950" />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="font-rajdhani font-black text-lg text-white">
                  {user.username || '13 CLUB Member'}
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase font-rajdhani tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  VIP {user.vipLevel || 1}
                </span>
              </div>
              <div className="text-xs text-slate-400 font-mono flex items-center gap-2 mt-0.5">
                <span>+91 {user.phone ? `${user.phone.slice(0, 3)}****${user.phone.slice(-3)}` : '9876543210'}</span>
                <span>•</span>
                <span>UID: {user.id ? user.id.slice(-6).toUpperCase() : '889201'}</span>
              </div>
            </div>
          </div>

          {/* VIP Progress */}
          <div className="mt-3 pt-3 border-t border-slate-800">
            <div className="flex items-center justify-between text-[11px] mb-1 font-rajdhani">
              <span className="text-slate-400">VIP 1 Privilege Level</span>
              <span className="text-amber-400 font-bold">Progress 65% to VIP 2</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div className="w-[65%] h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-400" />
            </div>
          </div>
        </div>

        {/* Wallet & Balance Action Card */}
        <div className="rounded-2xl bg-gradient-to-br from-[#1a1c29] via-[#141620] to-[#0d0f16] border-2 border-amber-500/35 p-4 shadow-2xl space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Wallet className="w-4 h-4 text-amber-400" /> Total Balance
              </span>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                INSTANT PAYOUTS
              </span>
            </div>
            <div className="font-rajdhani text-3xl font-black text-white mt-1">
              <span className="text-amber-400 mr-1 text-2xl">₹</span>
              {user.balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          {/* Deposit and Withdraw Big Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              onClick={() => {
                sound.playClick();
                onOpenDeposit();
              }}
              className="py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs font-rajdhani tracking-wider uppercase shadow-lg shadow-emerald-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <ArrowDownCircle className="w-4 h-4 stroke-[2.5]" />
              <span>DEPOSIT MONEY</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onOpenWithdraw();
              }}
              className="py-3 rounded-xl bg-gradient-to-r from-[#222638] to-[#2c324b] hover:from-[#2a2f46] hover:to-[#353d5a] border border-amber-500/40 text-amber-300 font-black text-xs font-rajdhani tracking-wider uppercase shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
              <span>REQUEST WITHDRAWAL</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-3 rounded-xl bg-[#141620] border border-slate-800 text-center">
            <div className="text-[10px] text-slate-400 uppercase font-bold font-rajdhani">Total Bets</div>
            <div className="font-rajdhani font-black text-base text-white mt-0.5">
              {userBets.length || user.totalBets || 0}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#141620] border border-slate-800 text-center">
            <div className="text-[10px] text-slate-400 uppercase font-bold font-rajdhani">Total Winnings</div>
            <div className="font-rajdhani font-black text-base text-emerald-400 mt-0.5">
              ₹{totalWinnings > 0 ? totalWinnings.toLocaleString('en-IN') : (user.totalWon || 0).toLocaleString('en-IN')}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#141620] border border-slate-800 text-center">
            <div className="text-[10px] text-slate-400 uppercase font-bold font-rajdhani">Win Rate</div>
            <div className="font-rajdhani font-black text-base text-amber-400 mt-0.5">
              {userBets.length > 0 ? Math.round((wonBets.length / userBets.length) * 100) : 75}%
            </div>
          </div>
        </div>

        {/* Profile Tabs */}
        <div className="flex border-b border-slate-800">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-2 text-xs font-bold font-rajdhani uppercase tracking-wider transition-all border-b-2 ${
              activeTab === 'overview'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Services
          </button>
          <button
            onClick={() => setActiveTab('bets')}
            className={`flex-1 py-2 text-xs font-bold font-rajdhani uppercase tracking-wider transition-all border-b-2 ${
              activeTab === 'bets'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Bets ({userBets.length})
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`flex-1 py-2 text-xs font-bold font-rajdhani uppercase tracking-wider transition-all border-b-2 ${
              activeTab === 'transactions'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Transactions ({transactions.length})
          </button>
        </div>

        {/* Tab 1: Account Services List */}
        {activeTab === 'overview' && (
          <div className="space-y-2">
            <button
              onClick={() => {
                sound.playClick();
                onOpenDeposit();
              }}
              className="w-full p-3 rounded-xl bg-[#141620] border border-slate-800 hover:border-amber-500/30 flex items-center justify-between text-left transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <ArrowDownCircle className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white font-rajdhani">Deposit Balance</div>
                  <div className="text-[11px] text-slate-400">Instant UPI, PhonePe, Paytm deposit</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onOpenWithdraw();
              }}
              className="w-full p-3 rounded-xl bg-[#141620] border border-slate-800 hover:border-amber-500/30 flex items-center justify-between text-left transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white font-rajdhani">Withdraw Funds</div>
                  <div className="text-[11px] text-slate-400">Direct transfer to your bank or UPI</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onOpenRules();
              }}
              className="w-full p-3 rounded-xl bg-[#141620] border border-slate-800 hover:border-amber-500/30 flex items-center justify-between text-left transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white font-rajdhani">Wingo Game Rules</div>
                  <div className="text-[11px] text-slate-400">Color multipliers, Big/Small criteria</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onOpenSupport();
              }}
              className="w-full p-3 rounded-xl bg-[#141620] border border-slate-800 hover:border-amber-500/30 flex items-center justify-between text-left transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <Headphones className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white font-rajdhani">24/7 Live Customer Service</div>
                  <div className="text-[11px] text-amber-400 font-mono">Telegram: @royalkingdomcustomersupport</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        )}

        {/* Tab 2: User Bet History */}
        {activeTab === 'bets' && (
          <div className="space-y-2">
            {userBets.length === 0 ? (
              <div className="p-8 text-center text-slate-500 bg-[#141620] rounded-xl border border-slate-800">
                <History className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                <p className="text-xs">No bets placed yet.</p>
                <button
                  onClick={() => {
                    sound.playClick();
                    onBackToHome();
                  }}
                  className="mt-3 px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs font-rajdhani"
                >
                  Play Win Go Now
                </button>
              </div>
            ) : (
              userBets.slice(0, 10).map((bet) => (
                <div
                  key={bet.id}
                  className="p-3 rounded-xl bg-[#141620] border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-white font-rajdhani">
                      {bet.period} · Round #{bet.roundId.slice(-6)}
                    </div>
                    <div className="text-slate-400 text-[11px] capitalize mt-0.5">
                      Bet on: <span className="font-bold text-amber-400">{String(bet.selection)}</span> (₹{bet.totalAmount})
                    </div>
                  </div>

                  <div className="text-right">
                    {bet.status === 'won' && (
                      <span className="font-bold font-rajdhani text-emerald-400 text-sm">
                        +₹{bet.payout?.toFixed(2)}
                      </span>
                    )}
                    {bet.status === 'lost' && (
                      <span className="font-bold font-rajdhani text-rose-400 text-sm">
                        -₹{bet.totalAmount.toFixed(2)}
                      </span>
                    )}
                    {bet.status === 'pending' && (
                      <span className="font-bold font-rajdhani text-amber-400 text-xs">
                        Pending
                      </span>
                    )}
                    <div className="text-[10px] text-slate-500 uppercase">{bet.status}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: User Deposit & Withdrawal Transactions */}
        {activeTab === 'transactions' && (
          <div className="space-y-2">
            {transactions.length === 0 ? (
              <div className="p-8 text-center text-slate-500 bg-[#141620] rounded-xl border border-slate-800 space-y-2">
                <Wallet className="w-8 h-8 mx-auto mb-1 text-slate-600" />
                <p className="text-xs">No deposit or withdrawal requests yet.</p>
                <div className="flex gap-2 justify-center pt-1">
                  <button
                    onClick={() => {
                      sound.playClick();
                      onOpenDeposit();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs font-rajdhani"
                  >
                    Deposit Now
                  </button>
                  <button
                    onClick={() => {
                      sound.playClick();
                      onOpenWithdraw();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#202436] text-amber-300 font-bold text-xs font-rajdhani border border-amber-500/30"
                  >
                    Withdraw
                  </button>
                </div>
              </div>
            ) : (
              transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="p-3 rounded-xl bg-[#141620] border border-slate-800 space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-black font-rajdhani uppercase ${
                          tx.type === 'deposit'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                        }`}
                      >
                        {tx.type}
                      </span>
                      <span className="font-bold text-white font-rajdhani text-sm">
                        ₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase font-rajdhani tracking-wider ${
                        tx.status === 'approved'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : tx.status === 'rejected'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                      }`}
                    >
                      {tx.status}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400 font-mono flex items-center justify-between">
                    <span>{tx.type === 'deposit' ? `UTR: ${tx.utr || 'N/A'}` : `UPI: ${tx.upiId || 'N/A'}`}</span>
                    <span>{new Date(tx.createdAt * 1000).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  {tx.adminNote && (
                    <div className="text-[10px] text-slate-400 italic bg-[#0c0e15] p-1.5 rounded border border-slate-800/80">
                      Admin: {tx.adminNote}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Logout Section */}
        <div className="pt-4">
          {confirmLogout ? (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-center space-y-3">
              <p className="text-xs text-red-300 font-bold">Are you sure you want to log out from 13 CLUB?</p>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => {
                    sound.playClick();
                    setConfirmLogout(false);
                  }}
                  className="px-4 py-1.5 rounded-lg bg-[#202334] text-slate-300 font-bold text-xs font-rajdhani"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    sound.playClick();
                    onLogout();
                  }}
                  className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs font-rajdhani"
                >
                  Yes, Log Out
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => {
                sound.playClick();
                setConfirmLogout(true);
              }}
              className="w-full py-3 rounded-xl bg-[#181a26] hover:bg-red-500/15 border border-slate-800 hover:border-red-500/40 text-slate-400 hover:text-red-400 font-bold text-xs font-rajdhani tracking-wider uppercase transition-all flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>LOG OUT OF 13 CLUB</span>
            </button>
          )}
        </div>
      </main>
    </div>
  );
};
