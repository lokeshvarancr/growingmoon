'use client';
import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import AppShell from '@/components/shared/AppShell';
import PostComposerModal from '@/components/feed/PostComposerModal';
import ConnectionsModal from '@/components/feed/ConnectionsModal';
import JourneyPostCard from '@/components/feed/JourneyPostCard';
import EmptyState from '@/components/EmptyState';
import { useApp } from '@/lib/state/AppContext';
import {
  Compass,
  ArrowRight,
  Plus,
  Rocket,
  Music,
  Bookmark,
  Users,
  SquarePen,
  Send,
} from 'lucide-react';

type FeedTab = 'for-you' | 'all' | 'building' | 'learning' | 'creativity' | 'career' | 'lifestyle' | 'connections' | 'saved';

const HOME_CATEGORIES: { id: FeedTab; label: string }[] = [
  { id: 'for-you', label: 'For you' },
  { id: 'all', label: 'All' },
  { id: 'building', label: 'Building' },
  { id: 'learning', label: 'Learning' },
  { id: 'creativity', label: 'Creativity' },
  { id: 'career', label: 'Career' },
  { id: 'lifestyle', label: 'Lifestyle' },
];

type DiscoveringPerson = {
  username: string;
  name: string;
  initials: string;
  avatarImage?: string;
  avatarColor: string;
  badge: string;
  subtitle: string;
};

const FALLBACK_DISCOVERING_PEOPLE: DiscoveringPerson[] = [
  {
    username: 'rahul-v',
    name: 'Rahul Varma',
    initials: 'RV',
    avatarColor: 'bg-[#FEE8D6] text-[#B04A15]',
    badge: 'Building MVP',
    subtitle: 'Get 100 beta testers using my app daily',
  },
  {
    username: 'neha-k',
    name: 'Neha Krishnan',
    initials: 'NK',
    avatarColor: 'bg-[#ECE9FE] text-[#5546D6]',
    badge: 'Learning AI',
    subtitle: 'Build an AI copilot for student productivity',
  },
  {
    username: 'ananya-d',
    name: 'Ananya Das',
    initials: 'AD',
    avatarColor: 'bg-[#E5EEFF] text-[#1D58B5]',
    badge: 'Career Switch',
    subtitle: 'Transitioning from operations to product',
  },
];

