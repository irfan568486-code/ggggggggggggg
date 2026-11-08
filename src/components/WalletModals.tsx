import React, { useState, useEffect } from 'react';
import {
  X,
  ArrowDownCircle,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  QrCode,
  Clock,
  ShieldCheck,
  RefreshCw,
  XCircle,
  FileText,
} from 'lucide-react';
import QRCode from 'qrcode';
import { sound } from '../utils/audio.ts';
import { TransactionRequest } from '../types.ts';

const OFFICIAL_UPI_ID = 'iamcattt@naviaxis';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onDepositSubmitted?: () => void;
}

export const DepositModal: React.FC<DepositModalProps> = ({
  isOpen,
  onClose,
  userId,
  onDepositSubmitted,
}) => {
  const [activeTab, setActiveTab] = useState<'deposit' | 'history'>('deposit');
  const [amount, setAmount] = useState<number>(500);
  const [utr, setUtr] = useState<string>('');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [qrLoading, setQrLoading] = useState<boolean>(false);
  const [copiedUpi, setCopiedUpi] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [history, setHistory] = useState<TransactionRequest[]>([]);
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);

  const quickAmounts = [100, 300, 500, 1000, 2000, 5000, 10000];

  // Dynamically generate QR code whenever deposit amount changes
  useEffect(() => {
    if (!isOpen) return;
    const safeAmt = Math.max(100, amount || 100);
    const upiUri = `upi://pay?pa=${encodeURIComponent(OFFICIAL_UPI_ID)}&pn=${encodeURIComponent('13 CLUB')}&am=${safeAmt}&cu=INR&tn=${encodeURIComponent('13CLUB Deposit')}`;

    setQrLoading(true);
    QRCode.toDataURL(upiUri, {
      width: 260,
      margin: 1.5,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    })
      .then((url) => {
        setQrDataUrl(url);
      })
      .catch((err) => {
        console.error('QR generation error:', err);
      })
      .finally(() => {
        setQrLoading(false);
      });
  }, [amount, isOpen]);

  // Fetch deposit history
  const fetchDepositHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch(`/api/transactions/my?userId=${userId}&type=deposit`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data.transactions || []);
      }
    } catch {
      // Ignore
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && activeTab === 'history') {
      fetchDepositHistory();
    }
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  const handleCopyUpi = () => {
    sound.playClick();
    navigator.clipboard.writeText(OFFICIAL_UPI_ID);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleSubmitDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (amount < 100) {
      setErrorMsg('Minimum deposit amount is ₹100');
      return;
    }

    const cleanUtr = utr.trim();
    if (!cleanUtr || cleanUtr.length < 6) {
      setErrorMsg('Please enter a valid 12-digit UTR / Ref Number from your payment');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/transactions/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          amount,
          utr: cleanUtr,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit deposit request');
      }

      sound.playBetPlaced();
      setSuccessMsg(
        `Deposit request for ₹${amount.toLocaleString('en-IN')} submitted! Pending Admin verification. Your wallet balance will be credited after approval.`
      );
      setUtr('');
      onDepositSubmitted?.();
      setTimeout(() => {
        fetchDepositHistory();
      }, 500);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Deposit submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-sm rounded-2xl bg-[#141622] border-2 border-amber-500/40 p-4 shadow-2xl space-y-3.5 my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ArrowDownCircle className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-bold text-base font-rajdhani text-white">Deposit Balance</h3>
              <p className="text-[10px] text-amber-400 font-medium">Instant UPI QR Code · 100% Secure</p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#0d0f17] rounded-xl border border-slate-800 shrink-0">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setActiveTab('deposit');
            }}
            className={`py-1.5 rounded-lg text-xs font-bold font-rajdhani transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'deposit'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Pay & Deposit</span>
          </button>
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setActiveTab('history');
            }}
            className={`py-1.5 rounded-lg text-xs font-bold font-rajdhani transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Deposit Records</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-0.5 custom-scrollbar">
          {activeTab === 'deposit' && (
            <form onSubmit={handleSubmitDeposit} className="space-y-3 text-xs">
              {/* Amount selection */}
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  1. Select or Enter Amount (Min ₹100)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2 font-black text-amber-400 text-base">₹</span>
                  <input
                    type="number"
                    min={100}
                    step={10}
                    value={amount || ''}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full pl-8 pr-3 py-2 bg-[#0c0e15] border border-amber-500/40 rounded-xl text-white font-rajdhani font-black text-lg focus:outline-none focus:border-amber-400"
                    placeholder="500"
                  />
                </div>
              </div>

              {/* Quick amount chips */}
              <div className="grid grid-cols-4 gap-1.5">
                {quickAmounts.map((amt) => (
                  <button
                    type="button"
                    key={amt}
                    onClick={() => {
                      sound.playClick();
                      setAmount(amt);
                    }}
                    className={`py-1.5 rounded-lg text-[11px] font-bold font-rajdhani transition-all ${
                      amount === amt
                        ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                        : 'bg-[#181a28] text-slate-300 hover:bg-[#202334] border border-slate-800'
                    }`}
                  >
                    ₹{amt >= 1000 ? `${amt / 1000}k` : amt}
                  </button>
                ))}
              </div>

              {/* Dynamic QR Code Card */}
              <div className="p-3 bg-gradient-to-b from-[#181a26] to-[#0f111a] rounded-xl border-2 border-amber-500/30 text-center space-y-2">
                <div className="text-[11px] font-bold text-amber-300 flex items-center justify-center gap-1.5 font-rajdhani uppercase tracking-wider">
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Scan QR to Pay ₹{amount.toLocaleString('en-IN')}</span>
                </div>

                <div className="inline-block p-2 rounded-xl bg-white shadow-xl mx-auto border-2 border-amber-400/80">
                  {qrLoading || !qrDataUrl ? (
                    <div className="w-[180px] h-[180px] flex items-center justify-center bg-slate-100 text-slate-400">
                      <RefreshCw className="w-6 h-6 animate-spin text-amber-500" />
                    </div>
                  ) : (
                    <img
                      src={qrDataUrl}
                      alt={`UPI QR for ${amount}`}
                      className="w-[180px] h-[180px] object-contain block mx-auto"
                    />
                  )}
                </div>

                {/* Official UPI ID box */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-[#0a0c12] border border-slate-800">
                  <div className="text-left">
                    <div className="text-[9px] uppercase font-bold text-slate-400">UPI ID</div>
                    <div className="font-mono font-black text-amber-400 text-xs">{OFFICIAL_UPI_ID}</div>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyUpi}
                    className="px-2.5 py-1 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] flex items-center gap-1 active:scale-95 transition-all"
                  >
                    {copiedUpi ? (
                      <>
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy UPI</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Step 3: Enter UTR */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300 block">
                  2. Enter 12-Digit UTR / Transaction ID
                </label>
                <input
                  type="text"
                  maxLength={24}
                  value={utr}
                  onChange={(e) => setUtr(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                  placeholder="e.g. 431089201948"
                  className="w-full px-3 py-2 bg-[#0c0e15] border border-slate-700 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-amber-400 uppercase tracking-widest placeholder:tracking-normal placeholder:text-slate-600"
                />
                <p className="text-[10px] text-slate-400">
                  UTR is visible in your GPay / PhonePe / Paytm payment receipt details.
                </p>
              </div>

              {/* Feedback messages */}
              {errorMsg && (
                <div className="p-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-[11px] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || amount < 100 || !utr.trim()}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs font-rajdhani tracking-wider uppercase shadow-lg shadow-emerald-500/25 active:scale-95 transition-all disabled:opacity-40"
              >
                {loading ? 'Verifying & Submitting...' : `Submit Deposit of ₹${amount.toLocaleString('en-IN')}`}
              </button>

              <div className="flex items-center gap-1.5 justify-center text-[10px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Deposits are credited immediately after Admin verification</span>
              </div>
            </form>
          )}

          {activeTab === 'history' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 pb-1">
                <span className="font-bold">Your Deposit Requests</span>
                <button
                  onClick={fetchDepositHistory}
                  className="text-amber-400 hover:text-amber-300 flex items-center gap-1 text-[11px]"
                >
                  <RefreshCw className={`w-3 h-3 ${historyLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>

              {historyLoading ? (
                <div className="p-8 text-center text-slate-500">
                  <RefreshCw className="w-5 h-5 mx-auto animate-spin text-amber-500 mb-2" />
                  <span className="text-xs">Loading records...</span>
                </div>
              ) : history.length === 0 ? (
                <div className="p-8 text-center text-slate-500 bg-[#0d0f17] rounded-xl border border-slate-800">
                  <ArrowDownCircle className="w-7 h-7 mx-auto mb-1 text-slate-600" />
                  <p className="text-xs">No deposit requests yet.</p>
                </div>
              ) : (
                history.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-2.5 rounded-xl bg-[#0f111a] border border-slate-800 space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-rajdhani font-black text-white text-sm">
                        ₹{tx.amount.toLocaleString('en-IN')}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-rajdhani ${
                          tx.status === 'approved'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : tx.status === 'rejected'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse'
                        }`}
                      >
                        {tx.status}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 font-mono flex items-center justify-between">
                      <span>UTR: {tx.utr || 'N/A'}</span>
                      <span>{new Date(tx.createdAt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    {tx.adminNote && (
                      <div className="text-[10px] text-slate-400 italic bg-[#090b10] p-1.5 rounded">
                        Note: {tx.adminNote}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBalance: number;
  userId: string;
  onWithdrawSubmitted?: (newBalance: number) => void;
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({
  isOpen,
  onClose,
  currentBalance,
  userId,
  onWithdrawSubmitted,
}) => {
  const [activeTab, setActiveTab] = useState<'withdraw' | 'history'>('withdraw');
  const [amount, setAmount] = useState<number>(500);
  const [upiId, setUpiId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [history, setHistory] = useState<TransactionRequest[]>([]);
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);

  const quickAmounts = [100, 500, 1000, 2000, 5000];

  const fetchWithdrawHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch(`/api/transactions/my?userId=${userId}&type=withdrawal`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data.transactions || []);
      }
    } catch {
      // Ignore
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && activeTab === 'history') {
      fetchWithdrawHistory();
    }
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (amount < 100) {
      setErrorMsg('Minimum withdrawal amount is ₹100');
      return;
    }

    if (amount > currentBalance) {
      setErrorMsg(`Withdrawal amount (₹${amount}) exceeds your available balance (₹${currentBalance})`);
      return;
    }

    const cleanUpi = upiId.trim();
    if (!cleanUpi || !cleanUpi.includes('@') || cleanUpi.length < 5) {
      setErrorMsg('Please enter a valid UPI ID (e.g. mobile@upi, yourname@okaxis)');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/transactions/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          amount,
          upiId: cleanUpi,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit withdrawal request');
      }

      sound.playBetPlaced();
      setSuccessMsg(
        `Withdrawal request for ₹${amount.toLocaleString('en-IN')} submitted! Amount has been reserved. Waiting for Admin approval.`
      );

      if (typeof data.balance === 'number') {
        onWithdrawSubmitted?.(data.balance);
      }

      setTimeout(() => {
        fetchWithdrawHistory();
      }, 500);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Withdrawal request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-sm rounded-2xl bg-[#141622] border-2 border-amber-500/40 p-4 shadow-2xl space-y-3.5 my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-bold text-base font-rajdhani text-white">Withdrawal Request</h3>
              <p className="text-[10px] text-amber-400 font-medium">Direct UPI Payout · Fast Verification</p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#0d0f17] rounded-xl border border-slate-800 shrink-0">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setActiveTab('withdraw');
            }}
            className={`py-1.5 rounded-lg text-xs font-bold font-rajdhani transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'withdraw'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Request Payout</span>
          </button>
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setActiveTab('history');
            }}
            className={`py-1.5 rounded-lg text-xs font-bold font-rajdhani transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Payout Records</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-0.5 custom-scrollbar">
          {activeTab === 'withdraw' && (
            <form onSubmit={handleWithdraw} className="space-y-3 text-xs">
              {/* Available balance indicator */}
              <div className="p-3 bg-gradient-to-r from-[#181a28] to-[#10121d] rounded-xl border border-amber-500/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                    Available Balance
                  </span>
                  <div className="font-rajdhani font-black text-xl text-white">
                    <span className="text-amber-400 mr-1">₹</span>
                    {currentBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAmount(Math.floor(currentBalance))}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-[11px] font-rajdhani"
                >
                  Withdraw All
                </button>
              </div>

              {/* Amount input */}
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  Withdrawal Amount (Min ₹100)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2 font-black text-amber-400 text-base">₹</span>
                  <input
                    type="number"
                    min={100}
                    max={currentBalance}
                    value={amount || ''}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full pl-8 pr-3 py-2 bg-[#0c0e15] border border-amber-500/40 rounded-xl text-white font-rajdhani font-black text-lg focus:outline-none focus:border-amber-400"
                    placeholder="500"
                  />
                </div>
              </div>

              {/* Quick Amount Chips */}
              <div className="grid grid-cols-5 gap-1">
                {quickAmounts.map((amt) => (
                  <button
                    type="button"
                    key={amt}
                    onClick={() => {
                      sound.playClick();
                      setAmount(amt);
                    }}
                    className={`py-1.5 rounded-lg text-[11px] font-bold font-rajdhani transition-all ${
                      amount === amt
                        ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                        : 'bg-[#181a28] text-slate-300 hover:bg-[#202334] border border-slate-800'
                    }`}
                  >
                    ₹{amt >= 1000 ? `${amt / 1000}k` : amt}
                  </button>
                ))}
              </div>

              {/* UPI ID field */}
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  Receiving UPI ID
                </label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value.trim())}
                  placeholder="e.g. 9876543210@paytm, name@okaxis"
                  className="w-full px-3 py-2 bg-[#0c0e15] border border-slate-700 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-amber-400 placeholder:text-slate-600"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Please verify your UPI ID carefully before submitting.
                </p>
              </div>

              {/* Error & Success */}
              {errorMsg && (
                <div className="p-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-[11px] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || amount < 100 || amount > currentBalance || !upiId.includes('@')}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs font-rajdhani tracking-wider uppercase shadow-lg shadow-amber-500/25 active:scale-95 transition-all disabled:opacity-40"
              >
                {loading ? 'Submitting Request...' : `Submit Request for ₹${amount.toLocaleString('en-IN')}`}
              </button>

              <div className="p-2.5 rounded-xl bg-[#0d0f17] border border-slate-800 space-y-1 text-[10px] text-slate-400">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Admin Approval Process</span>
                </div>
                <p>
                  1. The requested amount is reserved from your balance immediately to avoid double spend.
                </p>
                <p>
                  2. Once Admin approves, funds are transferred directly to your UPI ID.
                </p>
                <p>
                  3. If rejected by Admin, the reserved amount is instantly refunded back to your wallet.
                </p>
              </div>
            </form>
          )}

          {activeTab === 'history' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 pb-1">
                <span className="font-bold">Your Withdrawal Requests</span>
                <button
                  onClick={fetchWithdrawHistory}
                  className="text-amber-400 hover:text-amber-300 flex items-center gap-1 text-[11px]"
                >
                  <RefreshCw className={`w-3 h-3 ${historyLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>

              {historyLoading ? (
                <div className="p-8 text-center text-slate-500">
                  <RefreshCw className="w-5 h-5 mx-auto animate-spin text-amber-500 mb-2" />
                  <span className="text-xs">Loading records...</span>
                </div>
              ) : history.length === 0 ? (
                <div className="p-8 text-center text-slate-500 bg-[#0d0f17] rounded-xl border border-slate-800">
                  <ArrowUpRight className="w-7 h-7 mx-auto mb-1 text-slate-600" />
                  <p className="text-xs">No withdrawal requests yet.</p>
                </div>
              ) : (
                history.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-2.5 rounded-xl bg-[#0f111a] border border-slate-800 space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-rajdhani font-black text-white text-sm">
                        ₹{tx.amount.toLocaleString('en-IN')}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-rajdhani ${
                          tx.status === 'approved'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : tx.status === 'rejected'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse'
                        }`}
                      >
                        {tx.status}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 font-mono flex items-center justify-between">
                      <span>UPI: {tx.upiId || 'N/A'}</span>
                      <span>{new Date(tx.createdAt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    {tx.adminNote && (
                      <div className="text-[10px] text-slate-400 italic bg-[#090b10] p-1.5 rounded">
                        Note: {tx.adminNote}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
