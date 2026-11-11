/**
 * ==============================================================================
 * GROWING MOON - BACKEND API CONTRACT & DOMAIN TYPES
 * ==============================================================================
 * Mirrors schemas from FastAPI backend:
 * - Users & Extended Profiles
 * - Feed Posts & Media Carousels
 * - Community Thread, Asks, Answers & Recursive Replies
 * - WhatsApp Real-Time Chat (Conversations, Messages, Statuses)
 * - User Activity Audit Log (Review & Delete comments)
 * - Notifications
 * ==============================================================================
 */

export type UserPublic = {
  id: string;
  username: string;
  name: string;
  avatar_image?: string | null;
  avatar_initials: string;
  avatar_color?: string | null;
  bio?: string | null;
  role_title?: string | null;
  location?: string | null;
};

export type UserPublicProfile = UserPublic & {
  followers_count: number;
  following_count: number;
  connections_count: number;
  posts_count: number;
  created_at: string;
  profile_details?: UserProfileDetails | null;
  is_following: boolean;
  connection_status: 'none' | 'pending-sent' | 'pending-received' | 'connected';
};

export type UserUpdateRequest = {
  name?: string;
  bio?: string;
  location?: string;
  role_title?: string;
  avatar_image?: string;
};

export type FollowResponse = {
  following: boolean;
  followers_count: number;
};

export type ConnectionRequestResponse = {
  status: 'pending-sent' | 'connected';
  connection_id?: string;
};

export type ConnectionActionResponse = {
  status: 'connected' | 'declined' | 'none';
};

export type ConnectionItem = {
  id: string;
  user: UserPublic;
  status: 'pending' | 'accepted' | 'declined';
  is_requester: boolean;
  created_at: string;
  connected_at?: string | null;
};

export type PassportCreateRequest = {
  title: string;
  short_text?: string;
  current_goal?: string;
  category?: string;
  is_public?: boolean;
  start_date?: string;
};

export type PassportResponse = {
  id: string;
  user_id: string;
  title: string;
  short_text?: string | null;
  current_goal?: string | null;
  category?: string;
  is_public: boolean;
  start_date: string;
  end_date?: string | null;
  to_date?: string | null;
  created_at: string;
  updated_at: string;
  updates_count?: number;
  latest_update?: {
    id: string;
    headline?: string | null;
    content: string;
    journey_tag?: string | null;
    category?: string;
    start_date?: string | null;
    end_date?: string | null;
    created_at: string;
  } | null;
};

export type JourneyGoal = {
  id: string;
  user_id: string;
  passport_id?: string | null;
  journey_title?: string | null;
  title: string;
  target_date?: string | null;
  is_completed: boolean;
  completed_at?: string | null;
  order_index?: number;
  created_at: string;
  updated_at: string;
};

export type GoalCreateRequest = {
  journey_title?: string;
  passport_id?: string;
  title: string;
  target_date?: string;
  is_completed?: boolean;
};

export type GoalUpdateRequest = {
  title?: string;
  target_date?: string;
  is_completed?: boolean;
};

export type UserProfileDetails = {
  user_id: string;
  about?: string | null;
  can_help_with?: string | null;
  figuring_out?: string | null;
  open_to?: string | null;
  current_focus_1?: string | null;
  current_focus_2?: string | null;
  current_focus_3?: string | null;
  current_focus?: string[] | null;
  interests: string[];
  updated_at: string;
};

export type UserProfileDetailsUpdate = {
  about?: string | null;
  can_help_with?: string | null;
  figuring_out?: string | null;
  open_to?: string | null;
  current_focus?: string[] | null;
  current_focus_1?: string | null;
  current_focus_2?: string | null;
  current_focus_3?: string | null;
  interests?: string[] | null;
};

export type UserMe = {
  id: string;
  username: string;
  email: string;
  auth_provider: string;
  name: string;
  birthday?: string | null;
  gender?: string | null;
  avatar_image?: string | null;
  avatar_initials: string;
  avatar_color?: string | null;
  bio?: string | null;
  role_title?: string | null;
  location?: string | null;
  followers_count: number;
  following_count: number;
  connections_count: number;
  posts_count: number;
  saved_count: number;
  activities_count: number;
  unread_notifications_count: number;
  created_at: string;
  updated_at: string;
  profile_details?: UserProfileDetails | null;
};

