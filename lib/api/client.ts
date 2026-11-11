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
  AuthLoginRequest,
  AuthRegisterRequest,
  AuthResponse,
  OAuthUrlResponse,
  FeatureSuggestionCreate,
  FeatureSuggestionResponse,
  FeatureVoteResponse,
  ContentReportCreate,
  ContentReportResponse,
  PassportCreateRequest,
  PassportResponse,
  JourneyGoal,
  GoalCreateRequest,
  GoalUpdateRequest,
  SearchPersonResult,
  SearchJourneyResult,
  UnifiedSearchResponse,
  SearchSuggestionsResponse,
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

async function attemptSilentTokenRefresh(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  try {
    const { supabase } = await import('@/lib/supabaseClient');
    const { data: refreshData, error: refreshErr } = await supabase.auth.refreshSession();
    if (!refreshErr && refreshData?.session?.access_token) {
      setStoredAuthToken(refreshData.session.access_token);
      return refreshData.session.access_token;
    }
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData?.session?.access_token) {
      setStoredAuthToken(sessionData.session.access_token);
      return sessionData.session.access_token;
    }
  } catch {
    // Offline or refresh error
  }
  return null;
}

/**
 * Universal typed fetch wrapper for all backend requests.
 */
async function apiFetch<T>(endpoint: string, options: RequestInit = {}, isRetry: boolean = false): Promise<T> {
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
    // If unauthorized (401) and not already retried, attempt silent background token refresh
    if (response.status === 401 && !isRetry && !endpoint.includes('/api/auth/login')) {
      const refreshedToken = await attemptSilentTokenRefresh();
      if (refreshedToken && refreshedToken !== token) {
        return apiFetch<T>(endpoint, options, true);
      }
    }

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

// ── 0. BACKEND AUTHENTICATION API ───────────────────────────────────
export const authApi = {
  login: async (data: AuthLoginRequest): Promise<AuthResponse> => {
    return apiFetch<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  register: async (data: AuthRegisterRequest): Promise<AuthResponse> => {
    return apiFetch<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getGoogleOAuthUrl: async (redirectUri?: string): Promise<OAuthUrlResponse> => {
    const uri = redirectUri || (typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : '');
    return apiFetch<OAuthUrlResponse>(`/api/auth/oauth/google?redirect_uri=${encodeURIComponent(uri)}`);
  },

  getLinkedInOAuthUrl: async (redirectUri?: string): Promise<OAuthUrlResponse> => {
    const uri = redirectUri || (typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : '');
    return apiFetch<OAuthUrlResponse>(`/api/auth/oauth/linkedin?redirect_uri=${encodeURIComponent(uri)}`);
  },

  handleOAuthCallback: async (code: string, provider: string, redirectUri?: string): Promise<AuthResponse> => {
    return apiFetch<AuthResponse>('/api/auth/oauth/callback', {
      method: 'POST',
      body: JSON.stringify({ code, provider, redirect_uri: redirectUri }),
    });
  },
};

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

  getExploreFeed: async (cursor?: string, limit = 30, category?: string, q?: string, offset?: number, seen_ids?: string): Promise<PaginatedResponse<FeedPost>> => {
    const params = new URLSearchParams();
    if (cursor) params.append('cursor', cursor);
    if (limit) params.append('limit', limit.toString());
    if (offset !== undefined) params.append('offset', offset.toString());
    if (category && category !== 'All' && category !== 'all' && category !== 'for-you') {
      params.append('category', category);
    }
    if (q && q.trim()) params.append('q', q.trim());
    if (seen_ids && seen_ids.trim()) params.append('seen_ids', seen_ids.trim());
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiFetch<PaginatedResponse<FeedPost>>(`/api/feed/explore${query}`);
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

  updatePost: async (
    postId: string,
    data: {
      headline?: string;
      content?: string;
      journey_tag?: string;
      category?: string;
      start_date?: string;
      end_date?: string;
    }
  ): Promise<FeedPost> => {
    return apiFetch<FeedPost>(`/api/posts/${postId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deletePost: async (postId: string): Promise<{ success: boolean; message: string }> => {
    return apiFetch<{ success: boolean; message: string }>(`/api/posts/${postId}`, {
      method: 'DELETE',
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

// ── 4A. JOURNEY PASSPORTS API ────────────────────────────────────────
export const passportsApi = {
  createPassport: async (data: PassportCreateRequest): Promise<PassportResponse> => {
    return apiFetch<PassportResponse>('/api/passports', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getMyPassports: async (): Promise<PassportResponse[]> => {
    return apiFetch<PassportResponse[]>('/api/passports/me');
  },

  getUserPassports: async (userIdOrUsername: string): Promise<PassportResponse[]> => {
    return apiFetch<PassportResponse[]>(`/api/passports/user/${encodeURIComponent(userIdOrUsername)}`);
  },

  getPassport: async (passportId: string): Promise<PassportResponse> => {
    return apiFetch<PassportResponse>(`/api/passports/${encodeURIComponent(passportId)}`);
  },

  getGoals: async (journey?: string, userId?: string): Promise<JourneyGoal[]> => {
    const params = new URLSearchParams();
    if (journey) params.set('journey', journey);
    if (userId) params.set('user_id', userId);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiFetch<JourneyGoal[]>(`/api/passports/goals/list${query}`);
  },

  createGoal: async (data: GoalCreateRequest): Promise<JourneyGoal> => {
    return apiFetch<JourneyGoal>('/api/passports/goals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateGoal: async (goalId: string, data: GoalUpdateRequest): Promise<JourneyGoal> => {
    return apiFetch<JourneyGoal>(`/api/passports/goals/${encodeURIComponent(goalId)}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  deleteGoal: async (goalId: string): Promise<{ status: string; id: string }> => {
    return apiFetch<{ status: string; id: string }>(`/api/passports/goals/${encodeURIComponent(goalId)}`, {
      method: 'DELETE',
    });
  },

  updateAbout: async (journeyTitle: string, about?: string, isPublic?: boolean): Promise<any> => {
    const params = new URLSearchParams({ journey_title: journeyTitle });
    if (about !== undefined) params.set('about', about);
    if (isPublic !== undefined) params.set('is_public', String(isPublic));
    return apiFetch(`/api/passports/about/update?${params.toString()}`, {
      method: 'PATCH',
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

  startConversation: async (recipientId: string): Promise<ConversationSummary> => {
    return apiFetch<ConversationSummary>('/api/chat/conversations', {
      method: 'POST',
      body: JSON.stringify({ recipient_id: recipientId }),
    });
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

  editMessage: async (messageId: string, content: string): Promise<ChatMessage> => {
    return apiFetch<ChatMessage>(`/api/chat/messages/${messageId}`, {
      method: 'PATCH',
      body: JSON.stringify({ content }),
    });
  },

  deleteMessage: async (messageId: string): Promise<ChatMessage> => {
    return apiFetch<ChatMessage>(`/api/chat/messages/${messageId}`, {
      method: 'DELETE',
    });
  },

  deleteConversation: async (conversationId: string): Promise<{ success: boolean; message: string }> => {
    return apiFetch<{ success: boolean; message: string }>(`/api/chat/conversations/${conversationId}`, {
      method: 'DELETE',
    });
  },
};

// ── 7. NOTIFICATIONS API ────────────────────────────────────────────
export const notificationsApi = {
  getNotifications: async (limit = 30): Promise<{ unread_count: number; notifications: NotificationItem[]; items: NotificationItem[] }> => {
    const res = await apiFetch<any>(`/api/notifications?limit=${limit}`);
    const list: NotificationItem[] = res?.items || res?.notifications || [];
    return {
      unread_count: typeof res?.unread_count === 'number' ? res.unread_count : list.filter(n => !n.is_read).length,
      notifications: list,
      items: list,
    };
  },

  markAllRead: async (): Promise<{ success: boolean; message: string }> => {
    return apiFetch<{ success: boolean; message: string }>('/api/notifications/read-all', {
      method: 'POST',
    });
  },
};

// ── 8. FEEDBACK & FEATURE SUGGESTIONS API ───────────────────────────
export const feedbackApi = {
  getFeatures: async (
    category?: string,
    sortBy: 'popular' | 'newest' = 'popular',
    limit = 20,
    offset = 0
  ): Promise<FeatureSuggestionResponse[]> => {
    const params = new URLSearchParams();
    if (category && category !== 'All' && category !== 'all') params.append('category', category);
    params.append('sort_by', sortBy);
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());
    return apiFetch<FeatureSuggestionResponse[]>(`/api/feedback/features?${params.toString()}`);
  },

  submitFeature: async (data: FeatureSuggestionCreate): Promise<FeatureSuggestionResponse> => {
    return apiFetch<FeatureSuggestionResponse>('/api/feedback/features', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  voteFeature: async (suggestionId: string): Promise<FeatureVoteResponse> => {
    return apiFetch<FeatureVoteResponse>(`/api/feedback/features/${suggestionId}/vote`, {
      method: 'POST',
    });
  },
};

// ── 9. MODERATION & REPORTING API ───────────────────────────────────
export const moderationApi = {
  submitReport: async (data: ContentReportCreate): Promise<ContentReportResponse> => {
    return apiFetch<ContentReportResponse>('/api/moderation/reports', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// ── 10. UNIFIED SEARCH & DISCOVERY API ──────────────────────────────
export const searchApi = {
  search: async (params: {
    q: string;
    type?: 'all' | 'people' | 'journeys' | 'posts';
    category?: string;
    sort?: 'relevant' | 'latest';
    limit?: number;
    offset?: number;
  }): Promise<UnifiedSearchResponse> => {
    const sp = new URLSearchParams();
    sp.append('q', params.q);
    if (params.type) sp.append('type', params.type);
    if (params.category && params.category !== 'All' && params.category !== 'all') {
      sp.append('category', params.category);
    }
    if (params.sort) sp.append('sort', params.sort);
    if (params.limit !== undefined) sp.append('limit', params.limit.toString());
    if (params.offset !== undefined) sp.append('offset', params.offset.toString());
    return apiFetch<UnifiedSearchResponse>(`/api/search?${sp.toString()}`);
  },

  getSuggestions: async (): Promise<SearchSuggestionsResponse> => {
    return apiFetch<SearchSuggestionsResponse>('/api/search/suggestions');
  },
};