export default function HomePage() {
  const { updates, connections, currentUser } = useApp();
  const [activeCategory, setActiveCategory] = useState<FeedTab>('for-you');
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);
  const [isConnectionsModalOpen, setIsConnectionsModalOpen] = useState(false);

  const connectedCount = Object.values(connections).filter((s) => s === 'connected').length;

  // Post Composer Modal state
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [composerInitialType, setComposerInitialType] = useState<
    'text' | 'photo' | 'video' | 'milestone' | 'type' | 'journey'
  >('text');

  const handleOpenComposer = (
    type: 'text' | 'photo' | 'video' | 'milestone' | 'type' | 'journey' = 'text'
  ) => {
    setComposerInitialType(type);
    setIsComposerOpen(true);
  };

  // Filter updates based on category
  const filteredUpdates = updates.filter((u) => {
    if (activeCategory === 'saved') {
      return (u.saves || []).includes(currentUser.id);
    }
    if (activeCategory === 'for-you' || activeCategory === 'all') return true;
    if (activeCategory === 'connections') {
      return connections[u.authorId] === 'connected' || u.authorId === currentUser.id;
    }
    const catLower = (u.category || '').toLowerCase();
    const tagLower = (u.journeyTag || '').toLowerCase();
    const contentLower = (u.content || '').toLowerCase();
    const target = activeCategory.toLowerCase();
    return catLower.includes(target) || tagLower.includes(target) || contentLower.includes(target);
  });

  // Dynamically calculate user's journeys and milestone counts from updates
  const userJourneys = useMemo(() => {
    const myUpdates = updates.filter(
      (u) => u.authorId === currentUser.id || u.author?.username === currentUser.username
    );

    const journeyMap = new Map<string, number>();
    myUpdates.forEach((u) => {
      const tag = u.journeyTag || u.category || 'General Journey';
      journeyMap.set(tag, (journeyMap.get(tag) || 0) + 1);
    });

    if (journeyMap.size === 0) {
      return [
        { title: 'Building Growing Moon', count: 12, icon: Rocket },
        { title: 'Learning Guitar', count: 8, icon: Music },
      ];
    }

    return Array.from(journeyMap.entries()).map(([title, count], idx) => ({
      title,
      count,
      icon: idx % 2 === 0 ? Rocket : Music,
    }));
  }, [updates, currentUser.id, currentUser.username]);

  // Dynamically extract active community members from live updates
  const discoveringPeople = useMemo<DiscoveringPerson[]>(() => {
    const map = new Map<string, DiscoveringPerson>();
    const palette = [
      'bg-[#FEE8D6] text-[#B04A15]',
      'bg-[#ECE9FE] text-[#5546D6]',
      'bg-[#E5EEFF] text-[#1D58B5]',
      'bg-[#E8FAF0] text-[#0E9F6E]',
    ];

    let colorIdx = 0;
    for (const u of updates) {
      if (
        u.author &&
        u.author.username &&
        u.author.username !== currentUser.username &&
        !map.has(u.author.username)
      ) {
        map.set(u.author.username, {
          username: u.author.username,
          name: u.author.name,
          initials: u.author.avatar || u.author.name.slice(0, 2).toUpperCase(),
          avatarImage: u.author.avatarImage,
          avatarColor: u.author.avatarColor || palette[colorIdx % palette.length],
          badge:
            u.journeyTag ||
            (u.category ? u.category.charAt(0).toUpperCase() + u.category.slice(1) : 'Building'),
          subtitle:
            u.headline ||
            (u.content ? u.content.slice(0, 48) + (u.content.length > 48 ? '...' : '') : 'Sharing journey milestones'),
        });
        colorIdx++;
      }
      if (map.size >= 3) break;
    }

    const liveList = Array.from(map.values());
    if (liveList.length >= 3) {
      return liveList.slice(0, 3);
    }

    // Top up with curated fallback entries if DB has fewer than 3 community members
    const combined = [...liveList];
    for (const fallback of FALLBACK_DISCOVERING_PEOPLE) {
      if (combined.length >= 3) break;
      if (!combined.some((p) => p.username === fallback.username)) {
        combined.push(fallback);
      }
    }
    return combined;
  }, [updates, currentUser.username]);

  // Left sidebar (Matches uploaded mockup media_1793815841557_9cc185f4.png):
  // 1. Profile card with You (Demo), Bengaluru, right arrow button, Saved & Connections
  // 2. "Your Journeys" card with stepper rail (Building Growing Moon 12 updates, Learning Guitar 8 updates) & Create a Journey button
  const leftSidebar = (
    <div className="space-y-4 pt-0.5">
      {/* ── 1. Profile Card with Saved & Connections ─────────────────── */}
      <div className="bg-white rounded-[24px] p-4 sm:p-5 border border-black/[0.04] shadow-xs">
        {/* Profile Info Row */}
        <div className="flex items-center justify-between gap-3">
          <Link
            href={`/profile/${currentUser.username}`}
            className="flex items-center gap-3 min-w-0 flex-1 group"
          >
            {currentUser.avatarImage ? (
              <img
                src={currentUser.avatarImage}
                alt={currentUser.name}
                className="w-11 h-11 rounded-full object-cover ring-1 ring-black/[0.06] flex-shrink-0 group-hover:scale-105 transition-transform"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-[#EAE8E4] flex items-center justify-center font-bold text-xs text-[#141724] ring-1 ring-black/[0.04] flex-shrink-0 group-hover:scale-105 transition-transform">
                YD
              </div>
            )}
            <div className="min-w-0 flex-1">
              <span className="font-bold text-sm text-[#141724] group-hover:text-[#6258DB] transition-colors block truncate">
                {currentUser.name || 'You (Demo)'}
              </span>
              <p className="text-xs text-gray-400 font-normal truncate mt-0.5">
                {currentUser.location || 'Bengaluru, India'}
              </p>
            </div>
          </Link>

          {/* Right Arrow Circle Button */}
          <Link
            href={`/profile/${currentUser.username}`}
            className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 transition-colors flex-shrink-0 active:scale-95"
            title="View Profile"
          >
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.2]" />
          </Link>
        </div>

        {/* Saved & Connections Navigation Links */}
        <div className="mt-4 pt-3.5 border-t border-gray-100/90 space-y-2.5">
          <button
            type="button"
            onClick={() => setActiveCategory(activeCategory === 'saved' ? 'for-you' : 'saved')}
            className={`w-full flex items-center justify-between text-xs font-semibold transition-colors py-1 group cursor-pointer ${
              activeCategory === 'saved' ? 'text-[#6258DB]' : 'text-[#141724] hover:text-[#6258DB]'
            }`}
          >
            <div className="flex items-center gap-3">
              <Bookmark
                className={`w-4 h-4 transition-colors ${
                  activeCategory === 'saved'
                    ? 'text-[#6258DB] fill-[#6258DB]'
                    : 'text-gray-700 group-hover:text-[#6258DB]'
                }`}
                strokeWidth={2}
              />
              <span>Saved Snippets</span>
            </div>
            <span
              className={`text-[10.5px] px-2 py-0.5 rounded-full font-bold transition-colors ${
                activeCategory === 'saved'
                  ? 'bg-[#6258DB] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 group-hover:bg-[#6258DB]/10 group-hover:text-[#6258DB]'
              }`}
            >
              {updates.filter((u) => (u.saves || []).includes(currentUser.id)).length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setIsConnectionsModalOpen(true)}
            className="w-full flex items-center justify-between text-xs font-semibold text-[#141724] hover:text-[#6258DB] transition-colors py-1 group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Users className="w-4 h-4 text-gray-700 group-hover:text-[#6258DB] transition-colors" strokeWidth={2} />
              <span>Connections</span>
            </div>
            <span className="text-[11px] font-bold text-gray-500 group-hover:text-[#6258DB] bg-gray-100 group-hover:bg-[#6258DB]/10 px-2 py-0.5 rounded-full transition-colors">
              {connectedCount}
            </span>
          </button>
        </div>
      </div>

      {/* ── 2. Your Journeys Card with Stepper Line & Create Button ──── */}
      <div className="bg-white rounded-[24px] p-4.5 sm:p-5 border border-black/[0.04] shadow-xs">
        <h4 className="text-sm font-bold text-[#141724] mb-4">
          Your Journeys
        </h4>

        {/* Stepper with connecting rail */}
        <div className="relative pl-0.5">
          {/* Vertical Connecting Rail Line */}
          <div className="absolute left-[7px] top-4 bottom-5 w-[1.5px] bg-gray-200" />

          <div className="space-y-4">
            {userJourneys.map((j, idx) => {
              const Icon = j.icon;
              return (
                <Link
                  key={j.title + idx}
                  href={`/passport/${currentUser.username}`}
                  className="flex items-center gap-3 group relative cursor-pointer"
                >
                  {/* Hollow node circle */}
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-400 bg-white z-10 flex-shrink-0" />
                  {/* Icon in light purple circle */}
                  <div className="w-8 h-8 rounded-full bg-[#EEEDFE] flex items-center justify-center text-[#6258DB] flex-shrink-0 group-hover:scale-105 transition-transform">
                    <Icon className="w-4 h-4 stroke-[2]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-bold text-[#141724] group-hover:text-[#6258DB] block truncate transition-colors">
                      {j.title}
                    </span>
                    <span className="text-[11px] text-gray-400 block truncate font-normal">
                      {j.count} update{j.count !== 1 ? 's' : ''}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Create a Journey Full-Width Pill Button */}
        <button
          type="button"
          onClick={() => handleOpenComposer('journey')}
          className="mt-5 w-full py-2.5 rounded-full bg-[#6258DB]/10 hover:bg-[#6258DB]/15 text-[#6258DB] font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-98 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Create a Journey</span>
        </button>
      </div>
    </div>
  );

  // Right sidebar (Matches uploaded mockup media_1793815841557_9cc185f4.png):
  // 1. "People on journeys worth discovering" with Rahul Varma, Neha Krishnan, Ananya Das
  // 2. "Keep your Passport fresh" card with dual 3D tilted passport cards illustration
  const rightSidebar = (
    <div className="space-y-4 pt-0.5">
      {/* ── 1. People on Journeys Worth Discovering Card ───────── */}
      <div className="bg-white rounded-[24px] p-4.5 sm:p-5 border border-black/[0.04] shadow-xs">
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-sm font-bold text-[#141724]">
            People on journeys worth discovering
          </h3>
          <Link
            href="/discover"
            className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 transition-colors flex-shrink-0"
            title="Discover more people"
          >
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.2]" />
          </Link>
        </div>

        <div className="space-y-3.5">
          {discoveringPeople.map((person, idx) => (
            <Link
              key={person.username + idx}
              href={`/profile/${person.username}`}
              className="flex items-start gap-2.5 group cursor-pointer"
            >
              {person.avatarImage ? (
                <img
                  src={person.avatarImage}
                  alt={person.name}
                  className="w-9 h-9 rounded-full object-cover flex-shrink-0 ring-1 ring-black/[0.04]"
                />
              ) : (
                <div
                  className={`w-9 h-9 rounded-full ${person.avatarColor} font-black text-xs flex items-center justify-center flex-shrink-0 ring-1 ring-black/[0.04]`}
                >
                  {person.initials}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-bold text-[#141724] group-hover:text-[#6258DB] transition-colors truncate">
                    {person.name}
                  </span>
                  <span className="text-[9.5px] font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full truncate max-w-[120px]">
                    {person.badge}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 truncate mt-0.5 font-normal">
                  {person.subtitle}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── 2. Keep Your Passport Fresh Card ───────────────────── */}
      <Link
        href={`/passport/${currentUser.username}`}
        className="block bg-white rounded-[24px] p-4.5 sm:p-5 border border-black/[0.04] shadow-xs hover:shadow-md transition-all group overflow-hidden relative"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-xs sm:text-[13.5px] font-bold text-[#141724] group-hover:text-[#6258DB] transition-colors leading-tight">
              Keep your Passport fresh
            </h3>
            <p className="text-[11px] text-gray-400 leading-snug mt-1.5 font-normal">
              Document your setbacks and breakthroughs so others can follow your real story.
            </p>
          </div>

          {/* 3D Tilted Dual-Card Passport Illustration with Crescent Moon Logo */}
          <div className="relative w-16 h-16 sm:w-18 sm:h-18 flex-shrink-0">
            {/* Back tilted card */}
            <div className="absolute top-0.5 right-2.5 w-11 h-14 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200/90 border border-gray-300/70 shadow-sm transform -rotate-12 group-hover:-rotate-16 transition-transform" />
            {/* Front card with Growing Moon logo */}
            <div className="absolute top-1.5 right-0.5 w-11 h-14 rounded-lg bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow-md transform rotate-6 group-hover:rotate-2 transition-transform flex flex-col items-center justify-center p-1">
              {/* Crescent logo watermark */}
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-slate-700 to-indigo-950 flex items-center justify-center shadow-2xs">
                <div className="w-1.5 h-1.5 rounded-full bg-white/90 translate-x-[1px]" />
              </div>
              <div className="w-5 h-1 bg-gray-200 rounded-full mt-2" />
              <div className="w-3.5 h-0.5 bg-gray-200 rounded-full mt-1" />
            </div>
          </div>
        </div>
      </Link>
    </div>
  );

  return (
    <AppShell leftSidebar={leftSidebar} rightSidebar={rightSidebar}>
      <div className="w-full">
        {/* ── 1. Category Filter Pills Row ────────────────────────── */}
        <div className="flex items-center gap-2 mb-3.5 sm:mb-4 overflow-x-auto scrollbar-none pb-0.5 -mx-1 px-1">
          {HOME_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`whitespace-nowrap px-4 sm:px-5 py-2 rounded-full text-xs transition-all active:scale-95 cursor-pointer select-none ${
                  isActive
                    ? 'bg-[#141724] text-white font-bold shadow-xs'
                    : 'text-gray-700 hover:text-black font-medium hover:bg-gray-100/70'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* ── 2. Onboarding / Welcome Banner ───────────────────────── */}
        {!isBannerDismissed && (
          <div className="bg-gradient-to-br from-white via-[#FAF9FE] to-[#F2EDFD] rounded-[28px] sm:rounded-[30px] p-5 sm:p-6 border border-black/[0.04] shadow-xs relative overflow-hidden mb-3.5 sm:mb-4 select-none">
            {/* Background mountain / lavender wave graphics and crescent moon watermark */}
            <div className="absolute top-4 sm:top-5 right-5 sm:right-6 opacity-40 pointer-events-none">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" className="text-[#8B5CF6]/50">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            </div>
            <div className="absolute right-0 bottom-0 w-48 h-24 bg-gradient-to-t from-[#E9E1FE]/80 via-[#F3EDFE]/40 to-transparent rounded-tl-full pointer-events-none" />

            <div className="relative z-10">
              <p className="text-xs font-semibold text-gray-500">New here?</p>
              <h2 className="text-xl sm:text-[22px] font-black text-[#141724] tracking-tight leading-snug mt-1">
                Every journey starts somewhere.
              </h2>
              <p className="text-xs sm:text-[13px] text-gray-600 leading-relaxed mt-1.5 max-w-md">
                A place to document what you&apos;re building, learning and exploring — and discover others on their journeys.
              </p>

              <div className="mt-4 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => handleOpenComposer('journey')}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#141724] hover:bg-black text-white text-xs font-bold shadow-sm transition-all active:scale-95 cursor-pointer"
                >
                  <span>Start your journey</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2.2]" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsBannerDismissed(true)}
                  className="text-xs font-semibold text-gray-500 hover:text-gray-700 cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── 3. Quick Share / Update Input Box (Matches screenshot) ─ */}
        <div
          onClick={() => handleOpenComposer('text')}
          className="bg-white rounded-full border border-purple-200/90 shadow-2xs px-4 py-3 sm:py-3.5 mb-3.5 sm:mb-4 flex items-center justify-between gap-3 cursor-pointer hover:border-[#6258DB] transition-all group"
        >
          {/* Left Purple Edit Icon */}
          <div className="w-8 h-8 rounded-xl bg-[#6258DB]/10 text-[#6258DB] flex items-center justify-center flex-shrink-0 group-hover:bg-[#6258DB]/20 transition-colors">
            <SquarePen className="w-4 h-4 text-[#6258DB] stroke-[2.2]" />
          </div>

          {/* Placeholder text */}
          <span className="text-xs sm:text-[13px] text-gray-500 font-medium flex-1 truncate">
            What&apos;s a recent progress in your journey?
          </span>

          {/* Right Purple Send Paperplane Icon */}
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-[#6258DB] flex-shrink-0 group-hover:translate-x-0.5 transition-transform">
            <Send className="w-4 h-4 text-[#6258DB] stroke-[2.2]" />
          </div>
        </div>

        {/* ── Saved Snippets Active Filter Banner ─────────────── */}
        {activeCategory === 'saved' && (
          <div className="bg-[#F5F2FF] border border-[#E4DCFD] rounded-[16px] p-3.5 flex items-center justify-between text-xs mb-3.5">
            <div className="flex items-center gap-2.5 text-[#6258DB] font-bold">
              <Bookmark className="w-4 h-4 fill-current" />
              <span>Showing your Saved Snippets ({filteredUpdates.length})</span>
            </div>
            <button
              type="button"
              onClick={() => setActiveCategory('for-you')}
              className="text-xs text-[#6258DB] hover:underline font-semibold cursor-pointer"
            >
              Back to all posts
            </button>
          </div>
        )}

        {/* ── 4. Movement Feed Stream ────────────────────────────── */}
        {filteredUpdates.length > 0 ? (
          <div className="space-y-2 sm:space-y-2.5">
            {filteredUpdates.map((update) => (
              <JourneyPostCard key={update.id} update={update} />
            ))}
          </div>
        ) : activeCategory === 'saved' ? (
          <div className="bg-white rounded-[18px] p-8 text-center border border-black/[0.06] shadow-xs">
            <Bookmark className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <h3 className="font-extrabold text-[#141724] text-sm">No saved snippets yet</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              Click the Save button on any journey card in your feed to bookmark valuable journey moments here.
            </p>
          </div>
        ) : (
          <EmptyState
            title="No moments in this view"
            description="Follow people ahead of you to track their real-time progression."
            actionLabel="Discover People"
            actionHref="/discover"
          />
        )}
      </div>

      {/* ── LinkedIn-Style Rich Post Composer Modal ─────────── */}
      <PostComposerModal
        isOpen={isComposerOpen}
        onClose={() => setIsComposerOpen(false)}
        initialType={composerInitialType}
      />

      {/* ── Connections Network Modal ──────────────────────── */}
      <ConnectionsModal
        isOpen={isConnectionsModalOpen}
        onClose={() => setIsConnectionsModalOpen(false)}
      />
    </AppShell>
  );
}
