'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useApp } from '@/lib/state/AppContext';
import {
  Search,
  Bell,
  MessageSquare,
  Compass,
  Home,
  User,
  Activity,
  Settings,
  HelpCircle,
  Moon,
  Sun,
  LogOut,
  ChevronDown,
} from 'lucide-react';

export default function TopBar() {
  const router = useRouter();
  const pathname = usePathname() || '';
  const { currentUser, isAuthenticated, isAuthLoading, unreadNotificationCount, conversations, logout } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDark =
        document.documentElement.classList.contains('dark') ||
        localStorage.getItem('gm_theme') === 'dark';
      setIsDarkMode(isDark);
      if (isDark) {
        document.documentElement.classList.add('dark');
      }
    }
  }, []);

  const toggleDarkMode = () => {
    const nextDark = !isDarkMode;
    setIsDarkMode(nextDark);
    if (typeof window !== 'undefined') {
      if (nextDark) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('gm_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('gm_theme', 'light');
      }
    }
  };

  // Scenario C: Visitor who is not logged in scans QR code or visits public profile
  if (!isAuthLoading && !isAuthenticated) {
    return (
      <header className="sticky top-0 z-30 w-full bg-[#FAF9F6]/95 backdrop-blur-md border-b border-black/[0.04] px-4 sm:px-6 lg:px-8 py-3 transition-all">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-4">
          {/* Simplified Navbar: Brand / Logo Only */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
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

          {/* Right Actions: Sign Up & Log In Only */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <Link
              href={pathname ? `/login?redirect=${encodeURIComponent(pathname)}` : '/login'}
              className="px-4 py-2 rounded-full text-xs font-bold text-[#141724] hover:bg-black/5 transition-all cursor-pointer"
            >
              Log In
            </Link>
            <Link
              href={pathname ? `/register?redirect=${encodeURIComponent(pathname)}` : '/register'}
              className="px-4.5 py-2 rounded-full text-xs font-bold bg-[#6258DB] hover:bg-[#5246D2] text-white shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>
    );
  }

  const totalUnreadMessages = conversations.reduce((acc, c) => acc + c.unreadCount, 0);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const isHome = pathname === '/home' || pathname === '/';
  const isExplore = pathname.startsWith('/discover') || pathname.startsWith('/explore');
  const isSearch = pathname.startsWith('/search');
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
            placeholder="Search people, journeys, posts..."
            className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 bg-white border border-gray-200/90 rounded-full text-xs sm:text-[13px] text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#6258DB] focus:ring-2 focus:ring-[#6258DB]/15 transition-all shadow-2xs"
          />
        </form>

        {/* Top-Right: Home, Explore, Messages, Notifications, User Profile (Matching exact mockup) */}
        <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 flex-shrink-0">
          {/* Mobile Search Icon Button */}
          <Link
            href="/search"
            className={`sm:hidden p-2 rounded-full hover:bg-black/[0.03] transition-all active:scale-95 ${
              isSearch ? 'text-[#6258DB]' : 'text-gray-700 hover:text-[#141724]'
            }`}
            title="Search"
            aria-label="Search"
          >
            <Search className="w-5 h-5" strokeWidth={2} />
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

          {/* User Profile Avatar with Click Dropdown & Logout Option */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsProfileMenuOpen((prev) => !prev)}
              className="flex items-center gap-1.5 p-0.5 rounded-full hover:ring-2 hover:ring-[#6258DB]/25 transition-all cursor-pointer select-none active:scale-95"
              title="Account Menu"
              aria-label="Account Menu"
            >
              {currentUser.avatarImage ? (
                <img
                  src={currentUser.avatarImage}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-white shadow-xs"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#ECE9FE] text-[#5546D6] font-extrabold text-xs flex items-center justify-center ring-2 ring-white shadow-xs">
                  {currentUser.avatar || 'GM'}
                </div>
              )}
              <ChevronDown className="w-3.5 h-3.5 text-gray-500 hidden sm:block" />
            </button>

            {/* Profile Dropdown Menu */}
            {isProfileMenuOpen && (
              <>
                {/* Backdrop to close when clicking outside */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsProfileMenuOpen(false)}
                />

                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-black/[0.06] p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  {/* User Info Header */}
                  <div className="px-3 py-2.5 border-b border-gray-100 flex items-center gap-3">
                    {currentUser.avatarImage ? (
                      <img
                        src={currentUser.avatarImage}
                        alt={currentUser.name}
                        className="w-10 h-10 rounded-full object-cover ring-1 ring-black/5 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#ECE9FE] text-[#5546D6] font-black text-xs flex items-center justify-center flex-shrink-0">
                        {currentUser.avatar || 'GM'}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-[#141724] truncate">
                        {currentUser.name || 'Member'}
                      </p>
                      <p className="text-[11px] text-gray-400 truncate">
                        @{currentUser.username || 'user'}
                      </p>
                    </div>
                  </div>

                  {/* Menu Options */}
                  <div className="py-1 space-y-0.5">
                    <Link
                      href={`/profile/${currentUser.username}`}
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-gray-700 hover:text-[#141724] hover:bg-gray-50 transition-colors"
                    >
                      <User className="w-4 h-4 text-gray-400" />
                      <span>Your Profile</span>
                    </Link>
                    <Link
                      href="/activity"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-gray-700 hover:text-[#141724] hover:bg-gray-50 transition-colors"
                    >
                      <Activity className="w-4 h-4 text-gray-400" />
                      <span>My Activities</span>
                    </Link>
                    <Link
                      href="/settings"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-gray-700 hover:text-[#141724] hover:bg-gray-50 transition-colors"
                    >
                      <Settings className="w-4 h-4 text-gray-400" />
                      <span>Settings</span>
                    </Link>
                    <Link
                      href="/settings"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-gray-700 hover:text-[#141724] hover:bg-gray-50 transition-colors"
                    >
                      <HelpCircle className="w-4 h-4 text-gray-400" />
                      <span>Help & Support</span>
                    </Link>

                    {/* Switch Appearance: Light / Dark Mode */}
                    <div className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors select-none">
                      <div className="flex items-center gap-2.5">
                        {isDarkMode ? (
                          <Moon className="w-4 h-4 text-[#6258DB]" />
                        ) : (
                          <Sun className="w-4 h-4 text-amber-500" />
                        )}
                        <span>Switch Appearance</span>
                      </div>
                      <button
                        type="button"
                        onClick={toggleDarkMode}
                        className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                          isDarkMode ? 'bg-[#6258DB]' : 'bg-gray-200'
                        }`}
                        aria-label="Toggle theme"
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white shadow-xs transform transition-transform ${
                            isDarkMode ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-gray-100 my-1" />

                  {/* Prominent Log Out Option */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 stroke-[2.2]" />
                    <span>Log Out</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
