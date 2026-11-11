'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AppShell from '@/components/shared/AppShell';
import EmptyState from '@/components/EmptyState';
import AestheticLoader from '@/components/shared/AestheticLoader';
import ActivityHistoryModal from '@/components/profile/ActivityHistoryModal';
import ReportModal from '@/components/moderation/ReportModal';
import CreateJourneyModal, { CreatedJourneyData } from '@/components/journey/CreateJourneyModal';
import QRCode from 'react-qr-code';
import { getFounderByUsername } from '@/lib/mock-data/founders';
import { useApp } from '@/lib/state/AppContext';
import { usersApi, socialApi, passportsApi } from '@/lib/api/client';
import type { UserPublicProfile, FeedPost } from '@/lib/api/types';
import {
  MapPin,
  Pencil,
  MoreHorizontal,
  Plus,
  ChevronRight,
  Sparkles,
  Rocket,
  Compass,
  X,
  Check,
  Activity,
  Flag,
  AlertCircle,
  RefreshCw,
  Flame,
  MessageSquare,
  Lock,
  QrCode,
  Copy,
  Calendar,
  Clock,
  ArrowRight,
} from 'lucide-react';

export type JourneyItem = {
  id: string;
  title: string;
  description: string;
  category: string;
  visibility: 'Public' | 'Private';
  startDate: string;
  fromDate: string;
  toDate: string;
  createdAtFormatted?: string;
  updatedAtFormatted?: string;
  updatesCount: number;
  latestPost?: {
    headline?: string;
    content: string;
    date: string;
    mediaThumbnail?: string;
    fuelsCount: number;
    commentsCount: number;
  };
  posts: FeedPost[];
  link: string;
};

const SUGGESTED_INTERESTS = [
  'AI Engineering',
  'SaaS',
  'Product Design',
  'Bootstrapping',
  'Next.js',
  'Writing',
  'Fitness',
  'Growth',
  'Startups',
  'Open Source',
];

