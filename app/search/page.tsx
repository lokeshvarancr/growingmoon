'use client';
import React, { Suspense } from 'react';
import UnifiedSearchView from '@/components/search/UnifiedSearchView';
import AppShell from '@/components/shared/AppShell';

function SearchFallback() {
  return (
    <AppShell>
      <div className="max-w-[1000px] mx-auto px-4 py-8 text-center">
        <div className="w-8 h-8 border-2 border-gm-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-gray-500 font-medium">Loading search...</p>
      </div>
    </AppShell>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchFallback />}>
      <UnifiedSearchView />
    </Suspense>
  );
}
