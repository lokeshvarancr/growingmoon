-- ==============================================================================
-- GROWING MOON — PRODUCTION POSTGRESQL DATABASE SCHEMA (LOCKED & FINALIZED)
-- ==============================================================================
-- Database: PostgreSQL 14+
-- Extensions: pgcrypto (UUID v4 generation & password hashing)
-- Architecture: High-Performance Relational Schema with Denormalized Precomputed Counters
-- Includes:
--   1. Users & Authentication (OAuth + Email)
--   2. User Extended Profile (Can Help With, Figuring Out, Open To, Max 3 Focus Items, About, Interests)
--   3. User Activity Log (Audit trail of every comment, answer, post, fuel, save with deletion support)
--   4. Social Graph (Mutual Connections & 1-way Creator Follows)
--   5. Journey Passports (with short_text)
--   6. Passport Updates / Feed Posts (Two Asks, is_posted flag, precomputed counters)
--   7. Post Media (Carousels & single cards)
--   8. Post Interactions (Fuels & Saves)
--   9. Community Thread & Discussions (Recursive tree, ask targeting, helpful votes, applied mark)
--  10. WhatsApp-Style Real-Time Text Chat (1-on-1 & Groups, Typing indicators, Blue-tick receipts)
--  11. Ultra-Fast Performance Indexes
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. USERS & CORE AUTHENTICATION
-- ==============================================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT,                                 -- Nullable for Google / LinkedIn OAuth users
    auth_provider VARCHAR(20) NOT NULL DEFAULT 'email',  -- 'email' | 'google' | 'linkedin'
    google_id VARCHAR(100) UNIQUE,
    linkedin_id VARCHAR(100) UNIQUE,
    name VARCHAR(100) NOT NULL,
    birthday DATE,
    gender VARCHAR(20),                                 -- 'female', 'male', 'non-binary', 'prefer-not-to-say'
    avatar_image TEXT,                                  -- S3 / CDN image URL
    avatar_initials VARCHAR(4) NOT NULL DEFAULT 'GM',   -- Generated on signup (e.g. 'RV', 'AS')
    avatar_color VARCHAR(50) DEFAULT 'bg-amber-100 text-amber-800',
    bio TEXT,
    role_title VARCHAR(100),                            -- e.g. 'Guitar Learner & PM', 'Marathoner'
    location VARCHAR(100) DEFAULT 'Bengaluru, India',

    -- Denormalized Precomputed Counters (Zero COUNT(*) queries on refresh!)
    followers_count INT NOT NULL DEFAULT 0,
    following_count INT NOT NULL DEFAULT 0,
    connections_count INT NOT NULL DEFAULT 0,
    posts_count INT NOT NULL DEFAULT 0,
    saved_count INT NOT NULL DEFAULT 0,
    activities_count INT NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 2. USER EXTENDED PROFILE DETAILS (LOCKED TABLE)
-- ==============================================================================
-- Stores in-depth profile responses:
-- - "I can help with"
-- - "I am figuring out"
-- - "I am open to"
-- - "What I do right now" (Strictly maximum 3 items)
-- - "About" & "Interests"

CREATE TABLE user_profile_details (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    about TEXT,                                         -- In-depth founder / builder journey story
    can_help_with TEXT,                                 -- Text: "I can help with..."
    figuring_out TEXT,                                  -- Text: "I am figuring out..."
    open_to TEXT,                                       -- Text: "I am open to..."
    
    -- "What I do right now" (Strictly maximum 3 items as required)
    current_focus_1 VARCHAR(150),                       -- Focus item #1
    current_focus_2 VARCHAR(150),                       -- Focus item #2
    current_focus_3 VARCHAR(150),                       -- Focus item #3

    interests TEXT[] NOT NULL DEFAULT '{}',             -- e.g. ARRAY['Guitar', 'Running', 'System Design']
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 3. USER ACTIVITY SESSIONS & AUDIT LOG (Review & Delete Comments Feature)
-- ==============================================================================
-- Tracks every action a user takes:
-- - Which post they commented on
-- - Which ask they answered
-- - Which reply they posted
-- - Which post they fueled or saved
-- Enables users to view their entire activity history and directly delete their comment.

CREATE TABLE user_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Activity Type
    activity_type VARCHAR(50) NOT NULL,                 -- 'commented', 'answered_ask', 'replied', 'created_post', 'fueled_post', 'saved_post', 'helpful_voted'
    
    -- Entity references for deep linking & deletion
    entity_type VARCHAR(50) NOT NULL,                   -- 'post', 'discussion', 'user'
    entity_id UUID NOT NULL,                            -- Exact ID of the discussion, fuel, or save
    target_post_id UUID REFERENCES passport_updates(id) ON DELETE CASCADE, -- Quick link to target post
    
    -- Human-readable preview for ultra-fast rendering
    summary_text TEXT NOT NULL,                         -- e.g. "Answered Ask 1 on Vikram Rao's post: 'Breaking practice into 15-minute...'"
    target_author_name VARCHAR(100),                    -- Author of the post commented on
    snippet TEXT,                                       -- The text of the comment (so user can see what they wrote)
    
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 4. SOCIAL CONNECTIONS & FOLLOWS
-- ==============================================================================
-- 1-to-1 Mutual Social Connections
CREATE TABLE social_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',      -- 'pending' | 'connected' | 'declined' | 'blocked'
    connected_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(requester_id, receiver_id),
    CHECK(requester_id != receiver_id)
);

