import React, { useState, useEffect } from 'react';
import { X, Minus, Plus, CheckSquare, Square, AlertCircle } from 'lucide-react';
import { BetSelection, PeriodType, PERIOD_CONFIGS, UserProfile } from '../types.ts';
import { sound } from '../utils/audio.ts';

interface BetModalProps {
  isOpen: boolean;
  onClose: () => void;
  selection: BetSelection | null;
  period: PeriodType;
  user: UserProfile;
  initialMultiplier: number;
  onConfirmBet: (baseAmount: number, quantity: number) => Promise<void>;
  onOpenDeposit: () => void;
}

export const BetModal: React.FC<BetModalProps> = ({
  isOpen,
  onClose,
  selection,
  period,
  user,
  initialMultiplier,
  onConfirmBet,
  onOpenDeposit,
}) => {
  const [baseAmount, setBaseAmount] = useState<number>(10);
  const [quantity, setQuantity] = useState<number>(initialMultiplier || 1);
  const [agreed, setAgreed] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setQuantity(initialMultiplier || 1);
      setErrorMsg('');
      setSubmitting(false);
    }
  }, [isOpen, initialMultiplier]);

  if (!isOpen || !selection) return null;

  const baseAmounts = [1, 10, 100, 1000];
  const multipliers = [1, 5, 10, 20, 50, 100];

  const totalAmount = baseAmount * quantity;
  const deliveryFee = Math.round(totalAmount * 0.02 * 100) / 100;
  const contractAmount = Math.round((totalAmount - deliveryFee) * 100) / 100;
  const hasInsufficientBalance = user.balance < totalAmount;

  const getHeaderGradient = () => {
    if (selection.category === 'color') {
      if (selection.value === 'green') return 'from-[#10ac84] to-[#1dd1a1]';
      if (selection.value === 'violet') return 'from-[#673ab7] to-[#ba68c8]';
      return 'from-[#d63031] to-[#ff7675]';
    }
    if (selection.category === 'size') {
      if (selection.value === 'big') return 'from-[#ff8e3c] to-[#feaa57]';
      return 'from-[#4ca2ff] to-[#6c5ce7]';
    }
    // Number
    const n = parseInt(selection.value, 10);
    if (n === 0) return 'from-[#d63031] via-[#9c27b0] to-[#673ab7]';
    if (n === 5) return 'from-[#10ac84] via-[#9c27b0] to-[#673ab7]';
    if (n % 2 === 1) return 'from-[#10ac84] to-[#1dd1a1]';
    return 'from-[#d63031] to-[#ff7675]';
  };

  const handleConfirm = async () => {
    if (!agreed) {
      setErrorMsg('Please accept the presale rules');
      return;
    }
    if (hasInsufficientBalance) {
      setErrorMsg('Insufficient wallet balance');
      return;
    }
    setErrorMsg('');
    setSubmitting(true);
    try {
      await onConfirmBet(baseAmount, quantity);
      sound.playBetPlaced();
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to place bet');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full max-w-md bg-[#161822] rounded-t-3xl sm:rounded-2xl border border-slate-700/80 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-6 duration-200">
        {/* Header */}
        <div
          className={`px-4 py-3 bg-gradient-to-r ${getHeaderGradient()} text-white flex items-center justify-between shadow-md`}
        >
          <div>
            <div className="text-[11px] font-semibold opacity-90 uppercase tracking-wider">
              {PERIOD_CONFIGS[period].name}
            </div>
            <div className="text-base font-black font-rajdhani tracking-wide">
              Select: {selection.label}
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-7 h-7 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          {/* Balance row */}
          <div className="flex items-center justify-between text-xs bg-[#10121a] px-3 py-2 rounded-xl border border-slate-800">
            <span className="text-slate-400">Available Balance</span>
            <div className="flex items-center gap-2">
              <span className="font-rajdhani font-black text-amber-400 text-sm">
                ₹{user.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
              {hasInsufficientBalance && (
                <button
                  onClick={() => {
                    sound.playClick();
                    onOpenDeposit();
                  }}
                  className="text-[10px] bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded transition-colors"
                >
                  Deposit
                </button>
              )}
            </div>
          </div>

          {/* Contract Money selector */}
          <div>
            <div className="text-xs font-semibold text-slate-300 mb-1.5">Contract Money</div>
            <div className="grid grid-cols-4 gap-2">
              {baseAmounts.map((amt) => (
                <button
                  key={amt}
                  onClick={() => {
                    sound.playClick();
                    setBaseAmount(amt);
                  }}
                  className={`py-2 rounded-xl font-rajdhani text-sm font-bold transition-all ${
                    baseAmount === amt
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'bg-[#202334] text-slate-300 hover:bg-[#282c42] border border-slate-700/60'
                  }`}
                >
                  ₹{amt}
                </button>
              ))}
            </div>
          </div>

          {/* Number of Bets Stepper */}
          <div>
            <div className="text-xs font-semibold text-slate-300 mb-1.5">Quantity / Multiplier</div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  sound.playClick();
                  setQuantity((prev) => Math.max(1, prev - 1));
                }}
                className="w-10 h-10 rounded-xl bg-[#202334] border border-slate-700 flex items-center justify-center text-slate-200 hover:bg-[#282c42] active:scale-95 transition-all"
              >
                <Minus className="w-4 h-4" />
              </button>

              <input
                type="number"
                min={1}
                max={1000}
                value={quantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setQuantity(isNaN(val) ? 1 : Math.max(1, Math.min(1000, val)));
                }}
                className="flex-1 h-10 bg-[#10121a] border border-slate-700 rounded-xl text-center font-rajdhani font-black text-lg text-white focus:outline-none focus:border-amber-400"
              />

              <button
                onClick={() => {
                  sound.playClick();
                  setQuantity((prev) => prev + 1);
                }}
                className="w-10 h-10 rounded-xl bg-[#202334] border border-slate-700 flex items-center justify-center text-slate-200 hover:bg-[#282c42] active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick multiplier chips */}
          <div className="grid grid-cols-6 gap-1.5">
            {multipliers.map((m) => (
              <button
                key={m}
                onClick={() => {
                  sound.playClick();
                  setQuantity(m);
                }}
                className={`py-1 rounded-lg text-xs font-bold font-rajdhani transition-all ${
                  quantity === m
                    ? 'bg-amber-400 text-slate-950 font-black'
                    : 'bg-[#1a1d2c] hover:bg-[#22263a] text-slate-400 border border-slate-800'
                }`}
              >
                X{m}
              </button>
            ))}
          </div>

          {/* Calculation summary */}
          <div className="text-xs text-slate-400 space-y-1 bg-[#10121a] p-2.5 rounded-xl border border-slate-800/80">
            <div className="flex justify-between">
              <span>Total Contract:</span>
              <span className="font-mono text-slate-200">
                ₹{baseAmount} × {quantity} = ₹{totalAmount}
              </span>
            </div>
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>Service Fee (2%):</span>
              <span className="font-mono">₹{deliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[11px] text-emerald-400">
              <span>Net Contract Amount:</span>
              <span className="font-mono font-bold">₹{contractAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Presale agreement */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sound.playClick();
                setAgreed(!agreed);
              }}
              className="text-amber-400 hover:text-amber-300"
            >
              {agreed ? (
                <CheckSquare className="w-4 h-4 text-amber-400" />
              ) : (
                <Square className="w-4 h-4 text-slate-500" />
              )}
            </button>
            <span className="text-xs text-slate-400">
              I agree to the <span className="text-amber-400 underline">Pre-sale Rules</span>
            </span>
          </div>

          {/* Error display */}
          {errorMsg && (
            <div className="flex items-center gap-1.5 text-xs text-red-400 bg-red-500/10 p-2 rounded-lg border border-red-500/20">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
            >
              Cancel
            </button>

            <button
              disabled={submitting || hasInsufficientBalance || !agreed}
              onClick={handleConfirm}
              className={`py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-1`}
            >
              <span>{submitting ? 'Placing...' : `Total ₹${totalAmount}`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