export type PostMedia = {
  id: string;
  post_id: string;
  media_type: 'image' | 'video';
  orientation: 'landscape' | 'portrait' | 'square';
  url: string;
  thumbnail_url?: string | null;
  display_order: number;
  created_at: string;
};

export type FeedPost = {
  id: string;
  author_id: string;
  author: UserPublic;
  passport_id?: string | null;
  headline?: string | null;
  journey_tag?: string | null;
  content: string;
  category: string;
  start_date?: string | null;
  end_date?: string | null;
  prompt_question_1?: string | null;
  prompt_question_2?: string | null;
  is_posted: boolean;
  is_draft: boolean;
  fuels_count: number;
  saves_count: number;
  comments_count: number;
  ask_1_answers_count: number;
  ask_2_answers_count: number;
  media_count: number;
  media: PostMedia[];
  is_fueled_by_me: boolean;
  is_saved_by_me: boolean;
  created_at: string;
  updated_at: string;
};

export type PostCreateRequest = {
  headline?: string;
  journey_tag?: string;
  content: string;
  category?: string;
  start_date?: string;
  end_date?: string;
  prompt_question_1?: string;
  prompt_question_2?: string;
  passport_id?: string;
  is_posted?: boolean;
  is_draft?: boolean;
  media?: Array<{
    url: string;
    media_type?: 'image' | 'video';
    orientation?: 'landscape' | 'portrait' | 'square';
    thumbnail_url?: string;
    display_order?: number;
  }>;
};

export type PostUpdateRequest = {
  headline?: string;
  journey_tag?: string;
  content?: string;
  category?: string;
  start_date?: string;
  end_date?: string;
};

export type Discussion = {
  id: string;
  post_id: string;
  author_id: string;
  author: UserPublic;
  parent_id?: string | null;
  reply_to_user_id?: string | null;
  reply_to_user?: UserPublic | null;
  ask_number?: number | null; // 1 = Ask 1, 2 = Ask 2, null = General conversation
  tag?: 'Feedback' | 'Idea' | 'Reflection' | 'Suggestion' | string | null;
  content: string;
  helpful_count: number;
  replies_count: number;
  is_applied: boolean;
  is_helpful_by_me: boolean;
  created_at: string;
  updated_at: string;
  replies: Discussion[];
};

export type ThreadResponse = {
  post_id: string;
  prompt_question_1?: string | null;
  prompt_question_2?: string | null;
  ask_1_answers: Discussion[];
  ask_2_answers: Discussion[];
  conversation: Discussion[];
};

export type DiscussionCreateRequest = {
  content: string;
  ask_number?: number | null;
  parent_id?: string | null;
  reply_to_user_id?: string | null;
  tag?: string | null;
};

export type HelpfulToggleResponse = {
  discussion_id: string;
  is_helpful: boolean;
  helpful_count: number;
};

export type AppliedToggleResponse = {
  discussion_id: string;
  is_applied: boolean;
  message: string;
};

export type FuelToggleResponse = {
  post_id: string;
  is_fueled: boolean;
  fuels_count: number;
};

export type SaveToggleResponse = {
  post_id: string;
  is_saved: boolean;
  saves_count: number;
};

export type ConversationSummary = {
  id: string;
  is_group: boolean;
  title?: string | null;
  other_participant?: UserPublic | null;
  last_message_text?: string | null;
  last_message_sender_id?: string | null;
  last_message_status?: 'sending' | 'sent' | 'delivered' | 'read' | string | null;
  last_message_at?: string | null;
  unread_count: number;
  is_typing?: boolean;
};

export type ChatMessage = {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender?: UserPublic | null;
  content: string;
  status: 'sending' | 'sent' | 'delivered' | 'read' | string;
  is_deleted?: boolean;
  is_edited?: boolean;
  edited_at?: string | null;
  sent_at: string;
  delivered_at?: string | null;
  read_at?: string | null;
  created_at: string;
};

