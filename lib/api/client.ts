/**
 * ==============================================================================
 * GROWING MOON - FASTAPI BACKEND CLIENT
 * ==============================================================================
 * Centralized, typed API client connecting the Next.js frontend to the FastAPI
 * backend running on Supabase PostgreSQL.
 *
 * Features:
 * - Automatic Supabase JWT token extraction and Authorization header injection.
 * - Robust error handling with FastAPI HTTPException detail parsing.
 * - Strict TypeScript typing for all request/response models.
 * ==============================================================================
 */

import type {
  FeedPost,
  PostCreateRequest,
  ThreadResponse,
  Discussion,
  DiscussionCreateRequest,
  HelpfulToggleResponse,
  AppliedToggleResponse,
  FuelToggleResponse,
  SaveToggleResponse,
  UserMe,
  UserPublicProfile,
  UserUpdateRequest,
  UserProfileDetailsUpdate,
  UserProfileDetails,
  FollowResponse,
  ConnectionRequestResponse,
  ConnectionActionResponse,
  ConnectionItem,
  ConversationSummary,
  ChatMessage,
  NotificationItem,
  UserActivity,
  PaginatedResponse,
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Retrieve current Supabase JWT token from localStorage or session.
 */
export function getStoredAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  
  // Try retrieving directly from Supabase client storage key if present
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('sb-') && key.endsWith('-auth-token'))) {
        const item = localStorage.getItem(key);
        if (item) {
          const parsed = JSON.parse(item);
          if (parsed?.access_token) return parsed.access_token;
        }
      }
    }
  } catch (e) {
    // Ignore storage parse errors
  }

  return localStorage.getItem('gm_access_token');
}

export function setStoredAuthToken(token: string | null) {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem('gm_access_token', token);
  } else {
    localStorage.removeItem('gm_access_token');
  }
}

/**
 * Universal typed fetch wrapper for all backend requests.
 */
