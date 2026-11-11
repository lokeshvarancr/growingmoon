'use client';
import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AppShell from '@/components/shared/AppShell';
import AestheticLoader from '@/components/shared/AestheticLoader';
import { feedApi, socialApi } from '@/lib/api/client';
import { useApp } from '@/lib/state/AppContext';
import {
  Search,
  SlidersHorizontal,
  ArrowRight,
  ArrowUpRight,
  UserPlus,
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Video,
} from 'lucide-react';

export type ExploreCard = {
  id: string;
  badge: string;
  badgeIcon: string;
  badgeColor: string;
  bannerUrl: string;
  titleLead: string;
  titleMain: string;
  authorId?: string;
  authorName: string;
  authorAvatar: string;
  authorUsername: string;
  heading: string;
  emoji: string;
  actionLabel: string;
  tags: string[];
  category: 'building' | 'learning' | 'career' | 'creativity' | 'fitness' | 'lifestyle';
};

const EXPLORE_CARDS: ExploreCard[] = [
  {
    id: 'e-2',
    badge: 'Learning',
    badgeIcon: '🎸',
    badgeColor: 'bg-[#181528]/75 text-white border-white/20',
    bannerUrl: 'https://images.unsplash.com/photo-1525201548942-d8732f6617a0?auto=format&fit=crop&w=800&q=80',
    titleLead: 'Learning',
    titleMain: 'Acoustic Guitar',
    authorName: 'Meera Pillai',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    authorUsername: 'meera_pillai',
    heading: 'Finally able to transition between open chords without pausing the tempo.',
    emoji: '🎸',
    actionLabel: "View Meera's Guitar Journey",
    tags: ['Music', 'Acoustic', 'Beginner'],
    category: 'learning',
  },
  {
    id: 'e-1',
    badge: 'Building',
    badgeIcon: '🚀',
    badgeColor: 'bg-[#181528]/75 text-white border-white/20',
    bannerUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
    titleLead: 'Validating',
    titleMain: 'Startup MVP',
    authorName: 'Arjun Sharma',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    authorUsername: 'arjun_sharma',
    heading: 'Finished 5 deep discovery interviews and identified core onboarding bottlenecks.',
    emoji: '🚀',
    actionLabel: "View Arjun's Journey",
    tags: ['Projects', 'MVP', 'User Research'],
    category: 'building',
  },
  {
    id: 'e-3',
    badge: 'Creative',
    badgeIcon: '📷',
    badgeColor: 'bg-[#181528]/75 text-white border-white/20',
    bannerUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
    titleLead: 'Exploring',
    titleMain: 'Street Photography',
    authorName: 'Diya Nair',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    authorUsername: 'diya_nair',
    heading: 'Capturing raw, unscripted city life in high contrast monochrome shadows.',
    emoji: '📷',
    actionLabel: "View Diya's Photo Journey",
    tags: ['Photography', 'Monochrome', 'Visual Art'],
    category: 'creativity',
  },
  {
    id: 'e-4',
    badge: 'Education',
    badgeIcon: '📚',
    badgeColor: 'bg-[#181528]/75 text-white border-white/20',
    bannerUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80',
    titleLead: 'Preparing for',
    titleMain: 'GRE Examination',
    authorName: 'Vishal Kumar',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    authorUsername: 'vishal_kumar',
    heading: 'Starting a rigorous 90-day study plan focused on quantitative reasoning.',
    emoji: '📚',
    actionLabel: "View Vishal's Study Journey",
    tags: ['Education', 'GRE', 'Study Cohort'],
    category: 'learning',
  },
  {
    id: 'e-5',
    badge: 'Fitness',
    badgeIcon: '🏃',
    badgeColor: 'bg-[#181528]/75 text-white border-white/20',
    bannerUrl: 'https://images.unsplash.com/photo-1483721074573-500b58e7f1f3?auto=format&fit=crop&w=800&q=80',
    titleLead: 'Training for',
    titleMain: 'Half Marathon',
    authorName: 'Ananya Rao',
    authorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
    authorUsername: 'ananya_rao',
    heading: 'Week 3 complete: Ran 8km at steady 5:30 pace feeling noticeably stronger.',
    emoji: '🏃',
    actionLabel: "View Ananya's Running Journey",
    tags: ['Running', 'Discipline', 'Fitness'],
    category: 'fitness',
  },
  {
    id: 'e-6',
    badge: 'Career',
    badgeIcon: '💼',
    badgeColor: 'bg-[#181528]/75 text-white border-white/20',
    bannerUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
    titleLead: 'Switching to',
    titleMain: 'Product Leadership',
    authorName: 'Rahul Menon',
    authorAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80',
    authorUsername: 'rahul_menon',
    heading: 'Deconstructing consumer habit loops and building my first public product tear-down.',
    emoji: '💼',
    actionLabel: "View Rahul's Product Journey",
    tags: ['Career Switch', 'Product Strategy', 'Mentorship'],
    category: 'career',
  },
  {
    id: 'e-7',
    badge: 'Lifestyle',
    badgeIcon: '🥗',
    badgeColor: 'bg-[#181528]/75 text-white border-white/20',
    bannerUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80',
    titleLead: 'Exploring',
    titleMain: 'Mediterranean Diet',
    authorName: 'Sneha Iyer',
    authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    authorUsername: 'sneha_iyer',
    heading: 'Exploring high-protein Mediterranean recipes for sustained daily mental clarity.',
    emoji: '🥗',
    actionLabel: "View Sneha's Wellness Journey",
    tags: ['Cooking', 'Wellness', 'Nutrition'],
    category: 'lifestyle',
  },
  {
    id: 'e-8',
    badge: 'Creative',
    badgeIcon: '✏️',
    badgeColor: 'bg-[#181528]/75 text-white border-white/20',
    bannerUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=80',
    titleLead: 'Practising',
    titleMain: 'Digital Illustration',
    authorName: 'Karan Verma',
    authorAvatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=300&q=80',
    authorUsername: 'karan_verma',
    heading: 'Daily rendering drills exploring lighting, textures, and 3D character form.',
    emoji: '✏️',
    actionLabel: "View Karan's Art Journey",
    tags: ['Art', 'Design', '3D Illustration'],
    category: 'creativity',
  },
];

