'use client';
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import AppShell from '@/components/shared/AppShell';
import JourneyPostCard from '@/components/feed/JourneyPostCard';
import { useApp } from '@/lib/state/AppContext';
import { searchApi, socialApi } from '@/lib/api/client';
import type {
  SearchPersonResult,
  SearchJourneyResult,
  UnifiedSearchResponse,
  SearchSuggestionsResponse,
  FeedPost,
} from '@/lib/api/types';
import type { JourneyUpdate } from '@/types';
import {
  Search,
  X,
  Clock,
  Sparkles,
  TrendingUp,
  Users,
  Rocket,
  FileText,
  MapPin,
  Check,
  Plus,
  UserPlus,
  ChevronRight,
  Filter,
  ArrowUpDown,
  Target,
  Layers,
  ArrowRight,
  Compass,
} from 'lucide-react';

// ── Search Entity Tab Definition ────────────────────────────────────
type SearchTab = 'all' | 'people' | 'journeys' | 'posts';

const CATEGORIES = [
  'All',
  'Building',
  'Learning',
  'Career',
  'Creativity',
  'Fitness',
  'Lifestyle',
];

const CATEGORY_ICONS: Record<string, string> = {
  Building: '🚀',
  Learning: '📚',
  Career: '💼',
  Creativity: '🎨',
  Fitness: '⚡',
  Lifestyle: '🌿',
};

// ── Helper: Map FeedPost to JourneyUpdate for JourneyPostCard ───────
function mapFeedPostToJourneyUpdate(p: FeedPost): JourneyUpdate {
  return {
    id: p.id,
    authorId: p.author_id,
    author: {
      id: p.author?.id || p.author_id,
      username: p.author?.username || 'founder',
      name: p.author?.name || 'Anonymous Founder',
      avatar: p.author?.avatar_initials || 'GM',
      avatarImage: p.author?.avatar_image || undefined,
      avatarColor: p.author?.avatar_color || 'bg-amber-100 text-amber-800',
      role: p.author?.role_title || undefined,
      role_title: p.author?.role_title || undefined,
      location: p.author?.location || undefined,
    },
    headline: p.headline || undefined,
    journeyTag: p.journey_tag || undefined,
    journey_tag: p.journey_tag || undefined,
    content: p.content,
    category: p.category,
    createdAt: p.created_at,
    created_at: p.created_at,
    likes: p.is_fueled_by_me ? [p.author_id] : [],
    saves: p.is_saved_by_me ? [p.author_id] : [],
    comments: [],
    prompt_question_1: p.prompt_question_1,
    prompt_question_2: p.prompt_question_2,
    fuels_count: p.fuels_count,
    saves_count: p.saves_count,
    comments_count: p.comments_count,
    is_fueled_by_me: p.is_fueled_by_me,
    is_saved_by_me: p.is_saved_by_me,
    media: (p.media || []).map((m) => ({
      id: m.id,
      type: (m.media_type as 'image' | 'video' | 'file') || 'image',
      url: m.url,
      thumbnail: m.thumbnail_url || undefined,
      orientation: m.orientation,
    })),
  };
}

// ── Local Storage Helpers for Recent Searches ───────────────────────
const RECENT_SEARCHES_KEY = 'gm_recent_searches';

function getStoredRecentSearches(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredRecentSearches(searches: string[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches.slice(0, 10)));
  } catch {}
}