export type NotificationItem = {
  id: string;
  recipient_id: string;
  actor_id?: string | null;
  actor?: UserPublic | null;
  type: string;
  message: string;
  link: string;
  is_read: boolean;
  created_at: string;
};

export type UserActivity = {
  id: string;
  user_id: string;
  activity_type: string;
  entity_type: string;
  entity_id: string;
  target_post_id?: string | null;
  summary_text: string;
  target_author_name?: string | null;
  snippet?: string | null;
  is_deleted: boolean;
  created_at: string;
};

export type PaginatedResponse<T> = {
  items: T[];
  next_cursor?: string | null;
  has_more: boolean;
  total?: number;
};

// ── BACKEND AUTHENTICATION SCHEMAS ──────────────────────────────────────────
export type AuthLoginRequest = {
  email: string;
  password: string;
};

export type AuthRegisterRequest = {
  name: string;
  email: string;
  password: string;
};

export type AuthResponse = {
  access_token: string;
  token_type: string;
  user: UserPublicProfile;
};

export type OAuthUrlResponse = {
  url: string;
};

// ── FEEDBACK & FEATURE SUGGESTIONS SCHEMAS ──────────────────────────────────
export type FeatureSuggestionCategory = 'Chat' | 'Feed' | 'Profile' | 'UI/UX' | 'Mobile' | 'General';

export type FeatureSuggestionCreate = {
  title: string;
  description: string;
  category?: FeatureSuggestionCategory | string;
};

export type FeatureSuggestionResponse = {
  id: string;
  user_id: string;
  author?: UserPublicProfile | null;
  title: string;
  description: string;
  category: string;
  status: string;
  upvotes_count: number;
  has_voted: boolean;
  admin_notes?: string | null;
  created_at: string;
  updated_at: string;
};

export type FeatureVoteResponse = {
  suggestion_id: string;
  has_voted: boolean;
  upvotes_count: number;
};

// ── MODERATION & ABUSE REPORT SCHEMAS ───────────────────────────────────────
export type ReportTargetType = 'post' | 'journey' | 'discussion' | 'message' | 'user';

export type ContentReportCreate = {
  target_type: ReportTargetType;
  target_id: string;
  reason: string;
  description?: string;
  evidence_url?: string;
};

export type ContentReportResponse = {
  id: string;
  reporter_id: string;
  target_type: string;
  target_id: string;
  reason: string;
  description?: string | null;
  evidence_url?: string | null;
  status: string;
  created_at: string;
};

// ── UNIFIED SEARCH & DISCOVERY SCHEMAS ──────────────────────────────────────
export type SearchPersonResult = {
  id: string;
  username: string;
  name: string;
  avatar_image?: string | null;
  avatar_initials: string;
  avatar_color?: string | null;
  bio?: string | null;
  role_title?: string | null;
  location?: string | null;
  interests: string[];
  can_help_with?: string | null;
  current_focus_1?: string | null;
  followers_count: number;
  is_following: boolean;
  connection_status?: 'none' | 'pending-sent' | 'pending-received' | 'connected';
};

export type SearchJourneyResult = {
  id: string;
  user_id: string;
  title: string;
  short_text?: string | null;
  current_goal?: string | null;
  category: string;
  is_public: boolean;
  start_date?: string | null;
  created_at: string;
  updates_count: number;
  author: {
    id: string;
    username: string;
    name: string;
    avatar_image?: string | null;
    avatar_initials: string;
    avatar_color?: string | null;
    bio?: string | null;
    role_title?: string | null;
    location?: string | null;
  };
};

export type UnifiedSearchResponse = {
  query: string;
  search_type: 'all' | 'people' | 'journeys' | 'posts';
  people: SearchPersonResult[];
  total_people: number;
  journeys: SearchJourneyResult[];
  total_journeys: number;
  posts: FeedPost[];
  total_posts: number;
  total_results: number;
  limit: number;
  offset: number;
};

export type SearchSuggestionsResponse = {
  suggested_searches: string[];
  categories: string[];
  popular_tags: string[];
};
