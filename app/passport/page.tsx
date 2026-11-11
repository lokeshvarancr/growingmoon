'use client';
import React from 'react';
import JourneyPassportView from '@/components/passport/JourneyPassportView';
import { useApp } from '@/lib/state/AppContext';

export default function CurrentUserPassportPage() {
  const { currentUser } = useApp();

  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-[#6258DB] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <JourneyPassportView founder={currentUser} isOwner={true} />
    </React.Suspense>
  );
}
