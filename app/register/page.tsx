'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '@/lib/state/AppContext';
import { supabase } from '@/lib/supabaseClient';
import { authApi, setStoredAuthToken, usersApi } from '@/lib/api/client';
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export default function RegisterPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center text-xs text-gray-400">Loading Register...</div>}>
      <RegisterForm />
    </React.Suspense>
  );
}

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams?.get('redirect') || '';
  const targetDestination = redirectParam && redirectParam.startsWith('/') ? redirectParam : '/home';
  const { updateUser, addToast, isAuthenticated, isAuthLoading } = useApp();

  // If already authenticated, redirect immediately
  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      router.replace(targetDestination);
    }
  }, [isAuthLoading, isAuthenticated, router, targetDestination]);

  // Input states (Strictly 4 fields)
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status & feedback
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<'Google' | 'LinkedIn' | null>(null);

  // ── 1. Backend & Supabase OAuth Initiation (Google & LinkedIn) ───────────
  const handleOAuthSignUp = async (provider: 'Google' | 'LinkedIn') => {
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
      setErrorMsg(err?.message || `Failed to initiate ${provider} sign up.`);
      setLoadingProvider(null);
    }
  };

  // ── 2. Create Account with 4 Fields via Backend API ───────────────────────
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();
    const cleanConfirm = confirmPassword.trim();

    if (!cleanName) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    if (!cleanEmail) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    if (cleanPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (cleanPassword !== cleanConfirm) {
      setErrorMsg('Passwords do not match. Please re-enter your password.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await authApi.register({
        name: cleanName,
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
          addToast(`Welcome to Growing Moon, ${res.user.name}!`, 'success');
        } else {
          addToast(`Welcome to Growing Moon, ${cleanName}!`, 'success');
        }

        router.push(targetDestination);
      } else {
        throw new Error('Registration succeeded but no access token was returned.');
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err?.message || 'Failed to create account. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-4 sm:p-6 select-none">
      {/* Brand Header */}
      <div className="mb-6 sm:mb-8 text-center">
        <Link href="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#141724] to-[#2B2F44] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
              <path
                d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
                fill="currentColor"
              />
            </svg>
          </div>
          <span className="font-extrabold text-xl sm:text-2xl text-[#141724] tracking-tight">
            Growing Moon
          </span>
        </Link>
        <p className="text-xs text-gray-500 mt-2 font-medium">
          Start documenting and discovering real founder journeys
        </p>
      </div>

      {/* Main Card Container */}
      <div className="bg-white border border-black/[0.06] rounded-[32px] sm:rounded-[36px] p-6 sm:p-8 max-w-md w-full shadow-lg relative overflow-hidden">
        {/* Card Title */}
        <div className="mb-6 text-center">
          <h2 className="text-xl sm:text-2xl font-black text-[#141724] tracking-tight">
            Create Account
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Fill in your details below to create your Growing Moon profile.
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

        {/* ── 4-FIELD REGISTRATION FORM ────────────────────────────────────── */}
        <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
          {/* 1. Full Name */}
          <div>
            <label className="block text-xs font-bold text-[#141724] mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Lokesh V"
                required
                className="w-full pl-10 pr-3.5 py-3 bg-gray-50/70 focus:bg-white border border-gray-200 rounded-2xl text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#6258DB] focus:ring-2 focus:ring-[#6258DB]/15 transition-all"
              />
            </div>
          </div>

          {/* 2. Email */}
          <div>
            <label className="block text-xs font-bold text-[#141724] mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="lokesh@example.com"
                required
                className="w-full pl-10 pr-3.5 py-3 bg-gray-50/70 focus:bg-white border border-gray-200 rounded-2xl text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#6258DB] focus:ring-2 focus:ring-[#6258DB]/15 transition-all"
              />
            </div>
          </div>

          {/* 3. Password */}
          <div>
            <label className="block text-xs font-bold text-[#141724] mb-1.5">
              Enter Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                className="w-full pl-10 pr-10 py-3 bg-gray-50/70 focus:bg-white border border-gray-200 rounded-2xl text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#6258DB] focus:ring-2 focus:ring-[#6258DB]/15 transition-all"
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

          {/* 4. Confirm Password */}
          <div>
            <label className="block text-xs font-bold text-[#141724] mb-1.5">
              Re-enter Confirm Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                required
                className="w-full pl-10 pr-3.5 py-3 bg-gray-50/70 focus:bg-white border border-gray-200 rounded-2xl text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#6258DB] focus:ring-2 focus:ring-[#6258DB]/15 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || Boolean(loadingProvider)}
            className="w-full mt-3 bg-[#141724] hover:bg-black active:scale-98 text-white font-bold text-xs sm:text-sm py-3.5 px-4 rounded-2xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <span>Creating account...</span>
            ) : (
              <>
                <span>Create Account</span>
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
            or register with
          </span>
        </div>

        {/* ── SOCIAL AUTH BUTTONS (GOOGLE & LINKEDIN) ──────────────────────── */}
        <div className="space-y-2.5">
          {/* Google */}
          <button
            type="button"
            onClick={() => handleOAuthSignUp('Google')}
            disabled={Boolean(loadingProvider) || isLoading}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-[#141724] font-bold text-xs py-3 px-4 rounded-2xl border border-gray-200 transition-all shadow-2xs hover:shadow-xs active:scale-98 disabled:opacity-50 cursor-pointer"
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
            onClick={() => handleOAuthSignUp('LinkedIn')}
            disabled={Boolean(loadingProvider) || isLoading}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-[#141724] font-bold text-xs py-3 px-4 rounded-2xl border border-gray-200 transition-all shadow-2xs hover:shadow-xs active:scale-98 disabled:opacity-50 cursor-pointer"
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

        {/* ── FOOTER: LINK TO LOGIN ────────────────────────────────────────── */}
        <div className="mt-6 pt-4 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-600">
            Already have an account?{' '}
            <Link
              href={redirectParam ? `/login?redirect=${encodeURIComponent(redirectParam)}` : '/login'}
              className="font-bold text-[#6258DB] hover:text-[#5246D2] hover:underline transition-colors"
            >
              Sign In here →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
