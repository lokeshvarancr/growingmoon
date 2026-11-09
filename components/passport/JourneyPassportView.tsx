'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import QRCode from 'react-qr-code';
import AppShell from '@/components/shared/AppShell';
import PostComposerModal from '@/components/feed/PostComposerModal';
import { useApp } from '@/lib/state/AppContext';
import { usersApi } from '@/lib/api/client';
import type { FounderProfile } from '@/types';
import {
  ArrowLeft,
  Rocket,
  MapPin,
  Calendar,
  Pencil,
  MoreHorizontal,
  Plus,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Globe,
  BarChart2,
  Users2,
  FileText,
  Copy,
  Check,
  Sparkles,
  ExternalLink,
  Target,
  CheckCircle2,
} from 'lucide-react';

type JourneyTimelineItem = {
  id: string;
  date: string;
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

const INITIAL_TIMELINE_ITEMS: JourneyTimelineItem[] = [
  {
    id: 't-1',
    date: '1 SEPT 2026',
    type: 'Journey Started',
    typeColor: 'bg-[#EEEDFE] text-[#6258DB]',
    dotColor: 'bg-[#6258DB]',
    verification: 'Self-Reported',
    heading: 'Decided to build Growing Moon',
    summary: 'I want to help people find others who are ahead of them on the same path.',
    details: 'Started brainstorming the initial product thesis: a transparent platform where people share real milestones, daily struggles, and authentic progress instead of vanity metrics.',
  },
  {
    id: 't-2',
    date: '1 OCT 2026',
    type: 'Progress Update',
    typeColor: 'bg-[#E8FAF0] text-[#0E9F6E]',
    dotColor: 'bg-[#10B981]',
    verification: 'Evidence-Backed',
    evidenceUrl: 'https://github.com/growingmoon/core',
    evidenceLabel: 'Interactive UI Prototype Build',
    heading: 'Built the first functional prototype',
    summary: 'Shipped a core interactive UI with mock database and connected key flows.',
    details: 'Completed the core feed layout, LinkedIn-inspired composer, passport QR generator, and milestone tracking modules after three intense sprint weeks.',
  },
  {
    id: 't-3',
    date: '15 NOV 2026',
    type: 'Milestone Achieved',
    typeColor: 'bg-[#FEF5E7] text-[#D97706]',
    dotColor: 'bg-[#F59E0B]',
    verification: 'Self-Reported',
    heading: 'Shared early prototype with 10 community members',
    summary: 'Hosted 1-on-1 walkthroughs with people pursuing similar goals.',
    details: 'Gathered qualitative insights from learners, builders, and runners in Bengaluru and Hyderabad across career, creative, and craft journeys.',
  },
  {
    id: 't-4',
    date: '28 NOV 2026',
    type: 'Challenge',
    typeColor: 'bg-[#FEECEC] text-[#E02424]',
    dotColor: 'bg-[#EF4444]',
    verification: 'Self-Reported',
    heading: 'Member engagement slower than expected',
    summary: 'Realised early momentum requires more targeted peer connections and clearer positioning.',
    details: 'People love the concept, but getting them to switch from passive lurking to active weekly logging requires tighter peer loops and instant validation mechanisms.',
  },
  {
    id: 't-5',
    date: '5 DEC 2026',
    type: 'Lesson Learned',
    typeColor: 'bg-[#E8F4FE] text-[#1A56DB]',
    dotColor: 'bg-[#3B82F6]',
    verification: 'Self-Reported',
    heading: 'Validate demand before building new features',
    summary: 'Spoke to 15 potential users and learned that core workflow matters more than extra features.',
    details: 'Decided to cut 4 planned speculative modules (bounties, complex analytics, video streams) and double down on making the timeline composer and passport verification bulletproof.',
  },
];

type JourneyPassportViewProps = {
  founder?: FounderProfile;
  isOwner?: boolean;
};

export default function JourneyPassportView({
  founder,
  isOwner = true,
}: JourneyPassportViewProps) {
  const router = useRouter();
  const { currentUser, updates, addToast } = useApp();

  const activeFounder = founder || currentUser;
  const isCurrentOwner = isOwner && activeFounder.id === currentUser.id;

  // Tabs
  const [activeTab, setActiveTab] = useState<'timeline' | 'about' | 'goals' | 'stats'>('timeline');

  // Journey Details state (editable)
  const [journeyTitle, setJourneyTitle] = useState('Creating Growing Moon');
  const [journeyTagline, setJourneyTagline] = useState('Helping people find someone ahead of them on their journey.');
  const [journeyAbout, setJourneyAbout] = useState(
    'Documenting the real journey of building Growing Moon — from idea to execution, challenges, learnings and milestones.'
  );
  const [journeyVisibility, setJourneyVisibility] = useState<'Public' | 'Private'>('Public');

  // Timeline Items state
  const [timelineItems, setTimelineItems] = useState<JourneyTimelineItem[]>(INITIAL_TIMELINE_ITEMS);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({
    't-2': true,
  });

  // Fetch live milestone updates from backend if available
  useEffect(() => {
    let isMounted = true;
    if (activeFounder?.id) {
      usersApi
        .getUserPosts(activeFounder.id)
        .then((posts) => {
          if (!isMounted) return;
          if (posts && posts.length > 0) {
            const mapped: JourneyTimelineItem[] = posts.map((p) => {
              const hasLink = p.content.includes('http://') || p.content.includes('https://');
              const urlMatch = p.content.match(/(https?:\/\/[^\s]+)/g);
              return {
                id: p.id,
                date: new Date(p.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase(),
                type: p.journey_tag || p.category || 'Progress Update',
                typeColor: 'bg-[#EEEDFE] text-[#6258DB]',
                dotColor: 'bg-[#6258DB]',
                verification: hasLink ? 'Evidence-Backed' : 'Self-Reported',
                evidenceUrl: urlMatch ? urlMatch[0] : undefined,
                evidenceLabel: urlMatch ? 'Interactive Evidence Link' : undefined,
                heading: p.headline || 'Milestone Update',
                summary: p.content.slice(0, 140) + (p.content.length > 140 ? '...' : ''),
                details: p.content,
              };
            });
            setTimelineItems(mapped);
          }
        })
        .catch(() => {});
    }
    return () => {
      isMounted = false;
    };
  }, [activeFounder?.id]);

  // Modal states
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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

  // ── RIGHT SIDEBAR (Exact Xerox of media_1793441428502_e096c514.png) ────
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

      {/* ── Card 2: JOURNEY STATS / META DETAILS ─────────────────── */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-black/[0.04] shadow-xs space-y-3.5">
        {/* Row 1: Visibility */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5 text-gray-600">
            <Globe className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="font-medium">Visibility</span>
          </div>
          <span className="text-[10px] font-bold text-[#0E9F6E] bg-[#E8FAF0] px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0E9F6E]" />
            {journeyVisibility}
          </span>
        </div>

        {/* Row 2: Started on */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5 text-gray-600">
            <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="font-medium">Started on</span>
          </div>
          <span className="font-semibold text-[#141724]">
            1 Sept 2026
          </span>
        </div>

        {/* Row 3: Total updates */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5 text-gray-600">
            <BarChart2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="font-medium">Total updates</span>
          </div>
          <span className="font-semibold text-[#141724]">
            {timelineItems.length}
          </span>
        </div>

        {/* Row 4: Followers */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5 text-gray-600">
            <Users2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="font-medium">Followers</span>
          </div>
          <span className="font-semibold text-[#141724]">
            12
          </span>
        </div>
      </div>

      {/* ── Card 3: ABOUT THIS JOURNEY ─────────────────────────── */}
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
              onClick={() => setIsEditModalOpen(true)}
              className="p-1 text-gray-400 hover:text-black transition-colors cursor-pointer"
              title="Edit journey details"
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
        
        {/* ── Back to Profile Link ───────────────────────────────── */}
        <div>
          <Link
            href={`/profile/${activeFounder.username}`}
            className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-[#141724] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to profile</span>
          </Link>
        </div>

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

                  {/* Started Date */}
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <span>Started 1 Sept 2026</span>
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
                    </div>
                  </>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* ── 2. TABS & + ADD UPDATE ROW ─────────────────────────── */}
        <div className="flex items-center justify-between border-b border-gray-200/80 pb-0.5 gap-3 flex-wrap">
          {/* Tabs */}
          <div className="flex items-center gap-6 sm:gap-8 overflow-x-auto scrollbar-none">
            {[
              { id: 'timeline', label: 'Timeline' },
              { id: 'about', label: 'About' },
              { id: 'goals', label: 'Goals' },
              { id: 'stats', label: 'Stats' },
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
              onClick={() => setIsComposerOpen(true)}
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
            
            {/* The Connected Vertical Track */}
            <div className="space-y-4 sm:space-y-5">
              {timelineItems.map((item, index) => {
                const isExpanded = !!expandedItems[item.id];
                const isLast = index === timelineItems.length - 1;

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

                          {/* Right: Verification Pill + Chevron */}
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

                            <div className="p-0.5 text-gray-400 group-hover/card:text-[#141724] transition-colors">
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Heading */}
                        <h3 className="text-sm sm:text-base font-bold text-[#141724] mt-2.5 group-hover/card:text-[#6258DB] transition-colors">
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

          </div>
        )}

        {/* TAB 2: ABOUT */}
        {activeTab === 'about' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-black/[0.04] shadow-xs space-y-5">
            <div>
              <h3 className="text-base font-bold text-[#141724]">
                About {journeyTitle}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mt-2 font-normal">
                {journeyAbout}
              </p>
            </div>

            <div className="pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <span className="font-bold text-[#141724] block mb-1">Community</span>
                <p className="text-gray-500">People pursuing ambitious goals: career transitions, creative crafts, fitness, and building projects.</p>
              </div>
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <span className="font-bold text-[#141724] block mb-1">Core Value</span>
                <p className="text-gray-500">Authentic proof-of-work documentation and relatable peer benchmarking.</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: GOALS */}
        {activeTab === 'goals' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-black/[0.04] shadow-xs space-y-4">
            <h3 className="text-base font-bold text-[#141724]">
              Active Milestones & Goals
            </h3>
            <p className="text-xs text-gray-500">
              Key outcomes tracked for this journey:
            </p>

            <div className="space-y-3 pt-2">
              {[
                { title: 'Validate Problem with 15 People Ahead', done: true, date: 'Completed Sept 2026' },
                { title: 'Launch Functional Interactive MVP', done: true, date: 'Completed Oct 2026' },
                { title: 'Onboard 100 Active Beta Users', done: false, date: 'Target: Nov 2026' },
                { title: 'Help 500 People Document Their Journeys', done: false, date: 'Target: Q1 2027' },
              ].map((g, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3.5 rounded-2xl border border-gray-100 bg-gray-50/60"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2
                      className={`w-5 h-5 ${
                        g.done ? 'text-emerald-500' : 'text-gray-300'
                      }`}
                    />
                    <span
                      className={`text-xs font-semibold ${
                        g.done ? 'text-gray-700 line-through' : 'text-[#141724]'
                      }`}
                    >
                      {g.title}
                    </span>
                  </div>
                  <span className="text-[11px] text-gray-400 font-medium">
                    {g.date}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: STATS */}
        {activeTab === 'stats' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="bg-white rounded-2xl p-4.5 border border-black/[0.04] shadow-xs text-center">
              <span className="text-xs text-gray-400 font-medium block">Total Updates</span>
              <span className="text-xl sm:text-2xl font-black text-[#141724] mt-1 block">5</span>
            </div>
            <div className="bg-white rounded-2xl p-4.5 border border-black/[0.04] shadow-xs text-center">
              <span className="text-xs text-gray-400 font-medium block">Evidence Ratio</span>
              <span className="text-xl sm:text-2xl font-black text-[#0E9F6E] mt-1 block">20%</span>
            </div>
            <div className="bg-white rounded-2xl p-4.5 border border-black/[0.04] shadow-xs text-center">
              <span className="text-xs text-gray-400 font-medium block">Followers</span>
              <span className="text-xl sm:text-2xl font-black text-[#141724] mt-1 block">12</span>
            </div>
            <div className="bg-white rounded-2xl p-4.5 border border-black/[0.04] shadow-xs text-center">
              <span className="text-xs text-gray-400 font-medium block">Days Active</span>
              <span className="text-xl sm:text-2xl font-black text-[#6258DB] mt-1 block">96</span>
            </div>
          </div>
        )}

      </div>

      {/* ── Post Composer Modal (for "+ Add Update") ────────────── */}
      <PostComposerModal
        isOpen={isComposerOpen}
        onClose={() => setIsComposerOpen(false)}
      />

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

    </AppShell>
  );
}
