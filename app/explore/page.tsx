'use client';
import React, { Suspense } from 'react';
import ExploreView from '@/components/explore/ExploreView';

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-gm-text-secondary">Loading Explore...</div>}>
      <ExploreView />
    </Suspense>
  );
}
