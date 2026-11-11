'use client';
import React, { createContext, useContext, useState, useEffect } from "react";
import type {
  FounderProfile,
  JourneyUpdate,
  Comment,
  ConnectionStatus,
  Message,
  Conversation,
  Notification,
  Milestone,
} from "@/types";
import { DEMO_USER, founders as initialFounders } from "@/lib/mock-data/founders";
import { mockUpdates as initialUpdates } from "@/lib/mock-data/updates";
import { mockConversations as initialConversations, mockMessages as initialMessages } from "@/lib/mock-data/messages";
import { mockNotifications as initialNotifications } from "@/lib/mock-data/notifications";
import { mockMilestones as initialMilestones } from "@/lib/mock-data/passports";
import { generateId } from "@/lib/utils";
import { feedApi, postsApi, usersApi, notificationsApi, chatApi, socialApi, setStoredAuthToken, getStoredAuthToken } from "@/lib/api/client";
import type { FeedPost } from "@/lib/api/types";
import { supabase } from "@/lib/supabaseClient";

export type Toast = {
  id: string;
  message: string;
  type?: "success" | "info" | "warning" | "danger";
};

type AppContextType = {
  // User & Authentication
  currentUser: FounderProfile;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  isLoadingFeed: boolean;
  refreshFeed: () => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updated: Partial<FounderProfile>) => void;
  resetDemoUser: () => void;

  // Updates (Posts)
  updates: JourneyUpdate[];
  addUpdate: (newUpdate: Omit<JourneyUpdate, "id" | "authorId" | "createdAt" | "likes" | "saves" | "comments">) => JourneyUpdate;
  deleteUpdate: (id: string) => void;
  toggleLike: (updateId: string) => void;
  toggleSave: (updateId: string) => void;
  addComment: (updateId: string, content: string) => void;

  // Connections
  connections: Record<string, ConnectionStatus>;
  sendConnectionRequest: (founderId: string) => void;
  acceptConnectionRequest: (founderId: string) => void;
  removeConnection: (founderId: string) => void;

  // Messages
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  sendMessage: (conversationId: string, content: string) => void;
  createConversation: (recipientId: string, initialMessageText: string) => string;
  refreshConversations: () => Promise<void>;

  // Notifications
  notifications: Notification[];
  unreadNotificationCount: number;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // Milestones
  milestones: Milestone[];
  addMilestone: (m: Omit<Milestone, "id" | "founderId">) => void;
  editMilestone: (id: string, updated: Partial<Milestone>) => void;
  deleteMilestone: (id: string) => void;

  // Toasts
  toasts: Toast[];
  addToast: (message: string, type?: Toast["type"]) => void;
  removeToast: (id: string) => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

const DATA_VERSION = "gm_v4_yt_featured_v1";