-- 1-way Creator Follows
CREATE TABLE user_follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(follower_id, following_id),
    CHECK(follower_id != following_id)
);

-- ==============================================================================
-- 5. JOURNEY PASSPORTS
-- ==============================================================================
CREATE TABLE passports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL DEFAULT 'My Journey Passport',
    short_text VARCHAR(255),                            -- One-line tagline/intro for the passport
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    current_goal TEXT,
    is_public BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 6. PASSPORT UPDATES / JOURNEY POSTS (FEED)
-- ==============================================================================
-- Stores post content and the two author prompt questions for "My Ask".
-- Includes precomputed counters for instant refresh rendering!

CREATE TABLE passport_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    passport_id UUID REFERENCES passports(id) ON DELETE CASCADE,
    headline VARCHAR(255),
    journey_tag VARCHAR(100),                           -- e.g. 'Learning Guitar', 'Marathon journey'
    content TEXT NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'All',

    -- Two prompt questions by author (matches "2 / 2 asks" accordion in the UI)
    prompt_question_1 TEXT,                             -- e.g. 'What helped you stay consistent during the first few months?'
    prompt_question_2 TEXT,                             -- e.g. 'What’s the best way to find early users for a prototype?'

    -- Status flags
    is_posted BOOLEAN NOT NULL DEFAULT true,             -- Whether this post is live/published
    is_draft BOOLEAN NOT NULL DEFAULT false,

    -- Precomputed Performance Counters (Instant page loads, zero aggregation lag)
    fuels_count INT NOT NULL DEFAULT 0,
    saves_count INT NOT NULL DEFAULT 0,
    comments_count INT NOT NULL DEFAULT 0,
    ask_1_answers_count INT NOT NULL DEFAULT 0,
    ask_2_answers_count INT NOT NULL DEFAULT 0,
    media_count INT NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 7. POST MEDIA (Images, Reels, Videos)
