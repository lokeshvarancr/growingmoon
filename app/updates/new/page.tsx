'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/shared/AppShell';
import JourneyUpdateComposer from '@/components/feed/JourneyUpdateComposer';
import { ArrowLeft } from 'lucide-react';

export default function NewUpdatePage() {
  const router = useRouter();

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-4">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-[#141724] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Feed</span>
        </button>

        <JourneyUpdateComposer
          isStandalonePage
          onSuccess={() => router.push('/home')}
        />
      </div>
    </AppShell>
  );
}
