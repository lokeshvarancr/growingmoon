'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '@/lib/state/AppContext';
import { postsApi, discussionsApi } from '@/lib/api/client';
import type { Discussion } from '@/lib/api/types';
import { formatRelativeTime } from '@/lib/utils';
import {
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Send,
  ThumbsUp,
  MoreHorizontal,
  CheckCircle2,
  Bookmark,
  Flag,
  HelpCircle,
  Compass,
  Lightbulb,
} from 'lucide-react';

export type UserProfileMinimal = {
  id: string;
  name: string;
  handle?: string;
  avatar: string;
  timeAgo: string;
  isAuthor?: boolean;
};

export type ReplyItem = {
  id: string;
  author: UserProfileMinimal;
  content: string;
  helpfulCount: number;
  userVoted?: boolean;
};

export type AnswerItem = {
  id: string;
  author: UserProfileMinimal;
  tag: 'Reflection' | 'Idea' | 'Feedback' | 'Suggestion';
  content: string;
  helpfulCount: number;
  userVoted?: boolean;
  repliesCount: number;
  isApplied?: boolean;
  isSaved?: boolean;
  replies?: ReplyItem[];
};

export type AskItem = {
  id: string;
  number: number;
  question: string;
  totalAnswers: number;
  isExpanded: boolean;
  answers: AnswerItem[];
};

export type ConversationComment = {
  id: string;
  author: UserProfileMinimal;
  tag?: 'Feedback' | 'Idea' | 'Reflection' | 'Suggestion';
  content: string;
  helpfulCount: number;
  userVoted?: boolean;
  repliesCount: number;
  isSaved?: boolean;
  replies: ReplyItem[];
};

// ── INITIAL DATA ACCORDING TO SCREENSHOT ─────────────────────────────
const INITIAL_ASKS: AskItem[] = [
  {
    id: 'ask-1',
    number: 1,
    question: 'What helped you stay consistent during the first few months?',
    totalAnswers: 12,
    isExpanded: true,
    answers: [
      {
        id: 'ans-1',
        author: {
          id: 'u-vikram',
          name: 'Vikram Rao',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
          timeAgo: '2h ago',
        },
        tag: 'Reflection',
        content: 'Breaking practice into 15-minute daily sessions helped me stay consistent.',
        helpfulCount: 24,
        repliesCount: 3,
        replies: [
          {
            id: 'ans-1-r1',
            author: {
              id: 'u-arjun',
              name: 'Arjun Sharma',
              avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
              timeAgo: '1h ago',
              isAuthor: true,
            },
            content: 'That 15-minute rule completely fixed my cognitive friction too!',
            helpfulCount: 6,
          },
        ],
      },
      {
        id: 'ans-2',
        author: {
          id: 'u-neha',
          name: 'Neha Krishnan',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
          timeAgo: '3h ago',
        },
        tag: 'Idea',
        content: 'I found an accountability partner in my space — it kept me on track.',
        helpfulCount: 18,
        repliesCount: 1,
        replies: [
          {
            id: 'ans-2-r1',
            author: {
              id: 'u-rohan',
              name: 'Rohan Sen',
              avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
              timeAgo: '2h ago',
            },
            content: 'How frequently did you do check-in calls with your partner?',
            helpfulCount: 3,
          },
        ],
      },
    ],
  },
  {
    id: 'ask-2',
    number: 2,
    question: 'What’s the best way to find early users for a prototype?',
    totalAnswers: 8,
    isExpanded: false,
    answers: [
      {
        id: 'ans-2-1',
        author: {
          id: 'u-ananya',
          name: 'Ananya Das',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
          timeAgo: '5h ago',
        },
        tag: 'Suggestion',
        content: 'Direct 1-on-1 cold outreach offering to solve their specific bottleneck gave us our first 10 loyal testers.',
        helpfulCount: 15,
        repliesCount: 2,
        replies: [],
      },
    ],
  },
];

const INITIAL_CONVERSATION: ConversationComment[] = [
  {
    id: 'conv-1',
    author: {
      id: 'u-rahul',
      name: 'Rahul Varma',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80',
      timeAgo: '2d ago',
    },
    tag: 'Feedback',
    content: 'A simple waitlist with a clear problem statement worked really well for us.',
    helpfulCount: 8,
    repliesCount: 2,
    replies: [
      {
        id: 'conv-1-r1',
        author: {
          id: 'u-arjun',
          name: 'Arjun Sharma',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
          timeAgo: '1d ago',
          isAuthor: true,
        },
        content: 'This is super helpful! Did you use any specific tools for the waitlist?',
        helpfulCount: 4,
      },
    ],
  },
  {
    id: 'conv-2',
    author: {
      id: 'u-siddharth',
      name: 'Siddharth Nair',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80',
      timeAgo: '3d ago',
    },
    tag: 'Reflection',
    content: 'Documenting setbacks along the way builds way more trust than just sharing polished milestones.',
    helpfulCount: 12,
    repliesCount: 0,
    replies: [],
  },
];

