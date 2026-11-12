'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'motion/react';
import { useApp } from '@/lib/state/AppContext';
import { Home, Search, Plus, Bell } from 'lucide-react';

function Tab({ href, active, label, children }: { href: string; active: boolean; label: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-label={label}
      className={`relative flex-1 flex flex-col items-center justify-center h-14 gap-1 transition-colors ${
        active ? 'text-gm-ink' : 'text-gray-400'
      }`}
      data-testid={`mobile-nav-${label.toLowerCase().replace(/\s+/g, '-')}`}
    >
      {children}
      <span className="h-1 flex items-center">
        {active && <motion.span layoutId="gm-mobile-dot" className="w-1 h-1 rounded-full bg-gm-accent" />}
      </span>
    </Link>
  );
}

export default function MobileNavigation() {
  const pathname = usePathname() || '';
  const { currentUser, unreadNotificationCount, isAuthenticated, isAuthLoading } = useApp();

  // Hide mobile bottom navigation for unauthenticated visitors scanning a profile QR code
  if (!isAuthLoading && !isAuthenticated) {
    return null;
  }

  const isHome = pathname === '/home';
  const isExplore = pathname.startsWith('/explore') || pathname.startsWith('/discover');
  const isNotifications = pathname.startsWith('/notifications');
  const isProfile = pathname.startsWith('/profile') || pathname.startsWith('/passport');

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 px-3 pb-[calc(0.6rem+env(safe-area-inset-bottom,0px))] pointer-events-none"
      data-testid="mobile-navigation"
    >
      <div className="pointer-events-auto glass-dock rounded-[28px] flex items-center max-w-md mx-auto px-2">
        <Tab href="/home" active={isHome} label="Home">
          <Home className="w-[22px] h-[22px]" strokeWidth={isHome ? 2.3 : 1.8} />
        </Tab>

        <Tab href="/explore" active={isExplore} label="Explore">
          <Search className="w-[22px] h-[22px]" strokeWidth={isExplore ? 2.4 : 1.8} />
        </Tab>

        <Link
          href="/updates/new"
          className="flex-1 flex items-center justify-center focus:outline-none"
          aria-label="Create New Post"
          data-testid="mobile-nav-create-post"
        >
          <motion.span
            whileTap={{ scale: 0.9, rotate: 90 }}
            className="w-12 h-12 rounded-full bg-gm-accent text-white flex items-center justify-center shadow-[0_10px_24px_-8px_rgb(var(--gm-accent-rgb)/0.7)]"
          >
            <Plus className="w-6 h-6 stroke-[2.6]" />
          </motion.span>
        </Link>

        <Tab href="/notifications" active={isNotifications} label="Notifications">
          <span className="relative">
            <Bell className="w-[22px] h-[22px]" strokeWidth={isNotifications ? 2.3 : 1.8} />
            {unreadNotificationCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-gm-accent ring-2 ring-gm-surface" />
            )}
          </span>
        </Tab>

        <Tab href={`/profile/${currentUser.username}`} active={isProfile} label="Your Profile">
          <span className={`rounded-full p-[2px] transition-colors ${isProfile ? 'bg-gm-accent' : 'bg-transparent'}`}>
            {currentUser.avatarImage ? (
              <img
                src={currentUser.avatarImage}
                alt={currentUser.name}
                className="w-6 h-6 rounded-full object-cover ring-2 ring-gm-surface"
              />
            ) : (
              <span className="w-6 h-6 rounded-full bg-gm-accent-soft text-gm-accent-deep font-bold text-[10px] flex items-center justify-center ring-2 ring-gm-surface">
                {currentUser.avatar}
              </span>
            )}
          </span>
        </Tab>
      </div>
    </nav>
  );
}