const getStoredJourneys = (userId: string): CreatedJourneyData[] => {
  if (typeof window === 'undefined' || !userId) return [];
  try {
    const raw = localStorage.getItem(`gm_user_journeys_${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveStoredJourney = (userId: string, journey: CreatedJourneyData) => {
  if (typeof window === 'undefined' || !userId) return;
  try {
    const existing = getStoredJourneys(userId);
    const updated = [
      journey,
      ...existing.filter((j) => j.title.toLowerCase() !== journey.title.toLowerCase()),
    ];
    localStorage.setItem(`gm_user_journeys_${userId}`, JSON.stringify(updated));
  } catch {}
};

export default function FounderProfilePage() {
  const params = useParams();
  const router = useRouter();
  const {
    currentUser,
    isAuthenticated,
    updateUser,
    addToast,
    sendConnectionRequest,
    acceptConnectionRequest,
    removeConnection,
  } = useApp();

  const username = typeof params.username === 'string' ? params.username : '';
  const mockFounder = getFounderByUsername(username) || (username === 'you' || username === 'demo' ? currentUser : null);

  const [liveProfile, setLiveProfile] = useState<UserPublicProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Editable Profile Info state
  const [profileName, setProfileName] = useState('');
  const [profileLocation, setProfileLocation] = useState('');
  const [profileBio, setProfileBio] = useState('');

  // Extended Profile Details ("About", "I can help with", "I am figuring out", "I am open to", 3 Focus Items, Interests)
  const [aboutText, setAboutText] = useState('');
  const [canHelpWith, setCanHelpWith] = useState('');
  const [figuringOut, setFiguringOut] = useState('');
  const [openTo, setOpenTo] = useState('');
  const [focus1, setFocus1] = useState('');
  const [focus2, setFocus2] = useState('');
  const [focus3, setFocus3] = useState('');
  const [interests, setInterests] = useState<string[]>([]);

  // Modals state
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isEditAboutOpen, setIsEditAboutOpen] = useState(false);
  const [isEditInterestsOpen, setIsEditInterestsOpen] = useState(false);
  const [isNewJourneyOpen, setIsNewJourneyOpen] = useState(false);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isReportUserModalOpen, setIsReportUserModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [copiedQrLink, setCopiedQrLink] = useState(false);
  const [isAboutExpanded, setIsAboutExpanded] = useState(false);

  // Temporary state for editing About
  const [tempAbout, setTempAbout] = useState('');
  const [isSavingAbout, setIsSavingAbout] = useState(false);

  // Temporary state for editing Interests (strictly max 5)
  const [tempInterests, setTempInterests] = useState<string[]>([]);
  const [newInterestInput, setNewInterestInput] = useState('');
  const [interestsError, setInterestsError] = useState<string | null>(null);
  const [isSavingInterests, setIsSavingInterests] = useState(false);

  // Saving state for Edit Profile
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Journeys list - distinct journeys (not raw posts)
  const [journeysList, setJourneysList] = useState<JourneyItem[]>([]);
  const [rawPosts, setRawPosts] = useState<FeedPost[]>([]);

  // ── Helper: Build Distinct Journeys List (Database Backed) ──
  const buildJourneysList = async (
    userId: string,
    targetUsername: string,
    posts: FeedPost[]
  ) => {
    const journeyPostsMap = new Map<string, FeedPost[]>();
    posts.forEach((post) => {
      const tag = (post.journey_tag || '').trim();
      if (tag) {
        if (!journeyPostsMap.has(tag)) {
          journeyPostsMap.set(tag, []);
        }
        journeyPostsMap.get(tag)!.push(post);
      }
    });

    // 1. Fetch real journeys from database
    let dbPassports: any[] = [];
    try {
      dbPassports = await passportsApi.getUserPassports(targetUsername || userId);
    } catch {
      dbPassports = [];
    }

    // Fallback to local stored if database returned 0 and local has some
    const savedJourneys = getStoredJourneys(userId);
    const combinedMap = new Map<string, any>();

    // Index DB passports
    dbPassports.forEach((p) => {
      combinedMap.set(p.title.toLowerCase().trim(), p);
    });

    // Merge any locally created ones that might not be in DB yet
    savedJourneys.forEach((sj) => {
      const key = sj.title.toLowerCase().trim();
      if (!combinedMap.has(key)) {
        combinedMap.set(key, sj);
      }
    });

    const combined: JourneyItem[] = [];

    // 2. Add all stored/database journeys
    combinedMap.forEach((sj) => {
      const matchingPosts = posts
        .filter(
          (p) =>
            (p.passport_id && sj.id && p.passport_id === sj.id) ||
            (p.journey_tag && sj.title && p.journey_tag.trim().toLowerCase() === sj.title.trim().toLowerCase())
        )
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      let journeyPosts: FeedPost[] = [...matchingPosts];
      if (journeyPosts.length === 0 && sj.latest_update) {
        journeyPosts = [
          {
            id: sj.latest_update.id || `upd-${sj.id}`,
            author_id: userId,
            author: {
              id: userId,
              username: targetUsername,
              name: targetUsername,
              avatar_initials: (targetUsername || 'U').slice(0, 2).toUpperCase(),
            },
            passport_id: sj.id,
            headline: sj.latest_update.headline || undefined,
            journey_tag: sj.title,
            content: sj.latest_update.content,
            category: sj.latest_update.category || sj.category || 'Building',
            is_posted: true,
            is_draft: false,
            fuels_count: 0,
            saves_count: 0,
            comments_count: 0,
            ask_1_answers_count: 0,
            ask_2_answers_count: 0,
            media_count: 0,
            media: [],
            is_fueled_by_me: false,
            is_saved_by_me: false,
            created_at: sj.latest_update.created_at || new Date().toISOString(),
            updated_at: sj.latest_update.created_at || new Date().toISOString(),
          },
        ];
      }

      const latest = journeyPosts.length > 0 ? journeyPosts[0] : undefined;

      // Calculate From Date
      let fromDateStr = 'Recent';
      if (sj.start_date) {
        const d = new Date(sj.start_date);
        if (!isNaN(d.getTime())) {
          fromDateStr = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
        }
      } else if (journeyPosts.length > 0) {
        const earliest = journeyPosts[journeyPosts.length - 1];
        const d = new Date(earliest.created_at);
        if (!isNaN(d.getTime())) {
          fromDateStr = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
        }
      } else if (sj.created_at) {
        const d = new Date(sj.created_at);
        if (!isNaN(d.getTime())) {
          fromDateStr = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
        }
      }

      // Calculate To Date
      let toDateStr = 'Present';
      const endDateVal = sj.end_date || sj.to_date;
      if (endDateVal) {
        const d = new Date(endDateVal);
        if (!isNaN(d.getTime())) {
          toDateStr = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
        }
      }

      // Audit timestamps
      let createdFormatted = sj.created_at
        ? new Date(sj.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
        : fromDateStr;
      let updatedFormatted = sj.updated_at
        ? new Date(sj.updated_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
        : (latest ? new Date(latest.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : createdFormatted);

      combined.push({
        id: sj.id,
        title: sj.title,
        description: sj.short_text || sj.description || 'Documenting milestones and discoveries.',
        category: sj.category || (latest as any)?.category || 'Building',
        visibility: (sj.is_public === false || sj.visibility === 'Private') ? 'Private' : 'Public',
        startDate: `${fromDateStr} – ${toDateStr}`,
        fromDate: fromDateStr,
        toDate: toDateStr,
        createdAtFormatted: createdFormatted,
        updatedAtFormatted: updatedFormatted,
        updatesCount: sj.updates_count !== undefined ? sj.updates_count : journeyPosts.length,
        latestPost: latest
          ? {
              headline: (latest as any).headline || undefined,
              content: (latest as any).content,
              date: new Date((latest as any).created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              }),
              mediaThumbnail:
                (latest as any).media?.[0]?.thumbnail_url || (latest as any).media?.[0]?.url,
              fuelsCount: (latest as any).fuels_count || (latest as any).fuelsCount || 0,
              commentsCount: (latest as any).comments_count || (latest as any).commentsCount || 0,
            }
          : undefined,
        posts: journeyPosts,
        link: `/passport/${targetUsername}?journey=${encodeURIComponent(sj.title)}`,
      });
    });

    // 3. Add any journey tags from posts that are not already in passports
    journeyPostsMap.forEach((pList, tag) => {
      const exists = combined.some((j) => j.title.toLowerCase() === tag.toLowerCase());
      if (!exists) {
        const sortedList = [...pList].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        const latest = sortedList[0];
        const earliest = sortedList[sortedList.length - 1];
        const fromDateStr = new Date(earliest.created_at).toLocaleDateString('en-US', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });
        const toDateStr = 'Present';
        const createdFormatted = fromDateStr;
        const updatedFormatted = new Date(latest.created_at).toLocaleDateString('en-US', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });

        combined.push({
          id: 'j-' + encodeURIComponent(tag),
          title: tag,
          description: latest.headline || latest.content.slice(0, 140),
          category: latest.category || 'Building',
          visibility: 'Public',
          startDate: `${fromDateStr} – ${toDateStr}`,
          fromDate: fromDateStr,
          toDate: toDateStr,
          createdAtFormatted: createdFormatted,
          updatedAtFormatted: updatedFormatted,
          updatesCount: sortedList.length,
          latestPost: {
            headline: latest.headline || undefined,
            content: latest.content,
            date: new Date(latest.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            }),
            mediaThumbnail:
              latest.media?.[0]?.thumbnail_url || latest.media?.[0]?.url,
            fuelsCount: latest.fuels_count || 0,
            commentsCount: latest.comments_count || 0,
          },
          posts: sortedList,
          link: `/passport/${targetUsername}?journey=${encodeURIComponent(tag)}`,
        });
      }
    });

    setJourneysList(combined);
  };

  // ── Fetch Live Profile from Backend ────────────────────────────
  const loadProfile = async () => {
    setLoadingProfile(true);
    setProfileError(null);
    try {
      const queryHandle =
        username === 'you' || username === 'demo' ? currentUser.username : username;
      if (!queryHandle) {
        if (mockFounder) {
          setLiveProfile(null);
          setProfileName(mockFounder.name);
          setProfileLocation(mockFounder.location || '');
          setProfileBio(mockFounder.bio || '');
          setLoadingProfile(false);
          return;
        }
        setProfileError('No username provided.');
        setLoadingProfile(false);
        return;
      }

      const profile = await usersApi.getByUsername(queryHandle);
      setLiveProfile(profile);
      setProfileName(profile.name || '');
      setProfileLocation(profile.location || '');
      setProfileBio(profile.bio || '');

      const pd = profile.profile_details;
      if (pd) {
        setAboutText(pd.about || '');
        setCanHelpWith(pd.can_help_with || '');
        setFiguringOut(pd.figuring_out || '');
        setOpenTo(pd.open_to || '');
        setFocus1(pd.current_focus_1 || '');
        setFocus2(pd.current_focus_2 || '');
        setFocus3(pd.current_focus_3 || '');
        setInterests(Array.isArray(pd.interests) ? pd.interests.slice(0, 5) : []);
      } else {
        setAboutText('');
        setCanHelpWith('');
        setFiguringOut('');
        setOpenTo('');
        setFocus1('');
        setFocus2('');
        setFocus3('');
        setInterests([]);
      }

      // Fetch user posts to group into distinct journeys
      try {
        const posts = await usersApi.getUserPosts(profile.id);
        setRawPosts(posts || []);
        buildJourneysList(profile.id, profile.username, posts || []);
      } catch {
        buildJourneysList(profile.id, profile.username, []);
      }
    } catch (err: any) {
      if (mockFounder) {
        setLiveProfile(null);
        setProfileName(mockFounder.name);
        setProfileLocation(mockFounder.location || '');
        setProfileBio(mockFounder.bio || '');
        setLoadingProfile(false);
        return;
      }
      setProfileError(
        err?.message || 'Unable to load founder profile. Please check your connection and try again.'
      );
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    if (username) {
      loadProfile();
    }
    return () => {
      isMounted = false;
    };
  }, [username, currentUser.username]);

  const founder = liveProfile || mockFounder;

  // ── Error State (Genuinely Failed Fetch, Not Empty Profile) ────
  if (profileError && !loadingProfile && !founder) {
    return (
      <AppShell>
        <div className="py-16 max-w-md mx-auto text-center px-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-6 h-6 stroke-[2]" />
          </div>
          <h2 className="text-xl font-bold text-gm-ink">
            Unable to load profile
          </h2>
          <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
            {profileError}
          </p>
          <div className="mt-5 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={loadProfile}
              className="px-4 py-2 rounded-full bg-gm-accent hover:bg-gm-accent-deep text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Try Again</span>
            </button>
            <Link
              href="/home"
              className="px-4 py-2 rounded-full border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
            >
              Back to Feed
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  // ── Profile Not Found ──────────────────────────────────────────
  if (!founder && !loadingProfile) {
    return (
      <AppShell>
        <div className="py-12">
          <EmptyState
            title="Profile Not Found"
            description="The founder profile you are trying to visit does not exist."
            actionLabel="Back to Feed"
            actionHref="/home"
          />
        </div>
      </AppShell>
    );
  }

  const isOwner = Boolean(
    isAuthenticated &&
      currentUser?.id &&
      ((founder?.id && founder.id === currentUser.id) ||
        (liveProfile?.id && liveProfile.id === currentUser.id) ||
        (liveProfile?.username &&
          currentUser.username &&
          liveProfile.username.toLowerCase() === currentUser.username.toLowerCase()) ||
        username === 'you')
  );

  // ── Social Interaction Handlers ────────────────────────────────
  const handleToggleFollow = async () => {
    if (!isAuthenticated) {
      addToast('Please log in or sign up to follow creators.', 'info');
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    if (!liveProfile) return;
    const nextFollowing = !liveProfile.is_following;
    setLiveProfile({
      ...liveProfile,
      is_following: nextFollowing,
      followers_count: nextFollowing
        ? (liveProfile.followers_count || 0) + 1
        : Math.max(0, (liveProfile.followers_count || 1) - 1),
    });
    try {
      if (nextFollowing) {
        await socialApi.followUser(liveProfile.id);
        addToast(`You are now following ${liveProfile.name}`, 'success');
      } else {
        await socialApi.unfollowUser(liveProfile.id);
        addToast(`Unfollowed ${liveProfile.name}`, 'info');
      }
    } catch {
      // Offline fallback
    }
  };

  const handleConnectionAction = async () => {
    if (!isAuthenticated) {
      addToast('Please log in or sign up to send connection requests.', 'info');
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    if (!liveProfile) return;
    if (liveProfile.connection_status === 'none') {
      setLiveProfile({ ...liveProfile, connection_status: 'pending-sent' });
      sendConnectionRequest(liveProfile.id);
    } else if (liveProfile.connection_status === 'pending-sent') {
      setLiveProfile({ ...liveProfile, connection_status: 'none' });
      removeConnection(liveProfile.id);
      addToast('Connection request cancelled', 'info');
    } else if (liveProfile.connection_status === 'pending-received') {
      setLiveProfile({ ...liveProfile, connection_status: 'connected' });
      acceptConnectionRequest(liveProfile.id);
    } else if (liveProfile.connection_status === 'connected') {
      setLiveProfile({ ...liveProfile, connection_status: 'none' });
      removeConnection(liveProfile.id);
    }
  };

  // ── Journey Creation Handler ───────────────────────────────────
  const handleJourneyCreated = async (newJ: CreatedJourneyData) => {
    const targetId = liveProfile?.id || currentUser.id;
    const targetUsername = liveProfile?.username || currentUser.username || username;
    saveStoredJourney(targetId, newJ);
    await buildJourneysList(targetId, targetUsername, rawPosts);
    addToast(`Added new journey: "${newJ.title}"`, 'success');
  };

  // ── 1. Save Full Profile Details to DB ─────────────────────────
  const handleEditProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);

    try {
      // 1. Update Core Profile in DB
      await usersApi.updateMe({
        name: profileName.trim(),
        location: profileLocation.trim() || undefined,
        bio: profileBio.trim() || undefined,
      });

      // 2. Update Extended Profile Details in DB
      await usersApi.updateProfileDetails({
        can_help_with: canHelpWith.trim() || null,
        figuring_out: figuringOut.trim() || null,
        open_to: openTo.trim() || null,
        current_focus: [focus1.trim(), focus2.trim(), focus3.trim()].filter(Boolean),
      });

      // 3. Update current user state in AppContext
      updateUser({
        name: profileName.trim(),
        location: profileLocation.trim(),
        bio: profileBio.trim(),
      });

      // 4. Update liveProfile state immediately
      setLiveProfile((prev) =>
        prev
          ? {
              ...prev,
              name: profileName.trim(),
              location: profileLocation.trim(),
              bio: profileBio.trim(),
              profile_details: {
                ...(prev.profile_details || ({} as any)),
                user_id: prev.id,
                can_help_with: canHelpWith.trim() || null,
                figuring_out: figuringOut.trim() || null,
                open_to: openTo.trim() || null,
                current_focus_1: focus1.trim() || null,
                current_focus_2: focus2.trim() || null,
                current_focus_3: focus3.trim() || null,
                interests: interests,
                updated_at: new Date().toISOString(),
              },
            }
          : prev
      );

      setIsEditProfileOpen(false);
      addToast('Profile and focus areas updated successfully!', 'success');
    } catch (err: any) {
      addToast(err?.message || 'Failed to update profile details', 'danger');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // ── 2. Save About Section to DB (Independent Modal) ────────────
  const handleSaveAbout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingAbout(true);
    try {
      const trimmed = tempAbout.trim();
      await usersApi.updateProfileDetails({
        about: trimmed,
      });

      setAboutText(trimmed);
      setLiveProfile((prev) =>
        prev
          ? {
              ...prev,
              profile_details: {
                ...(prev.profile_details || ({} as any)),
                user_id: prev.id,
                about: trimmed,
                interests: interests,
                updated_at: new Date().toISOString(),
              },
            }
          : prev
      );

      setIsEditAboutOpen(false);
      addToast('About section updated successfully!', 'success');
    } catch (err: any) {
      addToast(err?.message || 'Failed to save About section.', 'danger');
    } finally {
      setIsSavingAbout(false);
    }
  };

  // ── 3. Save Interests to DB (Independent Modal, Strictly Max 5) ─
  const handleAddInterest = (itemToAdd: string) => {
    const clean = itemToAdd.trim();
    if (!clean) return;
    if (tempInterests.length >= 5) {
      setInterestsError('Strictly maximum 5 interests allowed. Remove one to add another.');
      return;
    }
    if (tempInterests.some((i) => i.toLowerCase() === clean.toLowerCase())) {
      setInterestsError(`"${clean}" is already in your interests.`);
      return;
    }
    setInterestsError(null);
    setTempInterests([...tempInterests, clean]);
    setNewInterestInput('');
  };

  const handleRemoveInterest = (itemToRemove: string) => {
    setTempInterests(tempInterests.filter((i) => i !== itemToRemove));
    setInterestsError(null);
  };

  const handleSaveInterests = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tempInterests.length > 5) {
      setInterestsError('Strictly maximum 5 interests allowed.');
      return;
    }
    setIsSavingInterests(true);
    try {
      await usersApi.updateProfileDetails({
        interests: tempInterests,
      });

      setInterests(tempInterests);
      setLiveProfile((prev) =>
        prev
          ? {
              ...prev,
              profile_details: {
                ...(prev.profile_details || ({} as any)),
                user_id: prev.id,
                interests: tempInterests,
                updated_at: new Date().toISOString(),
              },
            }
          : prev
      );

      setIsEditInterestsOpen(false);
      addToast('Interests updated successfully!', 'success');
    } catch (err: any) {
      addToast(err?.message || 'Failed to save interests.', 'danger');
    } finally {
      setIsSavingInterests(false);
    }
  };

  // ── RENDER HELPERS: About Card ─────────────────────────────────
  const renderAboutCard = () => (
    <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-card relative overflow-hidden flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-2.5 relative z-10">
          <h3 className="text-sm font-bold text-gm-ink">About</h3>
          {isOwner && (
            <button
              type="button"
              onClick={() => {
                setTempAbout(aboutText);
                setIsEditAboutOpen(true);
              }}
              className="inline-flex items-center gap-1 text-xs font-semibold text-gm-accent hover:text-gm-accent-deep transition-colors cursor-pointer"
              title="Edit About"
            >
              <Pencil className="w-3 h-3" />
              <span>Edit</span>
            </button>
          )}
        </div>

        {aboutText.trim() ? (
          <>
            <p
              className={`text-xs text-gray-600 leading-relaxed font-normal relative z-10 ${
                !isAboutExpanded && aboutText.length > 200 ? 'line-clamp-4' : ''
              }`}
            >
              {aboutText}
            </p>
            {aboutText.length > 200 && (
              <button
                type="button"
                onClick={() => setIsAboutExpanded(!isAboutExpanded)}
                className="text-xs font-bold text-gm-accent hover:underline inline-flex items-center gap-1 relative z-10 mt-2 cursor-pointer"
              >
                <span>{isAboutExpanded ? 'Show less ↑' : 'Read more →'}</span>
              </button>
            )}
          </>
        ) : (
          <div className="relative z-10 py-2">
            <p className="text-xs text-gray-400 leading-relaxed italic">
              Tell us a little about yourself. Add an introduction to make your profile yours.
            </p>
            {isOwner && (
              <button
                type="button"
                onClick={() => {
                  setTempAbout('');
                  setIsEditAboutOpen(true);
                }}
                className="mt-2.5 inline-flex items-center gap-1 text-xs font-bold text-gm-accent hover:underline cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add Introduction</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Ethereal Serene Landscape Graphic */}
      <div className="h-24 -mx-6 -mb-6 mt-4 relative overflow-hidden pointer-events-none select-none">
        <svg viewBox="0 0 320 120" preserveAspectRatio="none" className="w-full h-full">
          <defs>
            <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
              <stop offset="50%" stopColor="#EDE9FE" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#DDD6FE" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="duneGrad1" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#EDE9FE" />
              <stop offset="100%" stopColor="#C4B5FD" />
            </linearGradient>
            <linearGradient id="duneGrad2" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#DDD6FE" />
              <stop offset="100%" stopColor="#A78BFA" />
            </linearGradient>
          </defs>
          <rect width="320" height="120" fill="url(#skyGrad)" />
          {/* Crescent Moon */}
          <path
            d="M 285 24 A 10 10 0 1 0 293 38 A 12 12 0 1 1 285 24 Z"
            fill="#F5F3FF"
            opacity="0.95"
          />
          {/* Back Dune */}
          <path
            d="M 0 100 Q 120 70 240 85 T 320 80 L 320 120 L 0 120 Z"
            fill="url(#duneGrad1)"
            opacity="0.6"
          />
          {/* Front Dune */}
          <path
            d="M 0 115 Q 160 85 320 100 L 320 120 L 0 120 Z"
            fill="url(#duneGrad2)"
            opacity="0.8"
          />
          {/* Lone Founder Silhouette */}
          <g transform="translate(296, 68) scale(0.65)">
            <circle cx="5" cy="5" r="2.5" fill="#312E81" />
            <path
              d="M 5 8 L 5 18 M 5 11 L 2 15 M 5 11 L 8 15 M 5 18 L 3 26 M 5 18 L 7 26"
              stroke="#312E81"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </g>
        </svg>
      </div>
    </div>
  );

  // ── RENDER HELPERS: Interests Card (Max 5 Limit) ───────────────
  const renderInterestsCard = () => (
    <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-gm-ink">Interests</h3>
          {interests.length > 0 && (
            <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              {interests.length}/5
            </span>
          )}
        </div>
        {isOwner && (
          <button
            type="button"
            onClick={() => {
              setTempInterests([...interests]);
              setNewInterestInput('');
              setInterestsError(null);
              setIsEditInterestsOpen(true);
            }}
            className="text-xs font-semibold text-gm-accent hover:underline cursor-pointer inline-flex items-center gap-1"
          >
            <Pencil className="w-3 h-3" />
            <span>{interests.length === 0 ? 'Add' : 'Edit'}</span>
          </button>
        )}
      </div>

      {interests.length === 0 ? (
        <div className="py-6 text-center">
          <p className="text-xs text-gray-400 leading-relaxed italic">
            Add your interests to help others discover what you enjoy.
          </p>
          {isOwner && (
            <button
              type="button"
              onClick={() => {
                setTempInterests([]);
                setNewInterestInput('');
                setInterestsError(null);
                setIsEditInterestsOpen(true);
              }}
              className="mt-3 inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-gm-accent-soft hover:bg-[#E0DEFD] text-xs font-bold text-gm-accent transition-all cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Add Interests</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3 pt-1">
          {/* Clean interest pill tags with subtle status dots */}
          <div className="flex flex-wrap gap-2">
            {interests.map((tag, idx) => {
              const dotColors = [
                'bg-gm-accent',
                'bg-[#FF9900]',
                'bg-[#06B6D4]',
                'bg-[#10B981]',
                'bg-[#FF3366]',
              ];
              const dotColor = dotColors[idx % dotColors.length];

              return (
                <div
                  key={tag}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200/80 text-xs font-medium text-gm-ink"
                >
                  <span className={`w-2 h-2 rounded-full ${dotColor}`} />
                  <span>{tag}</span>
                </div>
              );
            })}
          </div>

          <p className="text-[11px] text-gray-400 pt-1">
            Up to 5 topic areas helping members discover and connect with your journey.
          </p>
        </div>
      )}
    </div>
  );

  // ── RIGHT SIDEBAR: 2 Cards (Desktop >= xl) ─────────────────────
  const rightSidebar = (
    <div className="space-y-4 sm:space-y-5 pt-0.5">
      {renderAboutCard()}
      {renderInterestsCard()}
    </div>
  );

  if (loadingProfile) {
    return (
      <AppShell>
        <div className="py-20 flex flex-col items-center justify-center">
          <AestheticLoader
            title={`Loading @${username}'s journey...`}
            subtitle="Retrieving profile details, journeys, and focus waypoints from the database."
          />
        </div>
      </AppShell>
    );
  }

  const hasWaypoints = Boolean(focus1.trim() || focus2.trim() || focus3.trim());
  const hasAnyContext = Boolean(canHelpWith.trim() || figuringOut.trim() || openTo.trim());

  return (
    <AppShell rightSidebar={rightSidebar}>
      <div className="space-y-6 sm:space-y-8">
        
        {/* ── 1. PROFILE HEADER SECTION ──────────────────────────── */}
        <section className="relative flex flex-col items-start gap-6 sm:gap-8 rounded-[36px] bg-white shadow-card p-6 sm:p-10 animate-slide-up" data-testid="profile-header">
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-[36px]"><div className="absolute -right-24 -top-24 w-72 h-72 rounded-full bg-gradient-to-br from-[#FFF3E2] via-[#F6CFA6] to-gm-accent opacity-30" /><div className="absolute -right-10 -top-28 w-72 h-72 rounded-full bg-white" /></div>
          <div className="relative flex flex-col sm:flex-row items-start sm:items-end gap-5 sm:gap-8 min-w-0 w-full">
            
            {/* Avatar with Green Active Dot */}
            <div className="relative flex-shrink-0 w-24 h-24 sm:w-36 sm:h-36">
              <img
                src={
                  (founder as any)?.avatarImage ||
                  (founder as any)?.avatar_image ||
                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80"
                }
                alt={profileName || 'Founder'}
                className="w-full h-full rounded-full object-cover shadow-card-hover ring-4 ring-gm-paper aspect-square"
              />
              <span
                className="absolute bottom-1 right-1 w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 rounded-full bg-[#10B981] border-2 sm:border-3 border-white shadow-xs"
                title="Active"
              />
            </div>

            {/* Profile Info: Name, Location, Bio */}
            <div className="min-w-0 flex-1">
              <h1 className="text-[44px] sm:text-[64px] font-extrabold text-gm-ink leading-[0.95]">
                {profileName || 'Anonymous Builder'}
              </h1>

              {profileLocation ? (
                <p className="text-[13px] text-gray-500 font-medium mt-3 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  <span>{profileLocation}</span>
                </p>
              ) : null}

              {profileBio ? (
                <p className="text-sm sm:text-base text-gray-600 mt-3 max-w-xl leading-relaxed font-normal">
                  {profileBio}
                </p>
              ) : isOwner ? (
                <div className="mt-2.5">
                  <p className="text-xs text-gray-400 italic">
                    Your profile is waiting to take shape. Start editing your profile to tell your story.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsEditProfileOpen(true)}
                    className="mt-1 text-xs font-bold text-gm-accent hover:underline cursor-pointer"
                  >
                    + Add Bio
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          {/* Action Buttons: Follow, Connect, Edit Profile & More Options */}
          <div className="relative flex flex-wrap items-center gap-2 w-full pt-6 border-t border-gm-ink/[0.06]">
            {isOwner ? (
              <button
                type="button"
                onClick={() => setIsEditProfileOpen(true)}
                className="px-5 h-10 inline-flex items-center rounded-full border border-gray-300 hover:border-gray-400 bg-white text-xs font-semibold text-gm-ink shadow-2xs hover:bg-gray-50 transition-all cursor-pointer"
              >
                Edit Profile
              </button>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleToggleFollow}
                  className={`px-5 h-10 inline-flex items-center rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    liveProfile?.is_following
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      : 'bg-gm-accent hover:bg-gm-accent-deep text-white shadow-xs'
                  }`}
                >
                  {liveProfile?.is_following ? 'Following' : '+ Follow'}
                </button>
                <button
                  type="button"
                  onClick={handleConnectionAction}
                  className={`px-5 h-10 inline-flex items-center rounded-full border text-xs font-semibold transition-all cursor-pointer ${
                    liveProfile?.connection_status === 'connected'
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                      : liveProfile?.connection_status === 'pending-sent'
                      ? 'border-amber-300 bg-amber-50 text-amber-700'
                      : liveProfile?.connection_status === 'pending-received'
                      ? 'border-gm-accent bg-gm-accent-soft text-gm-accent'
                      : 'border-gray-300 hover:border-gray-400 bg-white text-gm-ink'
                  }`}
                >
                  {liveProfile?.connection_status === 'connected'
                    ? 'Connected'
                    : liveProfile?.connection_status === 'pending-sent'
                    ? 'Pending'
                    : liveProfile?.connection_status === 'pending-received'
                    ? 'Accept'
                    : 'Connect'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!isAuthenticated) {
                      addToast('Please log in to chat with members.', 'info');
                      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
                      return;
                    }
                    router.push(`/messages?user=${encodeURIComponent(liveProfile?.username || username)}`);
                  }}
                  className="px-3.5 sm:px-5 h-10 inline-flex items-center rounded-full border border-gray-200 hover:border-gm-accent bg-white hover:bg-gm-accent-soft/40 text-xs font-semibold text-gm-ink hover:text-gm-accent flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95"
                  title="Direct Message"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-gm-accent" />
                  <span>Message</span>
                </button>
              </div>
            )}

            {/* Share / Profile QR Code Button */}
            <button
              type="button"
              onClick={() => setIsQrModalOpen(true)}
              className="px-3 sm:px-4 h-10 inline-flex items-center rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer select-none active:scale-95"
              title="Show Profile QR Code"
            >
              <QrCode className="w-3.5 h-3.5 text-gm-accent" />
              <span className="hidden sm:inline">QR Code</span>
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                className="w-10 h-10 rounded-full border border-gray-200/90 hover:border-gray-300 flex items-center justify-center text-gray-500 hover:text-black transition-colors cursor-pointer"
                title="More options"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {isMoreMenuOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setIsMoreMenuOpen(false)} />
                  <div className="absolute right-0 top-12 bg-white text-gray-800 rounded-2xl shadow-modal border border-gm-ink/5 p-1.5 z-40 min-w-[170px] text-xs font-medium animate-slide-up">
                    <button
                      type="button"
                      onClick={() => {
                        if (typeof window !== 'undefined' && navigator.clipboard) {
                          navigator.clipboard.writeText(window.location.href);
                          addToast('Profile link copied!', 'success');
                        }
                        setIsMoreMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-gray-50 text-gray-700 cursor-pointer"
                    >
                      Copy Profile Link
                    </button>
                    {isOwner && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditProfileOpen(true);
                            setIsMoreMenuOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl hover:bg-gray-50 text-gray-700 cursor-pointer"
                        >
                          Edit Profile Details
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsActivityModalOpen(true);
                            setIsMoreMenuOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl hover:bg-gray-50 text-gray-700 flex items-center justify-between cursor-pointer"
                        >
                          <span>Activity & Audit Log</span>
                          <Activity className="w-3.5 h-3.5 text-gray-400" />
                        </button>
                      </>
                    )}
                    {!isOwner && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setIsMoreMenuOpen(false);
                            if (!isAuthenticated) {
                              addToast('Please log in to chat with members.', 'info');
                              router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
                              return;
                            }
                            router.push(`/messages?user=${encodeURIComponent(liveProfile?.username || username)}`);
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl hover:bg-gray-50 text-gray-700 flex items-center gap-2 cursor-pointer font-medium"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-gm-accent" />
                          <span>Message {liveProfile?.name ? liveProfile.name.split(' ')[0] : 'Member'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsReportUserModalOpen(true);
                            setIsMoreMenuOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-50 text-rose-600 flex items-center gap-2 cursor-pointer font-medium"
                        >
                          <Flag className="w-3.5 h-3.5 text-rose-500" />
                          <span>Report Member</span>
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        {/* ── 2. CELESTIAL WAYPOINTS VISUAL ("Right now, I'm here") ─ */}
        {hasWaypoints ? (
          <section className="relative pt-2 pb-2 overflow-x-auto scrollbar-none">
            <div className="min-w-[620px] relative">
              
              {/* Top Row: Annotation + Planet + Undulating Orbit Track with Nodes */}
              <div className="relative h-44 flex items-center">
                
                {/* Handwritten Script Annotation on Left */}
                <div className="absolute left-2 top-2 z-20 flex flex-col items-start select-none">
                  <span className="font-handwriting text-2xl sm:text-[26px] text-gm-ink font-medium leading-none">
                    Right now,
                  </span>
                  <span className="font-handwriting text-2xl sm:text-[26px] text-gm-ink font-medium leading-none mt-1">
                    I&apos;m here
                  </span>
                  {/* Hand-drawn curved arrow pointing to the planet */}
                  <svg
                    className="w-10 h-10 text-gray-700 ml-5 -mt-1 transform rotate-6"
                    viewBox="0 0 40 40"
                    fill="none"
                  >
                    <path
                      d="M 6 6 Q 16 22 28 24"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <path
                      d="M 22 19 L 28 24 L 22 29"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  </svg>
                </div>

                {/* The Glowing Purple Orb with Orbital Ring */}
                <div className="absolute left-28 sm:left-32 top-8 z-10 select-none">
                  <div className="relative w-20 h-20 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-600/30 to-indigo-500/20 blur-xl scale-125" />
                    <div className="relative z-10 w-16 h-16 rounded-full bg-gradient-to-br from-[#9D88FF] via-[#6B4EFF] to-[#341B9A] shadow-[0_10px_25px_rgba(107,78,255,0.45)] overflow-hidden">
                      <div className="absolute top-1 left-2 w-7 h-5 rounded-full bg-white/40 blur-xs" />
                    </div>
                    <svg
                      className="absolute inset-0 w-24 h-24 -left-2 -top-2 pointer-events-none z-20"
                      viewBox="0 0 100 100"
                      fill="none"
                    >
                      <ellipse
                        cx="50"
                        cy="50"
                        rx="44"
                        ry="15"
                        stroke="rgba(255, 255, 255, 0.85)"
                        strokeWidth="2"
                        transform="rotate(-26 50 50)"
                      />
                    </svg>
                  </div>
                </div>

                {/* Connecting Track running through waypoints */}
                <svg
                  className="w-full h-full absolute inset-0 pointer-events-none"
                  viewBox="0 0 680 160"
                  fill="none"
                >
                  <path
                    d="M 180 88 Q 230 75 270 82 T 370 102 T 480 105 T 580 92 T 660 88"
                    stroke="#E2E0D8"
                    strokeWidth="1.8"
                    strokeDasharray="4 4"
                    fill="none"
                  />

                  {focus1 && (
                    <>
                      <circle cx="270" cy="82" r="5.5" fill="#FF3366" />
                      <circle cx="270" cy="82" r="11" fill="#FF3366" fillOpacity="0.18" />
                    </>
                  )}

                  {focus2 && (
                    <>
                      <circle cx="390" cy="102" r="5.5" fill="#FF9900" />
                      <circle cx="390" cy="102" r="11" fill="#FF9900" fillOpacity="0.18" />
                    </>
                  )}

                  {focus3 && (
                    <>
                      <circle cx="510" cy="105" r="5.5" fill="#10B981" />
                      <circle cx="510" cy="105" r="11" fill="#10B981" fillOpacity="0.18" />
                    </>
                  )}

                  <circle cx="600" cy="90" r="3" fill="#A8A29E" />
                </svg>

                {/* Waypoint 1 */}
                {focus1 && (
                  <>
                    <div className="absolute left-[235px] top-6 text-center w-36 pointer-events-none select-none">
                      <span className="font-handwriting text-lg text-gm-ink font-bold block leading-tight">
                        {focus1}
                      </span>
                    </div>
                    <div className="absolute left-[235px] top-[108px] text-left w-36 pointer-events-none select-none">
                      <p className="text-[10px] text-gray-500 font-normal leading-tight">
                        Primary Focus
                      </p>
                    </div>
                  </>
                )}

                {/* Waypoint 2 */}
                {focus2 && (
                  <>
                    <div className="absolute left-[355px] top-12 text-center w-36 pointer-events-none select-none">
                      <span className="font-handwriting text-lg text-gm-ink font-bold block leading-tight">
                        {focus2}
                      </span>
                    </div>
                    <div className="absolute left-[355px] top-[125px] text-left w-36 pointer-events-none select-none">
                      <p className="text-[10px] text-gray-500 font-normal leading-tight">
                        Growth Project
                      </p>
                    </div>
                  </>
                )}

                {/* Waypoint 3 */}
                {focus3 && (
                  <>
                    <div className="absolute left-[475px] top-12 text-center w-36 pointer-events-none select-none">
                      <span className="font-handwriting text-lg text-gm-ink font-bold block leading-tight">
                        {focus3}
                      </span>
                    </div>
                    <div className="absolute left-[475px] top-[128px] text-left w-36 pointer-events-none select-none">
                      <p className="text-[10px] text-gray-500 font-normal leading-tight">
                        Active Goal
                      </p>
                    </div>
                  </>
                )}

              </div>
            </div>
          </section>
        ) : isOwner ? (
          <section className="bg-gray-50/70 rounded-2xl p-4 border border-dashed border-gray-200 text-center select-none">
            <p className="text-xs text-gray-500 font-medium">
              Set up to 3 waypoints you are actively focusing on right now.
            </p>
            <button
              type="button"
              onClick={() => setIsEditProfileOpen(true)}
              className="mt-2 text-xs font-bold text-gm-accent hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Set Focus Waypoints</span>
            </button>
          </section>
        ) : null}

        {/* ── 3. THREE HELP / FIGURING OUT / OPEN TO COLUMNS ───────── */}
        {hasAnyContext ? (
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-5 pb-6 border-t border-b border-gray-100">
            {/* Column 1: I can help with */}
            {canHelpWith.trim() ? (
              <div className="flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-serif italic text-sm sm:text-[15px] font-semibold text-gm-ink">
                    I can help with
                  </h4>
                  <p className="text-xs text-gray-500 leading-relaxed mt-1.5 font-normal">
                    {canHelpWith}
                  </p>
                </div>
              </div>
            ) : null}

            {/* Column 2: I'm figuring out */}
            {figuringOut.trim() ? (
              <div className="flex items-start gap-3 md:border-l md:border-gray-100 md:pl-6">
                <span className="text-blue-500 font-bold text-base leading-none flex-shrink-0 mt-0.5">
                  ≈
                </span>
                <div>
                  <h4 className="font-serif italic text-sm sm:text-[15px] font-semibold text-gm-ink">
                    I&apos;m figuring out
                  </h4>
                  <p className="text-xs text-gray-500 leading-relaxed mt-1.5 font-normal">
                    {figuringOut}
                  </p>
                </div>
              </div>
            ) : null}

            {/* Column 3: I'm open to */}
            {openTo.trim() ? (
              <div className="flex items-start gap-3 md:border-l md:border-gray-100 md:pl-6">
                <span className="text-amber-600 text-sm leading-none flex-shrink-0 mt-0.5">
                  🌱
                </span>
                <div>
                  <h4 className="font-serif italic text-sm sm:text-[15px] font-semibold text-gm-ink">
                    I&apos;m open to
                  </h4>
                  <p className="text-xs text-gray-500 leading-relaxed mt-1.5 font-normal">
                    {openTo}
                  </p>
                </div>
              </div>
            ) : null}
          </section>
        ) : isOwner ? (
          <section className="py-4 text-center border-t border-b border-gray-100">
            <p className="text-xs text-gray-400 italic">
              Share what you can help with, what you're figuring out, and what you're open to.
            </p>
            <button
              type="button"
              onClick={() => setIsEditProfileOpen(true)}
              className="mt-1.5 text-xs font-bold text-gm-accent hover:underline cursor-pointer"
            >
              + Add Collaboration Details
            </button>
          </section>
        ) : null}

        {/* ── 3.5 ABOUT & INTERESTS (Mobile & Tablet: < xl) ───────── */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1 xl:hidden">
          {renderAboutCard()}
          {renderInterestsCard()}
        </section>

        {/* ── 4. MY JOURNEYS SECTION (Journeys, Not Updates) ───────── */}
        <section className="pt-1">
          {/* Header Row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-baseline gap-2.5">
              <h2 className="font-serif text-[26px] sm:text-[32px] font-bold text-gm-ink">
                My Journeys
              </h2>
              <span className="text-xs text-gray-400 font-medium">
                {journeysList.length} {journeysList.length === 1 ? 'journey' : 'journeys'}
              </span>
            </div>

            {isOwner && (
              <button
                type="button"
                onClick={() => setIsNewJourneyOpen(true)}
                className="bg-gm-accent hover:bg-gm-accent-deep text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>New Journey</span>
              </button>
            )}
          </div>

          {/* Minimalistic, Content-Rich Journey Cards (Twitter/LinkedIn style) */}
          {journeysList.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 sm:p-10 border border-dashed border-gm-ink/15 text-center my-2">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center mx-auto mb-3">
                <Compass className="w-6 h-6 stroke-[1.8]" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-gm-ink">
                Your journeys will appear here once you create or join one.
              </h3>
              <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto leading-relaxed font-normal">
                Journeys communicate what you are working towards over time — from building projects to skills, career pivots, and personal growth.
              </p>
              {isOwner && (
                <button
                  type="button"
                  onClick={() => setIsNewJourneyOpen(true)}
                  className="mt-4 px-4 py-2 rounded-full bg-gm-accent hover:bg-gm-accent-deep text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Create Your First Journey</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 pt-1">
              {journeysList.map((j) => (
                <div
                  key={j.id}
                  className="bg-white rounded-3xl p-5 sm:p-6 shadow-card hover:shadow-card-hover transition-all relative overflow-hidden"
                >
                  {/* Top Header Row: Category, Visibility, Updates count, Title, Chevron Arrow */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      {/* Badges row */}
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span className="text-[11px] font-bold text-gm-accent bg-gm-accent-soft px-2.5 py-0.5 rounded-full">
                          {j.category}
                        </span>
                        {j.visibility === 'Public' ? (
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-flex items-center gap-1 border border-emerald-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Public
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" />
                            Private
                          </span>
                        )}
                        <span className="text-[11px] text-gray-400 font-medium">
                          · {j.updatesCount} {j.updatesCount === 1 ? 'update' : 'updates'}
                        </span>
                      </div>

                      {/* Journey Title */}
                      <Link
                        href={j.link}
                        className="group/title inline-block"
                      >
                        <h3 className="text-base sm:text-lg font-bold text-gm-ink group-hover/title:text-gm-accent transition-colors leading-snug">
                          {j.title}
                        </h3>
                      </Link>

                      {/* Description */}
                      {j.description && (
                        <p className="text-xs text-gray-600 font-normal leading-relaxed mt-1 line-clamp-2">
                          {j.description}
                        </p>
                      )}

                      {/* Date Timelines & Audit Row */}
                      <div className="flex items-center gap-3 sm:gap-4 mt-2.5 flex-wrap text-xs text-gray-500">
                        {/* From -> To Date */}
                        <div className="inline-flex items-center gap-1.5 bg-gray-100/90 text-gray-700 font-medium px-2.5 py-1 rounded-lg text-[11px]">
                          <Calendar className="w-3.5 h-3.5 text-gm-accent flex-shrink-0" />
                          <span>From: <strong className="text-gray-900 font-semibold">{j.fromDate}</strong></span>
                          <span className="text-gray-400">→</span>
                          <span>To: <strong className="text-gray-900 font-semibold">{j.toDate}</strong></span>
                        </div>

                        {/* Created & Updated dates */}
                        {(j.createdAtFormatted || j.updatedAtFormatted) && (
                          <div className="inline-flex items-center gap-1.5 text-[11px] text-gray-400 font-normal">
                            <Clock className="w-3 h-3 text-gray-400 flex-shrink-0" />
                            <span>Created: {j.createdAtFormatted}</span>
                            <span>·</span>
                            <span>Updated: {j.updatedAtFormatted}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Chevron Arrow Button -> opens full journey timeline */}
                    <Link
                      href={j.link}
                      aria-label={`View full timeline for ${j.title}`}
                      className="w-9 h-9 rounded-full bg-gray-50 hover:bg-gm-accent text-gray-400 hover:text-white flex items-center justify-center transition-all flex-shrink-0 mt-0.5 shadow-2xs group/arrow hover:scale-105 active:scale-95"
                    >
                      <ChevronRight className="w-4 h-4 group-hover/arrow:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>

                  {/* Horizontal Scrolling Track of All Posts */}
                  <div className="mt-4 pt-3.5 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                          Journey Updates
                        </span>
                        <span className="text-[10px] font-bold text-gm-accent bg-gm-accent-soft px-2 py-0.2 rounded-full">
                          {j.posts.length}
                        </span>
                      </div>
                      <Link
                        href={j.link}
                        className="text-xs font-semibold text-gm-accent hover:underline flex items-center gap-1"
                      >
                        <span>Full timeline</span>
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>

                    {j.posts.length > 0 ? (
                      <div className="flex gap-3.5 overflow-x-auto pb-2 pt-1 -mx-2 px-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent snap-x snap-mandatory">
                        {j.posts.map((post) => {
                          const hasMedia = post.media && post.media.length > 0 && (post.media[0].thumbnail_url || post.media[0].url);
                          const mediaUrl = hasMedia ? (post.media[0].thumbnail_url || post.media[0].url) : null;
                          const postStartDate = post.start_date
                            ? new Date(post.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                            : new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                          const postEndDate = post.end_date
                            ? new Date(post.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                            : 'Present';
                          const postDateDisplay = post.start_date ? `${postStartDate} → ${postEndDate}` : postStartDate;

                          if (hasMedia && mediaUrl) {
                            // ── Visual Media Post Card ──
                            return (
                              <Link
                                key={post.id}
                                href={`/updates/${post.id}`}
                                className="w-[260px] sm:w-[280px] h-[210px] flex-shrink-0 snap-start rounded-2xl relative overflow-hidden group/card shadow-2xs hover:shadow-md transition-all border border-black/[0.08] flex flex-col justify-between p-3.5"
                              >
                                {/* Media Background */}
                                <img
                                  src={mediaUrl}
                                  alt=""
                                  className="absolute inset-0 w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500"
                                />
                                {/* Scrim Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/25 pointer-events-none" />

                                {/* Top Header Info */}
                                <div className="relative z-10 flex items-center justify-between gap-2">
                                  <span className="text-[10px] font-bold text-white bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/20">
                                    {post.category || 'Milestone'}
                                  </span>
                                  <span className="text-[10px] font-medium text-white/90 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <Calendar className="w-2.5 h-2.5" />
                                    <span>{postDateDisplay}</span>
                                  </span>
                                </div>

                                {/* Bottom Info */}
                                <div className="relative z-10">
                                  {post.headline && (
                                    <h4 className="text-xs font-bold text-white line-clamp-1 mb-1 leading-snug drop-shadow-xs">
                                      {post.headline}
                                    </h4>
                                  )}
                                  <p className="text-xs text-white/90 line-clamp-2 font-normal leading-relaxed mb-2.5 drop-shadow-2xs">
                                    {post.content}
                                  </p>

                                  <div className="flex items-center justify-between pt-2 border-t border-white/20 text-[11px] text-white/90">
                                    <div className="flex items-center gap-3">
                                      <span className="inline-flex items-center gap-1 font-medium">
                                        <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />
                                        <span>{post.fuels_count}</span>
                                      </span>
                                      <span className="inline-flex items-center gap-1 font-medium">
                                        <MessageSquare className="w-3 h-3 text-white/80" />
                                        <span>{post.comments_count}</span>
                                      </span>
                                    </div>
                                    <span className="text-[10px] font-bold text-white/95 group-hover/card:translate-x-0.5 transition-transform flex items-center gap-0.5">
                                      <span>View</span>
                                      <span>→</span>
                                    </span>
                                  </div>
                                </div>
                              </Link>
                            );
                          }

                          // ── Text-Only Post Card ──
                          return (
                            <Link
                              key={post.id}
                              href={`/updates/${post.id}`}
                              className="w-[260px] sm:w-[280px] h-[210px] flex-shrink-0 snap-start rounded-2xl relative overflow-hidden group/card shadow-2xs hover:shadow-md transition-all border border-gm-accent/15 bg-gradient-to-br from-gm-paper via-white to-[#F5F3FF] p-4 flex flex-col justify-between"
                            >
                              {/* Top Header Info */}
                              <div>
                                <div className="flex items-center justify-between gap-2 mb-2">
                                  <span className="text-[10px] font-bold text-gm-accent bg-gm-accent-soft px-2 py-0.5 rounded-full border border-gm-accent/10">
                                    {post.category || 'Update'}
                                  </span>
                                  <span className="text-[10px] font-medium text-gray-500 bg-white/70 px-2 py-0.5 rounded-md border border-gray-100 flex items-center gap-1">
                                    <Calendar className="w-2.5 h-2.5 text-gm-accent" />
                                    <span>{postDateDisplay}</span>
                                  </span>
                                </div>

                                {post.headline && (
                                  <h4 className="text-xs font-bold text-gm-ink group-hover/card:text-gm-accent line-clamp-1 mb-1 transition-colors leading-snug">
                                    {post.headline}
                                  </h4>
                                )}
                                <p className="text-xs text-gray-600 line-clamp-4 leading-relaxed font-normal">
                                  {post.content}
                                </p>
                              </div>

                              {/* Bottom Stats */}
                              <div className="flex items-center justify-between pt-2.5 border-t border-gray-100 text-[11px] text-gray-500">
                                <div className="flex items-center gap-3">
                                  <span className="inline-flex items-center gap-1 font-medium text-gray-600">
                                    <Flame className="w-3 h-3 text-amber-500" />
                                    <span>{post.fuels_count}</span>
                                  </span>
                                  <span className="inline-flex items-center gap-1 font-medium text-gray-600">
                                    <MessageSquare className="w-3 h-3 text-gray-400" />
                                    <span>{post.comments_count}</span>
                                  </span>
                                </div>
                                <span className="text-[10px] font-bold text-gm-accent group-hover/card:translate-x-0.5 transition-transform flex items-center gap-0.5">
                                  <span>Read</span>
                                  <span>→</span>
                                </span>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="w-full bg-gm-paper rounded-2xl p-4 border border-dashed border-gray-200 text-center flex items-center justify-between text-xs text-gray-500">
                        <span className="italic">No updates posted to this journey yet.</span>
                        <Link
                          href={j.link}
                          className="font-bold text-gm-accent hover:underline flex items-center gap-1"
                        >
                          <span>Open journey</span>
                          <span>→</span>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>

      {/* ── Modal 1: Edit Profile (Full Profile & Waypoints) ─────── */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-gm-ink/45 backdrop-blur-md"
            onClick={() => setIsEditProfileOpen(false)}
          />
          <form
            onSubmit={handleEditProfileSubmit}
            className="relative bg-white rounded-[32px] p-6 sm:p-8 shadow-modal border border-gm-ink/5 max-w-lg w-full z-10 space-y-4 animate-slide-up max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-gm-ink">
                  Edit Profile & Focus Areas
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Update your identity, offers, challenges, and up to 3 focus items.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditProfileOpen(false)}
                className="p-1 text-gray-400 hover:text-black transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Core Info */}
            <div className="space-y-3 pt-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Core Information
              </h4>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-gm-accent"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={profileLocation}
                  onChange={(e) => setProfileLocation(e.target.value)}
                  placeholder="e.g. Bengaluru, India"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-gm-accent"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Short Bio
                </label>
                <textarea
                  rows={2}
                  value={profileBio}
                  onChange={(e) => setProfileBio(e.target.value)}
                  placeholder="Tell people who you are and what you're working towards..."
                  className="w-full p-3 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-gm-accent resize-none"
                />
              </div>
            </div>

            {/* Extended Details */}
            <div className="space-y-3 pt-2 border-t border-gray-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Collaboration & Context
              </h4>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  I can help with...
                </label>
                <input
                  type="text"
                  value={canHelpWith}
                  onChange={(e) => setCanHelpWith(e.target.value)}
                  placeholder="e.g. Frontend development, product thinking..."
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-gm-accent"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  I am figuring out...
                </label>
                <input
                  type="text"
                  value={figuringOut}
                  onChange={(e) => setFiguringOut(e.target.value)}
                  placeholder="e.g. Customer acquisition, fundraising..."
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-gm-accent"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  I am open to...
                </label>
                <input
                  type="text"
                  value={openTo}
                  onChange={(e) => setOpenTo(e.target.value)}
                  placeholder="e.g. Meaningful conversations, feedback..."
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-gm-accent"
                />
              </div>
            </div>

            {/* 3 Focus Items */}
            <div className="space-y-3 pt-2 border-t border-gray-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Primary Waypoints (Max 3 Focus Items)
              </h4>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Focus 1 (Primary Goal)
                </label>
                <input
                  type="text"
                  value={focus1}
                  onChange={(e) => setFocus1(e.target.value)}
                  placeholder="e.g. Building Growing Moon"
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-gm-accent"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Focus 2 (Growth Project)
                </label>
                <input
                  type="text"
                  value={focus2}
                  onChange={(e) => setFocus2(e.target.value)}
                  placeholder="e.g. Learning AI"
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-gm-accent"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Focus 3 (Lifestyle / Habit)
                </label>
                <input
                  type="text"
                  value={focus3}
                  onChange={(e) => setFocus3(e.target.value)}
                  placeholder="e.g. Half Marathon Training"
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-gm-accent"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-gray-100 sticky bottom-0 bg-white">
              <button
                type="button"
                onClick={() => setIsEditProfileOpen(false)}
                className="px-4 py-2 rounded-full text-xs font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSavingProfile}
                className="px-5 py-2 rounded-full bg-gm-accent hover:bg-gm-accent-deep disabled:opacity-50 text-white text-xs font-bold shadow-sm cursor-pointer"
              >
                {isSavingProfile ? 'Saving...' : 'Save Profile & Details'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Modal 2: Edit About Me (Independent Modal) ──────────── */}
      {isEditAboutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-gm-ink/45 backdrop-blur-md"
            onClick={() => setIsEditAboutOpen(false)}
          />
          <form
            onSubmit={handleSaveAbout}
            className="relative bg-white rounded-[32px] p-6 sm:p-8 shadow-modal border border-gm-ink/5 max-w-lg w-full z-10 space-y-4 animate-slide-up"
          >
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-gm-ink">
                  Edit About Me
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Write a concise introduction to tell fellow founders about your background and philosophy.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditAboutOpen(false)}
                className="p-1 text-gray-400 hover:text-black transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                About / Introduction
              </label>
              <textarea
                rows={5}
                value={tempAbout}
                onChange={(e) => setTempAbout(e.target.value)}
                placeholder="Tell us a little about yourself, what drives you, and what you're working towards..."
                maxLength={1000}
                className="w-full p-3.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-gm-accent resize-none leading-relaxed"
              />
              <div className="flex items-center justify-between text-[11px] text-gray-400 mt-1">
                <span>Persisted directly to your profile.</span>
                <span>{tempAbout.length} / 1000</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsEditAboutOpen(false)}
                className="px-4 py-2 rounded-full text-xs font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSavingAbout}
                className="px-5 py-2 rounded-full bg-gm-accent hover:bg-gm-accent-deep disabled:opacity-50 text-white text-xs font-bold shadow-sm cursor-pointer"
              >
                {isSavingAbout ? 'Saving...' : 'Save About'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Modal 3: Manage Interests (Independent Modal, Max 5) ── */}
      {isEditInterestsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-gm-ink/45 backdrop-blur-md"
            onClick={() => setIsEditInterestsOpen(false)}
          />
          <form
            onSubmit={handleSaveInterests}
            className="relative bg-white rounded-[32px] p-6 sm:p-8 shadow-modal border border-gm-ink/5 max-w-md w-full z-10 space-y-4 animate-slide-up"
          >
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-gm-ink">
                  Manage Interests
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Choose up to 5 topics or industries you are pursuing.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditInterestsOpen(false)}
                className="p-1 text-gray-400 hover:text-black transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Current Interests with remove button */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-gray-700">
                  Selected Interests
                </label>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    tempInterests.length === 5
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {tempInterests.length} / 5
                </span>
              </div>

              {tempInterests.length === 0 ? (
                <p className="text-xs text-gray-400 italic py-2">
                  No interests selected yet. Add up to 5 below.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2 py-1">
                  {tempInterests.map((interest) => (
                    <span
                      key={interest}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gm-accent-soft text-gm-accent text-xs font-medium"
                    >
                      <span>{interest}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveInterest(interest)}
                        className="hover:text-rose-600 p-0.5 rounded-full cursor-pointer"
                        title={`Remove ${interest}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Add interest input */}
            <div className="pt-2 border-t border-gray-100">
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Add an Interest
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newInterestInput}
                  onChange={(e) => {
                    setNewInterestInput(e.target.value);
                    setInterestsError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddInterest(newInterestInput);
                    }
                  }}
                  disabled={tempInterests.length >= 5}
                  placeholder={
                    tempInterests.length >= 5
                      ? 'Maximum 5 interests reached'
                      : 'e.g. Next.js, Bootstrapping, AI...'
                  }
                  className="flex-1 px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-gm-accent disabled:bg-gray-50 disabled:text-gray-400"
                />
                <button
                  type="button"
                  disabled={tempInterests.length >= 5 || !newInterestInput.trim()}
                  onClick={() => handleAddInterest(newInterestInput)}
                  className="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 disabled:opacity-40 text-xs font-bold text-gray-700 cursor-pointer"
                >
                  Add
                </button>
              </div>

              {interestsError && (
                <p className="text-[11px] text-rose-500 font-medium mt-1">
                  {interestsError}
                </p>
              )}
            </div>

            {/* Quick Suggestions */}
            {tempInterests.length < 5 && (
              <div className="pt-2">
                <p className="text-[11px] text-gray-400 font-medium mb-1.5">
                  Suggested topics:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTED_INTERESTS.filter(
                    (s) => !tempInterests.some((t) => t.toLowerCase() === s.toLowerCase())
                  ).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleAddInterest(s)}
                      className="text-[11px] px-2.5 py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer transition-colors"
                    >
                      + {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsEditInterestsOpen(false)}
                className="px-4 py-2 rounded-full text-xs font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSavingInterests}
                className="px-5 py-2 rounded-full bg-gm-accent hover:bg-gm-accent-deep disabled:opacity-50 text-white text-xs font-bold shadow-sm cursor-pointer"
              >
                {isSavingInterests ? 'Saving...' : 'Save Interests'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Modal 4: Activity History Audit ─────────────────────── */}
      <ActivityHistoryModal
        isOpen={isActivityModalOpen}
        onClose={() => setIsActivityModalOpen(false)}
      />

      {/* ── Modal 5: Create Journey ─────────────────────────────── */}
      <CreateJourneyModal
        isOpen={isNewJourneyOpen}
        onClose={() => setIsNewJourneyOpen(false)}
        onCreated={handleJourneyCreated}
      />

      {/* ── Modal 6: Report User ────────────────────────────────── */}
      <ReportModal
        isOpen={isReportUserModalOpen}
        onClose={() => setIsReportUserModalOpen(false)}
        targetType="user"
        targetId={liveProfile?.id || mockFounder?.id || ''}
        targetTitle={`@${username} (${profileName})`}
      />

      {/* ── Modal 7: Profile QR Code Modal ────────────────────────── */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-gm-ink/45 backdrop-blur-md animate-fade-in"
            onClick={() => setIsQrModalOpen(false)}
          />
          <div className="relative bg-white rounded-[32px] p-6 sm:p-8 shadow-modal border border-gm-ink/5 max-w-sm w-full z-10 text-center animate-slide-up">
            <button
              type="button"
              onClick={() => setIsQrModalOpen(false)}
              className="absolute right-4 top-4 p-1.5 rounded-full text-gray-400 hover:text-black hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <span className="text-[11px] font-extrabold text-gm-accent uppercase tracking-wider block mb-3">
              Profile Passport
            </span>

            {/* QR Code Container */}
            <div className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-2xs inline-block mx-auto mb-3">
              <QRCode
                value={
                  typeof window !== 'undefined'
                    ? `${window.location.origin}/profile/${liveProfile?.username || username}`
                    : `https://growingmoon.com/profile/${username}`
                }
                size={160}
                bgColor="#FFFFFF"
                fgColor="#101322"
                level="M"
              />
            </div>

            <h3 className="text-base font-extrabold text-gm-ink">
              {liveProfile?.name || mockFounder?.name || 'Founder'}
            </h3>
            <p className="text-xs text-gray-400 font-medium mt-0.5">
              @{liveProfile?.username || username}
            </p>

            <p className="text-[11.5px] text-gray-500 font-normal mt-2 leading-relaxed max-w-[220px] mx-auto">
              Scan with mobile camera to view public profile, journeys, and timeline updates.
            </p>

            <button
              type="button"
              onClick={() => {
                if (typeof navigator !== 'undefined' && navigator.clipboard) {
                  navigator.clipboard.writeText(
                    `${window.location.origin}/profile/${liveProfile?.username || username}`
                  );
                  setCopiedQrLink(true);
                  addToast('Profile link copied!', 'success');
                  setTimeout(() => setCopiedQrLink(false), 2000);
                }
              }}
              className="w-full mt-4 py-2.5 px-4 rounded-full bg-gm-accent-soft hover:bg-gm-accent-soft text-gm-accent text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer active:scale-95"
            >
              {copiedQrLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Link Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Profile Link</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

    </AppShell>
  );
}
