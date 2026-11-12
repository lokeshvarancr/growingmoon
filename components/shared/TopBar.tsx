'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '@/lib/state/AppContext';
import BrandMark from './BrandMark';
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

type NavItemProps = {
  href: string;
  active: boolean;
  title: string;
  label: string;
  icon: React.ElementType;
  className?: string;
  ariaLabel?: string;
  dot?: React.ReactNode;
};

function NavItem({ href, active, title, label, icon: Icon, className = '', ariaLabel, dot }: NavItemProps) {
  return (
    <Link
      href={href}
      title={title}
      aria-label={ariaLabel}
      className={`relative items-center gap-2 h-10 px-3 lg:px-3.5 rounded-full text-[13px] font-medium transition-colors ${className} ${
        active ? 'text-gm-paper' : 'text-gray-600 hover:text-gm-ink'
      }`}
    >
      {active && (
        <motion.span
          layoutId="gm-nav-pill"
          className="absolute inset-0 rounded-full bg-gm-accent"
          transition={{ type: 'spring', stiffness: 420, damping: 34 }}
        />
      )}
      <span className="relative flex items-center gap-2">
        <span className="relative">
          <Icon className="w-[18px] h-[18px]" strokeWidth={active ? 2.2 : 1.8} />
          {dot}
        </span>
        <span className="hidden lg:inline">{label}</span>
      </span>
    </Link>
  );
}

function MenuLink({ href, icon: Icon, label, onClick }: { href: string; icon: React.ElementType; label: string; onClick: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-gray-700 hover:text-gm-ink hover:bg-gray-100 transition-colors"
    >
      <Icon className="w-4 h-4 text-gray-400" />
      <span>{label}</span>
    </Link>
  );
}

function Avatar({ user, size }: { user: { avatarImage?: string; name: string; avatar?: string }; size: string }) {
  return user.avatarImage ? (
    <img src={user.avatarImage} alt={user.name} className={`${size} rounded-full object-cover`} />
  ) : (
    <div className={`${size} rounded-full bg-gm-accent-soft text-gm-accent-deep font-bold text-xs flex items-center justify-center`}>
      {user.avatar || 'GM'}
    </div>
  );
}

