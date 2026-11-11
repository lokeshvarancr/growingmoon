'use client';
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/state/AppContext';
import { socialApi } from '@/lib/api/client';
import type { ConnectionItem } from '@/lib/api/types';
import {
  X,
  Search,
  MessageSquare,
  Calendar,
  Send,
  ExternalLink,
  UserCheck,
  UserX,
  Clock,
  ArrowRight,
  Check,
  UserMinus,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

type ConnectionsModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type ModalTab = 'connected' | 'pending';

export default function ConnectionsModal({ isOpen, onClose }: ConnectionsModalProps) {
  const router = useRouter();
  const {
    currentUser,
    connections,
    acceptConnectionRequest,
    removeConnection,
    createConversation,
    addToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<ModalTab>('connected');
  const [connectionsList, setConnectionsList] = useState<ConnectionItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Quick message state
  const [quickMessagingUserId, setQuickMessagingUserId] = useState<string | null>(null);
  const [quickMessageText, setQuickMessageText] = useState('');

  // Fetch live connections from database
  const fetchConnections = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await socialApi.getConnections();
      if (res?.connections && Array.isArray(res.connections)) {
        setConnectionsList(res.connections);
      } else {
        setConnectionsList([]);
      }
    } catch (err) {
      console.warn('Failed to fetch connections from database, falling back:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchConnections();
    }
  }, [isOpen, fetchConnections]);

  // Split into Connected vs Pending
  const connectedItems = useMemo(() => {
    return connectionsList.filter((item) => item.status === 'accepted');
  }, [connectionsList]);

  const pendingReceived = useMemo(() => {
    return connectionsList.filter((item) => item.status === 'pending' && !item.is_requester);
  }, [connectionsList]);

  const pendingSent = useMemo(() => {
    return connectionsList.filter((item) => item.status === 'pending' && item.is_requester);
  }, [connectionsList]);

  const totalPendingCount = pendingReceived.length + pendingSent.length;

  // Filtered Connected items by search query
  const filteredConnected = useMemo(() => {
    if (!searchQuery.trim()) return connectedItems;
    const q = searchQuery.toLowerCase().trim();
    return connectedItems.filter((item) => {
      const u = item.user;
      return (
        (u.name || '').toLowerCase().includes(q) ||
        (u.username || '').toLowerCase().includes(q) ||
        (u.bio || '').toLowerCase().includes(q) ||
        (u.role_title || '').toLowerCase().includes(q) ||
        (u.location || '').toLowerCase().includes(q)
      );
    });
  }, [connectedItems, searchQuery]);

  // Format connection date
  const formatConnectionDate = (dateString?: string | null): string => {
    if (!dateString) return 'Connected recently';
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return 'Connected recently';
      const day = d.getDate();
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `Connected · ${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
    } catch {
      return 'Connected recently';
    }
  };

  const formatRelativeTime = (dateString?: string | null): string => {
    if (!dateString) return 'recently';
    try {
      const d = new Date(dateString);
      const diffMs = Date.now() - d.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    } catch {
      return 'recently';
    }
  };

  // ── Action Handlers ────────────────────────────────────────────────
  const handleAcceptRequest = async (item: ConnectionItem) => {
    setProcessingId(item.id);
    try {
      await socialApi.acceptConnection(item.id);
      acceptConnectionRequest(item.user.id);
      addToast(`Connected with ${item.user.name}!`, 'success');
      setConnectionsList((prev) =>
        prev.map((c) =>
          c.id === item.id
            ? { ...c, status: 'accepted' as const, connected_at: new Date().toISOString() }
            : c
        )
      );
    } catch (err) {
      console.error('Failed to accept connection:', err);
      addToast('Could not accept request. Please try again.', 'danger');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeclineRequest = async (item: ConnectionItem) => {
    setProcessingId(item.id);
    try {
      await socialApi.removeConnection(item.id);
      removeConnection(item.user.id);
      addToast('Connection request declined', 'info');
      setConnectionsList((prev) => prev.filter((c) => c.id !== item.id));
    } catch (err) {
      console.error('Failed to decline connection:', err);
      addToast('Could not decline request. Please try again.', 'danger');
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancelSentRequest = async (item: ConnectionItem) => {
    setProcessingId(item.id);
    try {
      await socialApi.removeConnection(item.id);
      removeConnection(item.user.id);
      addToast('Connection request withdrawn', 'info');
      setConnectionsList((prev) => prev.filter((c) => c.id !== item.id));
    } catch (err) {
      console.error('Failed to withdraw request:', err);
      addToast('Could not cancel request. Please try again.', 'danger');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRemoveConnectedUser = async (item: ConnectionItem) => {
    if (!window.confirm(`Are you sure you want to disconnect from ${item.user.name}?`)) return;
    setProcessingId(item.id);
    try {
      await socialApi.removeConnection(item.id);
      removeConnection(item.user.id);
      addToast(`Disconnected from ${item.user.name}`, 'info');
      setConnectionsList((prev) => prev.filter((c) => c.id !== item.id));
    } catch (err) {
      console.error('Failed to remove connection:', err);
      addToast('Could not disconnect. Please try again.', 'danger');
    } finally {
      setProcessingId(null);
    }
  };

  // Quick Message handlers
  const handleToggleQuickMessage = (userId: string, userName: string) => {
    if (quickMessagingUserId === userId) {
      setQuickMessagingUserId(null);
      setQuickMessageText('');
    } else {
      setQuickMessagingUserId(userId);
      setQuickMessageText(`Hey ${userName.split(' ')[0]}! Great to connect.`);
    }
  };

  const handleSendQuickMessage = (userId: string, userName: string) => {
    if (!quickMessageText.trim()) return;
    createConversation(userId, quickMessageText.trim());
    addToast(`Message sent to ${userName}!`, 'success');
    setQuickMessagingUserId(null);
    setQuickMessageText('');
  };

  const handleOpenFullChat = (userId: string, userName: string) => {
    onClose();
    router.push(`/messages?user=${userId}`);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[26px] sm:rounded-[30px] max-w-xl w-full max-h-[88vh] shadow-modal border border-gm-ink/5 animate-slide-up flex flex-col overflow-hidden relative animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── 1. Modal Header ────────────────────────────────────── */}
        <div className="p-4 sm:p-5 pb-3 border-b border-gray-100 flex items-center justify-between gap-3 bg-gm-accent-soft">
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-black text-gm-ink tracking-tight">
              Connections
            </h2>
            {/* Top Navigation Tabs */}
            <div className="flex items-center gap-1 bg-gray-100/90 p-1 rounded-full text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('connected')}
                className={`px-3 py-1 rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'connected'
                    ? 'bg-white text-gm-ink shadow-xs font-extrabold'
                    : 'text-gray-600 hover:text-gm-ink'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5 text-gm-accent" />
                <span>Connected</span>
                <span className="px-1.5 py-0.2 rounded-full bg-gm-accent/10 text-gm-accent text-[10px] font-bold">
                  {connectedItems.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('pending')}
                className={`px-3 py-1 rounded-full transition-all flex items-center gap-1.5 cursor-pointer relative ${
                  activeTab === 'pending'
                    ? 'bg-white text-gm-ink shadow-xs font-extrabold'
                    : 'text-gray-600 hover:text-gm-ink'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Pending Requests</span>
                {totalPendingCount > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      pendingReceived.length > 0
                        ? 'bg-amber-500 text-white animate-pulse'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {totalPendingCount}
                  </span>
                )}
              </button>
            </div>
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

        {/* ── 2. Search Bar (Only shown for Connected tab) ──────── */}
        {activeTab === 'connected' && (
          <div className="p-3.5 sm:p-4 border-b border-gray-100 bg-white">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search connected people by name, role, or bio..."
                className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200/80 rounded-full text-xs text-gm-ink placeholder:text-gray-400 focus:outline-none focus:bg-white focus:border-gm-accent focus:ring-2 focus:ring-gm-accent/15 transition-all shadow-2xs"
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
          </div>
        )}

        {/* ── 3. Content Body ───────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 divide-y divide-gray-100 scrollbar-thin">
          {isLoading ? (
            <div className="py-12 text-center space-y-2">
              <div className="w-6 h-6 rounded-full border-2 border-gm-accent border-t-transparent animate-spin mx-auto" />
              <p className="text-xs text-gray-400 font-medium">Fetching connections from database...</p>
            </div>
          ) : activeTab === 'connected' ? (
            /* ── TAB 1: CONNECTED PEOPLE ──────────────────────── */
            filteredConnected.length > 0 ? (
              filteredConnected.map((item) => {
                const u = item.user;
                const isMessaging = quickMessagingUserId === u.id;
                const isBusy = processingId === item.id;

                return (
                  <div
                    key={item.id}
                    className="py-3.5 first:pt-1 last:pb-1 group hover:bg-[#FAF9FE] -mx-2 px-3 rounded-2xl transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      {/* Avatar */}
                      <Link
                        href={`/profile/${u.username}`}
                        onClick={onClose}
                        className="flex-shrink-0 relative group/avatar block"
                      >
                        {u.avatar_image ? (
                          <img
                            src={u.avatar_image}
                            alt={u.name}
                            className="w-11 h-11 rounded-full object-cover ring-2 ring-gray-100 group-hover/avatar:ring-gm-accent/40 transition-all shadow-xs"
                          />
                        ) : (
                          <div
                            className={`w-11 h-11 rounded-full flex items-center justify-center font-black text-xs ${
                              u.avatar_color || 'bg-indigo-100 text-indigo-700'
                            } ring-2 ring-gray-100 group-hover/avatar:ring-gm-accent/40 transition-all shadow-xs`}
                          >
                            {u.avatar_initials || 'GM'}
                          </div>
                        )}
                        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white" />
                      </Link>

                      {/* User Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Link
                            href={`/profile/${u.username}`}
                            onClick={onClose}
                            className="font-bold text-xs sm:text-[13.5px] text-gm-ink hover:text-gm-accent transition-colors truncate"
                          >
                            {u.name}
                          </Link>
                          <span className="text-[11px] text-gray-400 font-medium">
                            @{u.username}
                          </span>
                        </div>

                        {/* Role or Bio */}
                        <p className="text-[11.5px] font-semibold text-gray-800 truncate mt-0.5">
                          {u.role_title || u.bio || 'Growing Moon Founder'}
                        </p>

                        {/* Connection date & Location */}
                        <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">
                            <Calendar className="w-2.5 h-2.5 text-gray-400" />
                            <span>{formatConnectionDate(item.connected_at || item.created_at)}</span>
                          </span>

                          {u.location && (
                            <span className="text-[10px] text-gray-400 font-medium truncate">
                              📍 {u.location}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right Action Buttons */}
                      <div className="flex items-center gap-1.5 flex-shrink-0 self-center">
                        <button
                          type="button"
                          onClick={() => handleToggleQuickMessage(u.id, u.name)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-2xs ${
                            isMessaging
                              ? 'bg-gm-accent text-white shadow-md'
                              : 'bg-gm-accent/10 hover:bg-gm-accent text-gm-accent hover:text-white'
                          }`}
                          title={`Message ${u.name}`}
                        >
                          <MessageSquare className="w-3.5 h-3.5 stroke-[2.2]" />
                        </button>

                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleRemoveConnectedUser(item)}
                          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-red-50 text-gray-400 hover:text-red-600 flex items-center justify-center transition-colors cursor-pointer active:scale-95"
                          title="Remove connection"
                        >
                          <UserMinus className="w-3.5 h-3.5 stroke-[2]" />
                        </button>
                      </div>
                    </div>

                    {/* Quick Direct Message Inline Composer */}
                    {isMessaging && (
                      <div className="mt-3 pt-3 pl-14 pr-1 border-t border-purple-100 animate-fade-in">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={quickMessageText}
                            onChange={(e) => setQuickMessageText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleSendQuickMessage(u.id, u.name);
                              }
                            }}
                            placeholder={`Message ${u.name.split(' ')[0]}...`}
                            className="flex-1 px-3.5 py-2 bg-white border border-gm-accent/40 rounded-full text-xs text-gm-ink focus:outline-none focus:ring-2 focus:ring-gm-accent/20 shadow-2xs"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => handleSendQuickMessage(u.id, u.name)}
                            disabled={!quickMessageText.trim()}
                            className="p-2 rounded-full bg-gm-accent hover:bg-gm-accent-deep disabled:opacity-50 text-white transition-all active:scale-95 cursor-pointer shadow-xs"
                            title="Send message"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="mt-1.5 flex items-center justify-between px-2 text-[10.5px]">
                          <span className="text-gray-400">Press Enter to send</span>
                          <button
                            type="button"
                            onClick={() => handleOpenFullChat(u.id, u.name)}
                            className="font-bold text-gm-accent hover:underline flex items-center gap-0.5 cursor-pointer"
                          >
                            <span>Open full chat</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="py-12 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-purple-50 text-gm-accent flex items-center justify-center mx-auto mb-2 text-xl">
                  🤝
                </div>
                <p className="text-xs font-bold text-gm-ink">No connections found</p>
                <p className="text-[11.5px] text-gray-400 max-w-sm mx-auto">
                  {searchQuery
                    ? `No connections match "${searchQuery}".`
                    : 'Connect with fellow founders and creators to collaborate and share milestone feedback.'}
                </p>
                <div className="pt-2">
                  <Link
                    href="/explore"
                    onClick={onClose}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gm-accent text-white text-xs font-bold hover:bg-gm-accent-deep transition-colors cursor-pointer"
                  >
                    <span>Discover People to Connect With</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )
          ) : (
            /* ── TAB 2: PENDING REQUESTS ──────────────────────── */
            <div className="space-y-5">
              {/* SECTION A: RECEIVED REQUESTS */}
              <div>
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gm-ink">
                      Received Requests
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10.5px] font-bold">
                      {pendingReceived.length}
                    </span>
                  </div>
                  <span className="text-[10.5px] text-gray-400">
                    Awaiting your response
                  </span>
                </div>

                {pendingReceived.length > 0 ? (
                  <div className="space-y-2.5">
                    {pendingReceived.map((item) => {
                      const u = item.user;
                      const isBusy = processingId === item.id;

                      return (
                        <div
                          key={item.id}
                          className="p-3 rounded-2xl bg-gm-accent-soft border border-purple-100/80 hover:border-gm-accent/30 transition-all flex items-center justify-between gap-3"
                        >
                          {/* Left: Avatar & Info */}
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <Link
                              href={`/profile/${u.username}`}
                              onClick={onClose}
                              className="flex-shrink-0"
                            >
                              {u.avatar_image ? (
                                <img
                                  src={u.avatar_image}
                                  alt={u.name}
                                  className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-100 shadow-xs"
                                />
                              ) : (
                                <div
                                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${
                                    u.avatar_color || 'bg-amber-100 text-amber-800'
                                  } ring-2 ring-purple-100 shadow-xs`}
                                >
                                  {u.avatar_initials || 'GM'}
                                </div>
                              )}
                            </Link>

                            <div className="min-w-0 flex-1">
                              <Link
                                href={`/profile/${u.username}`}
                                onClick={onClose}
                                className="font-bold text-xs text-gm-ink hover:text-gm-accent transition-colors truncate block"
                              >
                                {u.name}
                              </Link>
                              <p className="text-[11px] text-gray-500 truncate">
                                {u.role_title || u.bio || `@${u.username}`}
                              </p>
                              <span className="text-[9.5px] text-gray-400 block mt-0.5">
                                Requested {formatRelativeTime(item.created_at)}
                              </span>
                            </div>
                          </div>

                          {/* Right: Accept & Decline Buttons */}
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => handleAcceptRequest(item)}
                              className="px-3 py-1.5 rounded-full bg-gm-accent hover:bg-gm-accent-deep text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer active:scale-95 disabled:opacity-50"
                            >
                              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                              <span>Accept</span>
                            </button>

                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => handleDeclineRequest(item)}
                              className="px-2.5 py-1.5 rounded-full bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer active:scale-95 disabled:opacity-50"
                              title="Decline request"
                            >
                              <X className="w-3.5 h-3.5 stroke-[2]" />
                              <span className="hidden sm:inline">Decline</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-4 text-center text-xs text-gray-400 bg-gray-50/60 rounded-xl">
                    No incoming connection requests
                  </div>
                )}
              </div>

              {/* SECTION B: SENT REQUESTS */}
              <div>
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gm-ink">
                      Sent Requests
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[10.5px] font-bold">
                      {pendingSent.length}
                    </span>
                  </div>
                  <span className="text-[10.5px] text-gray-400">
                    Awaiting their confirmation
                  </span>
                </div>

                {pendingSent.length > 0 ? (
                  <div className="space-y-2.5">
                    {pendingSent.map((item) => {
                      const u = item.user;
                      const isBusy = processingId === item.id;

                      return (
                        <div
                          key={item.id}
                          className="p-3 rounded-2xl bg-white border border-gray-100 hover:border-gray-200 transition-all flex items-center justify-between gap-3"
                        >
                          {/* Left: Avatar & Info */}
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <Link
                              href={`/profile/${u.username}`}
                              onClick={onClose}
                              className="flex-shrink-0"
                            >
                              {u.avatar_image ? (
                                <img
                                  src={u.avatar_image}
                                  alt={u.name}
                                  className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100 shadow-xs"
                                />
                              ) : (
                                <div
                                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${
                                    u.avatar_color || 'bg-gray-100 text-gray-700'
                                  } ring-2 ring-gray-100 shadow-xs`}
                                >
                                  {u.avatar_initials || 'GM'}
                                </div>
                              )}
                            </Link>

                            <div className="min-w-0 flex-1">
                              <Link
                                href={`/profile/${u.username}`}
                                onClick={onClose}
                                className="font-bold text-xs text-gm-ink hover:text-gm-accent transition-colors truncate block"
                              >
                                {u.name}
                              </Link>
                              <p className="text-[11px] text-gray-500 truncate">
                                {u.role_title || u.bio || `@${u.username}`}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="inline-flex items-center gap-1 text-[9.5px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.2 rounded-full border border-amber-200/60">
                                  <Clock className="w-2.5 h-2.5" />
                                  <span>Pending</span>
                                </span>
                                <span className="text-[9.5px] text-gray-400">
                                  Sent {formatRelativeTime(item.created_at)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Right: Withdraw / Cancel Button */}
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => handleCancelSentRequest(item)}
                            className="px-3 py-1.5 rounded-full bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 text-xs font-bold transition-all cursor-pointer active:scale-95 disabled:opacity-50 flex items-center gap-1"
                            title="Withdraw request"
                          >
                            <X className="w-3.5 h-3.5 stroke-[2]" />
                            <span>Withdraw</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-4 text-center text-xs text-gray-400 bg-gray-50/60 rounded-xl">
                    No outgoing pending requests
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── 4. Modal Footer ────────────────────────────────────── */}
        <div className="p-3 sm:p-3.5 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between text-xs px-4 sm:px-5">
          <span className="text-[11px] text-gray-500 font-medium">
            {activeTab === 'connected' ? (
              <>
                Showing <strong className="text-gm-ink">{filteredConnected.length}</strong> connected {filteredConnected.length === 1 ? 'person' : 'people'}
              </>
            ) : (
              <>
                <strong className="text-gm-ink">{totalPendingCount}</strong> total pending requests
              </>
            )}
          </span>
          <Link
            href="/explore"
            onClick={onClose}
            className="text-[11.5px] font-bold text-gm-accent hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Discover more people →</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
