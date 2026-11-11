'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { authApi, setStoredAuthToken, usersApi } from '@/lib/api/client';
import { useApp } from '@/lib/state/AppContext';

export default function AuthCallbackPage() {
  const router = useRouter();
  const { updateUser, addToast } = useApp();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout | null = null;

    async function handleAuth() {
      try {
        // 1. Check URL for explicit OAuth errors
        if (typeof window !== 'undefined') {
          const url = new URL(window.location.href);
          const error = url.searchParams.get('error');
          const errorDescription = url.searchParams.get('error_description');
          if (error) {
            console.warn('OAuth provider returned error parameter:', error, errorDescription);
            if (error === 'access_denied') {
              if (isMounted) {
                addToast(
                  'Sign-in was cancelled or access was denied. If your Google Cloud app is in Testing mode, ensure your email is added under Test Users.',
                  'warning'
                );
                router.replace('/login');
              }
              return;
            }
            throw new Error(errorDescription || error);
          }
        }

        // 2. Direct extraction from hash fragment if present (#access_token=...)
        let extractedToken: string | null = null;
        if (typeof window !== 'undefined' && window.location.hash) {
          const rawHash = window.location.hash.startsWith('#')
            ? window.location.hash.substring(1)
            : window.location.hash;
          const hashParams = new URLSearchParams(rawHash);
          const tokenInHash = hashParams.get('access_token');
          if (tokenInHash) {
            extractedToken = tokenInHash;
            setStoredAuthToken(tokenInHash);
          }
        }

        // 3. Check for PKCE authorization code in query params (?code=...)
        if (typeof window !== 'undefined') {
          const url = new URL(window.location.href);
          const code = url.searchParams.get('code');
          if (code) {
            try {
              // Try Supabase client code exchange
              const { data: exchangeData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
              if (exchangeData?.session?.access_token) {
                extractedToken = exchangeData.session.access_token;
                setStoredAuthToken(extractedToken);
              } else {
                console.warn('Supabase code exchange returned no session, trying backend:', exchangeError);
                // Fallback to backend exchange
                try {
                  const redirectUri = `${window.location.origin}/auth/callback`;
                  const beRes = await authApi.handleOAuthCallback(code, 'google', redirectUri);
                  if (beRes?.access_token) {
                    extractedToken = beRes.access_token;
                    setStoredAuthToken(extractedToken);
                  }
                } catch (beErr) {
                  console.warn('Backend OAuth code exchange note:', beErr);
                }
              }
            } catch (exchangeErr) {
              console.warn('Supabase code exchange threw error, falling back to backend:', exchangeErr);
              try {
                const redirectUri = `${window.location.origin}/auth/callback`;
                const beRes = await authApi.handleOAuthCallback(code, 'google', redirectUri);
                if (beRes?.access_token) {
                  extractedToken = beRes.access_token;
                  setStoredAuthToken(extractedToken);
                }
              } catch (beErr) {
                console.warn('Backend OAuth code exchange note:', beErr);
              }
            }
          }
        }

        // 4. Retrieve session from Supabase Client
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (session?.access_token) {
          extractedToken = session.access_token;
          setStoredAuthToken(session.access_token);
        }

        // 5. If we have a token or session, resolve the user profile
        if (extractedToken || session?.access_token) {
          const activeToken = extractedToken || session?.access_token;
          if (activeToken) setStoredAuthToken(activeToken);

          // Attempt to retrieve authoritative profile from backend
          try {
            const me = await usersApi.getMe();
            if (isMounted && me) {
              updateUser({
                id: me.id,
                name: me.name,
                username: me.username,
                avatar: me.avatar_initials || 'GM',
                avatarImage: me.avatar_image || undefined,
              });
              addToast(`Welcome back, ${me.name}!`, 'success');
              router.replace('/home');
              return;
            }
          } catch (meErr) {
            console.warn('Backend getMe lookup note during callback:', meErr);
          }

          // Fallback: If session user is present, use session metadata
          if (session?.user && isMounted) {
            const uMeta = session.user.user_metadata || {};
            const resolvedName = uMeta.full_name || uMeta.name || session.user.email?.split('@')[0] || 'Member';
            const resolvedUsername = uMeta.username || session.user.email?.split('@')[0] || 'user';
            const initials = resolvedName.slice(0, 2).toUpperCase() || 'GM';

            updateUser({
              id: session.user.id,
              name: resolvedName,
              username: resolvedUsername,
              avatar: initials,
              avatarImage: uMeta.avatar_url || uMeta.picture || undefined,
            });
            addToast(`Welcome, ${resolvedName}!`, 'success');
            router.replace('/home');
            return;
          }

          // If token exists, proceed to home
          if (isMounted) {
            router.replace('/home');
            return;
          }
        }

        // 6. Setup auth state change listener if session detection is delayed
        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, newSession) => {
          if (newSession?.access_token && isMounted) {
            setStoredAuthToken(newSession.access_token);
            try {
              const me = await usersApi.getMe();
              if (isMounted && me) {
                updateUser({
                  id: me.id,
                  name: me.name,
                  username: me.username,
                  avatar: me.avatar_initials || 'GM',
                  avatarImage: me.avatar_image || undefined,
                });
                addToast(`Welcome back, ${me.name}!`, 'success');
                router.replace('/home');
                return;
              }
            } catch {
              // Ignore
            }

            if (isMounted) {
              router.replace('/home');
            }
          }
        });

        // 7. Safety timeout: If not resolved within 5 seconds, attempt home or show error
        timeoutId = setTimeout(() => {
          if (!isMounted) return;
          const currentToken = typeof window !== 'undefined' ? localStorage.getItem('gm_access_token') : null;
          if (currentToken) {
            router.replace('/home');
          } else {
            setErrorMessage('Unable to resolve user session from authentication provider. Please try signing in again.');
          }
        }, 4500);

        return () => {
          authListener?.subscription?.unsubscribe();
        };
      } catch (err: any) {
        console.error('OAuth Callback Error:', err);
        if (isMounted) {
          const rawMsg = err.message || '';
          let userFriendlyMsg = rawMsg;
          if (rawMsg.toLowerCase().includes('permission scope')) {
            userFriendlyMsg = 'LinkedIn permission scope error. Please ensure "Sign In with LinkedIn using OpenID Connect" is added to your LinkedIn Developer App products, or sign in using Google / Email.';
          } else if (rawMsg.toLowerCase().includes('access_denied')) {
            userFriendlyMsg = 'Access was denied or cancelled by the provider. If your Google OAuth App is in Testing status, please add your Google account under "Test Users" in Google Cloud Console, or publish the OAuth consent screen.';
          }
          setErrorMessage(userFriendlyMsg);
        }
      }
    }

    handleAuth();

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [router, updateUser, addToast]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-6 text-center select-none">
      {errorMessage ? (
        <div className="max-w-md p-6 bg-white border border-rose-200 rounded-3xl shadow-lg text-xs text-center">
          <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3 font-bold text-sm">
            !
          </div>
          <h3 className="font-bold text-sm text-[#141724] mb-2">Authentication Notice</h3>
          <p className="text-gray-600 leading-relaxed mb-5">{errorMessage}</p>
          <button
            type="button"
            onClick={() => router.replace('/login')}
            className="w-full py-3 px-4 rounded-2xl bg-[#141724] hover:bg-black text-white font-bold text-xs transition-all cursor-pointer"
          >
            Return to Sign In
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          {/* Continuous Loop Aesthetic Crescent Pulse (No percentage) */}
          <div className="relative w-16 h-16 flex items-center justify-center mb-4">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#6258DB]/20 to-[#9E77ED]/20 animate-ping opacity-75 duration-1000" />
            <div className="w-12 h-12 rounded-full border-2 border-[#6258DB]/30 border-t-[#6258DB] animate-spin flex items-center justify-center shadow-lg bg-white/80 backdrop-blur-xs">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-[#6258DB] animate-pulse">
                <path
                  d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
                  fill="currentColor"
                />
              </svg>
            </div>
          </div>
          <h2 className="text-sm font-bold text-[#141724] tracking-tight">Completing secure sign-in...</h2>
          <p className="text-xs text-gray-500 mt-1">Preparing your Growing Moon journey.</p>
        </div>
      )}
    </div>
  );
}