const CATEGORIES = [
  { id: 'for-you', label: 'For you ✨' },
  { id: 'all', label: 'All' },
  { id: 'building', label: 'Building 🚀' },
  { id: 'learning', label: 'Learning 📖' },
  { id: 'creativity', label: 'Creativity 🎨' },
  { id: 'career', label: 'Career 💼' },
  { id: 'fitness', label: 'Fitness 🏃' },
  { id: 'lifestyle', label: 'Lifestyle 🍃' },
];

export type MobileCardFormat =
  | 'tall-hero'
  | 'top-image'
  | 'white-minimal'
  | 'video';

export type MobileFeedItem = {
  id: string;
  format: MobileCardFormat;
  title: string;
  subtitle: string;
  badge: string;
  badgeIcon: string;
  imageUrl?: string;
  authorName: string;
  authorAvatar: string;
  authorUsername: string;
  category: 'building' | 'learning' | 'career' | 'creativity' | 'fitness' | 'lifestyle';
  videoDuration?: string;
};

const BASE_EXPLORE_STORIES: Array<Omit<MobileFeedItem, 'id' | 'format'>> = [
  // ── Block 1: Matching Image 1 Reference Directly ──
  {
    title: 'Learning Acoustic Guitar',
    subtitle: 'Finally transitioning between chords smoothly.',
    badge: 'Learning',
    badgeIcon: '📖',
    imageUrl: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=800&q=80',
    authorName: 'Meera Pillai',
    authorAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
    authorUsername: 'meera_pillai',
    category: 'learning',
  },
  {
    title: 'Building My First Startup',
    subtitle: 'Just onboarded our first users.',
    badge: 'Building',
    badgeIcon: '🚀',
    imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
    authorName: 'Arjun Sharma',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    authorUsername: 'arjun_sharma',
    category: 'building',
  },
  {
    title: 'Hiking Across the Hills',
    subtitle: 'Creating an intentional, high-altitude endurance trail benchmark.',
    badge: 'Travel',
    badgeIcon: '⛰️',
    videoDuration: '0:24',
    imageUrl: 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=800&q=80',
    authorName: 'Ananya Rao',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    authorUsername: 'ananya_rao',
    category: 'lifestyle',
  },
  {
    title: 'Application to Oxford',
    subtitle: 'Shortlisting programs and refining my SOP.',
    badge: 'Education',
    badgeIcon: '📚',
    authorName: 'Vishal Kumar',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    authorUsername: 'vishal_kumar',
    category: 'learning',
  },
  {
    title: 'Building a Study System',
    subtitle: 'Creating a distraction-free routine.',
    badge: 'Learning',
    badgeIcon: '🧠',
    authorName: 'Devika Patel',
    authorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
    authorUsername: 'devika_patel',
    category: 'learning',
  },
  {
    title: 'Learning Digital Art',
    subtitle: 'Exploring portrait styles and color techniques.',
    badge: 'Creativity',
    badgeIcon: '🎨',
    imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
    authorName: 'Diya Nair',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    authorUsername: 'diya_nair',
    category: 'creativity',
  },

  // ── Block 2: Fitness, Career & Lifestyle ──
  {
    title: 'Training for Half Marathon',
    subtitle: 'Week 5 complete: 12km tempo run at 5:15 pace with zero knee fatigue.',
    badge: 'Fitness',
    badgeIcon: '🏃',
    imageUrl: 'https://images.unsplash.com/photo-1483721074573-500b58e7f1f3?auto=format&fit=crop&w=800&q=80',
    authorName: 'Rohan Gupta',
    authorAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80',
    authorUsername: 'rohan_gupta',
    category: 'fitness',
  },
  {
    title: 'Switching to Product Leadership',
    subtitle: 'Deconstructing B2B user loops and writing public product teardowns.',
    badge: 'Career',
    badgeIcon: '💼',
    imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
    authorName: 'Rahul Menon',
    authorAvatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=150&q=80',
    authorUsername: 'rahul_menon',
    category: 'career',
  },
  {
    title: 'Specialty Coffee Brewing',
    subtitle: 'Dialing in 93°C extraction on washed Ethiopian heirloom beans.',
    badge: 'Coffee',
    badgeIcon: '☕',
    videoDuration: '0:35',
    imageUrl: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80',
    authorName: 'Rohan Sen',
    authorAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
    authorUsername: 'rohan_sen',
    category: 'lifestyle',
  },
  {
    title: 'Mediterranean Nutrition & Focus',
    subtitle: 'Clean meal prep bowls for sustained cognitive stamina all day.',
    badge: 'Lifestyle',
    badgeIcon: '🥗',
    authorName: 'Sneha Iyer',
    authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    authorUsername: 'sneha_iyer',
    category: 'lifestyle',
  },
  {
    title: '3D Character Sculpting',
    subtitle: 'Daily hard-surface topology drills with Blender geometry nodes.',
    badge: 'Creative',
    badgeIcon: '✏️',
    authorName: 'Karan Verma',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    authorUsername: 'karan_verma',
    category: 'creativity',
  },
  {
    title: 'Japanese Joinery Craft',
    subtitle: 'Hand-cutting mortise and tenon cedar connections without glue or nails.',
    badge: 'Craft',
    badgeIcon: '🪵',
    imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
    authorName: 'Aditi Bose',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    authorUsername: 'aditi_bose',
    category: 'creativity',
  },

  // ── Block 3: Engineering, Art & Deep Focus ──
  {
    title: 'Micro-SaaS to 1K Users',
    subtitle: 'Shipped production Stripe webhooks and telemetry dashboards.',
    badge: 'Building',
    badgeIcon: '⚡',
    imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80',
    authorName: 'Devika Patel',
    authorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
    authorUsername: 'devika_patel',
    category: 'building',
  },
  {
    title: 'Minimalist Urban Photography',
    subtitle: 'Documenting architectural shadows and raw street light in Mumbai.',
    badge: 'Creative',
    badgeIcon: '📷',
    imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
    authorName: 'Kabir Joshi',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    authorUsername: 'kabir_joshi',
    category: 'creativity',
  },
  {
    title: 'Deep Focus Coding Session',
    subtitle: 'Zero distraction 4-hour sprint building offline sync engine.',
    badge: 'Building',
    badgeIcon: '🎧',
    videoDuration: '0:42',
    imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
    authorName: 'Arjun Sharma',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    authorUsername: 'arjun_sharma',
    category: 'building',
  },
  {
    title: 'Mastering TypeScript Generics',
    subtitle: 'Deconstructing type-level state machines and discriminated unions.',
    badge: 'Coding',
    badgeIcon: '💻',
    authorName: 'Vishal Kumar',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    authorUsername: 'vishal_kumar',
    category: 'learning',
  },
  {
    title: 'Olympic Weightlifting Drills',
    subtitle: 'Perfecting bar path acceleration and triple extension.',
    badge: 'Fitness',
    badgeIcon: '🏋️',
    authorName: 'Rohan Gupta',
    authorAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80',
    authorUsername: 'rohan_gupta',
    category: 'fitness',
  },
  {
    title: 'Night Sky Astrophotography',
    subtitle: 'Stacking 120 deep-sky exposures to capture the Orion Nebula.',
    badge: 'Photography',
    badgeIcon: '🌌',
    imageUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=800&q=80',
    authorName: 'Meera Pillai',
    authorAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
    authorUsername: 'meera_pillai',
    category: 'creativity',
  },
];

