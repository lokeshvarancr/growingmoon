'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/state/AppContext';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isAuthLoading } = useApp();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [mounted, isAuthLoading, isAuthenticated, router]);

  // Stable SSR & initial hydration shell (100% server/client HTML match)
  if (!mounted || (isAuthLoading && !isAuthenticated)) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center select-none">
        <div className="w-8 h-8 rounded-full border-2 border-[#6258DB] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
