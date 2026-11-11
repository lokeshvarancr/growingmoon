'use client';
import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import AppShell from '@/components/shared/AppShell';
import { useApp } from '@/lib/state/AppContext';
import { formatRelativeTime } from '@/lib/utils';
import { chatApi } from '@/lib/api/client';
import { subscribeToConversationMessages } from '@/lib/supabaseClient';
import type { ChatMessage } from '@/lib/api/types';
import {
  MessageSquare,
  Search,
  Send,
  ArrowLeft,
  FileBadge2,
  Check,
  CheckCheck,
  Clock,
  Sparkles,
  Users,
  Pencil,
  Trash2,
  MoreVertical,
  X,
  AlertTriangle,
} from 'lucide-react';

const isUuid = (val?: string | null): boolean => {
  if (!val) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val);
};

function MessagesContent() {
  const { currentUser, conversations, messages, sendMessage, refreshConversations } = useApp();
  const searchParams = useSearchParams();
  const convParam = searchParams ? searchParams.get('conv') : null;
  const userParam = searchParams ? searchParams.get('user') : null;

  const [activeConvId, setActiveConvId] = useState<string>('');
  const [inputText, setInputText] = useState('');
  const [search, setSearch] = useState('');
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [liveMessages, setLiveMessages] = useState<Array<{
    id: string;
    conversationId: string;
    senderId: string;
    content: string;
    createdAt: string;
    status?: 'sending' | 'sent' | 'delivered' | 'read' | string;
    read?: boolean;
    is_deleted?: boolean;
    is_edited?: boolean;
    edited_at?: string | null;
  }>>([]);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Message edit & delete states
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingMessageText, setEditingMessageText] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [deleteConfirmMsgId, setDeleteConfirmMsgId] = useState<string | null>(null);
  const [isDeletingMsg, setIsDeletingMsg] = useState(false);

  // Entire conversation delete state
  const [isChatMenuOpen, setIsChatMenuOpen] = useState(false);
  const [showDeleteChatModal, setShowDeleteChatModal] = useState(false);
  const [isDeletingChat, setIsDeletingChat] = useState(false);

  // Helper to resolve partner profile (Database user)
  const resolvePartner = (conv: any) => {
    if (!conv) return null;
    if (conv.otherParticipant) {
      return {
        id: conv.otherParticipant.id,
        name: conv.otherParticipant.name || 'Member',
        username: conv.otherParticipant.username || 'user',
        avatar: conv.otherParticipant.avatar_initials || 'GM',
        avatarImage: conv.otherParticipant.avatar_image || undefined,
        avatarColor: conv.otherParticipant.avatar_color || 'bg-gm-accent-soft text-gm-accent-deep',
        role: conv.otherParticipant.role_title || 'Builder',
        stage: conv.otherParticipant.role_title || 'Building MVP',
      };
    }
    const partnerId = conv?.participantIds?.find((id: string) => id !== currentUser.id);
    if (!partnerId) return null;
    return {
      id: partnerId,
      name: 'Community Member',
      username: 'member',
      avatar: 'GM',
      avatarColor: 'bg-gm-accent-soft text-gm-accent-deep',
      role: 'Builder',
      stage: 'Building MVP',
    };
  };

  // 1. Initial conversations load
  useEffect(() => {
    let mounted = true;
    setIsLoadingConversations(true);
    refreshConversations()
      .finally(() => {
        if (mounted) setIsLoadingConversations(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // 2. Handle URL Query Params (?conv=UUID or ?user=UUID/username)
  useEffect(() => {
    if (convParam && isUuid(convParam)) {
      setActiveConvId(convParam);
      setMobileShowChat(true);
    } else if (userParam) {
      const existing = conversations.find(
        (c) =>
          c.participantIds.includes(userParam) ||
          (c.otherParticipant &&
            (c.otherParticipant.id === userParam ||
              c.otherParticipant.username.toLowerCase() === userParam.toLowerCase()))
      );
      if (existing) {
        setActiveConvId(existing.id);
        setMobileShowChat(true);
      } else {
        chatApi
          .startConversation(userParam)
          .then((res) => {
            if (res && res.id) {
              setActiveConvId(res.id);
              setMobileShowChat(true);
              refreshConversations();
            }
          })
          .catch((err) => {
            console.warn('Unable to initiate conversation with user:', err);
          });
      }
    }
  }, [convParam, userParam, conversations]);

  // 3. Auto-select first real conversation if none active
  useEffect(() => {
    if (!convParam && !userParam) {
      if (conversations.length > 0) {
        if (!activeConvId || !conversations.some((c) => c.id === activeConvId)) {
          setActiveConvId(conversations[0].id);
        }
      } else {
        setActiveConvId('');
      }
    }
  }, [conversations, activeConvId, convParam, userParam]);

  const activeConversation = conversations.find((c) => c.id === activeConvId);
  const otherFounder = resolvePartner(activeConversation);

  // 4. Load messages from FastAPI backend when active conversation changes
  useEffect(() => {
    if (!activeConvId || !isUuid(activeConvId)) {
      setLiveMessages([]);
      return;
    }

    const cached = messages[activeConvId] || [];
    if (cached.length > 0) {
      setLiveMessages(
        cached.map((m) => ({
          id: m.id,
          conversationId: m.conversationId,
          senderId: m.senderId,
          content: m.content,
          createdAt: m.createdAt,
          status: m.read ? 'read' : 'delivered',
          read: m.read,
        }))
      );
    } else {
      setIsLoadingMessages(true);
    }

    chatApi
      .getMessages(activeConvId)
      .then((serverMessages: ChatMessage[]) => {
        if (serverMessages && Array.isArray(serverMessages)) {
          setLiveMessages(
            serverMessages.map((sm) => ({
              id: sm.id,
              conversationId: sm.conversation_id,
              senderId: sm.sender_id,
              content: sm.content,
              createdAt: sm.sent_at || sm.created_at,
              status: sm.status,
              read: sm.status === 'read',
              is_deleted: sm.is_deleted,
              is_edited: sm.is_edited,
              edited_at: sm.edited_at,
            }))
          );
        }
      })
      .catch((err) => {
        console.warn('Could not fetch server messages for conversation:', err);
      })
      .finally(() => {
        setIsLoadingMessages(false);
      });

    chatApi.markRead(activeConvId).catch(() => {});
  }, [activeConvId]);

  // 5. Real-time Supabase WebSocket Channel Subscription
  useEffect(() => {
    if (!activeConvId || !isUuid(activeConvId)) return;

    const unsubscribe = subscribeToConversationMessages(
      activeConvId,
      (newMsgPayload) => {
        const incoming = {
          id: newMsgPayload.id,
          conversationId: newMsgPayload.conversation_id,
          senderId: newMsgPayload.sender_id,
          content: newMsgPayload.content,
          createdAt: newMsgPayload.sent_at || newMsgPayload.created_at,
          status: newMsgPayload.status || 'delivered',
          read: newMsgPayload.status === 'read',
          is_deleted: newMsgPayload.is_deleted,
          is_edited: newMsgPayload.is_edited,
          edited_at: newMsgPayload.edited_at,
        };

        setLiveMessages((prev) => {
          if (prev.some((m) => m.id === incoming.id)) return prev;
          return [...prev, incoming];
        });

        if (incoming.senderId !== currentUser.id) {
          chatApi.markRead(activeConvId).catch(() => {});
        }
      },
      (updatedMsgPayload) => {
        setLiveMessages((prev) =>
          prev.map((m) =>
            m.id === updatedMsgPayload.id
              ? {
                  ...m,
                  content: updatedMsgPayload.content ?? m.content,
                  status: updatedMsgPayload.status || m.status,
                  read: updatedMsgPayload.status === 'read',
                  is_deleted: updatedMsgPayload.is_deleted ?? m.is_deleted,
                  is_edited: updatedMsgPayload.is_edited ?? m.is_edited,
                  edited_at: updatedMsgPayload.edited_at ?? m.edited_at,
                }
              : m
          )
        );
      }
    );

    return () => {
      unsubscribe();
    };
  }, [activeConvId, currentUser.id]);

  // 6. Background Auto-Polling Fallback (syncs chat every 3.5s even if WebSocket is disconnected)
  useEffect(() => {
    if (!activeConvId || !isUuid(activeConvId)) return;

    const interval = setInterval(() => {
      chatApi
        .getMessages(activeConvId)
        .then((serverMessages: ChatMessage[]) => {
          if (serverMessages && Array.isArray(serverMessages)) {
            setLiveMessages((prev) => {
              if (serverMessages.length !== prev.length) {
                return serverMessages.map((sm) => ({
                  id: sm.id,
                  conversationId: sm.conversation_id,
                  senderId: sm.sender_id,
                  content: sm.content,
                  createdAt: sm.sent_at || sm.created_at,
                  status: sm.status,
                  read: sm.status === 'read',
                  is_deleted: sm.is_deleted,
                  is_edited: sm.is_edited,
                  edited_at: sm.edited_at,
                }));
              }
              const hasDiff = serverMessages.some((sm, idx) => {
                const p = prev[idx];
                return (
                  !p ||
                  p.id !== sm.id ||
                  p.content !== sm.content ||
                  p.status !== sm.status ||
                  p.is_deleted !== sm.is_deleted ||
                  p.is_edited !== sm.is_edited
                );
              });
              if (!hasDiff) return prev;
              return serverMessages.map((sm) => ({
                id: sm.id,
                conversationId: sm.conversation_id,
                senderId: sm.sender_id,
                content: sm.content,
                createdAt: sm.sent_at || sm.created_at,
                status: sm.status,
                read: sm.status === 'read',
                is_deleted: sm.is_deleted,
                is_edited: sm.is_edited,
                edited_at: sm.edited_at,
              }));
            });
          }
        })
        .catch(() => {});
    }, 3500);

    return () => {
      clearInterval(interval);
    };
  }, [activeConvId]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [liveMessages]);

  // Deduplicate conversations: ensure a person is never listed more than once
  const filteredConversations = React.useMemo(() => {
    const seenPartnerIds = new Set<string>();
    return conversations.filter((c) => {
      const partner = resolvePartner(c);
      if (!partner) return false;
      if (seenPartnerIds.has(partner.id)) return false;
      seenPartnerIds.add(partner.id);
      if (!search.trim()) return true;
      return (
        partner.name.toLowerCase().includes(search.toLowerCase()) ||
        partner.username.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [conversations, search]);

  // Check if message was sent within 1 hour (3600 seconds)
  const isWithinOneHour = (createdAtStr?: string) => {
    if (!createdAtStr) return false;
    const created = new Date(createdAtStr).getTime();
    if (isNaN(created)) return false;
    return Date.now() - created <= 3600 * 1000;
  };

  // Start editing a message
  const handleStartEdit = (msg: { id: string; content: string }) => {
    setEditingMessageId(msg.id);
    setEditingMessageText(msg.content);
    setDeleteConfirmMsgId(null);
  };

  // Save edited message
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMessageId || !editingMessageText.trim() || isSavingEdit) return;
    setIsSavingEdit(true);
    try {
      const updated = await chatApi.editMessage(editingMessageId, editingMessageText.trim());
      setLiveMessages((prev) =>
        prev.map((m) =>
          m.id === editingMessageId
            ? {
                ...m,
                content: updated.content,
                is_edited: true,
                edited_at: updated.edited_at,
              }
            : m
        )
      );
      setEditingMessageId(null);
      setEditingMessageText('');
      refreshConversations();
    } catch (err: any) {
      alert(err?.message || 'Could not edit message. Editing is only permitted within 1 hour of sending.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Delete single message
  const handleDeleteMessage = async (msgId: string) => {
    if (isDeletingMsg) return;
    setIsDeletingMsg(true);
    try {
      await chatApi.deleteMessage(msgId);
      setLiveMessages((prev) =>
        prev.map((m) =>
          m.id === msgId
            ? {
                ...m,
                content: 'This message was deleted',
                is_deleted: true,
              }
            : m
        )
      );
      setDeleteConfirmMsgId(null);
      refreshConversations();
    } catch (err: any) {
      alert(err?.message || 'Could not delete message.');
    } finally {
      setIsDeletingMsg(false);
    }
  };

  // Delete entire conversation thread and all contents
  const handleDeleteEntireChat = async () => {
    if (!activeConvId || isDeletingChat) return;
    setIsDeletingChat(true);
    try {
      await chatApi.deleteConversation(activeConvId);
      setLiveMessages([]);
      setShowDeleteChatModal(false);
      setActiveConvId('');
      setMobileShowChat(false);
      await refreshConversations();
    } catch (err: any) {
      alert(err?.message || 'Could not delete conversation.');
    } finally {
      setIsDeletingChat(false);
    }
  };

  // Handle typing presence broadcast
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    if (!activeConvId || !isUuid(activeConvId)) return;

    chatApi.setTyping(activeConvId, true).catch(() => {});

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      chatApi.setTyping(activeConvId, false).catch(() => {});
    }, 2000);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text || !activeConvId) return;

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    if (isUuid(activeConvId)) {
      chatApi.setTyping(activeConvId, false).catch(() => {});
    }

    const tempId = `temp-${Date.now()}`;
    const optimisticMsg = {
      id: tempId,
      conversationId: activeConvId,
      senderId: currentUser.id,
      content: text,
      createdAt: new Date().toISOString(),
      status: 'sending',
      read: false,
    };
    setLiveMessages((prev) => [...prev, optimisticMsg]);
    setInputText('');

    sendMessage(activeConvId, text);
  };

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto h-[calc(100vh-140px)] min-h-[500px]">
        {/* Main Chat Shell (Split View) */}
        <div className="bg-gm-white border border-gm-border/70 rounded-2xl h-full grid grid-cols-1 md:grid-cols-12 overflow-hidden shadow-xs">
          
          {/* Conversations Drawer (Left) */}
          <div
            className={`${
              mobileShowChat ? 'hidden md:flex' : 'flex'
            } md:col-span-5 border-r border-gm-border/70 flex-col bg-gm-ivory/30`}
          >
            {/* Search Header */}
            <div className="p-3 border-b border-gm-border/70">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-gm-text-secondary absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search chats..."
                  className="w-full pl-8 pr-3 py-2 bg-gm-white border border-gm-border/70 rounded-full text-xs text-gm-midnight focus:outline-none focus:border-gm-lavender transition-all"
                />
              </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto divide-y divide-gm-border/50">
              {isLoadingConversations ? (
                /* Shimmer loading skeleton */
                <div className="p-3.5 space-y-3.5">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 animate-pulse">
                      <div className="w-10 h-10 rounded-full bg-gray-200/80 flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-gray-200/90 rounded-full w-24" />
                        <div className="h-2.5 bg-gray-100 rounded-full w-36" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredConversations.length > 0 ? (
                filteredConversations.map((conv) => {
                  const partner = resolvePartner(conv);
                  if (!partner) return null;

                  const isSelected = conv.id === activeConvId;

                  return (
                    <button
                      key={conv.id}
                      onClick={() => {
                        setActiveConvId(conv.id);
                        setMobileShowChat(true);
                      }}
                      className={`w-full text-left p-3.5 flex items-start gap-3 transition-colors ${
                        isSelected ? 'bg-gm-lavender-soft/70' : 'hover:bg-gm-ivory'
                      }`}
                    >
                      {partner.avatarImage ? (
                        <img
                          src={partner.avatarImage}
                          alt={partner.name}
                          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${partner.avatarColor} flex-shrink-0`}
                        >
                          {partner.avatar}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between mb-0.5">
                          <span className="text-xs font-bold text-gm-midnight truncate">
                            {partner.name}
                          </span>
                          <span className="text-[10px] text-gm-text-secondary flex-shrink-0">
                            {conv.lastMessage ? formatRelativeTime(conv.lastMessage.createdAt) : ''}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-[11px] text-gm-text-secondary truncate flex-1 pr-2">
                            {conv.lastMessage ? conv.lastMessage.content : 'No messages yet'}
                          </p>
                          {conv.unreadCount > 0 && (
                            <span className="w-4 h-4 rounded-full bg-gm-accent text-white text-[9px] font-bold flex items-center justify-center flex-shrink-0">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              ) : search.trim() ? (
                /* Search empty state */
                <div className="p-6 text-center text-xs text-gm-text-secondary">
                  <Search className="w-6 h-6 mx-auto mb-2 text-gray-300" />
                  <p className="font-semibold text-gm-midnight">No chats matching &quot;{search}&quot;</p>
                  <p className="text-[11px] text-gray-500 mt-1">Check the spelling or clear the search.</p>
                </div>
              ) : (
                /* Positive no-conversations state */
                <div className="p-6 text-center flex flex-col items-center justify-center h-full min-h-[300px]">
                  <div className="w-12 h-12 rounded-2xl bg-gm-accent-soft text-gm-accent flex items-center justify-center mb-3 shadow-2xs border border-gm-accent-line">
                    <MessageSquare className="w-6 h-6 stroke-[2]" />
                  </div>
                  <h3 className="text-xs font-bold text-gm-ink">No conversations yet</h3>
                  <p className="text-[11px] text-gray-500 mt-1.5 leading-relaxed max-w-[210px]">
                    Connect with creators, exchange milestone feedback, or start a chat from anyone&apos;s profile!
                  </p>
                  <Link
                    href="/home"
                    className="mt-4 px-3.5 py-1.5 rounded-full bg-gm-ink hover:bg-black text-white text-[11px] font-bold transition-all shadow-xs active:scale-95"
                  >
                    Discover Creators
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Active Conversation Panel (Right) */}
          <div
            className={`${
              !mobileShowChat ? 'hidden md:flex' : 'flex'
            } md:col-span-7 flex-col h-full bg-gm-white`}
          >
            {otherFounder ? (
              <>
                {/* Active Chat Header */}
                <div className="p-3.5 border-b border-gm-border/70 flex items-center justify-between bg-gm-ivory/20">
                  <div className="flex items-center gap-2.5">
                    {/* Back button on mobile */}
                    <button
                      onClick={() => setMobileShowChat(false)}
                      className="md:hidden p-1.5 -ml-1 text-gm-text-secondary hover:text-gm-midnight rounded-full"
                      aria-label="Back to conversations"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>

                    {otherFounder.avatarImage ? (
                      <img
                        src={otherFounder.avatarImage}
                        alt={otherFounder.name}
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${otherFounder.avatarColor}`}
                      >
                        {otherFounder.avatar}
                      </div>
                    )}
                    <div>
                      <span className="text-xs font-bold text-gm-midnight block">
                        {otherFounder.name}
                      </span>
                      <span className="text-[10px] text-gm-text-secondary flex items-center gap-1">
                        {isOtherTyping ? (
                          <span className="text-gm-accent font-semibold animate-pulse">typing...</span>
                        ) : (
                          otherFounder.stage
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/profile/${otherFounder.username}`}
                      className="text-[11px] font-semibold text-gm-indigo hover:underline flex items-center gap-1"
                    >
                      <FileBadge2 className="w-3.5 h-3.5" />
                      <span>Profile</span>
                    </Link>

                    {/* Chat options menu */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsChatMenuOpen((prev) => !prev)}
                        className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                        title="Chat options"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {isChatMenuOpen && (
                        <>
                          <div className="fixed inset-0 z-30" onClick={() => setIsChatMenuOpen(false)} />
                          <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-40 text-left">
                            <button
                              type="button"
                              onClick={() => {
                                setIsChatMenuOpen(false);
                                setShowDeleteChatModal(true);
                              }}
                              className="w-full px-3 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete Entire Chat</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Messages Stream */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#F8F7FF]/30">
                  {isLoadingMessages ? (
                    <div className="h-full flex flex-col items-center justify-center text-center py-10">
                      <div className="w-5 h-5 rounded-full border-2 border-gm-accent border-t-transparent animate-spin mb-2" />
                      <p className="text-xs text-gray-400 font-medium">Loading conversation...</p>
                    </div>
                  ) : liveMessages.length > 0 ? (
                    liveMessages.map((msg) => {
                      const isMe = msg.senderId === currentUser.id;
                      const isRead = msg.status === 'read' || msg.read;
                      const isDelivered = msg.status === 'delivered';
                      const isSending = msg.status === 'sending';
                      const isDeleted = Boolean(msg.is_deleted);
                      const isEdited = Boolean(msg.is_edited);
                      const canEdit = isMe && !isDeleted && isWithinOneHour(msg.createdAt);
                      const canDelete = isMe && !isDeleted;
                      const isCurrentlyEditing = editingMessageId === msg.id;
                      const isConfirmingDelete = deleteConfirmMsgId === msg.id;

                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col group ${isMe ? 'items-end' : 'items-start'}`}
                        >
                          <div
                            className={`max-w-[85%] rounded-[22px] px-4 py-2.5 text-[13px] leading-relaxed relative ${
                              isDeleted
                                ? 'bg-gray-100 text-gray-500 border border-gray-200/80 italic shadow-none'
                                : isMe
                                ? 'bg-gm-indigo text-gm-white rounded-br-none shadow-sm'
                                : 'bg-gm-white border border-gm-border text-gm-midnight rounded-bl-none shadow-2xs'
                            }`}
                          >
                            {isDeleted ? (
                              <p className="flex items-center gap-1.5 text-xs text-gray-500 not-italic">
                                <Trash2 className="w-3.5 h-3.5 text-gray-400 stroke-[1.5]" />
                                <span className="italic">This message was deleted</span>
                              </p>
                            ) : isCurrentlyEditing ? (
                              <form onSubmit={handleSaveEdit} className="space-y-2 py-0.5">
                                <input
                                  type="text"
                                  value={editingMessageText}
                                  onChange={(e) => setEditingMessageText(e.target.value)}
                                  className="w-full px-2.5 py-1 text-xs rounded-lg bg-white text-gray-900 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gm-accent"
                                  autoFocus
                                />
                                <div className="flex items-center justify-end gap-1.5 text-[10px]">
                                  <button
                                    type="button"
                                    onClick={() => setEditingMessageId(null)}
                                    className="px-2 py-0.5 rounded bg-white/20 hover:bg-white/30 text-white cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="submit"
                                    disabled={isSavingEdit || !editingMessageText.trim()}
                                    className="px-2.5 py-0.5 rounded bg-white text-gm-accent font-bold hover:bg-gray-100 disabled:opacity-50 cursor-pointer"
                                  >
                                    {isSavingEdit ? 'Saving...' : 'Save'}
                                  </button>
                                </div>
                              </form>
                            ) : (
                              <>
                                <p className="whitespace-pre-line break-words">{msg.content}</p>

                                {isConfirmingDelete && (
                                  <div className="mt-1.5 pt-1.5 border-t border-white/20 flex items-center justify-between gap-2 text-[10px]">
                                    <span className="text-white/90">Delete this message?</span>
                                    <div className="flex items-center gap-1">
                                      <button
                                        type="button"
                                        onClick={() => setDeleteConfirmMsgId(null)}
                                        className="px-1.5 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteMessage(msg.id)}
                                        disabled={isDeletingMsg}
                                        className="px-1.5 py-0.5 rounded bg-red-500 hover:bg-red-600 text-white font-bold cursor-pointer"
                                      >
                                        {isDeletingMsg ? '...' : 'Delete'}
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </>
                            )}

                            {/* Message Footer: Timestamp, ticks, (edited) tag & action buttons */}
                            <div
                              className={`flex items-center gap-1.5 justify-end mt-1 text-[9px] ${
                                isDeleted
                                  ? 'text-gray-400'
                                  : isMe
                                  ? 'text-white/80'
                                  : 'text-gm-text-secondary'
                              }`}
                            >
                              {isEdited && !isDeleted && (
                                <span className="opacity-80 italic">(edited)</span>
                              )}
                              <span>{formatRelativeTime(msg.createdAt)}</span>

                              {isMe && !isDeleted && (
                                <span className="inline-flex items-center ml-0.5">
                                  {isRead ? (
                                    <span title="Read">
                                      <CheckCheck className="w-3.5 h-3.5 text-sky-300 stroke-[2.5]" />
                                    </span>
                                  ) : isDelivered ? (
                                    <span title="Delivered">
                                      <CheckCheck className="w-3.5 h-3.5 text-white/70 stroke-[2]" />
                                    </span>
                                  ) : isSending ? (
                                    <span title="Sending">
                                      <Clock className="w-3 h-3 text-white/60 animate-spin" />
                                    </span>
                                  ) : (
                                    <span title="Sent">
                                      <Check className="w-3 h-3 text-white/70 stroke-[2]" />
                                    </span>
                                  )}
                                </span>
                              )}

                              {/* Action buttons (Edit & Delete) for own non-deleted messages */}
                              {isMe && !isDeleted && !isCurrentlyEditing && !isConfirmingDelete && (
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 ml-1.5 bg-black/20 rounded-full px-1.5 py-0.5">
                                  {canEdit && (
                                    <button
                                      type="button"
                                      onClick={() => handleStartEdit(msg)}
                                      className="hover:text-white text-white/80 transition-colors p-0.5 cursor-pointer"
                                      title="Edit message (within 1 hour)"
                                    >
                                      <Pencil className="w-2.5 h-2.5" />
                                    </button>
                                  )}
                                  {canDelete && (
                                    <button
                                      type="button"
                                      onClick={() => setDeleteConfirmMsgId(msg.id)}
                                      className="hover:text-red-200 text-white/80 transition-colors p-0.5 cursor-pointer"
                                      title="Delete message"
                                    >
                                      <Trash2 className="w-2.5 h-2.5" />
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    /* Positive Icebreaker Conversation Starter */
                    <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                      {otherFounder.avatarImage ? (
                        <img
                          src={otherFounder.avatarImage}
                          alt={otherFounder.name}
                          className="w-14 h-14 rounded-full object-cover ring-4 ring-gm-accent-soft shadow-sm mb-3"
                        />
                      ) : (
                        <div
                          className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-base ${otherFounder.avatarColor} ring-4 ring-gm-accent-soft shadow-sm mb-3`}
                        >
                          {otherFounder.avatar}
                        </div>
                      )}
                      <h4 className="text-sm font-bold text-gm-ink">
                        Say hello to {otherFounder.name}!
                      </h4>
                      <p className="text-xs text-gray-500 mt-1 max-w-xs leading-relaxed">
                        Start a friendly chat, ask about their recent progress, or collaborate on a journey.
                      </p>

                      {/* Suggested Icebreakers */}
                      <div className="mt-4 flex flex-wrap justify-center gap-1.5 max-w-xs">
                        {[
                          `Hey ${otherFounder.name.split(' ')[0]}! Great to connect with you.`,
                          'Loved your recent milestone update!',
                          'What are you currently focusing on this week?',
                        ].map((prompt, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setInputText(prompt)}
                            className="text-[11px] px-3 py-1.5 rounded-full bg-white hover:bg-gm-accent-soft border border-gray-200/90 hover:border-gm-accent/40 text-gray-700 hover:text-gm-accent transition-all cursor-pointer shadow-2xs active:scale-95 text-left"
                          >
                            &ldquo;{prompt}&rdquo;
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input Box */}
                <form
                  onSubmit={handleSend}
                  className="p-3 border-t border-gm-border/70 flex gap-2 bg-gm-white"
                >
                  <input
                    type="text"
                    value={inputText}
                    onChange={handleInputChange}
                    placeholder={`Message ${otherFounder.name}...`}
                    className="flex-1 px-3.5 py-2 bg-gm-ivory border border-gm-border/70 rounded-full text-xs text-gm-midnight placeholder:text-gm-text-secondary focus:outline-none focus:border-gm-lavender"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="px-4 py-2 bg-gm-indigo hover:bg-gm-indigo-hover disabled:opacity-40 text-white rounded-full font-bold text-xs transition-colors flex items-center gap-1 shadow-sm active:scale-95 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </>
            ) : (
              /* Positive General Welcome Screen (No active conversation selected) */
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white">
                <div className="w-14 h-14 rounded-2xl bg-gm-accent-soft border border-gm-accent-line flex items-center justify-center mb-3 text-gm-accent shadow-2xs">
                  <MessageSquare className="w-7 h-7 stroke-[2]" />
                </div>
                <h2 className="text-xl font-extrabold text-gm-ink tracking-tight">
                  Your Direct Messages
                </h2>
                <p className="text-xs text-gray-500 mt-1 max-w-sm leading-relaxed">
                  Real-time conversations with creators, collaborators, and mentors across Growing Moon.
                </p>

                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-md w-full text-left">
                  <div className="p-3 rounded-2xl bg-[#F8F9FA] border border-gray-100 flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-gm-accent flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-gm-ink">Milestone Feedback</p>
                      <p className="text-[10.5px] text-gray-500 leading-normal">
                        Trade private advice with creators ahead of you.
                      </p>
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#F8F9FA] border border-gray-100 flex items-start gap-2.5">
                    <Users className="w-4 h-4 text-gm-accent flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-gm-ink">Real-Time Collaboration</p>
                      <p className="text-[10.5px] text-gray-500 leading-normal">
                        Instant delivery and read status indicators.
                      </p>
                    </div>
                  </div>
                </div>

                <Link
                  href="/home"
                  className="mt-6 px-4 py-2 rounded-full bg-gm-accent hover:bg-gm-accent-deep text-white text-xs font-bold transition-all shadow-xs active:scale-95"
                >
                  Discover People to Chat With
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Delete Entire Chat Confirmation Modal */}
        {showDeleteChatModal && otherFounder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gm-ink/45 backdrop-blur-md">
            <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-xl border border-gray-100 text-left animate-slide-up">
              <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-3">
                <Trash2 className="w-5 h-5 stroke-[2]" />
              </div>
              <h3 className="text-sm font-bold text-gray-900">Delete Entire Conversation?</h3>
              <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                All messages and content exchanged with <strong className="text-gray-700">{otherFounder.name}</strong> will be permanently deleted from the database. This action cannot be undone.
              </p>
              <div className="mt-5 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteChatModal(false)}
                  disabled={isDeletingChat}
                  className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteEntireChat}
                  disabled={isDeletingChat}
                  className="px-4 py-1.5 rounded-full text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {isDeletingChat ? 'Deleting...' : 'Delete Entire Chat'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={null}>
      <MessagesContent />
    </Suspense>
  );
}
