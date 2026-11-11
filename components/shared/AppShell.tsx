'use client';
import React, { useState } from 'react';
import { motion } from 'motion/react';
import MobileNavigation from './MobileNavigation';
import TopBar from './TopBar';
import FeatureSuggestionModal from '@/components/feedback/FeatureSuggestionModal';
import { useApp } from '@/lib/state/AppContext';
import { Lightbulb } from 'lucide-react';

type AppShellProps = {
  children: React.ReactNode;
  rightSidebar?: React.ReactNode;
  leftSidebar?: React.ReactNode;
};

export default function AppShell({ children, rightSidebar, leftSidebar }: AppShellProps) {
  const { isAuthenticated } = useApp();
  const [isFeatureModalOpen, setIsFeatureModalOpen] = useState(false);
  const hasSidebars = Boolean(leftSidebar || rightSidebar);

  return (
    <div className="min-h-screen bg-gm-ivory text-gm-midnight antialiased relative isolate">
      {/* Ambient moonlight wash */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-48 -right-40 w-[620px] h-[620px] rounded-full bg-gm-accent/[0.07] blur-[110px]" />
        <div className="absolute top-1/2 -left-56 w-[520px] h-[520px] rounded-full bg-gm-moss/[0.06] blur-[120px]" />
      </div>

      <div className="flex flex-col min-h-screen pb-28 md:pb-10">
        <TopBar />

        <div className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-6">
          <div className={`w-full ${hasSidebars ? 'flex gap-6 lg:gap-10 items-start justify-between' : ''}`}>
            {leftSidebar && (
              <aside className="hidden lg:block w-64 lg:w-72 sticky top-24 flex-shrink-0 space-y-4 animate-fade-in">
                {leftSidebar}
              </aside>
            )}

            <main className={`min-w-0 w-full ${hasSidebars ? 'flex-1 max-w-3xl mx-auto' : ''}`}>
              {children}
            </main>

            {rightSidebar && (
              <aside className="hidden lg:block w-72 xl:w-80 sticky top-24 flex-shrink-0 space-y-5 animate-fade-in">
                {rightSidebar}
              </aside>
            )}
          </div>
        </div>
      </div>

      {/* Floating Action Button for Feature Suggestions - Authenticated Only */}
      {isAuthenticated && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.6, type: 'spring', stiffness: 300, damping: 24 }}
          className="fixed bottom-24 md:bottom-6 right-4 sm:right-6 z-40"
        >
          <button
            type="button"
            onClick={() => setIsFeatureModalOpen(true)}
            className="group flex items-center gap-2 h-12 pl-1.5 pr-1.5 sm:pr-4 bg-gm-ink text-gm-paper rounded-full shadow-float hover:shadow-modal transition-shadow cursor-pointer"
            title="Suggest a Feature or Vote"
            aria-label="Suggest a Feature"
            data-testid="feature-suggestion-fab"
          >
            <span className="w-9 h-9 rounded-full bg-gm-accent text-white flex items-center justify-center transition-transform duration-500 group-hover:rotate-[20deg]">
              <Lightbulb className="w-4 h-4" />
            </span>
            <span className="hidden sm:inline text-[13px] font-semibold tracking-tight">Suggest Feature</span>
            <span className="flex h-2 w-2 relative -ml-0.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gm-accent opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-gm-accent" />
            </span>
          </button>
        </motion.div>
      )}

      <FeatureSuggestionModal isOpen={isFeatureModalOpen} onClose={() => setIsFeatureModalOpen(false)} />

      <MobileNavigation />
    </div>
  );
}
