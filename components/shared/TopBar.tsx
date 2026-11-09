'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useApp } from '@/lib/state/AppContext';
import { Search, Bell, MessageSquare, Compass, Home } from 'lucide-react';

export default function TopBar() {
  const router = useRouter();
  const pathname = usePathname() || '';
  const { currentUser, unreadNotificationCount, conversations } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const totalUnreadMessages = conversations.reduce((acc, c) => acc + c.unreadCount, 0);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/discover?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const isHome = pathname === '/home' || pathname === '/';
  const isExplore = pathname.startsWith('/discover') || pathname.startsWith('/explore');
  const isMessages = pathname.startsWith('/messages');
  const isNotifications = pathname.startsWith('/notifications');

  return (
    <header className="sticky top-0 z-30 w-full bg-[#FAF9F6]/95 backdrop-blur-md border-b border-black/[0.04] px-4 sm:px-6 lg:px-8 py-3 transition-all">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-4 sm:gap-6">
        {/* Brand / Logo */}
        <Link href="/home" className="flex items-center gap-2.5 flex-shrink-0 group">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-slate-800 via-slate-900 to-indigo-950 flex items-center justify-center shadow-sm relative overflow-hidden group-hover:scale-105 transition-transform">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/20 via-transparent to-transparent pointer-events-none" />
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-white">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          </div>
          <span className="font-extrabold text-base sm:text-[17px] tracking-tight text-[#141724]">
            Growing Moon
          </span>
        </Link>

        {/* Search bar (Responsive: Tablet & Desktop) */}
        <form onSubmit={handleSearch} className="hidden sm:block flex-1 max-w-xs md:max-w-md lg:max-w-xl relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search people, journeys, interests..."
            className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 bg-white border border-gray-200/90 rounded-full text-xs sm:text-[13px] text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#6258DB] focus:ring-2 focus:ring-[#6258DB]/15 transition-all shadow-2xs"
          />
        </form>

        {/* Top-Right: Home, Explore, Messages, Notifications, User Profile (Matching exact mockup) */}
        <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 flex-shrink-0">
          {/* Mobile Search Icon Button */}
          <Link
            href="/discover"
            className="sm:hidden p-2 text-gray-700 hover:text-[#141724] rounded-full hover:bg-black/[0.03] transition-all active:scale-95"
            title="Search"
            aria-label="Search"
          >
            <Search className="w-5 h-5 text-gray-700" strokeWidth={2} />
          </Link>

          {/* Home Icon with active purple underline */}
          <Link
            href="/home"
            className={`hidden md:flex flex-col items-center justify-center p-2 rounded-full relative transition-all active:scale-95 ${
              isHome ? 'text-[#6258DB]' : 'text-gray-700 hover:text-[#141724]'
            }`}
            title="Home Feed"
          >
            <Home className="w-5 h-5 stroke-[2]" />
            {isHome && (
              <span className="absolute bottom-0 inset-x-2 h-[2.5px] bg-[#6258DB] rounded-full" />
            )}
          </Link>

          {/* Explore / Compass Icon */}
          <Link
            href="/discover"
            className={`hidden md:flex flex-col items-center justify-center p-2 rounded-full relative transition-all active:scale-95 ${
              isExplore ? 'text-[#6258DB]' : 'text-gray-700 hover:text-[#141724]'
            }`}
            title="Explore Journeys"
          >
            <Compass className="w-5 h-5 stroke-[2]" />
            {isExplore && (
              <span className="absolute bottom-0 inset-x-2 h-[2.5px] bg-[#6258DB] rounded-full" />
            )}
          </Link>

          {/* Direct Messages Button */}
          <Link
            href="/messages"
            className={`relative p-2 rounded-full transition-all active:scale-95 ${
              isMessages ? 'text-[#6258DB]' : 'text-gray-700 hover:text-[#141724]'
            }`}
            title="Direct Messages"
            aria-label="Messages"
          >
            <MessageSquare className="w-5 h-5 stroke-[2]" />
            {totalUnreadMessages > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#6258DB] ring-2 ring-[#FAF9F6]" />
            )}
          </Link>

          {/* Notifications Button with Red Dot */}
          <Link
            href="/notifications"
            className={`hidden sm:flex relative p-2 rounded-full transition-all active:scale-95 ${
              isNotifications ? 'text-[#6258DB]' : 'text-gray-700 hover:text-[#141724]'
            }`}
            title="Notifications"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 stroke-[2]" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#E93D5A] ring-2 ring-[#FAF9F6]" />
          </Link>

          {/* User Profile Avatar */}
          <Link
            href={`/profile/${currentUser.username}`}
            className="hidden sm:block flex-shrink-0 group/avatar active:scale-95 transition-transform"
            title="My Profile"
          >
            {currentUser.avatarImage ? (
              <img
                src={currentUser.avatarImage}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-white shadow-xs group-hover/avatar:ring-[#6258DB]/40 transition-all"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gm-lavender/20 text-gm-indigo flex items-center justify-center font-bold text-xs ring-2 ring-white shadow-xs">
                {currentUser.avatar}
              </div>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
