import React, { useState, useEffect, useRef } from 'react';
import { PeriodType, PeriodState, UserProfile, RoundResult, UserBet, BetSelection, GameStateResponse } from './types.ts';
import { Header } from './components/Header.tsx';
import { WalletCard } from './components/WalletCard.tsx';
import { PeriodTabs } from './components/PeriodTabs.tsx';
import { PeriodBanner } from './components/PeriodBanner.tsx';
import { BettingBoard } from './components/BettingBoard.tsx';
import { CountdownOverlay } from './components/CountdownOverlay.tsx';
import { BetModal } from './components/BetModal.tsx';
import { WinningModal, LosingModal } from './components/ResultModals.tsx';
import { HistoryTabs } from './components/HistoryTabs.tsx';
import { RulesModal } from './components/RulesModal.tsx';
import { DepositModal, WithdrawModal } from './components/WalletModals.tsx';
import { SupportModal, NotificationModal } from './components/InfoModals.tsx';
import { PeriodSheetModal } from './components/PeriodSheetModal.tsx';
import { DrawResultBanner } from './components/DrawResultBanner.tsx';
import { LoginPage } from './components/LoginPage.tsx';
import { HomeScreen } from './components/HomeScreen.tsx';
import { ProfileScreen } from './components/ProfileScreen.tsx';
import { AdminDashboard } from './components/AdminDashboard.tsx';
import { AdminLoginModal } from './components/AdminLoginModal.tsx';
import { BottomNavbar, AppView } from './components/BottomNavbar.tsx';
import { sound } from './utils/audio.ts';
import { calculateLivePeriodInfo } from './utils/wingoRules.ts';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

const DEFAULT_USER: UserProfile = {
  id: '',
  username: '',
  phone: '',
  balance: 10.0,
  vipLevel: 1,
  totalWon: 0,
  totalBets: 0,
};

