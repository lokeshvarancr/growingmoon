'use client';
import React, { createContext, useContext, useState, useEffect } from "react";
import type {
  FounderProfile,
  JourneyUpdate,
  Comment,
  ConnectionStatus,
  Message,
  Notification,
  Milestone,
} from "@/types";
import { DEMO_USER, founders as initialFounders } from "@/lib/mock-data/founders";
import { mockUpdates as initialUpdates } from "@/lib/mock-data/updates";
import { mockConversations as initialConversations, mockMessages as initialMessages } from "@/lib/mock-data/messages";
import { mockNotifications as initialNotifications } from "@/lib/mock-data/notifications";
import { mockMilestones as initialMilestones } from "@/lib/mock-data/passports";
import { generateId } from "@/lib/utils";
import { feedApi, postsApi, usersApi, notificationsApi, chatApi, socialApi } from "@/lib/api/client";
import type { FeedPost } from "@/lib/api/types";
import { supabase } from "@/lib/supabaseClient";

export type Toast = {
  id: string;
  message: string;
  type?: "success" | "info" | "warning" | "danger";
};

type AppContextType = {
  // User
  currentUser: FounderProfile;
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
  conversations: typeof initialConversations;
  messages: typeof initialMessages;
  sendMessage: (conversationId: string, content: string) => void;
  createConversation: (recipientId: string, initialMessageText: string) => string;

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

export function AppProvider({ children }: { children: React.ReactNode }) {
  // User
  const [currentUser, setCurrentUser] = useState<FounderProfile>(DEMO_USER);

  // Updates (Initialized with 100 rich mock updates)
  const [updates, setUpdates] = useState<JourneyUpdate[]>(initialUpdates);

  // Connections (8 active connections matching DEMO_USER.connectionsCount)
  const [connections, setConnections] = useState<Record<string, ConnectionStatus>>({
    f1: "connected",
    f2: "connected",
    f3: "connected",
    f5: "connected",
    f6: "connected",
    f8: "connected",
    f10: "connected",
    f12: "connected",
    f7: "pending-received",
    f4: "none",
    f9: "none",
    f11: "none",
  });

  // Messages
  const [conversations, setConversations] = useState(initialConversations);
  const [messages, setMessages] = useState(initialMessages);

  // Notifications
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

  // Milestones
  const [milestones, setMilestones] = useState<Milestone[]>(initialMilestones);

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  // ── Load from localStorage on mount (With auto-migration for 100 posts) ──
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("gm_user");
      if (savedUser) setCurrentUser(JSON.parse(savedUser));

      const savedConnections = localStorage.getItem("gm_connections");
      if (savedConnections) setConnections(JSON.parse(savedConnections));

      const version = localStorage.getItem("gm_data_version");
      const savedUpdatesRaw = localStorage.getItem("gm_updates");

      if (version === DATA_VERSION && savedUpdatesRaw) {
        const parsed = JSON.parse(savedUpdatesRaw);
        // Only use savedUpdates if it is a valid array containing at least all 100 seed posts
        if (Array.isArray(parsed) && parsed.length >= initialUpdates.length) {
          setUpdates(parsed);
          return;
        }
      }

      // If version mismatch or stale (< 100 updates) from previous sessions:
      // Smoothly migrate: keep any user-created posts and preserve bookmarked saves
      let userCreatedPosts: JourneyUpdate[] = [];
      const savedPostIds = new Set<string>();

      if (savedUpdatesRaw) {
        try {
          const parsed = JSON.parse(savedUpdatesRaw);
          if (Array.isArray(parsed)) {
            // Keep user-authored posts (posts created during testing)
            userCreatedPosts = parsed.filter(
              (p) => p.authorId === DEMO_USER.id && !initialUpdates.some((iu) => iu.id === p.id)
            );
            // Collect any post IDs the user saved
            parsed.forEach((p) => {
              if (Array.isArray(p.saves) && p.saves.includes(DEMO_USER.id)) {
                savedPostIds.add(p.id);
              }
            });
          }
        } catch {}
      }

      // Merge: user posts on top + all 100 seed posts with preserved bookmark state
      const refreshedUpdates = [
        ...userCreatedPosts,
        ...initialUpdates.map((u) => {
          if (savedPostIds.has(u.id)) {
            const currentSaves = u.saves || [];
            return currentSaves.includes(DEMO_USER.id)
              ? u
              : { ...u, saves: [...currentSaves, DEMO_USER.id] };
          }
          return u;
        }),
      ];

      setUpdates(refreshedUpdates);
      localStorage.setItem("gm_data_version", DATA_VERSION);
      localStorage.setItem("gm_updates", JSON.stringify(refreshedUpdates));
    } catch {
      // Ignore localStorage errors (sandbox / disabled)
    }
  }, []);

  // ── Sync with FastAPI Backend & Supabase Auth ──────────────────
  useEffect(() => {
    // 1. Fetch live feed from backend
    feedApi
      .getFeed()
      .then((res) => {
        if (res && Array.isArray(res.items) && res.items.length > 0) {
          const liveUpdates = res.items.map(mapFeedPostToJourneyUpdate);
          setUpdates(liveUpdates);
        }
      })
      .catch((err) => {
        console.warn('Backend feed unreachable, using cached updates:', err);
      });

    // 2. Fetch authenticated user profile
    usersApi
      .getMe()
      .then((me) => {
        if (me) {
          setCurrentUser({
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
          });
        }
      })
      .catch(() => {
        // Unauthenticated or guest mode
      });

    // 3. Fetch notifications
    notificationsApi
      .getNotifications()
      .then((data) => {
        if (data && Array.isArray(data.notifications) && data.notifications.length > 0) {
          const mappedNotifications: Notification[] = data.notifications.map((n) => ({
            id: n.id,
            actorId: n.actor_id || 'u-system',
            type: (n.type as any) || 'like',
            message: n.message,
            read: n.is_read,
            createdAt: n.created_at,
            link: n.link || '/feed',
          }));
          setNotifications(mappedNotifications);
        }
      })
      .catch(() => {});

    // 4. Fetch conversations
    chatApi
      .getConversations()
      .then((convs) => {
        if (Array.isArray(convs) && convs.length > 0) {
          const mapped = convs.map((c) => ({
            id: c.id,
            participantIds: [
              currentUser.id,
              c.other_participant ? c.other_participant.id : '',
            ].filter(Boolean),
            updatedAt: c.last_message_at || new Date().toISOString(),
            unreadCount: c.unread_count,
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
        }
      })
      .catch(() => {});

    // 5. Fetch live social connections
    socialApi
      .getConnections()
      .then((data) => {
        if (data && Array.isArray(data.connections)) {
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
          setConnections((prev) => ({ ...prev, ...map }));
        }
      })
      .catch(() => {});

    // 6. Auth state listener for seamless reload on login
    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        feedApi.getFeed().then((res) => {
          if (res?.items?.length) setUpdates(res.items.map(mapFeedPostToJourneyUpdate));
        }).catch(() => {});
        socialApi.getConnections().then((data) => {
          if (data && Array.isArray(data.connections)) {
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
            setConnections((prev) => ({ ...prev, ...map }));
          }
        }).catch(() => {});
        usersApi.getMe().then((me) => {
          if (me) {
            setCurrentUser((prev) => ({
              ...prev,
              id: me.id,
              name: me.name,
              username: me.username,
              avatar: me.avatar_initials || 'GM',
              avatarImage: me.avatar_image || undefined,
              connectionsCount: me.connections_count,
            }));
          }
        }).catch(() => {});
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

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

  const addComment = (updateId: string, content: string) => {
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
    const existing = conversations.find((c) =>
      c.participantIds.includes(recipientId) && c.participantIds.includes(currentUser.id)
    );
    if (existing) {
      sendMessage(existing.id, initialMessageText);
      return existing.id;
    }

    const newConvId = "conv-" + generateId();
    const newMsg: Message = {
      id: "m-" + generateId(),
      conversationId: newConvId,
      senderId: currentUser.id,
      content: initialMessageText,
      createdAt: new Date().toISOString(),
      read: true,
    };

    setConversations((prev) => [
      {
        id: newConvId,
        participantIds: [currentUser.id, recipientId],
        updatedAt: newMsg.createdAt,
        unreadCount: 0,
        lastMessage: newMsg,
      },
      ...prev,
    ]);
    setMessages((prev) => ({
      ...prev,
      [newConvId]: [newMsg],
    }));

    // Trigger API creation
    chatApi.sendMessage(newConvId, initialMessageText).catch(() => {});

    return newConvId;
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

  return (
    <AppContext.Provider
      value={{
        currentUser,
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
