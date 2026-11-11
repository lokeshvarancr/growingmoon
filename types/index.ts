/* ── Growing Moon — Core Domain Types ────────────────────────── */

// ── Founder & Profile ─────────────────────────────────────────
export type EntrepreneurialStage =
  | "Exploring"
  | "Idea Stage"
  | "Building MVP"
  | "Launched"
  | "First Customers"
  | "Growing"
  | "Scaling";

export type FounderProfile = {
  id: string;
  username: string;
  name: string;
  avatar: string;         // initials-based placeholder
  avatarImage?: string;   // optional photo avatar
  avatarColor: string;    // tailwind bg color class
  bio: string;
  role?: string;
  stage: EntrepreneurialStage;
  currentGoal: string;
  biggestChallenge: string;
  skillsOffered: string[];
  skillsNeeded: string[];
  interests: string[];
  location: string;
  joinedDate: string;     // ISO date string
  connectionsCount: number;
  isDemo?: boolean;       // true for the current demo user
};

// ── Journey Passport ──────────────────────────────────────────
export type MilestoneStatus = "completed" | "in-progress" | "upcoming";
export type EvidenceType = "link" | "image" | "document";

export type MilestoneEvidence = {
  type: EvidenceType;
  url: string;
  label: string;
};

export type Milestone = {
  id: string;
  founderId: string;
  title: string;
  description: string;
  date: string;           // ISO date string
  status: MilestoneStatus;
  evidence?: MilestoneEvidence[];
  isSelfReported: boolean;
  editedAt?: string;
};

export type JourneyPassport = {
  founderId: string;
  startDate: string;
  currentGoal: string;
  milestones: Milestone[];
};

// ── Journey Updates (Posts) ───────────────────────────────────
export type MediaAttachment = {
  id: string;
  type: "image" | "video" | "file";
  url: string;            // object URL or mock path
  fileName?: string;
  fileSize?: string;
  thumbnail?: string;
  alt?: string;
  orientation?: "portrait" | "landscape" | "square";
  duration?: string;
};

export type JourneyUpdate = {
  id: string;
  authorId: string;
  author?: {
    id: string;
    username: string;
    name: string;
    avatar?: string;
    avatarImage?: string;
    avatarColor?: string;
    role?: string;
    role_title?: string;
    location?: string;
  };
  headline?: string;      // bold focal headline
  journeyTag?: string;    // e.g. "Startup journey", "FitTech journey"
  journey_tag?: string;
  oneLineSummary?: string;// crisp summary line
  content: string;
  media: MediaAttachment[];
  milestoneId?: string;   // optional linked milestone
  category?: string;
  startDate?: string;
  endDate?: string;
  start_date?: string;
  end_date?: string;
  createdAt: string;
  created_at?: string;
  updatedAt?: string;
  likes: string[];        // founder IDs who liked
  saves: string[];        // founder IDs who saved
  comments: Comment[];
  isDraft?: boolean;
  prompt_question_1?: string | null;
  prompt_question_2?: string | null;
  fuels_count?: number;
  saves_count?: number;
  comments_count?: number;
  is_fueled_by_me?: boolean;
  is_saved_by_me?: boolean;
};

export type Comment = {
  id: string;
  authorId: string;
  content: string;
  createdAt: string;
  likes: string[];
};

// ── Connections ───────────────────────────────────────────────
export type ConnectionStatus = "none" | "pending-sent" | "pending-received" | "connected";

export type ConnectionRequest = {
  id: string;
  fromId: string;
  toId: string;
  message?: string;
  status: "pending" | "accepted" | "declined";
  createdAt: string;
};

// ── Messages ──────────────────────────────────────────────────
export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  read: boolean;
  sharedUpdateId?: string;
  sharedPassportId?: string;
};

export type Conversation = {
  id: string;
  participantIds: string[];
  lastMessage?: Message;
  updatedAt: string;
  unreadCount: number;
  otherParticipant?: any;
};

// ── Notifications ─────────────────────────────────────────────
export type NotificationType =
  | "connection_request"
  | "connection_accepted"
  | "like"
  | "comment"
  | "reply"
  | "feedback_response";

export type Notification = {
  id: string;
  type: NotificationType;
  actorId: string;
  targetId?: string;      // post/profile/etc.
  message: string;
  read: boolean;
  createdAt: string;
  link: string;           // route to navigate to
};

// ── Discovery ─────────────────────────────────────────────────
export type DiscoveryCategory = "same-stage" | "one-step-ahead" | "similar-challenges";

export type DiscoveryMatch = {
  founderId: string;
  category: DiscoveryCategory;
  matchReason: string;
  relevanceScore: number;
};