export default function UnifiedSearchView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser, isAuthenticated, addToast } = useApp();

  // Read URL query params
  const initialQuery = searchParams ? searchParams.get('q') || '' : '';
  const initialTab = (searchParams?.get('type') as SearchTab) || 'all';
  const initialCategory = searchParams?.get('category') || 'All';
  const initialSort = (searchParams?.get('sort') as 'relevant' | 'latest') || 'relevant';

  // State
  const [queryInput, setQueryInput] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<SearchTab>(initialTab);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedSort, setSelectedSort] = useState<'relevant' | 'latest'>(initialSort);

  // Search Results & Loading
  const [searchResults, setSearchResults] = useState<UnifiedSearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Suggestions & Recent Searches
  const [suggestions, setSuggestions] = useState<SearchSuggestionsResponse | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Follow / Connection Local Overrides for instant responsive feedback
  const [followedUserIds, setFollowedUserIds] = useState<Record<string, boolean>>({});
  const [connectedUserIds, setConnectedUserIds] = useState<Record<string, string>>({});
  const [isActionPending, setIsActionPending] = useState<Record<string, boolean>>({});

  // Debounce ref
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load Recent Searches and Dynamic Suggestions on mount
  useEffect(() => {
    setRecentSearches(getStoredRecentSearches());
    searchApi
      .getSuggestions()
      .then((data) => setSuggestions(data))
      .catch(() => {});
  }, []);

  // Sync state if URL query changes externally
  useEffect(() => {
    if (searchParams) {
      const q = searchParams.get('q') || '';
      const t = (searchParams.get('type') as SearchTab) || 'all';
      const cat = searchParams.get('category') || 'All';
      const s = (searchParams.get('sort') as 'relevant' | 'latest') || 'relevant';

      setQueryInput(q);
      setActiveTab(t);
      setSelectedCategory(cat);
      setSelectedSort(s);
    }
  }, [searchParams]);

  // Execute Search Function
  const executeSearch = useCallback(
    async (
      q: string,
      tab: SearchTab,
      category: string,
      sort: 'relevant' | 'latest'
    ) => {
      const trimmed = q.trim();
      if (!trimmed) {
        setSearchResults(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setSearchError(null);

      // Save to recent searches
      setRecentSearches((prev) => {
        const updated = [trimmed, ...prev.filter((item) => item.toLowerCase() !== trimmed.toLowerCase())].slice(0, 8);
        saveStoredRecentSearches(updated);
        return updated;
      });

      try {
        const res = await searchApi.search({
          q: trimmed,
          type: tab,
          category: category !== 'All' ? category : undefined,
          sort: sort,
          limit: tab === 'all' ? 20 : 30,
        });
        setSearchResults(res);
      } catch (err: any) {
        setSearchError(err?.message || 'Failed to fetch search results. Please try again.');
        setSearchResults(null);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Synchronize URL and trigger search
  const updateUrlAndSearch = useCallback(
    (
      newQuery: string,
      newTab: SearchTab,
      newCategory: string,
      newSort: 'relevant' | 'latest'
    ) => {
      const params = new URLSearchParams();
      if (newQuery.trim()) params.set('q', newQuery.trim());
      if (newTab !== 'all') params.set('type', newTab);
      if (newCategory !== 'All') params.set('category', newCategory);
      if (newSort !== 'relevant') params.set('sort', newSort);

      const searchStr = params.toString();
      const newUrl = searchStr ? `/search?${searchStr}` : '/search';
      router.replace(newUrl, { scroll: false });

      executeSearch(newQuery, newTab, newCategory, newSort);
    },
    [router, executeSearch]
  );

  // Debounced input change
  const handleInputChange = (val: string) => {
    setQueryInput(val);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!val.trim()) {
      setSearchResults(null);
      router.replace('/search', { scroll: false });
      return;
    }

    debounceTimerRef.current = setTimeout(() => {
      updateUrlAndSearch(val, activeTab, selectedCategory, selectedSort);
    }, 300);
  };

  // Immediate Enter key submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    updateUrlAndSearch(queryInput, activeTab, selectedCategory, selectedSort);
  };

  // Switch Tab
  const handleTabChange = (tab: SearchTab) => {
    setActiveTab(tab);
    updateUrlAndSearch(queryInput, tab, selectedCategory, selectedSort);
  };

  // Switch Category Filter
  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    updateUrlAndSearch(queryInput, activeTab, cat, selectedSort);
  };

  // Switch Sort Order
  const handleSortChange = (sort: 'relevant' | 'latest') => {
    setSelectedSort(sort);
    updateUrlAndSearch(queryInput, activeTab, selectedCategory, sort);
  };

  // Clear Search Input
  const handleClearSearch = () => {
    setQueryInput('');
    setSearchResults(null);
    router.replace('/search', { scroll: false });
  };

  // Quick Query Click (from Recent or Suggested)
  const handleQuickQuery = (term: string) => {
    setQueryInput(term);
    updateUrlAndSearch(term, activeTab, selectedCategory, selectedSort);
  };

  // Delete Individual Recent Search
  const handleDeleteRecent = (term: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = recentSearches.filter((item) => item !== term);
    setRecentSearches(updated);
    saveStoredRecentSearches(updated);
  };

  // Clear All Recent Searches
  const handleClearAllRecent = () => {
    setRecentSearches([]);
    saveStoredRecentSearches([]);
  };

  // ── Follow User Action ──────────────────────────────────────────
  const handleToggleFollow = async (person: SearchPersonResult, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      addToast('Please log in or sign up to follow creators.', 'info');
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }

    const currentFollowState =
      followedUserIds[person.id] !== undefined ? followedUserIds[person.id] : person.is_following;
    const nextState = !currentFollowState;

    // Optimistic update
    setFollowedUserIds((prev) => ({ ...prev, [person.id]: nextState }));
    setIsActionPending((prev) => ({ ...prev, [person.id]: true }));

    try {
      if (nextState) {
        await socialApi.followUser(person.id);
        addToast(`Following @${person.username}`, 'success');
      } else {
        await socialApi.unfollowUser(person.id);
        addToast(`Unfollowed @${person.username}`, 'info');
      }
    } catch (err: any) {
      // Revert optimistic state
      setFollowedUserIds((prev) => ({ ...prev, [person.id]: currentFollowState }));
      addToast(err?.message || 'Unable to update follow status. Please try again.', 'danger');
    } finally {
      setIsActionPending((prev) => ({ ...prev, [person.id]: false }));
    }
  };

  // ── Connect User Action ─────────────────────────────────────────
  const handleSendConnection = async (person: SearchPersonResult, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      addToast('Please log in or sign up to connect with founders.', 'info');
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }

    setIsActionPending((prev) => ({ ...prev, [`conn-${person.id}`]: true }));
    try {
      const res = await socialApi.sendConnectionRequest(person.id);
      setConnectedUserIds((prev) => ({ ...prev, [person.id]: res.status }));
      addToast(`Connection request sent to ${person.name}!`, 'success');
    } catch (err: any) {
      addToast(err?.message || 'Failed to send connection request.', 'danger');
    } finally {
      setIsActionPending((prev) => ({ ...prev, [`conn-${person.id}`]: false }));
    }
  };

  // Computed tab counts
  const counts = useMemo(() => {
    if (!searchResults) return { all: 0, people: 0, journeys: 0, posts: 0 };
    return {
      all: searchResults.total_results || 0,
      people: searchResults.total_people || searchResults.people.length || 0,
      journeys: searchResults.total_journeys || searchResults.journeys.length || 0,
      posts: searchResults.total_posts || searchResults.posts.length || 0,
    };
  }, [searchResults]);

  const hasSearched = Boolean(queryInput.trim());

  return (
    <AppShell>
      <div className="max-w-[1000px] mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-5">
        
        {/* ── 1. Page Header & Search Bar ─────────────────────────── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-[#141724] tracking-tight">
                Search
              </h1>
              <p className="text-xs sm:text-[13px] text-gray-500 mt-0.5">
                Discover people, public journeys, milestones, and discussions across Growing Moon.
              </p>
            </div>
          </div>

          {/* Search Input Container */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <div className="relative flex items-center">
              <Search className="w-5 h-5 text-gray-400 absolute left-4 pointer-events-none" />
              <input
                type="text"
                value={queryInput}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="Search people, journeys, posts..."
                autoFocus
                className="w-full pl-11 pr-11 py-3 sm:py-3.5 bg-white border border-gray-200/90 rounded-2xl text-xs sm:text-sm text-[#141724] placeholder:text-gray-400 focus:outline-none focus:border-[#6258DB] focus:ring-3 focus:ring-[#6258DB]/15 transition-all shadow-xs font-medium"
              />
              {queryInput && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3.5 p-1 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                  title="Clear search"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </form>
        </div>

        {/* ── 2. Four Category Tabs ──────────────────────────────── */}
        {hasSearched && (
          <div className="border-b border-gray-200/80">
            <div className="flex items-center gap-6 sm:gap-8 overflow-x-auto scrollbar-none pb-0.5">
              {(
                [
                  { id: 'all', label: 'All', count: counts.all },
                  { id: 'people', label: 'People', count: counts.people },
                  { id: 'journeys', label: 'Journeys', count: counts.journeys },
                  { id: 'posts', label: 'Posts', count: counts.posts },
                ] as const
              ).map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleTabChange(tab.id)}
                    className={`pb-3 text-xs sm:text-sm font-semibold transition-all relative cursor-pointer flex items-center gap-1.5 whitespace-nowrap select-none ${
                      isActive
                        ? 'text-[#141724] font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#6258DB] after:rounded-full'
                        : 'text-gray-500 hover:text-[#141724]'
                    }`}
                  >
                    <span>{tab.label}</span>
                    {searchResults && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition-colors ${
                          isActive
                            ? 'bg-[#EEEDFE] text-[#6258DB]'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── 3. Secondary Filter Pills (Categories & Sort) ───────── */}
        {hasSearched && (activeTab === 'journeys' || activeTab === 'posts') && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 -mx-1 px-1">
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleCategoryChange(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap active:scale-95 flex items-center gap-1 shadow-2xs ${
                      isSelected
                        ? 'bg-[#6258DB] text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200/80'
                    }`}
                  >
                    {CATEGORY_ICONS[cat] && <span>{CATEGORY_ICONS[cat]}</span>}
                    <span>{cat}</span>
                  </button>
                );
              })}
            </div>

            {/* Sort Toggle (Relevant vs Latest) for Posts */}
            {activeTab === 'posts' && (
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-200/80 self-start sm:self-auto flex-shrink-0 shadow-2xs text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => handleSortChange('relevant')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    selectedSort === 'relevant'
                      ? 'bg-[#6258DB] text-white shadow-2xs'
                      : 'text-gray-600 hover:text-black'
                  }`}
                >
                  Most Relevant
                </button>
                <button
                  type="button"
                  onClick={() => handleSortChange('latest')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    selectedSort === 'latest'
                      ? 'bg-[#6258DB] text-white shadow-2xs'
                      : 'text-gray-600 hover:text-black'
                  }`}
                >
                  Latest
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── 4. Main Body: Pre-Search Discovery vs Results ───────── */}
        {!hasSearched ? (
          /* PRE-SEARCH DISCOVERY STATE */
          <div className="space-y-6 pt-2">
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-black/[0.04] shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <h3 className="text-xs sm:text-sm font-bold text-[#141724]">
                      Recent Searches
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearAllRecent}
                    className="text-xs text-[#6258DB] hover:underline font-semibold cursor-pointer"
                  >
                    Clear all
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {recentSearches.map((term, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleQuickQuery(term)}
                      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gray-50 hover:bg-[#EEEDFE] border border-gray-200/70 hover:border-[#6258DB]/30 text-xs text-gray-700 hover:text-[#6258DB] font-medium transition-all cursor-pointer group"
                    >
                      <span>{term}</span>
                      <X
                        className="w-3 h-3 text-gray-400 group-hover:text-[#6258DB] hover:text-rose-500 transition-colors"
                        onClick={(e) => handleDeleteRecent(term, e)}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Suggested Searches */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-black/[0.04] shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#6258DB]" />
                <h3 className="text-xs sm:text-sm font-bold text-[#141724]">
                  Suggested Searches
                </h3>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {(
                  suggestions?.suggested_searches || [
                    'Building in AI',
                    'People in SaaS',
                    'Milestone 1',
                    'Shipped first MVP',
                    'Next.js Full Stack',
                    'Looking for co-founder',
                  ]
                ).map((term, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleQuickQuery(term)}
                    className="px-3.5 py-2 rounded-full bg-[#FAF9FF] hover:bg-[#EEEDFE] text-[#6258DB] text-xs font-semibold border border-[#E4DCFD] transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                  >
                    <Search className="w-3 h-3" />
                    <span>{term}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Browse by Categories */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-black/[0.04] shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs sm:text-sm font-bold text-[#141724]">
                  Browse by Category
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                {(
                  suggestions?.categories || [
                    'Building',
                    'Learning',
                    'Career',
                    'Creativity',
                    'Fitness',
                    'Lifestyle',
                  ]
                ).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setQueryInput(cat);
                      updateUrlAndSearch(cat, 'all', cat, 'relevant');
                    }}
                    className="p-3.5 rounded-2xl bg-gray-50/80 hover:bg-[#FAF9FF] border border-gray-100 hover:border-[#6258DB]/20 text-left transition-all cursor-pointer group flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{CATEGORY_ICONS[cat] || '✨'}</span>
                      <span className="text-xs font-bold text-[#141724] group-hover:text-[#6258DB]">
                        {cat}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#6258DB] group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            </div>

            {/* Popular Tags */}
            {suggestions?.popular_tags && suggestions.popular_tags.length > 0 && (
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-black/[0.04] shadow-xs space-y-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-amber-500" />
                  <h3 className="text-xs sm:text-sm font-bold text-[#141724]">
                    Popular Tags
                  </h3>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {suggestions.popular_tags.map((tag, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleQuickQuery(tag)}
                      className="px-3 py-1.5 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-medium border border-gray-200 transition-all cursor-pointer"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : isLoading ? (
          /* SKELETON LOADING STATE */
          <div className="space-y-4 pt-2">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-black/[0.04] shadow-xs space-y-3 animate-pulse"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gray-200" />
                  <div className="space-y-1.5 flex-1">
                    <div className="w-1/3 h-4 bg-gray-200 rounded-md" />
                    <div className="w-1/4 h-3 bg-gray-100 rounded-md" />
                  </div>
                </div>
                <div className="w-3/4 h-3.5 bg-gray-100 rounded-md" />
                <div className="w-1/2 h-3 bg-gray-100 rounded-md" />
              </div>
            ))}
          </div>
        ) : searchError ? (
          /* ERROR STATE */
          <div className="py-12 text-center bg-white rounded-3xl border border-rose-100 p-8 shadow-xs">
            <p className="text-xs font-semibold text-rose-600">{searchError}</p>
            <button
              type="button"
              onClick={() => executeSearch(queryInput, activeTab, selectedCategory, selectedSort)}
              className="mt-3 px-4 py-2 rounded-xl bg-[#6258DB] text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              Retry Search
            </button>
          </div>
        ) : (
          /* ── 5. SEARCH RESULTS SECTIONS ─────────────────────────── */
          <div className="space-y-6 pt-1">
            
            {/* ── TAB 1: ALL TAB (Aggregated Top 3 for Each Entity) ──── */}
            {activeTab === 'all' && (
              <div className="space-y-8">
                {counts.all === 0 ? (
                  /* Empty state when query has 0 results across all entities */
                  <div className="bg-white rounded-3xl p-10 text-center border border-black/[0.04] shadow-xs space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#6258DB] flex items-center justify-center mx-auto">
                      <Search className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-[#141724]">
                      No results found for &ldquo;{queryInput}&rdquo;
                    </h3>
                    <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
                      Try searching with different keywords, check for spelling errors, or explore popular topics below.
                    </p>
                    <div className="pt-2 flex items-center justify-center gap-2 flex-wrap">
                      {['Building', 'Learning', 'Product', 'Founder'].map((k) => (
                        <button
                          key={k}
                          type="button"
                          onClick={() => handleQuickQuery(k)}
                          className="px-3 py-1 rounded-full bg-gray-100 hover:bg-[#EEEDFE] hover:text-[#6258DB] text-xs font-semibold transition-colors cursor-pointer"
                        >
                          {k}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Section 1: People (Top 3) */}
                    {searchResults && searchResults.people.length > 0 && (
                      <div className="space-y-3.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-[#6258DB]" />
                            <h2 className="text-sm font-extrabold text-[#141724] tracking-tight">
                              People ({searchResults.total_people})
                            </h2>
                          </div>
                          {searchResults.total_people > 3 && (
                            <button
                              type="button"
                              onClick={() => handleTabChange('people')}
                              className="text-xs font-bold text-[#6258DB] hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <span>See all {searchResults.total_people}</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                          {searchResults.people.slice(0, 3).map((person) => (
                            <PersonCard
                              key={person.id}
                              person={person}
                              isFollowing={
                                followedUserIds[person.id] !== undefined
                                  ? followedUserIds[person.id]
                                  : person.is_following
                              }
                              connectionStatus={
                                connectedUserIds[person.id] || person.connection_status || 'none'
                              }
                              isActionPending={
                                !!isActionPending[person.id] || !!isActionPending[`conn-${person.id}`]
                              }
                              onToggleFollow={(e) => handleToggleFollow(person, e)}
                              onSendConnection={(e) => handleSendConnection(person, e)}
                              isCurrentUser={currentUser?.id === person.id}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Section 2: Journeys (Top 3) */}
                    {searchResults && searchResults.journeys.length > 0 && (
                      <div className="space-y-3.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Rocket className="w-4 h-4 text-emerald-600" />
                            <h2 className="text-sm font-extrabold text-[#141724] tracking-tight">
                              Journeys ({searchResults.total_journeys})
                            </h2>
                          </div>
                          {searchResults.total_journeys > 3 && (
                            <button
                              type="button"
                              onClick={() => handleTabChange('journeys')}
                              className="text-xs font-bold text-[#6258DB] hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <span>See all {searchResults.total_journeys}</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                          {searchResults.journeys.slice(0, 3).map((journey) => (
                            <JourneyResultCard key={journey.id} journey={journey} />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Section 3: Posts (Top 3) */}
                    {searchResults && searchResults.posts.length > 0 && (
                      <div className="space-y-3.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-indigo-600" />
                            <h2 className="text-sm font-extrabold text-[#141724] tracking-tight">
                              Posts ({searchResults.total_posts})
                            </h2>
                          </div>
                          {searchResults.total_posts > 3 && (
                            <button
                              type="button"
                              onClick={() => handleTabChange('posts')}
                              className="text-xs font-bold text-[#6258DB] hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <span>See all {searchResults.total_posts}</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        <div className="space-y-3">
                          {searchResults.posts.slice(0, 3).map((post) => (
                            <JourneyPostCard
                              key={post.id}
                              update={mapFeedPostToJourneyUpdate(post)}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* ── TAB 2: PEOPLE TAB (Full Grid) ──────────────────────── */}
            {activeTab === 'people' && (
              <div className="space-y-4">
                {searchResults && searchResults.people.length === 0 ? (
                  <div className="bg-white rounded-3xl p-10 text-center border border-black/[0.04] shadow-xs">
                    <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <h3 className="text-sm font-bold text-[#141724]">No people found</h3>
                    <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                      No community members matched &ldquo;{queryInput}&rdquo;. Try searching for names, roles, or skills.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {searchResults?.people.map((person) => (
                      <PersonCard
                        key={person.id}
                        person={person}
                        isFollowing={
                          followedUserIds[person.id] !== undefined
                            ? followedUserIds[person.id]
                            : person.is_following
                        }
                        connectionStatus={
                          connectedUserIds[person.id] || person.connection_status || 'none'
                        }
                        isActionPending={
                          !!isActionPending[person.id] || !!isActionPending[`conn-${person.id}`]
                        }
                        onToggleFollow={(e) => handleToggleFollow(person, e)}
                        onSendConnection={(e) => handleSendConnection(person, e)}
                        isCurrentUser={currentUser?.id === person.id}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── TAB 3: JOURNEYS TAB (Full Grid) ────────────────────── */}
            {activeTab === 'journeys' && (
              <div className="space-y-4">
                {searchResults && searchResults.journeys.length === 0 ? (
                  <div className="bg-white rounded-3xl p-10 text-center border border-black/[0.04] shadow-xs">
                    <Rocket className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <h3 className="text-sm font-bold text-[#141724]">No journeys found</h3>
                    <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                      No public journey passports matched &ldquo;{queryInput}&rdquo;. Try another topic or category filter.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {searchResults?.journeys.map((journey) => (
                      <JourneyResultCard key={journey.id} journey={journey} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── TAB 4: POSTS TAB (Feed Stream) ─────────────────────── */}
            {activeTab === 'posts' && (
              <div className="space-y-4">
                {searchResults && searchResults.posts.length === 0 ? (
                  <div className="bg-white rounded-3xl p-10 text-center border border-black/[0.04] shadow-xs">
                    <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <h3 className="text-sm font-bold text-[#141724]">No posts found</h3>
                    <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                      No journey updates matched &ldquo;{queryInput}&rdquo;. Try searching for different milestone keywords.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {searchResults?.posts.map((post) => (
                      <JourneyPostCard
                        key={post.id}
                        update={mapFeedPostToJourneyUpdate(post)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        )}

      </div>
    </AppShell>
  );
}

// ── SUB-COMPONENT: PERSON CARD ──────────────────────────────────────
function PersonCard({
  person,
  isFollowing,
  connectionStatus,
  isActionPending,
  onToggleFollow,
  onSendConnection,
  isCurrentUser,
}: {
  person: SearchPersonResult;
  isFollowing: boolean;
  connectionStatus: string;
  isActionPending: boolean;
  onToggleFollow: (e: React.MouseEvent) => void;
  onSendConnection: (e: React.MouseEvent) => void;
  isCurrentUser: boolean;
}) {
  return (
    <Link
      href={`/profile/${person.username}`}
      className="bg-white rounded-2xl p-4.5 border border-black/[0.04] shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer"
    >
      <div className="space-y-3">
        {/* Header: Avatar, Name, Username, Role */}
        <div className="flex items-start gap-3">
          {person.avatar_image ? (
            <img
              src={person.avatar_image}
              alt={person.name}
              className="w-12 h-12 rounded-full object-cover flex-shrink-0 ring-1 ring-black/5"
            />
          ) : (
            <div
              className={`w-12 h-12 rounded-full ${person.avatar_color || 'bg-indigo-100 text-[#6258DB]'} font-extrabold text-sm flex items-center justify-center flex-shrink-0 ring-1 ring-black/5`}
            >
              {person.avatar_initials || person.name.slice(0, 2).toUpperCase()}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h4 className="text-xs sm:text-sm font-bold text-[#141724] group-hover:text-[#6258DB] transition-colors truncate">
              {person.name}
            </h4>
            <p className="text-[11px] text-gray-400 font-medium truncate">
              @{person.username}
            </p>
            {person.role_title && (
              <span className="inline-block mt-0.5 text-[10px] font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full truncate max-w-[170px]">
                {person.role_title}
              </span>
            )}
          </div>
        </div>

        {/* Bio */}
        {person.bio && (
          <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
            {person.bio}
          </p>
        )}

        {/* Location & Current Focus */}
        <div className="space-y-1 text-[11px] text-gray-500">
          {person.location && (
            <div className="flex items-center gap-1.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <span className="truncate">{person.location}</span>
            </div>
          )}
          {person.current_focus_1 && (
            <div className="flex items-center gap-1.5 truncate text-[#6258DB] font-medium">
              <Target className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">Focus: {person.current_focus_1}</span>
            </div>
          )}
        </div>

        {/* Interests Badges */}
        {person.interests && person.interests.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {person.interests.slice(0, 3).map((item, i) => (
              <span
                key={i}
                className="text-[10px] font-semibold text-[#6258DB] bg-[#EEEDFE] px-2 py-0.5 rounded-full"
              >
                {item}
              </span>
            ))}
            {person.interests.length > 3 && (
              <span className="text-[10px] text-gray-400 font-medium">
                +{person.interests.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Action Footer */}
      {!isCurrentUser && (
        <div className="pt-3.5 mt-3 border-t border-gray-100 flex items-center justify-between gap-2">
          {/* Follow / Following Button */}
          <button
            type="button"
            disabled={isActionPending}
            onClick={onToggleFollow}
            className={`flex-1 py-1.5 px-3 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 active:scale-95 ${
              isFollowing
                ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                : 'bg-[#6258DB] hover:bg-[#5246D2] text-white shadow-2xs'
            }`}
          >
            {isFollowing ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Following</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Follow</span>
              </>
            )}
          </button>

          {/* Connect Button */}
          {connectionStatus === 'connected' ? (
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1.5 rounded-full flex items-center gap-1">
              <Check className="w-3 h-3 stroke-[2.5]" />
              <span>Connected</span>
            </span>
          ) : connectionStatus === 'pending-sent' ? (
            <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-1.5 rounded-full">
              Requested
            </span>
          ) : (
            <button
              type="button"
              disabled={isActionPending}
              onClick={onSendConnection}
              className="py-1.5 px-3 rounded-full text-xs font-bold bg-[#FAF9FF] hover:bg-[#EEEDFE] text-[#6258DB] border border-[#E4DCFD] transition-all cursor-pointer flex items-center gap-1 active:scale-95"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Connect</span>
            </button>
          )}
        </div>
      )}
    </Link>
  );
}

// ── SUB-COMPONENT: JOURNEY RESULT CARD ──────────────────────────────
function JourneyResultCard({ journey }: { journey: SearchJourneyResult }) {
  const categoryIcon = CATEGORY_ICONS[journey.category] || '🚀';

  return (
    <Link
      href={`/passport/${journey.author.username}?journey=${encodeURIComponent(journey.title)}`}
      className="bg-white rounded-2xl p-4.5 border border-black/[0.04] shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer"
    >
      <div className="space-y-3">
        {/* Top: Category Pill & Update count */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-bold text-[#6258DB] bg-[#EEEDFE] px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <span>{categoryIcon}</span>
            <span>{journey.category}</span>
          </span>

          <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
            {journey.updates_count} {journey.updates_count === 1 ? 'update' : 'updates'}
          </span>
        </div>

        {/* Title */}
        <h4 className="text-sm font-bold text-[#141724] group-hover:text-[#6258DB] transition-colors line-clamp-2 leading-snug">
          {journey.title}
        </h4>

        {/* Current Goal */}
        {journey.current_goal && (
          <div className="flex items-start gap-1.5 text-xs text-gray-700 bg-gray-50 p-2 rounded-xl border border-gray-100">
            <Target className="w-3.5 h-3.5 text-[#6258DB] mt-0.5 flex-shrink-0" />
            <span className="line-clamp-2 font-medium">{journey.current_goal}</span>
          </div>
        )}

        {/* Short description */}
        {journey.short_text && (
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
            {journey.short_text}
          </p>
        )}
      </div>

      {/* Owner Info Footer */}
      <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          {journey.author.avatar_image ? (
            <img
              src={journey.author.avatar_image}
              alt={journey.author.name}
              className="w-6 h-6 rounded-full object-cover flex-shrink-0 ring-1 ring-black/5"
            />
          ) : (
            <div
              className={`w-6 h-6 rounded-full ${journey.author.avatar_color || 'bg-amber-100 text-amber-800'} text-[10px] font-bold flex items-center justify-center flex-shrink-0`}
            >
              {journey.author.avatar_initials || 'GM'}
            </div>
          )}
          <span className="text-xs font-semibold text-gray-700 truncate">
            {journey.author.name}
          </span>
        </div>

        <div className="flex items-center gap-1 text-[11px] font-bold text-[#6258DB] group-hover:translate-x-0.5 transition-transform">
          <span>View</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </Link>
  );
}
