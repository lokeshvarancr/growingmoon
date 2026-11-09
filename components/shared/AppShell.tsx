'use client';
import React from 'react';
import MobileNavigation from './MobileNavigation';
import TopBar from './TopBar';

type AppShellProps = {
  children: React.ReactNode;
  rightSidebar?: React.ReactNode;
  leftSidebar?: React.ReactNode;
};

export default function AppShell({ children, rightSidebar, leftSidebar }: AppShellProps) {
  return (
    <div className="min-h-screen bg-gm-ivory text-gm-midnight antialiased">
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

      {/* Mobile Bottom 5-Icon Navigation */}
      <MobileNavigation />
    </div>
  );
}