function mapFeedPostToJourneyUpdate(p: FeedPost): JourneyUpdate {
  return {
    id: p.id,
    authorId: p.author_id,
    author: {
      id: p.author.id,
      username: p.author.username,
      name: p.author.name,
      avatar: p.author.avatar_initials,
      avatarImage: p.author.avatar_image || undefined,
      avatarColor: p.author.avatar_color || 'bg-amber-100 text-amber-800',
      role: p.author.role_title || undefined,
      role_title: p.author.role_title || undefined,
      location: p.author.location || undefined,
    },
    headline: p.headline || undefined,
    journeyTag: p.journey_tag || undefined,
    journey_tag: p.journey_tag || undefined,
    content: p.content,
    category: p.category,
    startDate: p.start_date || undefined,
    endDate: p.end_date || undefined,
    start_date: p.start_date || undefined,
    end_date: p.end_date || undefined,
    createdAt: p.created_at,
    created_at: p.created_at,
    updatedAt: p.updated_at,
    likes: p.is_fueled_by_me ? [p.author_id] : [],
    saves: p.is_saved_by_me ? [p.author_id] : [],
    comments: [],
    prompt_question_1: p.prompt_question_1 || undefined,
    prompt_question_2: p.prompt_question_2 || undefined,
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

const EMPTY_GUEST_USER: FounderProfile = {
  id: '',
  name: 'Explorer',
  username: '',
  avatar: 'GM',
  avatarColor: 'bg-[#ECE9FE] text-[#5546D6]',
  bio: '',
  role: 'Explorer',
  stage: 'Exploring',
  currentGoal: '',
  biggestChallenge: '',
  skillsOffered: [],
  skillsNeeded: [],
  interests: [],
  location: '',
  joinedDate: new Date().toISOString(),
  connectionsCount: 0,
  isDemo: false,
};

function getCachedUser(): { user: FounderProfile | null; token: string | null } {
  if (typeof window === "undefined") return { user: null, token: null };
  try {
    const raw = localStorage.getItem("gm_user");
    const token = getStoredAuthToken();
    if (raw && token) {
      const parsed = JSON.parse(raw);
      if (parsed?.id) return { user: parsed, token };
    }
  } catch {}
  return { user: null, token: null };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  // User & Authentication (Consistent initial state between SSR & Client Hydration)
  const [currentUser, setCurrentUser] = useState<FounderProfile>(EMPTY_GUEST_USER);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  // Updates (Posts) - Empty by default for closed loop
  const [updates, setUpdates] = useState<JourneyUpdate[]>([]);
  const [isLoadingFeed, setIsLoadingFeed] = useState<boolean>(true);

  // Connections
  const [connections, setConnections] = useState<Record<string, ConnectionStatus>>({});

  // Messages
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});

  // Notifications
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Milestones
  const [milestones, setMilestones] = useState<Milestone[]>(initialMilestones);

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  // ── Sync with Supabase Auth & FastAPI Backend (Closed Loop) ─────
  useEffect(() => {
    let isMounted = true;

    // 1. Instantly hydrate from localStorage on client mount (post-hydration, 0ms)
    const { user, token: cachedToken } = getCachedUser();
    if (user && cachedToken && isMounted) {
      setCurrentUser(user);
      setIsAuthenticated(true);
      setIsAuthLoading(false);
    }

    const syncUserData = async (sessionUser: any) => {
      const userMeta = sessionUser?.user_metadata || {};
      const fallbackName = userMeta.full_name || userMeta.name || sessionUser.email?.split('@')[0] || 'Explorer';
      const fallbackUsername = userMeta.username || sessionUser.email?.split('@')[0] || 'user';
      const fallbackAvatar = userMeta.avatar_url || userMeta.picture || undefined;

      const baseProfile: FounderProfile = {
        id: sessionUser.id,
        name: fallbackName,
        username: fallbackUsername,
        avatar: fallbackName.slice(0, 2).toUpperCase(),
        avatarImage: fallbackAvatar,
        avatarColor: 'bg-[#ECE9FE] text-[#5546D6]',
        bio: userMeta.bio || '',
        role: userMeta.role_title || 'Builder',
        stage: 'Building MVP',
        currentGoal: '',
        biggestChallenge: '',
        skillsOffered: [],
        skillsNeeded: [],
        interests: [],
        location: userMeta.location || '',
        joinedDate: sessionUser.created_at || new Date().toISOString(),
        connectionsCount: 0,
        isDemo: false,
      };

      if (isMounted) {
        setCurrentUser(baseProfile);
      }

      // Authoritative profile from backend
      try {
        const me = await usersApi.getMe();
        if (isMounted && me) {
          setCurrentUser({
            id: me.id,
            name: me.name,
            username: me.username,
            avatar: me.avatar_initials || 'GM',
            avatarImage: me.avatar_image || fallbackAvatar,
            avatarColor: me.avatar_color || 'bg-amber-100 text-amber-800',
            bio: me.bio || '',
            role: me.role_title || 'Builder',
            stage: 'Building MVP',
            currentGoal: 'Building Growing Moon',
            biggestChallenge: 'Finding early community',
            skillsOffered: [],
            skillsNeeded: [],
            interests: [],
            location: me.location || 'Bengaluru',
            joinedDate: me.created_at,
            connectionsCount: me.connections_count,
            isDemo: false,
          });
        }
      } catch (err) {
        // Backend sync pending
      }
    };

    const loadAuthenticatedData = async () => {
      setIsLoadingFeed(true);
      // 1. Live feed
      feedApi
        .getFeed()
        .then((res) => {
          if (isMounted && res?.items && Array.isArray(res.items)) {
            setUpdates(res.items.map(mapFeedPostToJourneyUpdate));
          }
        })
        .catch(() => {})
        .finally(() => {
          if (isMounted) setIsLoadingFeed(false);
        });

      // 2. Notifications
      notificationsApi
        .getNotifications()
        .then((data) => {
          const rawList = data?.items || data?.notifications;
          if (isMounted && Array.isArray(rawList)) {
            const mappedNotifications: Notification[] = rawList.map((n: any) => ({
              id: n.id,
              actorId: n.actor_id || 'u-system',
              type: (n.type as any) || 'like',
              message: n.message,
              read: n.is_read,
              createdAt: n.created_at,
              link: n.link || '/home',
            }));
            setNotifications(mappedNotifications);
          }
        })
        .catch(() => {});

      // 3. Conversations (with deduplication by partner user)
      chatApi
        .getConversations()
        .then((convs) => {
          if (!isMounted) return;
          if (Array.isArray(convs) && convs.length > 0) {
            const seenPartnerIds = new Set<string>();
            const uniqueConvs = convs.filter((c) => {
              const partnerId = c.other_participant?.id;
              if (!partnerId) return true;
              if (seenPartnerIds.has(partnerId)) return false;
              seenPartnerIds.add(partnerId);
              return true;
            });

            const mapped = uniqueConvs.map((c) => ({
              id: c.id,
              participantIds: [
                currentUser.id,
                c.other_participant ? c.other_participant.id : '',
              ].filter(Boolean),
              updatedAt: c.last_message_at || (c as any).created_at || new Date().toISOString(),
              unreadCount: c.unread_count,
              otherParticipant: c.other_participant,
              lastMessage: c.last_message_text
                ? {
                    id: `m-${c.id}`,
                    conversationId: c.id,
                    senderId: c.last_message_sender_id || '',
                    content: c.last_message_text,
                    createdAt: c.last_message_at || new Date().toISOString(),
                    read: c.last_message_status === 'read',
                  }
                : undefined,
            }));
            setConversations(mapped);
          } else {
            setConversations([]);
          }
        })
        .catch(() => {
          if (isMounted) setConversations([]);
        });

      // 4. Social connections
      socialApi
        .getConnections()
        .then((data) => {
          if (isMounted && data && Array.isArray(data.connections)) {
            const map: Record<string, ConnectionStatus> = {};
            for (const item of data.connections) {
              if (item.status === 'accepted') {
                map[item.user.id] = 'connected';
                map[item.user.username] = 'connected';
              } else if (item.status === 'pending') {
                const status: ConnectionStatus = item.is_requester ? 'pending-sent' : 'pending-received';
                map[item.user.id] = status;
                map[item.user.username] = status;
              }
            }
            setConnections(map);
          }
        })
        .catch(() => {});
    };

    // ── Backend Session Verification (Instagram-grade Persistent Auth) ──
    const checkSession = async () => {
      // 1. Silent token refresh with Supabase if active session exists
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session?.access_token) {
          setStoredAuthToken(sessionData.session.access_token);
        }
      } catch {}

      const token = getStoredAuthToken();
      if (!token) {
        if (isMounted) {
          setIsAuthenticated(false);
          setCurrentUser(EMPTY_GUEST_USER);
          setUpdates([]);
          setIsAuthLoading(false);
          if (typeof window !== "undefined") {
            localStorage.removeItem("gm_user");
          }
        }
        return;
      }

      try {
        const me = await usersApi.getMe();
        if (isMounted && me) {
          const freshProfile: FounderProfile = {
            id: me.id,
            name: me.name,
            username: me.username,
            avatar: me.avatar_initials || 'GM',
            avatarImage: me.avatar_image || undefined,
            avatarColor: me.avatar_color || 'bg-amber-100 text-amber-800',
            bio: me.bio || '',
            role: me.role_title || 'Builder',
            stage: 'Building MVP',
            currentGoal: 'Building Growing Moon',
            biggestChallenge: 'Finding early community',
            skillsOffered: [],
            skillsNeeded: [],
            interests: [],
            location: me.location || 'Bengaluru',
            joinedDate: me.created_at,
            connectionsCount: me.connections_count,
            isDemo: false,
          };
          setIsAuthenticated(true);
          setCurrentUser(freshProfile);
          try {
            localStorage.setItem("gm_user", JSON.stringify(freshProfile));
          } catch {}
          loadAuthenticatedData();
        }
      } catch (err: any) {
        const errString = String(err?.message || err);
        const isNetworkError =
          errString.includes("Failed to fetch") ||
          errString.includes("NetworkError") ||
          errString.includes("network") ||
          errString.includes("Load failed") ||
          (typeof navigator !== "undefined" && !navigator.onLine);

        if (isNetworkError) {
          // Device offline or waking from sleep mode: DO NOT LOG OUT!
          console.info("Device offline or waking from sleep mode; preserving cached session.");
          if (isMounted) {
            setIsAuthenticated(true);
          }
        } else if (
          errString.includes("401") ||
          errString.includes("Unauthorized") ||
          errString.includes("token")
        ) {
          // Attempt silent session refresh before logging out
          try {
            const { data: refreshData, error: refreshErr } = await supabase.auth.refreshSession();
            if (!refreshErr && refreshData?.session?.access_token) {
              setStoredAuthToken(refreshData.session.access_token);
              const retryMe = await usersApi.getMe();
              if (isMounted && retryMe) {
                setIsAuthenticated(true);
                loadAuthenticatedData();
                return;
              }
            }
          } catch {}

          // Truly invalid session after refresh failure
          if (isMounted) {
            setStoredAuthToken(null);
            setIsAuthenticated(false);
            setCurrentUser(EMPTY_GUEST_USER);
            setUpdates([]);
            if (typeof window !== "undefined") {
              localStorage.removeItem("gm_user");
            }
          }
        }
      } finally {
        if (isMounted) {
          setIsAuthLoading(false);
        }
      }
    };

    checkSession();

    // Re-verify silently on device wake or network reconnection (e.g. coming out of sleep mode)
    const handleWakeOrReconnection = () => {
      if (typeof navigator !== "undefined" && navigator.onLine) {
        checkSession();
      }
    };

    window.addEventListener("online", handleWakeOrReconnection);
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        handleWakeOrReconnection();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isMounted = false;
      window.removeEventListener("online", handleWakeOrReconnection);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // ── Logout Handler ─────────────────────────────────────────────
  const logout = async () => {
    setStoredAuthToken(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("gm_user");
      localStorage.removeItem("gm_access_token");
      try {
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i);
          if (key && (key.startsWith("sb-") || key.startsWith("gm_"))) {
            localStorage.removeItem(key);
          }
        }
      } catch {}
    }
    setIsAuthenticated(false);
    setCurrentUser(EMPTY_GUEST_USER);
    setUpdates([]);
    setNotifications([]);
    setConversations([]);
    setConnections({});
    addToast("Logged out successfully", "info");
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  };

  const addToast = (message: string, type: Toast["type"] = "info") => {
    const id = generateId();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // ── User Handlers ───────────────────────────────────────────
  const updateUser = (updated: Partial<FounderProfile>) => {
    setCurrentUser((prev) => {
      const next = { ...prev, ...updated };
      try {
        localStorage.setItem("gm_user", JSON.stringify(next));
      } catch {}
      return next;
    });
    if (updated.id && updated.id !== 'guest') {
      setIsAuthenticated(true);
      setIsAuthLoading(false);
    }
    addToast("Profile preferences updated", "success");
  };

  const resetDemoUser = () => {
    setCurrentUser(DEMO_USER);
    setUpdates(initialUpdates);
    try {
      localStorage.removeItem("gm_user");
      localStorage.setItem("gm_updates", JSON.stringify(initialUpdates));
      localStorage.removeItem("gm_connections");
      localStorage.setItem("gm_data_version", DATA_VERSION);
    } catch {}
    addToast("Reset to default demo data", "info");
  };

  // ── Updates Handlers ────────────────────────────────────────
  const addUpdate = (
    newUpdateData: Omit<JourneyUpdate, "id" | "authorId" | "createdAt" | "likes" | "saves" | "comments">
  ): JourneyUpdate => {
    const tempId = "u-" + generateId();
    const newPost: JourneyUpdate = {
      ...newUpdateData,
      id: tempId,
      authorId: currentUser.id,
      createdAt: new Date().toISOString(),
      likes: [],
      saves: [],
      comments: [],
      fuels_count: 0,
      saves_count: 0,
      comments_count: 0,
      is_fueled_by_me: false,
      is_saved_by_me: false,
    };
    setUpdates((prev) => [newPost, ...prev]);
    addToast("Journey update posted to your feed", "success");

    feedApi
      .createPost({
        headline: newUpdateData.headline,
        journey_tag: newUpdateData.journeyTag,
        content: newUpdateData.content,
        category: newUpdateData.category || 'All',
        start_date: (newUpdateData as any).startDate || (newUpdateData as any).start_date,
        end_date: (newUpdateData as any).endDate || (newUpdateData as any).end_date,
        prompt_question_1: (newUpdateData as any).prompt_question_1,
        prompt_question_2: (newUpdateData as any).prompt_question_2,
        media: newUpdateData.media?.map((m) => ({
          url: m.url,
          media_type: m.type === 'video' ? 'video' : 'image',
          orientation: m.orientation || 'landscape',
          thumbnail_url: m.thumbnail,
        })),
      })
      .then((created) => {
        const mapped = mapFeedPostToJourneyUpdate(created);
        setUpdates((prev) => prev.map((p) => (p.id === tempId ? mapped : p)));
      })
      .catch((err) => {
        console.warn('Backend createPost offline, kept local state:', err);
      });

    return newPost;
  };

  const deleteUpdate = (id: string) => {
    setUpdates((prev) => prev.filter((u) => u.id !== id));
    addToast("Update deleted", "info");
  };

  const toggleLike = async (updateId: string) => {
    setUpdates((prev) =>
      prev.map((u) => {
        if (u.id !== updateId) return u;
        const currentLikes = u.likes || [];
        const hasLiked = u.is_fueled_by_me || currentLikes.includes(currentUser.id);
        const nextLiked = !hasLiked;
        return {
          ...u,
          is_fueled_by_me: nextLiked,
          fuels_count: nextLiked ? (u.fuels_count || 0) + 1 : Math.max(0, (u.fuels_count || 1) - 1),
          likes: nextLiked
            ? [...currentLikes, currentUser.id]
            : currentLikes.filter((id) => id !== currentUser.id),
        };
      })
    );

    try {
      const res = await postsApi.toggleFuel(updateId);
      setUpdates((prev) =>
        prev.map((u) =>
          u.id === updateId
            ? {
                ...u,
                is_fueled_by_me: res.is_fueled,
                fuels_count: res.fuels_count,
              }
            : u
        )
      );
    } catch {
      // Offline fallback
    }
  };

  const toggleSave = async (updateId: string) => {
    setUpdates((prev) =>
      prev.map((u) => {
        if (u.id !== updateId) return u;
        const currentSaves = u.saves || [];
        const hasSaved = u.is_saved_by_me || currentSaves.includes(currentUser.id);
        const nextSaved = !hasSaved;
        return {
          ...u,
          is_saved_by_me: nextSaved,
          saves_count: nextSaved ? (u.saves_count || 0) + 1 : Math.max(0, (u.saves_count || 1) - 1),
          saves: nextSaved
            ? [...currentSaves, currentUser.id]
            : currentSaves.filter((id) => id !== currentUser.id),
        };
      })
    );
    addToast("Post saved to your bookmarks", "info");

    try {
      const res = await postsApi.toggleSave(updateId);
      setUpdates((prev) =>
        prev.map((u) =>
          u.id === updateId
            ? {
                ...u,
                is_saved_by_me: res.is_saved,
                saves_count: res.saves_count,
              }
            : u
        )
      );
    } catch {
      // Offline fallback
    }
  };

  const addComment = async (updateId: string, content: string) => {
    const newComment: Comment = {
      id: "c-" + generateId(),
      authorId: currentUser.id,
      content,
      createdAt: new Date().toISOString(),
      likes: [],
    };
    setUpdates((prev) => {
      const next = prev.map((u) => {
        if (u.id !== updateId) return u;
        return {
          ...u,
          comments: [...(u.comments || []), newComment],
        };
      });
      return next;
    });

    // Also persist directly to FastAPI / PostgreSQL backend and trigger notification
    if (updateId && !updateId.startsWith('u-')) {
      try {
        await postsApi.addDiscussion(updateId, {
          content,
          tag: 'Feedback',
        });
      } catch (err) {
        console.warn("Backend addDiscussion failed:", err);
      }
    }

    addToast("Comment posted", "success");
  };

  // ── Connection Handlers ─────────────────────────────────────
  const sendConnectionRequest = async (founderId: string) => {
    setConnections((prev) => ({ ...prev, [founderId]: "pending-sent" as ConnectionStatus }));
    addToast("Connection request sent", "success");
    try {
      await socialApi.sendConnectionRequest(founderId);
    } catch {
      // Offline fallback
    }
  };

  const acceptConnectionRequest = async (founderId: string) => {
    setConnections((prev) => ({ ...prev, [founderId]: "connected" as ConnectionStatus }));
    addToast("Connection accepted! You can now message each other.", "success");
    try {
      await socialApi.acceptConnection(founderId);
    } catch {
      // Offline fallback
    }
  };

  const removeConnection = async (founderId: string) => {
    setConnections((prev) => ({ ...prev, [founderId]: "none" as ConnectionStatus }));
    addToast("Connection removed", "info");
    try {
      await socialApi.removeConnection(founderId);
    } catch {
      // Offline fallback
    }
  };

  // ── Messaging Handlers ──────────────────────────────────────
  const sendMessage = async (conversationId: string, content: string) => {
    const tempMsgId = "m-" + generateId();
    const newMsg: Message = {
      id: tempMsgId,
      conversationId,
      senderId: currentUser.id,
      content,
      createdAt: new Date().toISOString(),
      read: true,
    };
    setMessages((prev) => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), newMsg],
    }));
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? { ...c, lastMessage: newMsg, updatedAt: newMsg.createdAt }
          : c
      )
    );

    try {
      const serverMsg = await chatApi.sendMessage(conversationId, content);
      setMessages((prev) => ({
        ...prev,
        [conversationId]: (prev[conversationId] || []).map((m) =>
          m.id === tempMsgId
            ? {
                id: serverMsg.id,
                conversationId: serverMsg.conversation_id,
                senderId: serverMsg.sender_id,
                content: serverMsg.content,
                createdAt: serverMsg.sent_at || serverMsg.created_at,
                read: serverMsg.status === 'read',
              }
            : m
        ),
      }));
    } catch {
      // Offline fallback
    }
  };

  const createConversation = (recipientId: string, initialMessageText: string): string => {
    // 1. Check if conversation already exists in active state
    const existing = conversations.find((c) =>
      c.participantIds.includes(recipientId) ||
      (c.otherParticipant && (c.otherParticipant.id === recipientId || c.otherParticipant.username === recipientId))
    );
    if (existing) {
      if (initialMessageText && initialMessageText.trim()) {
        sendMessage(existing.id, initialMessageText);
      }
      return existing.id;
    }

    const tempConvId = "conv-" + generateId();
    const newMsg: Message = {
      id: "m-" + generateId(),
      conversationId: tempConvId,
      senderId: currentUser.id,
      content: initialMessageText || "Started conversation",
      createdAt: new Date().toISOString(),
      read: true,
    };

    setConversations((prev) => [
      {
        id: tempConvId,
        participantIds: [currentUser.id, recipientId],
        updatedAt: newMsg.createdAt,
        unreadCount: 0,
        lastMessage: newMsg,
      },
      ...prev,
    ]);
    setMessages((prev) => ({
      ...prev,
      [tempConvId]: [newMsg],
    }));

    // 2. Call backend to start or retrieve authoritative conversation
    chatApi
      .startConversation(recipientId)
      .then((serverConv) => {
        if (serverConv && serverConv.id) {
          const mapped: Conversation = {
            id: serverConv.id,
            participantIds: [
              currentUser.id,
              serverConv.other_participant ? serverConv.other_participant.id : recipientId,
            ],
            updatedAt: serverConv.last_message_at || (serverConv as any).created_at || new Date().toISOString(),
            unreadCount: 0,
            otherParticipant: serverConv.other_participant,
            lastMessage: serverConv.last_message_text
              ? {
                  id: `m-${serverConv.id}`,
                  conversationId: serverConv.id,
                  senderId: serverConv.last_message_sender_id || currentUser.id,
                  content: serverConv.last_message_text,
                  createdAt: serverConv.last_message_at || new Date().toISOString(),
                  read: serverConv.last_message_status === "read",
                }
              : undefined,
          };
          setConversations((prev) => [
            mapped,
            ...prev.filter((c) => c.id !== tempConvId && c.id !== serverConv.id),
          ]);

          if (initialMessageText && initialMessageText.trim()) {
            sendMessage(serverConv.id, initialMessageText);
          }
        }
      })
      .catch((err) => {
        console.warn("Could not start server conversation:", err);
      });

    return tempConvId;
  };

  const refreshConversations = async () => {
    try {
      const convs = await chatApi.getConversations();
      if (Array.isArray(convs) && convs.length > 0) {
        const seenPartnerIds = new Set<string>();
        const uniqueConvs = convs.filter((c) => {
          const partnerId = c.other_participant?.id;
          if (!partnerId) return true;
          if (seenPartnerIds.has(partnerId)) return false;
          seenPartnerIds.add(partnerId);
          return true;
        });

        const mapped = uniqueConvs.map((c) => ({
          id: c.id,
          participantIds: [
            currentUser.id,
            c.other_participant ? c.other_participant.id : '',
          ].filter(Boolean),
          updatedAt: c.last_message_at || (c as any).created_at || new Date().toISOString(),
          unreadCount: c.unread_count,
          otherParticipant: c.other_participant,
          lastMessage: c.last_message_text
            ? {
                id: `m-${c.id}`,
                conversationId: c.id,
                senderId: c.last_message_sender_id || '',
                content: c.last_message_text,
                createdAt: c.last_message_at || new Date().toISOString(),
                read: c.last_message_status === 'read',
              }
            : undefined,
        }));
        setConversations(mapped);
      } else {
        setConversations([]);
      }
    } catch {
      setConversations([]);
    }
  };

  // ── Notification Handlers ───────────────────────────────────
  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    addToast("All notifications marked as read", "info");

    try {
      await notificationsApi.markAllRead();
    } catch {
      // Offline fallback
    }
  };

  const unreadNotificationCount = notifications.filter((n) => !n.read).length;

  // ── Milestone Handlers ──────────────────────────────────────
  const addMilestone = (mData: Omit<Milestone, "id" | "founderId">) => {
    const newM: Milestone = {
      ...mData,
      id: "m-" + generateId(),
      founderId: currentUser.id,
    };
    setMilestones((prev) => [...prev, newM]);
    addToast("New milestone added to your Passport!", "success");
  };

  const editMilestone = (id: string, updated: Partial<Milestone>) => {
    setMilestones((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updated, editedAt: new Date().toISOString() } : m))
    );
    addToast("Milestone updated", "info");
  };

  const deleteMilestone = (id: string) => {
    setMilestones((prev) => prev.filter((m) => m.id !== id));
    addToast("Milestone removed", "info");
  };

  const refreshFeed = async () => {
    setIsLoadingFeed(true);
    try {
      const res = await feedApi.getFeed();
      if (res?.items && Array.isArray(res.items)) {
        setUpdates(res.items.map(mapFeedPostToJourneyUpdate));
      }
    } catch {
      // Ignore
    } finally {
      setIsLoadingFeed(false);
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        isAuthLoading,
        isLoadingFeed,
        refreshFeed,
        logout,
        updateUser,
        resetDemoUser,
        updates,
        addUpdate,
        deleteUpdate,
        toggleLike,
        toggleSave,
        addComment,
        connections,
        sendConnectionRequest,
        acceptConnectionRequest,
        removeConnection,
        conversations,
        messages,
        sendMessage,
        createConversation,
        refreshConversations,
        notifications,
        unreadNotificationCount,
        markNotificationRead,
        markAllNotificationsRead,
        milestones,
        addMilestone,
        editMilestone,
        deleteMilestone,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