export default function TopBar() {
  const router = useRouter();
  const pathname = usePathname() || '';
  const { currentUser, isAuthenticated, isAuthLoading, unreadNotificationCount, conversations, logout } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
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

  const shellClass = `transition-[padding] duration-500 ${scrolled ? 'pt-2 sm:pt-3' : 'pt-3 sm:pt-5'}`;
  const dockClass = `max-w-[1400px] mx-auto flex items-center justify-between gap-3 sm:gap-5 rounded-full pl-3 sm:pl-4 pr-2 py-2 transition-all duration-500 ${
    scrolled ? 'glass-dock' : 'bg-transparent border border-transparent'
  }`;

  // Scenario C: Visitor who is not logged in scans QR code or visits public profile
  if (!isAuthLoading && !isAuthenticated) {
    return (
      <header className={`sticky top-0 z-30 w-full px-3 sm:px-6 lg:px-8 ${shellClass}`} data-testid="topbar-guest">
        <div className={dockClass}>
          <Link href="/" className="flex-shrink-0" data-testid="topbar-logo">
            <BrandMark />
          </Link>
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <Link
              href={pathname ? `/login?redirect=${encodeURIComponent(pathname)}` : '/login'}
              className="px-4 h-10 inline-flex items-center rounded-full text-[13px] font-semibold text-gm-ink hover:bg-gm-ink/5 transition-colors"
              data-testid="topbar-login-link"
            >
              Log In
            </Link>
            <Link
              href={pathname ? `/register?redirect=${encodeURIComponent(pathname)}` : '/register'}
              className="px-5 h-10 inline-flex items-center rounded-full text-[13px] font-semibold bg-gm-ink hover:bg-gm-accent text-gm-paper transition-colors"
              data-testid="topbar-signup-link"
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
  const closeMenu = () => setIsProfileMenuOpen(false);

  return (
    <header className={`sticky top-0 z-30 w-full px-3 sm:px-6 lg:px-8 ${shellClass}`} data-testid="topbar">
      <div className={dockClass}>
        {/* Brand / Logo */}
        <Link href="/home" className="flex-shrink-0" data-testid="topbar-logo">
          <BrandMark />
        </Link>

        {/* Search bar (Responsive: Tablet & Desktop) */}
        <form onSubmit={handleSearch} className="hidden sm:block flex-1 max-w-xs md:max-w-md lg:max-w-lg relative group">
          <Search className="w-4 h-4 text-gray-400 group-focus-within:text-gm-accent absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search people, journeys, posts..."
            data-testid="topbar-search-input"
            className="w-full pl-11 pr-4 h-10 bg-gm-ink/[0.045] hover:bg-gm-ink/[0.06] focus:bg-gm-surface border border-transparent focus:border-gm-ink/10 rounded-full text-[13px] text-gray-800 focus:outline-none focus:shadow-[0_8px_30px_-12px_rgba(26,25,23,0.3)] transition-all"
          />
        </form>

        <nav className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
          {/* Mobile Search Icon Button */}
          <Link
            href="/search"
            className={`sm:hidden w-10 h-10 flex items-center justify-center rounded-full transition-colors ${
              isSearch ? 'text-gm-accent bg-gm-accent-soft' : 'text-gray-700'
            }`}
            title="Search"
            aria-label="Search"
            data-testid="topbar-mobile-search"
          >
            <Search className="w-5 h-5" strokeWidth={2} />
          </Link>

          <NavItem href="/home" active={isHome} title="Home Feed" label="Home" icon={Home} className="hidden md:flex" />
          <NavItem href="/discover" active={isExplore} title="Explore Journeys" label="Explore" icon={Compass} className="hidden md:flex" />
          <NavItem
            href="/messages"
            active={isMessages}
            title="Direct Messages"
            ariaLabel="Messages"
            label="Messages"
            icon={MessageSquare}
            className="flex"
            dot={totalUnreadMessages > 0 ? <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-gm-accent ring-2 ring-gm-paper" /> : null}
          />
          <NavItem
            href="/notifications"
            active={isNotifications}
            title="Notifications"
            ariaLabel="Notifications"
            label="Notifications"
            icon={Bell}
            className="hidden sm:flex"
            dot={<span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-gm-accent ring-2 ring-gm-paper" />}
          />

          {/* User Profile Avatar with Click Dropdown & Logout Option */}
          <div className="relative ml-1 sm:ml-2">
            <button
              type="button"
              onClick={() => setIsProfileMenuOpen((prev) => !prev)}
              className={`flex items-center gap-1.5 p-1 sm:pr-2.5 rounded-full transition-colors cursor-pointer select-none ${
                isProfileMenuOpen ? 'bg-gm-ink/[0.07]' : 'hover:bg-gm-ink/[0.05]'
              }`}
              title="Account Menu"
              aria-label="Account Menu"
              aria-expanded={isProfileMenuOpen}
              data-testid="topbar-account-menu-button"
            >
              <Avatar user={currentUser} size="w-8 h-8" />
              <ChevronDown className={`w-3.5 h-3.5 text-gray-500 hidden sm:block transition-transform duration-300 ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isProfileMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={closeMenu} />
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97, transition: { duration: 0.15 } }}
                    style={{ transformOrigin: 'top right' }}
                    className="absolute right-0 top-full mt-3 w-72 bg-gm-surface rounded-3xl shadow-modal border border-gm-ink/[0.06] p-2 z-50"
                    data-testid="topbar-account-menu"
                  >
                    {/* User Info Header */}
                    <div className="px-3 pt-3 pb-4 mb-1 flex items-center gap-3 border-b border-gm-ink/[0.06]">
                      <Avatar user={currentUser} size="w-11 h-11 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-display text-[17px] font-medium text-gm-ink truncate leading-tight">
                          {currentUser.name || 'Member'}
                        </p>
                        <p className="text-xs text-gray-500 truncate mt-0.5">@{currentUser.username || 'user'}</p>
                      </div>
                    </div>

                    <div className="py-1 space-y-0.5">
                      <MenuLink href={`/profile/${currentUser.username}`} icon={User} label="Your Profile" onClick={closeMenu} />
                      <MenuLink href="/activity" icon={Activity} label="My Activities" onClick={closeMenu} />
                      <MenuLink href="/settings" icon={Settings} label="Settings" onClick={closeMenu} />
                      <MenuLink href="/settings" icon={HelpCircle} label="Help & Support" onClick={closeMenu} />

                      {/* Switch Appearance: Light / Dark Mode */}
                      <div className="flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] font-medium text-gray-700 select-none">
                        <div className="flex items-center gap-3">
                          {isDarkMode ? <Moon className="w-4 h-4 text-gm-accent" /> : <Sun className="w-4 h-4 text-gm-accent" />}
                          <span>Switch Appearance</span>
                        </div>
                        <button
                          type="button"
                          onClick={toggleDarkMode}
                          className={`w-10 h-6 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                            isDarkMode ? 'bg-gm-accent' : 'bg-gray-200'
                          }`}
                          aria-label="Toggle theme"
                          data-testid="topbar-theme-toggle"
                        >
                          <motion.div layout className={`w-5 h-5 rounded-full bg-white shadow ${isDarkMode ? 'ml-auto' : ''}`} />
                        </button>
                      </div>
                    </div>

                    <div className="h-px bg-gm-ink/[0.06] my-1" />

                    <button
                      type="button"
                      onClick={() => {
                        closeMenu();
                        logout();
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer"
                      data-testid="topbar-logout-button"
                    >
                      <LogOut className="w-4 h-4 stroke-[2.2]" />
                      <span>Log Out</span>
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </nav>
      </div>
    </header>
  );
}
