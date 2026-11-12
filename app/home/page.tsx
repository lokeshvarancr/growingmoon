'use client';
import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import AppShell from '@/components/shared/AppShell';
import AuthGuard from '@/components/shared/AuthGuard';
import PostComposerModal from '@/components/feed/PostComposerModal';
import ConnectionsModal from '@/components/feed/ConnectionsModal';
import CreateJourneyModal, { CreatedJourneyData } from '@/components/journey/CreateJourneyModal';
import JourneyPostCard from '@/components/feed/JourneyPostCard';
import EmptyState from '@/components/EmptyState';
import AestheticLoader from '@/components/shared/AestheticLoader';
import { useApp } from '@/lib/state/AppContext';
import { passportsApi } from '@/lib/api/client';
import type { PassportResponse } from '@/lib/api/types';
import { supabase } from '@/lib/supabaseClient';
import type { MediaAttachment } from '@/types';
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
  LogOut,
  ChevronDown,
  X,
  Image as ImageIcon,
  Video,
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
    avatarColor: 'bg-gm-accent-soft text-gm-accent-deep',
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
  const { updates, connections, currentUser, logout, isLoadingFeed, addUpdate, addToast } = useApp();
  const [activeCategory, setActiveCategory] = useState<FeedTab>('for-you');
  const [isConnectionsModalOpen, setIsConnectionsModalOpen] = useState(false);
  const [dbPassports, setDbPassports] = useState<PassportResponse[]>([]);
  const [isLoadingJourneys, setIsLoadingJourneys] = useState<boolean>(true);

  // Compute live connected count
  const connectedCount = useMemo(() => {
    if (typeof currentUser.connectionsCount === 'number' && currentUser.connectionsCount > 0) {
      return currentUser.connectionsCount;
    }
    const uniqueConnectedKeys = new Set(
      Object.keys(connections).filter((k) => connections[k] === 'connected')
    );
    return uniqueConnectedKeys.size;
  }, [currentUser.connectionsCount, connections]);

  // Post Composer Modal state
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [composerInitialType, setComposerInitialType] = useState<
    'text' | 'photo' | 'video' | 'milestone' | 'type' | 'journey'
  >('text');

  // Dedicated Create Journey Modal state
  const [isCreateJourneyModalOpen, setIsCreateJourneyModalOpen] = useState(false);
  const [customJourneys, setCustomJourneys] = useState<CreatedJourneyData[]>([]);

  // Fetch real journeys from database
  useEffect(() => {
    let isMounted = true;
    passportsApi
      .getMyPassports()
      .then((list) => {
        if (isMounted && Array.isArray(list)) {
          setDbPassports(list);
        }
      })
      .catch((err) => {
        console.warn('Could not load user passports from backend:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingJourneys(false);
      });
    return () => {
      isMounted = false;
    };
  }, [currentUser.id]);

  // Inline Quick Composer state (Heading + Small Description)
  const [isInlineComposerOpen, setIsInlineComposerOpen] = useState(false);
  const [inlineHeading, setInlineHeading] = useState('');
  const [inlineContent, setInlineContent] = useState('');
  const [inlineJourney, setInlineJourney] = useState('');
  const [inlineType, setInlineType] = useState('Progress update');
  const [inlineVideoLink, setInlineVideoLink] = useState('');
  const [inlineIsVideoOpen, setInlineIsVideoOpen] = useState(false);
  const [inlineAttachments, setInlineAttachments] = useState<MediaAttachment[]>([]);
  const [isInlineSubmitting, setIsInlineSubmitting] = useState(false);
  const inlineFileInputRef = useRef<HTMLInputElement>(null);

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

  // Dynamically calculate user's journeys and milestone counts from db passports + updates
  const userJourneys = useMemo(() => {
    const myUpdates = updates.filter(
      (u) => u.authorId === currentUser.id || u.author?.username === currentUser.username
    );

    const journeyMap = new Map<string, number>();

    // 1. Add database passports first
    dbPassports.forEach((p) => {
      journeyMap.set(p.title, p.updates_count || 0);
    });

    // 2. Add local created journeys
    customJourneys.forEach((cj) => {
      if (!journeyMap.has(cj.title)) {
        journeyMap.set(cj.title, 0);
      }
    });

    // 3. Count matching updates
    myUpdates.forEach((u) => {
      const tag = u.journeyTag || u.category || 'General Journey';
      journeyMap.set(tag, (journeyMap.get(tag) || 0) + 1);
    });

    if (journeyMap.size === 0) {
      return [];
    }

    return Array.from(journeyMap.entries()).map(([title, count], idx) => ({
      title,
      count,
      icon: idx % 2 === 0 ? Rocket : Music,
    }));
  }, [updates, currentUser.id, currentUser.username, customJourneys, dbPassports]);

  // Saved updates filtered from feed
  const savedUpdates = useMemo(() => {
    return updates.filter(
      (u) => u.is_saved_by_me || (u.saves || []).includes(currentUser.id)
    );
  }, [updates, currentUser.id]);

  // Inline Quick-Composer Helpers
  const handleInlineImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newItems: MediaAttachment[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) {
        addToast('Only image files are allowed.', 'warning');
        continue;
      }
      const objectUrl = URL.createObjectURL(file);
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      newItems.push({
        id: Math.random().toString(36).slice(2),
        type: 'image',
        url: objectUrl,
        fileName: file.name,
        fileSize: `${sizeMb} MB`,
        alt: file.name,
      });
    }

    setInlineAttachments((prev) => [...prev, ...newItems]);
    if (newItems.length > 0) {
      addToast(`${newItems.length} image${newItems.length > 1 ? 's' : ''} added!`, 'info');
    }
    e.target.value = '';
  };

  const handleInlinePostSubmit = () => {
    const headingText = inlineHeading.trim();
    if (!headingText) {
      addToast('Please enter an update heading', 'warning');
      return;
    }

    if (inlineVideoLink.trim()) {
      const socialPattern = /(youtube\.com|youtu\.be|facebook\.com|fb\.watch|instagram\.com|discord\.(com|gg)|twitter\.com|x\.com|tiktok\.com|linkedin\.com)/i;
      if (socialPattern.test(inlineVideoLink)) {
        addToast(
          'Social media links are not permitted. Only Google Drive links are allowed for videos.',
          'danger'
        );
        return;
      }
      const googleDrivePattern = /^https?:\/\/(?:drive|docs)\.google\.com\//i;
      if (!googleDrivePattern.test(inlineVideoLink.trim())) {
        addToast('Please enter a valid Google Drive video link.', 'warning');
        return;
      }
    }

    setIsInlineSubmitting(true);

    const finalAttachments: MediaAttachment[] = [...inlineAttachments];
    if (inlineVideoLink.trim()) {
      finalAttachments.push({
        id: 'drive-' + Date.now(),
        type: 'video',
        url: inlineVideoLink.trim(),
        fileName: 'Google Drive Video',
        fileSize: 'Drive Link',
        alt: 'Google Drive Video Attachment',
      });
    }

    const defaultJourney = userJourneys[0]?.title || 'Building my SaaS product';
    const chosenJourney = inlineJourney || defaultJourney;
    const descText = inlineContent.trim();
    const fullContent = descText ? `${headingText}\n\n${descText}` : headingText;

    addUpdate({
      headline: headingText,
      journeyTag: chosenJourney,
      category: inlineType || 'Progress update',
      oneLineSummary: descText || headingText,
      content: fullContent,
      media: finalAttachments,
    });

    setIsInlineSubmitting(false);
    setInlineHeading('');
    setInlineContent('');
    setInlineVideoLink('');
    setInlineIsVideoOpen(false);
    setInlineAttachments([]);
    setIsInlineComposerOpen(false);
    addToast('Journey update posted to your feed and timeline!', 'success');
  };

  // Dynamic live registered users from Supabase DB
  const [liveCommunityUsers, setLiveCommunityUsers] = useState<DiscoveringPerson[]>([]);

  useEffect(() => {
    let isMounted = true;
    async function fetchLiveUsers() {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, username, name, avatar_initials, avatar_image, avatar_color, role_title, bio')
          .neq('username', currentUser.username || '')
          .order('created_at', { ascending: false })
          .limit(5);

        if (!error && data && data.length > 0 && isMounted) {
          const palette = [
            'bg-[#FEE8D6] text-[#B04A15]',
            'bg-gm-accent-soft text-gm-accent-deep',
            'bg-[#E5EEFF] text-[#1D58B5]',
            'bg-[#E8FAF0] text-[#0E9F6E]',
          ];

          const mapped: DiscoveringPerson[] = data.map((u, i) => ({
            username: u.username,
            name: u.name,
            initials: u.avatar_initials || u.name.slice(0, 2).toUpperCase(),
            avatarImage: u.avatar_image || undefined,
            avatarColor: u.avatar_color || palette[i % palette.length],
            badge: u.role_title || 'Building MVP',
            subtitle: u.bio || 'Exploring new frontiers and sharing milestones',
          }));
          setLiveCommunityUsers(mapped);
        }
      } catch {
        // Fallback gracefully to feed authors or curated list
      }
    }

    if (currentUser.id) {
      fetchLiveUsers();
    }
    return () => {
      isMounted = false;
    };
  }, [currentUser.username, currentUser.id]);

  // Dynamically extract active community members:
  // 1. Live registered users from Supabase DB
  // 2. Active posters from feed updates
  // 3. Curated founders as fallback if DB has < 3 community members
  const discoveringPeople = useMemo<DiscoveringPerson[]>(() => {
    const map = new Map<string, DiscoveringPerson>();
    const palette = [
      'bg-[#FEE8D6] text-[#B04A15]',
      'bg-gm-accent-soft text-gm-accent-deep',
      'bg-[#E5EEFF] text-[#1D58B5]',
      'bg-[#E8FAF0] text-[#0E9F6E]',
    ];

    // Priority 1: Registered users from Supabase
    for (const u of liveCommunityUsers) {
      if (u.username !== currentUser.username && !map.has(u.username)) {
        map.set(u.username, u);
      }
      if (map.size >= 3) break;
    }

    // Priority 2: Active authors from feed updates
    if (map.size < 3) {
      let colorIdx = map.size;
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
    }

    const liveList = Array.from(map.values());
    return liveList;
  }, [liveCommunityUsers, updates, currentUser.username]);

  // Left sidebar (Matches uploaded mockup media_1793815841557_9cc185f4.png):
  // 1. Profile card with You (Demo), Bengaluru, right arrow button, Saved & Connections
  // 2. "Your Journeys" card with stepper rail (Building Growing Moon 12 updates, Learning Guitar 8 updates) & Create a Journey button
  const leftSidebar = (
    <div className="space-y-4 pt-0.5">
      {/* ── 1. Profile Card with Saved & Connections ─────────────────── */}
      <div className="bg-white rounded-[28px] p-5 sm:p-6 shadow-card">
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
                className="w-14 h-14 rounded-full object-cover ring-1 ring-black/[0.06] flex-shrink-0 group-hover:scale-105 transition-transform"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-gm-accent-soft flex items-center justify-center font-bold text-xs text-gm-ink ring-1 ring-black/[0.04] flex-shrink-0 group-hover:scale-105 transition-transform">
                YD
              </div>
            )}
            <div className="min-w-0 flex-1">
              <span className="font-display text-xl font-medium text-gm-ink group-hover:text-gm-accent transition-colors block truncate leading-tight">
                {currentUser.name || 'You (Demo)'}
              </span>
              <p className="text-xs text-gray-400 font-normal truncate mt-0.5">
                {currentUser.location || 'Bengaluru, India'}
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* View Profile Button */}
            <Link
              href={`/profile/${currentUser.username}`}
              className="w-9 h-9 rounded-full bg-gm-accent text-white flex items-center justify-center transition-colors active:scale-95"
              title="View Profile"
            >
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.2]" />
            </Link>
          </div>
        </div>

        {/* Saved & Connections Navigation Links */}
        <div className="mt-5 pt-4 border-t border-gm-ink/[0.06] space-y-1">
          <button
            type="button"
            onClick={() => setActiveCategory(activeCategory === 'saved' ? 'for-you' : 'saved')}
            className={`w-full flex items-center justify-between text-[13px] font-medium transition-colors py-2 px-2 -mx-2 rounded-xl hover:bg-gray-100 group cursor-pointer ${
              activeCategory === 'saved' ? 'text-gm-accent' : 'text-gm-ink hover:text-gm-accent'
            }`}
          >
            <div className="flex items-center gap-3">
              <Bookmark
                className={`w-4 h-4 transition-colors ${
                  activeCategory === 'saved'
                    ? 'text-gm-accent fill-gm-accent'
                    : 'text-gray-700 group-hover:text-gm-accent'
                }`}
                strokeWidth={2}
              />
              <span>Saved Snippets</span>
            </div>
            <span
              className={`text-[10.5px] px-2 py-0.5 rounded-full font-bold transition-colors ${
                activeCategory === 'saved'
                  ? 'bg-gm-accent text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 group-hover:bg-gm-accent/10 group-hover:text-gm-accent'
              }`}
            >
              {updates.filter((u) => (u.saves || []).includes(currentUser.id)).length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setIsConnectionsModalOpen(true)}
            className="w-full flex items-center justify-between text-[13px] font-medium text-gm-ink hover:text-gm-accent transition-colors py-2 px-2 -mx-2 rounded-xl hover:bg-gray-100 group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Users className="w-4 h-4 text-gray-700 group-hover:text-gm-accent transition-colors" strokeWidth={2} />
              <span>Connections</span>
            </div>
            <span className="text-[11px] font-bold text-gray-500 group-hover:text-gm-accent bg-gray-100 group-hover:bg-gm-accent/10 px-2 py-0.5 rounded-full transition-colors">
              {connectedCount}
            </span>
          </button>
        </div>
      </div>

      {/* ── 2. Your Journeys Card with Stepper Line & Create Button ──── */}
      <div className="bg-white rounded-[28px] p-5 sm:p-6 shadow-card">
        <h4 className="font-display text-xl font-medium text-gm-ink mb-5 leading-tight">
          Your Journeys
        </h4>

        {/* Stepper with connecting rail */}
        <div className="relative pl-0.5">
          {/* Vertical Connecting Rail Line */}
          <div className="absolute left-[7px] top-4 bottom-5 w-px border-l border-dashed border-gm-ink/20" />

          <div className="space-y-4">
            {isLoadingFeed ? (
              <div className="py-4 text-center">
                <div className="w-5 h-5 rounded-full border-2 border-gm-accent border-t-transparent animate-spin mx-auto mb-2" />
                <p className="text-[11px] text-gray-400">Loading your journeys...</p>
              </div>
            ) : userJourneys.length === 0 ? (
              <div className="py-2 text-center">
                <p className="text-xs text-gray-500 font-medium">No journeys logged yet</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Create your first journey below!</p>
              </div>
            ) : (
              userJourneys.map((j, idx) => {
                const Icon = j.icon;
                return (
                  <Link
                    key={j.title + idx}
                    href={`/passport/${currentUser.username}`}
                    className="flex items-center gap-3 group relative cursor-pointer"
                  >
                    {/* Hollow node circle */}
                    <div className="w-3.5 h-3.5 rounded-full bg-gm-ink z-10 flex-shrink-0 ring-4 ring-gm-surface overflow-hidden relative after:absolute after:inset-0 after:rounded-full after:bg-gradient-to-br after:from-[#F3FBF9] after:to-gm-accent after:translate-x-[35%] group-hover:after:translate-x-0 after:transition-transform after:duration-500" />
                    {/* Icon in light purple circle */}
                    <div className="w-8 h-8 rounded-full bg-gm-accent-soft flex items-center justify-center text-gm-accent flex-shrink-0 group-hover:scale-105 transition-transform">
                      <Icon className="w-4 h-4 stroke-[2]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-bold text-gm-ink group-hover:text-gm-accent block truncate transition-colors">
                        {j.title}
                      </span>
                      <span className="text-[11px] text-gray-400 block truncate font-normal">
                        {j.count} update{j.count !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {/* Create a Journey Full-Width Pill Button */}
        <button
          type="button"
          onClick={() => setIsCreateJourneyModalOpen(true)}
          className="mt-6 w-full h-11 rounded-full border border-dashed border-gm-accent/50 hover:border-gm-accent hover:bg-gm-accent-soft text-gm-accent font-semibold text-[13px] flex items-center justify-center gap-1.5 transition-all active:scale-98 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Create a Journey</span>
        </button>
      </div>
    </div>
  );

  // Right sidebar
  // 1. "Builders ahead of you worth following" with live & discovering profiles
  // 2. "Saved Milestones" card with direct access to bookmarked advice & breakthroughs
  const rightSidebar = (
    <div className="space-y-4 pt-0.5">
      {/* ── 1. Builders Ahead of You Worth Following ───────── */}
      <div className="bg-white rounded-[28px] p-5 sm:p-6 shadow-card">
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="font-display text-xl font-medium text-gm-ink leading-tight pr-2">
            Builders ahead of you worth following
          </h3>
          <Link
            href="/discover"
            className="w-9 h-9 rounded-full bg-gm-accent text-white flex items-center justify-center transition-colors flex-shrink-0"
            title="Discover more people"
          >
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.2]" />
          </Link>
        </div>

        <div className="space-y-1">
          {discoveringPeople.map((person, idx) => (
            <Link
              key={person.username + idx}
              href={`/profile/${person.username}`}
              className="flex items-center gap-3 group cursor-pointer p-2 -mx-2 rounded-2xl hover:bg-gray-100 transition-colors"
            >
              {person.avatarImage ? (
                <img
                  src={person.avatarImage}
                  alt={person.name}
                  className="w-11 h-11 rounded-full object-cover flex-shrink-0 ring-1 ring-black/[0.04]"
                />
              ) : (
                <div
                  className={`w-11 h-11 rounded-full ${person.avatarColor} font-bold text-xs flex items-center justify-center flex-shrink-0 ring-1 ring-black/[0.04]`}
                >
                  {person.initials}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[13px] font-semibold text-gm-ink group-hover:text-gm-accent transition-colors truncate">
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

      {/* ── 2. Saved Milestones & Insights Card ────────────────── */}
      <div className="bg-white rounded-[28px] p-5 sm:p-6 shadow-card">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gm-accent-soft text-gm-accent flex items-center justify-center">
              <Bookmark className="w-3.5 h-3.5 fill-current" />
            </div>
            <h3 className="font-display text-xl font-medium text-gm-ink leading-tight">Saved Milestones</h3>
          </div>
          {savedUpdates.length > 0 && (
            <span className="text-[11px] font-bold text-gm-accent bg-gm-accent-soft px-2 py-0.5 rounded-full">
              {savedUpdates.length}
            </span>
          )}
        </div>

        {savedUpdates.length > 0 ? (
          <div className="space-y-2.5">
            {savedUpdates.slice(0, 3).map((item) => (
              <div
                key={item.id}
                onClick={() => setActiveCategory('saved')}
                className="p-3 rounded-2xl bg-gray-50 hover:bg-gm-accent-soft border border-transparent hover:border-gm-accent-line transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold text-gm-accent bg-white px-2 py-0.5 rounded-md border border-gm-accent-line truncate max-w-[130px]">
                    {item.journeyTag || item.category || 'Milestone'}
                  </span>
                  <span className="text-[10px] text-gray-400">by @{item.author?.username || 'member'}</span>
                </div>
                <p className="font-display text-[15px] font-medium text-gm-ink group-hover:text-gm-accent transition-colors line-clamp-2 leading-snug">
                  {item.headline || item.oneLineSummary || item.content}
                </p>
              </div>
            ))}

            <button
              type="button"
              onClick={() => setActiveCategory('saved')}
              className="w-full py-2 rounded-xl text-center text-xs font-bold text-gm-accent hover:bg-gm-accent-soft transition-colors cursor-pointer block mt-1"
            >
              View all {savedUpdates.length} saved →
            </button>
          </div>
        ) : (
          <div className="text-center py-4 px-2 bg-gray-50/60 rounded-2xl border border-dashed border-gray-200">
            <Bookmark className="w-6 h-6 text-gray-300 mx-auto mb-1.5" />
            <p className="text-xs font-bold text-gray-700">No saved milestones yet</p>
            <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
              Bookmark milestones and advice from builders ahead of you to easily reference them during your journey.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <AuthGuard>
      <AppShell leftSidebar={leftSidebar} rightSidebar={rightSidebar}>
        <div className="w-full">
          {/* ── 1. Category Filter Pills Row ────────────────────────── */}
        <div className="flex items-center gap-1.5 mb-6 overflow-x-auto scrollbar-none pb-1 -mx-1 px-1">
          {HOME_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`whitespace-nowrap px-4 sm:px-5 h-10 rounded-full text-[13px] transition-all active:scale-95 cursor-pointer select-none ${
                  isActive
                    ? 'bg-gm-accent text-white font-semibold shadow-float'
                    : 'text-gray-600 hover:text-gm-ink font-medium bg-gm-ink/[0.04] hover:bg-gm-ink/[0.08]'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* ── 3. Zero-Friction Inline Quick Composer ─────────────── */}
        {!isInlineComposerOpen ? (
          <div
            onClick={() => setIsInlineComposerOpen(true)}
            className="bg-white rounded-[28px] shadow-card hover:shadow-card-hover pl-4 pr-3 py-4 sm:py-5 mb-8 flex items-center justify-between gap-4 cursor-pointer transition-all duration-500 group"
          >
            {/* Left Purple Edit Icon */}
            <div className="w-11 h-11 rounded-full bg-gm-accent-soft text-gm-accent flex items-center justify-center flex-shrink-0 group-hover:bg-gm-accent group-hover:[&_svg]:text-white transition-colors">
              <SquarePen className="w-4 h-4 text-gm-accent stroke-[2.2]" />
            </div>

            {/* Placeholder text */}
            <span className="font-display text-lg sm:text-xl text-gray-500 group-hover:text-gm-ink flex-1 truncate transition-colors">
              What did you ship, learn, or struggle with today?
            </span>

            {/* Right Action Button */}
            <div className="w-11 h-11 rounded-full bg-gm-accent text-white flex items-center justify-center flex-shrink-0 group-hover:rotate-90 transition-all duration-500">
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-[28px] shadow-card-hover ring-1 ring-gm-accent/25 p-5 sm:p-6 mb-8 animate-slide-up">
            {/* Top Selector Bar: Journey & Update Type Pills */}
            <div className="flex items-center justify-between gap-2 flex-wrap mb-3 pb-2.5 border-b border-gray-100">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Journey Selector Dropdown Pill */}
                <div className="relative">
                  <select
                    value={inlineJourney || (userJourneys[0]?.title || 'Building my SaaS product')}
                    onChange={(e) => setInlineJourney(e.target.value)}
                    className="bg-gm-accent-soft text-gm-accent font-bold text-xs pl-3 pr-7 py-1.5 rounded-full border-none focus:outline-none focus:ring-2 focus:ring-gm-accent/20 cursor-pointer appearance-none max-w-[200px] truncate"
                  >
                    {(userJourneys.length > 0 ? userJourneys.map((j) => j.title) : ['Building my SaaS product', 'Learning AI']).map((title) => (
                      <option key={title} value={title}>
                        {title}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-gm-accent absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* Quick Type Selection Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
                  {['Progress update', 'Milestone achieved', 'Challenge', 'Lesson learned'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setInlineType(t)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                        inlineType === t
                          ? 'bg-gm-ink text-white shadow-2xs'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200/70'
                      }`}
                    >
                      {t.replace(' achieved', '').replace(' update', '')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsInlineComposerOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-black cursor-pointer transition-colors"
                title="Cancel inline update"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 1. Direct Heading Input */}
            <div className="relative mb-2">
              <input
                type="text"
                maxLength={100}
                value={inlineHeading}
                onChange={(e) => setInlineHeading(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                    e.preventDefault();
                    handleInlinePostSubmit();
                  }
                }}
                placeholder="Heading: What did you accomplish or learn today?"
                className="w-full bg-transparent font-display text-lg sm:text-xl font-medium text-gm-ink placeholder:text-gray-400 placeholder:font-normal focus:outline-none pb-3 border-b border-gm-ink/[0.06] pr-16"
                autoFocus
              />
              <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-normal pointer-events-none">
                {inlineHeading.length}/100
              </span>
            </div>

            {/* 2. Small Description Textarea Below Heading */}
            <div className="mb-2.5">
              <textarea
                rows={2}
                value={inlineContent}
                onChange={(e) => setInlineContent(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                    e.preventDefault();
                    handleInlinePostSubmit();
                  }
                }}
                placeholder="Add a small description about what happened or what you learned..."
                className="w-full bg-transparent text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none resize-none pb-1 pt-2 leading-relaxed"
              />
            </div>

            {/* Optional Google Drive Video Input */}
            {inlineIsVideoOpen && (
              <div className="mb-3 p-2.5 bg-emerald-50/70 rounded-xl border border-emerald-200 animate-fade-in">
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                  <input
                    type="url"
                    value={inlineVideoLink}
                    onChange={(e) => setInlineVideoLink(e.target.value)}
                    placeholder="Paste Google Drive video share link..."
                    className="w-full bg-white px-2.5 py-1.5 rounded-lg border border-emerald-200 text-xs text-gray-900 focus:outline-none focus:border-emerald-600"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setInlineIsVideoOpen(false);
                      setInlineVideoLink('');
                    }}
                    className="p-1 text-gray-400 hover:text-black text-xs cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-[10px] text-emerald-800 mt-1">
                  Only Google Drive video links are supported. Social media links are not allowed.
                </p>
              </div>
            )}

            {/* Attached Images Preview Row */}
            {inlineAttachments.length > 0 && (
              <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1 scrollbar-thin">
                {inlineAttachments.map((att) => (
                  <div
                    key={att.id}
                    className="relative w-16 h-12 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0"
                  >
                    <img src={att.url} alt="preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() =>
                        setInlineAttachments((prev) => prev.filter((a) => a.id !== att.id))
                      }
                      className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/70 text-white text-[9px] flex items-center justify-center cursor-pointer"
                      title="Remove image"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Bottom Actions Bar */}
            <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
              <div className="flex items-center gap-1.5">
                {/* Add Image File */}
                <button
                  type="button"
                  onClick={() => inlineFileInputRef.current?.click()}
                  className="px-2.5 py-1.5 rounded-full text-gray-600 hover:text-gm-accent hover:bg-gm-accent-soft transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                  title="Add Images"
                >
                  <ImageIcon className="w-4 h-4 text-gm-accent" />
                  <span className="hidden sm:inline">Images</span>
                </button>

                {/* Add Google Drive Video Link Toggle */}
                <button
                  type="button"
                  onClick={() => setInlineIsVideoOpen(!inlineIsVideoOpen)}
                  className={`px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold ${
                    inlineIsVideoOpen || inlineVideoLink
                      ? 'text-emerald-700 bg-emerald-50'
                      : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50/60'
                  }`}
                  title="Add Google Drive Video"
                >
                  <Video className="w-4 h-4 text-emerald-600" />
                  <span className="hidden sm:inline">Drive Video</span>
                </button>

                {/* More Options / Expand Full Modal */}
                <button
                  type="button"
                  onClick={() => {
                    setIsInlineComposerOpen(false);
                    handleOpenComposer('text');
                  }}
                  className="px-2 py-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer text-xs"
                  title="Open full composer with extra fields"
                >
                  More options...
                </button>
              </div>

              {/* Submit & Shortcut hint */}
              <div className="flex items-center gap-2.5">
                <span className="text-[11px] text-gray-400 hidden sm:inline">
                  Ctrl + Enter to post
                </span>
                <button
                  type="button"
                  onClick={handleInlinePostSubmit}
                  disabled={!inlineHeading.trim() || isInlineSubmitting}
                  className="bg-gm-accent disabled:opacity-40 text-white font-semibold text-[13px] px-5 h-10 rounded-full active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 rotate-45 -translate-y-0.5" />
                  <span>Post Update</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Hidden File Input for Inline Composer Images */}
        <input
          type="file"
          ref={inlineFileInputRef}
          onChange={handleInlineImageChange}
          accept="image/*"
          className="hidden"
          multiple
        />

        {/* ── Saved Snippets Active Filter Banner ─────────────── */}
        {activeCategory === 'saved' && (
          <div className="bg-gm-accent-soft border border-gm-accent-line rounded-full pl-5 pr-4 h-12 flex items-center justify-between text-[13px] mb-6 animate-slide-up">
            <div className="flex items-center gap-2.5 text-gm-accent font-bold">
              <Bookmark className="w-4 h-4 fill-current" />
              <span>Showing your Saved Snippets ({filteredUpdates.length})</span>
            </div>
            <button
              type="button"
              onClick={() => setActiveCategory('for-you')}
              className="text-xs text-gm-accent hover:underline font-semibold cursor-pointer"
            >
              Back to all posts
            </button>
          </div>
        )}

        {/* ── 4. Movement Feed Stream ────────────────────────────── */}
        {isLoadingFeed ? (
          <div className="space-y-5">
            <AestheticLoader
              title="Bringing your personalized journey stream..."
              subtitle="Fetching real community milestones, discussions, and updates."
            />
            {[0, 1].map((k) => (
              <div key={k} className="bg-white rounded-[28px] p-6 shadow-card" aria-hidden>
                <div className="flex items-center gap-3 mb-6">
                  <div className="gm-skeleton !rounded-full w-11 h-11" />
                  <div className="space-y-2 flex-1">
                    <div className="gm-skeleton h-3 w-40" />
                    <div className="gm-skeleton h-2.5 w-24" />
                  </div>
                </div>
                <div className="gm-skeleton h-6 w-3/4 mb-3" />
                <div className="gm-skeleton h-3 w-full mb-2" />
                <div className="gm-skeleton h-3 w-5/6 mb-6" />
                <div className="gm-skeleton h-56 w-full !rounded-2xl" />
              </div>
            ))}
          </div>
        ) : filteredUpdates.length > 0 ? (
          <div className="space-y-5 sm:space-y-6">
            {filteredUpdates.map((update) => (
              <JourneyPostCard key={update.id} update={update} />
            ))}
          </div>
        ) : activeCategory === 'saved' ? (
          <div className="rounded-[28px] p-10 sm:p-14 text-center border border-dashed border-gm-ink/15 animate-slide-up">
            <Bookmark className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <h3 className="font-display text-2xl font-medium text-gm-ink">No saved snippets yet</h3>
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

      {/* ── Dedicated Create Journey Modal ─────────────────── */}
      <CreateJourneyModal
        isOpen={isCreateJourneyModalOpen}
        onClose={() => setIsCreateJourneyModalOpen(false)}
        onCreated={(newJourney) => {
          setCustomJourneys((prev) => [newJourney, ...prev]);
          passportsApi
            .getMyPassports()
            .then((list) => {
              if (Array.isArray(list)) setDbPassports(list);
            })
            .catch(() => {});
        }}
      />
    </AppShell>
  </AuthGuard>
  );
}
