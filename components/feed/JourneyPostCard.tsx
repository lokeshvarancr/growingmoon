'use client';
import React, { useState } from 'react';
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
  Lightbulb,
  X,
  ChevronLeft,
  ChevronRight,
  Share2,
  Trash2,
  MoreHorizontal,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Video,
  Plus,
  Check,
  Flag,
  Calendar,
} from 'lucide-react';
import DiscussionDrawer from './DiscussionDrawer';
import ReportModal from '@/components/moderation/ReportModal';

type JourneyPostCardProps = {
  update: JourneyUpdate;
};

// ── Video Link Helpers (Extracts YouTube IDs & High-Res Posters) ────────
function getYouTubeId(url?: string): string | null {
  if (!url) return null;
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?.*v=|shorts\/))([\w-]{11})/i
  );
  return match ? match[1] : null;
}

function getVideoPosterUrl(media: { url: string; thumbnail?: string }): string {
  if (media.thumbnail) return media.thumbnail;
  const ytId = getYouTubeId(media.url);
  if (ytId) {
    return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
  }
  return 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80';
}

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
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  // Lightbox state for images
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const isSaved = update.is_saved_by_me || (update.saves || []).includes(currentUser.id);
  const isOwnPost = update.authorId === currentUser.id;

  const mediaList = update.media || [];
  const currentMedia = lightboxIndex !== null ? mediaList[lightboxIndex] : null;

  // Identify display paradigm based on content
  const isSinglePortrait =
    mediaList.length === 1 &&
    (mediaList[0].orientation === 'portrait' || mediaList[0].url.includes('portrait'));
  const isSingleLandscape = mediaList.length === 1 && !isSinglePortrait;
  const isMultiMedia = mediaList.length >= 2;
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

  const handleOpenDiscussion = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDiscussionOpen(true);
  };

  const handleOpenSuggestions = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDiscussionOpen(true);
  };

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}/updates/${update.id}`);
      addToast('Journey link copied!', 'success');
    }
  };

  // ── Common Reusable Header (Used by Multi-Media & Text-Only Cards) ──
  const renderAuthorHeader = () => (
    <div className="flex items-center justify-between">
      <Link
        href={`/profile/${author.username}`}
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
            {author.stage || 'Building MVP'} · Combinate
          </p>
        </div>
      </Link>

      {!isOwnPost && (
        <button
          type="button"
          onClick={handleToggleFollow}
          className={`px-4 sm:px-5 h-9 rounded-full font-semibold text-xs transition-all active:scale-95 cursor-pointer flex-shrink-0 select-none ${
            isFollowed
              ? 'bg-transparent border border-gm-ink/15 text-gray-700'
              : 'bg-gm-ink hover:bg-gm-accent text-gm-paper'
          }`}
        >
          {isFollowed ? 'Following' : 'Follow'}
        </button>
      )}
    </div>
  );

  // ── Common Headline & Body Text (Placed ABOVE gallery for Multi-Media & Text-Only) ──
  const renderHeadlineAndBody = () => (
    <div className="mt-5">
      {displayHeadline && (
        <h2 className="text-[22px] sm:text-[27px] text-gm-ink leading-[1.15] line-clamp-3 text-balance">
          {displayHeadline}
        </h2>
      )}

      <div className="mt-2.5">
        <p className={`text-sm sm:text-[15px] text-gray-600 leading-relaxed font-normal ${!isExpanded ? 'line-clamp-2' : 'whitespace-pre-line'}`}>
          {displayContent}
        </p>
        {displayContent && (
          <button
            type="button"
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

        {/* Milestone Ending for Text-only cards */}
        {isTextOnly && (
          <div className="flex items-center gap-2 mt-4 flex-wrap">
            <span className="text-[10px] font-extrabold text-gm-accent bg-gm-accent-soft border border-gm-accent-line px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              {update.journeyTag || update.category || 'Milestone'}
            </span>
            {(update.startDate || update.start_date) && (
              <span className="text-[10px] font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
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
            <span className="text-[11px] text-gray-400 font-normal">
              · {formatRelativeTime(update.createdAt)}
            </span>
          </div>
        )}
      </div>
    </div>
  );

  // ── Common Action Bar (Fuel, Save, Passport - 3 Equal Balanced Columns) ──
  const renderActionBar = () => (
    <div className="grid grid-cols-3 gap-2 sm:gap-2.5 mt-6">
      {/* Card 1: Fuel */}
      <button
        type="button"
        onClick={handleQuietFuelBoost}
        className={`h-11 px-3 rounded-full transition-all active:scale-95 cursor-pointer select-none flex items-center justify-center gap-1.5 sm:gap-2 border ${
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

      {/* Card 2: Save */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          toggleSave(update.id);
        }}
        className={`h-11 px-3 rounded-full transition-all active:scale-95 cursor-pointer select-none flex items-center justify-center gap-1.5 sm:gap-2 border ${
          isSaved
            ? 'bg-gm-accent-soft border-gm-accent/30 text-gm-accent ring-1 ring-gm-accent/20'
            : 'bg-gray-50 hover:bg-gray-100 border-gm-ink/[0.07] text-gm-ink'
        }`}
        title={isSaved ? "Saved in bookmarks" : "Save snippet to your library"}
      >
        <Bookmark className={`w-3.5 h-3.5 flex-shrink-0 ${isSaved ? 'text-gm-accent fill-gm-accent' : 'text-gray-700'}`} />
        <span className={`text-[13px] font-semibold truncate ${isSaved ? 'text-gm-accent' : ''}`}>
          {isSaved ? 'Saved' : 'Save'}
        </span>
      </button>

      {/* Card 3: Passport */}
      <Link
        href={`/passport/${author.username}`}
        className="h-11 px-3 rounded-full transition-all active:scale-95 cursor-pointer select-none flex items-center justify-center gap-1.5 sm:gap-2 bg-gm-ink hover:bg-gm-accent border border-transparent text-gm-paper"
        title="Open author's complete Journey Passport"
      >
        <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5] flex-shrink-0" />
        <span className="text-[13px] font-semibold truncate">
          Passport
        </span>
      </Link>
    </div>
  );

  // ── Common Minimalist Discussion & Suggestions Bar (Unified Community Thread Trigger) ──
  const renderDiscussionBar = () => (
    <div className="mt-2.5 flex items-center gap-2">
      {/* Minimalist Trigger Bar */}
      <button
        type="button"
        onClick={() => setIsDiscussionOpen(true)}
        className="flex-1 bg-transparent hover:bg-gm-accent-soft border border-dashed border-gm-ink/15 hover:border-gm-accent/40 rounded-full h-11 px-4 flex items-center justify-between text-xs select-none transition-all cursor-pointer group"
      >
        <div className="flex items-center gap-2 text-gray-700 font-semibold text-xs">
          <MessageSquare className="w-3.5 h-3.5 text-gm-accent group-hover:scale-110 transition-transform" />
          <span>Community Thread</span>
          <span className="text-gray-400 font-normal text-[11px]">
            ({update.comments?.length || 24})
          </span>
        </div>
        <span className="text-[11px] font-bold text-gm-accent group-hover:underline flex items-center gap-1">
          <span>Join thread</span>
          <span>→</span>
        </span>
      </button>

      {/* Desktop Three-Dots Menu Button */}
      <div className="relative hidden lg:block">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          className="w-11 h-11 rounded-full bg-transparent hover:bg-gray-100 border border-gm-ink/10 text-gray-600 flex items-center justify-center transition-all cursor-pointer"
          title="More options"
          aria-label="More options"
        >
          <MoreHorizontal className="w-3.5 h-3.5 text-gray-600" />
        </button>

        {showMenu && (
          <div className="absolute right-0 bottom-14 bg-white rounded-2xl p-1.5 z-30 min-w-[170px] text-[13px] shadow-modal border border-gm-ink/5 animate-slide-up">
            <button
              type="button"
              onClick={() => {
                handleShare();
                setShowMenu(false);
              }}
              className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-xl text-gray-700 flex items-center gap-2 transition-colors font-medium cursor-pointer"
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
                  addToast('Journey moment deleted', 'info');
                }}
                className="w-full text-left px-3 py-2 hover:bg-red-50 rounded-xl text-red-600 flex items-center gap-2 transition-colors font-medium cursor-pointer"
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
                className="w-full text-left px-3 py-2 hover:bg-rose-50 rounded-xl text-rose-600 flex items-center gap-2 transition-colors font-medium cursor-pointer"
              >
                <Flag className="w-3.5 h-3.5 text-rose-500" />
                <span>Report Post</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Report Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        targetType="post"
        targetId={update.id}
        targetTitle={update.headline || update.content.slice(0, 40) + '...'}
      />
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════
  // PARADIGM 1: SINGLE PORTRAIT IMAGE / VIDEO = REEL-TYPE CARD
  // ══════════════════════════════════════════════════════════════════════
  const renderReelCard = () => {
    const media = mediaList[0];
    const isVideo = media.type === 'video';
    const ytId = isVideo ? getYouTubeId(media.url) : null;
    const posterUrl = isVideo ? getVideoPosterUrl(media) : media.url;

    return (
      <article className="relative rounded-[28px] sm:rounded-[36px] overflow-hidden bg-slate-950 aspect-[9/15] sm:aspect-[9/16] min-h-[580px] sm:min-h-[660px] max-h-[760px] w-full max-w-[440px] sm:max-w-[480px] mx-auto select-none shadow-card-hover group/reel">
        {/* Background Visual (Video or Image) */}
        {isVideo && isPlayingVideo ? (
          ytId ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1`}
              title={displayHeadline || 'Video playback'}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          ) : (
            <video
              src={media.url}
              poster={posterUrl}
              className="w-full h-full object-cover"
              playsInline
              controls
              autoPlay
            />
          )
        ) : (
          <img
            src={posterUrl}
            alt={media.alt || displayHeadline}
            onClick={() => {
              if (isVideo) setIsPlayingVideo(true);
              else setLightboxIndex(0);
            }}
            className="w-full h-full object-cover group-hover/reel:scale-105 transition-transform duration-700 ease-out cursor-pointer"
          />
        )}

        {/* Video Play Button (When video is not playing yet) */}
        {isVideo && !isPlayingVideo && (
          <div
            onClick={() => setIsPlayingVideo(true)}
            className="absolute inset-0 flex items-center justify-center cursor-pointer transition-colors bg-black/25 hover:bg-black/15 z-10"
          >
            <div className="w-14 h-14 rounded-full bg-white/95 text-gm-ink flex items-center justify-center shadow-2xl backdrop-blur-md transform transition-all active:scale-90 hover:scale-105">
              <Play className="w-6 h-6 fill-current translate-x-0.5 text-red-600" />
            </div>
          </div>
        )}

        {/* Cinematic Shading Scrims */}
        <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-black/95 via-black/50 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />

        {/* Top-Left Category Tag & Date */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2 flex-wrap">
          <span className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white/95 text-[10.5px] font-extrabold uppercase tracking-wider shadow-sm">
            {update.journeyTag || update.category || 'Portrait moment'}
          </span>
          {(update.startDate || update.start_date) && (
            <span className="px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white/90 text-[10px] font-semibold flex items-center gap-1 shadow-sm">
              <Calendar className="w-2.5 h-2.5" />
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

        {/* Top-Right Badges (Video source & duration) */}
        {isVideo && (
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/90 text-white text-[11px] font-bold shadow-md backdrop-blur-md">
              <Play className="w-3 h-3 fill-current" />
              <span>{ytId ? 'YouTube' : 'Video'} · {media.duration || 'Watch'}</span>
            </span>
          </div>
        )}

        {/* ── RIGHT-SIDE FLOATING ACTION RAIL (Clean Icon Alone, No Outer Circles, No Text) ── */}
        <div className="absolute right-3.5 sm:right-4.5 bottom-6 z-20 flex flex-col items-center gap-5 select-none pointer-events-auto">
          {/* Fuel Icon (Alone) */}
          <button
            type="button"
            onClick={handleQuietFuelBoost}
            className={`transition-all active:scale-75 hover:scale-115 cursor-pointer p-1.5 focus:outline-none ${
              hasFueled
                ? 'text-amber-400 drop-shadow-[0_2px_12px_rgba(251,191,36,0.95)]'
                : 'text-white/95 hover:text-amber-300 drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]'
            }`}
            title="Fuel creator progress"
          >
            <Zap className={`w-6 h-6 sm:w-7 sm:h-7 ${hasFueled ? 'fill-current' : 'fill-none stroke-[2.3]'}`} />
          </button>

          {/* Save Icon (Alone) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleSave(update.id);
            }}
            className={`transition-all active:scale-75 hover:scale-115 cursor-pointer p-1.5 focus:outline-none ${
              isSaved
                ? 'text-[#A78BFA] drop-shadow-[0_2px_12px_rgba(167,139,250,0.95)]'
                : 'text-white/95 hover:text-purple-300 drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]'
            }`}
            title={isSaved ? "Saved in bookmarks" : "Save snippet"}
          >
            <Bookmark className={`w-6 h-6 sm:w-7 sm:h-7 ${isSaved ? 'fill-current' : 'fill-none stroke-[2.3]'}`} />
          </button>

          {/* Share Icon (Replaces discussions icon: opens full story + discussions drawer & copies link) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleShare();
              setIsDiscussionOpen(true);
            }}
            className="text-white/95 hover:text-white hover:scale-115 active:scale-75 transition-all cursor-pointer p-1.5 focus:outline-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]"
            title="Share & view discussions"
          >
            <Share2 className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.3]" />
          </button>
        </div>

        {/* ── BOTTOM-LEFT CONTENT OVERLAY (Only Name, Follow Button & Heading) ── */}
        <div className="absolute left-4 sm:left-5 bottom-5 right-14 sm:right-16 z-20 pointer-events-auto">
          {/* Creator Profile Row with Follow Button */}
          <div className="flex items-center gap-2.5 mb-1.5">
            <Link
              href={`/profile/${author.username}`}
              className="flex items-center gap-2 group/author min-w-0"
            >
              {author.avatarImage ? (
                <img
                  src={author.avatarImage}
                  alt={author.name}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover ring-2 ring-white/90 shadow-md flex-shrink-0"
                />
              ) : (
                <div
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-black text-xs ${author.avatarColor || 'bg-amber-100 text-amber-800'} ring-2 ring-white/90 shadow-md flex-shrink-0`}
                >
                  {author.avatar || 'RV'}
                </div>
              )}
              <span className="font-extrabold text-sm sm:text-base text-white tracking-tight leading-tight block truncate drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] group-hover/author:underline">
                {author.name}
              </span>
            </Link>

            {!isOwnPost && (
              <button
                type="button"
                onClick={handleToggleFollow}
                className={`px-3 py-1 rounded-full font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer flex-shrink-0 select-none ${
                  isFollowed
                    ? 'bg-white/20 backdrop-blur-md text-white border border-white/40'
                    : 'bg-white text-gm-ink hover:bg-white/90'
                }`}
              >
                {isFollowed ? 'Following' : 'Follow'}
              </button>
            )}
          </div>

          {/* Heading Only (No 2-line snippet text) */}
          {displayHeadline && (
            <h2 className="text-lg sm:text-xl font-black text-white tracking-tight leading-snug drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] line-clamp-2">
              {displayHeadline}
            </h2>
          )}

          {/* Read More Button -> Opens 3/4 Bottom Sheet Modal for Full Content & Discussions */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsDiscussionOpen(true);
            }}
            className="mt-2 text-xs font-bold text-white/95 hover:text-white inline-flex items-center gap-1.5 cursor-pointer bg-white/20 hover:bg-white/30 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 transition-all active:scale-95 shadow-sm"
          >
            <span>Read more</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </article>
    );
  };

  // ══════════════════════════════════════════════════════════════════════
  // PARADIGM 1B: STANDARD DESKTOP PORTRAIT CARD (Reel format removed on desktop)
  // Clean standard white card with author on top, headline/body, framed media, actions & discussions
  // ══════════════════════════════════════════════════════════════════════
  const renderStandardPortraitCard = () => {
    const media = mediaList[0];
    const isVideo = media.type === 'video';
    const ytId = isVideo ? getYouTubeId(media.url) : null;
    const posterUrl = isVideo ? getVideoPosterUrl(media) : media.url;

    return (
      <article className="bg-white rounded-[28px] p-5 sm:p-7 shadow-card hover:shadow-card-hover relative transition-shadow duration-500">
        {/* 1. Header with Author Info & Follow */}
        {renderAuthorHeader()}

        {/* 2. Headline & Body */}
        {renderHeadlineAndBody()}

        {/* 3. Framed Media (Comfortable max height, centered portrait container) */}
        <div className="mt-5 rounded-[20px] overflow-hidden bg-gray-950 select-none relative max-h-[500px] w-full flex items-center justify-center">
          {isVideo && isPlayingVideo ? (
            ytId ? (
              <div className="w-full max-w-[380px] aspect-[9/16] max-h-[500px] flex items-center justify-center">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1`}
                  title={displayHeadline || 'Video playback'}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0 rounded-xl"
                />
              </div>
            ) : (
              <video
                src={media.url}
                poster={posterUrl}
                className="max-h-[500px] w-auto max-w-[380px] object-contain rounded-xl"
                playsInline
                controls
                autoPlay
              />
            )
          ) : (
            <div
              onClick={() => {
                if (isVideo) setIsPlayingVideo(true);
                else setLightboxIndex(0);
              }}
              className="relative w-full max-h-[500px] flex items-center justify-center cursor-pointer group/portrait bg-gray-950/60"
            >
              <img
                src={posterUrl}
                alt={media.alt || displayHeadline}
                className="max-h-[500px] w-auto max-w-[380px] object-contain rounded-xl transition-transform duration-500 group-hover/portrait:scale-[1.01]"
              />

              {/* YouTube / Video Play Badge & Button */}
              {isVideo && !isPlayingVideo && (
                <div className="absolute inset-0 flex items-center justify-center transition-colors bg-black/25 group-hover/portrait:bg-black/15">
                  <div className="w-14 h-14 rounded-full bg-white/95 text-gm-ink flex items-center justify-center shadow-xl backdrop-blur-md transform transition-all active:scale-90 group-hover/portrait:scale-105">
                    <Play className="w-6 h-6 fill-current translate-x-0.5 text-red-600" />
                  </div>
                </div>
              )}

              {/* Top-Right Badge if video */}
              {isVideo && (
                <div className="absolute top-3 right-3 z-10">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-[11px] font-bold shadow-md border border-white/20">
                    <Play className="w-3 h-3 fill-current text-red-500" />
                    <span>{ytId ? 'Shorts' : 'Video'}</span>
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 4. Action Bar */}
        {renderActionBar()}

        {/* 5. Minimalist Discussion & Suggestions Bar */}
        {renderDiscussionBar()}
      </article>
    );
  };

  // ══════════════════════════════════════════════════════════════════════
  // PARADIGM 2: MULTI-MEDIA CARD (Top Header + Text First + Gallery Below)
  // ══════════════════════════════════════════════════════════════════════
  const renderMultiMediaGallery = () => {
    // 2 Images
    if (mediaList.length === 2) {
      const isPortraitPair = mediaList[0].orientation === 'portrait' && mediaList[1].orientation === 'portrait';
      return (
        <div className={`mt-5 rounded-[20px] overflow-hidden bg-white select-none w-full ${isPortraitPair ? 'aspect-[4/3] sm:aspect-[16/11]' : 'aspect-[16/10]'}`}>
          <div className="grid grid-cols-2 gap-1.5 bg-white h-full">
            {mediaList.map((m, idx) => (
              <div
                key={m.id || idx}
                onClick={() => setLightboxIndex(idx)}
                className="relative h-full overflow-hidden bg-gray-100 group/item cursor-pointer"
              >
                <img
                  src={m.url}
                  alt={m.alt || `Photo ${idx + 1}`}
                  className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-500 ease-out"
                />
              </div>
            ))}
          </div>
        </div>
      );
    }

    // 3 Images: "one portrait on left and two landscapes on right"
    if (mediaList.length === 3) {
      return (
        <div className="mt-5 rounded-[20px] overflow-hidden bg-white select-none aspect-[16/10] sm:aspect-[16/9] w-full">
          <div className="grid grid-cols-2 gap-1.5 bg-white h-full">
            {/* Left: 1 Tall Portrait */}
            <div
              onClick={() => setLightboxIndex(0)}
              className="relative h-full overflow-hidden bg-gray-100 group/left cursor-pointer"
            >
              <img
                src={mediaList[0].url}
                alt={mediaList[0].alt || 'Primary visual'}
                className="w-full h-full object-cover group-hover/left:scale-105 transition-transform duration-500 ease-out"
              />
            </div>
            {/* Right: 2 Stacked Landscapes */}
            <div className="grid grid-rows-2 gap-1.5 bg-white h-full">
              <div
                onClick={() => setLightboxIndex(1)}
                className="relative h-full overflow-hidden bg-gray-100 group/r1 cursor-pointer"
              >
                <img
                  src={mediaList[1].url}
                  alt={mediaList[1].alt || 'Detail photo 1'}
                  className="w-full h-full object-cover group-hover/r1:scale-105 transition-transform duration-500 ease-out"
                />
              </div>
              <div
                onClick={() => setLightboxIndex(2)}
                className="relative h-full overflow-hidden bg-gray-100 group/r2 cursor-pointer"
              >
                <img
                  src={mediaList[2].url}
                  alt={mediaList[2].alt || 'Detail photo 2'}
                  className="w-full h-full object-cover group-hover/r2:scale-105 transition-transform duration-500 ease-out"
                />
              </div>
            </div>
          </div>
        </div>
      );
    }

    // 4 Images: 1 portrait on left + 2 stacked on right with +1 badge
    if (mediaList.length === 4) {
      return (
        <div className="mt-5 rounded-[20px] overflow-hidden bg-white select-none aspect-[16/10] sm:aspect-[16/9] w-full">
          <div className="grid grid-cols-2 gap-1.5 bg-white h-full">
            {/* Left: 1 Tall Portrait */}
            <div
              onClick={() => setLightboxIndex(0)}
              className="relative h-full overflow-hidden bg-gray-100 group/left cursor-pointer"
            >
              <img
                src={mediaList[0].url}
                alt={mediaList[0].alt || 'Primary visual'}
                className="w-full h-full object-cover group-hover/left:scale-105 transition-transform duration-500 ease-out"
              />
            </div>
            {/* Right: 2 Stacked Tiles, bottom has +1 */}
            <div className="grid grid-rows-2 gap-1.5 bg-white h-full">
              <div
                onClick={() => setLightboxIndex(1)}
                className="relative h-full overflow-hidden bg-gray-100 group/r1 cursor-pointer"
              >
                <img
                  src={mediaList[1].url}
                  alt={mediaList[1].alt || 'Detail photo 1'}
                  className="w-full h-full object-cover group-hover/r1:scale-105 transition-transform duration-500 ease-out"
                />
              </div>
              <div
                onClick={() => setLightboxIndex(2)}
                className="relative h-full overflow-hidden bg-gray-100 group/r2 cursor-pointer"
              >
                <img
                  src={mediaList[2].url}
                  alt={mediaList[2].alt || 'Detail photo 2'}
                  className="w-full h-full object-cover group-hover/r2:scale-105 transition-transform duration-500 ease-out"
                />
                <div className="absolute inset-0 bg-black/60 backdrop-blur-2xs flex items-center justify-center text-white font-black text-sm">
                  +1
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // 5+ Images: 1 Hero on Left (spans 3 of 5) + 4 Grid on Right (spans 2 of 5)
    return (
      <div className="mt-5 rounded-[20px] overflow-hidden bg-white select-none aspect-[16/10] sm:aspect-[16/9] w-full">
        <div className="grid grid-cols-5 gap-1.5 bg-white h-full">
          <div
            onClick={() => setLightboxIndex(0)}
            className="col-span-3 relative h-full overflow-hidden bg-gray-100 group/hero cursor-pointer"
          >
            <img
              src={mediaList[0].url}
              alt={mediaList[0].alt || 'Primary visual'}
              className="w-full h-full object-cover group-hover/hero:scale-105 transition-transform duration-500 ease-out"
            />
          </div>
          <div className="col-span-2 grid grid-cols-2 grid-rows-2 gap-1.5 bg-white h-full">
            {mediaList.slice(1, 5).map((m, idx) => (
              <div
                key={m.id || idx}
                onClick={() => setLightboxIndex(idx + 1)}
                className="relative h-full overflow-hidden bg-gray-100 group/tile cursor-pointer"
              >
                <img
                  src={m.url}
                  alt={m.alt || `Photo ${idx + 2}`}
                  className="w-full h-full object-cover group-hover/tile:scale-105 transition-transform duration-500 ease-out"
                />
                {idx === 3 && mediaList.length > 5 && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-2xs flex items-center justify-center text-white font-black text-xs">
                    +{mediaList.length - 5}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderMultiMediaCard = () => (
    <article className="bg-white rounded-[28px] p-5 sm:p-7 shadow-card hover:shadow-card-hover relative transition-shadow duration-500">
      {/* 1. Header with Author Info & Follow */}
      {renderAuthorHeader()}

      {/* 2. Headline & Body (Above the images!) */}
      {renderHeadlineAndBody()}

      {/* 3. Image Section (Below the heading!) */}
      {renderMultiMediaGallery()}

      {/* 4. Action Bar */}
      {renderActionBar()}

      {/* 5. Minimalist Discussion & Suggestions Bar */}
      {renderDiscussionBar()}
    </article>
  );

  // ══════════════════════════════════════════════════════════════════════
  // PARADIGM 3: SINGLE LANDSCAPE CARD (Visual on Top with Profile Inside)
  // ══════════════════════════════════════════════════════════════════════
  const renderLandscapeCard = () => {
    const media = mediaList[0];
    const isVideo = media.type === 'video';
    const ytId = isVideo ? getYouTubeId(media.url) : null;
    const posterUrl = isVideo ? getVideoPosterUrl(media) : media.url;

    return (
      <article className="bg-white rounded-[28px] overflow-hidden p-0 pb-5 sm:pb-7 shadow-card hover:shadow-card-hover relative transition-shadow duration-500">
        {/* Landscape Media with Profile Overlay Inside at the Bottom */}
        <div className="relative rounded-t-[28px] overflow-hidden bg-gray-900 group/img select-none aspect-[16/10] sm:aspect-[16/9] w-full">
          {isVideo && isPlayingVideo ? (
            ytId ? (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1`}
                title={displayHeadline || 'Video player'}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                src={media.url}
                poster={posterUrl}
                className="w-full h-full object-cover"
                controls
                autoPlay
                playsInline
                loop
              />
            )
          ) : (
            <img
              src={posterUrl}
              alt={media.alt || displayHeadline}
              onClick={() => {
                if (isVideo) setIsPlayingVideo(true);
                else setLightboxIndex(0);
              }}
              className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-700 ease-out cursor-pointer"
            />
          )}

          {isVideo && !isPlayingVideo && (
            <div
              onClick={() => setIsPlayingVideo(true)}
              className="absolute inset-0 flex items-center justify-center cursor-pointer transition-colors bg-black/30 hover:bg-black/20 z-10"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/95 hover:bg-white text-gm-ink flex items-center justify-center shadow-2xl backdrop-blur-md transform transition-all active:scale-90 hover:scale-105">
                <Play className="w-6 h-6 sm:w-7 sm:h-7 fill-current translate-x-0.5 text-red-600" />
              </div>
            </div>
          )}

          {/* Top-Right Badges (Video source & duration) */}
          {isVideo && !isPlayingVideo && (
            <div className="absolute top-3.5 right-3.5 z-20 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/90 text-white text-[11px] font-bold shadow-md backdrop-blur-md">
                <Play className="w-3 h-3 fill-current" />
                <span>{ytId ? 'YouTube' : 'Video'} · {media.duration || 'Watch'}</span>
              </span>
            </div>
          )}

          {/* Dark gradient scrim at bottom */}
          <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

          {/* Profile Overlay Inside Landscape Image */}
          <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 flex items-center justify-between gap-3 z-10 pointer-events-auto">
            <Link
              href={`/profile/${author.username}`}
              className="flex items-center gap-2.5 sm:gap-3 min-w-0 group/author"
            >
              {author.avatarImage ? (
                <img
                  src={author.avatarImage}
                  alt={author.name}
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover ring-2 ring-white/90 shadow-md flex-shrink-0 group-hover/author:scale-105 transition-transform"
                />
              ) : (
                <div
                  className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-black text-xs sm:text-sm ${author.avatarColor || 'bg-amber-100 text-amber-800'} ring-2 ring-white/90 shadow-md flex-shrink-0 group-hover/author:scale-105 transition-transform`}
                >
                  {author.avatar || 'RV'}
                </div>
              )}
              <div className="min-w-0">
                <span className="font-extrabold text-sm sm:text-base text-white tracking-tight leading-tight block truncate drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)] group-hover/author:underline">
                  {author.name}
                </span>
                <p className="text-[11px] sm:text-xs text-white/90 font-medium leading-tight mt-0.5 truncate drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)]">
                  {author.stage || 'Building MVP'} · Combinate
                </p>
              </div>
            </Link>

            {!isOwnPost && (
              <button
                type="button"
                onClick={handleToggleFollow}
                className={`px-4 sm:px-5 py-1.5 sm:py-2 rounded-full font-black text-xs shadow-md transition-all active:scale-95 cursor-pointer flex-shrink-0 select-none flex items-center gap-1.5 backdrop-blur-md ${
                  isFollowed
                    ? 'bg-emerald-500/95 text-white border border-emerald-300/40'
                    : 'bg-white hover:bg-white/90 text-gm-ink'
                }`}
              >
                {isFollowed ? (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Following</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Follow</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Content Below Landscape Media */}
        <div className="px-5 sm:px-7">
          {renderHeadlineAndBody()}
          {renderActionBar()}
          {renderDiscussionBar()}
        </div>
      </article>
    );
  };

  // ══════════════════════════════════════════════════════════════════════
  // PARADIGM 4: TEXT-ONLY CARD (Clean Heading, Proper Padding & Ending)
  // ══════════════════════════════════════════════════════════════════════
  const renderTextOnlyCard = () => (
    <article className="bg-white rounded-[28px] p-5 sm:p-7 shadow-card hover:shadow-card-hover relative transition-shadow duration-500">
      {renderAuthorHeader()}
      {renderHeadlineAndBody()}
      {renderActionBar()}
      {renderDiscussionBar()}
    </article>
  );

  return (
    <>
      {/* ── Choose Card Layout Based on Content Type ─────────────────── */}
      {isSinglePortrait && (
        <>
          {/* Mobile view: Reel card format */}
          <div className="block md:hidden">
            {renderReelCard()}
          </div>
          {/* Desktop view: Clean standard card format (Reel format removed on desktop) */}
          <div className="hidden md:block">
            {renderStandardPortraitCard()}
          </div>
        </>
      )}
      {isMultiMedia && renderMultiMediaCard()}
      {isSingleLandscape && renderLandscapeCard()}
      {isTextOnly && renderTextOnlyCard()}

      {/* ── 3/4 BOTTOM SHEET MODAL (Available for all post types) ─────── */}
      {isDiscussionOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col justify-end"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop */}
          <div
            onClick={() => setIsDiscussionOpen(false)}
            className="fixed inset-0 bg-gm-ink/50 backdrop-blur-md transition-opacity animate-fade-in"
          />

          {/* 3/4 Height Sheet Container (75vh height) */}
          <div className="relative z-10 w-full max-w-2xl mx-auto h-[75vh] max-h-[80vh] bg-gm-paper rounded-t-[32px] shadow-modal flex flex-col overflow-hidden animate-slide-up">
            {/* Top Grab / Drag Handle */}
            <div
              className="pt-2.5 pb-1 flex justify-center flex-shrink-0 cursor-pointer"
              onClick={() => setIsDiscussionOpen(false)}
            >
              <div className="w-12 h-1.5 rounded-full bg-gray-300 hover:bg-gray-400 transition-colors" />
            </div>

            {/* Modal Header: Unified "Community Thread" + Close [X] Button */}
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
                className="w-10 h-10 rounded-full bg-gm-ink/[0.05] hover:bg-gm-ink hover:text-gm-paper text-gray-500 hover:text-gray-900 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4 stroke-[2.2]" />
              </button>
            </div>

            {/* Scrollable Modal Content: Jumps straight into commenting section */}
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

      {/* ── Interactive Lightbox Modal ───────────────────────────────── */}
      {lightboxIndex !== null && currentMedia && (
        <div
          onClick={() => setLightboxIndex(null)}
          className="fixed inset-0 z-50 bg-[#0E0D0C]/90 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute top-4 left-4 right-4 flex items-center justify-between text-white text-xs z-10"
          >
            <span className="font-bold bg-white text-gray-900 px-3.5 py-1 rounded-full text-xs shadow-md">
              {lightboxIndex + 1} of {mediaList.length}
            </span>
            <button
              onClick={() => setLightboxIndex(null)}
              className="p-2 bg-white text-gray-900 rounded-full hover:scale-105 transition-transform shadow-md cursor-pointer"
              title="Close (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {mediaList.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((lightboxIndex - 1 + mediaList.length) % mediaList.length);
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white text-gray-900 rounded-full hover:scale-110 transition-all z-10 shadow-md cursor-pointer"
              title="Previous"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-4xl max-h-[82vh] flex items-center justify-center overflow-hidden"
          >
            <img
              src={currentMedia.url}
              alt={currentMedia.alt || 'Full view'}
              className="max-w-full max-h-[82vh] object-contain rounded-[20px] shadow-2xl animate-slide-up"
            />
          </div>

          {mediaList.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((lightboxIndex + 1) % mediaList.length);
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white text-gray-900 rounded-full hover:scale-110 transition-all z-10 shadow-md cursor-pointer"
              title="Next"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      )}
    </>
  );
}
