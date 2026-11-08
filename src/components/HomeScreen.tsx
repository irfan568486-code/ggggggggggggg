import React, { useState, useEffect } from 'react';
import {
  Crown,
  Volume2,
  VolumeX,
  Headphones,
  Bell,
  ArrowRight,
  Flame,
  Wallet,
  ArrowDownCircle,
  ArrowUpRight,
  HelpCircle,
  ChevronRight,
  Play,
  Award,
} from 'lucide-react';
import { PeriodType, PeriodState, UserProfile } from '../types.ts';
import { sound } from '../utils/audio.ts';

interface HomeScreenProps {
  user: UserProfile;
  periodsState: Record<PeriodType, PeriodState>;
  onEnterWingo: (period?: PeriodType) => void;
  onOpenDeposit: () => void;
  onOpenWithdraw: () => void;
  onOpenRules: () => void;
  onOpenSupport: () => void;
  onOpenNotifications: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onNavigateToProfile: () => void;
}

const PROMO_SLIDES = [
  {
    tag: 'FEATURED GAME',
    title: '13 CLUB WINGO',
    subtitle: 'Fair Lottery · Live Draw 24/7 · 9x Return',
    badge: 'HOT',
    bg: 'from-amber-600/40 via-yellow-600/20 to-slate-900',
    border: 'border-amber-500/40',
  },
  {
    tag: 'DEPOSIT REWARD',
    title: '100% WELCOME BONUS',
    subtitle: 'Instant Demo & UPI Credits up to ₹50,000',
    badge: 'BONUS',
    bg: 'from-emerald-600/40 via-teal-600/20 to-slate-900',
    border: 'border-emerald-500/40',
  },
  {
    tag: 'PROVABLY FAIR',
    title: 'TRANSPARENT SYSTEM',
    subtitle: 'Server Synchronized Clocks & Immutable Records',
    badge: '100% FAIR',
    bg: 'from-indigo-600/40 via-purple-600/20 to-slate-900',
    border: 'border-indigo-500/40',
  },
];

const WINNER_FEED = [
  { phone: '98***12', amount: 4900, period: 'Win Go 30s', color: 'text-emerald-400' },
  { phone: '81***44', amount: 9800, period: 'Win Go 1m', color: 'text-amber-400' },
  { phone: '70***89', amount: 19600, period: 'Win Go 3m', color: 'text-emerald-400' },
  { phone: '93***61', amount: 2450, period: 'Win Go 30s', color: 'text-amber-400' },
  { phone: '97***35', amount: 39200, period: 'Win Go 5m', color: 'text-yellow-400' },
  { phone: '88***02', amount: 7350, period: 'Win Go 1m', color: 'text-emerald-400' },
];

