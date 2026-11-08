import React, { useState } from 'react';
import {
  Crown,
  Lock,
  Phone,
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Sparkles,
  Volume2,
  VolumeX,
  Headphones,
  KeyRound,
  Gift,
  ShieldAlert,
} from 'lucide-react';
import { UserProfile, AuthResponse } from '../types.ts';
import { sound } from '../utils/audio.ts';

interface LoginPageProps {
  onLoginSuccess: (user: UserProfile) => void;
  onBackToGame: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenSupport: () => void;
  isLoggedIn?: boolean;
  onOpenAdminLogin?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onBackToGame,
  isMuted,
  onToggleMute,
  onOpenSupport,
  isLoggedIn = false,
  onOpenAdminLogin,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Form states
  const [phone, setPhone] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [inviteCode, setInviteCode] = useState<string>('');
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [agreeTerms, setAgreeTerms] = useState<boolean>(true);

  // UI helpers
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Forgot password modal state
  const [isForgotModalOpen, setIsForgotModalOpen] = useState<boolean>(false);
  const [forgotPhone, setForgotPhone] = useState<string>('');
  const [forgotOtp, setForgotOtp] = useState<string>('');
  const [forgotNewPassword, setForgotNewPassword] = useState<string>('');
  const [otpSentMessage, setOtpSentMessage] = useState<string>('');
  const [forgotLoading, setForgotLoading] = useState<boolean>(false);
  const [forgotError, setForgotError] = useState<string>('');