-- ==============================================================================
CREATE TABLE post_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES passport_updates(id) ON DELETE CASCADE,
    media_type VARCHAR(20) NOT NULL DEFAULT 'image',    -- 'image' | 'video'
    orientation VARCHAR(20) NOT NULL DEFAULT 'landscape', -- 'portrait' | 'landscape' | 'square'
    url TEXT NOT NULL,                                  -- S3 / CDN media URL
    thumbnail_url TEXT,
    display_order INT NOT NULL DEFAULT 0,               -- 0, 1, 2... for galleries/carousels
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 8. POST INTERACTIONS (Quiet Fuel Boost & Saves / Bookmarks)
-- ==============================================================================
CREATE TABLE post_fuels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES passport_updates(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

CREATE TABLE post_saves (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES passport_updates(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- ==============================================================================
-- 9. COMMUNITY THREAD & DISCUSSIONS (Threaded Comments & Replies)
-- ==============================================================================
CREATE TABLE post_discussions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES passport_updates(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Recursive tree structure
    parent_id UUID REFERENCES post_discussions(id) ON DELETE CASCADE,  -- NULL = top-level; UUID = reply
    reply_to_user_id UUID REFERENCES users(id) ON DELETE SET NULL,      -- User handle mention/reply target
    
    -- Section target
    ask_number INT,                                                    -- 1 = Ask 1, 2 = Ask 2, NULL = General Conversation
    tag VARCHAR(30),                                                    -- 'Feedback' | 'Suggestion' | 'Insight' | 'Reflection'
    content TEXT NOT NULL,
    
    -- Precomputed Performance Counters
    helpful_count INT NOT NULL DEFAULT 0,
    replies_count INT NOT NULL DEFAULT 0,                              -- Precomputed direct replies count (e.g. "3 replies")
    is_applied BOOLEAN NOT NULL DEFAULT false,                         -- Marked as "Applied & Worked" by author

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Helpful Votes on Discussions (1 vote per user per discussion item)
CREATE TABLE discussion_helpful_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    discussion_id UUID NOT NULL REFERENCES post_discussions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(discussion_id, user_id)
);

-- ==============================================================================
-- 10. WHATSAPP-STYLE REAL-TIME TEXT CHAT SYSTEM
-- ==============================================================================
-- Optimized for ultra-fast inbox loading with cached snippets and unread badges.

CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    is_group BOOLEAN NOT NULL DEFAULT false,
    title VARCHAR(150),                                 -- Group name (NULL for direct 1-on-1 chats)
    
    -- Precomputed Snippet for Instant Inbox Rendering (Zero JOIN on load!)
    last_message_text TEXT,                             -- e.g. "Hey, let's catch up on Monday!"
    last_message_sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
    last_message_status VARCHAR(20) DEFAULT 'sent',     -- 'sending', 'sent', 'delivered', 'read'
    last_message_at TIMESTAMPTZ,                        -- For ordering recent conversations to the top
    total_messages_count INT NOT NULL DEFAULT 0,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE conversation_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- WhatsApp Real-Time State
    unread_count INT NOT NULL DEFAULT 0,                -- Direct unread badge count (e.g. "3 unread")
    last_read_message_id UUID,                          -- Last message ID seen
    last_read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_typing BOOLEAN NOT NULL DEFAULT false,            -- Real-time "typing..." indicator
    typing_updated_at TIMESTAMPTZ,
    is_muted BOOLEAN NOT NULL DEFAULT false,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(conversation_id, user_id)
);

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,

    -- WhatsApp Status Lifecycle:
    -- 'sending'   = 🕒 Clock icon (waiting for network)
    -- 'sent'      = ✓ Single gray tick (received by Growing Moon server)
    -- 'delivered' = ✓✓ Double gray tick (delivered to recipient device)
    -- 'read'      = ✓✓ Double blue tick (opened & read by recipient)
    status VARCHAR(20) NOT NULL DEFAULT 'sent',

    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    delivered_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,                                -- When read_at IS NOT NULL -> Render Blue Ticks ✓✓

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 11. PERFORMANCE INDEXES (Sub-Millisecond Queries & Instant Refreshes)
-- ==============================================================================

-- Feed & Post querying
CREATE INDEX idx_updates_author ON passport_updates(author_id);
CREATE INDEX idx_updates_created_at ON passport_updates(created_at DESC);
CREATE INDEX idx_updates_posted ON passport_updates(is_posted, created_at DESC);
CREATE INDEX idx_post_media_post ON post_media(post_id, display_order);

-- Community Thread & Discussions
CREATE INDEX idx_discussions_post ON post_discussions(post_id, created_at ASC);
CREATE INDEX idx_discussions_parent ON post_discussions(parent_id);
CREATE INDEX idx_discussions_ask ON post_discussions(post_id, ask_number);
CREATE INDEX idx_discussion_helpful ON discussion_helpful_votes(discussion_id, user_id);

-- User Activity & Audit Trail
CREATE INDEX idx_activities_user ON user_activities(user_id, created_at DESC);
CREATE INDEX idx_activities_entity ON user_activities(entity_id);
CREATE INDEX idx_activities_target_post ON user_activities(target_post_id);

-- Social & Interactions
CREATE INDEX idx_post_fuels_post ON post_fuels(post_id);
CREATE INDEX idx_post_saves_user ON post_saves(user_id);
CREATE INDEX idx_connections_users ON social_connections(requester_id, receiver_id, status);
CREATE INDEX idx_follows_pair ON user_follows(follower_id, following_id);

-- WhatsApp Chat Instant Queries
CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at ASC);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_conversations_recent ON conversations(last_message_at DESC);
CREATE INDEX idx_participants_user ON conversation_participants(user_id, conversation_id);
