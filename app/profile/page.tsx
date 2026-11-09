'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/state/AppContext';

export default function ProfileRedirectPage() {
  const router = useRouter();
  const { currentUser } = useApp();

  useEffect(() => {
    router.replace(`/profile/${currentUser.username}`);
  }, [router, currentUser.username]);

  return null;
}