export default function ExploreView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser, addToast } = useApp();
  const urlQuery = searchParams?.get('q') || '';

  const [activeTab, setActiveTab] = useState<string>('for-you');
  const [searchQuery, setSearchQuery] = useState(urlQuery);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>('all');
  const [followedCards, setFollowedCards] = useState<Record<string, boolean>>({});
  const [liveCards, setLiveCards] = useState<ExploreCard[]>([]);
  const [liveStories, setLiveStories] = useState<MobileFeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadedBackend, setHasLoadedBackend] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Helper mapper for feed posts -> explore cards
  const mapPostToExploreCard = (post: any): ExploreCard => ({
    id: post.id,
    badge: post.journey_tag || post.category,
    badgeIcon:
      post.category?.toLowerCase() === 'building'
        ? '🚀'
        : post.category?.toLowerCase() === 'learning'
        ? '📖'
        : '✨',
    badgeColor: 'bg-[#181528]/75 text-white border-white/20',
    bannerUrl:
      post.media?.[0]?.url ||
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
    titleLead: post.headline ? 'Milestone:' : 'Journey:',
    titleMain: post.headline || post.journey_tag || 'Progress Log',
    authorId: post.author?.id || post.author_id,
    authorName: post.author?.name || 'Community Member',
    authorAvatar:
      post.author?.avatar_image ||
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    authorUsername: post.author?.username || 'member',
    heading: post.content ? post.content.slice(0, 140) + (post.content.length > 140 ? '...' : '') : '',
    emoji: '✨',
    actionLabel: 'View Milestone',
    tags: [post.category, post.journey_tag || 'Journey'].filter(Boolean),
    category: (post.category?.toLowerCase() as any) || 'building',
  });

  const mapPostToStory = (post: any, idx: number): MobileFeedItem => {
    const formats: MobileCardFormat[] = ['tall-hero', 'top-image', 'white-minimal', 'video'];
    return {
      id: post.id,
      format: formats[idx % formats.length],
      title: post.headline || post.journey_tag || 'Community Milestone',
      subtitle: post.content.slice(0, 80) + (post.content.length > 80 ? '...' : ''),
      badge: post.journey_tag || post.category,
      badgeIcon:
        post.category?.toLowerCase() === 'building'
          ? '🚀'
          : post.category?.toLowerCase() === 'learning'
          ? '📖'
          : '✨',
      imageUrl:
        post.media?.[0]?.url ||
        'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
      authorName: post.author?.name || 'Community Member',
      authorAvatar:
        post.author?.avatar_image ||
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      authorUsername: post.author?.username || 'member',
      category: (post.category?.toLowerCase() as any) || 'building',
      videoDuration: post.media?.[0]?.media_type === 'video' ? '0:30' : undefined,
    };
  };

  // Helper to deduplicate incoming raw posts against existing cards
  const filterUniquePosts = (rawItems: any[], existingCards: ExploreCard[]): any[] => {
    const existingIds = new Set(existingCards.map((c) => c.id));
    const seenContent = new Set(
      existingCards.map((c) => `${c.authorUsername}__${c.titleMain}__${c.heading.slice(0, 100)}`.toLowerCase().trim())
    );

    const unique: any[] = [];
    for (const item of rawItems) {
      if (!item || !item.id) continue;
      if (existingIds.has(item.id)) continue;

      const authorHandle = item.author?.username || item.author_id || 'member';
      const title = item.headline || item.journey_tag || '';
      const text = item.content || '';
      const signature = `${authorHandle}__${title}__${text.slice(0, 100)}`.toLowerCase().trim();

      if (signature.length > 5 && seenContent.has(signature)) {
        continue;
      }

      existingIds.add(item.id);
      if (signature.length > 5) {
        seenContent.add(signature);
      }
      unique.push(item);
    }
    return unique;
  };

  // Fetch initial batch of maximum 30 feeds directly from passport_updates
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setHasMore(true);

    const categoryParam = activeTab === 'all' || activeTab === 'for-you' ? undefined : activeTab;

    feedApi
      .getExploreFeed(undefined, 30, categoryParam, searchQuery, 0)
      .then((res) => {
        if (!isMounted) return;
        if (res?.items && Array.isArray(res.items)) {
          const uniqueItems = filterUniquePosts(res.items, []);
          const mappedCards: ExploreCard[] = uniqueItems.map(mapPostToExploreCard);
          const mappedStories: MobileFeedItem[] = uniqueItems.map(mapPostToStory);

          setLiveCards(mappedCards);
          setLiveStories(mappedStories);
          setHasLoadedBackend(true);
          // Backend has_more flag or items remaining
          const moreAvailable = Boolean(res.has_more ?? (res.items.length >= 30));
          setHasMore(moreAvailable && uniqueItems.length > 0);
        } else {
          setLiveCards([]);
          setLiveStories([]);
          setHasLoadedBackend(true);
          setHasMore(false);
        }
      })
      .catch((err) => {
        console.warn('Backend explore feed unreachable:', err);
        if (isMounted) {
          setLiveCards([]);
          setLiveStories([]);
          setHasLoadedBackend(true);
          setHasMore(false);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeTab, searchQuery]);

  // Infinite Scroll: Load More feeds as the user scrolls
  const handleLoadMore = useCallback(async () => {
    if (isLoading || isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);

    const currentOffset = liveCards.length;
    const categoryParam = activeTab === 'all' || activeTab === 'for-you' ? undefined : activeTab;
    const seenIdsParam = liveCards.map((c) => c.id).join(',');

    try {
      const res = await feedApi.getExploreFeed(undefined, 30, categoryParam, searchQuery, currentOffset, seenIdsParam);
      if (res?.items && Array.isArray(res.items) && res.items.length > 0) {
        let addedCount = 0;

        setLiveCards((prev) => {
          const uniqueItems = filterUniquePosts(res.items, prev);
          addedCount = uniqueItems.length;
          if (addedCount === 0) return prev;
          const nextCards = uniqueItems.map(mapPostToExploreCard);
          return [...prev, ...nextCards];
        });

        setLiveStories((prev) => {
          const existingIds = new Set(prev.map((s) => s.id));
          const uniqueStories = res.items.filter((item: any) => item.id && !existingIds.has(item.id));
          if (uniqueStories.length === 0) return prev;
          const nextStories = uniqueStories.map((post: any, i: number) => mapPostToStory(post, prev.length + i));
          return [...prev, ...nextStories];
        });

        // If no new unique items could be added, or backend reports no more, stop pagination
        const moreAvailable = Boolean(res.has_more ?? (res.items.length >= 30));
        if (addedCount === 0 || !moreAvailable) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.warn('Error loading more explore feeds:', err);
      setHasMore(false);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoading, isLoadingMore, hasMore, liveCards, activeTab, searchQuery]);

  // Observer for Sentinel infinite scrolling
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading && !isLoadingMore) {
          handleLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [handleLoadMore, hasMore, isLoading, isLoadingMore]);

  const handleToggleFollow = async (e: React.MouseEvent, card: ExploreCard) => {
    e.stopPropagation();
    const isCurrentlyFollowed = Boolean(
      followedCards[card.id] || (card.authorId && followedCards[card.authorId])
    );
    const nextState = !isCurrentlyFollowed;

    setFollowedCards((prev) => {
      const updated = { ...prev, [card.id]: nextState };
      if (card.authorId) updated[card.authorId] = nextState;
      return updated;
    });

    if (card.authorId) {
      try {
        if (nextState) {
          await socialApi.followUser(card.authorId);
          addToast(`Now following ${card.authorName}`, 'success');
        } else {
          await socialApi.unfollowUser(card.authorId);
          addToast(`Unfollowed ${card.authorName}`, 'info');
        }
      } catch (err) {
        console.warn('Failed to update follow in database:', err);
      }
    }
  };

  // Filter cards by category & search query (Desktop) - ZERO hardcoded mock fallback
  const filteredCards = useMemo(() => {
    let result = liveCards;

    // Category filter
    if (activeTab !== 'for-you' && activeTab !== 'all') {
      result = result.filter((card) => card.category.toLowerCase() === activeTab.toLowerCase());
    }

    // Search query filter (client-side refinement)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (card) =>
          card.heading.toLowerCase().includes(q) ||
          card.titleMain.toLowerCase().includes(q) ||
          card.titleLead.toLowerCase().includes(q) ||
          card.authorName.toLowerCase().includes(q) ||
          card.authorUsername.toLowerCase().includes(q) ||
          card.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Tag filter from modal
    if (selectedTagFilter !== 'all') {
      result = result.filter((card) =>
        card.tags.some((t) => t.toLowerCase() === selectedTagFilter.toLowerCase())
      );
    }

    return result;
  }, [hasLoadedBackend, liveCards, activeTab, searchQuery, selectedTagFilter]);

  // Split filtered items into two balanced masonry columns (Zero mock preloading)
  const { col1Items, col2Items } = useMemo(() => {
    let baseList: MobileFeedItem[] = liveStories;

    if (activeTab !== 'for-you' && activeTab !== 'all') {
      baseList = baseList.filter((item) => item.category.toLowerCase() === activeTab.toLowerCase());
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      baseList = baseList.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.subtitle.toLowerCase().includes(q) ||
          item.authorName.toLowerCase().includes(q) ||
          item.authorUsername.toLowerCase().includes(q) ||
          item.badge.toLowerCase().includes(q)
      );
    }

    if (baseList.length === 0) return { col1Items: [], col2Items: [] };

    const col1: MobileFeedItem[] = [];
    const col2: MobileFeedItem[] = [];

    baseList.forEach((item, i) => {
      if (i % 2 === 0) {
        col1.push(item);
      } else {
        col2.push(item);
      }
    });

    return { col1Items: col1, col2Items: col2 };
  }, [hasLoadedBackend, liveStories, activeTab, searchQuery]);

  // Render individual mobile card format: Direct match to reference UI (Zero vertical gaps, soft rounded corners)
  const renderMobileCard = (item: MobileFeedItem) => {
    const handleCardClick = () => {
      if (item.id && !item.id.startsWith('static-')) {
        router.push(`/updates/${item.id}`);
      } else {
        router.push(`/profile/${item.authorUsername}`);
      }
    };

    const handleAuthorClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      router.push(`/profile/${item.authorUsername}`);
    };

    switch (item.format) {
      // 1. Tall Editorial Hero Card: Full-bleed rich photo with dark gradient overlay & white pill button
      case 'tall-hero':
        return (
          <div
            key={item.id}
            onClick={handleCardClick}
            className="w-full relative rounded-[20px] sm:rounded-[22px] overflow-hidden bg-slate-950 aspect-[3/4.5] sm:aspect-[3/4.2] flex flex-col justify-between p-3.5 sm:p-4 text-white shadow-xs group cursor-pointer select-none border border-black/[0.08]"
          >
            <img
              src={item.imageUrl || 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=800&q=80'}
              alt={item.title}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-black/15 pointer-events-none" />

            {/* Top Category Badge */}
            <div className="relative z-10 self-start">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/55 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold tracking-wide">
                <span>{item.badgeIcon}</span>
                <span>{item.badge}</span>
              </span>
            </div>

            {/* Bottom Content */}
            <div className="relative z-10 space-y-2">
              <div className="space-y-1">
                <h3 className="text-white font-black text-sm sm:text-base leading-snug drop-shadow-sm line-clamp-2">
                  {item.title}
                </h3>
                <div className="w-6 h-[2.5px] bg-[#8B5CF6] rounded-full" />
                <p className="text-white/85 text-[10.5px] sm:text-xs font-normal leading-relaxed line-clamp-2">
                  {item.subtitle}
                </p>
              </div>

              {/* Author Avatar + Explore Pill Button */}
              <div className="pt-2 flex items-center justify-between gap-2 border-t border-white/15">
                <div
                  onClick={handleAuthorClick}
                  className="flex items-center gap-1.5 min-w-0 cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <img
                    src={item.authorAvatar}
                    alt={item.authorName}
                    className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover ring-1 ring-white/60 flex-shrink-0"
                  />
                  <span className="text-[10px] font-medium text-white/90 truncate max-w-[70px]">
                    {item.authorName.split(' ')[0]}
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 bg-white text-[#141724] font-black text-[10.5px] px-3 py-1.5 rounded-full shadow-xs group-hover:bg-white/90 group-hover:scale-[1.02] active:scale-95 transition-all">
                  <span>Explore</span>
                  <ArrowRight className="w-3 h-3 text-[#6258DB] stroke-[2.5]" />
                </span>
              </div>
            </div>
          </div>
        );

      // 2. Top-Image Story Card: Top photo with pill tag + crisp white bottom card with avatar & Explore link
      case 'top-image':
        return (
          <div
            key={item.id}
            onClick={handleCardClick}
            className="w-full bg-white rounded-[20px] sm:rounded-[22px] border border-black/[0.07] shadow-xs overflow-hidden flex flex-col justify-between group cursor-pointer select-none hover:border-black/15 transition-all"
          >
            {/* Top Image */}
            <div className="relative h-24 sm:h-28 w-full overflow-hidden bg-slate-900 flex-shrink-0">
              <img
                src={item.imageUrl || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80'}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
              <span className="absolute top-2 left-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-[9px] font-bold">
                <span>{item.badgeIcon}</span>
                <span>{item.badge}</span>
              </span>
            </div>

            {/* Content */}
            <div className="p-3 flex flex-col justify-between flex-1 space-y-2">
              <div className="space-y-0.5">
                <h3 className="font-black text-xs sm:text-[13px] text-[#141724] leading-snug line-clamp-1 group-hover:text-[#6258DB] transition-colors">
                  {item.title}
                </h3>
                <p className="text-gray-500 text-[10px] sm:text-[10.5px] font-normal leading-relaxed line-clamp-2">
                  {item.subtitle}
                </p>
              </div>

              {/* Footer: Avatar + Text Link */}
              <div className="pt-1.5 flex items-center justify-between gap-1.5 border-t border-gray-100">
                <div
                  onClick={handleAuthorClick}
                  className="flex items-center gap-1.5 min-w-0 cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <img
                    src={item.authorAvatar}
                    alt={item.authorName}
                    className="w-5 h-5 rounded-full object-cover ring-1 ring-black/5 flex-shrink-0"
                  />
                  <span className="text-[10px] font-medium text-gray-700 truncate max-w-[65px]">
                    {item.authorName.split(' ')[0]}
                  </span>
                </div>
                <span className="text-[10px] font-black text-[#6258DB] group-hover:underline flex items-center gap-0.5 transition-colors">
                  <span>Explore</span>
                  <ArrowRight className="w-3 h-3 stroke-[2.5]" />
                </span>
              </div>
            </div>
          </div>
        );

      // 3. Clean White Editorial Card: Compact, natural typography card with zero awkward gap
      case 'white-minimal':
        return (
          <div
            key={item.id}
            onClick={handleCardClick}
            className="w-full bg-white rounded-[20px] sm:rounded-[22px] border border-black/[0.07] shadow-xs p-3.5 flex flex-col justify-between group cursor-pointer select-none hover:border-black/15 transition-all"
          >
            <div className="space-y-1.5">
              <div className="flex items-center gap-1">
                <span className="text-xs">{item.badgeIcon}</span>
                <span className="text-[9.5px] font-black uppercase tracking-wider text-[#6258DB]">
                  {item.badge}
                </span>
              </div>
              <h3 className="font-black text-xs sm:text-[13.5px] text-[#141724] leading-snug group-hover:text-[#6258DB] transition-colors line-clamp-2">
                {item.title}
              </h3>
              <p className="text-gray-500 text-[10px] sm:text-[10.5px] font-normal leading-relaxed line-clamp-2">
                {item.subtitle}
              </p>
            </div>

            {/* Footer: Avatar + Text Link */}
            <div className="pt-2 mt-2 border-t border-gray-100 flex items-center justify-between gap-1.5">
              <div
                onClick={handleAuthorClick}
                className="flex items-center gap-1.5 min-w-0 cursor-pointer hover:opacity-80 transition-opacity"
              >
                <img
                  src={item.authorAvatar}
                  alt={item.authorName}
                  className="w-5 h-5 rounded-full object-cover ring-1 ring-black/5 flex-shrink-0"
                />
                <span className="text-[10px] font-medium text-gray-700 truncate max-w-[65px]">
                  {item.authorName.split(' ')[0]}
                </span>
              </div>
              <span className="text-[10px] font-black text-[#6258DB] group-hover:underline flex items-center gap-0.5 transition-colors">
                <span>Explore</span>
                <ArrowRight className="w-3 h-3 stroke-[2.5]" />
              </span>
            </div>
          </div>
        );

      // 4. Interactive Video Card: Rich video thumbnail with frosted Play/Pause, duration badge, progress bar & audio toggle
      case 'video':
        return (
          <div
            key={item.id}
            onClick={handleCardClick}
            className="w-full relative rounded-[20px] sm:rounded-[22px] overflow-hidden bg-slate-950 aspect-[16/11] sm:aspect-[16/10] flex flex-col justify-between p-3 text-white shadow-xs group cursor-pointer select-none border border-black/[0.08]"
          >
            <img
              src={item.imageUrl || 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=800&q=80'}
              alt={item.title}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/25 pointer-events-none" />

            {/* Top Badges */}
            <div className="relative z-10 flex items-center justify-between">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-[9px] font-bold">
                <span>{item.badgeIcon}</span>
                <span>{item.badge}</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-[9px] font-semibold">
                <Video className="w-2.5 h-2.5" />
                <span>{item.videoDuration || '0:24'}</span>
              </span>
            </div>

            {/* Center Play Button */}
            <div className="relative z-10 self-center">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/30 backdrop-blur-md border border-white/40 text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-white/40 transition-all">
                <Pause className="w-3.5 h-3.5 fill-current" />
              </div>
            </div>

            {/* Bottom Title, Progress bar & Audio Icon */}
            <div className="relative z-10 space-y-1">
              <h3 className="text-white font-extrabold text-[11px] sm:text-xs leading-tight drop-shadow-sm truncate">
                {item.title}
              </h3>
              <div className="flex items-center justify-between gap-2 pt-0.5">
                <div className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                  <div className="w-2/5 h-full bg-[#A855F7] rounded-full" />
                </div>
                <Volume2 className="w-3 h-3 text-white/80 flex-shrink-0" />
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <AppShell>
      <div className="w-full space-y-5 sm:space-y-6">
        
        {/* ── 1. PAGE HEADER: Title & Subtitle ───────────────────── */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#141724] tracking-tight leading-tight">
            Explore
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 font-normal mt-1 leading-relaxed">
            <span className="hidden lg:inline">
              Connect with people who are building, learning and exploring meaningful things.
            </span>
            <span className="lg:hidden">
              Discover real journeys from people who are building, learning and exploring.
            </span>
          </p>
        </div>

        {/* ── 2. ACTIVE SEARCH INDICATOR (When query active) ──────── */}
        {searchQuery.trim() !== '' && (
          <div className="flex items-center justify-between gap-2 bg-indigo-50/70 border border-indigo-100 rounded-2xl px-3.5 py-2">
            <div className="flex items-center gap-2 text-xs text-[#141724]">
              <Search className="w-3.5 h-3.5 text-[#6258DB]" />
              <span>
                Search results for: <strong className="text-[#6258DB]">&ldquo;{searchQuery}&rdquo;</strong>
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-xs font-bold text-gray-500 hover:text-black flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3 h-3" />
              <span>Clear</span>
            </button>
          </div>
        )}

        {/* ── 3. FILTER PILLS ROW + FILTERS BUTTON (Direct Match to Reference UI) ── */}
        <div className="flex items-center justify-between gap-1.5 -mx-3 sm:-mx-5 lg:mx-0 px-1 sm:px-1.5">
          {/* Scrollable Category Pills with full rounded pill radius */}
          <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto pb-1 scrollbar-none flex-1">
            {CATEGORIES.map((cat) => {
              const isActive = activeTab === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveTab(cat.id)}
                  className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs transition-all cursor-pointer select-none active:scale-95 ${
                    isActive
                      ? 'bg-[#141724] text-white shadow-xs font-bold'
                      : 'bg-gray-100 hover:bg-gray-200/80 text-gray-700 font-semibold hover:text-[#141724]'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Filter Button on Far Right */}
          <button
            type="button"
            onClick={() => setIsFilterModalOpen(true)}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200/80 text-gray-700 hover:text-[#141724] transition-all cursor-pointer shadow-2xs flex-shrink-0 active:scale-95 flex items-center justify-center"
            title="Filters"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 stroke-[2]" />
          </button>
        </div>

        {/* ── 4A. MOBILE & TABLET EDITORIAL MASONRY ── */}
        <div className="block lg:hidden -mx-3 sm:-mx-5 lg:mx-0 px-1 sm:px-1.5">
          {isLoading ? (
            <div className="py-12 bg-white rounded-3xl border border-black/[0.04] shadow-xs">
              <AestheticLoader
                title="Exploring community journeys..."
                subtitle="Loading initial 30 milestones from builders and learners ahead of you."
              />
            </div>
          ) : col1Items.length > 0 || col2Items.length > 0 ? (
            <div className="grid grid-cols-2 gap-2 sm:gap-2.5 items-start">
              {/* Left Column */}
              <div className="flex flex-col gap-2 sm:gap-2.5 min-w-0">
                {col1Items.map((item) => renderMobileCard(item))}
              </div>
              {/* Right Column */}
              <div className="flex flex-col gap-2 sm:gap-2.5 min-w-0">
                {col2Items.map((item) => renderMobileCard(item))}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-white rounded-[20px] border border-black/[0.08] shadow-2xs">
              <div className="w-10 h-10 rounded-full bg-purple-50 text-[#6258DB] flex items-center justify-center mx-auto mb-2 text-lg">
                🌱
              </div>
              <p className="text-xs font-bold text-[#141724]">No journey updates found</p>
              <p className="text-[11px] text-gray-500 mt-0.5">Be the first to share your milestone.</p>
              <div className="mt-3 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => router.push('/updates/new')}
                  className="px-3.5 py-1.5 rounded-full bg-[#6258DB] text-white text-xs font-bold cursor-pointer hover:bg-[#5246D2] transition-colors"
                >
                  Share Milestone +
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setActiveTab('for-you');
                    setSelectedTagFilter('all');
                  }}
                  className="px-3.5 py-1.5 rounded-full bg-gray-100 text-gray-700 text-xs font-bold cursor-pointer"
                >
                  Reset
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── 4B. DESKTOP CARDS GRID (Active on Desktop >= lg) ── */}
        {isLoading ? (
          <div className="hidden lg:block py-16 bg-white rounded-3xl border border-black/[0.04] shadow-xs">
            <AestheticLoader
              title="Exploring community journeys..."
              subtitle="Loading initial 30 milestones from builders and learners ahead of you."
            />
          </div>
        ) : filteredCards.length > 0 ? (
          <div className="hidden lg:grid lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3">
            {filteredCards.map((card) => {
              const isFollowed = Boolean(
                followedCards[card.id] || (card.authorId && followedCards[card.authorId])
              );
              const isOwnCard = Boolean(
                currentUser?.id &&
                  (card.authorId === currentUser.id ||
                    (currentUser.username &&
                      card.authorUsername.toLowerCase() === currentUser.username.toLowerCase()))
              );

              const handleCardClick = () => {
                if (card.id && !card.id.startsWith('e-')) {
                  router.push(`/updates/${card.id}`);
                } else {
                  router.push(`/profile/${card.authorUsername}`);
                }
              };

              return (
                <div
                  key={card.id}
                  onClick={handleCardClick}
                  className="bg-white rounded-xl sm:rounded-2xl border border-black/[0.06] shadow-[0_10px_28px_-6px_rgba(98,88,219,0.15),0_4px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_18px_36px_-6px_rgba(98,88,219,0.24)] transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer group select-none relative"
                >
                  
                  {/* ── Top Half: Hero Image with Floating Badge & Serif Overlay (Tall aspect ratio) ── */}
                  <div className="relative h-80 sm:h-[370px] xl:h-[400px] w-full overflow-hidden bg-slate-900 flex-shrink-0 rounded-t-xl sm:rounded-t-2xl">
                    {/* Hero Image */}
                    <img
                      src={card.bannerUrl}
                      alt={card.titleMain}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />

                    {/* Floating Top-Right Category Badge */}
                    <div className="absolute top-3.5 right-3.5 bg-[#181528]/75 backdrop-blur-md text-white text-[11px] font-semibold px-3 py-1 rounded-full shadow-sm flex items-center gap-1.5 border border-white/20">
                      <span>{card.badgeIcon}</span>
                      <span>{card.badge}</span>
                    </div>

                    {/* Gradient shade over bottom of image */}
                    <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/85 via-black/45 to-transparent pointer-events-none" />

                    {/* Bottom-Left Overlaid Title & Neon Wave */}
                    <div className="absolute bottom-3.5 left-4 right-4 z-10">
                      <span className="block font-serif italic text-lg sm:text-xl text-white/95 font-normal leading-tight drop-shadow-md">
                        {card.titleLead}
                      </span>
                      
                      <div className="flex items-center gap-2 mt-0.5">
                        <h2 className="font-serif italic font-bold text-2xl sm:text-[27px] text-white leading-tight drop-shadow-md">
                          {card.titleMain}
                        </h2>

                        {/* Animated Equalizer soundwave bars */}
                        <div className="inline-flex items-end gap-[2px] h-4 mb-1">
                          <span className="w-[2.5px] h-2 bg-white/90 rounded-full animate-pulse" />
                          <span className="w-[2.5px] h-3.5 bg-white/90 rounded-full" />
                          <span className="w-[2.5px] h-2.5 bg-white/90 rounded-full" />
                          <span className="w-[2.5px] h-4 bg-white/90 rounded-full" />
                          <span className="w-[2.5px] h-1.5 bg-white/90 rounded-full" />
                        </div>
                      </div>

                      {/* Elegant Flowing Neon Wave Line */}
                      <svg viewBox="0 0 200 16" className="w-36 h-2.5 mt-1" fill="none">
                        <path
                          d="M2 10 Q 40 18, 90 8 T 198 6"
                          stroke="url(#neon-wave)"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                        <defs>
                          <linearGradient id="neon-wave" x1="0" y1="0" x2="200" y2="0" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#6258DB" />
                            <stop offset="0.5" stopColor="#A855F7" />
                            <stop offset="1" stopColor="#EC4899" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>

                  </div>

                  {/* ── Bottom Half: Crisp White Content Section ── */}
                  <div className="p-4 sm:p-5 pt-3.5 flex-1 flex flex-col justify-between bg-white">
                    
                    {/* Row 1: Circular Avatar + Name + Soft Lavender Follow Button */}
                    <div className="flex items-center justify-between gap-3">
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/profile/${card.authorUsername}`);
                        }}
                        className="flex items-center gap-2.5 min-w-0 cursor-pointer hover:opacity-80 transition-opacity"
                      >
                        <img
                          src={card.authorAvatar}
                          alt={card.authorName}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-100 flex-shrink-0 shadow-xs"
                        />
                        <span className="font-extrabold text-sm sm:text-[15px] text-[#141724] truncate tracking-tight hover:underline">
                          {card.authorName}
                        </span>
                      </div>

                      {!isOwnCard && (
                        <button
                          type="button"
                          onClick={(e) => handleToggleFollow(e, card)}
                          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer flex-shrink-0 ${
                            isFollowed
                              ? 'bg-[#6258DB] text-white hover:bg-[#5246D2]'
                              : 'bg-[#F0EFFE] text-[#6258DB] hover:bg-[#E4E1FE]'
                          }`}
                        >
                          <UserPlus className="w-3.5 h-3.5 stroke-[2.2]" />
                          <span>{isFollowed ? 'Following' : 'Follow +'}</span>
                        </button>
                      )}
                    </div>

                    {/* Row 2: Purple Accent Bar + Two-Line Heading */}
                    <div className="flex items-stretch gap-2.5 my-3.5 pt-3 border-t border-gray-100/90">
                      <div className="w-1 bg-[#6258DB] rounded-full flex-shrink-0 min-h-[36px]" />
                      <p className="text-xs sm:text-[13px] font-semibold text-[#141724] leading-relaxed line-clamp-2">
                        {card.heading} <span className="inline-block ml-0.5">{card.emoji}</span>
                      </p>
                    </div>

                    {/* Row 3: Full-Width Prominent Soft Lavender Action Pill */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCardClick();
                      }}
                      className="w-full py-2.5 px-4 rounded-full bg-[#F0EFFE] hover:bg-[#6258DB] text-[#6258DB] hover:text-white font-extrabold text-xs sm:text-[13px] flex items-center justify-center gap-1.5 transition-all shadow-xs group/btn cursor-pointer active:scale-98"
                    >
                      <span className="truncate">{card.actionLabel}</span>
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform flex-shrink-0" />
                    </button>

                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div className="hidden lg:block p-12 text-center bg-white rounded-3xl border border-gray-100 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-purple-50 text-[#6258DB] flex items-center justify-center mx-auto mb-3 text-xl">
              🌱
            </div>
            <p className="text-base font-bold text-[#141724]">No journey updates found</p>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              Be the first to share an inspiring milestone in this category with the community!
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => router.push('/updates/new')}
                className="px-4 py-2 rounded-full bg-[#6258DB] text-white text-xs font-bold hover:bg-[#5246D2] transition-colors cursor-pointer"
              >
                Share a Milestone +
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setActiveTab('for-you');
                  setSelectedTagFilter('all');
                }}
                className="px-4 py-2 rounded-full bg-gray-100 text-gray-700 hover:text-black text-xs font-bold cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          </div>
        )}

        {/* ── 5. INFINITE SCROLL SENTINEL & LOADING MORE ───────── */}
        <div ref={sentinelRef} className="py-8 flex flex-col items-center justify-center text-center">
          {isLoadingMore && (
            <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
              <div className="w-4 h-4 rounded-full border-2 border-[#6258DB] border-t-transparent animate-spin" />
              <span>Fetching more journey updates...</span>
            </div>
          )}
          {!hasMore && !isLoading && (liveCards.length > 0 || liveStories.length > 0) && (
            <p className="text-xs text-gray-400 font-medium">
              You&apos;ve reached the end of current journeys ✨
            </p>
          )}
        </div>

      </div>

      {/* ── Filter Modal ───────────────────────────────────────── */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setIsFilterModalOpen(false)}
          />
          <div className="relative bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 max-w-sm w-full z-10 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#141724]">Filter Explore</h3>
              <button
                type="button"
                onClick={() => setIsFilterModalOpen(false)}
                className="p-1 text-gray-400 hover:text-black transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-2">
                Popular Tags
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'all',
                  'Startup',
                  'MVP',
                  'Customer Research',
                  'Music',
                  'Acoustic',
                  'Photography',
                  'GRE',
                  'Running',
                  'Product Strategy',
                  'Wellness',
                  'Art',
                ].map((tag) => {
                  const isSelected = selectedTagFilter.toLowerCase() === tag.toLowerCase();
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setSelectedTagFilter(tag)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[#141724] text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      {tag === 'all' ? 'All Tags' : tag}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  setSelectedTagFilter('all');
                  setIsFilterModalOpen(false);
                }}
                className="px-3.5 py-1.5 text-xs text-gray-500 font-semibold hover:bg-gray-100 rounded-full cursor-pointer"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setIsFilterModalOpen(false)}
                className="px-4 py-1.5 bg-[#6258DB] text-white text-xs font-bold rounded-full shadow-sm cursor-pointer"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

    </AppShell>
  );
}
