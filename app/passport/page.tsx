'use client';
import React from 'react';
import JourneyPassportView from '@/components/passport/JourneyPassportView';
import { useApp } from '@/lib/state/AppContext';

export default function CurrentUserPassportPage() {
  const { currentUser } = useApp();

  return <JourneyPassportView founder={currentUser} isOwner={true} />;
}
