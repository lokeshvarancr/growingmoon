'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import type { JourneyUpdate } from '@/types';
import { getFounderById } from '@/lib/mock-data/founders';
import { useApp } from '@/lib/state/AppContext';
import { socialApi } from '@/lib/api/client';
import { formatRelativeTime } from '@/lib/utils';
import {
  Bookmark,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  Zap,
  MessageSquare,
  X,
  Share2,
  Trash2,
  MoreHorizontal,
  Flag,
  Calendar,
} from 'lucide-react';
import DiscussionDrawer from './DiscussionDrawer';
import ReportModal from '@/components/moderation/ReportModal';
import MediaRenderer from './media/MediaRenderer';

type JourneyPostCardProps = {
  update: JourneyUpdate;
};

export default function JourneyPostCard({ update }: JourneyPostCardProps) {
  const { currentUser, toggleLike, toggleSave, deleteUpdate, addToast } = useApp();

  // Resolve post author: support backend UserPublic model directly
  const postAuthor = (update as any).author;
  const author = postAuthor
    ? {
        id: postAuthor.id,
        username: postAuthor.username,
        name: postAuthor.name,
        avatar: postAuthor.avatar_initials || postAuthor.avatar || 'GM',
        avatarImage: postAuthor.avatar_image || postAuthor.avatarImage,
        avatarColor: postAuthor.avatar_color || postAuthor.avatarColor || 'bg-amber-100 text-amber-800',
        role: postAuthor.role_title || postAuthor.role || 'Builder',
        stage: postAuthor.stage || postAuthor.role_title || 'Building MVP',
        location: postAuthor.location || 'Bengaluru',
      }
    : getFounderById(update.authorId) || currentUser;

  const [isExpanded, setIsExpanded] = useState(false);
  const [isDiscussionOpen, setIsDiscussionOpen] = useState(false);
  const [isFollowed, setIsFollowed] = useState(false);
  const [hasFueled, setHasFueled] = useState(
    update.is_fueled_by_me || (update.likes || []).includes(currentUser.id)
  );
  const [showMenu, setShowMenu] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isClamped, setIsClamped] = useState(false);
  const contentRef = useRef<HTMLParagraphElement>(null);

  const isSaved = update.is_saved_by_me || (update.saves || []).includes(currentUser.id);
  const isOwnPost = update.authorId === currentUser.id;

  const mediaList = update.media || [];
  const isTextOnly = mediaList.length === 0;

  // Headline extraction - guarantees a clean heading even for text-only posts
  let displayHeadline = update.headline;
  let displayContent = update.content;

  if (!displayHeadline) {
    if (update.content.includes('\n\n')) {
      const parts = update.content.split('\n\n');
      displayHeadline = parts[0];
      displayContent = parts.slice(1).join('\n\n');
    } else {
      const firstPeriod = update.content.indexOf('. ');
      if (firstPeriod > 0 && firstPeriod < 120) {
        displayHeadline = update.content.slice(0, firstPeriod + 1);
        displayContent = update.content.slice(firstPeriod + 2);
      } else {
        displayHeadline = update.journeyTag || update.category || 'Journey Milestone';
      }
    }
  }

  // Only show "Read more" when the text is actually visually clamped —
  // a character-count heuristic disagrees with line-clamp on narrow screens.
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const measure = () => setIsClamped(el.scrollHeight > el.clientHeight + 1);
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [displayContent, isExpanded]);

  // Clamping heading for text-only posts to maximum 5-7 words so it never wraps to 4 lines on mobile
  if (isTextOnly && displayHeadline) {
    const words = displayHeadline.trim().split(/\s+/);
    if (words.length > 7) {
      displayHeadline = words.slice(0, 7).join(' ') + '...';
    }
  }

  const handleToggleFollow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!author?.id || isOwnPost) return;
    const next = !isFollowed;
    setIsFollowed(next);
    addToast(next ? `Now following ${author.name}` : `Unfollowed ${author.name}`, 'info');
    try {
      if (next) {
        await socialApi.followUser(author.id);
      } else {
        await socialApi.unfollowUser(author.id);
      }
    } catch (err) {
      console.warn('Failed to update follow status in database:', err);
    }
  };

  const handleQuietFuelBoost = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleLike(update.id);
    setHasFueled((prev) => !prev);
    addToast('⚡ Quiet boost sent to creator! Private encouragement with zero vanity metrics.', 'success');
  };

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}/updates/${update.id}`);
      addToast('Journey link copied!', 'success');
    }
  };

  // ── Author Header ─────────────────────────────────────────────
  const renderAuthorHeader = () => (
    <div className="flex items-center justify-between">
      <Link
        href={`/profile/${author.username}`}
        data-testid="post-author-link"
        className="flex items-center gap-2.5 min-w-0 group/author"
      >
        {author.avatarImage ? (
          <img
            src={author.avatarImage}
            alt={author.name}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover ring-2 ring-gm-surface shadow-card flex-shrink-0"
          />
        ) : (
          <div
            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-bold text-xs ${author.avatarColor || 'bg-amber-100 text-amber-800'} ring-1 ring-black/10 shadow-xs flex-shrink-0`}
          >
            {author.avatar || 'RV'}
          </div>
        )}
        <div className="min-w-0">
          <span className="font-semibold text-sm sm:text-[15px] text-gm-ink leading-tight block truncate group-hover/author:text-gm-accent transition-colors">
            {author.name}
          </span>
          <p className="text-[11px] sm:text-xs text-gray-500 font-normal leading-tight mt-0.5 truncate">
            {author.stage || 'Building MVP'} · {formatRelativeTime(update.createdAt)}
          </p>
        </div>
      </Link>

      {!isOwnPost && (
        <button
          type="button"
          onClick={handleToggleFollow}
          data-testid="post-follow-button"
          className={`px-4 sm:px-5 h-9 rounded-lg font-semibold text-xs transition-all active:scale-95 cursor-pointer flex-shrink-0 select-none ${
            isFollowed
              ? 'bg-transparent border border-gm-ink/15 text-gray-700'
              : 'bg-gm-accent text-white'
          }`}
        >
          {isFollowed ? 'Following' : 'Follow'}
        </button>
      )}
    </div>
  );

  // ── Headline & Body (typography-first for text-only; caption for media posts) ──
  const renderHeadlineAndBody = () => (
    <div className={isTextOnly ? 'mt-6' : 'mt-4'}>
      {displayHeadline && (
        <h2
          className={
            isTextOnly
              ? 'font-serif text-[24px] sm:text-[29px] text-gm-ink leading-[1.18] text-balance'
              : 'text-[17px] sm:text-[19px] font-semibold text-gm-ink leading-snug text-balance'
          }
        >
          {displayHeadline}
        </h2>
      )}

      <div className="mt-2">
        <p
          ref={contentRef}
          className={`text-sm sm:text-[15px] text-gray-600 leading-relaxed font-normal ${
            !isExpanded ? 'line-clamp-2' : 'whitespace-pre-line'
          }`}
        >
          {displayContent}
        </p>
        {displayContent && (isClamped || isExpanded) && (
          <button
            type="button"
            data-testid="post-expand-toggle"
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-2 font-semibold text-[13px] text-gm-ink hover:text-gm-accent underline decoration-gm-accent/40 underline-offset-4 inline-flex items-center gap-0.5 focus:outline-none cursor-pointer"
          >
            {isExpanded ? (
              <>
                <span>Show less</span>
                <ChevronUp className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                <span>Read more</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        )}

        {/* Milestone & date-range chip (skip if the headline already repeats this tag) */}
        {(update.journeyTag || update.category) && displayHeadline !== (update.journeyTag || update.category) && (
          <div className="flex items-center gap-2 mt-4 flex-wrap">
            <span className="text-[10px] font-extrabold text-gm-accent bg-gm-accent-soft border border-gm-accent-line px-2.5 py-1 rounded-md uppercase tracking-wider">
              {update.journeyTag || update.category || 'Milestone'}
            </span>
            {(update.startDate || update.start_date) && (
              <span className="text-[10px] font-semibold text-gray-700 bg-gray-100 px-2 py-1 rounded-md inline-flex items-center gap-1">
                <Calendar className="w-2.5 h-2.5 text-gm-accent" />
                <span>
                  {new Date(update.startDate || update.start_date!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  {' → '}
                  {(update.endDate || update.end_date)
                    ? new Date(update.endDate || update.end_date!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    : 'Present'}
                </span>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );

  // ── Action Bar (Fuel, Save, Passport) ──
  const renderActionBar = () => (
    <div className="grid grid-cols-3 gap-2 sm:gap-2.5 mt-5">
      <button
        type="button"
        onClick={handleQuietFuelBoost}
        data-testid="post-fuel-button"
        className={`h-11 px-3 rounded-lg transition-all active:scale-95 cursor-pointer select-none flex items-center justify-center gap-1.5 sm:gap-2 border ${
          hasFueled
            ? 'bg-amber-100 border-amber-300 text-amber-900 ring-1 ring-amber-400/40'
            : 'bg-gray-50 hover:bg-amber-50 border-gm-ink/[0.07] text-gm-ink'
        }`}
        title="Send a quiet, private encouragement boost (Zero public vanity metrics)"
      >
        <Zap className={`w-3.5 h-3.5 flex-shrink-0 ${hasFueled ? 'text-amber-600 fill-amber-600' : 'text-amber-500 fill-amber-500'}`} />
        <span className="text-[13px] font-semibold truncate">
          {hasFueled ? 'Fueled' : 'Fuel'}
        </span>
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          toggleSave(update.id);
        }}
        data-testid="post-save-button"
        className={`h-11 px-3 rounded-lg transition-all active:scale-95 cursor-pointer select-none flex items-center justify-center gap-1.5 sm:gap-2 border ${
          isSaved
            ? 'bg-gm-accent-soft border-gm-accent/30 text-gm-accent ring-1 ring-gm-accent/20'
            : 'bg-gray-50 hover:bg-gray-100 border-gm-ink/[0.07] text-gm-ink'
        }`}
        title={isSaved ? 'Saved in bookmarks' : 'Save snippet to your library'}
      >
        <Bookmark className={`w-3.5 h-3.5 flex-shrink-0 ${isSaved ? 'text-gm-accent fill-gm-accent' : 'text-gray-700'}`} />
        <span className={`text-[13px] font-semibold truncate ${isSaved ? 'text-gm-accent' : ''}`}>
          {isSaved ? 'Saved' : 'Save'}
        </span>
      </button>

      <Link
        href={`/passport/${author.username}`}
        data-testid="post-passport-link"
        className="h-11 px-3 rounded-lg transition-all active:scale-95 cursor-pointer select-none flex items-center justify-center gap-1.5 sm:gap-2 bg-gm-accent border border-transparent text-white"
        title="Open author's complete Journey Passport"
      >
        <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5] flex-shrink-0" />
        <span className="text-[13px] font-semibold truncate">
          <span className="sm:hidden">Open</span>
          <span className="hidden sm:inline">Passport</span>
        </span>
      </Link>
    </div>
  );

  // ── Discussion & Options Bar ──
  const renderDiscussionBar = () => (
    <div className="mt-2.5 flex items-center gap-2">
      <button
        type="button"
        onClick={() => setIsDiscussionOpen(true)}
        data-testid="post-discussion-trigger"
        className="flex-1 bg-transparent hover:bg-gm-accent-soft border border-dashed border-gm-ink/15 hover:border-gm-accent/40 rounded-lg h-11 px-4 flex items-center justify-between text-xs select-none transition-all cursor-pointer group"
      >
        <div className="flex items-center gap-2 text-gray-700 font-semibold text-xs">
          <MessageSquare className="w-3.5 h-3.5 text-gm-accent group-hover:scale-110 transition-transform" />
          <span>Community Thread</span>
          <span className="text-gray-400 font-normal text-[11px]">
            ({update.comments?.length ?? update.comments_count ?? 0})
          </span>
        </div>
        <span className="text-[11px] font-bold text-gm-accent group-hover:underline flex items-center gap-1">
          <span>Join thread</span>
          <span>→</span>
        </span>
      </button>

      <div className="relative">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          data-testid="post-menu-button"
          className="w-11 h-11 rounded-lg bg-transparent hover:bg-gray-100 border border-gm-ink/10 text-gray-600 flex items-center justify-center transition-all cursor-pointer"
          title="More options"
          aria-label="More options"
        >
          <MoreHorizontal className="w-3.5 h-3.5 text-gray-600" />
        </button>

        {showMenu && (
          <div className="absolute right-0 bottom-14 bg-white rounded-lg p-1.5 z-30 min-w-[170px] text-[13px] shadow-modal border border-gm-ink/5 animate-slide-up">
            <button
              type="button"
              onClick={() => {
                handleShare();
                setShowMenu(false);
              }}
              data-testid="post-menu-copy-link"
              className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-md text-gray-700 flex items-center gap-2 transition-colors font-medium cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-gray-400" />
              <span>Copy Link</span>
            </button>
            {isOwnPost ? (
              <button
                type="button"
                onClick={() => {
                  deleteUpdate(update.id);
                  setShowMenu(false);
                }}
                data-testid="post-menu-delete"
                className="w-full text-left px-3 py-2 hover:bg-red-50 rounded-md text-red-600 flex items-center gap-2 transition-colors font-medium cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-500" />
                <span>Delete Moment</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setShowMenu(false);
                  setIsReportModalOpen(true);
                }}
                data-testid="post-menu-report"
                className="w-full text-left px-3 py-2 hover:bg-rose-50 rounded-md text-rose-600 flex items-center gap-2 transition-colors font-medium cursor-pointer"
              >
                <Flag className="w-3.5 h-3.5 text-rose-500" />
                <span>Report Post</span>
              </button>
            )}
          </div>
        )}
      </div>

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        targetType="post"
        targetId={update.id}
        targetTitle={update.headline || update.content.slice(0, 40) + '...'}
      />
    </div>
  );

  return (
    <>
      <article
        data-testid={`post-card-${update.id}`}
        className="bg-white rounded-xl p-5 sm:p-6 shadow-card hover:shadow-card-hover relative transition-shadow duration-300"
      >
        {renderAuthorHeader()}
        {renderHeadlineAndBody()}
        <MediaRenderer media={mediaList} />
        {renderActionBar()}
        {renderDiscussionBar()}
      </article>

      {/* ── 3/4 Bottom Sheet Modal: Community Thread (available for every post type) ── */}
      {isDiscussionOpen && (
        <div className="fixed inset-0 z-50 !mt-0 flex flex-col justify-end" role="dialog" aria-modal="true">
          <div
            onClick={() => setIsDiscussionOpen(false)}
            className="fixed inset-0 bg-gm-ink/50 backdrop-blur-md transition-opacity animate-fade-in"
          />

          <div className="relative z-10 w-full max-w-2xl mx-auto h-[75vh] max-h-[80vh] bg-gm-paper rounded-t-[32px] shadow-modal flex flex-col overflow-hidden animate-slide-up">
            <div
              className="pt-2.5 pb-1 flex justify-center flex-shrink-0 cursor-pointer"
              onClick={() => setIsDiscussionOpen(false)}
            >
              <div className="w-12 h-1.5 rounded-full bg-gray-300 hover:bg-gray-400 transition-colors" />
            </div>

            <div className="px-5 sm:px-7 py-4 border-b border-gm-ink/[0.06] flex items-center justify-between flex-shrink-0 bg-gm-paper">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gm-accent text-white flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <h2 className="text-[26px] sm:text-[32px] text-gm-ink leading-none">
                    Community Thread
                  </h2>
                  <p className="text-[11px] sm:text-xs text-gray-500 font-normal mt-0.5">
                    Insights & reflections from people on similar journeys
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsDiscussionOpen(false)}
                data-testid="discussion-modal-close"
                className="w-10 h-10 rounded-full bg-gm-ink/[0.05] hover:bg-gm-ink hover:text-gm-paper text-gray-500 hover:text-gray-900 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4 stroke-[2.2]" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
              <DiscussionDrawer
                postId={update.id}
                promptQuestion1={update.prompt_question_1}
                promptQuestion2={update.prompt_question_2}
                postAuthorId={update.authorId}
                creatorFirstName={author.name.split(' ')[0] || 'Creator'}
                authorName={author.name}
                authorLocation={author.location || 'Bengaluru'}
                onClose={() => setIsDiscussionOpen(false)}
                askText={
                  update.prompt_question_1 ||
                  (update.journeyTag === 'Learning Guitar' || update.journeyTag === 'Music journey'
                    ? 'Seeking tips on switching from open C to G cleanly without stalling rhythm!'
                    : update.journeyTag === 'Marathon journey' || update.journeyTag === 'Fitness journey'
                    ? 'What was your recovery routine after crossing the 15km weekend long run mark?'
                    : update.journeyTag === 'Career transition' || update.journeyTag === 'Career journey'
                    ? 'Looking for advice from people who successfully transitioned into their first PM role.'
                    : update.journeyTag === 'Language journey'
                    ? 'How many new vocabulary words did you aim for daily without forgetting previous ones?'
                    : 'Looking for advice from anyone who tackled this milestone — what helped you push through?')
                }
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