  // Mobile number input handler (only numbers, max 10 digits)
  const handlePhoneChange = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 10);
    setPhone(cleaned);
    setErrorMessage('');
  };

  const handleForgotPhoneChange = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 10);
    setForgotPhone(cleaned);
    setForgotError('');
  };

  // Submit Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!phone || phone.length !== 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number');
      sound.playLoss();
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters');
      sound.playLoss();
      return;
    }

    sound.playClick();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });
      const data: AuthResponse = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Login failed. Please check credentials.');
      }

      sound.playBetPlaced();
      setSuccessMessage(data.message || 'Login successful!');
      if (rememberMe) {
        localStorage.setItem('13club_remembered_phone', phone);
      } else {
        localStorage.removeItem('13club_remembered_phone');
      }

      setTimeout(() => {
        if (data.user) {
          onLoginSuccess(data.user);
        }
      }, 700);
    } catch (err: any) {
      sound.playLoss();
      setErrorMessage(err.message || 'Login error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Submit Registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!phone || phone.length !== 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number');
      sound.playLoss();
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters');
      sound.playLoss();
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      sound.playLoss();
      return;
    }
    if (!agreeTerms) {
      setErrorMessage('Please accept the User Agreement and Privacy Policy');
      sound.playLoss();
      return;
    }

    sound.playClick();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password, inviteCode }),
      });
      const data: AuthResponse = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Registration failed');
      }

      sound.playWin();
      setSuccessMessage(data.message || 'Account created! Welcome bonus ₹10 added.');

      setTimeout(() => {
        if (data.user) {
          onLoginSuccess(data.user);
        }
      }, 1000);
    } catch (err: any) {
      sound.playLoss();
      setErrorMessage(err.message || 'Registration error');
    } finally {
      setLoading(false);
    }
  };

  // Send OTP for Forgot Password
  const handleSendOtp = async () => {
    if (!forgotPhone || forgotPhone.length !== 10) {
      setForgotError('Enter a valid 10-digit mobile number first');
      return;
    }
    setForgotLoading(true);
    setForgotError('');
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: forgotPhone }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOtpSentMessage(`Verification code sent! Demo OTP: ${data.otp}`);
        setForgotOtp(data.otp);
      } else {
        setForgotError(data.error || 'Failed to send OTP');
      }
    } catch {
      setForgotError('Network error sending OTP');
    } finally {
      setForgotLoading(false);
    }
  };

  // Submit Password Reset
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotPhone || forgotPhone.length !== 10) {
      setForgotError('Enter valid 10-digit mobile number');
      return;
    }
    if (!forgotOtp || forgotOtp.length < 4) {
      setForgotError('Enter 4-digit verification code');
      return;
    }
    if (!forgotNewPassword || forgotNewPassword.length < 6) {
      setForgotError('New password must be at least 6 characters');
      return;
    }

    setForgotLoading(true);
    setForgotError('');
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: forgotPhone,
          otp: forgotOtp,
          newPassword: forgotNewPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Password reset failed');
      }

      sound.playBetPlaced();
      setSuccessMessage('Password reset successfully! Please login.');
      setIsForgotModalOpen(false);
      setPhone(forgotPhone);
      setPassword(forgotNewPassword);
    } catch (err: any) {
      setForgotError(err.message || 'Reset password error');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0f17] text-slate-100 flex flex-col justify-between selection:bg-amber-500 selection:text-slate-950 font-sans">
      {/* Mobile-first Container Centered on Desktop */}
      <div className="w-full max-w-md mx-auto flex flex-col min-h-screen bg-[#11131c] shadow-2xl shadow-black/90 border-x border-slate-800/80">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-[#161822]/95 backdrop-blur-md border-b border-amber-500/20 px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left Header Action */}
            {isLoggedIn ? (
              <button
                onClick={() => {
                  sound.playClick();
                  onBackToGame();
                }}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-amber-400 transition-colors bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 px-2.5 py-1.5 rounded-xl"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            ) : (
              <div className="w-8" />
            )}

            {/* Brand Logo & Name */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Crown className="w-4 h-4 text-slate-950 fill-slate-950" />
              </div>
              <div className="flex items-center gap-1">
                <span className="font-rajdhani text-xl font-black tracking-wider bg-gradient-to-r from-yellow-300 via-amber-400 to-amber-500 bg-clip-text text-transparent drop-shadow-sm">
                  13 CLUB
                </span>
                <span className="text-[9px] font-bold tracking-widest text-amber-400 uppercase bg-amber-500/10 border border-amber-500/30 px-1 rounded">
                  WINGO
                </span>
              </div>
            </div>

            {/* Right Quick Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  sound.playClick();
                  onToggleMute();
                }}
                className="w-8 h-8 rounded-full bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-300 hover:text-amber-400 transition-colors"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onOpenAdminLogin?.();
                }}
                className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-400 text-xs font-bold font-rajdhani hover:bg-amber-500/25 transition-all flex items-center gap-1.5 shadow-sm"
                title="Admin Login Portal"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                <span>Admin</span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  onOpenSupport();
                }}
                className="w-8 h-8 rounded-full bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-300 hover:text-amber-400 transition-colors"
                title="Support"
              >
                <Headphones className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 flex flex-col justify-center">
          {/* Subtle Top Glow Decoration */}
          <div className="relative mb-3">
            <div className="w-40 h-40 bg-amber-500/15 rounded-full blur-3xl absolute -top-12 left-1/2 -translate-x-1/2 pointer-events-none" />
          </div>

          {/* Segmented Switcher: Login / Create Account */}
          <div className="grid grid-cols-2 p-1 bg-[#161824] rounded-2xl border border-slate-800 mb-4 shadow-inner">
            <button
              onClick={() => {
                sound.playClick();
                setActiveTab('login');
                setErrorMessage('');
              }}
              className={`py-2.5 rounded-xl text-xs font-bold font-rajdhani tracking-wider uppercase transition-all ${
                activeTab === 'login'
                  ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-slate-950 font-black shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setActiveTab('register');
                setErrorMessage('');
              }}
              className={`py-2.5 rounded-xl text-xs font-bold font-rajdhani tracking-wider uppercase transition-all ${
                activeTab === 'register'
                  ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-slate-950 font-black shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Login / Register Card */}
          <div className="relative rounded-2xl bg-gradient-to-b from-[#1b1e2c] via-[#161824] to-[#11131c] border border-amber-500/30 p-5 shadow-2xl overflow-hidden">
            {/* Card Header */}
            <div className="text-center mb-5">
              <h2 className="text-2xl font-black font-rajdhani tracking-wider text-white uppercase mb-1">
                {activeTab === 'login' ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-xs text-slate-400">
                {activeTab === 'login'
                  ? 'Login to your 13 CLUB account to play Wingo'
                  : 'Join 13 CLUB & claim your ₹10 welcome bonus'}
              </p>
            </div>

            {/* Notification Messages */}
            {errorMessage && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs mb-4 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs mb-4 animate-in fade-in duration-200">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={activeTab === 'login' ? handleLogin : handleRegister} autoComplete="off" className="space-y-4">
              {/* Mobile Number Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Mobile Number
                </label>
                <div className="flex items-center rounded-xl bg-[#0f111a] border border-slate-700/80 focus-within:border-amber-400 transition-colors overflow-hidden">
                  {/* +91 Country Box */}
                  <div className="flex items-center gap-1.5 px-3 py-2.5 bg-[#181a26] border-r border-slate-700 text-amber-400 text-xs font-mono font-bold select-none">
                    <span className="text-sm">🇮🇳</span>
                    <span>+91</span>
                  </div>

                  <input
                    type="tel"
                    inputMode="numeric"
                    placeholder="Enter 10-digit mobile number"
                    autoComplete="off"
                    value={phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    maxLength={10}
                    required
                    className="flex-1 bg-transparent px-3 py-2.5 text-xs font-mono text-white placeholder:text-slate-500 focus:outline-none"
                  />

                  {phone.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setPhone('')}
                      className="pr-3 text-slate-500 hover:text-slate-300 text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {activeTab === 'login' ? 'Password' : 'Set Password'}
                </label>
                <div className="flex items-center rounded-xl bg-[#0f111a] border border-slate-700/80 focus-within:border-amber-400 transition-colors px-3 py-2.5">
                  <Lock className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter at least 6 characters"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrorMessage('');
                    }}
                    required
                    className="flex-1 bg-transparent text-xs text-white placeholder:text-slate-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Register: Confirm Password */}
              {activeTab === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Confirm Password
                  </label>
                  <div className="flex items-center rounded-xl bg-[#0f111a] border border-slate-700/80 focus-within:border-amber-400 transition-colors px-3 py-2.5">
                    <Lock className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Re-enter your password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setErrorMessage('');
                      }}
                      required
                      className="flex-1 bg-transparent text-xs text-white placeholder:text-slate-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Register: Recommendation / Invite Code */}
              {activeTab === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                    <span>Invite Code (Optional)</span>
                    <span className="text-[10px] text-amber-400 font-bold flex items-center gap-1">
                      <Gift className="w-3 h-3" />
                      <span>Bonus Code</span>
                    </span>
                  </label>
                  <div className="flex items-center rounded-xl bg-[#0f111a] border border-slate-700/80 focus-within:border-amber-400 transition-colors px-3 py-2.5">
                    <KeyRound className="w-4 h-4 text-amber-400 mr-2 shrink-0" />
                    <input
                      type="text"
                      placeholder="e.g. 13CLUBVIP"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value)}
                      className="flex-1 bg-transparent text-xs font-mono font-bold text-amber-300 placeholder:text-slate-500 focus:outline-none uppercase"
                    />
                  </div>
                </div>
              )}

              {/* Remember Me & Forgot Password row */}
              {activeTab === 'login' ? (
                <div className="flex items-center justify-between text-xs pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-200 select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded accent-amber-400"
                    />
                    <span>Remember Me</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setIsForgotModalOpen(true);
                      setForgotPhone(phone);
                      setOtpSentMessage('');
                      setForgotError('');
                    }}
                    className="text-amber-400 hover:text-amber-300 font-medium transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
              ) : (
                <div className="flex items-start gap-2 text-xs text-slate-400 pt-0.5">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 rounded accent-amber-400"
                  />
                  <span>
                    I confirm I am 18+ and agree to the{' '}
                    <span className="text-amber-400 underline cursor-pointer">User Agreement</span>{' '}
                    & <span className="text-amber-400 underline cursor-pointer">Privacy Policy</span>.
                  </span>
                </div>
              )}

              {/* Large Golden Action Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#FFC400] via-[#FFB300] to-[#FFA000] hover:from-[#ffcf24] hover:to-[#ffb300] text-slate-950 font-black text-sm tracking-wider uppercase shadow-lg shadow-amber-500/25 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 font-rajdhani mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Processing...</span>
                  </>
                ) : activeTab === 'login' ? (
                  <span>LOGIN TO 13 CLUB</span>
                ) : (
                  <span>CREATE ACCOUNT & CLAIM BONUS</span>
                )}
              </button>
            </form>
          </div>

          {/* Trust badges footer */}
          <div className="mt-5 flex items-center justify-center gap-4 text-[11px] text-slate-500">
            <div className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>256-Bit SSL Encryption</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Provably Fair Wingo</span>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="p-3 text-center border-t border-slate-800/80 bg-[#0e1017] text-[11px] text-slate-500 flex flex-col items-center gap-1">
          <div className="font-rajdhani font-bold text-slate-400">
            13 CLUB · OFFICIAL WINGO FAIR LOTTERY
          </div>
          <div className="flex items-center gap-2">
            <span>Authorized Online Gaming License · 18+ Only</span>
          </div>
        </footer>
      </div>

      {/* Forgot Password Recovery Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-sm rounded-2xl bg-[#161822] border border-amber-500/40 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base font-rajdhani text-white">Reset Password</h3>
              </div>
              <button
                onClick={() => setIsForgotModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {forgotError && (
              <div className="p-2.5 rounded-lg bg-red-500/15 border border-red-500/30 text-red-300 text-xs">
                {forgotError}
              </div>
            )}

            {otpSentMessage && (
              <div className="p-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold">
                {otpSentMessage}
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Registered Mobile Number</label>
                <div className="flex items-center rounded-xl bg-[#0f111a] border border-slate-700 px-3 py-2">
                  <span className="text-amber-400 font-mono font-bold mr-2">+91</span>
                  <input
                    type="tel"
                    value={forgotPhone}
                    onChange={(e) => handleForgotPhoneChange(e.target.value)}
                    maxLength={10}
                    placeholder="10-digit mobile number"
                    className="flex-1 bg-transparent text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-400">Verification Code (OTP)</label>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={forgotLoading}
                    className="text-[11px] text-amber-400 hover:underline font-bold"
                  >
                    Send OTP Code
                  </button>
                </div>
                <input
                  type="text"
                  maxLength={4}
                  placeholder="Enter 4-digit code"
                  value={forgotOtp}
                  onChange={(e) => setForgotOtp(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0f111a] border border-slate-700 rounded-xl text-white font-mono text-center tracking-widest text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Set New Password</label>
                <input
                  type="password"
                  placeholder="At least 6 characters"
                  value={forgotNewPassword}
                  onChange={(e) => setForgotNewPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0f111a] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs font-rajdhani uppercase tracking-wider"
                >
                  {forgotLoading ? 'Resetting...' : 'CONFIRM NEW PASSWORD'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
