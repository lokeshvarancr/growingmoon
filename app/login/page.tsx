'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/state/AppContext';
import { supabase } from '@/lib/supabaseClient';
import { setStoredAuthToken, usersApi } from '@/lib/api/client';
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  X,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  Edit2,
} from 'lucide-react';

const DEMO_EMAIL = 'lokesh@gmail.com';
const DEMO_PASSWORD = '2000';

type AuthMethod = 'otp' | 'password';
type AuthMode = 'login' | 'register';
type OtpStep = 'input' | 'verify';

export default function LoginPage() {
  const router = useRouter();
  const { updateUser, addToast } = useApp();

  const [authMethod, setAuthMethod] = useState<AuthMethod>('otp');
  const [mode, setMode] = useState<AuthMode>('login');
  const [otpStep, setOtpStep] = useState<OtpStep>('input');

  // Input states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // States
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<'Google' | 'LinkedIn' | null>(null);

  // Resend Countdown Timer (60s)
  const [resendCountdown, setResendCountdown] = useState(0);

  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setInterval(() => {
      setResendCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCountdown]);

  // Forgot Password Modal State
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);

  // Quick auto-fill helper for demo account testing
  const handleAutoFill = () => {
    setAuthMethod('password');
    setMode('login');
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    setErrorMsg(null);
  };

  // Skip sign in for testing / guest mode
  const handleSkipSignIn = () => {
    addToast('Skipped sign-in — exploring in test mode', 'info');
    router.push('/home');
  };

  // ── 1. OAuth Sign-In (Google & LinkedIn) ──────────────────────────────────
  const handleOAuthLogin = async (provider: 'Google' | 'LinkedIn') => {
    setLoadingProvider(provider);
    setErrorMsg(null);

    const providerKey = provider === 'Google' ? 'google' : 'linkedin_oidc';
    const callbackUrl = `${window.location.origin}/auth/callback`;

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: providerKey as any,
        options: {
          redirectTo: callbackUrl,
        },
      });

      if (error) {
        setErrorMsg(error.message);
        setLoadingProvider(null);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || `Failed to initiate ${provider} authentication.`);
      setLoadingProvider(null);
    }
  };

  // ── 2. Send 6-Digit Email OTP ─────────────────────────────────────────────
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          data: {
            full_name: fullName.trim() || cleanEmail.split('@')[0],
            username: cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_'),
          },
          shouldCreateUser: true,
        },
      });

      if (error) {
        setErrorMsg(error.message);
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      setOtpStep('verify');
      setResendCountdown(60);
      setSuccessMsg(`We sent a 6-digit verification code to ${cleanEmail}`);
      addToast('Verification code sent to your inbox!', 'info');
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err?.message || 'Failed to send verification code. Please try again.');
    }
  };

  // ── 3. Verify 6-Digit Email OTP ───────────────────────────────────────────
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanToken = otpCode.trim();

    if (cleanToken.length < 6) {
      setErrorMsg('Please enter all 6 digits of your verification code.');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: cleanEmail,
        token: cleanToken,
        type: 'email',
      });

      if (error) {
        setErrorMsg(error.message);
        setIsLoading(false);
        return;
      }

      if (data.session?.access_token) {
        setStoredAuthToken(data.session.access_token);
        
        // Sync user profile from backend
        try {
          const me = await usersApi.getMe();
          updateUser({
            name: me.name,
            username: me.username,
            avatar: me.avatar_initials,
            avatarImage: me.avatar_image || undefined,
          });
          addToast(`Welcome to Growing Moon, ${me.name}!`, 'success');
        } catch {
          addToast('Signed in successfully!', 'success');
        }

        router.push('/home');
      } else {
        setIsLoading(false);
        setErrorMsg('Verification code confirmed, but no session was returned.');
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err?.message || 'Invalid or expired code. Please request a new one.');
    }
  };

  // ── 4. Email + Password Sign In / Registration ────────────────────────────
  const handlePasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setErrorMsg('Please enter both your email and password.');
      return;
    }

    // Register mode
    if (mode === 'register') {
      if (!fullName.trim()) {
        setErrorMsg('Please enter your full name.');
        return;
      }
      if (cleanPassword !== confirmPassword.trim()) {
        setErrorMsg('Passwords do not match.');
        return;
      }

      setIsLoading(true);

      try {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password: cleanPassword,
          options: {
            data: {
              full_name: fullName.trim(),
              username: cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_'),
            },
          },
        });

        if (error) {
          setErrorMsg(error.message);
          setIsLoading(false);
          return;
        }

        if (data.session?.access_token) {
          setStoredAuthToken(data.session.access_token);
          const me = await usersApi.getMe().catch(() => null);
          if (me) {
            updateUser({ name: me.name, username: me.username });
          }
          addToast(`Account created! Welcome, ${fullName || 'Builder'}!`, 'success');
          router.push('/home');
        } else {
          setIsLoading(false);
          addToast('Account created! Please check your email to confirm your account.', 'info');
          setMode('login');
        }
      } catch (err: any) {
        setIsLoading(false);
        setErrorMsg(err?.message || 'Failed to create account.');
      }
      return;
    }

    // Login mode
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPassword,
      });

      if (error) {
        // Helpful hint if using the default test account
        if (cleanEmail === DEMO_EMAIL && cleanPassword === DEMO_PASSWORD) {
          updateUser({ name: 'Lokesh', avatar: 'LK', username: 'lokesh' });
          addToast('Logged in as Lokesh (Local Demo)', 'success');
          router.push('/home');
          return;
        }

        setErrorMsg(error.message);
        setIsLoading(false);
        return;
      }

      if (data.session?.access_token) {
        setStoredAuthToken(data.session.access_token);
        const me = await usersApi.getMe().catch(() => null);
        if (me) {
          updateUser({ name: me.name, username: me.username });
        }
        addToast(`Welcome back, ${me?.name || 'Builder'}!`, 'success');
        router.push('/home');
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err?.message || 'Invalid email or password.');
    }
  };

  // ── 5. Forgot Password ────────────────────────────────────────────────────
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);

    const clean = forgotEmail.trim().toLowerCase();
    if (!clean) {
      setForgotError('Please enter your registered email address.');
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(clean, {
        redirectTo: `${window.location.origin}/login`,
      });

      if (error) {
        setForgotError(error.message);
      } else {
        setForgotSuccess(true);
      }
    } catch (err: any) {
      setForgotError(err?.message || 'Failed to send password reset link.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col justify-center items-center px-4 py-8 sm:py-12 selection:bg-[#6258DB]/20 relative">
      {/* Background soft ambient glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-gradient-to-tr from-purple-200/30 via-indigo-100/30 to-amber-100/20 blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-[440px] w-full bg-white border border-black/[0.06] rounded-[28px] sm:rounded-[32px] p-6 sm:p-9 shadow-xl relative z-10 transition-all">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-3 group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex items-center justify-center text-white shadow-md transition-transform group-hover:scale-105">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            </div>
            <span className="font-extrabold text-xl text-[#141724] tracking-tight">
              Growing Moon
            </span>
          </Link>

          <h1 className="text-xl sm:text-2xl font-black text-[#141724] tracking-tight">
            {otpStep === 'verify'
              ? 'Check Your Inbox'
              : authMethod === 'otp'
              ? 'Sign in with Email OTP'
              : mode === 'login'
              ? 'Welcome to your Journey'
              : 'Start Your Journey'}
          </h1>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            {otpStep === 'verify'
              ? `We sent a 6-digit verification code to ${email}`
              : authMethod === 'otp'
              ? 'Instant passwordless sign-in with a 6-digit code sent to your email.'
              : mode === 'login'
              ? 'Sign in to follow journeys and document your progress.'
              : 'Join others documenting their progress and learning paths.'}
          </p>
        </div>

        {/* ── STEP 1: AUTH METHOD TOGGLE (OTP vs PASSWORD) ────────────────── */}
        {otpStep === 'input' && (
          <div className="flex items-center justify-between p-1 bg-gray-100/90 rounded-2xl mb-5 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setAuthMethod('otp');
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMethod === 'otp'
                  ? 'bg-white text-[#6258DB] shadow-xs'
                  : 'text-gray-500 hover:text-black'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>6-Digit Code</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMethod('password');
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMethod === 'password'
                  ? 'bg-white text-[#141724] shadow-xs'
                  : 'text-gray-500 hover:text-black'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Password</span>
            </button>
          </div>
        )}

        {/* ── SOCIAL AUTH BUTTONS (GOOGLE & LINKEDIN) ────────────────────── */}
        {otpStep === 'input' && (
          <div className="space-y-2.5 mb-5">
            {/* Google */}
            <button
              type="button"
              onClick={() => handleOAuthLogin('Google')}
              disabled={Boolean(loadingProvider) || isLoading}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-[#141724] font-bold text-xs py-2.5 sm:py-3 px-4 rounded-2xl border border-gray-200 transition-all shadow-2xs hover:shadow-xs active:scale-98 disabled:opacity-50 cursor-pointer"
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.9c2.27-2.09 3.64-5.17 3.64-9.14z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.9-3.05c-1.08.72-2.45 1.16-4.03 1.16-3.1 0-5.74-2.1-6.68-4.94H1.21v3.15C3.25 21.43 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.32 14.26c-.24-.72-.38-1.49-.38-2.26s.14-1.54.38-2.26V6.59H1.21C.44 8.12 0 9.99 0 12s.44 3.88 1.21 5.41l4.11-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.25 2.57 1.21 6.59l4.11 3.15c.94-2.84 3.58-4.99 6.68-4.99z"
                />
              </svg>
              <span>
                {loadingProvider === 'Google' ? 'Connecting to Google...' : 'Continue with Google'}
              </span>
            </button>

            {/* LinkedIn */}
            <button
              type="button"
              onClick={() => handleOAuthLogin('LinkedIn')}
              disabled={Boolean(loadingProvider) || isLoading}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-[#141724] font-bold text-xs py-2.5 sm:py-3 px-4 rounded-2xl border border-gray-200 transition-all shadow-2xs hover:shadow-xs active:scale-98 disabled:opacity-50 cursor-pointer"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#0A66C2">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
              <span>
                {loadingProvider === 'LinkedIn'
                  ? 'Connecting to LinkedIn...'
                  : 'Continue with LinkedIn'}
              </span>
            </button>
          </div>
        )}

        {/* Divider */}
        {otpStep === 'input' && (
          <div className="relative flex items-center justify-center mb-5">
            <div className="border-t border-gray-200 w-full" />
            <span className="bg-white px-3 text-[11px] text-gray-400 font-medium uppercase tracking-wider absolute">
              {authMethod === 'otp' ? 'or passwordless code' : 'or with email'}
            </span>
          </div>
        )}

        {/* Alerts */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-800 text-xs animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 leading-snug">
              <span>{errorMsg}</span>
              {authMethod === 'password' && (
                <button
                  type="button"
                  onClick={handleAutoFill}
                  className="block mt-1 font-bold text-rose-700 hover:underline cursor-pointer"
                >
                  Auto-fill demo credentials ({DEMO_EMAIL} / {DEMO_PASSWORD})
                </button>
              )}
            </div>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-emerald-800 text-xs animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <span className="flex-1 leading-snug">{successMsg}</span>
          </div>
        )}

        {/* ── FLOW A: 6-DIGIT EMAIL OTP ──────────────────────────────────── */}
        {authMethod === 'otp' && (
          <>
            {otpStep === 'input' ? (
              <form onSubmit={handleSendOtp} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#141724] mb-1">
                    Your Name (Optional)
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Aditi Roy"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50/60 focus:bg-white border border-gray-200 rounded-2xl text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#6258DB] focus:ring-2 focus:ring-[#6258DB]/15 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#141724] mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setErrorMsg(null);
                      }}
                      placeholder="you@company.com"
                      required
                      className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50/60 focus:bg-white border border-gray-200 rounded-2xl text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#6258DB] focus:ring-2 focus:ring-[#6258DB]/15 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 bg-[#6258DB] hover:bg-[#5246D2] active:scale-98 text-white font-bold text-xs sm:text-sm py-3 px-4 rounded-2xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? (
                    <span>Sending code...</span>
                  ) : (
                    <>
                      <span>Send 6-Digit Code</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={handleSkipSignIn}
                    className="text-xs font-medium text-gray-400 hover:text-[#6258DB] hover:underline transition-colors cursor-pointer"
                  >
                    Skip sign in for testing purpose →
                  </button>
                </div>
              </form>
            ) : (
              /* OTP VERIFICATION STEP */
              <form onSubmit={handleVerifyOtp} className="space-y-4 animate-in fade-in duration-200">
                {/* Email address reminder with edit button */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-200/80">
                  <div className="flex items-center gap-2 min-w-0">
                    <Mail className="w-4 h-4 text-[#6258DB] flex-shrink-0" />
                    <span className="text-xs font-semibold text-[#141724] truncate">{email}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpStep('input');
                      setOtpCode('');
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className="text-xs font-bold text-[#6258DB] hover:underline flex items-center gap-1 cursor-pointer flex-shrink-0"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Change</span>
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#141724] mb-1.5 text-center">
                    Enter the 6-Digit Code
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoFocus
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => {
                      setOtpCode(e.target.value.replace(/\D/g, ''));
                      setErrorMsg(null);
                    }}
                    placeholder="••••••"
                    className="w-full py-3 bg-gray-50 focus:bg-white border-2 border-gray-200 rounded-2xl text-center font-mono font-extrabold text-2xl tracking-[12px] text-[#141724] focus:outline-none focus:border-[#6258DB] focus:ring-4 focus:ring-[#6258DB]/10 transition-all"
                  />
                  <p className="text-[11px] text-gray-400 text-center mt-1">
                    Check your email inbox or spam folder.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || otpCode.length < 6}
                  className="w-full bg-[#6258DB] hover:bg-[#5246D2] active:scale-98 text-white font-bold text-xs sm:text-sm py-3 px-4 rounded-2xl transition-all shadow-md hover:shadow-lg disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? (
                    <span>Verifying code...</span>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Verify & Enter</span>
                    </>
                  )}
                </button>

                {/* Resend Code Button & Countdown */}
                <div className="text-center pt-1">
                  {resendCountdown > 0 ? (
                    <span className="text-xs text-gray-400 font-medium">
                      Resend new code in {resendCountdown}s
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={isLoading}
                      className="text-xs font-bold text-[#6258DB] hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Resend 6-Digit Code</span>
                    </button>
                  )}
                </div>

                <div className="pt-1 text-center">
                  <button
                    type="button"
                    onClick={handleSkipSignIn}
                    className="text-xs font-medium text-gray-400 hover:text-[#6258DB] hover:underline transition-colors cursor-pointer"
                  >
                    Skip sign in for testing purpose →
                  </button>
                </div>
              </form>
            )}
          </>
        )}

        {/* ── FLOW B: TRADITIONAL EMAIL & PASSWORD ───────────────────────── */}
        {authMethod === 'password' && (
          <form onSubmit={handlePasswordAuth} className="space-y-3.5">
            {/* Mode switch */}
            <div className="grid grid-cols-2 p-1 bg-gray-100/90 rounded-2xl mb-4 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMsg(null);
                }}
                className={`py-1.5 rounded-xl transition-all cursor-pointer ${
                  mode === 'login'
                    ? 'bg-white text-[#141724] shadow-xs'
                    : 'text-gray-500 hover:text-black'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMsg(null);
                }}
                className={`py-1.5 rounded-xl transition-all cursor-pointer ${
                  mode === 'register'
                    ? 'bg-white text-[#141724] shadow-xs'
                    : 'text-gray-500 hover:text-black'
                }`}
              >
                Register
              </button>
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-[#141724] mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Lokesh"
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50/60 focus:bg-white border border-gray-200 rounded-2xl text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#6258DB] focus:ring-2 focus:ring-[#6258DB]/15 transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#141724] mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrorMsg(null);
                  }}
                  placeholder="name@example.com"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50/60 focus:bg-white border border-gray-200 rounded-2xl text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#6258DB] focus:ring-2 focus:ring-[#6258DB]/15 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-[#141724]">Password</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotModalOpen(true);
                      setForgotEmail(email || DEMO_EMAIL);
                      setForgotSuccess(false);
                      setForgotError(null);
                    }}
                    className="text-[11.5px] font-semibold text-[#6258DB] hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMsg(null);
                  }}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-10 py-2.5 bg-gray-50/60 focus:bg-white border border-gray-200 rounded-2xl text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#6258DB] focus:ring-2 focus:ring-[#6258DB]/15 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-[#141724] mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50/60 focus:bg-white border border-gray-200 rounded-2xl text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#6258DB] focus:ring-2 focus:ring-[#6258DB]/15 transition-all"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-[#141724] hover:bg-black active:scale-98 text-white font-bold text-xs sm:text-sm py-3 px-4 rounded-2xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Sign In with Password' : 'Create Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={handleSkipSignIn}
                className="text-xs font-medium text-gray-400 hover:text-[#6258DB] hover:underline transition-colors cursor-pointer"
              >
                Skip sign in for testing purpose →
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ── FORGOT PASSWORD MODAL ─────────────────────────────────────── */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 relative">
            <button
              type="button"
              onClick={() => setIsForgotModalOpen(false)}
              className="absolute right-4 top-4 p-1.5 rounded-full text-gray-400 hover:text-black hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-10 h-10 rounded-full bg-[#EEEDFE] text-[#6258DB] flex items-center justify-center mb-3">
              <KeyRound className="w-5 h-5" />
            </div>

            <h3 className="text-base font-bold text-[#141724]">Reset your password</h3>
            <p className="text-xs text-gray-500 mt-1 mb-4 leading-relaxed">
              Enter your email and we will send you a secure password reset link.
            </p>

            {forgotSuccess ? (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs">
                <p className="font-bold mb-1">Check your inbox!</p>
                <p>Password reset email sent to {forgotEmail}. Follow the link in the email to set a new password.</p>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-3">
                {forgotError && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                    {forgotError}
                  </div>
                )}
                <div>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="you@company.com"
                    required
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs text-gray-900 focus:outline-none focus:border-[#6258DB]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#6258DB] hover:bg-[#5246D2] text-white font-bold text-xs py-2.5 rounded-2xl transition-all cursor-pointer"
                >
                  Send Reset Link
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
