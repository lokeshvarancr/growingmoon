'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { setStoredAuthToken, usersApi } from '@/lib/api/client';
import { useApp } from '@/lib/state/AppContext';

export default function AuthCallbackPage() {
  const router = useRouter();
  const { updateUser, addToast } = useApp();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (session?.access_token) {
        setStoredAuthToken(session.access_token);
        usersApi
          .getMe()
          .then((me) => {
            updateUser({
              name: me.name,
              username: me.username,
              avatar: me.avatar_initials,
              avatarImage: me.avatar_image || undefined,
            });
            addToast(`Welcome to Growing Moon, ${me.name}!`, 'success');
            router.replace('/home');
          })
          .catch(() => {
            router.replace('/home');
          });
      } else {
        if (error) console.error('OAuth callback error:', error);
        router.replace('/login');
      }
    });
  }, [router, updateUser, addToast]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-10 h-10 rounded-full border-3 border-[#6258DB] border-t-transparent animate-spin mb-3" />
      <h2 className="text-sm font-bold text-[#141724]">Completing secure sign-in...</h2>
      <p className="text-xs text-gray-500 mt-1">Setting up your Growing Moon workspace.</p>
    </div>
  );
}