async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredAuthToken();
  const url = `${API_BASE_URL}${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData?.detail) {
        errorMessage = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail);
      }
    } catch {
      // Fallback to response text
    }
    throw new Error(errorMessage);
  }

  return response.json() as Promise<T>;
}

// ── 1. FEED & POSTS API ──────────────────────────────────────────────
export const feedApi = {
  getFeed: async (cursor?: string, limit = 20, category?: string, q?: string, offset?: number): Promise<PaginatedResponse<FeedPost>> => {
    const params = new URLSearchParams();
    if (cursor) params.append('cursor', cursor);
    if (limit) params.append('limit', limit.toString());
    if (offset !== undefined) params.append('offset', offset.toString());
    if (category && category !== 'All' && category !== 'all' && category !== 'for-you') {
      params.append('category', category);
    }
    if (q && q.trim()) params.append('q', q.trim());
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiFetch<PaginatedResponse<FeedPost>>(`/api/feed${query}`);
  },

  createPost: async (data: PostCreateRequest): Promise<FeedPost> => {
    return apiFetch<FeedPost>('/api/feed', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// ── 2. POST INTERACTIONS & COMMUNITY THREAD API ─────────────────────
export const postsApi = {
  getPost: async (postId: string): Promise<FeedPost> => {
    return apiFetch<FeedPost>(`/api/posts/${postId}`);
  },

  getThread: async (postId: string): Promise<ThreadResponse> => {
    return apiFetch<ThreadResponse>(`/api/posts/${postId}/thread`);
  },

  addDiscussion: async (postId: string, data: DiscussionCreateRequest): Promise<Discussion> => {
    return apiFetch<Discussion>(`/api/posts/${postId}/discussions`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  toggleFuel: async (postId: string): Promise<FuelToggleResponse> => {
    return apiFetch<FuelToggleResponse>(`/api/posts/${postId}/fuel`, {
      method: 'POST',
    });
  },

  toggleSave: async (postId: string): Promise<SaveToggleResponse> => {
    return apiFetch<SaveToggleResponse>(`/api/posts/${postId}/save`, {
      method: 'POST',
    });
  },
};

// ── 3. DISCUSSIONS & ADVICE VOTES API ────────────────────────────────
export const discussionsApi = {
  toggleHelpful: async (discussionId: string): Promise<HelpfulToggleResponse> => {
    return apiFetch<HelpfulToggleResponse>(`/api/discussions/${discussionId}/helpful`, {
      method: 'POST',
    });
  },

  toggleApplied: async (discussionId: string): Promise<AppliedToggleResponse> => {
    return apiFetch<AppliedToggleResponse>(`/api/discussions/${discussionId}/applied`, {
      method: 'POST',
    });
  },
};

// ── 4. USERS & EXTENDED PROFILES API ────────────────────────────────
export const usersApi = {
  getMe: async (): Promise<UserMe> => {
    return apiFetch<UserMe>('/api/users/me');
  },

  updateMe: async (data: UserUpdateRequest): Promise<UserMe> => {
    return apiFetch<UserMe>('/api/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  getByUsername: async (username: string): Promise<UserPublicProfile> => {
    return apiFetch<UserPublicProfile>(`/api/users/${encodeURIComponent(username)}`);
  },

  getUserPosts: async (userIdOrUsername: string, limit = 50, offset = 0): Promise<FeedPost[]> => {
    return apiFetch<FeedPost[]>(`/api/users/${encodeURIComponent(userIdOrUsername)}/posts?limit=${limit}&offset=${offset}`);
  },

  updateProfileDetails: async (data: UserProfileDetailsUpdate): Promise<UserProfileDetails> => {
    return apiFetch<UserProfileDetails>('/api/users/me/profile-details', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// ── 4B. SOCIAL CONNECTIONS & FOLLOWS API ─────────────────────────────
export const socialApi = {
  followUser: async (userId: string): Promise<FollowResponse> => {
    return apiFetch<FollowResponse>(`/api/users/${userId}/follow`, {
      method: 'POST',
    });
  },

  unfollowUser: async (userId: string): Promise<FollowResponse> => {
    return apiFetch<FollowResponse>(`/api/users/${userId}/follow`, {
      method: 'DELETE',
    });
  },

  sendConnectionRequest: async (userId: string): Promise<ConnectionRequestResponse> => {
    return apiFetch<ConnectionRequestResponse>(`/api/connections/request/${userId}`, {
      method: 'POST',
    });
  },

  acceptConnection: async (identifier: string): Promise<ConnectionActionResponse> => {
    return apiFetch<ConnectionActionResponse>(`/api/connections/${encodeURIComponent(identifier)}/accept`, {
      method: 'POST',
    });
  },

  removeConnection: async (identifier: string): Promise<ConnectionActionResponse> => {
    return apiFetch<ConnectionActionResponse>(`/api/connections/${encodeURIComponent(identifier)}`, {
      method: 'DELETE',
    });
  },

  getConnections: async (): Promise<{ connections: ConnectionItem[]; total: number }> => {
    return apiFetch<{ connections: ConnectionItem[]; total: number }>('/api/connections');
  },
};

// ── 5. USER AUDIT ACTIVITIES API ────────────────────────────────────
export const activitiesApi = {
  getMyActivities: async (cursor?: string, limit = 20): Promise<PaginatedResponse<UserActivity>> => {
    const params = new URLSearchParams();
    if (cursor) params.append('cursor', cursor);
    if (limit) params.append('limit', limit.toString());
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiFetch<PaginatedResponse<UserActivity>>(`/api/users/me/activities${query}`);
  },

  deleteActivity: async (activityId: string): Promise<{ success: boolean; message: string }> => {
    return apiFetch<{ success: boolean; message: string }>(`/api/activities/${activityId}`, {
      method: 'DELETE',
    });
  },
};

// ── 6. WHATSAPP REAL-TIME CHAT API ──────────────────────────────────
export const chatApi = {
  getConversations: async (): Promise<ConversationSummary[]> => {
    return apiFetch<ConversationSummary[]>('/api/chat/conversations');
  },

  getMessages: async (conversationId: string, limit = 50): Promise<ChatMessage[]> => {
    return apiFetch<ChatMessage[]>(`/api/chat/conversations/${conversationId}/messages?limit=${limit}`);
  },

  sendMessage: async (conversationId: string, content: string): Promise<ChatMessage> => {
    return apiFetch<ChatMessage>(`/api/chat/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  },

  markRead: async (conversationId: string): Promise<{ conversation_id: string; messages_marked: number }> => {
    return apiFetch<{ conversation_id: string; messages_marked: number }>(`/api/chat/conversations/${conversationId}/read`, {
      method: 'POST',
    });
  },

  setTyping: async (conversationId: string, isTyping: boolean): Promise<{ success: boolean }> => {
    return apiFetch<{ success: boolean }>(`/api/chat/conversations/${conversationId}/typing`, {
      method: 'POST',
      body: JSON.stringify({ is_typing: isTyping }),
    });
  },
};

// ── 7. NOTIFICATIONS API ────────────────────────────────────────────
export const notificationsApi = {
  getNotifications: async (limit = 30): Promise<{ unread_count: number; notifications: NotificationItem[] }> => {
    return apiFetch<{ unread_count: number; notifications: NotificationItem[] }>(`/api/notifications?limit=${limit}`);
  },

  markAllRead: async (): Promise<{ success: boolean; message: string }> => {
    return apiFetch<{ success: boolean; message: string }>('/api/notifications/read-all', {
      method: 'POST',
    });
  },
};
