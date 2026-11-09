'use client';
import React, { useState, useEffect, useRef } from 'react';
import AppShell from '@/components/shared/AppShell';
import EmptyState from '@/components/EmptyState';
import { useApp } from '@/lib/state/AppContext';
import { getFounderById } from '@/lib/mock-data/founders';
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
} from 'lucide-react';

export default function MessagesPage() {
  const { currentUser, conversations, messages, sendMessage } = useApp();

  const [activeConvId, setActiveConvId] = useState<string>(
    conversations[0]?.id || ''
  );
  const [inputText, setInputText] = useState('');
  const [search, setSearch] = useState('');
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const [liveMessages, setLiveMessages] = useState<Array<{
    id: string;
    conversationId: string;
    senderId: string;
    content: string;
    createdAt: string;
    status?: 'sending' | 'sent' | 'delivered' | 'read' | string;
    read?: boolean;
  }>>([]);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const activeConversation = conversations.find((c) => c.id === activeConvId);
  const otherParticipantId = activeConversation?.participantIds.find(
    (id) => id !== currentUser.id
  );
  const otherFounder = otherParticipantId ? getFounderById(otherParticipantId) : null;

  // 1. Load messages from FastAPI backend when active conversation changes
  useEffect(() => {
    if (!activeConvId) return;

    // Load initial messages from AppContext state first
    const cached = messages[activeConvId] || [];
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

    // Fetch authoritative message history from backend
    chatApi
      .getMessages(activeConvId)
      .then((serverMessages: ChatMessage[]) => {
        if (serverMessages && serverMessages.length > 0) {
          setLiveMessages(
            serverMessages.map((sm) => ({
              id: sm.id,
              conversationId: sm.conversation_id,
              senderId: sm.sender_id,
              content: sm.content,
              createdAt: sm.sent_at || sm.created_at,
              status: sm.status,
              read: sm.status === 'read',
            }))
          );
        }
      })
      .catch((err) => {
        console.warn('Backend chat history offline, using cached messages:', err);
      });

    // Mark messages as read on entry
    chatApi.markRead(activeConvId).catch(() => {});
  }, [activeConvId, messages]);

  // 2. Real-time Supabase WebSocket Channel Subscription
  useEffect(() => {
    if (!activeConvId) return;

    const unsubscribe = subscribeToConversationMessages(
      activeConvId,
      (newMsgPayload) => {
        // Realtime new incoming message
        const incoming = {
          id: newMsgPayload.id,
          conversationId: newMsgPayload.conversation_id,
          senderId: newMsgPayload.sender_id,
          content: newMsgPayload.content,
          createdAt: newMsgPayload.sent_at || newMsgPayload.created_at,
          status: newMsgPayload.status || 'delivered',
          read: newMsgPayload.status === 'read',
        };

        setLiveMessages((prev) => {
          if (prev.some((m) => m.id === incoming.id)) return prev;
          return [...prev, incoming];
        });

        // If message is from partner, mark it read immediately
        if (incoming.senderId !== currentUser.id) {
          chatApi.markRead(activeConvId).catch(() => {});
        }
      },
      (updatedMsgPayload) => {
        // Realtime update (e.g. read status changed from 'delivered' to 'read' - triggers blue double ticks!)
        setLiveMessages((prev) =>
          prev.map((m) =>
            m.id === updatedMsgPayload.id
              ? {
                  ...m,
                  status: updatedMsgPayload.status || m.status,
                  read: updatedMsgPayload.status === 'read',
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

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [liveMessages]);

  const filteredConversations = conversations.filter((c) => {
    const otherId = c.participantIds.find((id) => id !== currentUser.id);
    const f = otherId ? getFounderById(otherId) : null;
    if (!f) return false;
    if (!search.trim()) return true;
    return f.name.toLowerCase().includes(search.toLowerCase());
  });

  // Handle typing presence broadcast
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    if (!activeConvId) return;

    // Send typing notification
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

    // Clear typing state
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    chatApi.setTyping(activeConvId, false).catch(() => {});

    // Optimistic message addition with 'sending' status
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

    // Trigger state context + FastAPI backend call
    sendMessage(activeConvId, text);
  };

  return (
    <AppShell>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gm-midnight tracking-tight">
              Messages
            </h1>
            <p className="text-xs text-gm-text-secondary mt-0.5">
              Chat and share advice with other builders in real time.
            </p>
          </div>
        </div>

        {/* ── Two-Column Messaging Box (Responsive WhatsApp Layout) ── */}
        <div className="bg-gm-white border border-gm-border/80 rounded-2xl sm:rounded-3xl shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12 h-[calc(100dvh-170px)] min-h-[460px] sm:h-[620px]">
          {/* Conversation List (Left) */}
          <div
            className={`${
              mobileShowChat ? 'hidden md:flex' : 'flex'
            } md:col-span-5 border-r border-gm-border/70 flex-col bg-gm-ivory/30`}
          >
            {/* Search */}
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

            {/* List */}
            <div className="flex-1 overflow-y-auto divide-y divide-gm-border/50">
              {filteredConversations.map((conv) => {
                const partnerId = conv.participantIds.find((id) => id !== currentUser.id);
                const partner = partnerId ? getFounderById(partnerId) : null;
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
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${partner.avatarColor} flex-shrink-0`}
                    >
                      {partner.avatar}
                    </div>
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
                          <span className="w-4 h-4 rounded-full bg-[#6258DB] text-white text-[9px] font-bold flex items-center justify-center flex-shrink-0">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
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

                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${otherFounder.avatarColor}`}
                    >
                      {otherFounder.avatar}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-gm-midnight block">
                        {otherFounder.name}
                      </span>
                      <span className="text-[10px] text-gm-text-secondary flex items-center gap-1">
                        {isOtherTyping ? (
                          <span className="text-[#6258DB] font-semibold animate-pulse">typing...</span>
                        ) : (
                          otherFounder.stage
                        )}
                      </span>
                    </div>
                  </div>

                  <a
                    href={`/passport/${otherFounder.username}`}
                    className="text-[11px] font-semibold text-gm-indigo hover:underline flex items-center gap-1"
                  >
                    <FileBadge2 className="w-3.5 h-3.5" />
                    <span>Passport</span>
                  </a>
                </div>

                {/* WhatsApp Messages Stream */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#F8F7FF]/30">
                  {liveMessages.map((msg) => {
                    const isMe = msg.senderId === currentUser.id;
                    const isRead = msg.status === 'read' || msg.read;
                    const isDelivered = msg.status === 'delivered';
                    const isSending = msg.status === 'sending';

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-2 text-xs leading-relaxed ${
                            isMe
                              ? 'bg-gm-indigo text-gm-white rounded-br-none shadow-sm'
                              : 'bg-gm-white border border-gm-border text-gm-midnight rounded-bl-none shadow-2xs'
                          }`}
                        >
                          <p className="whitespace-pre-line">{msg.content}</p>
                          <div
                            className={`flex items-center gap-1 justify-end mt-1 text-[9px] ${
                              isMe ? 'text-white/80' : 'text-gm-text-secondary'
                            }`}
                          >
                            <span>{formatRelativeTime(msg.createdAt)}</span>
                            {isMe && (
                              <span className="inline-flex items-center ml-0.5">
                                {isRead ? (
                                  // Blue Double Ticks (Read)
                                  <span title="Read">
                                    <CheckCheck className="w-3.5 h-3.5 text-sky-300 stroke-[2.5]" />
                                  </span>
                                ) : isDelivered ? (
                                  // Grey Double Ticks (Delivered)
                                  <span title="Delivered">
                                    <CheckCheck className="w-3.5 h-3.5 text-white/70 stroke-[2]" />
                                  </span>
                                ) : isSending ? (
                                  // Clock Icon (Sending)
                                  <span title="Sending">
                                    <Clock className="w-3 h-3 text-white/60 animate-spin" />
                                  </span>
                                ) : (
                                  // Single Grey Tick (Sent)
                                  <span title="Sent">
                                    <Check className="w-3 h-3 text-white/70 stroke-[2]" />
                                  </span>
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
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
              <div className="flex-1 flex items-center justify-center p-8">
                <EmptyState
                  icon={<MessageSquare className="w-10 h-10 opacity-30 text-gm-indigo" />}
                  title="No conversation selected"
                  description="Choose a conversation from the left to start chatting."
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
