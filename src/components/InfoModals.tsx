import React, { useState } from 'react';
import { X, Headphones, Bell, MessageSquare, Shield, CheckCircle, ExternalLink, Send, Copy, Check, ShieldAlert } from 'lucide-react';
import { sound } from '../utils/audio.ts';

export const SupportModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onOpenAdminLogin?: () => void;
  isAdminLoggedIn?: boolean;
  onEnterAdminDashboard?: () => void;
}> = ({
  isOpen,
  onClose,
  onOpenAdminLogin,
  isAdminLoggedIn = false,
  onEnterAdminDashboard,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const telegramId = '@royalkingdomcustomersupport';
  const telegramUrl = 'https://t.me/royalkingdomcustomersupport';

  const handleCopy = () => {
    sound.playClick();
    navigator.clipboard.writeText(telegramId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="relative w-full max-w-sm rounded-2xl bg-[#161822] border border-amber-500/30 p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Headphones className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base font-rajdhani text-white">13 CLUB 24/7 Support</h3>
              <p className="text-[10px] text-amber-400 font-medium">Instant Help & Assistance</p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 text-xs text-slate-300">
          <div className="p-3 bg-[#10121a] rounded-xl border border-slate-800 space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <CheckCircle className="w-4 h-4" />
              <span>24/7 Live Agent Online</span>
            </div>
            <p className="text-slate-400 text-[11px]">
              Response within 30 seconds for deposit, withdrawal & game inquiries.
            </p>
          </div>

          {/* Telegram Support Card */}
          <div className="p-3.5 bg-gradient-to-br from-[#101928] via-[#10141f] to-[#0c0e16] rounded-xl border-2 border-sky-500/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400 shadow-md shadow-sky-500/10">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white font-rajdhani text-sm">24/7 Telegram Support</div>
                  <div className="text-[11px] text-sky-400 font-mono font-semibold">@royalkingdomcustomersupport</div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopy}
                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-[11px] flex items-center gap-1 transition-all"
                title="Copy Telegram ID"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            <a
              href={telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => sound.playClick()}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-black text-xs font-rajdhani tracking-wider uppercase shadow-md shadow-sky-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>CHAT ON TELEGRAM (@royalkingdomcustomersupport)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="p-2.5 bg-[#10121a] rounded-xl border border-slate-800 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
              <Shield className="w-3.5 h-3.5" />
            </div>
            <div className="text-[11px] text-slate-400">
              Only trust official verified handles. We never ask for your password.
            </div>
          </div>

          {/* Separate Admin Login & Dashboard Section under Customer Support */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold font-rajdhani text-xs uppercase tracking-wider">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>Admin Login & Portal</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono">
                Staff Only
              </span>
            </div>

            {isAdminLoggedIn ? (
              <div className="p-3 bg-[#121422] rounded-xl border border-amber-500/40 space-y-2 text-center">
                <div className="flex items-center justify-center gap-1.5 text-emerald-400 text-xs font-bold font-rajdhani">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Admin Session Active</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    onClose();
                    onEnterAdminDashboard?.();
                  }}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs font-rajdhani tracking-wider uppercase shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>Enter Admin Dashboard</span>
                </button>
              </div>
            ) : (
              <div className="p-3 bg-[#121422] rounded-xl border border-amber-500/40 space-y-2">
                <p className="text-[11px] text-slate-400 leading-tight">
                  Authorized staff can log in here to access the Admin Dashboard for deposit and withdrawal reviews.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    onClose();
                    onOpenAdminLogin?.();
                  }}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#1c1f30] via-[#242944] to-[#181b2a] hover:from-[#262c4a] hover:to-[#1e2236] border border-amber-500/50 hover:border-amber-400 text-amber-300 font-bold text-xs font-rajdhani tracking-wider uppercase transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <span>Admin Login Portal</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-all"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export const NotificationModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="relative w-full max-w-sm rounded-2xl bg-[#161822] border border-slate-700 p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base font-rajdhani text-white">Platform Notices</h3>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2 text-xs">
          <div className="p-3 bg-[#10121a] rounded-xl border border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-400">⚡ Wingo 30s High Speed Active</span>
              <span className="text-[10px] text-slate-500">Today</span>
            </div>
            <p className="text-slate-400 text-[11px]">
              The new ultra-fast 30 Seconds round is live! Place quick bets with instant payouts.
            </p>
          </div>

          <div className="p-3 bg-[#10121a] rounded-xl border border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-400">🎁 VIP Daily Rebate</span>
              <span className="text-[10px] text-slate-500">Active</span>
            </div>
            <p className="text-slate-400 text-[11px]">
              Enjoy up to 0.8% betting rebate credited automatically to your 13 CLUB wallet every midnight.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200"
        >
          Got It
        </button>
      </div>
    </div>
  );
};
