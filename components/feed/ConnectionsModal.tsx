'use client';
import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/state/AppContext';
import { founders as allFounders } from '@/lib/mock-data/founders';
import type { FounderProfile } from '@/types';
import {
  X,
  Search,
  MessageSquare,
  Sparkles,
  Calendar,
  Hammer,
  Send,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';

type ConnectionsModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type DateFormatStyle = 'stylish' | 'badge' | 'full';

export default function ConnectionsModal({ isOpen, onClose }: ConnectionsModalProps) {
  const router = useRouter();
  const { connections, currentUser, createConversation, addToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [dateStyle, setDateStyle] = useState<DateFormatStyle>('stylish');
  const [quickMessagingFounderId, setQuickMessagingFounderId] = useState<string | null>(null);
  const [quickMessageText, setQuickMessageText] = useState('');

  // Extract all connected founders
  const connectedFounders = useMemo(() => {
    return allFounders.filter((f) => {
      if (f.id === currentUser.id) return false;
      return connections[f.id] === 'connected';
    });
  }, [connections, currentUser.id]);

  // Filtered by search and stage
  const filteredFounders = useMemo(() => {
    return connectedFounders.filter((f) => {
      // Stage filter
      if (selectedStage !== 'all' && f.stage !== selectedStage) {
        return false;
      }

      // Search query filter (name, currentGoal, bio, role, location)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = f.name.toLowerCase().includes(q);
        const matchesGoal = (f.currentGoal || '').toLowerCase().includes(q);
        const matchesBio = (f.bio || '').toLowerCase().includes(q);
        const matchesStage = (f.stage || '').toLowerCase().includes(q);
        const matchesLocation = (f.location || '').toLowerCase().includes(q);
        return matchesName || matchesGoal || matchesBio || matchesStage || matchesLocation;
      }

      return true;
    });
  }, [connectedFounders, selectedStage, searchQuery]);

  // Format connection date in a fresh, distinctive new format
  const formatConnectionDate = (dateString: string, style: DateFormatStyle = dateStyle): string => {
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return 'Connected recently';

      const day = d.getDate();
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = months[d.getMonth()];
      const year = d.getFullYear();

      if (style === 'badge') {
        return `✦ Since ${month} ${year}`;
      }
      if (style === 'full') {
        return `Connected on ${day} ${month}, ${year}`;
      }
      // Default 'stylish'
      return `Connected · ${day} ${month} ${year}`;
    } catch {
      return 'Connected recently';
    }
  };

  // Handle direct message click
  const handleToggleQuickMessage = (founder: FounderProfile) => {
    if (quickMessagingFounderId === founder.id) {
      setQuickMessagingFounderId(null);
      setQuickMessageText('');
    } else {
      setQuickMessagingFounderId(founder.id);
      setQuickMessageText(`Hey ${founder.name.split(' ')[0]}! How is progress on ${founder.currentGoal}?`);
    }
  };

  const handleSendQuickMessage = (founder: FounderProfile) => {
    if (!quickMessageText.trim()) return;

    createConversation(founder.id, quickMessageText.trim());
    addToast(`Message sent to ${founder.name}!`, 'success');
    setQuickMessagingFounderId(null);
    setQuickMessageText('');
  };

  const handleOpenFullChat = (founder: FounderProfile) => {
    const convId = createConversation(founder.id, `Hey ${founder.name.split(' ')[0]}! Great to connect with you.`);
    onClose();
    router.push(`/messages?conv=${convId}`);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[26px] sm:rounded-[30px] max-w-xl w-full max-h-[88vh] shadow-2xl border border-black/[0.08] flex flex-col overflow-hidden relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── 1. Modal Header ────────────────────────────────────── */}
        <div className="p-4 sm:p-5 pb-3 border-b border-gray-100 flex items-center justify-between gap-3 bg-[#FCFBFE]">
          <div className="flex items-center gap-2.5 min-w-0">
            <h2 className="text-base sm:text-lg font-black text-[#141724] tracking-tight">
              Connections
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-[#6258DB]/10 text-[#6258DB] text-xs font-black">
              {connectedFounders.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Date format switcher */}
            <div className="hidden sm:flex items-center gap-1 bg-gray-100/80 p-0.5 rounded-full text-[10.5px] font-semibold text-gray-600">
              <button
                type="button"
                onClick={() => setDateStyle('stylish')}
                className={`px-2 py-0.5 rounded-full transition-all ${
                  dateStyle === 'stylish' ? 'bg-white text-[#141724] shadow-xs font-bold' : 'hover:text-[#141724]'
                }`}
                title="Format: Connected · 15 Oct 2026"
              >
                Date
              </button>
              <button
                type="button"
                onClick={() => setDateStyle('badge')}
                className={`px-2 py-0.5 rounded-full transition-all ${
                  dateStyle === 'badge' ? 'bg-white text-[#141724] shadow-xs font-bold' : 'hover:text-[#141724]'
                }`}
                title="Format: ✦ Since Oct 2026"
              >
                Badge
              </button>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors cursor-pointer active:scale-95"
              title="Close"
            >
              <X className="w-4 h-4 stroke-[2.2]" />
            </button>
          </div>
        </div>

        {/* ── 2. Search & Stage Filter Bar ──────────────────────── */}
        <div className="p-3.5 sm:p-4 border-b border-gray-100 space-y-2.5 bg-white">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, role, or what they're building..."
              className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200/80 rounded-full text-xs text-[#141724] placeholder:text-gray-400 focus:outline-none focus:bg-white focus:border-[#6258DB] focus:ring-2 focus:ring-[#6258DB]/15 transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded-full"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
            {[
              { id: 'all', label: 'All' },
              { id: 'Building MVP', label: 'Building MVP' },
              { id: 'First Customers', label: 'First Customers' },
              { id: 'Growing', label: 'Growing' },
              { id: 'Launched', label: 'Launched' },
              { id: 'Exploring', label: 'Exploring' },
            ].map((stage) => {
              const isActive = selectedStage === stage.id;
              return (
                <button
                  key={stage.id}
                  type="button"
                  onClick={() => setSelectedStage(stage.id)}
                  className={`whitespace-nowrap px-3 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer select-none active:scale-95 ${
                    isActive
                      ? 'bg-[#141724] text-white font-bold shadow-2xs'
                      : 'bg-gray-100 hover:bg-gray-200/70 text-gray-600'
                  }`}
                >
                  {stage.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── 3. Scrollable Connections List ─────────────────────── */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 divide-y divide-gray-100 scrollbar-thin">
          {filteredFounders.length > 0 ? (
            filteredFounders.map((founder) => {
              const isMessaging = quickMessagingFounderId === founder.id;

              return (
                <div
                  key={founder.id}
                  className="py-3.5 first:pt-1 last:pb-1 group hover:bg-[#FAF9FE] -mx-2 px-3 rounded-2xl transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    {/* Left: Profile Icon */}
                    <Link
                      href={`/profile/${founder.username}`}
                      onClick={onClose}
                      className="flex-shrink-0 relative group/avatar block"
                    >
                      {founder.avatarImage ? (
                        <img
                          src={founder.avatarImage}
                          alt={founder.name}
                          className="w-11 h-11 rounded-full object-cover ring-2 ring-gray-100 group-hover/avatar:ring-[#6258DB]/40 transition-all shadow-xs"
                        />
                      ) : (
                        <div
                          className={`w-11 h-11 rounded-full flex items-center justify-center font-black text-xs ${
                            founder.avatarColor || 'bg-indigo-100 text-indigo-700'
                          } ring-2 ring-gray-100 group-hover/avatar:ring-[#6258DB]/40 transition-all shadow-xs`}
                        >
                          {founder.avatar}
                        </div>
                      )}
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white" />
                    </Link>

                    {/* Middle: Name, What they are right now building, One line about them, Date */}
                    <div className="min-w-0 flex-1">
                      {/* Name + Stage Badge Row */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          href={`/profile/${founder.username}`}
                          onClick={onClose}
                          className="font-bold text-xs sm:text-[13.5px] text-[#141724] hover:text-[#6258DB] transition-colors truncate"
                        >
                          {founder.name}
                        </Link>

                        <span className="inline-flex items-center gap-1 text-[9.5px] font-bold px-2 py-0.5 rounded-full bg-[#6258DB]/10 text-[#6258DB] border border-[#6258DB]/15">
                          <span>{founder.stage}</span>
                        </span>
                      </div>

                      {/* What they are right now building */}
                      <p className="text-[11.5px] font-semibold text-gray-800 truncate mt-0.5 flex items-center gap-1">
                        <Hammer className="w-3 h-3 text-[#6258DB] flex-shrink-0" />
                        <span className="truncate">{founder.currentGoal || 'Developing first prototype'}</span>
                      </p>

                      {/* One line about them */}
                      <p className="text-[11px] text-gray-500 font-normal truncate mt-0.5">
                        {founder.bio}
                      </p>

                      {/* Connected since particular date in new format */}
                      <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">
                          <Calendar className="w-2.5 h-2.5 text-gray-400" />
                          <span>{formatConnectionDate(founder.joinedDate)}</span>
                        </span>

                        <span className="text-[10px] text-gray-400 font-medium">
                          📍 {founder.location}
                        </span>
                      </div>
                    </div>

                    {/* Right: Message Icon Button */}
                    <div className="flex items-center gap-1 flex-shrink-0 self-center">
                      <button
                        type="button"
                        onClick={() => handleToggleQuickMessage(founder)}
                        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-2xs ${
                          isMessaging
                            ? 'bg-[#6258DB] text-white shadow-md'
                            : 'bg-[#6258DB]/10 hover:bg-[#6258DB] text-[#6258DB] hover:text-white'
                        }`}
                        title={`Message ${founder.name}`}
                      >
                        <MessageSquare className="w-4 h-4 stroke-[2.2]" />
                      </button>
                    </div>
                  </div>

                  {/* ── Quick Direct Message Inline Composer (When Message icon clicked) ── */}
                  {isMessaging && (
                    <div className="mt-3 pt-3 pl-14 pr-1 border-t border-purple-100 animate-in fade-in duration-200">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={quickMessageText}
                          onChange={(e) => setQuickMessageText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleSendQuickMessage(founder);
                            }
                          }}
                          placeholder={`Message ${founder.name.split(' ')[0]}...`}
                          className="flex-1 px-3.5 py-2 bg-white border border-[#6258DB]/40 rounded-full text-xs text-[#141724] focus:outline-none focus:ring-2 focus:ring-[#6258DB]/20 shadow-2xs"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => handleSendQuickMessage(founder)}
                          disabled={!quickMessageText.trim()}
                          className="p-2 rounded-full bg-[#6258DB] hover:bg-[#5246D2] disabled:opacity-50 text-white transition-all active:scale-95 cursor-pointer shadow-xs"
                          title="Send message"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="mt-1.5 flex items-center justify-between px-2 text-[10.5px]">
                        <span className="text-gray-400">Press Enter to send</span>
                        <button
                          type="button"
                          onClick={() => handleOpenFullChat(founder)}
                          className="font-bold text-[#6258DB] hover:underline flex items-center gap-0.5"
                        >
                          <span>Open full conversation</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center space-y-2">
              <p className="text-xs font-bold text-[#141724]">No connections found</p>
              <p className="text-[11px] text-gray-400">
                {searchQuery
                  ? `No connections match "${searchQuery}".`
                  : 'You have no connections in this stage category.'}
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedStage('all');
                }}
                className="mt-2 px-3 py-1 bg-[#141724] text-white text-xs font-bold rounded-full cursor-pointer"
              >
                Reset filters
              </button>
            </div>
          )}
        </div>

        {/* ── 4. Modal Footer ────────────────────────────────────── */}
        <div className="p-3 sm:p-3.5 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between text-xs px-4 sm:px-5">
          <span className="text-[11px] text-gray-500 font-medium">
            Showing <strong className="text-[#141724]">{filteredFounders.length}</strong> of {connectedFounders.length} connections
          </span>
          <Link
            href="/discover"
            onClick={onClose}
            className="text-[11.5px] font-bold text-[#6258DB] hover:underline flex items-center gap-1"
          >
            <span>Discover more people →</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
