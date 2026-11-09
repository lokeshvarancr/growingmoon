'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AppShell from '@/components/shared/AppShell';
import EmptyState from '@/components/EmptyState';
import ActivityHistoryModal from '@/components/profile/ActivityHistoryModal';
import { getFounderByUsername } from '@/lib/mock-data/founders';
import { useApp } from '@/lib/state/AppContext';
import { usersApi, socialApi } from '@/lib/api/client';
import type { UserPublicProfile } from '@/lib/api/types';
import {
  MapPin,
  Pencil,
  MoreHorizontal,
  Plus,
  ChevronRight,
  Sparkles,
  Rocket,
  Laptop,
  Dumbbell,
  X,
  Check,
  Activity,
} from 'lucide-react';

export default function FounderProfilePage() {
  const params = useParams();
  const router = useRouter();
  const {
    currentUser,
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

  // Editable Profile Info state
  const [profileName, setProfileName] = useState(mockFounder?.name || 'Founder');
  const [profileLocation, setProfileLocation] = useState(mockFounder?.location || 'Bengaluru, India');
  const [profileBio, setProfileBio] = useState(
    mockFounder?.bio ||
      'Exploring ideas, building Growing Moon and learning from every mistake. Interested in technology, people and the process of turning curiosity into meaningful work.'
  );

  // Extended Profile Details ("I can help with", "I am figuring out", "I am open to", 3 Focus Items)
  const [canHelpWith, setCanHelpWith] = useState(
    'Frontend development, product thinking and early-stage experimentation.'
  );
  const [figuringOut, setFiguringOut] = useState(
    'Customer acquisition, fundraising and building sustainable communities.'
  );
  const [openTo, setOpenTo] = useState(
    'Meaningful conversations, collaborations and feedback from fellow builders.'
  );
  const [focus1, setFocus1] = useState('Building Growing Moon');
  const [focus2, setFocus2] = useState('Learning AI');
  const [focus3, setFocus3] = useState('Personal Growth');

  // Modals state
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [isNewJourneyOpen, setIsNewJourneyOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isAboutExpanded, setIsAboutExpanded] = useState(false);

  // New Journey input state
  const [newJourneyTitle, setNewJourneyTitle] = useState('');
  const [newJourneyDesc, setNewJourneyDesc] = useState('');
  const [newJourneyVisibility, setNewJourneyVisibility] = useState<'Public' | 'Private'>('Public');

  // Journeys list
  const [journeysList, setJourneysList] = useState([
    {
      id: 'j-gm',
      title: 'Creating Growing Moon',
      description: 'Building a platform to help early-stage founders find the right people at the right time.',
      dateRange: '1 Sept 2026 – Present',
      visibility: 'Public' as const,
      color: 'bg-[#EEEDFE] text-[#6258DB]',
      dotColor: 'bg-[#6258DB]',
      icon: Rocket,
      link: '/passport/demo',
    },
    {
      id: 'j-ai',
      title: 'Learning Artificial Intelligence',
      description: 'Exploring AI tools and building small projects to apply them in real life.',
      dateRange: '15 Aug 2026 – Present',
      visibility: 'Public' as const,
      color: 'bg-[#EEEDFE] text-[#6258DB]',
      dotColor: 'bg-[#6258DB]',
      icon: Laptop,
      link: '/passport/demo',
    },
    {
      id: 'j-fitness',
      title: 'Personal Fitness Journey',
      description: 'Building a healthier and more disciplined version of myself.',
      dateRange: '1 Jan 2026 – Present',
      visibility: 'Private' as const,
      color: 'bg-pink-50 text-pink-500',
      dotColor: 'bg-pink-400',
      icon: Dumbbell,
      link: '/passport/demo',
    },
  ]);

  // ── Fetch Live Profile from Backend ────────────────────────────
  useEffect(() => {
    let isMounted = true;
    const loadProfile = async () => {
      setLoadingProfile(true);
      try {
        const queryHandle = (username === 'you' || username === 'demo') ? currentUser.username : username;
        const profile = await usersApi.getByUsername(queryHandle);
        if (!isMounted) return;

        setLiveProfile(profile);
        setProfileName(profile.name);
        if (profile.location) setProfileLocation(profile.location);
        if (profile.bio) setProfileBio(profile.bio);

        if (profile.profile_details) {
          const pd = profile.profile_details;
          if (pd.can_help_with) setCanHelpWith(pd.can_help_with);
          if (pd.figuring_out) setFiguringOut(pd.figuring_out);
          if (pd.open_to) setOpenTo(pd.open_to);
          if (pd.current_focus_1) setFocus1(pd.current_focus_1);
          if (pd.current_focus_2) setFocus2(pd.current_focus_2);
          if (pd.current_focus_3) setFocus3(pd.current_focus_3);
        }

        // Fetch user posts to show real milestones
        try {
          const userPosts = await usersApi.getUserPosts(profile.id);
          if (userPosts && userPosts.length > 0) {
            const mapped = userPosts.map((p, idx) => ({
              id: p.id,
              title: p.headline || `Milestone Update #${userPosts.length - idx}`,
              description: p.content.slice(0, 120) + (p.content.length > 120 ? '...' : ''),
              dateRange: new Date(p.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) + ' – Present',
              visibility: 'Public' as const,
              color: 'bg-[#EEEDFE] text-[#6258DB]',
              dotColor: 'bg-[#6258DB]',
              icon: Rocket,
              link: `/updates/${p.id}`,
            }));
            setJourneysList(mapped);
          }
        } catch {}
      } catch (err) {
        // Fallback to local / mock state if unseeded or backend offline
      } finally {
        if (isMounted) setLoadingProfile(false);
      }
    };

    if (username) {
      loadProfile();
    }
    return () => {
      isMounted = false;
    };
  }, [username, currentUser.username]);

  const founder = liveProfile || mockFounder;

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

  const isOwner =
    founder?.id === currentUser.id ||
    username === 'you' ||
    username === 'demo' ||
    (liveProfile && liveProfile.username === currentUser.username);

  const handleToggleFollow = async () => {
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
    if (!liveProfile) return;
    if (liveProfile.connection_status === 'none') {
      setLiveProfile({ ...liveProfile, connection_status: 'pending-sent' });
      sendConnectionRequest(liveProfile.id);
    } else if (liveProfile.connection_status === 'pending-received') {
      setLiveProfile({ ...liveProfile, connection_status: 'connected' });
      acceptConnectionRequest(liveProfile.id);
    } else if (liveProfile.connection_status === 'connected') {
      setLiveProfile({ ...liveProfile, connection_status: 'none' });
      removeConnection(liveProfile.id);
    }
  };

  const handleCreateJourney = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJourneyTitle.trim()) return;

    const newJ = {
      id: 'j-' + Date.now(),
      title: newJourneyTitle.trim(),
      description: newJourneyDesc.trim() || 'Documenting my milestones and discoveries.',
      dateRange: 'Just now – Present',
      visibility: newJourneyVisibility,
      color: 'bg-[#EEEDFE] text-[#6258DB]',
      dotColor: 'bg-[#6258DB]',
      icon: Rocket,
      link: '/passport/demo',
    };

    setJourneysList((prev) => [newJ, ...prev]);
    setNewJourneyTitle('');
    setNewJourneyDesc('');
    setIsNewJourneyOpen(false);
    addToast(`Added new journey: "${newJ.title}"`, 'success');
  };

  const handleEditProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditProfileOpen(false);

    try {
      // 1. Update Core Profile in DB
      await usersApi.updateMe({
        name: profileName,
        location: profileLocation,
        bio: profileBio,
      });

      // 2. Update Extended Profile Details in DB
      await usersApi.updateProfileDetails({
        can_help_with: canHelpWith,
        figuring_out: figuringOut,
        open_to: openTo,
        current_focus: [focus1, focus2, focus3].filter(Boolean),
      });

      // 3. Update current user state in AppContext
      updateUser({
        name: profileName,
        location: profileLocation,
        bio: profileBio,
      });

      addToast('Profile and focus areas updated successfully!', 'success');
    } catch (err: any) {
      addToast(err?.message || 'Failed to update profile details', 'danger');
    }
  };

  // ── RENDER HELPERS: About & Interests (Adaptive for Mobile, Tablet, and Desktop) ────
  const renderAboutCard = () => (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-black/[0.04] shadow-xs relative overflow-hidden flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-2 relative z-10">
          <h3 className="text-sm font-bold text-[#141724]">About</h3>
          {isOwner && (
            <button
              type="button"
              onClick={() => setIsEditProfileOpen(true)}
              className="p-1 text-gray-400 hover:text-black transition-colors cursor-pointer"
              title="Edit about"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <p className="text-xs text-gray-600 leading-relaxed font-normal relative z-10 mb-3">
          I&apos;m an aspiring founder exploring my next step. Building in public, learning from mistakes and trying to create real value. Interested in meeting people who are also figuring things out.
        </p>

        <button
          type="button"
          onClick={() => setIsAboutExpanded(!isAboutExpanded)}
          className="text-xs font-bold text-[#6258DB] hover:underline inline-flex items-center gap-1 relative z-10 cursor-pointer"
        >
          <span>Read more →</span>
        </button>
      </div>

      {/* Ethereal Serene Landscape Graphic */}
      <div className="h-28 -mx-6 -mb-6 mt-3 relative overflow-hidden pointer-events-none select-none">
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
          {/* Lone Founder Silhouette standing looking at the crescent moon */}
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

  const renderInterestsCard = () => (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-black/[0.04] shadow-xs">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold text-[#141724]">Interests</h3>
        {isOwner && (
          <button
            type="button"
            onClick={() => setIsEditProfileOpen(true)}
            className="text-xs font-semibold text-[#6258DB] hover:underline cursor-pointer"
          >
            Edit
          </button>
        )}
      </div>

      {/* Concentric Orbital Radar Container */}
      <div className="relative w-64 h-64 mx-auto flex items-center justify-center select-none my-2">
        {/* Outer Ring */}
        <div className="absolute w-56 h-56 rounded-full border border-dashed border-gray-200" />
        {/* Middle Ring */}
        <div className="absolute w-40 h-40 rounded-full border border-gray-200/90" />
        {/* Inner Ring */}
        <div className="absolute w-24 h-24 rounded-full border border-dashed border-gray-200" />

        {/* Central Moon Sphere Emblem */}
        <div className="relative z-10 w-11 h-11 rounded-full bg-[#101322] flex items-center justify-center text-white shadow-md">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        </div>

        {/* Node 1: Startups (Top) */}
        <div className="absolute top-1 left-1/2 -translate-x-1/2 flex flex-col items-center">
          <span className="text-[11px] font-semibold text-[#141724] mb-1">Startups</span>
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF9900] shadow-[0_0_8px_rgba(255,153,0,0.6)]" />
        </div>

        {/* Node 2: AI (East/Right) */}
        <div className="absolute top-16 right-4 flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#6258DB] shadow-[0_0_8px_rgba(98,88,219,0.6)]" />
          <span className="text-[11px] font-semibold text-[#141724]">AI</span>
        </div>

        {/* Node 3: Product Thinking (South-East) */}
        <div className="absolute bottom-10 right-3 flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#06B6D4] shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
          <span className="text-[11px] font-semibold text-[#141724] leading-tight">Product<br />Thinking</span>
        </div>

        {/* Node 4: Reading (Bottom) */}
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex flex-col items-center">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF3366] shadow-[0_0_8px_rgba(255,51,102,0.6)] mb-1" />
          <span className="text-[11px] font-semibold text-[#141724]">Reading</span>
        </div>

        {/* Node 5: Fitness (West/Left) */}
        <div className="absolute bottom-14 left-4 flex items-center gap-1.5">
          <span className="text-[11px] font-semibold text-[#141724]">Fitness</span>
          <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
        </div>
      </div>
    </div>
  );

  // ── RIGHT SIDEBAR: 2 Cards (Displayed on Desktop >= xl) ────
  const rightSidebar = (
    <div className="space-y-4 sm:space-y-5 pt-0.5">
      {renderAboutCard()}
      {renderInterestsCard()}
    </div>
  );

  return (
    <AppShell rightSidebar={rightSidebar}>
      <div className="space-y-6 sm:space-y-8">
        
        {/* ── 1. PROFILE HEADER SECTION ──────────────────────────── */}
        <section className="flex flex-col sm:flex-row items-start justify-between gap-5">
          <div className="flex items-start gap-4 sm:gap-6 min-w-0 flex-1">
            
            {/* Avatar with Green Active Dot */}
            <div className="relative flex-shrink-0 w-20 h-20 sm:w-28 sm:h-28">
              <img
                src={
                  (founder as any)?.avatarImage ||
                  (founder as any)?.avatar_image ||
                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80"
                }
                alt={profileName}
                className="w-full h-full rounded-full object-cover shadow-sm ring-1 ring-black/[0.04] aspect-square"
              />
              <span
                className="absolute bottom-1 right-1 w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 rounded-full bg-[#10B981] border-2 sm:border-3 border-white shadow-xs"
                title="Active"
              />
            </div>

            {/* Profile Info: Name, Location, Bio */}
            <div className="min-w-0 flex-1">
              <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#141724] tracking-tight leading-tight">
                {profileName}
              </h1>

              <p className="text-xs text-gray-500 font-medium mt-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                <span>{profileLocation}</span>
              </p>

              <p className="text-xs sm:text-[13px] text-gray-600 mt-2.5 max-w-xl leading-relaxed font-normal">
                {profileBio}
              </p>
            </div>
          </div>

          {/* Action Buttons: Follow, Connect, Edit Profile & More Options */}
          <div className="flex items-center gap-2 self-start flex-shrink-0">
            {isOwner ? (
              <button
                type="button"
                onClick={() => setIsEditProfileOpen(true)}
                className="px-4 py-1.5 rounded-full border border-gray-300 hover:border-gray-400 bg-white text-xs font-semibold text-[#141724] shadow-2xs hover:bg-gray-50 transition-all cursor-pointer"
              >
                Edit Profile
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleToggleFollow}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    liveProfile?.is_following
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      : 'bg-[#6258DB] hover:bg-[#5247CE] text-white shadow-xs'
                  }`}
                >
                  {liveProfile?.is_following ? 'Following' : '+ Follow'}
                </button>
                <button
                  type="button"
                  onClick={handleConnectionAction}
                  className={`px-4 py-1.5 rounded-full border text-xs font-semibold transition-all cursor-pointer ${
                    liveProfile?.connection_status === 'connected'
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                      : liveProfile?.connection_status === 'pending-sent'
                      ? 'border-amber-300 bg-amber-50 text-amber-700'
                      : liveProfile?.connection_status === 'pending-received'
                      ? 'border-[#6258DB] bg-[#EEEDFE] text-[#6258DB]'
                      : 'border-gray-300 hover:border-gray-400 bg-white text-[#141724]'
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
              </div>
            )}

            <div className="relative">
              <button
                type="button"
                onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                className="w-8 h-8 rounded-full border border-gray-200/90 hover:border-gray-300 flex items-center justify-center text-gray-500 hover:text-black transition-colors cursor-pointer"
                title="More options"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {isMoreMenuOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setIsMoreMenuOpen(false)} />
                  <div className="absolute right-0 top-10 bg-white text-gray-800 rounded-2xl shadow-xl border border-gray-100 p-1.5 z-40 min-w-[170px] text-xs font-medium animate-in fade-in zoom-in-95">
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
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        {/* ── 2. CELESTIAL WAYPOINTS VISUAL ("Right now, I'm here") ─ */}
        <section className="relative pt-2 pb-2 overflow-x-auto scrollbar-none">
          <div className="min-w-[620px] relative">
            
            {/* Top Row: Annotation + Planet + Undulating Orbit Track with Nodes */}
            <div className="relative h-44 flex items-center">
              
              {/* Handwritten Script Annotation on Left */}
              <div className="absolute left-2 top-2 z-20 flex flex-col items-start select-none">
                <span className="font-handwriting text-2xl sm:text-[26px] text-[#141724] font-medium leading-none">
                  Right now,
                </span>
                <span className="font-handwriting text-2xl sm:text-[26px] text-[#141724] font-medium leading-none mt-1">
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
                  {/* Atmospheric Glow */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-600/30 to-indigo-500/20 blur-xl scale-125" />

                  {/* Planet Sphere */}
                  <div className="relative z-10 w-16 h-16 rounded-full bg-gradient-to-br from-[#9D88FF] via-[#6B4EFF] to-[#341B9A] shadow-[0_10px_25px_rgba(107,78,255,0.45)] overflow-hidden">
                    {/* Inner highlight */}
                    <div className="absolute top-1 left-2 w-7 h-5 rounded-full bg-white/40 blur-xs" />
                  </div>

                  {/* Tilted Orbital Ring */}
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

              {/* Responsive SVG Connecting Track running through waypoints */}
              <svg
                className="w-full h-full absolute inset-0 pointer-events-none"
                viewBox="0 0 680 160"
                fill="none"
              >
                {/* Undulating Waypoint Curve */}
                <path
                  d="M 180 88 Q 230 75 270 82 T 370 102 T 480 105 T 580 92 T 660 88"
                  stroke="#E2E0D8"
                  strokeWidth="1.8"
                  strokeDasharray="4 4"
                  fill="none"
                />

                {/* Waypoint 1: Pink Dot (Building Growing Moon) */}
                <circle cx="270" cy="82" r="5.5" fill="#FF3366" />
                <circle cx="270" cy="82" r="11" fill="#FF3366" fillOpacity="0.18" />

                {/* Waypoint 2: Orange/Amber Dot (Learning AI) */}
                <circle cx="390" cy="102" r="5.5" fill="#FF9900" />
                <circle cx="390" cy="102" r="11" fill="#FF9900" fillOpacity="0.18" />

                {/* Waypoint 3: Green Dot (Personal Growth) */}
                <circle cx="510" cy="105" r="5.5" fill="#10B981" />
                <circle cx="510" cy="105" r="11" fill="#10B981" fillOpacity="0.18" />

                {/* Terminal Dot */}
                <circle cx="600" cy="90" r="3" fill="#A8A29E" />
              </svg>

              {/* HTML Labels overlayed precisely above & below the Waypoints */}
              
              {/* Waypoint 1 Labels */}
              <div className="absolute left-[235px] top-6 text-center w-36 pointer-events-none select-none">
                <span className="font-handwriting text-lg text-[#141724] font-bold block leading-tight">
                  {focus1}
                </span>
              </div>
              <div className="absolute left-[235px] top-[108px] text-left w-36 pointer-events-none select-none">
                <p className="text-[10px] text-gray-500 font-normal leading-tight">
                  Current Primary Focus
                </p>
              </div>

              {/* Waypoint 2 Labels */}
              <div className="absolute left-[355px] top-12 text-center w-36 pointer-events-none select-none">
                <span className="font-handwriting text-lg text-[#141724] font-bold block leading-tight">
                  {focus2}
                </span>
              </div>
              <div className="absolute left-[355px] top-[125px] text-left w-36 pointer-events-none select-none">
                <p className="text-[10px] text-gray-500 font-normal leading-tight">
                  Active Growth Project
                </p>
              </div>

              {/* Waypoint 3 Labels */}
              <div className="absolute left-[475px] top-12 text-center w-36 pointer-events-none select-none">
                <span className="font-handwriting text-lg text-[#141724] font-bold block leading-tight">
                  {focus3}
                </span>
              </div>
              <div className="absolute left-[475px] top-[128px] text-left w-36 pointer-events-none select-none">
                <p className="text-[10px] text-gray-500 font-normal leading-tight">
                  Habit & Lifestyle Goal
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* ── 3. THREE HELP / FIGURING OUT / OPEN TO COLUMNS ───────── */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-5 pb-6 border-t border-b border-gray-100">
          
          {/* Column 1: I can help with */}
          <div className="flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-serif italic text-sm sm:text-[15px] font-semibold text-[#141724]">
                I can help with
              </h4>
              <p className="text-xs text-gray-500 leading-relaxed mt-1.5 font-normal">
                {canHelpWith}
              </p>
            </div>
          </div>

          {/* Column 2: I'm figuring out */}
          <div className="flex items-start gap-3 md:border-l md:border-gray-100 md:pl-6">
            <span className="text-blue-500 font-bold text-base leading-none flex-shrink-0 mt-0.5">
              ≈
            </span>
            <div>
              <h4 className="font-serif italic text-sm sm:text-[15px] font-semibold text-[#141724]">
                I&apos;m figuring out
              </h4>
              <p className="text-xs text-gray-500 leading-relaxed mt-1.5 font-normal">
                {figuringOut}
              </p>
            </div>
          </div>

          {/* Column 3: I'm open to */}
          <div className="flex items-start gap-3 md:border-l md:border-gray-100 md:pl-6">
            <span className="text-amber-600 text-sm leading-none flex-shrink-0 mt-0.5">
              🌱
            </span>
            <div>
              <h4 className="font-serif italic text-sm sm:text-[15px] font-semibold text-[#141724]">
                I&apos;m open to
              </h4>
              <p className="text-xs text-gray-500 leading-relaxed mt-1.5 font-normal">
                {openTo}
              </p>
            </div>
          </div>

        </section>

        {/* ── 3.5 ABOUT & INTERESTS (Adaptive: Visible on Mobile & Tablet: < xl) ── */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1 xl:hidden">
          {renderAboutCard()}
          {renderInterestsCard()}
        </section>

        {/* ── 4. MY JOURNEYS SECTION ─────────────────────────────── */}
        <section className="pt-1">
          {/* Header Row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-baseline gap-2.5">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#141724]">
                My Journeys
              </h2>
              <span className="text-xs text-gray-400 font-medium">
                {journeysList.length} journeys
              </span>
            </div>

            {isOwner && (
              <button
                type="button"
                onClick={() => setIsNewJourneyOpen(true)}
                className="bg-[#6258DB] hover:bg-[#5247CE] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>New Journey</span>
              </button>
            )}
          </div>

          {/* Connected Vertical Timeline of Journeys */}
          <div className="relative pl-1">
            {/* Connecting vertical rail */}
            <div className="absolute left-[95px] sm:left-[118px] top-6 bottom-10 w-[1.5px] bg-gray-200" />

            <div className="space-y-4">
              {journeysList.map((j) => {
                const Icon = j.icon;
                return (
                  <Link
                    key={j.id}
                    href={j.link}
                    className="flex items-center group cursor-pointer"
                  >
                    {/* Left Date Column */}
                    <div className="w-20 sm:w-28 text-right pr-3 sm:pr-4 flex-shrink-0 select-none">
                      <span className="text-[11px] font-medium text-gray-400 block leading-tight">
                        {j.dateRange.split('–')[0]}
                      </span>
                      <span className="text-[10px] text-gray-400 block mt-0.5">
                        – {j.dateRange.split('–')[1] || 'Present'}
                      </span>
                    </div>

                    {/* Rail Dot */}
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${j.dotColor} z-10 flex-shrink-0 -ml-[5px] mr-3 sm:mr-4.5`}
                    />

                    {/* Journey Card */}
                    <div className="flex-1 flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-white hover:bg-gray-50/80 border border-black/[0.03] shadow-xs group-hover:shadow-md transition-all">
                      <div className="flex items-center gap-3.5 min-w-0">
                        {/* Icon Container */}
                        <div
                          className={`w-11 h-11 rounded-2xl ${j.color} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}
                        >
                          <Icon className="w-5 h-5 stroke-[2]" />
                        </div>

                        {/* Title, Badge, Description */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs sm:text-sm font-bold text-[#141724] group-hover:text-[#6258DB] transition-colors truncate">
                              {j.title}
                            </span>
                            {j.visibility === 'Public' ? (
                              <span className="text-[10px] font-bold text-[#0E9F6E] bg-[#E8FAF0] px-2 py-0.5 rounded-full flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#0E9F6E]" />
                                Public
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                🔒 Private
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5 truncate font-normal">
                            {j.description}
                          </p>
                        </div>
                      </div>

                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#141724] group-hover:translate-x-0.5 transition-all flex-shrink-0 ml-2" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

      </div>

      {/* ── Modal: Edit Profile ─────────────────────────────────── */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setIsEditProfileOpen(false)}
          />
          <form
            onSubmit={handleEditProfileSubmit}
            className="relative bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-gray-100 max-w-lg w-full z-10 space-y-4 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-[#141724]">
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
              <h4 className="text-xs font-bold text-[#141724] uppercase tracking-wider text-gray-400">
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
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#6258DB]"
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
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#6258DB]"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Bio & Vision
                </label>
                <textarea
                  rows={2}
                  value={profileBio}
                  onChange={(e) => setProfileBio(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#6258DB] resize-none"
                  required
                />
              </div>
            </div>

            {/* Extended Details */}
            <div className="space-y-3 pt-2 border-t border-gray-100">
              <h4 className="text-xs font-bold text-[#141724] uppercase tracking-wider text-gray-400">
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
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#6258DB]"
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
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#6258DB]"
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
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#6258DB]"
                />
              </div>
            </div>

            {/* 3 Focus Items */}
            <div className="space-y-3 pt-2 border-t border-gray-100">
              <h4 className="text-xs font-bold text-[#141724] uppercase tracking-wider text-gray-400">
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
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#6258DB]"
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
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#6258DB]"
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
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#6258DB]"
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
                className="px-5 py-2 rounded-full bg-[#6258DB] hover:bg-[#5247CE] text-white text-xs font-bold shadow-sm cursor-pointer"
              >
                Save Profile & Details
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Modal: Activity History Audit ────────────────────────── */}
      <ActivityHistoryModal
        isOpen={isActivityModalOpen}
        onClose={() => setIsActivityModalOpen(false)}
      />

      {/* ── Modal: New Journey ──────────────────────────────────── */}
      {isNewJourneyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setIsNewJourneyOpen(false)}
          />
          <form
            onSubmit={handleCreateJourney}
            className="relative bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-gray-100 max-w-md w-full z-10 space-y-4 animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#141724]">
                Create a New Journey
              </h3>
              <button
                type="button"
                onClick={() => setIsNewJourneyOpen(false)}
                className="p-1 text-gray-400 hover:text-black transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Journey Name
              </label>
              <input
                type="text"
                placeholder="e.g. Scaling AI Workflows to ₹50K MRR"
                value={newJourneyTitle}
                onChange={(e) => setNewJourneyTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#6258DB]"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Short Description
              </label>
              <textarea
                rows={2}
                placeholder="What is the objective or thesis of this journey?"
                value={newJourneyDesc}
                onChange={(e) => setNewJourneyDesc(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#6258DB] resize-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Visibility
              </label>
              <select
                value={newJourneyVisibility}
                onChange={(e) => setNewJourneyVisibility(e.target.value as 'Public' | 'Private')}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#6258DB]"
              >
                <option value="Public">Public (Visible on your profile)</option>
                <option value="Private">Private (Only visible to you)</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsNewJourneyOpen(false)}
                className="px-4 py-2 rounded-full text-xs font-semibold text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-full bg-[#6258DB] hover:bg-[#5247CE] text-white text-xs font-bold shadow-sm"
              >
                Add Journey
              </button>
            </div>
          </form>
        </div>
      )}

    </AppShell>
  );
}