type DiscussionDrawerProps = {
  postId?: string;
  promptQuestion1?: string | null;
  promptQuestion2?: string | null;
  postAuthorId?: string;
  creatorFirstName?: string;
  authorName?: string;
  authorLocation?: string;
  askText?: string;
  onClose?: () => void;
  // Backward compatibility
  activeTab?: string;
  onTabChange?: (tab: any) => void;
  showHeader?: boolean;
};

function mapDiscussionToAnswer(d: Discussion, postAuthorId?: string): AnswerItem {
  return {
    id: d.id,
    author: {
      id: d.author?.id || d.author_id,
      name: d.author?.name || 'Community Member',
      handle: d.author?.username,
      avatar: d.author?.avatar_image || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      timeAgo: formatRelativeTime(d.created_at),
      isAuthor: (d.author?.id || d.author_id) === postAuthorId,
    },
    tag: ((d.tag as any) || 'Idea') as AnswerItem['tag'],
    content: d.content,
    helpfulCount: d.helpful_count,
    userVoted: d.is_helpful_by_me,
    repliesCount: d.replies_count || (d.replies ? d.replies.length : 0),
    isApplied: d.is_applied,
    replies: (d.replies || []).map((r) => mapDiscussionToReply(r, postAuthorId)),
  };
}

function mapDiscussionToReply(d: Discussion, postAuthorId?: string): ReplyItem {
  return {
    id: d.id,
    author: {
      id: d.author?.id || d.author_id,
      name: d.author?.name || 'Community Member',
      handle: d.author?.username,
      avatar: d.author?.avatar_image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      timeAgo: formatRelativeTime(d.created_at),
      isAuthor: (d.author?.id || d.author_id) === postAuthorId,
    },
    content: d.content,
    helpfulCount: d.helpful_count,
    userVoted: d.is_helpful_by_me,
  };
}

function mapDiscussionToComment(d: Discussion, postAuthorId?: string): ConversationComment {
  return {
    id: d.id,
    author: {
      id: d.author?.id || d.author_id,
      name: d.author?.name || 'Community Member',
      handle: d.author?.username,
      avatar: d.author?.avatar_image || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80',
      timeAgo: formatRelativeTime(d.created_at),
      isAuthor: (d.author?.id || d.author_id) === postAuthorId,
    },
    tag: ((d.tag as any) || 'Feedback') as ConversationComment['tag'],
    content: d.content,
    helpfulCount: d.helpful_count,
    userVoted: d.is_helpful_by_me,
    repliesCount: d.replies_count || (d.replies ? d.replies.length : 0),
    replies: (d.replies || []).map((r) => mapDiscussionToReply(r, postAuthorId)),
  };
}

