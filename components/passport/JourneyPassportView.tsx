'use client';
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import QRCode from 'react-qr-code';
import AppShell from '@/components/shared/AppShell';
import PostComposerModal, { type PostEditData } from '@/components/feed/PostComposerModal';
import { useApp } from '@/lib/state/AppContext';
import { usersApi, postsApi, passportsApi } from '@/lib/api/client';
import type { FounderProfile } from '@/types';
import {
  ArrowLeft,
  Rocket,
  MapPin,
  Calendar,
  Pencil,
  Trash2,
  AlertTriangle,
  MoreHorizontal,
  Plus,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Globe,
  FileText,
  Copy,
  Check,
  Sparkles,
  ExternalLink,
  Target,
  CheckCircle2,
  Flag,
  X,
  Clock,
} from 'lucide-react';
import ReportModal from '@/components/moderation/ReportModal';

type JourneyTimelineItem = {
  id: string;
  date: string;
  startDate?: string;
  endDate?: string;
  type: string;
  typeColor: string;
  dotColor: string;
  verification: 'Self-Reported' | 'Evidence-Backed';
  evidenceUrl?: string;
  evidenceLabel?: string;
  heading: string;
  summary: string;
  details?: string;
};

type JourneyGoalItem = {
  id: string;
  title: string;
  done: boolean;
  date: string;
};

// Zero dummy hardcoded items: clean start backed by PostgreSQL
const INITIAL_GOALS: JourneyGoalItem[] = [];
const INITIAL_TIMELINE_ITEMS: JourneyTimelineItem[] = [];

type JourneyPassportViewProps = {
  founder?: FounderProfile;
  isOwner?: boolean;
};