export const HomeScreen: React.FC<HomeScreenProps> = ({
  user,
  periodsState,
  onEnterWingo,
  onOpenDeposit,
  onOpenWithdraw,
  onOpenRules,
  onOpenSupport,
  onOpenNotifications,
  isMuted,
  onToggleMute,
  onNavigateToProfile,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [tickerIndex, setTickerIndex] = useState(0);

  // Auto advance promo slide
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % PROMO_SLIDES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // Auto advance winner ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % WINNER_FEED.length);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  const p30 = periodsState['30s'];
  const p1m = periodsState['1m'];
  const p3m = periodsState['3m'];
  const p5m = periodsState['5m'];

  const formatSecs = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[#0e1017] text-slate-100 pb-24 select-none">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[#161822]/95 backdrop-blur-md border-b border-amber-500/20 px-4 py-3">
        <div className="flex items-center justify-between max-w-md mx-auto">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Crown className="w-5 h-5 text-slate-950 fill-slate-950" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-rajdhani text-2xl font-black tracking-wider bg-gradient-to-r from-yellow-300 via-amber-400 to-amber-500 bg-clip-text text-transparent drop-shadow-sm">
                  13 CLUB
                </span>
                <span className="text-[10px] font-bold tracking-widest text-amber-400 uppercase bg-amber-500/10 border border-amber-500/30 px-1 rounded">
                  CASINO
                </span>
              </div>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sound.playClick();
                onToggleMute();
              }}
              title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
              className="w-8 h-8 rounded-full bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-300 hover:text-amber-400 transition-colors"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onOpenSupport();
              }}
              title="Customer Service"
              className="w-8 h-8 rounded-full bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-300 hover:text-amber-400 transition-colors"
            >
              <Headphones className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onOpenNotifications();
              }}
              title="Notifications"
              className="w-8 h-8 rounded-full bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-300 hover:text-amber-400 transition-colors relative"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onNavigateToProfile();
              }}
              className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs font-rajdhani tracking-wider uppercase shadow-md shadow-amber-500/20 active:scale-95 transition-all"
            >
              VIP {user.vipLevel || 1}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-md mx-auto p-3 space-y-4">
        {/* User Balance Quick Bar */}
        <div className="rounded-2xl bg-gradient-to-br from-[#181a26] via-[#141620] to-[#0f1118] border border-amber-500/25 p-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase flex items-center gap-1">
                <Wallet className="w-3.5 h-3.5 text-amber-400" /> Available Balance
              </span>
              <div className="font-rajdhani text-2xl font-black tracking-tight text-white mt-0.5">
                <span className="text-amber-400 mr-1 text-lg">₹</span>
                {user.balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  sound.playClick();
                  onOpenDeposit();
                }}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs font-rajdhani tracking-wider shadow-md shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-1.5"
              >
                <ArrowDownCircle className="w-4 h-4 stroke-[2.5]" />
                <span>DEPOSIT</span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  onOpenWithdraw();
                }}
                className="px-3 py-2 rounded-xl bg-[#202436] hover:bg-[#282d44] border border-amber-500/30 text-amber-300 font-bold text-xs font-rajdhani tracking-wider active:scale-95 transition-all flex items-center gap-1"
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>WITHDRAW</span>
              </button>
            </div>
          </div>
        </div>

        {/* Hero Promo Carousel */}
        <div className="relative overflow-hidden rounded-2xl border border-amber-500/20 shadow-2xl bg-[#13151f]">
          <div
            className={`p-4 bg-gradient-to-r ${PROMO_SLIDES[currentSlide].bg} transition-all duration-500 relative min-h-[110px] flex flex-col justify-between`}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase font-rajdhani tracking-widest bg-amber-400/20 border border-amber-400/40 text-amber-300">
                  {PROMO_SLIDES[currentSlide].tag}
                </span>
                <h2 className="text-lg font-black font-rajdhani tracking-wide text-white mt-1">
                  {PROMO_SLIDES[currentSlide].title}
                </h2>
                <p className="text-xs text-slate-300 mt-0.5">{PROMO_SLIDES[currentSlide].subtitle}</p>
              </div>
              <span className="px-2 py-1 rounded-full text-[10px] font-black bg-gradient-to-r from-red-600 to-amber-500 text-white shadow-md uppercase tracking-wider">
                {PROMO_SLIDES[currentSlide].badge}
              </span>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => {
                  sound.playClick();
                  onEnterWingo();
                }}
                className="text-xs font-bold text-amber-400 flex items-center gap-1 hover:text-amber-300 group"
              >
                <span>Play Now</span>
                <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </button>

              {/* Dots */}
              <div className="flex items-center gap-1.5">
                {PROMO_SLIDES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    className={`h-1.5 rounded-full transition-all ${
                      currentSlide === i ? 'w-5 bg-amber-400' : 'w-1.5 bg-slate-600'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Live Winner Ticker */}
        <div className="rounded-xl bg-[#141620] border border-slate-800 px-3 py-2 flex items-center gap-2 overflow-hidden shadow-inner">
          <div className="flex items-center gap-1 text-amber-400 font-bold text-xs shrink-0">
            <Flame className="w-3.5 h-3.5 fill-amber-400" />
            <span className="font-rajdhani font-black tracking-wider uppercase">Live Wins:</span>
          </div>
          <div className="flex-1 truncate text-xs text-slate-300">
            <span className="text-slate-400">User {WINNER_FEED[tickerIndex].phone}</span>{' '}
            won{' '}
            <span className={`font-bold font-rajdhani ${WINNER_FEED[tickerIndex].color}`}>
              ₹{WINNER_FEED[tickerIndex].amount.toLocaleString('en-IN')}
            </span>{' '}
            in <span className="text-slate-400">{WINNER_FEED[tickerIndex].period}</span>
          </div>
        </div>

        {/* ============================================================ */}
        {/* DEDICATED WINGO SECTION (Primary Requirement) */}
        {/* ============================================================ */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-5 rounded-full bg-gradient-to-b from-amber-400 to-yellow-600 shadow-[0_0_8px_#f59e0b]" />
              <div>
                <h3 className="font-rajdhani font-black text-lg tracking-wider text-white flex items-center gap-2">
                  WINGO LOTTERY
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-red-500/20 border border-red-500/40 text-red-400 animate-pulse">
                    LIVE
                  </span>
                </h3>
              </div>
            </div>

            <button
              onClick={() => {
                sound.playClick();
                onOpenRules();
              }}
              className="text-xs font-bold text-slate-400 hover:text-amber-400 flex items-center gap-1 font-rajdhani"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Game Rules</span>
            </button>
          </div>

          {/* Primary Featured Wingo Hero Card */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a1c2b] via-[#141624] to-[#10121c] border-2 border-amber-500/40 shadow-2xl p-4 space-y-4 hover:border-amber-400/60 transition-all">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

            <div className="flex items-start justify-between relative z-10">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[11px] font-black uppercase font-rajdhani tracking-wider bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-md">
                    13 CLUB OFFICIAL
                  </span>
                  <span className="text-xs font-bold text-slate-400 font-mono">
                    Round: #{p30.roundId.slice(-6)}
                  </span>
                </div>
                <h4 className="font-rajdhani text-2xl font-black text-white tracking-wide">
                  WINGO
                </h4>
                <p className="text-xs text-slate-400">
                  Pick Green, Red, Violet, or Numbers 0–9. Multiplier up to 9x!
                </p>
              </div>

              {/* Live Live Clock indicator */}
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  30s Draw in
                </span>
                <div className="font-mono text-xl font-black text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]">
                  {formatSecs(p30.timeRemaining)}
                </div>
              </div>
            </div>

            {/* Quick Period Buttons with Live Remaining Seconds */}
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() => {
                  sound.playClick();
                  onEnterWingo('30s');
                }}
                className="p-2 rounded-xl bg-[#202334] hover:bg-[#2a2f46] border border-amber-500/30 text-center transition-all group"
              >
                <div className="text-[11px] font-black font-rajdhani text-white group-hover:text-amber-400">
                  Win Go 30s
                </div>
                <div className="text-xs font-mono font-bold text-amber-400 mt-0.5">
                  {formatSecs(p30.timeRemaining)}
                </div>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  onEnterWingo('1m');
                }}
                className="p-2 rounded-xl bg-[#202334] hover:bg-[#2a2f46] border border-slate-700 text-center transition-all group"
              >
                <div className="text-[11px] font-black font-rajdhani text-white group-hover:text-amber-400">
                  Win Go 1Min
                </div>
                <div className="text-xs font-mono font-bold text-slate-300 group-hover:text-amber-400 mt-0.5">
                  {formatSecs(p1m.timeRemaining)}
                </div>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  onEnterWingo('3m');
                }}
                className="p-2 rounded-xl bg-[#202334] hover:bg-[#2a2f46] border border-slate-700 text-center transition-all group"
              >
                <div className="text-[11px] font-black font-rajdhani text-white group-hover:text-amber-400">
                  Win Go 3Min
                </div>
                <div className="text-xs font-mono font-bold text-slate-300 group-hover:text-amber-400 mt-0.5">
                  {formatSecs(p3m.timeRemaining)}
                </div>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  onEnterWingo('5m');
                }}
                className="p-2 rounded-xl bg-[#202334] hover:bg-[#2a2f46] border border-slate-700 text-center transition-all group"
              >
                <div className="text-[11px] font-black font-rajdhani text-white group-hover:text-amber-400">
                  Win Go 5Min
                </div>
                <div className="text-xs font-mono font-bold text-slate-300 group-hover:text-amber-400 mt-0.5">
                  {formatSecs(p5m.timeRemaining)}
                </div>
              </button>
            </div>

            {/* Prominent Play Button */}
            <button
              onClick={() => {
                sound.playClick();
                onEnterWingo('30s');
              }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm font-rajdhani tracking-widest uppercase shadow-lg shadow-amber-500/30 active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>PLAY WINGO GAME NOW</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </section>

        {/* Quick Menu Utilities */}
        <div className="grid grid-cols-4 gap-2 text-center">
          <button
            onClick={() => {
              sound.playClick();
              onOpenDeposit();
            }}
            className="p-2.5 rounded-xl bg-[#141620] border border-slate-800 hover:border-amber-500/40 flex flex-col items-center gap-1 transition-all"
          >
            <div className="w-9 h-9 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ArrowDownCircle className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold font-rajdhani text-slate-300">Deposit</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onOpenWithdraw();
            }}
            className="p-2.5 rounded-xl bg-[#141620] border border-slate-800 hover:border-amber-500/40 flex flex-col items-center gap-1 transition-all"
          >
            <div className="w-9 h-9 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold font-rajdhani text-slate-300">Withdraw</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onNavigateToProfile();
            }}
            className="p-2.5 rounded-xl bg-[#141620] border border-slate-800 hover:border-amber-500/40 flex flex-col items-center gap-1 transition-all"
          >
            <div className="w-9 h-9 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Award className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold font-rajdhani text-slate-300">VIP Club</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onOpenSupport();
            }}
            className="p-2.5 rounded-xl bg-[#141620] border border-slate-800 hover:border-amber-500/40 flex flex-col items-center gap-1 transition-all"
          >
            <div className="w-9 h-9 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Headphones className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold font-rajdhani text-slate-300">24/7 Support</span>
          </button>
        </div>
      </main>
    </div>
  );
};
