'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AuthFrame from '@/components/shared/AuthFrame';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '@/lib/state/AppContext';
import { supabase } from '@/lib/supabaseClient';
import { authApi, setStoredAuthToken, usersApi } from '@/lib/api/client';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  X,
} from 'lucide-react';

export default function LoginPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-gm-paper flex items-center justify-center text-xs text-gray-400">Loading Login...</div>}>
      <LoginForm />
    </React.Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams?.get('redirect') || '';
  const targetDestination = redirectParam && redirectParam.startsWith('/') ? redirectParam : '/home';
  const { updateUser, addToast, isAuthenticated, isAuthLoading } = useApp();

  // If already authenticated, redirect immediately to intended target
  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      router.replace(targetDestination);
    }
  }, [isAuthLoading, isAuthenticated, router, targetDestination]);

  // Input states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status & feedback
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<'Google' | 'LinkedIn' | null>(null);

  // Forgot Password modal state
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);

  // ── 1. Backend & Supabase OAuth Initiation (Google & LinkedIn) ───────────
  const handleOAuthLogin = async (provider: 'Google' | 'LinkedIn') => {
    setLoadingProvider(provider);
    setErrorMsg(null);

    const providerKey = provider === 'Google' ? 'google' : 'linkedin_oidc';
    const callbackUrl = `${window.location.origin}/auth/callback`;

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: providerKey as any,
        options: {
          redirectTo: callbackUrl,
        },
      });

      if (error) {
        // Fallback to backend authorization URL endpoint
        if (provider === 'Google') {
          const res = await authApi.getGoogleOAuthUrl(callbackUrl);
          if (res?.url) window.location.href = res.url;
        } else {
          const res = await authApi.getLinkedInOAuthUrl(callbackUrl);
          if (res?.url) window.location.href = res.url;
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || `Failed to initiate ${provider} authentication.`);
      setLoadingProvider(null);
    }
  };

  // ── 2. Backend Email + Password Sign In ────────────────────────────────────
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setErrorMsg('Please enter both your email address and password.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await authApi.login({
        email: cleanEmail,
        password: cleanPassword,
      });

      if (res?.access_token) {
        setStoredAuthToken(res.access_token);

        if (res.user) {
          updateUser({
            id: res.user.id,
            name: res.user.name,
            username: res.user.username,
            avatar: res.user.avatar_initials,
            avatarImage: res.user.avatar_image || undefined,
          });
          addToast(`Welcome back, ${res.user.name}!`, 'success');
        } else {
          addToast('Signed in successfully!', 'success');
        }

        router.push(targetDestination);
      } else {
        throw new Error('Authentication succeeded but no access token was returned.');
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err?.message || 'Invalid email or password. Please check your credentials.');
    }
  };

  // ── 3. Forgot Password Handler ────────────────────────────────────────────
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);

    const clean = forgotEmail.trim().toLowerCase();
    if (!clean) {
      setForgotError('Please enter your registered email address.');
      return;
    }

    try {
      setForgotSuccess(true);
    } catch (err: any) {
      setForgotError(err?.message || 'Failed to send reset link.');
    }
  };

  return (
    <AuthFrame tagline="Helping people find someone ahead of them on their journey">

      {/* Main Card Container */}
      <div className="bg-white border border-gm-ink/[0.05] rounded-[32px] p-6 sm:p-10 max-w-md w-full shadow-card-hover relative overflow-hidden">
        {/* Card Title */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl sm:text-4xl text-gm-ink">
            Sign In
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Welcome back! Enter your email and password to continue.
          </p>
        </div>

        {/* Feedback Messages */}
        {errorMsg && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <span className="flex-1 leading-relaxed">{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <span className="flex-1 leading-relaxed">{successMsg}</span>
          </div>
        )}

        {/* ── EMAIL + PASSWORD FORM ────────────────────────────────────────── */}
        <form onSubmit={handlePasswordLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gm-ink mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="w-full pl-11 pr-3.5 h-12 bg-gray-100/70 focus:bg-white border border-transparent hover:border-gray-200 rounded-full text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gm-accent focus:ring-2 focus:ring-gm-accent/15 transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-gm-ink">Password</label>
              <button
                type="button"
                onClick={() => {
                  setIsForgotModalOpen(true);
                  setForgotEmail(email);
                  setForgotSuccess(false);
                  setForgotError(null);
                }}
                className="text-[11.5px] font-semibold text-gm-accent hover:underline cursor-pointer"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-11 pr-10 h-12 bg-gray-100/70 focus:bg-white border border-transparent hover:border-gray-200 rounded-full text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gm-accent focus:ring-2 focus:ring-gm-accent/15 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || Boolean(loadingProvider)}
            className="w-full mt-2 bg-gm-ink hover:bg-gm-accent text-white font-bold text-xs sm:text-sm h-12 px-4 rounded-full transition-all shadow-float disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <span>Signing in...</span>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* ── DIVIDER ──────────────────────────────────────────────────────── */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <span className="relative bg-white px-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            or continue with
          </span>
        </div>

        {/* ── SOCIAL AUTH BUTTONS (GOOGLE & LINKEDIN) ──────────────────────── */}
        <div className="space-y-2.5">
          {/* Google */}
          <button
            type="button"
            onClick={() => handleOAuthLogin('Google')}
            disabled={Boolean(loadingProvider) || isLoading}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gm-ink font-bold text-xs h-12 px-4 rounded-full border border-gray-200 hover:border-gray-400 transition-all disabled:opacity-50 cursor-pointer"
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
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gm-ink font-bold text-xs h-12 px-4 rounded-full border border-gray-200 hover:border-gray-400 transition-all disabled:opacity-50 cursor-pointer"
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

        {/* ── FOOTER: LINK TO REGISTER ─────────────────────────────────────── */}
        <div className="mt-6 pt-4 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-600">
            Don&apos;t have an account?{' '}
            <Link
              href={redirectParam ? `/register?redirect=${encodeURIComponent(redirectParam)}` : '/register'}
              className="font-bold text-gm-accent hover:text-gm-accent-deep hover:underline transition-colors"
            >
              Register here →
            </Link>
          </p>
        </div>
      </div>

      {/* ── FORGOT PASSWORD MODAL ─────────────────────────────────────────── */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 !mt-0 bg-gm-ink/40 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-[28px] max-w-sm w-full p-7 shadow-modal border border-gm-ink/5 animate-slide-up relative">
            <button
              type="button"
              onClick={() => setIsForgotModalOpen(false)}
              className="absolute right-4 top-4 p-1.5 rounded-full text-gray-400 hover:text-black hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-10 h-10 rounded-full bg-gm-accent-soft text-gm-accent flex items-center justify-center mb-3">
              <KeyRound className="w-5 h-5" />
            </div>

            <h3 className="text-base font-bold text-gm-ink">Reset your password</h3>
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
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs text-gray-900 focus:outline-none focus:border-gm-accent"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-gm-accent hover:bg-gm-accent-deep text-white font-bold text-xs py-2.5 rounded-2xl transition-all cursor-pointer"
                >
                  Send Reset Link
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </AuthFrame>
  );
}