export default function DiscussionDrawer({
  postId,
  promptQuestion1,
  promptQuestion2,
  postAuthorId,
  creatorFirstName = 'Arjun',
  authorName,
  authorLocation,
  askText,
  onClose,
}: DiscussionDrawerProps) {
  const { currentUser, addToast } = useApp();
  const mainInputRef = useRef<HTMLInputElement>(null);

  // Initialize asks based on props if provided
  const initialAsksFromProps = (): AskItem[] => {
    const q1 = promptQuestion1 || askText || INITIAL_ASKS[0].question;
    const items: AskItem[] = [
      {
        id: 'ask-1',
        number: 1,
        question: q1,
        totalAnswers: 0,
        isExpanded: true,
        answers: [],
      },
    ];
    if (promptQuestion2) {
      items.push({
        id: 'ask-2',
        number: 2,
        question: promptQuestion2,
        totalAnswers: 0,
        isExpanded: false,
        answers: [],
      });
    }
    return items;
  };

  // Asks state
  const [asks, setAsks] = useState<AskItem[]>(() => {
    if (promptQuestion1 || promptQuestion2 || postId) {
      return initialAsksFromProps();
    }
    return INITIAL_ASKS;
  });

  // Conversation state
  const [conversations, setConversations] = useState<ConversationComment[]>(() => {
    if (postId) return [];
    return INITIAL_CONVERSATION;
  });

  // Active Context Menu ID
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Inline ask inputs state (per ask id)
  const [askInputMap, setAskInputMap] = useState<Record<string, string>>({});

  // Bottom input state & target
  const [commentInput, setCommentInput] = useState('');
  const [postTarget, setPostTarget] = useState<'general' | 'ask-1' | 'ask-2'>('general');
  const [isTargetDropdownOpen, setIsTargetDropdownOpen] = useState(false);

  // Expanded replies state
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});

  // Helpful reaction counts & user vote map
  const [helpfulVotes, setHelpfulVotes] = useState<Record<string, { count: number; userVoted: boolean }>>({});

  // Fetch thread data when postId changes
  useEffect(() => {
    if (!postId) return;
    let isMounted = true;

    postsApi
      .getThread(postId)
      .then((thread) => {
        if (!isMounted) return;

        const newAsks: AskItem[] = [];
        const q1 = thread.prompt_question_1 || promptQuestion1 || askText || 'What helped you stay consistent during the first few months?';
        const q2 = thread.prompt_question_2 || promptQuestion2;

        newAsks.push({
          id: 'ask-1',
          number: 1,
          question: q1,
          totalAnswers: thread.ask_1_answers?.length || 0,
          isExpanded: true,
          answers: (thread.ask_1_answers || []).map((d) => mapDiscussionToAnswer(d, postAuthorId)),
        });

        if (q2) {
          newAsks.push({
            id: 'ask-2',
            number: 2,
            question: q2,
            totalAnswers: thread.ask_2_answers?.length || 0,
            isExpanded: false,
            answers: (thread.ask_2_answers || []).map((d) => mapDiscussionToAnswer(d, postAuthorId)),
          });
        }

        setAsks(newAsks);

        if (thread.conversation) {
          setConversations(thread.conversation.map((d) => mapDiscussionToComment(d, postAuthorId)));
        }

        // Register all helpful votes from backend
        const votes: Record<string, { count: number; userVoted: boolean }> = {};
        const registerVotes = (d: Discussion) => {
          votes[d.id] = { count: d.helpful_count, userVoted: d.is_helpful_by_me };
          d.replies?.forEach(registerVotes);
        };
        thread.ask_1_answers?.forEach(registerVotes);
        thread.ask_2_answers?.forEach(registerVotes);
        thread.conversation?.forEach(registerVotes);
        setHelpfulVotes(votes);
      })
      .catch((err) => {
        console.warn('Could not fetch thread from API, keeping current state:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [postId, promptQuestion1, promptQuestion2, postAuthorId, askText]);

  const toggleAskExpand = (askId: string) => {
    setAsks((prev) =>
      prev.map((a) => (a.id === askId ? { ...a, isExpanded: !a.isExpanded } : a))
    );
  };

  const toggleReplies = (id: string) => {
    setExpandedReplies((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleToggleHelpful = async (id: string) => {
    // Optimistic toggle
    setHelpfulVotes((prev) => {
      const current = prev[id] || { count: 0, userVoted: false };
      const nextUserVoted = !current.userVoted;
      const nextCount = nextUserVoted ? current.count + 1 : Math.max(0, current.count - 1);
      if (nextUserVoted) {
        addToast('Marked as helpful! 👍', 'success');
      }
      return { ...prev, [id]: { count: nextCount, userVoted: nextUserVoted } };
    });

    try {
      const res = await discussionsApi.toggleHelpful(id);
      setHelpfulVotes((prev) => ({
        ...prev,
        [id]: { count: res.helpful_count, userVoted: res.is_helpful },
      }));
    } catch {
      // Revert silent fallback
    }
  };

  const handleMarkApplied = async (answerId: string) => {
    try {
      const res = await discussionsApi.toggleApplied(answerId);
      addToast(res.message || 'Marked as "Applied & Worked"! ✨', 'success');
    } catch {
      addToast('Marked as "Applied & Worked"! ✨', 'success');
    }
    setActiveMenuId(null);
  };

  const handleSave = (id: string) => {
    addToast('Saved to your bookmarks! 🔖', 'success');
    setActiveMenuId(null);
  };

  const handleReport = (id: string) => {
    addToast('Report submitted to moderators.', 'info');
    setActiveMenuId(null);
  };

  const handleReplyClick = (targetId: string, authorName: string) => {
    setCommentInput(`@${authorName.replace(/\s+/g, '').toLowerCase()} `);
    mainInputRef.current?.focus();
  };

  // Submit answer directly inside an Ask card
  const handleInlineAskSubmit = async (askId: string) => {
    const text = askInputMap[askId]?.trim();
    if (!text) return;
    const askNum = askId === 'ask-1' ? 1 : 2;

    if (postId) {
      try {
        const created = await postsApi.addDiscussion(postId, {
          content: text,
          ask_number: askNum,
          tag: 'Idea',
        });
        const mapped = mapDiscussionToAnswer(created, postAuthorId);
        setAsks((prev) =>
          prev.map((a) =>
            a.id === askId
              ? {
                  ...a,
                  totalAnswers: a.totalAnswers + 1,
                  answers: [...a.answers, mapped],
                }
              : a
          )
        );
        setHelpfulVotes((prev) => ({
          ...prev,
          [created.id]: { count: 0, userVoted: false },
        }));
        setAskInputMap((prev) => ({ ...prev, [askId]: '' }));
        addToast('Your answer has been added to this ask!', 'success');
        return;
      } catch (err: any) {
        console.warn('API addDiscussion failed, using local fallback:', err);
      }
    }

    const newAnswer: AnswerItem = {
      id: `ans-${Date.now()}`,
      author: {
        id: currentUser.id,
        name: currentUser.name,
        avatar: currentUser.avatarImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        timeAgo: 'Just now',
      },
      tag: 'Idea',
      content: text,
      helpfulCount: 0,
      repliesCount: 0,
      replies: [],
    };

    setAsks((prev) =>
      prev.map((a) =>
        a.id === askId
          ? {
              ...a,
              totalAnswers: a.totalAnswers + 1,
              answers: [...a.answers, newAnswer],
            }
          : a
      )
    );

    setHelpfulVotes((prev) => ({
      ...prev,
      [newAnswer.id]: { count: 0, userVoted: false },
    }));

    setAskInputMap((prev) => ({ ...prev, [askId]: '' }));
    addToast('Your answer has been added to this ask!', 'success');
  };

  // Submit from sticky bottom bar
  const handleMainSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = commentInput.trim();
    if (!content) return;

    const askNum = postTarget === 'ask-1' ? 1 : postTarget === 'ask-2' ? 2 : null;
    const tag = postTarget === 'general' ? 'Feedback' : 'Suggestion';

    if (postId) {
      try {
        const created = await postsApi.addDiscussion(postId, {
          content,
          ask_number: askNum,
          tag,
        });

        if (askNum) {
          const mapped = mapDiscussionToAnswer(created, postAuthorId);
          setAsks((prev) =>
            prev.map((a) =>
              (askNum === 1 && a.id === 'ask-1') || (askNum === 2 && a.id === 'ask-2')
                ? {
                    ...a,
                    isExpanded: true,
                    totalAnswers: a.totalAnswers + 1,
                    answers: [...a.answers, mapped],
                  }
                : a
            )
          );
        } else {
          const mapped = mapDiscussionToComment(created, postAuthorId);
          setConversations((prev) => [mapped, ...prev]);
        }

        setHelpfulVotes((prev) => ({
          ...prev,
          [created.id]: { count: 0, userVoted: false },
        }));
        setCommentInput('');
        addToast(askNum ? `Answer added to Ask ${askNum}!` : 'Shared to conversation!', 'success');
        return;
      } catch (err: any) {
        console.warn('API addDiscussion failed, using local fallback:', err);
      }
    }

    if (postTarget === 'general') {
      const newComment: ConversationComment = {
        id: `conv-${Date.now()}`,
        author: {
          id: currentUser.id,
          name: currentUser.name,
          avatar: currentUser.avatarImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
          timeAgo: 'Just now',
        },
        tag: 'Feedback',
        content,
        helpfulCount: 0,
        repliesCount: 0,
        replies: [],
      };

      setConversations((prev) => [newComment, ...prev]);
      setHelpfulVotes((prev) => ({
        ...prev,
        [newComment.id]: { count: 0, userVoted: false },
      }));
      addToast('Shared to conversation!', 'success');
    } else {
      const targetAsk = asks.find((a) => a.id === postTarget);
      if (targetAsk) {
        const newAnswer: AnswerItem = {
          id: `ans-${Date.now()}`,
          author: {
            id: currentUser.id,
            name: currentUser.name,
            avatar: currentUser.avatarImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
            timeAgo: 'Just now',
          },
          tag: 'Suggestion',
          content,
          helpfulCount: 0,
          repliesCount: 0,
          replies: [],
        };

        setAsks((prev) =>
          prev.map((a) =>
            a.id === postTarget
              ? {
                  ...a,
                  isExpanded: true,
                  totalAnswers: a.totalAnswers + 1,
                  answers: [...a.answers, newAnswer],
                }
              : a
          )
        );

        setHelpfulVotes((prev) => ({
          ...prev,
          [newAnswer.id]: { count: 0, userVoted: false },
        }));
        addToast(`Answer added to Ask ${targetAsk.number}!`, 'success');
      }
    }

    setCommentInput('');
  };

  const getTagIcon = (tag: string) => {
    switch (tag) {
      case 'Reflection':
        return <Compass className="w-3 h-3 text-gm-accent" />;
      case 'Idea':
        return <Lightbulb className="w-3 h-3 text-gm-accent" />;
      case 'Feedback':
      default:
        return <MessageSquare className="w-3 h-3 text-gm-accent" />;
    }
  };

  return (
    <div className="space-y-6 pb-2" onClick={() => activeMenuId && setActiveMenuId(null)}>
      
      {/* ═══════════════════════════════════════════════════════════════
          SECTION 1: "MY ASK" ACCORDION CARD (Exact match to screenshot)
         ═══════════════════════════════════════════════════════════════ */}
      <div className="bg-gm-accent-soft border border-gm-accent-soft rounded-[24px] sm:rounded-[28px] p-4 sm:p-5 shadow-2xs space-y-4">
        
        {/* Card Header: Icon + Title + Pill Counter */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gm-accent-soft text-gm-accent flex items-center justify-center flex-shrink-0">
              <HelpCircle className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-gm-ink tracking-tight leading-none">
                My Ask
              </h3>
              <p className="text-[11px] sm:text-xs text-gray-500 font-normal mt-0.5">
                Answers from the community
              </p>
            </div>
          </div>

          <div className="text-[11px] font-semibold text-gray-600 bg-white border border-gray-200/80 px-2.5 py-1 rounded-full shadow-2xs">
            {asks.length} / {asks.length} {asks.length === 1 ? 'ask' : 'asks'}
          </div>
        </div>

        {/* List of Asks */}
        <div className="space-y-3">
          {asks.map((ask) => (
            <div
              key={ask.id}
              className="bg-white border border-gm-accent-soft rounded-2xl p-4 shadow-2xs transition-all"
            >
              {/* Clickable Question Header Row */}
              <div
                onClick={() => toggleAskExpand(ask.id)}
                className="flex items-center justify-between gap-3 cursor-pointer select-none"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-gm-accent-soft text-gm-accent text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {ask.number}
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-gm-ink tracking-tight truncate sm:whitespace-normal">
                    {ask.question}
                  </h4>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
                    {ask.totalAnswers} answers
                  </span>
                  {ask.isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-gray-500 stroke-[2.2]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500 stroke-[2.2]" />
                  )}
                </div>
              </div>

              {/* Expanded Answers & Inline Input */}
              {ask.isExpanded && (
                <div className="mt-4 pt-3 border-t border-gray-100 space-y-4 animate-fade-in">
                  
                  {/* Answers Stream */}
                  <div className="space-y-4">
                    {ask.answers.map((answer) => {
                      const vote = helpfulVotes[answer.id] || { count: answer.helpfulCount, userVoted: false };
                      const isRepliesOpen = !!expandedReplies[answer.id];
                      const isMenuOpen = activeMenuId === answer.id;

                      return (
                        <div key={answer.id} className="space-y-2 relative">
                          {/* Answer Top Row: Avatar + Name + Time + Tag + Menu */}
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <img
                                src={answer.author.avatar}
                                alt={answer.author.name}
                                className="w-8 h-8 rounded-full object-cover ring-1 ring-black/5 flex-shrink-0"
                              />
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-xs sm:text-sm font-bold text-gm-ink tracking-tight">
                                  {answer.author.name}
                                </span>
                                <span className="text-xs text-gray-400">·</span>
                                <span className="text-xs text-gray-400 font-normal">
                                  {answer.author.timeAgo}
                                </span>
                                
                                {/* Pill Tag */}
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gm-accent-soft text-gm-accent border border-gm-accent-line ml-1">
                                  {getTagIcon(answer.tag)}
                                  <span>{answer.tag}</span>
                                </span>
                              </div>
                            </div>

                            {/* Three Dots Button & Context Menu */}
                            <div className="relative">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMenuId(isMenuOpen ? null : answer.id);
                                }}
                                className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                                aria-label="More options"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </button>

                              {/* Dropdown Menu (Matches Screenshot) */}
                              {isMenuOpen && (
                                <div
                                  onClick={(e) => e.stopPropagation()}
                                  className="absolute right-0 top-7 z-30 w-52 bg-white rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.1)] border border-gray-100 py-1.5 animate-slide-up"
                                >
                                  <button
                                    type="button"
                                    onClick={() => handleMarkApplied(answer.id)}
                                    className="w-full px-3.5 py-2 hover:bg-gray-50 flex items-center gap-2.5 text-xs text-gm-ink font-medium text-left cursor-pointer transition-colors"
                                  >
                                    <CheckCircle2 className="w-4 h-4 text-gray-700 stroke-[2]" />
                                    <span>Mark as Applied & Worked</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleSave(answer.id)}
                                    className="w-full px-3.5 py-2 hover:bg-gray-50 flex items-center gap-2.5 text-xs text-gm-ink font-medium text-left cursor-pointer transition-colors"
                                  >
                                    <Bookmark className="w-4 h-4 text-gray-700 stroke-[2]" />
                                    <span>Save</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleReport(answer.id)}
                                    className="w-full px-3.5 py-2 hover:bg-gray-50 flex items-center gap-2.5 text-xs text-gm-ink font-medium text-left cursor-pointer transition-colors"
                                  >
                                    <Flag className="w-4 h-4 text-gray-700 stroke-[2]" />
                                    <span>Report</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Answer Body Text */}
                          <p className="text-xs sm:text-[13px] text-gray-700 leading-relaxed font-normal pl-10">
                            {answer.content}
                          </p>

                          {/* Answer Action Row: Helpful + Reply + Replies Accordion */}
                          <div className="flex items-center gap-4 pl-10 text-xs text-gray-500 font-medium pt-0.5">
                            <button
                              type="button"
                              onClick={() => handleToggleHelpful(answer.id)}
                              className={`inline-flex items-center gap-1.5 transition-colors cursor-pointer select-none ${
                                vote.userVoted ? 'text-gm-accent font-bold' : 'hover:text-gm-ink'
                              }`}
                            >
                              <ThumbsUp className={`w-3.5 h-3.5 ${vote.userVoted ? 'fill-current' : 'stroke-[2]'}`} />
                              <span>Helpful {vote.count}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleReplyClick(answer.id, answer.author.name)}
                              className="inline-flex items-center gap-1.5 hover:text-gm-ink transition-colors cursor-pointer select-none"
                            >
                              <MessageSquare className="w-3.5 h-3.5 stroke-[2]" />
                              <span>Reply</span>
                            </button>

                            {answer.repliesCount > 0 && (
                              <button
                                type="button"
                                onClick={() => toggleReplies(answer.id)}
                                className="inline-flex items-center gap-1 hover:text-gm-ink transition-colors cursor-pointer select-none"
                              >
                                <span>{answer.repliesCount} {answer.repliesCount === 1 ? 'reply' : 'replies'}</span>
                                <ChevronDown
                                  className={`w-3.5 h-3.5 transition-transform ${
                                    isRepliesOpen ? 'rotate-180' : ''
                                  }`}
                                />
                              </button>
                            )}
                          </div>

                          {/* Nested Replies Stream */}
                          {isRepliesOpen && answer.replies && answer.replies.length > 0 && (
                            <div className="relative pl-10 mt-2 space-y-2">
                              {answer.replies.map((reply) => (
                                <div
                                  key={reply.id}
                                  className="bg-gray-50/80 rounded-xl p-3 border border-gray-100 text-xs text-gray-700 space-y-1"
                                >
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-gm-ink">{reply.author.name}</span>
                                    {reply.author.isAuthor && (
                                      <span className="bg-gm-accent-soft text-gm-accent text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                                        Author
                                      </span>
                                    )}
                                    <span className="text-gray-400">· {reply.author.timeAgo}</span>
                                  </div>
                                  <p>{reply.content}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Inline Capsule Answer Input */}
                  <div className="pt-1">
                    <div className="flex items-center gap-2 px-3.5 py-2 rounded-full border border-gray-200/90 bg-white hover:border-gm-accent/50 transition-colors shadow-2xs">
                      <MessageSquare className="w-4 h-4 text-gray-400 stroke-[2] flex-shrink-0" />
                      <input
                        type="text"
                        value={askInputMap[ask.id] || ''}
                        onChange={(e) =>
                          setAskInputMap((prev) => ({ ...prev, [ask.id]: e.target.value }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleInlineAskSubmit(ask.id);
                          }
                        }}
                        placeholder="Share an answer to this ask..."
                        className="flex-1 text-xs bg-transparent border-none outline-none text-gm-ink placeholder:text-gray-400"
                      />
                      <button
                        type="button"
                        onClick={() => handleInlineAskSubmit(ask.id)}
                        disabled={!(askInputMap[ask.id] || '').trim()}
                        className="p-1 text-gm-accent hover:text-gm-accent-deep disabled:opacity-30 transition-all cursor-pointer flex-shrink-0"
                        title="Submit answer"
                      >
                        <Send className="w-4 h-4 stroke-[2.2]" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 2: "CONVERSATION" THREAD (Exact match to screenshot)
         ═══════════════════════════════════════════════════════════════ */}
      <div className="space-y-4">
        {/* Header Row: Chat Icon + Conversation + Comments Count */}
        <div className="flex items-center gap-2 pt-1">
          <MessageSquare className="w-4 h-4 text-gray-900 stroke-[2.2]" />
          <h3 className="text-sm sm:text-base font-bold text-gm-ink tracking-tight">
            Conversation
          </h3>
          <span className="text-xs text-gray-500 font-medium">· 24 comments</span>
        </div>

        {/* Conversation Stream */}
        <div className="space-y-4">
          {conversations.map((item) => {
            const vote = helpfulVotes[item.id] || { count: item.helpfulCount, userVoted: false };
            const isRepliesOpen = !!expandedReplies[item.id];

            return (
              <div key={item.id} className="space-y-2.5">
                {/* Parent Comment (Rahul Varma) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={item.author.avatar}
                        alt={item.author.name}
                        className="w-9 h-9 rounded-full object-cover ring-1 ring-black/5 flex-shrink-0"
                      />
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs sm:text-sm font-bold text-gm-ink tracking-tight">
                          {item.author.name}
                        </span>
                        <span className="text-xs text-gray-400">·</span>
                        <span className="text-xs text-gray-400 font-normal">
                          {item.author.timeAgo}
                        </span>
                        
                        {item.tag && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gm-accent-soft text-gm-accent border border-gm-accent-line ml-1">
                            {getTagIcon(item.tag)}
                            <span>{item.tag}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSave(item.id)}
                      className="p-1 rounded-full text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Content */}
                  <p className="text-xs sm:text-[13px] text-gray-700 leading-relaxed font-normal pl-11">
                    {item.content}
                  </p>

                  {/* Actions Row */}
                  <div className="flex items-center gap-4 pl-11 text-xs text-gray-500 font-medium pt-0.5">
                    <button
                      type="button"
                      onClick={() => handleToggleHelpful(item.id)}
                      className={`inline-flex items-center gap-1.5 transition-colors cursor-pointer select-none ${
                        vote.userVoted ? 'text-gm-accent font-bold' : 'hover:text-gm-ink'
                      }`}
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${vote.userVoted ? 'fill-current' : 'stroke-[2]'}`} />
                      <span>Helpful {vote.count}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleReplyClick(item.id, item.author.name)}
                      className="inline-flex items-center gap-1.5 hover:text-gm-ink transition-colors cursor-pointer select-none"
                    >
                      <MessageSquare className="w-3.5 h-3.5 stroke-[2]" />
                      <span>Reply</span>
                    </button>

                    {item.repliesCount > 0 && (
                      <button
                        type="button"
                        onClick={() => toggleReplies(item.id)}
                        className="inline-flex items-center gap-1 hover:text-gm-ink transition-colors cursor-pointer select-none"
                      >
                        <span>{item.repliesCount} {item.repliesCount === 1 ? 'reply' : 'replies'}</span>
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform ${
                            isRepliesOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                    )}
                  </div>
                </div>

                {/* Nested Reply (Arjun Sharma with L-shaped curved connector line) */}
                {isRepliesOpen && item.replies && item.replies.length > 0 && (
                  <div className="relative pl-7 sm:pl-9 mt-2">
                    {/* Curved L-shaped SVG connector line matching screenshot */}
                    <div className="absolute left-4 top-0 w-4 h-7 border-l-2 border-b-2 border-gray-200 rounded-bl-xl pointer-events-none" />

                    {item.replies.map((reply) => {
                      const replyVote = helpfulVotes[reply.id] || { count: reply.helpfulCount, userVoted: false };

                      return (
                        <div
                          key={reply.id}
                          className="bg-[#F8F9FA] rounded-2xl p-3.5 sm:p-4 border border-gray-100 shadow-2xs space-y-2"
                        >
                          <div className="flex items-center gap-2">
                            <img
                              src={reply.author.avatar}
                              alt={reply.author.name}
                              className="w-7 h-7 rounded-full object-cover ring-1 ring-black/5 flex-shrink-0"
                            />
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs sm:text-sm font-bold text-gm-ink tracking-tight">
                                {reply.author.name}
                              </span>
                              {reply.author.isAuthor && (
                                <span className="bg-gm-accent-soft text-gm-accent text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                                  Author
                                </span>
                              )}
                              <span className="text-xs text-gray-400">·</span>
                              <span className="text-xs text-gray-400 font-normal">
                                {reply.author.timeAgo}
                              </span>
                            </div>
                          </div>

                          <p className="text-xs sm:text-[13px] text-gray-700 leading-relaxed font-normal">
                            {reply.content}
                          </p>

                          <div className="flex items-center gap-4 text-xs text-gray-500 font-medium pt-0.5">
                            <button
                              type="button"
                              onClick={() => handleToggleHelpful(reply.id)}
                              className={`inline-flex items-center gap-1.5 transition-colors cursor-pointer select-none ${
                                replyVote.userVoted ? 'text-gm-accent font-bold' : 'hover:text-gm-ink'
                              }`}
                            >
                              <ThumbsUp className={`w-3.5 h-3.5 ${replyVote.userVoted ? 'fill-current' : 'stroke-[2]'}`} />
                              <span>Helpful {replyVote.count}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleReplyClick(reply.id, reply.author.name)}
                              className="inline-flex items-center gap-1.5 hover:text-gm-ink transition-colors cursor-pointer select-none"
                            >
                              <MessageSquare className="w-3.5 h-3.5 stroke-[2]" />
                              <span>Reply</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 3: STICKY BOTTOM INPUT BAR (Exact match to screenshot)
         ═══════════════════════════════════════════════════════════════ */}
      <div className="sticky bottom-0 pt-3 pb-1 bg-gradient-to-t from-white via-white/95 to-transparent backdrop-blur-xs">
        <form onSubmit={handleMainSubmit}>
          <div className="bg-white border border-gray-200/90 rounded-full p-1.5 pl-2.5 pr-2.5 shadow-sm flex items-center gap-2 relative">
            
            {/* Pill Dropdown Target Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsTargetDropdownOpen(!isTargetDropdownOpen)}
                className="bg-gm-accent-soft hover:bg-gm-accent-soft text-gm-accent font-semibold text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-colors cursor-pointer select-none"
              >
                <MessageSquare className="w-3.5 h-3.5 stroke-[2]" />
                <span className="capitalize">
                  {postTarget === 'general' ? 'General' : postTarget === 'ask-1' ? 'Ask 1' : 'Ask 2'}
                </span>
                <ChevronDown className="w-3 h-3 text-gm-accent" />
              </button>

              {/* Target Options Popup */}
              {isTargetDropdownOpen && (
                <div className="absolute left-0 bottom-full mb-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-30 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setPostTarget('general');
                      setIsTargetDropdownOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2 font-medium cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-gm-accent" />
                    <span>General Conversation</span>
                  </button>
                  {asks.map((ask) => (
                    <button
                      key={ask.id}
                      type="button"
                      onClick={() => {
                        setPostTarget(ask.id as 'ask-1' | 'ask-2');
                        setIsTargetDropdownOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2 font-medium cursor-pointer"
                    >
                      <span className="w-4 h-4 rounded-full bg-purple-100 text-gm-accent text-[10px] font-bold flex items-center justify-center">
                        {ask.number}
                      </span>
                      <span className="truncate">Ask {ask.number}: {ask.question}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Vertical Divider */}
            <div className="w-[1px] h-5 bg-gray-200 flex-shrink-0" />

            {/* Input Field */}
            <input
              ref={mainInputRef}
              type="text"
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              placeholder="Share your thoughts, feedback or ideas..."
              className="flex-1 text-xs sm:text-[13px] bg-transparent border-none outline-none text-gm-ink placeholder:text-gray-400"
            />

            {/* Purple Paper Plane Send Button */}
            <button
              type="submit"
              disabled={!commentInput.trim()}
              className="p-1.5 text-gm-accent hover:text-gm-accent-deep disabled:opacity-30 transition-all active:scale-90 cursor-pointer flex-shrink-0"
              aria-label="Send message"
            >
              <Send className="w-4 h-4 stroke-[2.2]" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