function getInitialPeriodsState(): Record<PeriodType, PeriodState> {
  const makeDefault = (p: PeriodType): PeriodState => {
    const live = calculateLivePeriodInfo(p);
    return {
      period: p,
      roundId: live.roundId,
      timeRemaining: live.timeRemaining,
      durationSeconds: live.durationSeconds,
      isBettingLocked: live.isBettingLocked,
      recentHistory: [],
    };
  };

  return {
    '30s': makeDefault('30s'),
    '1m': makeDefault('1m'),
    '3m': makeDefault('3m'),
    '5m': makeDefault('5m'),
  };
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  // Always show login interface first when anyone opens the website
  const [currentView, setCurrentView] = useState<'home' | 'wingo' | 'profile' | 'login' | 'admin'>('login');

  const [activePeriod, setActivePeriod] = useState<PeriodType>(() => {
    try {
      const saved = localStorage.getItem('13club_active_period') as PeriodType;
      if (saved && ['30s', '1m', '3m', '5m'].includes(saved)) {
        return saved;
      }
    } catch {}
    return '30s';
  });

  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const savedUser = localStorage.getItem('13club_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed && parsed.id) return parsed;
      }
    } catch {}
    return DEFAULT_USER;
  });

  const [periodsState, setPeriodsState] = useState<Record<PeriodType, PeriodState>>(getInitialPeriodsState);

  const [historyList, setHistoryList] = useState<RoundResult[]>([]);
  const [historyStats, setHistoryStats] = useState<any>(undefined);
  const [totalHistoryRounds, setTotalHistoryRounds] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [userBets, setUserBets] = useState<UserBet[]>([]);

  // Modals state
  const [selectedBet, setSelectedBet] = useState<BetSelection | null>(null);
  const [isBetModalOpen, setIsBetModalOpen] = useState<boolean>(false);
  const [quickMultiplier, setQuickMultiplier] = useState<number>(1);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState<boolean>(false);
  const [isPeriodSheetModalOpen, setIsPeriodSheetModalOpen] = useState<boolean>(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState<boolean>(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState<boolean>(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState<boolean>(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState<boolean>(false);

  // Settlement Popups
  const [winningModal, setWinningModal] = useState<{
    isOpen: boolean;
    bets: UserBet[];
    result: RoundResult | null;
  }>({ isOpen: false, bets: [], result: null });

  const [losingModal, setLosingModal] = useState<{
    isOpen: boolean;
    bets: UserBet[];
    result: RoundResult | null;
  }>({ isOpen: false, bets: [], result: null });

  const [latestRevealedResult, setLatestRevealedResult] = useState<RoundResult | null>(null);

  // Sound toggle
  const [isMuted, setIsMuted] = useState<boolean>(sound.getMuted());

  // Toast feedback
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState<boolean>(false);
  const [adminToken, setAdminToken] = useState<string>(() => {
    try {
      return sessionStorage.getItem('13club_admin_token') || '';
    } catch {
      return '';
    }
  });
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    try {
      return !!sessionStorage.getItem('13club_admin_token');
    } catch {
      return false;
    }
  });

  const isInitialLoadRef = useRef<boolean>(true);
  const processedRoundsRef = useRef<Set<string>>(new Set());
  const serverTimeOffsetRef = useRef<number>(0);
  const currentViewRef = useRef<'home' | 'wingo' | 'profile' | 'login' | 'admin'>(currentView);
  const userRef = useRef<UserProfile>(user);

  useEffect(() => {
    currentViewRef.current = currentView;
  }, [currentView]);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const handleSelectPeriod = (p: PeriodType) => {
    setActivePeriod(p);
    try {
      localStorage.setItem('13club_active_period', p);
    } catch {}
  };

  // Always enforce Login interface first whenever anyone opens the website
  useEffect(() => {
    // Clear persistent auto-login flags so opening the website always lands on Login screen
    try {
      localStorage.removeItem('13club_is_logged_in');
      localStorage.removeItem('13club_current_view');
    } catch {}

    setIsLoggedIn(false);
    setUser(DEFAULT_USER);
    setUserBets([]);
    setCurrentView('login');
    if (window.location.hash !== '#admin') {
      window.location.hash = '#login';
    }

    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'admin') {
        const adminTok = sessionStorage.getItem('13club_admin_token');
        if (adminTok) {
          setIsAdminLoggedIn(true);
          setCurrentView('admin');
        } else {
          setIsAdminLoginModalOpen(true);
        }
        return;
      }
      // If user is not logged in in the current session, strictly enforce login view
      const activeUser = userRef.current;
      if (!activeUser || !activeUser.id) {
        setCurrentView('login');
        return;
      }
      if (hash === 'wingo' || hash === 'profile' || hash === 'home') {
        setCurrentView(hash as any);
      } else if (hash === 'login') {
        setCurrentView('login');
      }
    };
    window.addEventListener('hashchange', handleHash);

    // If opened directly with #admin, check or open admin modal
    if (window.location.hash === '#admin') {
      const adminTok = sessionStorage.getItem('13club_admin_token');
      if (!adminTok) {
        setIsAdminLoginModalOpen(true);
      }
    }
    return () => {
      window.removeEventListener('hashchange', handleHash);
    };
  }, []);

  const handleNavigate = (view: 'home' | 'wingo' | 'profile' | 'admin') => {
    if (view !== 'wingo') {
      setLatestRevealedResult(null);
      setWinningModal({ isOpen: false, bets: [], result: null });
      setLosingModal({ isOpen: false, bets: [], result: null });
    }
    currentViewRef.current = view;
    setCurrentView(view);
    try {
      localStorage.setItem('13club_current_view', view);
    } catch {}
    window.location.hash = `#${view}`;
  };

  const handleEnterWingo = (period?: PeriodType) => {
    if (period) {
      handleSelectPeriod(period);
    }
    handleNavigate('wingo');
  };

  const handleOpenLogin = () => {
    window.location.hash = '#login';
    setCurrentView('login');
  };

  const handleBackToGame = () => {
    if (!isLoggedIn) {
      showToast('Please log in first to enter 13 CLUB', 'error');
      return;
    }
    handleNavigate('home');
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('13club_user');
      localStorage.removeItem('13club_is_logged_in');
      localStorage.removeItem('13club_current_view');
    } catch {
      // Ignore
    }
    setIsLoggedIn(false);
    setUser(DEFAULT_USER);
    setUserBets([]);
    setCurrentView('login');
    window.location.hash = '#login';
    showToast('Logged out successfully.');
  };

  const handleLoginSuccess = (loggedInUser: UserProfile) => {
    setUser(loggedInUser);
    setIsLoggedIn(true);
    setUserBets([]);
    try {
      localStorage.setItem('13club_user', JSON.stringify(loggedInUser));
      localStorage.setItem('13club_is_logged_in', 'true');
      localStorage.setItem('13club_current_view', 'home');
    } catch {
      // Ignore
    }
    window.location.hash = '#home';
    setCurrentView('home');
    showToast(`Welcome back, ${loggedInUser.username || loggedInUser.phone}!`);
    setTimeout(() => {
      fetchStatus();
      fetchUserBets(activePeriod);
    }, 300);
  };

  // Sync game status from server and persist to localStorage
  const fetchStatus = async () => {
    try {
      const activeUser = userRef.current;
      const targetId = activeUser?.id || '';
      const url = targetId ? `/api/wingo/status?userId=${encodeURIComponent(targetId)}` : '/api/wingo/status';
      const res = await fetch(url);
      if (!res.ok) return;
      const data: GameStateResponse = await res.json();

      if (typeof data.serverTime === 'number') {
        serverTimeOffsetRef.current = data.serverTime - Math.floor(Date.now() / 1000);
      }

      if (data.periods) {
        setPeriodsState(data.periods);
        try {
          localStorage.setItem('13club_periods_state', JSON.stringify(data.periods));
        } catch {}
      }

      if (data.user && activeUser && data.user.id === activeUser.id) {
        setUser((prev) => {
          if (
            prev.balance !== data.user.balance ||
            prev.totalWon !== data.user.totalWon ||
            prev.totalBets !== data.user.totalBets
          ) {
            try {
              localStorage.setItem('13club_user', JSON.stringify(data.user));
            } catch {}
            return { ...prev, ...data.user };
          }
          return prev;
        });
      }

      // Check if any rounds settled and if player had bets
      checkSettledRounds(data.periods);
    } catch {
      // Local offline fallback
    }
  };

  // Fetch paginated history for current active period
  const fetchHistory = async (period: PeriodType, page: number = 1) => {
    try {
      const res = await fetch(`/api/wingo/history?period=${period}&page=${page}&limit=10`);
      if (!res.ok) return;
      const data = await res.json();
      setHistoryList(data.history || []);
      setTotalHistoryRounds(data.total || 0);
      setHistoryStats(data.stats);
    } catch {
      // Ignore
    }
  };

  // Fetch player's bets for active period
  const fetchUserBets = async (period: PeriodType) => {
    try {
      const activeUser = userRef.current;
      if (!isLoggedIn || !activeUser?.id) {
        setUserBets([]);
        return;
      }
      const res = await fetch(`/api/wingo/my-bets?userId=${encodeURIComponent(activeUser.id)}&period=${period}&limit=20`);
      if (!res.ok) return;
      const data = await res.json();
      setUserBets(data.bets || []);
    } catch {
      // Ignore
    }
  };

  // Check if player had bets on newly settled rounds and auto-update screen
  const checkSettledRounds = async (periods: Record<PeriodType, PeriodState>) => {
    const activeState = periods[activePeriod];
    if (!activeState?.lastResult) return;

    const lastRes = activeState.lastResult;
    const roundKey = `${lastRes.roundId}_${lastRes.timestamp || ''}`;
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      processedRoundsRef.current.add(roundKey);
      return;
    }
    if (processedRoundsRef.current.has(roundKey)) return;
    processedRoundsRef.current.add(roundKey);

    // 1. Immediately flash result banner on screen automatically ONLY when inside Wingo game
    if (currentViewRef.current === 'wingo') {
      setLatestRevealedResult(lastRes);
    }

    // 2. Immediately refresh game history and trend chart without requiring manual page refresh
    fetchHistory(activePeriod, currentPage);

    // 3. Immediately refresh user bets and check win/loss (popups only show when in Wingo game)
    if (!isLoggedIn || !userRef.current?.id) return;
    try {
      const res = await fetch(`/api/wingo/my-bets?userId=${encodeURIComponent(userRef.current.id)}&period=${activePeriod}`);
      if (res.ok) {
        const data = await res.json();
        const bets = data.bets || [];
        setUserBets(bets);

        const betsForRound: UserBet[] = bets.filter(
          (b: UserBet) => b.roundId === lastRes.roundId && b.status !== 'pending'
        );

        if (betsForRound.length > 0 && currentViewRef.current === 'wingo') {
          const winningBets = betsForRound.filter((b) => b.status === 'won');
          const losingBets = betsForRound.filter((b) => b.status === 'lost');

          if (winningBets.length > 0) {
            setWinningModal({
              isOpen: true,
              bets: winningBets,
              result: lastRes,
            });
          } else if (losingBets.length > 0) {
            setLosingModal({
              isOpen: true,
              bets: losingBets,
              result: lastRes,
            });
          }
        }
      }
    } catch {
      // Ignore
    }
  };

  // Local 1-second countdown ticker with clock-anchor synchronization
  useEffect(() => {
    const timer = setInterval(() => {
      const syncedNow = Math.floor(Date.now() / 1000) + serverTimeOffsetRef.current;
      setPeriodsState((prev) => {
        const updated = { ...prev };
        let shouldFetch = false;
        (Object.keys(updated) as PeriodType[]).forEach((p) => {
          if (updated[p]) {
            const live = calculateLivePeriodInfo(p, syncedNow);
            if (live.roundId !== updated[p].roundId) {
              shouldFetch = true;
            }
            updated[p] = {
              ...updated[p],
              roundId: live.roundId,
              timeRemaining: live.timeRemaining,
              durationSeconds: live.durationSeconds,
              isBettingLocked: live.isBettingLocked,
            };
          }
        });
        if (shouldFetch) {
          fetchStatus();
        }
        return updated;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Handle tab visibility and window revisit (user coming back from another website or tab)
  useEffect(() => {
    const handleRevisit = () => {
      if (document.visibilityState === 'visible') {
        const syncedNow = Math.floor(Date.now() / 1000) + serverTimeOffsetRef.current;
        setPeriodsState((prev) => {
          const updated = { ...prev };
          (Object.keys(updated) as PeriodType[]).forEach((p) => {
            const live = calculateLivePeriodInfo(p, syncedNow);
            updated[p] = {
              ...updated[p],
              roundId: live.roundId,
              timeRemaining: live.timeRemaining,
              durationSeconds: live.durationSeconds,
              isBettingLocked: live.isBettingLocked,
            };
          });
          return updated;
        });
        fetchStatus();
        fetchHistory(activePeriod, currentPage);
        fetchUserBets(activePeriod);
      }
    };

    document.addEventListener('visibilitychange', handleRevisit);
    window.addEventListener('focus', handleRevisit);
    return () => {
      document.removeEventListener('visibilitychange', handleRevisit);
      window.removeEventListener('focus', handleRevisit);
    };
  }, [activePeriod, currentPage]);

  // Polling loop: every 1s
  useEffect(() => {
    fetchStatus();
    fetchHistory(activePeriod, currentPage);
    fetchUserBets(activePeriod);

    const interval = setInterval(() => {
      fetchStatus();
    }, 1000);

    return () => clearInterval(interval);
  }, [activePeriod]);

  // When active period changes, update history and bets
  useEffect(() => {
    setCurrentPage(1);
    fetchHistory(activePeriod, 1);
    fetchUserBets(activePeriod);
  }, [activePeriod]);

  // Refresh balance manual handler
  const handleManualSync = async () => {
    setIsSyncing(true);
    await fetchStatus();
    await fetchHistory(activePeriod, currentPage);
    await fetchUserBets(activePeriod);
    setTimeout(() => {
      setIsSyncing(false);
      showToast('Wallet and rounds synchronized');
    }, 500);
  };

  // Open bet drawer
  const handleSelectBet = (selection: BetSelection) => {
    const currentState = periodsState[activePeriod];
    if (currentState?.isBettingLocked) {
      showToast('Betting is locked for this round (last 5 seconds)', 'error');
      return;
    }
    setSelectedBet(selection);
    setIsBetModalOpen(true);
  };

  // Confirm bet placement
  const handleConfirmBet = async (baseAmount: number, quantity: number) => {
    if (!selectedBet) return;
    const res = await fetch('/api/wingo/bet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        period: activePeriod,
        category: selectedBet.category,
        selection: selectedBet.value,
        baseAmount,
        quantity,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to place bet');
    }

    if (data.balance !== undefined) {
      setUser((prev) => ({ ...prev, balance: data.balance }));
    }

    showToast(`Bet ₹${baseAmount * quantity} placed on ${selectedBet.label}!`);
    await fetchUserBets(activePeriod);
  };

  // Recharge wallet demo
  const handleDeposit = async (amount: number) => {
    const res = await fetch('/api/wingo/wallet/recharge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        amount,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Deposit failed');
    }
    setUser((prev) => ({ ...prev, balance: data.balance }));
    showToast(data.message || `Deposited ₹${amount}`);
  };

  // Withdraw wallet demo
  const handleWithdraw = async (amount: number, upiId: string) => {
    const res = await fetch('/api/wingo/wallet/withdraw', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        amount,
        upiId,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Withdrawal failed');
    }
    setUser((prev) => ({ ...prev, balance: data.balance }));
    showToast(data.message || `Withdrawn ₹${amount}`);
  };

  const currentPeriodState = periodsState[activePeriod];

  // Standalone Admin Dashboard Gateway (allows administrative management even when logged out as player)
  if (currentView === 'admin' && isAdminLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0d0f17] text-slate-100 flex flex-col justify-between selection:bg-amber-500 selection:text-slate-950">
        {toast && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full shadow-2xl border text-xs font-semibold backdrop-blur-md animate-in slide-in-from-top-4 duration-150 max-w-sm w-full mx-auto justify-center bg-[#171926]/95 border-amber-500/40 text-amber-200">
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        )}

        <AdminDashboard
          adminToken={adminToken}
          onLogout={() => {
            sessionStorage.removeItem('13club_admin_token');
            setIsAdminLoggedIn(false);
            setAdminToken('');
            if (isLoggedIn) {
              handleNavigate('profile');
            } else {
              window.location.hash = '#login';
              setCurrentView('login');
            }
          }}
          onBackToApp={() => {
            if (isLoggedIn) {
              handleNavigate('home');
            } else {
              window.location.hash = '#login';
              setCurrentView('login');
            }
          }}
          onTransactionReviewed={fetchStatus}
        />

        <SupportModal
          isOpen={isSupportModalOpen}
          onClose={() => setIsSupportModalOpen(false)}
          onOpenAdminLogin={() => setIsAdminLoginModalOpen(true)}
          isAdminLoggedIn={isAdminLoggedIn}
          onEnterAdminDashboard={() => handleNavigate('admin')}
        />
      </div>
    );
  }

  if (currentView === 'login' || !isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0d0f17] text-slate-100 flex flex-col justify-between selection:bg-amber-500 selection:text-slate-950">
        {/* Toast popup */}
        {toast && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full shadow-2xl border text-xs font-semibold backdrop-blur-md animate-in slide-in-from-top-4 duration-150 max-w-sm w-full mx-auto justify-center bg-[#171926]/95 border-amber-500/40 text-amber-200">
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        )}

        <LoginPage
          onLoginSuccess={handleLoginSuccess}
          onBackToGame={handleBackToGame}
          isMuted={isMuted}
          onToggleMute={() => {
            const muted = sound.toggleMute();
            setIsMuted(muted);
          }}
          onOpenSupport={() => setIsSupportModalOpen(true)}
          isLoggedIn={isLoggedIn}
          onOpenAdminLogin={() => setIsAdminLoginModalOpen(true)}
        />

        {/* Admin Login Modal (cat / 1111) */}
        <AdminLoginModal
          isOpen={isAdminLoginModalOpen}
          onClose={() => setIsAdminLoginModalOpen(false)}
          onSuccess={(token) => {
            setAdminToken(token);
            setIsAdminLoggedIn(true);
            setCurrentView('admin');
            try {
              localStorage.setItem('13club_current_view', 'admin');
            } catch {}
            window.location.hash = '#admin';
          }}
        />

        {/* Customer Support Modal */}
        <SupportModal
          isOpen={isSupportModalOpen}
          onClose={() => setIsSupportModalOpen(false)}
          onOpenAdminLogin={() => setIsAdminLoginModalOpen(true)}
          isAdminLoggedIn={isAdminLoggedIn}
          onEnterAdminDashboard={() => handleNavigate('admin')}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0f17] text-slate-100 flex flex-col justify-between selection:bg-amber-500 selection:text-slate-950">
      {/* Toast popup */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full shadow-2xl border text-xs font-semibold backdrop-blur-md animate-in slide-in-from-top-4 duration-150 max-w-sm w-full mx-auto justify-center bg-[#171926]/95 border-amber-500/40 text-amber-200">
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Real-time Lottery Result Auto-Reveal Banner - only appears when user enters Wingo game */}
      {currentView === 'wingo' && (
        <DrawResultBanner
          result={latestRevealedResult}
          onDismiss={() => setLatestRevealedResult(null)}
        />
      )}

      {/* View Branching */}
      {currentView === 'home' && (
        <HomeScreen
          user={user}
          periodsState={periodsState}
          onEnterWingo={handleEnterWingo}
          onOpenDeposit={() => setIsDepositModalOpen(true)}
          onOpenWithdraw={() => setIsWithdrawModalOpen(true)}
          onOpenRules={() => setIsRulesModalOpen(true)}
          onOpenSupport={() => setIsSupportModalOpen(true)}
          onOpenNotifications={() => setIsNotificationModalOpen(true)}
          isMuted={isMuted}
          onToggleMute={() => {
            const muted = sound.toggleMute();
            setIsMuted(muted);
          }}
          onNavigateToProfile={() => handleNavigate('profile')}
        />
      )}

      {currentView === 'profile' && (
        <ProfileScreen
          user={user}
          userBets={userBets}
          onOpenDeposit={() => setIsDepositModalOpen(true)}
          onOpenWithdraw={() => setIsWithdrawModalOpen(true)}
          onOpenRules={() => setIsRulesModalOpen(true)}
          onOpenSupport={() => setIsSupportModalOpen(true)}
          onLogout={handleLogout}
          onBackToHome={() => handleNavigate('home')}
          onRefreshBalance={handleManualSync}
          onOpenAdminLogin={() => setIsAdminLoginModalOpen(true)}
          isAdminLoggedIn={isAdminLoggedIn}
          onEnterAdminDashboard={() => handleNavigate('admin')}
          onAdminLoginSuccess={(token) => {
            setAdminToken(token);
            setIsAdminLoggedIn(true);
            handleNavigate('admin');
          }}
          onAdminLogout={() => {
            sessionStorage.removeItem('13club_admin_token');
            setIsAdminLoggedIn(false);
            setAdminToken('');
            showToast('Logged out of Admin');
          }}
        />
      )}

      {/* Admin Dashboard Console (Authorized Staff Only) */}
      {currentView === 'admin' && (
        <AdminDashboard
          adminToken={adminToken}
          onLogout={() => {
            sessionStorage.removeItem('13club_admin_token');
            setIsAdminLoggedIn(false);
            setAdminToken('');
            handleNavigate('profile');
          }}
          onBackToApp={() => handleNavigate('profile')}
          onTransactionReviewed={fetchStatus}
        />
      )}

      {currentView === 'wingo' && (
        <div className="w-full max-w-md mx-auto flex flex-col min-h-screen bg-[#11131c] shadow-2xl shadow-black/80 border-x border-slate-800/80 pb-20">
          {/* Header with Back to Home button */}
          <Header
            isMuted={isMuted}
            onToggleMute={() => {
              const muted = sound.toggleMute();
              setIsMuted(muted);
            }}
            onOpenSupport={() => setIsSupportModalOpen(true)}
            onOpenNotifications={() => setIsNotificationModalOpen(true)}
            onOpenLogin={handleOpenLogin}
            onLogout={handleLogout}
            onBackToHome={() => handleNavigate('home')}
            user={user}
          />

          {/* Game Body */}
          <main className="flex-1 p-3.5 space-y-3.5">
            {/* Wallet Card */}
            <WalletCard
              user={user}
              isRefreshing={isSyncing}
              onRefresh={handleManualSync}
              onDeposit={() => setIsDepositModalOpen(true)}
              onWithdraw={() => setIsWithdrawModalOpen(true)}
              onOpenLogin={handleOpenLogin}
            />

            {/* 4 Period Tabs (30s, 1m, 3m, 5m) */}
            <PeriodTabs
              activePeriod={activePeriod}
              periodsState={periodsState}
              onSelectPeriod={handleSelectPeriod}
            />

            {/* Period Banner with Live Synchronized Countdown and Recent Draws */}
            <PeriodBanner
              period={activePeriod}
              roundId={currentPeriodState.roundId}
              timeRemaining={currentPeriodState.timeRemaining}
              recentResults={currentPeriodState.recentHistory}
              onOpenRules={() => setIsRulesModalOpen(true)}
              onOpenPeriodSheet={() => setIsPeriodSheetModalOpen(true)}
            />

            {/* Betting Board with 5-Second Lock Overlay */}
            <div className="relative">
              <BettingBoard
                isLocked={currentPeriodState.isBettingLocked}
                onSelectBet={handleSelectBet}
                quickMultiplier={quickMultiplier}
                onSelectQuickMultiplier={(m) => setQuickMultiplier(m)}
              />

              {/* Countdown Overlay for final 5 seconds */}
              <CountdownOverlay
                timeRemaining={currentPeriodState.timeRemaining}
                lastSettledResult={currentPeriodState.lastResult}
              />
            </div>

            {/* Complete History, Chart, and My History Tabs */}
            <HistoryTabs
              period={activePeriod}
              history={historyList}
              userBets={userBets}
              totalHistoryRounds={totalHistoryRounds}
              currentPage={currentPage}
              onPageChange={(p) => {
                setCurrentPage(p);
                fetchHistory(activePeriod, p);
              }}
              stats={historyStats}
            />
          </main>

          {/* Footer info */}
          <footer className="p-3 text-center border-t border-slate-800/80 bg-[#0e1017] text-[11px] text-slate-500">
            <div className="font-rajdhani font-bold text-slate-400">
              13 CLUB · OFFICIAL WINGO FAIR LOTTERY
            </div>
            <div>Provably Fair RNG · Server Synchronized</div>
          </footer>
        </div>
      )}

      {/* Global Bottom Navigation Bar (Home & Profile) - hidden on admin dashboard */}
      {currentView !== 'admin' && (
        <BottomNavbar
          currentView={currentView as 'home' | 'wingo' | 'profile'}
          onNavigate={handleNavigate}
        />
      )}

      {/* Bet Drawer Modal */}
      <BetModal
        isOpen={isBetModalOpen}
        onClose={() => setIsBetModalOpen(false)}
        selection={selectedBet}
        period={activePeriod}
        user={user}
        initialMultiplier={quickMultiplier}
        onConfirmBet={handleConfirmBet}
        onOpenDeposit={() => {
          setIsBetModalOpen(false);
          setIsDepositModalOpen(true);
        }}
      />

      {/* Result Popups - strictly only appear when user is playing Wingo game */}
      {currentView === 'wingo' && (
        <>
          <WinningModal
            isOpen={winningModal.isOpen}
            onClose={() => setWinningModal({ isOpen: false, bets: [], result: null })}
            winningBets={winningModal.bets}
            roundResult={winningModal.result}
          />

          <LosingModal
            isOpen={losingModal.isOpen}
            onClose={() => setLosingModal({ isOpen: false, bets: [], result: null })}
            losingBets={losingModal.bets}
            roundResult={losingModal.result}
          />
        </>
      )}

      {/* How to Play Rules Modal */}
      <RulesModal isOpen={isRulesModalOpen} onClose={() => setIsRulesModalOpen(false)} />

      {/* Wallet Deposit & Withdraw Modals with dynamic QR code & Approval */}
      <DepositModal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
        userId={user.id}
        onDepositSubmitted={handleManualSync}
      />

      <WithdrawModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        currentBalance={user.balance}
        userId={user.id}
        onWithdrawSubmitted={(newBalance) => setUser((prev) => ({ ...prev, balance: newBalance }))}
      />

      {/* Admin Login Modal (Admin ID: cat, Password: 1111) */}
      <AdminLoginModal
        isOpen={isAdminLoginModalOpen}
        onClose={() => setIsAdminLoginModalOpen(false)}
        onSuccess={(token) => {
          setAdminToken(token);
          setIsAdminLoggedIn(true);
          handleNavigate('admin');
        }}
      />

      {/* Support & Notification Modals */}
      <SupportModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
        onOpenAdminLogin={() => setIsAdminLoginModalOpen(true)}
        isAdminLoggedIn={isAdminLoggedIn}
        onEnterAdminDashboard={() => handleNavigate('admin')}
      />
      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
      />

      {/* 1000 Period Sheet Modal */}
      <PeriodSheetModal
        isOpen={isPeriodSheetModalOpen}
        onClose={() => setIsPeriodSheetModalOpen(false)}
        currentPeriodId={currentPeriodState.roundId}
      />
    </div>
  );
}
