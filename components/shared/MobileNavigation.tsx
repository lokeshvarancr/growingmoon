'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/lib/state/AppContext';
import { Home, Search, Plus, Bell } from 'lucide-react';

export default function MobileNavigation() {
  const pathname = usePathname() || '';
  const { currentUser, unreadNotificationCount } = useApp();

  const isHome = pathname === '/home';
  const isExplore = pathname.startsWith('/explore') || pathname.startsWith('/discover');
  const isNotifications = pathname.startsWith('/notifications');
  const isProfile = pathname.startsWith('/profile') || pathname.startsWith('/passport');

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-black/[0.05] px-4 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] shadow-[0_-4px_24px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between max-w-sm mx-auto">
        {/* 1. Home */}
        <Link
          href="/home"
          className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${
            isHome ? 'text-[#141724]' : 'text-gray-400 hover:text-gray-700'
          }`}
          aria-label="Home"
        >
          <Home className="w-5 h-5" strokeWidth={isHome ? 2.4 : 1.9} />
          {isHome && <span className="w-3.5 h-[2px] rounded-full bg-[#6258DB] mt-1" />}
        </Link>

        {/* 2. Explore */}
        <Link
          href="/explore"
          className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${
            isExplore ? 'text-[#6258DB]' : 'text-gray-400 hover:text-gray-700'
          }`}
          aria-label="Explore"
        >
          <Search className="w-5 h-5" strokeWidth={isExplore ? 2.5 : 1.9} />
          {isExplore && <span className="w-3.5 h-[2px] rounded-full bg-[#6258DB] mt-1" />}
        </Link>

        {/* 3. Center + Button (Squircle shape from mockup) */}
        <Link
          href="/updates/new"
          className="flex items-center justify-center -mt-3.5 focus:outline-none"
          aria-label="Create New Post"
        >
          <div className="w-12 h-12 rounded-[18px] bg-[#141724] text-white flex items-center justify-center shadow-lg hover:bg-black active:scale-95 transition-all ring-4 ring-white">
            <Plus className="w-6 h-6 stroke-[2.6]" />
          </div>
        </Link>

        {/* 4. Notifications */}
        <Link
          href="/notifications"
          className={`relative flex flex-col items-center justify-center p-2 rounded-xl transition-all ${
            isNotifications ? 'text-[#141724]' : 'text-gray-400 hover:text-gray-700'
          }`}
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" strokeWidth={isNotifications ? 2.4 : 1.9} />
          {unreadNotificationCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#E93D5A] ring-2 ring-white" />
          )}
          {isNotifications && <span className="w-3.5 h-[2px] rounded-full bg-[#6258DB] mt-1" />}
        </Link>

        {/* 5. Profile User Avatar */}
        <Link
          href={`/profile/${currentUser.username}`}
          className={`flex flex-col items-center justify-center p-1 rounded-full transition-all ${
            isProfile ? 'ring-2 ring-[#6258DB] ring-offset-2' : ''
          }`}
          aria-label="Your Profile"
        >
          {currentUser.avatarImage ? (
            <img
              src={currentUser.avatarImage}
              alt={currentUser.name}
              className="w-6 h-6 rounded-full object-cover ring-1 ring-black/10 shadow-2xs"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-[#EEEDFE] text-[#6258DB] font-extrabold text-[10px] flex items-center justify-center ring-1 ring-black/10">
              {currentUser.avatar}
            </div>
          )}
        </Link>
      </div>
    </nav>
  );
}
