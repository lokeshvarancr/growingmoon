'use client';
import React, { useState } from 'react';
import MobileNavigation from './MobileNavigation';
import TopBar from './TopBar';
import FeatureSuggestionModal from '@/components/feedback/FeatureSuggestionModal';
import { useApp } from '@/lib/state/AppContext';
import { Lightbulb, Sparkles } from 'lucide-react';

type AppShellProps = {
  children: React.ReactNode;
  rightSidebar?: React.ReactNode;
  leftSidebar?: React.ReactNode;
};

export default function AppShell({ children, rightSidebar, leftSidebar }: AppShellProps) {
  const { isAuthenticated } = useApp();
  const [isFeatureModalOpen, setIsFeatureModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gm-ivory text-gm-midnight antialiased relative">
      {/* Main Content Area without fixed sidebar offset */}
      <div className="flex flex-col min-h-screen pb-20 md:pb-8 transition-all">
        <TopBar />

        <div className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
          <div className={`w-full ${leftSidebar || rightSidebar ? 'flex gap-6 lg:gap-8 items-start justify-between' : ''}`}>
            {/* Contextual Left Sidebar (Straight aligned with Logo) */}
            {leftSidebar && (
              <aside className="hidden lg:block w-64 lg:w-72 sticky top-20 flex-shrink-0 space-y-4">
                {leftSidebar}
              </aside>
            )}

            {/* Center column (Centered on tablet/mobile when sidebars are hidden, flex-1 max-w-3xl on desktop) */}
            <main className={`min-w-0 w-full ${leftSidebar || rightSidebar ? 'flex-1 max-w-3xl mx-auto' : ''}`}>
              {children}
            </main>

            {/* Contextual Right Sidebar (Straight aligned with Profile end) */}
            {rightSidebar && (
              <aside className="hidden lg:block w-72 xl:w-80 sticky top-20 flex-shrink-0 space-y-5">
                {rightSidebar}
              </aside>
            )}
          </div>
        </div>
      </div>

      {/* Floating Action Button (Bottom-Right Corner) for Feature Suggestions - Authenticated Only */}
      {isAuthenticated && (
        <div className="fixed bottom-20 md:bottom-6 right-5 sm:right-6 z-40">
          <button
            type="button"
            onClick={() => setIsFeatureModalOpen(true)}
            className="group flex items-center gap-2 py-3 px-3.5 sm:px-4 bg-[#141724] hover:bg-black text-white rounded-full shadow-xl hover:shadow-2xl border border-white/10 active:scale-95 transition-all duration-200 cursor-pointer"
            title="Suggest a Feature or Vote"
            aria-label="Suggest a Feature"
          >
            <div className="w-6 h-6 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center">
              <Lightbulb className="w-3.5 h-3.5" />
            </div>
            <span className="hidden sm:inline text-xs font-bold tracking-tight pr-1">
              Suggest Feature
            </span>
            <span className="flex h-2 w-2 relative -ml-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
          </button>
        </div>
      )}

      {/* Feature Suggestion Modal */}
      <FeatureSuggestionModal
        isOpen={isFeatureModalOpen}
        onClose={() => setIsFeatureModalOpen(false)}
      />

      {/* Mobile Bottom 5-Icon Navigation */}
      <MobileNavigation />
    </div>
  );
}