export default function JourneyPassportView({
  founder,
  isOwner = true,
}: JourneyPassportViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const journeyParam = searchParams ? searchParams.get('journey') : null;
  const { currentUser, updates, deleteUpdate, addToast } = useApp();

  const activeFounder = founder || currentUser;
  const isCurrentOwner = Boolean(
    isOwner ||
    (currentUser && activeFounder && (
      (activeFounder.id && currentUser.id && activeFounder.id === currentUser.id) ||
      (activeFounder.username && currentUser.username && activeFounder.username.toLowerCase() === currentUser.username.toLowerCase()) ||
      activeFounder.username === 'you' ||
      activeFounder.username === 'demo'
    )) ||
    !founder
  );

  // Tabs: timeline, about, goals (Statistics removed)
  const [activeTab, setActiveTab] = useState<'timeline' | 'about' | 'goals'>('timeline');

  // Journey Details state (editable)
  const [journeyTitle, setJourneyTitle] = useState(journeyParam || 'Creating Growing Moon');
  const [journeyTagline, setJourneyTagline] = useState('Helping people find someone ahead of them on their journey.');
  const [journeyAbout, setJourneyAbout] = useState(
    'Documenting the real journey of building Growing Moon — from idea to execution, challenges, learnings and milestones.'
  );
  const [journeyVisibility, setJourneyVisibility] = useState<'Public' | 'Private'>('Public');
  const [journeyFromDate, setJourneyFromDate] = useState<string>('1 Sept 2026');
  const [journeyToDate, setJourneyToDate] = useState<string>('Present');
  const [journeyCreatedAt, setJourneyCreatedAt] = useState<string>('1 Sept 2026');
  const [journeyUpdatedAt, setJourneyUpdatedAt] = useState<string>('Just now');

  // Goals state (editable)
  const [goals, setGoals] = useState<JourneyGoalItem[]>(INITIAL_GOALS);
  const [isEditGoalsModalOpen, setIsEditGoalsModalOpen] = useState(false);
  const [tempGoals, setTempGoals] = useState<JourneyGoalItem[]>(INITIAL_GOALS);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalDate, setNewGoalDate] = useState('');

  // Inline Goal adding state
  const [inlineNewGoalTitle, setInlineNewGoalTitle] = useState('');
  const [inlineNewGoalDate, setInlineNewGoalDate] = useState('');
  const [isAddingGoal, setIsAddingGoal] = useState(false);

  // About edit modal state
  const [isEditAboutModalOpen, setIsEditAboutModalOpen] = useState(false);
  const [tempAbout, setTempAbout] = useState(journeyAbout);

  // Edit Post state for PostComposerModal
  const [editingPostData, setEditingPostData] = useState<PostEditData | null>(null);

  // Sync title when journeyParam changes
  useEffect(() => {
    if (journeyParam) {
      setJourneyTitle(journeyParam);
    }
  }, [journeyParam]);

  // Timeline Items state
  const [timelineItems, setTimelineItems] = useState<JourneyTimelineItem[]>(INITIAL_TIMELINE_ITEMS);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({
    't-2': true,
  });

  // Timeline Item Delete states
  const [deletingTimelineItem, setDeletingTimelineItem] = useState<JourneyTimelineItem | null>(null);
  const [isDeletingTimelineItem, setIsDeletingTimelineItem] = useState(false);

  // Filtered Timeline Items for the selected journey
  const displayedTimelineItems = useMemo(() => {
    if (!journeyParam) return timelineItems;
    const filtered = timelineItems.filter(
      (item) =>
        item.type.toLowerCase().includes(journeyParam.toLowerCase()) ||
        item.heading.toLowerCase().includes(journeyParam.toLowerCase()) ||
        journeyParam.toLowerCase().includes(item.type.toLowerCase())
    );
    return filtered;
  }, [timelineItems, journeyParam]);

  // Fetch live milestone updates from backend if available
  useEffect(() => {
    let isMounted = true;
    if (activeFounder?.id) {
      usersApi
        .getUserPosts(activeFounder.id)
        .then((posts) => {
          if (!isMounted) return;
          const mapped: JourneyTimelineItem[] = (posts || []).map((p) => {
            const hasLink = p.content.includes('http://') || p.content.includes('https://');
            const urlMatch = p.content.match(/(https?:\/\/[^\s]+)/g);
            const mediaItem = p.media && p.media.length > 0 ? p.media[0] : null;

            const fromDateStr = p.start_date
              ? new Date(p.start_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
              : new Date(p.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
            const toDateStr = p.end_date
              ? new Date(p.end_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
              : 'Present';

            return {
              id: p.id,
              date: `${fromDateStr} → ${toDateStr}`,
              startDate: p.start_date || undefined,
              endDate: p.end_date || undefined,
              type: p.journey_tag || p.category || 'Progress Update',
              typeColor: 'bg-[#EEEDFE] text-[#6258DB]',
              dotColor: 'bg-[#6258DB]',
              verification: hasLink || mediaItem ? 'Evidence-Backed' : 'Self-Reported',
              evidenceUrl: mediaItem?.url || (urlMatch ? urlMatch[0] : undefined),
              evidenceLabel: (mediaItem as any)?.file_name || (urlMatch ? 'Interactive Evidence Link' : (mediaItem ? 'Media Proof' : undefined)),
              heading: p.headline || 'Milestone Update',
              summary: p.content.slice(0, 140) + (p.content.length > 140 ? '...' : ''),
              details: p.content,
            };
          });
          setTimelineItems(mapped);
        })
        .catch(() => {});
    }
    return () => {
      isMounted = false;
    };
  }, [activeFounder?.id]);

  // Fetch real journey details from database (About description, visibility, and dates)
  useEffect(() => {
    let isMounted = true;
    const target = activeFounder?.username || activeFounder?.id;
    if (target) {
      passportsApi
        .getUserPassports(target)
        .then((userPassports) => {
          if (!isMounted || !userPassports) return;
          const matched = journeyParam
            ? userPassports.find((p) => p.title.toLowerCase() === journeyParam.toLowerCase())
            : userPassports[0];
          if (matched) {
            if (matched.short_text) {
              setJourneyAbout(matched.short_text);
            }
            if (matched.title && !journeyParam) {
              setJourneyTitle(matched.title);
            }
            if (matched.is_public !== undefined) {
              setJourneyVisibility(matched.is_public ? 'Public' : 'Private');
            }
            if (matched.start_date) {
              const d = new Date(matched.start_date);
              if (!isNaN(d.getTime())) {
                setJourneyFromDate(d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }));
              }
            }
            const endDateVal = (matched as any).end_date || (matched as any).to_date;
            if (endDateVal) {
              const d = new Date(endDateVal);
              if (!isNaN(d.getTime())) {
                setJourneyToDate(d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }));
              }
            } else {
              setJourneyToDate('Present');
            }
            if (matched.created_at) {
              const d = new Date(matched.created_at);
              if (!isNaN(d.getTime())) {
                setJourneyCreatedAt(d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }));
              }
            }
            if (matched.updated_at) {
              const d = new Date(matched.updated_at);
              if (!isNaN(d.getTime())) {
                setJourneyUpdatedAt(d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }));
              }
            }
          }
        })
        .catch(() => {});
    }
    return () => {
      isMounted = false;
    };
  }, [activeFounder?.username, activeFounder?.id, journeyParam]);

  // Fetch real goals from dedicated database table
  useEffect(() => {
    let isMounted = true;
    const targetUserId = activeFounder?.id || currentUser?.id;
    if (targetUserId) {
      passportsApi
        .getGoals(journeyTitle, targetUserId)
        .then((dbGoals) => {
          if (!isMounted) return;
          if (dbGoals) {
            setGoals(
              dbGoals.map((g) => ({
                id: g.id,
                title: g.title,
                done: g.is_completed,
                date: g.target_date || (g.is_completed ? 'Completed' : 'Target: Ongoing'),
              }))
            );
          }
        })
        .catch(() => {});
    }
    return () => {
      isMounted = false;
    };
  }, [journeyTitle, activeFounder?.id, currentUser?.id]);

  // Modal states
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Stable URL for SSR & initial hydration to prevent React hydration mismatch
  const [qrUrl, setQrUrl] = useState(`https://growingmoon.com/passport/${activeFounder.username}`);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setQrUrl(`${window.location.origin}/passport/${activeFounder.username}`);
    }
  }, [activeFounder.username]);

  const toggleItemExpansion = (id: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      const urlToCopy = typeof window !== 'undefined' ? window.location.href : qrUrl;
      navigator.clipboard.writeText(urlToCopy);
      setCopiedLink(true);
      addToast('Journey link copied to clipboard!', 'success');
      setTimeout(() => setCopiedLink(false), 2200);
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditModalOpen(false);
    addToast('Journey details updated!', 'success');
  };

  // Timeline Item Edit & Delete Handlers
  const handleOpenEditTimelineItem = (item: JourneyTimelineItem) => {
    const editData: PostEditData = {
      id: item.id,
      headline: item.heading,
      content: item.details || item.summary,
      journeyTag:
        item.type &&
        item.type !== 'Progress update' &&
        item.type !== 'Progress Update' &&
        item.type !== 'Milestone achieved' &&
        item.type !== 'Milestone Achieved' &&
        item.type !== 'Challenge' &&
        item.type !== 'Lesson learned' &&
        item.type !== 'Lesson Learned'
          ? item.type
          : journeyTitle,
      category: item.type,
      startDate: item.startDate,
      endDate: item.endDate,
      media: item.evidenceUrl
        ? [
            {
              id: 'ev-' + item.id,
              type: 'image',
              url: item.evidenceUrl,
              fileName: item.evidenceLabel || 'Evidence Proof',
            },
          ]
        : [],
    };
    setEditingPostData(editData);
    setIsComposerOpen(true);
  };

  const handlePostUpdated = (updated: PostEditData) => {
    setTimelineItems((prev) =>
      prev.map((item) =>
        item.id === updated.id
          ? {
              ...item,
              heading: updated.headline || item.heading,
              type: updated.category || item.type,
              summary:
                updated.content.slice(0, 140) +
                (updated.content.length > 140 ? '...' : ''),
              details: updated.content,
              evidenceUrl: updated.media?.[0]?.url,
              evidenceLabel: updated.media?.[0]?.fileName,
            }
          : item
      )
    );
    setEditingPostData(null);
  };

  const handleCloseComposer = () => {
    setIsComposerOpen(false);
    setEditingPostData(null);
  };

  // About Handlers
  const handleOpenEditAbout = () => {
    setTempAbout(journeyAbout);
    setIsEditAboutModalOpen(true);
  };

  const handleSaveAbout = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = tempAbout.trim();
    setJourneyAbout(text);
    setIsEditAboutModalOpen(false);
    try {
      await passportsApi.updateAbout(journeyTitle, text);
    } catch {}
    addToast('About description updated successfully!', 'success');
  };

  // Direct Goals Handlers (Inline Completion, Direct Add, and Delete)
  const handleToggleGoalCompleted = async (goalId: string) => {
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return;
    const newDone = !goal.done;
    setGoals((prev) =>
      prev.map((g) => (g.id === goalId ? { ...g, done: newDone } : g))
    );

    try {
      if (!goalId.startsWith('g-')) {
        await passportsApi.updateGoal(goalId, { is_completed: newDone });
      }
      addToast(newDone ? 'Milestone marked as completed! 🎉' : 'Milestone marked in progress.', 'success');
    } catch {
      setGoals((prev) =>
        prev.map((g) => (g.id === goalId ? { ...g, done: !newDone } : g))
      );
      addToast('Failed to update goal completion status.', 'danger');
    }
  };

  const handleAddGoalDirect = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inlineNewGoalTitle.trim()) return;
    setIsAddingGoal(true);
    const title = inlineNewGoalTitle.trim();
    const date = inlineNewGoalDate.trim() || 'Target: Upcoming';

    try {
      const created = await passportsApi.createGoal({
        journey_title: journeyTitle,
        title,
        target_date: date,
        is_completed: false,
      });
      setGoals((prev) => [
        ...prev,
        {
          id: created.id,
          title: created.title,
          done: created.is_completed,
          date: created.target_date || date,
        },
      ]);
      setInlineNewGoalTitle('');
      setInlineNewGoalDate('');
      addToast('Goal added to journey!', 'success');
    } catch {
      const tempId = 'g-' + Date.now();
      setGoals((prev) => [
        ...prev,
        {
          id: tempId,
          title,
          done: false,
          date,
        },
      ]);
      setInlineNewGoalTitle('');
      setInlineNewGoalDate('');
      addToast('Goal added!', 'success');
    } finally {
      setIsAddingGoal(false);
    }
  };

  const handleDeleteGoalDirect = async (goalId: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== goalId));
    try {
      if (!goalId.startsWith('g-')) {
        await passportsApi.deleteGoal(goalId);
      }
      addToast('Goal removed.', 'success');
    } catch {}
  };

  // Modal Goals Handlers
  const handleOpenEditGoals = () => {
    setTempGoals([...goals]);
    setNewGoalTitle('');
    setNewGoalDate('');
    setIsEditGoalsModalOpen(true);
  };

  const handleToggleTempGoalDone = (goalId: string) => {
    setTempGoals((prev) =>
      prev.map((g) => (g.id === goalId ? { ...g, done: !g.done } : g))
    );
  };

  const handleUpdateTempGoalText = (goalId: string, field: 'title' | 'date', val: string) => {
    setTempGoals((prev) =>
      prev.map((g) => (g.id === goalId ? { ...g, [field]: val } : g))
    );
  };

  const handleDeleteTempGoal = (goalId: string) => {
    setTempGoals((prev) => prev.filter((g) => g.id !== goalId));
  };

  const handleAddTempGoal = () => {
    if (!newGoalTitle.trim()) return;
    const item: JourneyGoalItem = {
      id: 'g-' + Date.now(),
      title: newGoalTitle.trim(),
      done: false,
      date: newGoalDate.trim() || 'Target: Upcoming',
    };
    setTempGoals((prev) => [...prev, item]);
    setNewGoalTitle('');
    setNewGoalDate('');
  };

  const handleSaveGoals = async (e: React.FormEvent) => {
    e.preventDefault();
    setGoals(tempGoals);
    setIsEditGoalsModalOpen(false);
    addToast('Goals and milestones updated successfully!', 'success');
  };

  const handleOpenDeleteConfirm = (item: JourneyTimelineItem) => {
    setDeletingTimelineItem(item);
  };

  const handleConfirmDelete = async () => {
    if (!deletingTimelineItem) return;
    setIsDeletingTimelineItem(true);
    try {
      const isMock = deletingTimelineItem.id.startsWith('t-');
      if (!isMock) {
        await postsApi.deletePost(deletingTimelineItem.id);
      }

      setTimelineItems((prev) => prev.filter((item) => item.id !== deletingTimelineItem.id));
      deleteUpdate(deletingTimelineItem.id);

      addToast('Timeline update deleted successfully.', 'success');
      setDeletingTimelineItem(null);
    } catch (err: any) {
      addToast(
        err?.message || 'Failed to delete timeline entry. Only the author can delete.',
        'danger'
      );
    } finally {
      setIsDeletingTimelineItem(false);
    }
  };

  // ── RIGHT SIDEBAR (Statistics removed) ────
  const rightSidebar = (
    <div className="space-y-4 sm:space-y-5 pt-0.5">
      {/* ── Card 1: JOURNEY PASSPORT QR CARD ─────────────────────── */}
      <div className="bg-white rounded-3xl p-6 border border-black/[0.04] shadow-xs text-center">
        <span className="text-[11px] font-extrabold text-[#6258DB] uppercase tracking-wider block mb-4">
          JOURNEY PASSPORT
        </span>

        {/* QR Code Container */}
        <div className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-2xs inline-block mx-auto">
          <QRCode
            value={qrUrl}
            size={150}
            bgColor="#FFFFFF"
            fgColor="#101322"
            level="M"
          />
        </div>

        {/* Title & Subtitle */}
        <h3 className="text-sm sm:text-base font-extrabold text-[#141724] mt-4 leading-snug">
          {journeyTitle}
        </h3>
        <p className="text-xs text-gray-500 font-medium mt-0.5">
          By {activeFounder.name}
        </p>

        <p className="text-[11px] text-gray-400 font-normal mt-2 leading-relaxed max-w-[210px] mx-auto">
          Scan to view the complete journey, evidence, learnings and more.
        </p>

        {/* Copy Journey Link Button */}
        <button
          type="button"
          onClick={handleCopyLink}
          className="w-full mt-4 py-2.5 px-4 rounded-xl bg-[#F4F3FF] hover:bg-[#EEEDFE] text-[#6258DB] text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer active:scale-95"
        >
          {copiedLink ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Link Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Journey Link</span>
            </>
          )}
        </button>
      </div>

      {/* ── Card 2: ABOUT THIS JOURNEY ─────────────────────────── */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-black/[0.04] shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-700" />
            <h4 className="text-xs sm:text-[13px] font-bold text-[#141724]">
              About this journey
            </h4>
          </div>
          {isCurrentOwner && (
            <button
              type="button"
              onClick={handleOpenEditAbout}
              className="p-1 text-gray-400 hover:text-black transition-colors cursor-pointer"
              title="Edit about details"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <p className="text-xs text-gray-500 font-normal leading-relaxed mt-2.5">
          {journeyAbout}
        </p>
      </div>
    </div>
  );

  return (
    <AppShell rightSidebar={rightSidebar}>
      <div className="space-y-5 sm:space-y-6">
        
        {/* ── Back to Profile Link (Only visible to journey author) ── */}
        {isCurrentOwner && (
          <div>
            <Link
              href={`/profile/${activeFounder.username}`}
              className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-[#141724] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to profile</span>
            </Link>
          </div>
        )}

        {/* ── 1. HERO CARD: Midnight Navy Card (Exact Xerox) ─────── */}
        <div className="bg-[#101322] text-white rounded-[22px] sm:rounded-[30px] p-4.5 sm:p-7 shadow-lg relative overflow-hidden">
          {/* Subtle radial decorative sheen */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-indigo-600/10 via-purple-600/5 to-transparent rounded-full pointer-events-none blur-2xl" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-4 sm:gap-5">
            
            {/* Left: Icon, Category, Title, Tagline, Meta Row */}
            <div className="flex items-start gap-3.5 sm:gap-5 min-w-0 flex-1">
              {/* Rocket Icon in Rounded Box */}
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/[0.08] border border-white/10 flex items-center justify-center text-white flex-shrink-0 shadow-sm mt-0.5">
                <Rocket className="w-6 h-6 sm:w-7 sm:h-7 stroke-[1.8]" />
              </div>

              <div className="min-w-0 flex-1">
                {/* Category label */}
                <span className="text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                  PUBLIC JOURNEY
                </span>

                {/* Journey Title */}
                <h1 className="text-xl sm:text-2xl lg:text-[26px] font-extrabold text-white tracking-tight leading-snug truncate">
                  {journeyTitle}
                </h1>

                {/* Tagline */}
                <p className="text-xs sm:text-sm text-gray-300 font-normal mt-1 leading-relaxed max-w-xl">
                  {journeyTagline}
                </p>

                {/* Meta details row: Avatar, Location, Date */}
                <div className="flex items-center gap-3 sm:gap-4 mt-3 flex-wrap text-xs text-gray-400">
                  {/* Founder */}
                  <div className="flex items-center gap-1.5 text-white font-semibold">
                    <span className="w-5 h-5 rounded-full bg-[#6258DB] text-white font-bold text-[9px] flex items-center justify-center flex-shrink-0">
                      YD
                    </span>
                    <span>{activeFounder.name}</span>
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <span>{activeFounder.location || 'Bengaluru'}</span>
                  </div>

                  {/* Journey Timeline: From Date -> To Date */}
                  <div className="inline-flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-full text-xs text-gray-200">
                    <Calendar className="w-3.5 h-3.5 text-[#AFA9EC] flex-shrink-0" />
                    <span>From: <strong className="text-white font-semibold">{journeyFromDate}</strong></span>
                    <span className="text-gray-400">→</span>
                    <span>To: <strong className="text-white font-semibold">{journeyToDate}</strong></span>
                  </div>

                  {/* Audit Timestamps */}
                  <div className="inline-flex items-center gap-1.5 text-[11px] text-gray-400">
                    <Clock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <span>Created: {journeyCreatedAt}</span>
                    <span>·</span>
                    <span>Updated: {journeyUpdatedAt}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Action Buttons: Edit Journey & More Options */}
            <div className="flex items-center gap-2 self-start flex-shrink-0">
              {isCurrentOwner && (
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(true)}
                  className="px-4 py-2 rounded-full border border-white/20 hover:border-white/40 bg-white/[0.05] hover:bg-white/10 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs active:scale-95"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Edit Journey</span>
                </button>
              )}

              {/* Three dots button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="w-9 h-9 rounded-full border border-white/20 hover:border-white/40 bg-white/[0.05] hover:bg-white/10 text-white flex items-center justify-center transition-colors cursor-pointer shadow-xs active:scale-95"
                  title="More options"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>

                {isMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setIsMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-11 bg-white text-gray-800 rounded-2xl shadow-xl border border-gray-100 p-1.5 z-40 min-w-[170px] text-xs font-medium animate-in fade-in zoom-in-95">
                      <button
                        type="button"
                        onClick={() => {
                          handleCopyLink();
                          setIsMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                      >
                        <Copy className="w-3.5 h-3.5 text-gray-400" />
                        <span>Copy Public Link</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditModalOpen(true);
                          setIsMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                      >
                        <Pencil className="w-3.5 h-3.5 text-gray-400" />
                        <span>Edit Journey Info</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsReportModalOpen(true);
                          setIsMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-50 flex items-center gap-2 text-rose-600 cursor-pointer"
                      >
                        <Flag className="w-3.5 h-3.5 text-rose-500" />
                        <span>Report Journey</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Report Modal */}
            <ReportModal
              isOpen={isReportModalOpen}
              onClose={() => setIsReportModalOpen(false)}
              targetType="journey"
              targetId={activeFounder.id}
              targetTitle={journeyTitle}
            />

          </div>
        </div>

        {/* ── 2. TABS & + ADD UPDATE ROW ─────────────────────────── */}
        <div className="flex items-center justify-between border-b border-gray-200/80 pb-0.5 gap-3 flex-wrap">
          {/* Tabs (Stats removed) */}
          <div className="flex items-center gap-6 sm:gap-8 overflow-x-auto scrollbar-none">
            {[
              { id: 'timeline', label: 'Timeline' },
              { id: 'about', label: 'About' },
              { id: 'goals', label: 'Goals' },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`text-xs sm:text-sm pb-3 font-semibold transition-all relative cursor-pointer select-none ${
                    isActive
                      ? 'text-[#141724] font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#6258DB] after:rounded-full'
                      : 'text-gray-500 hover:text-[#141724]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* + Add Update Button */}
          {isCurrentOwner && (
            <button
              type="button"
              onClick={() => {
                setEditingPostData(null);
                setIsComposerOpen(true);
              }}
              className="bg-[#6258DB] hover:bg-[#5247CE] text-white px-4.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm hover:shadow transition-all cursor-pointer active:scale-95 mb-2 sm:mb-0"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add Update</span>
            </button>
          )}
        </div>

        {/* ── 3. MAIN TAB CONTENT ────────────────────────────────── */}
        
        {/* TAB 1: TIMELINE (Exact Xerox of media_1793441428502_e096c514.png) */}
        {activeTab === 'timeline' && (
          <div className="relative pt-2">
            
            {displayedTimelineItems.length === 0 ? (
              <div className="py-14 text-center bg-white rounded-3xl border border-gray-100 p-8 shadow-xs">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#6258DB] mx-auto flex items-center justify-center mb-3">
                  <Rocket className="w-6 h-6 stroke-[1.8]" />
                </div>
                <p className="text-sm font-bold text-[#141724]">
                  No updates for this journey yet
                </p>
                <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto leading-relaxed">
                  {isCurrentOwner
                    ? "Share your milestones, learnings, and authentic progress. Click below to add your first journey update!"
                    : "The founder hasn't posted any updates for this journey yet."}
                </p>
                {isCurrentOwner && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingPostData(null);
                      setIsComposerOpen(true);
                    }}
                    className="mt-4 px-4.5 py-2 rounded-full bg-[#6258DB] hover:bg-[#5247CE] text-white text-xs font-bold shadow-sm inline-flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Add First Update</span>
                  </button>
                )}
              </div>
            ) : (
              /* The Connected Vertical Track */
              <div className="space-y-4 sm:space-y-5">
                {displayedTimelineItems.map((item, index) => {
                  const isExpanded = !!expandedItems[item.id];
                  const isLast = index === displayedTimelineItems.length - 1;

                return (
                  <div key={item.id} className="flex items-start group relative">
                    
                    {/* 1. Date Column (Left) */}
                    <div className="w-16 sm:w-24 md:w-28 text-right pr-2.5 sm:pr-4 pt-4 flex-shrink-0 select-none">
                      <span className="text-[10px] sm:text-[11px] font-bold text-gray-500 tracking-wider uppercase block">
                        {item.date}
                      </span>
                    </div>

                    {/* 2. Rail + Marker Dot */}
                    <div className="relative flex flex-col items-center flex-shrink-0 self-stretch">
                      {/* Connecting vertical rail segment */}
                      {!isLast && (
                        <div className="absolute top-5 bottom-0 w-[2px] bg-gray-200" />
                      )}
                      {/* Colored marker dot */}
                      <div
                        className={`w-3.5 h-3.5 rounded-full ${item.dotColor} border-2 border-white shadow-xs z-10 mt-4.5 flex-shrink-0`}
                      />
                    </div>

                    {/* 3. Event Card (Right) */}
                    <div className="flex-1 ml-3 sm:ml-5">
                      <div
                        onClick={() => toggleItemExpansion(item.id)}
                        className="bg-white rounded-2xl p-4 sm:p-5 border border-black/[0.04] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-md transition-all cursor-pointer group/card"
                      >
                        {/* Top Row: Type Pill (Left) & Verification Pill + Chevron (Right) */}
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          {/* Type Pill */}
                          <span
                            className={`text-[11px] font-bold px-3 py-1 rounded-full ${item.typeColor} inline-block`}
                          >
                            {item.type}
                          </span>

                          {/* Right: Verification Pill + Author Actions + Chevron */}
                          <div className="flex items-center gap-1.5 ml-auto">
                            {item.verification === 'Evidence-Backed' ? (
                              <span className="text-[10px] font-bold text-[#0E9F6E] bg-[#E8FAF0] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3 stroke-[2.2]" />
                                <span>Evidence-Backed</span>
                              </span>
                            ) : (
                              <span className="text-[10px] font-medium text-gray-600 bg-gray-100 px-2.5 py-0.5 rounded-full">
                                Self-Reported
                              </span>
                            )}

                            {/* Author-only Timeline Edit & Delete Controls */}
                            {isCurrentOwner && (
                              <div
                                className="flex items-center gap-1 ml-1 pl-1.5 border-l border-gray-100"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditTimelineItem(item)}
                                  className="p-1 text-gray-400 hover:text-[#6258DB] hover:bg-purple-50 rounded-md transition-colors cursor-pointer"
                                  title="Edit update"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOpenDeleteConfirm(item)}
                                  className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                                  title="Delete update"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}

                            <div className="p-0.5 text-gray-400 group-hover/card:text-[#141724] transition-colors">
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Timeline Date Range Pill */}
                        <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#6258DB] bg-[#EEEDFE] px-2.5 py-0.5 rounded-full mt-2">
                          <Calendar className="w-3 h-3 text-[#6258DB] flex-shrink-0" />
                          <span>Timeline: {item.date}</span>
                        </div>

                        {/* Heading */}
                        <h3 className="text-sm sm:text-base font-bold text-[#141724] mt-2 group-hover/card:text-[#6258DB] transition-colors">
                          {item.heading}
                        </h3>

                        {/* One-Line Summary */}
                        <p className="text-xs text-gray-600 font-normal mt-1 leading-relaxed">
                          {item.summary}
                        </p>

                        {/* Expanded Details Section */}
                        {isExpanded && item.details && (
                          <div className="mt-3.5 pt-3 border-t border-gray-100 text-xs text-gray-500 leading-relaxed space-y-2 animate-in fade-in duration-150">
                            <p>{item.details}</p>
                            {item.evidenceUrl && (
                              <div className="pt-1">
                                <a
                                  href={item.evidenceUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#6258DB] bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition-colors"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  <span>{item.evidenceLabel || 'View Proof Link'}</span>
                                </a>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

          </div>
        )}

        {/* TAB 2: ABOUT (Simplified Content Presentation - Clean readable text with author Edit option) */}
        {activeTab === 'about' && (
          <div className="py-2 max-w-2xl animate-in fade-in duration-150 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#141724]">
                  About this Journey
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Core thesis, context, and background behind this journey.
                </p>
              </div>
              {isCurrentOwner && (
                <button
                  type="button"
                  onClick={handleOpenEditAbout}
                  className="px-3.5 py-1.5 rounded-full border border-gray-200 hover:border-[#6258DB] bg-white text-[#6258DB] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs hover:bg-purple-50/40 active:scale-95"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Edit About</span>
                </button>
              )}
            </div>

            {journeyAbout ? (
              <p className="text-sm sm:text-[15px] text-gray-700 leading-relaxed font-normal whitespace-pre-line pt-1">
                {journeyAbout}
              </p>
            ) : (
              <div className="py-12 text-center bg-gray-50/60 rounded-3xl border border-gray-100 p-6">
                <p className="text-xs text-gray-500 font-medium">
                  No description provided for this journey yet.
                </p>
                {isCurrentOwner && (
                  <button
                    type="button"
                    onClick={handleOpenEditAbout}
                    className="mt-3 px-4.5 py-2 rounded-full bg-[#6258DB] hover:bg-[#5247CE] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Add Journey Description</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: GOALS & MILESTONES (Separate Dedicated Table, Strikethrough & Completed Button) */}
        {activeTab === 'goals' && (
          <div className="py-2 max-w-2xl space-y-5 animate-in fade-in duration-150">
            {/* Header with Title & Manage action */}
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#141724]">
                  Goals & Milestones
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Track key targets, achievements, and completed outcomes.
                </p>
              </div>
              {isCurrentOwner && (
                <button
                  type="button"
                  onClick={() => setIsEditGoalsModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-full border border-gray-200 hover:border-[#6258DB] bg-white text-[#6258DB] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs hover:bg-purple-50/40 active:scale-95"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Manage All Goals</span>
                </button>
              )}
            </div>

            {/* Inline Quick Add Form for Journey Author */}
            {isCurrentOwner && (
              <form
                onSubmit={handleAddGoalDirect}
                className="p-4 rounded-2xl border border-dashed border-[#6258DB]/30 bg-[#F4F3FF]/40 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#6258DB] uppercase tracking-wider flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New Goal or Milestone</span>
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={inlineNewGoalTitle}
                    onChange={(e) => setInlineNewGoalTitle(e.target.value)}
                    placeholder="e.g. Launch Beta to 100 users, Validate with 15 founders..."
                    className="flex-1 px-3.5 py-2 rounded-xl border border-gray-200 bg-white text-xs focus:outline-none focus:border-[#6258DB] focus:ring-2 focus:ring-[#6258DB]/20"
                    required
                  />
                  <input
                    type="text"
                    value={inlineNewGoalDate}
                    onChange={(e) => setInlineNewGoalDate(e.target.value)}
                    placeholder="Target date (e.g. Nov 2026)"
                    className="sm:w-44 px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs focus:outline-none focus:border-[#6258DB]"
                  />
                  <button
                    type="submit"
                    disabled={isAddingGoal || !inlineNewGoalTitle.trim()}
                    className="px-4.5 py-2 rounded-xl bg-[#6258DB] hover:bg-[#5247CE] text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 shadow-xs"
                  >
                    {isAddingGoal ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Goal</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Goals List (backed by dedicated database table) */}
            {goals.length === 0 ? (
              <div className="py-14 text-center bg-white rounded-3xl border border-gray-100 p-8 shadow-xs">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#6258DB] mx-auto flex items-center justify-center mb-3">
                  <Target className="w-6 h-6 stroke-[1.8]" />
                </div>
                <p className="text-sm font-bold text-[#141724]">No goals added yet</p>
                <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto leading-relaxed">
                  {isCurrentOwner
                    ? "You haven't set any goals for this journey yet. Use the form above to add your first milestone!"
                    : "No goals or milestones have been published for this journey yet."}
                </p>
              </div>
            ) : (
              <ul className="space-y-2.5 pt-1">
                {goals.map((g) => (
                  <li
                    key={g.id}
                    className={`flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border transition-all ${
                      g.done
                        ? 'bg-emerald-50/40 border-emerald-100/80 shadow-2xs'
                        : 'bg-white border-gray-100 shadow-2xs hover:border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1 pr-3">
                      {/* Checkbox Icon Button */}
                      <button
                        type="button"
                        onClick={() => handleToggleGoalCompleted(g.id)}
                        disabled={!isCurrentOwner}
                        className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                          g.done
                            ? 'bg-emerald-500 text-white shadow-xs'
                            : 'border-2 border-gray-300 hover:border-[#6258DB] bg-white'
                        } ${!isCurrentOwner ? 'cursor-default opacity-80' : 'cursor-pointer active:scale-90'}`}
                        title={
                          isCurrentOwner
                            ? g.done
                              ? 'Click to reopen'
                              : 'Click to mark completed'
                            : g.done
                            ? 'Completed milestone'
                            : 'Pending milestone'
                        }
                      >
                        {g.done && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>

                      {/* Goal Description & Strikethrough */}
                      <div className="min-w-0 flex-1">
                        <span
                          className={`text-xs sm:text-sm font-semibold block transition-all ${
                            g.done
                              ? 'text-gray-400 line-through'
                              : 'text-[#141724]'
                          }`}
                        >
                          {g.title}
                        </span>
                        {g.date && (
                          <span
                            className={`text-[11px] block mt-0.5 font-medium ${
                              g.done ? 'text-emerald-600' : 'text-gray-400'
                            }`}
                          >
                            {g.done ? `✓ Completed (${g.date})` : g.date}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right Action: Dedicated "Completed" / "Mark Completed" Button + Delete */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {isCurrentOwner && (
                        <button
                          type="button"
                          onClick={() => handleToggleGoalCompleted(g.id)}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                            g.done
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-[#F4F3FF] text-[#6258DB] hover:bg-[#6258DB] hover:text-white'
                          }`}
                        >
                          {g.done ? (
                            <>
                              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                              <span>Completed</span>
                            </>
                          ) : (
                            <span>Mark Completed</span>
                          )}
                        </button>
                      )}

                      {!isCurrentOwner && g.done && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Completed</span>
                        </span>
                      )}

                      {isCurrentOwner && (
                        <button
                          type="button"
                          onClick={() => handleDeleteGoalDirect(g.id)}
                          className="p-1.5 text-gray-300 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                          title="Delete goal"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

      </div>

      {/* ── Edit Journey Modal ──────────────────────────────────── */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setIsEditModalOpen(false)}
          />
          <form
            onSubmit={handleEditSubmit}
            className="relative bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-gray-100 max-w-lg w-full z-10 space-y-4 animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#141724]">
                Edit Journey Details
              </h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 text-gray-400 hover:text-black transition-colors"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Journey Title
              </label>
              <input
                type="text"
                value={journeyTitle}
                onChange={(e) => setJourneyTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#6258DB] focus:ring-2 focus:ring-[#6258DB]/20"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Short Tagline
              </label>
              <input
                type="text"
                value={journeyTagline}
                onChange={(e) => setJourneyTagline(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#6258DB] focus:ring-2 focus:ring-[#6258DB]/20"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                About this Journey
              </label>
              <textarea
                rows={3}
                value={journeyAbout}
                onChange={(e) => setJourneyAbout(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#6258DB] focus:ring-2 focus:ring-[#6258DB]/20 resize-none"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Visibility
              </label>
              <select
                value={journeyVisibility}
                onChange={(e) => setJourneyVisibility(e.target.value as typeof journeyVisibility)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#6258DB]"
              >
                <option value="Public">Public (Anyone on Growing Moon)</option>
                <option value="Private">Private (Only You)</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 rounded-full text-xs font-semibold text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-full bg-[#6258DB] hover:bg-[#5247CE] text-white text-xs font-bold shadow-sm"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Real Journey Update Modal (PostComposerModal) for Creating & Editing ── */}
      <PostComposerModal
        isOpen={isComposerOpen}
        onClose={handleCloseComposer}
        initialJourneyTitle={journeyTitle}
        editPost={editingPostData}
        onPostUpdated={handlePostUpdated}
      />

      {/* ── Edit About Modal ────────────────────────────────────── */}
      {isEditAboutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setIsEditAboutModalOpen(false)}
          />
          <form
            onSubmit={handleSaveAbout}
            className="relative bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-gray-100 max-w-lg w-full z-10 space-y-4 animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#6258DB] flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-[#141724]">
                  Edit About Description
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditAboutModalOpen(false)}
                className="p-1 text-gray-400 hover:text-black transition-colors rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Journey Description
              </label>
              <textarea
                rows={5}
                value={tempAbout}
                onChange={(e) => setTempAbout(e.target.value)}
                placeholder="Describe your journey, problem context, thesis, and vision..."
                className="w-full p-3.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#6258DB] focus:ring-2 focus:ring-[#6258DB]/20 resize-none"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsEditAboutModalOpen(false)}
                className="px-4 py-2 rounded-full text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-full bg-[#6258DB] hover:bg-[#5247CE] text-white text-xs font-bold shadow-sm transition-all cursor-pointer active:scale-95"
              >
                Save About
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Edit Goals Modal ────────────────────────────────────── */}
      {isEditGoalsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setIsEditGoalsModalOpen(false)}
          />
          <form
            onSubmit={handleSaveGoals}
            className="relative bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-gray-100 max-w-lg w-full z-10 space-y-4 animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col"
          >
            <div className="flex items-center justify-between pb-1 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#6258DB] flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#141724]">
                    Edit Goals & Milestones
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    Update current objectives, mark completion, or add new targets
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditGoalsModalOpen(false)}
                className="p-1 text-gray-400 hover:text-black transition-colors rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* List of existing goals to edit */}
            <div className="overflow-y-auto space-y-3 pr-1 py-1 flex-1">
              {tempGoals.map((g) => (
                <div
                  key={g.id}
                  className="p-3 rounded-2xl bg-gray-50 border border-gray-200/80 flex items-start gap-2.5"
                >
                  <button
                    type="button"
                    onClick={() => handleToggleTempGoalDone(g.id)}
                    className={`mt-1 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors cursor-pointer ${
                      g.done
                        ? 'bg-emerald-500 text-white'
                        : 'border border-gray-300 hover:border-[#6258DB]'
                    }`}
                    title={g.done ? 'Mark pending' : 'Mark completed'}
                  >
                    {g.done && <Check className="w-3 h-3 stroke-[2.5]" />}
                  </button>

                  <div className="flex-1 space-y-1.5 min-w-0">
                    <input
                      type="text"
                      value={g.title}
                      onChange={(e) => handleUpdateTempGoalText(g.id, 'title', e.target.value)}
                      placeholder="Goal description..."
                      className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs bg-white focus:outline-none focus:border-[#6258DB]"
                      required
                    />
                    <input
                      type="text"
                      value={g.date}
                      onChange={(e) => handleUpdateTempGoalText(g.id, 'date', e.target.value)}
                      placeholder="Target date or status (e.g. Completed Oct 2026, Target: Q1 2027)"
                      className="w-full px-2.5 py-1 rounded-lg border border-gray-200 text-[11px] text-gray-500 bg-white focus:outline-none focus:border-[#6258DB]"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteTempGoal(g.id)}
                    className="p-1.5 text-gray-400 hover:text-rose-600 transition-colors rounded-lg cursor-pointer flex-shrink-0"
                    title="Remove goal"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {/* Add New Goal Box */}
              <div className="p-3 rounded-2xl border border-dashed border-gray-300 bg-purple-50/30 space-y-2 mt-2">
                <span className="text-[11px] font-bold text-[#6258DB] uppercase tracking-wider block">
                  + Add New Goal
                </span>
                <input
                  type="text"
                  value={newGoalTitle}
                  onChange={(e) => setNewGoalTitle(e.target.value)}
                  placeholder="New goal or milestone title..."
                  className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs bg-white focus:outline-none focus:border-[#6258DB]"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newGoalDate}
                    onChange={(e) => setNewGoalDate(e.target.value)}
                    placeholder="Target date (e.g. Target: Dec 2026)"
                    className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs bg-white focus:outline-none focus:border-[#6258DB]"
                  />
                  <button
                    type="button"
                    onClick={handleAddTempGoal}
                    disabled={!newGoalTitle.trim()}
                    className="px-3 py-1.5 rounded-lg bg-[#6258DB] hover:bg-[#5247CE] text-white text-xs font-semibold disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100 flex-shrink-0">
              <button
                type="button"
                onClick={() => setIsEditGoalsModalOpen(false)}
                className="px-4 py-2 rounded-full text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-full bg-[#6258DB] hover:bg-[#5247CE] text-white text-xs font-bold shadow-sm transition-all cursor-pointer active:scale-95"
              >
                Save Goals
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Delete Confirmation Modal ────────────────────────────── */}
      {deletingTimelineItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => !isDeletingTimelineItem && setDeletingTimelineItem(null)}
          />
          <div className="relative bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-gray-100 max-w-sm w-full z-10 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6 stroke-[2]" />
            </div>

            <div className="text-center">
              <h3 className="text-base font-bold text-[#141724]">
                Delete Timeline Entry?
              </h3>
              <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                Are you sure you want to delete &ldquo;{deletingTimelineItem.heading}&rdquo;? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2.5 pt-2">
              <button
                type="button"
                disabled={isDeletingTimelineItem}
                onClick={() => setDeletingTimelineItem(null)}
                className="px-4.5 py-2 rounded-full text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingTimelineItem}
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer active:scale-95"
              >
                {isDeletingTimelineItem ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Yes, Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </AppShell>
  );
}
