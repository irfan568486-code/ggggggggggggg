import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ArrowDownCircle,
  ArrowUpRight,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  RefreshCw,
  LogOut,
  Copy,
  Check,
  AlertTriangle,
  User,
  Phone,
  Wallet,
  Calendar,
} from 'lucide-react';
import { TransactionRequest, AdminStats, TransactionStatus, TransactionType } from '../types.ts';
import { sound } from '../utils/audio.ts';

interface AdminDashboardProps {
  adminToken: string;
  onLogout: () => void;
  onBackToApp: () => void;
  onTransactionReviewed?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  adminToken,
  onLogout,
  onBackToApp,
  onTransactionReviewed,
}) => {
  const [transactions, setTransactions] = useState<TransactionRequest[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    pendingDepositsCount: 0,
    pendingDepositsAmount: 0,
    pendingWithdrawalsCount: 0,
    pendingWithdrawalsAmount: 0,
    approvedDepositsAmount: 0,
    approvedWithdrawalsAmount: 0,
    totalUsersCount: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);

  // Filters
  const [typeFilter, setTypeFilter] = useState<'all' | 'deposit' | 'withdrawal'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | TransactionStatus>('pending');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Rejection modal
  const [rejectingTx, setRejectingTx] = useState<TransactionRequest | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('Payment verification failed');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const fetchTransactions = async (silent: boolean = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      const params = new URLSearchParams();
      if (typeFilter !== 'all') params.append('type', typeFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const res = await fetch(`/api/admin/transactions?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      if (res.status === 401) {
        onLogout();
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions || []);
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (err) {
      console.error('Admin fetch error:', err);
    } finally {
      setLoading(false);
      if (!silent) setIsRefreshing(false);
    }
  };

  // Initial fetch and auto-refresh
  useEffect(() => {
    fetchTransactions();
  }, [typeFilter, statusFilter, searchQuery]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchTransactions(true);
    }, 4000);
    return () => clearInterval(interval);
  }, [autoRefresh, typeFilter, statusFilter, searchQuery]);

  const handleReview = async (id: string, action: 'approve' | 'reject', adminNote?: string) => {
    sound.playClick();
    setActionLoadingId(id);
    try {
      const res = await fetch(`/api/admin/transactions/${id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          action,
          adminNote: adminNote || (action === 'approve' ? 'Approved by Admin' : 'Rejected by Admin'),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update transaction');
      }

      sound.playBetPlaced();
      showToast(
        `Transaction ${action === 'approve' ? 'APPROVED' : 'REJECTED'} successfully!`,
        action === 'approve' ? 'success' : 'error'
      );
      setRejectingTx(null);
      await fetchTransactions(true);
      onTransactionReviewed?.();
    } catch (err: any) {
      showToast(err?.message || 'Action failed', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    sound.playClick();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0b0d14] text-slate-100 flex flex-col select-none">
      {/* Top Admin Navbar */}
      <header className="sticky top-0 z-40 bg-[#12141f]/95 backdrop-blur-md border-b border-amber-500/30 px-4 py-3 shadow-xl">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-yellow-500 to-amber-300 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950 font-black">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-rajdhani font-black text-xl tracking-wider text-white">
                  13 CLUB ADMIN
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
                  SUPER ADMIN
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Deposit & Withdrawal Approval Gateway
              </p>
            </div>
          </div>

          {/* Quick Header Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold font-rajdhani transition-all flex items-center gap-1.5 ${
                autoRefresh
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
              title="Toggle Live Auto-Sync every 4s"
            >
              <span className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
              <span>{autoRefresh ? 'Live Sync On' : 'Live Sync Off'}</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                fetchTransactions(false);
              }}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-all"
              title="Manual Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onBackToApp();
              }}
              className="px-3 py-1.5 rounded-xl bg-[#1d2133] hover:bg-[#252a42] border border-amber-500/40 text-amber-300 font-bold text-xs font-rajdhani transition-all"
            >
              Back to Player App
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onLogout();
              }}
              className="p-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 transition-all"
              title="Logout Admin"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Floating toast notification */}
      {feedbackMsg && (
        <div className="fixed top-16 right-4 z-50 animate-in slide-in-from-top-2 duration-200">
          <div
            className={`px-4 py-2.5 rounded-xl border shadow-2xl text-xs font-bold flex items-center gap-2 ${
              feedbackMsg.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/60 text-emerald-300'
                : 'bg-rose-950/90 border-rose-500/60 text-rose-300'
            }`}
          >
            {feedbackMsg.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-400" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
        </div>
      )}

      {/* Main Admin Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 space-y-4">
        {/* Metric Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Pending Deposits */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#1c1a24] to-[#12131b] border-2 border-amber-500/40 shadow-lg space-y-1">
            <div className="flex items-center justify-between text-xs text-amber-400 font-bold font-rajdhani uppercase">
              <span className="flex items-center gap-1.5">
                <ArrowDownCircle className="w-4 h-4" /> Pending Deposits
              </span>
              <span className="px-2 py-0.2 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px]">
                {stats.pendingDepositsCount} REQ
              </span>
            </div>
            <div className="font-rajdhani font-black text-2xl text-white">
              <span className="text-amber-400 text-lg mr-1">₹</span>
              {stats.pendingDepositsAmount.toLocaleString('en-IN')}
            </div>
            <p className="text-[10px] text-slate-400">Awaiting UTR payment confirmation</p>
          </div>

          {/* Pending Withdrawals */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#1a1c2a] to-[#12131b] border-2 border-purple-500/40 shadow-lg space-y-1">
            <div className="flex items-center justify-between text-xs text-purple-400 font-bold font-rajdhani uppercase">
              <span className="flex items-center gap-1.5">
                <ArrowUpRight className="w-4 h-4" /> Pending Withdrawals
              </span>
              <span className="px-2 py-0.2 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-[10px]">
                {stats.pendingWithdrawalsCount} REQ
              </span>
            </div>
            <div className="font-rajdhani font-black text-2xl text-white">
              <span className="text-purple-400 text-lg mr-1">₹</span>
              {stats.pendingWithdrawalsAmount.toLocaleString('en-IN')}
            </div>
            <p className="text-[10px] text-slate-400">Funds reserved from user wallets</p>
          </div>

          {/* Total Approved Deposits */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#14201c] to-[#101518] border border-emerald-500/40 shadow-lg space-y-1">
            <div className="text-xs text-emerald-400 font-bold font-rajdhani uppercase flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4" /> Total Approved Deposits
            </div>
            <div className="font-rajdhani font-black text-2xl text-white">
              <span className="text-emerald-400 text-lg mr-1">₹</span>
              {stats.approvedDepositsAmount.toLocaleString('en-IN')}
            </div>
            <p className="text-[10px] text-slate-400">Successfully credited to players</p>
          </div>

          {/* Total Approved Withdrawals */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#151926] to-[#0f121d] border border-sky-500/40 shadow-lg space-y-1">
            <div className="text-xs text-sky-400 font-bold font-rajdhani uppercase flex items-center gap-1.5">
              <Wallet className="w-4 h-4" /> Total Approved Payouts
            </div>
            <div className="font-rajdhani font-black text-2xl text-white">
              <span className="text-sky-400 text-lg mr-1">₹</span>
              {stats.approvedWithdrawalsAmount.toLocaleString('en-IN')}
            </div>
            <p className="text-[10px] text-slate-400">Paid out via UPI to user accounts</p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-3.5 rounded-2xl bg-[#131520] border border-slate-800 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Type selector */}
            <div className="flex items-center gap-1.5 bg-[#0a0c12] p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setTypeFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold font-rajdhani transition-all ${
                  typeFilter === 'all'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All Requests
              </button>
              <button
                onClick={() => setTypeFilter('deposit')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold font-rajdhani transition-all flex items-center gap-1 ${
                  typeFilter === 'deposit'
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                    : 'text-slate-400 hover:text-emerald-400'
                }`}
              >
                <ArrowDownCircle className="w-3.5 h-3.5" />
                <span>Deposits</span>
              </button>
              <button
                onClick={() => setTypeFilter('withdrawal')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold font-rajdhani transition-all flex items-center gap-1 ${
                  typeFilter === 'withdrawal'
                    ? 'bg-purple-500 text-slate-950 font-black shadow-md'
                    : 'text-slate-400 hover:text-purple-400'
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Withdrawals</span>
              </button>
            </div>

            {/* Status selector */}
            <div className="flex items-center gap-1.5 bg-[#0a0c12] p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setStatusFilter('pending')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold font-rajdhani transition-all flex items-center gap-1.5 ${
                  statusFilter === 'pending'
                    ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                    : 'text-amber-400/80 hover:text-amber-300'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Pending ({stats.pendingDepositsCount + stats.pendingWithdrawalsCount})</span>
              </button>
              <button
                onClick={() => setStatusFilter('approved')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold font-rajdhani transition-all ${
                  statusFilter === 'approved'
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Approved
              </button>
              <button
                onClick={() => setStatusFilter('rejected')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold font-rajdhani transition-all ${
                  statusFilter === 'rejected'
                    ? 'bg-rose-500 text-white font-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Rejected
              </button>
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold font-rajdhani transition-all ${
                  statusFilter === 'all'
                    ? 'bg-slate-700 text-white font-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All
              </button>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by UTR number, UPI ID, Phone Number, Username or Request ID..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#0a0c12] border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-amber-400 placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Requests List */}
        <div className="space-y-3">
          {loading ? (
            <div className="p-12 text-center text-slate-500 bg-[#12141f] rounded-2xl border border-slate-800">
              <RefreshCw className="w-8 h-8 mx-auto animate-spin text-amber-500 mb-2" />
              <p className="font-rajdhani text-sm font-bold">Loading transaction records...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-12 text-center text-slate-500 bg-[#12141f] rounded-2xl border border-slate-800 space-y-2">
              <CheckCircle className="w-10 h-10 mx-auto text-emerald-500/40" />
              <h4 className="font-rajdhani font-black text-lg text-slate-300">No Transactions Found</h4>
              <p className="text-xs text-slate-500">
                There are no {statusFilter !== 'all' ? statusFilter : ''} {typeFilter !== 'all' ? typeFilter : ''} requests matching your criteria.
              </p>
            </div>
          ) : (
            transactions.map((tx) => (
              <div
                key={tx.id}
                className={`p-4 rounded-2xl bg-gradient-to-r ${
                  tx.status === 'pending'
                    ? tx.type === 'deposit'
                      ? 'from-[#191a28] to-[#12141d] border-2 border-amber-500/50 shadow-xl'
                      : 'from-[#1c1729] to-[#12141d] border-2 border-purple-500/50 shadow-xl'
                    : 'from-[#131520] to-[#0f1118] border border-slate-800/90 opacity-90'
                } space-y-3 transition-all`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-black font-rajdhani uppercase tracking-wider flex items-center gap-1.5 ${
                        tx.type === 'deposit'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-purple-500/20 text-purple-400 border border-purple-500/40'
                      }`}
                    >
                      {tx.type === 'deposit' ? <ArrowDownCircle className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                      <span>{tx.type.toUpperCase()}</span>
                    </span>

                    <span className="font-mono text-xs text-slate-400">ID: #{tx.id.slice(-8)}</span>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black font-rajdhani uppercase tracking-wider flex items-center gap-1.5 ${
                        tx.status === 'approved'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : tx.status === 'rejected'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/50 animate-pulse'
                      }`}
                    >
                      {tx.status === 'approved' && <CheckCircle className="w-3.5 h-3.5" />}
                      {tx.status === 'rejected' && <XCircle className="w-3.5 h-3.5" />}
                      {tx.status === 'pending' && <Clock className="w-3.5 h-3.5" />}
                      <span>{tx.status}</span>
                    </span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  {/* Amount & User */}
                  <div className="space-y-1">
                    <div className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">
                      Transaction Amount
                    </div>
                    <div className="font-rajdhani font-black text-2xl text-white">
                      <span className="text-amber-400 mr-1">₹</span>
                      {tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5 font-mono">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      <span>{new Date(tx.createdAt * 1000).toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  {/* Player Information */}
                  <div className="space-y-1">
                    <div className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">
                      User Details
                    </div>
                    <div className="font-bold text-white font-rajdhani text-sm flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-amber-400" />
                      <span>{tx.username || '13 CLUB Member'}</span>
                    </div>
                    <div className="text-slate-300 font-mono text-[11px] flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>+91 {tx.phone}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">UID: {tx.userId}</div>
                  </div>

                  {/* Payment Verification / Details */}
                  <div className="space-y-1">
                    <div className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">
                      {tx.type === 'deposit' ? 'Submitted UTR / Ref No' : 'Recipient UPI ID'}
                    </div>

                    {tx.type === 'deposit' ? (
                      <div className="flex items-center gap-2 p-2 bg-[#0c0e15] rounded-xl border border-slate-800">
                        <span className="font-mono font-black text-amber-400 text-xs tracking-wider flex-1 truncate">
                          {tx.utr || 'No UTR provided'}
                        </span>
                        {tx.utr && (
                          <button
                            onClick={() => copyToClipboard(tx.utr!, tx.id)}
                            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] flex items-center gap-1"
                            title="Copy UTR"
                          >
                            {copiedId === tx.id ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                            <span>{copiedId === tx.id ? 'Copied' : 'Copy'}</span>
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 p-2 bg-[#0c0e15] rounded-xl border border-slate-800">
                        <span className="font-mono font-black text-purple-400 text-xs tracking-wider flex-1 truncate">
                          {tx.upiId || 'No UPI ID provided'}
                        </span>
                        {tx.upiId && (
                          <button
                            onClick={() => copyToClipboard(tx.upiId!, tx.id)}
                            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] flex items-center gap-1"
                            title="Copy UPI ID"
                          >
                            {copiedId === tx.id ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                            <span>{copiedId === tx.id ? 'Copied' : 'Copy'}</span>
                          </button>
                        )}
                      </div>
                    )}

                    {/* Admin Note if already reviewed */}
                    {tx.adminNote && (
                      <div className="text-[10px] text-slate-400 italic bg-[#0c0e15] p-1.5 rounded-lg border border-slate-800/80">
                        Admin Note: {tx.adminNote}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons for Pending Request */}
                {tx.status === 'pending' && (
                  <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800/80">
                    <button
                      disabled={actionLoadingId === tx.id}
                      onClick={() => setRejectingTx(tx)}
                      className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-bold text-xs font-rajdhani tracking-wider uppercase active:scale-95 transition-all flex items-center gap-1.5"
                    >
                      <XCircle className="w-4 h-4 text-rose-400" />
                      <span>Reject Request</span>
                    </button>

                    <button
                      disabled={actionLoadingId === tx.id}
                      onClick={() => handleReview(tx.id, 'approve')}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs font-rajdhani tracking-wider uppercase shadow-lg shadow-emerald-500/25 active:scale-95 transition-all flex items-center gap-1.5"
                    >
                      {actionLoadingId === tx.id ? (
                        <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                      ) : (
                        <CheckCircle className="w-4 h-4 stroke-[2.5]" />
                      )}
                      <span>
                        {tx.type === 'deposit'
                          ? `Approve & Credit ₹${tx.amount.toLocaleString('en-IN')}`
                          : `Approve Payout ₹${tx.amount.toLocaleString('en-IN')}`}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </main>

      {/* Reject Modal with reason input */}
      {rejectingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
          <div className="relative w-full max-w-sm rounded-2xl bg-[#141622] border-2 border-rose-500/50 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                <h3 className="font-bold text-base font-rajdhani text-white">
                  Reject {rejectingTx.type === 'deposit' ? 'Deposit' : 'Withdrawal'}
                </h3>
              </div>
              <button onClick={() => setRejectingTx(null)} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-[#0d0f17] border border-slate-800 space-y-1">
                <div className="text-slate-400">Transaction: #{rejectingTx.id}</div>
                <div className="text-white font-bold font-rajdhani text-base">
                  Amount: ₹{rejectingTx.amount.toLocaleString('en-IN')}
                </div>
                <div className="text-slate-400">
                  User: {rejectingTx.username} (+91 {rejectingTx.phone})
                </div>
                {rejectingTx.type === 'withdrawal' && (
                  <p className="text-emerald-400 text-[11px] mt-1">
                    * Reserved amount of ₹{rejectingTx.amount} will be instantly refunded to the user's wallet.
                  </p>
                )}
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  Rejection Reason (Visible to user)
                </label>
                <select
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0c0e15] border border-slate-700 rounded-xl text-white text-xs mb-2"
                >
                  <option value="Invalid or incorrect UTR number">Invalid or incorrect UTR number</option>
                  <option value="Payment not received in official UPI ID">Payment not received in official UPI ID</option>
                  <option value="Amount mismatch with bank receipt">Amount mismatch with bank receipt</option>
                  <option value="Duplicate UTR transaction">Duplicate UTR transaction</option>
                  <option value="Invalid UPI ID provided">Invalid UPI ID provided</option>
                  <option value="Account verification required">Account verification required</option>
                </select>

                <input
                  type="text"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Or enter custom reason..."
                  className="w-full px-3 py-2 bg-[#0c0e15] border border-slate-700 rounded-xl text-white text-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectingTx(null)}
                  className="w-1/2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleReview(rejectingTx.id, 'reject', rejectReason)}
                  className="w-1/2 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs font-rajdhani tracking-wider uppercase shadow-md shadow-rose-600/30"
                >
                  Confirm Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
